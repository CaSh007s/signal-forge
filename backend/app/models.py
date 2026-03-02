from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db import Base 
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    reports = relationship("Report", back_populates="owner")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, index=True)
    report_content = Column(Text)
    chart_data = Column(JSON, nullable=True)
    sentiment_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Foreign Key to link report to a user
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="reports")