from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models, schemas
from app.api.auth import get_current_user

router = APIRouter()

# 1. CREATE REPORT
@router.post("/", response_model=schemas.ReportResponse)
def create_report(
    report: schemas.ReportCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Link the report to the currently logged-in user
    db_report = models.Report(**report.dict(), owner_id=current_user.id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

# 2. GET ALL REPORTS (For Dashboard)
@router.get("/", response_model=List[schemas.ReportResponse])
def read_reports(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Filter: Only show reports belonging to the current user
    return db.query(models.Report).filter(models.Report.owner_id == current_user.id).offset(skip).limit(limit).all()

# 3. GET SINGLE REPORT (For Report View)
@router.get("/{report_id}", response_model=schemas.ReportResponse)
def read_report(
    report_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Security: Ensure user owns this report
    if report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
        
    return report