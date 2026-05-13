# Stage 1: dependency builder
FROM python:3.13-slim AS builder
WORKDIR /app
RUN pip install uv
COPY pyproject.toml .
RUN uv sync --frozen --no-dev

# Stage 2: runtime (non-root)
FROM python:3.13-slim AS runtime
RUN groupadd -r pacelab && useradd -r -g pacelab pacelab
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv
COPY pacelab_api/ pacelab_api/
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
USER pacelab
EXPOSE 8000
CMD ["uvicorn", "pacelab_api.main:app", "--host", "0.0.0.0", "--port", "8000"]
