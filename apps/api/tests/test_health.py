import pytest
from httpx import AsyncClient, ASGITransport


@pytest.mark.asyncio
async def test_health_returns_success_status() -> None:
    from pacelab_api.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "success"
    assert body["error"] is None


@pytest.mark.asyncio
async def test_health_data_contains_ok() -> None:
    from pacelab_api.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    body = response.json()
    assert body["data"]["status"] == "ok"
    assert body["data"]["version"] == "0.1.0"
