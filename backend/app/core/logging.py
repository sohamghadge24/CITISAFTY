import logging
import sys
import structlog
from pythonjsonlogger import jsonlogger
from .config import settings

def setup_logging():
    logging_level = logging.INFO
    if settings.DEBUG:
        logging_level = logging.DEBUG

    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.JSONRenderer() if not settings.DEBUG else structlog.dev.ConsoleRenderer()
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging_level),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Standard library logging setup
    handler = logging.StreamHandler(sys.stdout)
    if not settings.DEBUG:
        formatter = jsonlogger.JsonFormatter(
            fmt="%(asctime)s %(levelname)s %(name)s %(message)s"
        )
        handler.setFormatter(formatter)
    
    logging.basicConfig(
        format="%(message)s",
        level=logging_level,
        handlers=[handler]
    )

logger = structlog.get_logger()
