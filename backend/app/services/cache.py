import redis
import os
import json
from typing import Optional, Any

# Initialize Redis Connection
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

try:
    r = redis.from_url(REDIS_URL, decode_responses=True)
    # Fast ping to check connection
    r.ping()
    print("✅ Redis Connected")
except redis.ConnectionError:
    print("⚠️ Warning: Redis not connected. Caching disabled.")
    r = None

class CacheService:
    @staticmethod
    def get(key: str) -> Optional[Any]:
        if not r: return None
        data = r.get(key)
        if data:
            return json.loads(data)
        return None

    @staticmethod
    def set(key: str, value: Any, expire_seconds: int = 3600):
        if not r: return
        r.setex(key, expire_seconds, json.dumps(value))

    @staticmethod
    def delete(key: str):
        if not r: return
        r.delete(key)

    @staticmethod
    def get_daily_usage(user_id: int) -> int:
        if not r: return 0
        from datetime import datetime
        today = datetime.utcnow().strftime('%Y-%m-%d')
        key = f"rate_limit:{user_id}:{today}"
        val = r.get(key)
        return int(val) if val else 0

    @staticmethod
    def increment_daily_usage(user_id: int):
        if not r: return
        from datetime import datetime
        today = datetime.utcnow().strftime('%Y-%m-%d')
        key = f"rate_limit:{user_id}:{today}"
        r.incr(key)
        r.expire(key, 86400 * 2) # Auto-delete after 2 days to save space