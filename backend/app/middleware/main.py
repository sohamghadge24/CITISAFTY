import time
import uuid
import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from ..core.logging import logger

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)
        
        start_time = time.time()
        
        # Log request
        logger.info(
            "Incoming request",
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else None
        )
        
        response: Response = await call_next(request)
        
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-Request-ID"] = request_id
        
        # Log response
        logger.info(
            "Request processed",
            status_code=response.status_code,
            duration=f"{process_time:.4f}s"
        )
        
        return response

from fastapi.responses import JSONResponse
from ..schemas.common import ErrorResponse

async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception", error=str(exc), path=request.url.path)
    return JSONResponse(
        status_code=500,
        content=ErrorResponse(
            message="An internal server error occurred.",
            details=str(exc) if not request.app.debug else None
        ).dict()
    )
