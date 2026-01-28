import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Load Environment
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(f"❌ DATABASE_URL is missing! Checked: {env_path}")

# 2. Smart Connection Arguments
connect_args = {}
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # SQLite specific argument to allow multi-threaded access
    connect_args = {"check_same_thread": False}

# 3. Create Engine (Works for BOTH SQLite and Supabase now)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args=connect_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()