from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app import models, schemas
from app import auth_utils 

router = APIRouter()

# 1. CREATE REPORT
@router.post("/", response_model=schemas.ReportResponse)
def create_report(
    report: schemas.ReportCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user) 
):
    db_report = models.Report(**report.dict(), owner_id=current_user.id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

# 2. GET ALL REPORTS
@router.get("/", response_model=List[schemas.ReportResponse])
def read_reports(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    return db.query(models.Report).filter(models.Report.owner_id == current_user.id).order_by(models.Report.created_at.desc()).offset(skip).limit(limit).all()

# 3. GET SINGLE REPORT
@router.get("/{report_id}", response_model=schemas.ReportResponse)
def read_report(
    report_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    if report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this report")
        
    return report

# 4. DELETE REPORT
@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user)
):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    if report.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this report")
        
    db.delete(report)
    db.commit()
    return