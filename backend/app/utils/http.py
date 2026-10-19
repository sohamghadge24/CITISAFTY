import httpx
import asyncio
from typing import Any, Dict, Optional, Callable
from ..core.logging import logger

async def fetch_with_retry(
    url: str, 
    method: str = "GET", 
    data: Optional[Dict] = None, 
    max_retries: int = 3, 
    backoff_factor: float = 1.0,
    **kwargs
) -> Optional[httpx.Response]:
    """
    HTTP client with async retry logic and exponential backoff.
    """
    async with httpx.AsyncClient(timeout=10.0) as client:
        for attempt in range(max_retries):
            try:
                response = await client.request(method, url, json=data, **kwargs)
                response.raise_for_status()
                return response
            except (httpx.HTTPStatusError, httpx.RequestError) as e:
                wait_time = backoff_factor * (2 ** attempt)
                logger.warning(
                    "External API request failed",
                    url=url,
                    attempt=attempt + 1,
                    error=str(e),
                    retry_in=f"{wait_time}s"
                )
                if attempt == max_retries - 1:
                    logger.error("Max retries reached for external API", url=url)
                    raise
                await asyncio.sleep(wait_time)
    return None
