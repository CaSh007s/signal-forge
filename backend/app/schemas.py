from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Report Schemas
class ReportBase(BaseModel):
    company_name: str
    report_content: str

class ReportCreate(ReportBase):
    pass

class Report(ReportBase):
    id: int
    created_at: datetime
    user_id: int

    class Config:
        from_attributes = True

# Update User to include reports
class UserWithReports(User):
    reports: List[Report] = []