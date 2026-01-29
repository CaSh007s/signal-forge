from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
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
    chart_data: dict | None = None

@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_company(request: QueryRequest):
    try:
        # 1. Run the Agent
        initial_state = {"messages": [("user", request.query)]}
        result = await agent_app.ainvoke(initial_state)
        
        # Extract the final response from the agent
        final_message = result["messages"][-1].content
        
        # 2. Fetch Market Data (The "Visual" part)
        chart_data = get_stock_history(request.query)

        return {
            "company_name": request.query.upper(),
            "report_content": final_message,
            "chart_data": chart_data
        }

    except Exception as e:
        print(f"Error in analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))