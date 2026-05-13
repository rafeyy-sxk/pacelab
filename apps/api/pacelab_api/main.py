from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pacelab_api.schemas.base import APIResponse

app = FastAPI(
    title="PaceLab API",
    description="F1 Race Strategy Intelligence",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://pacelab.vercel.app",
        "https://*.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthData(BaseModel):
    status: str
    version: str


@app.get("/health", response_model=APIResponse[HealthData])
async def health() -> APIResponse[HealthData]:
    return APIResponse(
        data=HealthData(status="ok", version="0.1.0"),
        error=None,
        status="success",
    )
