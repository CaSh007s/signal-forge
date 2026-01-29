import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis import asyncio as aioredis
from fastapi_limiter import FastAPILimiter
from app import models
from app.db import engine
from app.api import endpoints, auth, reports

# Load Env Vars
load_dotenv()

# Lifespan event to handle startup and shutdown tasks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create DB Tables
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database Tables Verified")

    # 2. Connect to Redis (Using Env Var)
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    try:
        redis = aioredis.from_url(redis_url, encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis)
        print(f"✅ Redis Rate Limiter Initialized at {redis_url}")
    except Exception as e:
        print(f"⚠️ Redis Connection Failed: {e}")
    
    yield
    
    # Close Redis on shutdown if it was initialized
    try:
        await redis.close()
    except UnboundLocalError:
        pass # Redis wasn't initialized

app = FastAPI(title="SignalForge API", version="0.1.0", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routes
# Note: Prefixes are important for frontend matching
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(endpoints.router, prefix="/api", tags=["agent"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SignalForge Agent"}

@app.get("/")
def read_root():
    return {"status": "SignalForge Backend Running"}