import logging
import sys
from ...core.logging import logger as core_logger

# Wrapper to maintain the requested architecture while using the existing logging core
logger = core_logger

def get_logger(name: str):
    return logging.getLogger(name)
