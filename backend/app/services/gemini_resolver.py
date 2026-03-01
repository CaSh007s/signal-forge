import os
from fastapi import HTTPException
from app.services.supabase_client import get_user_gemini_key
from app.services.encryption import decrypt_key
from app.models import User

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL")
SERVER_GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def resolve_gemini_key(user: User) -> str | None:
    # 1. Admin Bypass
    if ADMIN_EMAIL and user.email == ADMIN_EMAIL:
        if SERVER_GOOGLE_API_KEY:
            return SERVER_GOOGLE_API_KEY
    
    # 2. Extract Supabase UID (dynamically attached in auth_utils)
    if not hasattr(user, "supabase_uid") or not user.supabase_uid:
        return None
    
    # 3. Fetch from Supabase
    encrypted_key = get_user_gemini_key(user.supabase_uid)
    if not encrypted_key:
        return None
        
    try:
        raw_key = decrypt_key(encrypted_key)
        return raw_key
    except Exception as e:
        print(f"Error decrypting key: {e}")
        return None
