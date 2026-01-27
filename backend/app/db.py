import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# 1. Force-load the .env file from the backend root directory
BASE_DIR = Path(__file__).resolve().parent.parent
env_path = BASE_DIR / ".env"
load_dotenv(dotenv_path=env_path)

# 2. Get the URL
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

if not SQLALCHEMY_DATABASE_URL:
    raise ValueError(f"❌ DATABASE_URL is missing! I looked for it here: {env_path}")

# 3. Create Engine (Supabase/Postgres)
engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()