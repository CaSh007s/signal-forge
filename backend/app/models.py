from sqlalchemy import Column, Integer, String, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Relationship: One User - Many Reports
    reports = relationship("Report", back_populates="owner")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    report_content = Column(Text) # The Markdown output
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Foreign Key: Links to User.id
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: Many Reports - One User
    owner = relationship("User", back_populates="reports")