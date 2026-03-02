import os
import jwt
from jwt import PyJWKClient
from passlib.context import CryptContext
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db import get_db
from app import models

load_dotenv()

# --- CONFIG ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
if not SUPABASE_URL and os.getenv("DATABASE_URL"):
    try:
        db_url = os.getenv("DATABASE_URL", "")
        if "@db." in db_url and ".supabase.co" in db_url:
            project_id = db_url.split("@db.")[1].split(".supabase.co")[0]
            SUPABASE_URL = f"https://{project_id}.supabase.co"
            print(f"✅ Auto-detected Supabase URL: {SUPABASE_URL}")
    except Exception:
        print("⚠️ Could not auto-detect Supabase URL from connection string.")

# Fallback for legacy HS256
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = "HS256"

# Security Schemes
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token", auto_error=False)
http_bearer = HTTPBearer(auto_error=False)

# --- PASSWORD UTILS ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- AUTH LOGIC ---
def get_current_user(
    token_oauth: str = Depends(oauth2_scheme),
    token_bearer: HTTPAuthorizationCredentials = Depends(http_bearer),
    db: Session = Depends(get_db)
):
    # 1. Resolve Token
    token = token_oauth if token_oauth else (token_bearer.credentials if token_bearer else None)
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        # 2. PEEK AT HEADER
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get("alg")

        # STRATEGY A: Modern Supabase (RS256/ES256) - Use JWKs
        if alg in ["RS256", "ES256"]:
            if not SUPABASE_URL:
                print("❌ Error: SUPABASE_URL is missing. Cannot verify RS256 token.")
                raise credentials_exception
            
            # Auto-fetch the public keys from Supabase
            jwks_url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
            jwk_client = PyJWKClient(jwks_url)
            signing_key = jwk_client.get_signing_key_from_jwt(token)
            
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=[alg],
                audience="authenticated",
                options={"verify_exp": True}
            )

        # STRATEGY B: Legacy/Local (HS256) -> Use Shared Secret
        elif alg == "HS256":
            if not SECRET_KEY:
                print("❌ Error: SECRET_KEY is missing. Cannot verify HS256 token.")
                raise credentials_exception
                
            payload = jwt.decode(
                token, 
                SECRET_KEY, 
                algorithms=["HS256"], 
                audience="authenticated",
                options={"verify_exp": True}
            )
            
        else:
            print(f"❌ Unknown Algorithm: {alg}")
            raise credentials_exception

        # 3. EXTRACT USER INFO
        email = payload.get("email")
        if not email:
            raise credentials_exception

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.PyJWTError as e: # Catch-all for PyJWT errors
        print(f"JWT Verification Failed: {str(e)}")
        raise credentials_exception
    except Exception as e:
        print(f"Auth Unexpected Error: {str(e)}")
        raise credentials_exception

    # 4. SYNC TO DATABASE
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        print(f"🆕 Syncing Supabase User to Local DB: {email}")
        new_user = models.User(
            email=email, 
            hashed_password="oauth_managed"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user
    
    # Dynamically attach Supabase UID (sub) and global currency to the object for downstream use
    user.supabase_uid = payload.get("sub")
    
    # Extract global_currency from user_metadata (or default to USD)
    user_metadata = payload.get("user_metadata", {})
    user.global_currency = user_metadata.get("global_currency", "USD")
    
    return user