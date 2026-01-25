from pydantic import BaseModel, EmailStr

# 1. Base User Schema (Shared properties)
class UserBase(BaseModel):
    email: EmailStr

# 2. Schema for Creating a User (Incoming Data)
class UserCreate(UserBase):
    password: str

# 3. Schema for Reading a User (Outgoing Data)
class User(UserBase):
    id: int
    class Config:
        from_attributes = True

# 4. Schema for the Token (What we send back on login)
class Token(BaseModel):
    access_token: str
    token_type: str