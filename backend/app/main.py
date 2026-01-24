from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis import asyncio as aioredis
from fastapi_limiter import FastAPILimiter
from app.api import endpoints

# LIFESPAN: Handles Startup and Shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Connect to Redis
    redis = aioredis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis)
    print("✅ Redis Rate Limiter Initialized")
    
    yield  # The app runs here
    
    # 2. Cleanup on shutdown
    await redis.close()

app = FastAPI(title="SignalForge API", version="0.1.0", lifespan=lifespan)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routes
app.include_router(endpoints.router, prefix="/api", tags=["agent"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SignalForge Agent"}