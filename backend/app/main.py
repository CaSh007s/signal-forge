from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from redis import asyncio as aioredis
from fastapi_limiter import FastAPILimiter

# NEW IMPORTS
from app import models
from app.db import engine
from app.api import endpoints, auth

# LIFESPAN
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Create DB Tables
    models.Base.metadata.create_all(bind=engine)
    print("✅ Database Tables Created")

    # 2. Connect to Redis
    try:
        redis = aioredis.from_url("redis://localhost:6379", encoding="utf-8", decode_responses=True)
        await FastAPILimiter.init(redis)
        print("✅ Redis Rate Limiter Initialized")
    except Exception as e:
        print(f"⚠️ Redis Connection Failed: {e}")
    
    yield
    
    await redis.close()

app = FastAPI(title="SignalForge API", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect Routes
app.include_router(endpoints.router, prefix="/api", tags=["agent"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "SignalForge Agent"}