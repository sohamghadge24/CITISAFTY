import os
from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "SafeCity Intelligence"
    API_V1_STR: str = "/api/v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = ENVIRONMENT == "development"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./traffic_local.db")
    
    # ML Models
    ML_MODEL_PATH: Optional[str] = os.getenv("ML_MODEL_PATH")
    DEVICE: str = "cuda" if os.getenv("USE_CUDA") == "true" else "cpu"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-it-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Traffic API
    TRAFFIC_UPDATE_INTERVAL: int = 30  # seconds
    CACHE_EXPIRATION: int = 300  # 5 minutes
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
