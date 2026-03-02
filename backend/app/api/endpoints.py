from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from app.agent.graph import app as agent_app
from app.services.finance import get_stock_history
from app.services.cache import CacheService
from app import schemas, models
from app.db import get_db
from app.auth_utils import get_current_user
from app.services.gemini_resolver import resolve_gemini_key
from langchain_google_genai import ChatGoogleGenerativeAI

router = APIRouter()

# --- Request Models ---
class QueryRequest(BaseModel):
    query: str
    force_regenerate: bool = False

class AnalysisResponse(BaseModel):
    id: Optional[int] = None
    company_name: str
    report_content: str
    chart_data: Optional[Dict[str, Any]] = None
    sentiment_score: Optional[int] = None

# --- Helpers ---
def parse_agent_response(content: Any) -> str:
    if isinstance(content, str): return content
    if isinstance(content, list):
        text_parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text_parts.append(block.get("text", ""))
            elif hasattr(block, "text"):
                text_parts.append(block.text)
        return "\n".join(text_parts)
    return str(content)

def resolve_ticker(query: str, api_key: str) -> str:
    """Uses Gemini to identify the exact stock ticker or return INVALID for gibberish."""
    try:
        # We use a fast, deterministic model for quick parsing
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", api_key=api_key, temperature=0.0)
        prompt = f"The user entered: '{query}'. Reply with ONLY the official, currently active stock ticker symbol (e.g., AAPL). For Indian stocks, append .NS or .BO (e.g., RELIANCE.NS, TATAMOTORS.NS). Be aware of recent corporate name changes (e.g., if they ask for Zomato, return ETERNAL.NS). If the company is not publicly traded, delisted, or the query is gibberish/irrelevant, reply with ONLY the exact word 'INVALID'. Do not include any other text."
        res = llm.invoke(prompt)
        return res.content.strip().upper()
    except Exception as e:
        print(f"Ticker resolution failed: {e}")
        return "INVALID"

# --- Endpoints ---

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_company(
    request: QueryRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        # 1. Resolve User API Key First
        api_key = resolve_gemini_key(current_user)
        if not api_key:
            raise HTTPException(status_code=428, detail="Bring Your Own Key (BYOK) required.")

        # 2. Extract Official Ticker via LLM
        query_key = resolve_ticker(request.query, api_key)
        
        if query_key == "INVALID":
            raise HTTPException(status_code=400, detail="Could not identify a publicly traded company from that query.")
            
        cache_key = f"report:{query_key}"

        # 3. CHECK CACHE (Fast Path)
        if not request.force_regenerate:
            cached_data = CacheService.get(cache_key)
            if cached_data:
                print(f"⚡ CACHE HIT: {query_key}")
                return cached_data
        else:
            print(f"🔄 FORCING REGENERATION: {query_key}")

        print(f"🐢 CACHE MISS: {query_key} -> Running Agent...")

        # 4. RUN AGENT (Slow Path)
        initial_state = {"messages": [("user", f"Analyze this company/ticker: {query_key}")], "api_key": api_key}
        result = await agent_app.ainvoke(initial_state)
        raw_content = result["messages"][-1].content
        report_text_raw = parse_agent_response(raw_content)
        
        import json
        try:
            cleaned = report_text_raw.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:-3].strip()
            elif cleaned.startswith("```"):
                cleaned = cleaned[3:-3].strip()
            parsed = json.loads(cleaned)
            sentiment_score = parsed.get("score", 50)
            report_text = parsed.get("markdown", report_text_raw)
        except Exception as json_e:
            print(f"Failed to parse JSON sentiment: {json_e}")
            sentiment_score = 50
            report_text = report_text_raw
        
        # 5. FETCH VISUALS
        try:
            chart_data = get_stock_history(query_key)
        except Exception:
            chart_data = None

        # 6. SAVE TO DATABASE (Persistent Memory)
        db_report = db.query(models.Report).filter(
            models.Report.company_name == query_key,
            models.Report.owner_id == current_user.id
        ).first()

        if db_report:
            db_report.report_content = report_text
            db_report.chart_data = chart_data
            db_report.sentiment_score = sentiment_score
        else:
            db_report = models.Report(
                company_name=query_key,
                report_content=report_text,
                chart_data=chart_data,
                sentiment_score=sentiment_score,
                owner_id=current_user.id
            )
            db.add(db_report)
            
        db.commit()
        db.refresh(db_report)

        # 7. CONSTRUCT RESPONSE
        response_data = {
            "id": db_report.id,
            "company_name": query_key,
            "report_content": report_text,
            "chart_data": chart_data,
            "sentiment_score": sentiment_score
        }

        # 8. SAVE TO CACHE (12 Hour TTL)
        CacheService.set(cache_key, response_data, expire_seconds=43200)

        return response_data

    except HTTPException as http_exc:
        # Re-raise the HTTP exception specifically so the 428 bypasses the generic catch
        raise http_exc
    except Exception as e:
        error_str = str(e).lower()
        print(f"Error in analysis: {error_str}")
        
        # Check for invalid key, quota exhaustion, or other generative AI auth errors
        if any(keyword in error_str for keyword in [
            "api key not valid", "api_key_invalid", "quota", "429", "exhausted", "403", "401"
        ]):
            # The saved key was invalid or exhausted. Delete it so the user is prompted again.
            from app.services.supabase_client import delete_user_gemini_key
            if hasattr(current_user, "supabase_uid") and current_user.supabase_uid:
                delete_user_gemini_key(current_user.supabase_uid)
            raise HTTPException(status_code=428, detail="Key invalid or exhausted. Please provide a new API key.")
            
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reports", response_model=List[schemas.ReportResponse])
def get_user_reports(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch all reports generated by the logged-in user."""
    return db.query(models.Report).filter(models.Report.owner_id == current_user.id).order_by(models.Report.created_at.desc()).all()

@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Delete a specific report."""
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.owner_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Clean up the Redis Cache so it forces a fresh regeneration next time
    CacheService.delete(f"report:{report.company_name}")
    
    db.delete(report)
    db.commit()
    return {"status": "deleted", "id": report_id}

@router.get("/reports/{report_id}", response_model=schemas.ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Fetch a single report by ID."""
    report = db.query(models.Report).filter(
        models.Report.id == report_id, 
        models.Report.owner_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return report