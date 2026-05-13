from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard response envelope for all PaceLab API endpoints."""

    data: T | None
    error: str | None
    status: str
