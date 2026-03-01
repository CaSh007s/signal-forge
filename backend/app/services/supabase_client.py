import os
from supabase import create_client, Client
from typing import Optional

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_supabase: Client = None

def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for BYOK.")
        _supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase

def get_user_gemini_key(user_id: str) -> Optional[str]:
    """Fetches the encrypted gemini key for the given Supabase user_id."""
    supabase = get_supabase()
    # Note: user_id must be the uuid from auth.users (often tied to email or returned via JWT)
    # Using the Admin API to fetch the user
    try:
        response = supabase.auth.admin.get_user_by_id(user_id)
        user = response.user
        if not user or not user.user_metadata:
            return None
        return user.user_metadata.get("encrypted_gemini_key")
    except Exception as e:
        print(f"Error fetching user metadata from Supabase: {e}")
        return None

def set_user_gemini_key(user_id: str, encrypted_key: str) -> bool:
    """Sets the encrypted gemini key in the user's raw_user_meta_data."""
    supabase = get_supabase()
    try:
        supabase.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": {"encrypted_gemini_key": encrypted_key}}
        )
        return True
    except Exception as e:
        print(f"Error updating user metadata in Supabase: {e}")
        raise ValueError(f"Supabase Admin API Error: {str(e)}")

def delete_user_gemini_key(user_id: str) -> bool:
    """Removes the encrypted gemini key from the user's raw_user_meta_data."""
    supabase = get_supabase()
    try:
        supabase.auth.admin.update_user_by_id(
            user_id,
            {"user_metadata": {"encrypted_gemini_key": None}}
        )
        return True
    except Exception as e:
        print(f"Error clearing user metadata in Supabase: {e}")
        return False
