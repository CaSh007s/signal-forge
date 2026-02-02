from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Any, List, Dict, Optional
from app.agent.graph import app as agent_app
from app.services.finance import get_stock_history
from app import schemas

router = APIRouter()

class QueryRequest(BaseModel):
    query: str

# We define a new response model that includes chart data
class AnalysisResponse(BaseModel):
    company_name: str
    report_content: str
    chart_data: Optional[Dict[str, Any]] = None

# Helper to Extract Text from AI Response
def parse_agent_response(content: Any) -> str:
    """
    Safely extracts text string from LangChain message content,
    which can be a string or a list of blocks.
    """
    if isinstance(content, str):
        return content
    
    if isinstance(content, list):
        # Join all text blocks
        text_parts = []
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text_parts.append(block.get("text", ""))
            elif hasattr(block, "text"): # fallback for object attributes
                text_parts.append(block.text)
        return "\n".join(text_parts)
    
    return str(content)

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_company(request: QueryRequest):
    try:
        # 1. Run the Agent
        initial_state = {"messages": [("user", request.query)]}
        result = await agent_app.ainvoke(initial_state)
        
        # Extract the final response from the agent
        raw_content = result["messages"][-1].content
        
        # Parse the content safely (handles lists and strings)
        report_text = parse_agent_response(raw_content)
        
        # 2. Fetch Market Data (The "Visual" part)
        try:
            chart_data = get_stock_history(request.query)
        except Exception as e:
            print(f"Warning: Could not fetch stock history: {e}")
            chart_data = None

        return {
            "company_name": request.query.upper(),
            "report_content": report_text,
            "chart_data": chart_data
        }

    except Exception as e:
        print(f"Error in analysis: {e}")
        # Print the raw content to debug if parsing fails
        if 'raw_content' in locals():
            print(f"Raw content was: {raw_content}")
        raise HTTPException(status_code=500, detail=str(e))