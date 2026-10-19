from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .api import map as map_api
from .api import routing as routing_api
from .api import ml as ml_api
from .api import model_testing as model_testing_api
from .api import report_management as report_api
from .api import websockets as ws_api
from .core.database import Base, engine
from .core.config import settings
from .core.logging import setup_logging, logger
from .middleware.main import RequestLoggingMiddleware, global_exception_handler
from .core.limiter import limiter
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

import torch
# Optimization: Limit CPU threads for ML models to prevent overheating
torch.set_num_threads(1)

# Initialize Logging
setup_logging()

# Initialize Database
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error("Database initialization failed", error=str(e))

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Optimized Smart City Backend for Traffic Safety & Intelligence",
    version="2.0.0",
    debug=settings.DEBUG
)

# Global Error Handler
app.add_exception_handler(Exception, global_exception_handler)
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.state.limiter = limiter

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(RequestLoggingMiddleware)

# Routes
app.include_router(map_api.router, prefix=settings.API_V1_STR)
app.include_router(routing_api.router, prefix="/api/v1")
app.include_router(ml_api.router, prefix="/api/v1")
app.include_router(model_testing_api.router, prefix="/api/v1")
app.include_router(report_api.router, prefix="/api/v1")
app.include_router(ws_api.router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {
        "status": "active",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "ml_engine": "online",
        "version": "2.0.0"
    }

@app.get("/")
def root():
    return {"message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for documentation."}

@app.on_event("startup")
async def startup_event():
    logger.info("Application starting up...", env=settings.ENVIRONMENT)

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutting down...")
