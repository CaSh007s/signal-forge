from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

# --- User Schemas ---
class UserCreate(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- Report Schemas ---
class ReportBase(BaseModel):
    company_name: str
    report_content: str
    chart_data: Optional[Dict[str, Any]] = None 

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    created_at: datetime
    owner_id: int 
    
    class Config:
        from_attributes = True