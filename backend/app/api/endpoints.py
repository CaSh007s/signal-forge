import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from fastapi_limiter.depends import RateLimiter
from app.agent.graph import app_graph

router = APIRouter()

class ReportRequest(BaseModel):
    company: str
    ticker: str = None

async def event_generator(company: str, ticker: str = None):
    """
    Generator that yields SSE events.
    """
    inputs = {"company": company, "ticker": ticker or company}
    
    try:
        async for output in app_graph.astream(inputs):
            for key, value in output.items():
                if "messages" in value:
                    for msg in value["messages"]:
                        yield f"data: {json.dumps({'type': 'log', 'content': msg})}\n\n"
                
                if "report" in value:
                    yield f"data: {json.dumps({'type': 'result', 'content': value['report']})}\n\n"
                    
    except Exception as e:
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"

@router.post("/generate", dependencies=[Depends(RateLimiter(times=3, seconds=60))])
async def generate_report(request: ReportRequest):
    return StreamingResponse(
        event_generator(request.company, request.ticker),
        media_type="text/event-stream"
    )