from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import models, schemas, db, auth_utils
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Helper: Get current user from token
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(db.get_db)):
    # Verify token
    try:
        payload = auth_utils.jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except auth_utils.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# 1. Save a new report
@router.post("/", response_model=schemas.Report)
def create_report(
    report: schemas.ReportCreate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(db.get_db)
):
    new_report = models.Report(
        company_name=report.company_name,
        report_content=report.report_content,
        user_id=current_user.id
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)
    return new_report

# 2. Get all reports for the logged-in user
@router.get("/", response_model=List[schemas.Report])
def get_reports(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(db.get_db)
):
    return db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(models.Report.created_at.desc()).all()

# 3. Get a specific report by ID
@router.get("/{report_id}", response_model=schemas.Report)
def get_report(
    report_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(db.get_db)
):
    report = db.query(models.Report).filter(
        models.Report.id == report_id, 
        models.Report.user_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
        
    return report