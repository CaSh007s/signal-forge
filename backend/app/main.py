from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints

app = FastAPI(title="SignalForge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect the endpoints
app.include_router(endpoints.router, prefix="/api", tags=["agent"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SignalForge Agent"}