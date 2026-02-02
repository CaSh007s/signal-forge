from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from app.agent.graph import app as agent_app
from app.services.finance import get_stock_history
from app.services.cache import CacheService
from app import schemas

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

class AnalysisResponse(BaseModel):
    company_name: str
    report_content: str
    chart_data: Optional[Dict[str, Any]] = None

def parse_agent_response(content: Any) -> str:
    """Extracts text from LangChain response."""
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

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_company(request: QueryRequest):
    try:
        query_key = request.query.strip().upper()
        cache_key = f"report:{query_key}"

        # 1. CHECK CACHE
        cached_data = CacheService.get(cache_key)
        if cached_data:
            print(f"⚡ CACHE HIT: {query_key}")
            return cached_data

        print(f"🐢 CACHE MISS: {query_key} -> Running Agent...")

        # 2. Run Agent
        initial_state = {"messages": [("user", request.query)]}
        result = await agent_app.ainvoke(initial_state)
        raw_content = result["messages"][-1].content
        report_text = parse_agent_response(raw_content)
        
        # 3. Fetch Market Data
        try:
            chart_data = get_stock_history(request.query)
        except Exception:
            chart_data = None

        # 4. Construct Response
        response_data = {
            "company_name": request.query.upper(),
            "report_content": report_text,
            "chart_data": chart_data
        }

        # 5. SAVE TO CACHE
        CacheService.set(cache_key, response_data, expire_seconds=43200)

        return response_data

    except Exception as e:
        print(f"Error in analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))