import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.agent.graph import app_graph

router = APIRouter()

class ReportRequest(BaseModel):
    company: str
    ticker: str = None

async def event_generator(company: str, ticker: str = None):
    """
    Generator that yields SSE events:
    - log: Intermediate steps (Searching, Analyzing...)
    - result: The final Markdown report
    """
    inputs = {"company": company, "ticker": ticker or company}
    
    try:
        async for output in app_graph.astream(inputs):
            for key, value in output.items():
                
                # Stream Logs
                if "messages" in value:
                    for msg in value["messages"]:
                        yield f"data: {json.dumps({'type': 'log', 'content': msg})}\n\n"
                
                if "report" in value:
                    yield f"data: {json.dumps({'type': 'result', 'content': value['report']})}\n\n"
                    
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@router.post("/generate")
async def generate_report(request: ReportRequest):
    return StreamingResponse(
        event_generator(request.company, request.ticker),
        media_type="text/event-stream"
    )