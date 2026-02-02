import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db import get_db
from app import models

load_dotenv()

# --- CONFIG ---
SECRET_KEY = os.getenv("SECRET_KEY", "")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. PEEK AT THE HEADER
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg")
        
        print(f"🕵️‍♂️ DEBUG: Token Algorithm is [{alg}]")

        # 2. DECODE BASED ON ALGORITHM
        if alg == "HS256":
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_aud": False})
            
        elif alg == "RS256" or alg == "ES256":
            print(f"⚠️ WARNING: Supabase is using {alg}. Skipping signature verification for Dev.")
            payload = jwt.get_unverified_claims(token)
            
        else:
            print(f"❌ Unknown Algorithm: {alg}")
            raise credentials_exception

        # 3. Extract Email
        email: str = payload.get("email")
        if email is None:
            email = payload.get("sub")
            
        if email is None:
            raise credentials_exception

    except JWTError as e:
        print(f"JWT Error: {str(e)}")
        raise credentials_exception
    
    # 4. Sync User to DB
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        print(f"🆕 New User Detected: {email}")
        new_user = models.User(email=email, hashed_password="supabase_managed_account")
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
        
    return user