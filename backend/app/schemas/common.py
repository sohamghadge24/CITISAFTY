from pydantic import BaseModel
from typing import Generic, TypeVar, Optional, List, Any

T = TypeVar("T")

class ResponseBase(BaseModel, Generic[T]):
    status: str = "success"
    message: Optional[str] = None
    data: Optional[T] = None

class ErrorResponse(BaseModel):
    status: str = "error"
    message: str
    code: Optional[str] = None
    details: Optional[Any] = None

class PaginatedResponse(ResponseBase[List[T]]):
    total: int
    page: int
    size: int
