from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app.auth_utils import get_current_user
from app.models import User
from app.services.supabase_client import set_user_gemini_key, delete_user_gemini_key
from app.services.encryption import encrypt_key
from app.services.gemini_resolver import resolve_gemini_key

router = APIRouter()

class KeyRequest(BaseModel):
    api_key: str

@router.get("/gemini-key/status")
def get_key_status(current_user: User = Depends(get_current_user)):
    # Re-use the JIT resolver to see if a key is available
    key = resolve_gemini_key(current_user)
    return {"hasKey": key is not None}

@router.post("/gemini-key")
def set_key(request: KeyRequest, current_user: User = Depends(get_current_user)):
    if not hasattr(current_user, "supabase_uid") or not current_user.supabase_uid:
        raise HTTPException(status_code=400, detail="Cannot save key for non-Supabase user.")
        
    try:
        encrypted_key = encrypt_key(request.api_key)
        success = set_user_gemini_key(current_user.supabase_uid, encrypted_key)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to save key to Supabase.")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/gemini-key")
def delete_key(current_user: User = Depends(get_current_user)):
    if not hasattr(current_user, "supabase_uid") or not current_user.supabase_uid:
        return {"status": "ignored"}
        
    success = delete_user_gemini_key(current_user.supabase_uid)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete key from Supabase.")
    return {"status": "deleted"}

@router.delete("/purge")
def purge_user_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Delete Gemini Key
    if hasattr(current_user, "supabase_uid") and current_user.supabase_uid:
        delete_user_gemini_key(current_user.supabase_uid)
        
    # 2. Delete all models.Report for this user
    from app.models import Report
    db.query(Report).filter(Report.owner_id == current_user.id).delete()
    db.commit()
    
    return {"status": "purged"}
