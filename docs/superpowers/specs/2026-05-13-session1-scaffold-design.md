# PaceLab Session 1 — Monorepo Scaffold Design

**Date:** 2026-05-13
**Scope:** Monorepo structure + FastAPI hello-world + Next.js 15 dark theme + Docker Compose
**Status:** Approved

---

## Context

PaceLab is an F1 race strategy intelligence platform. This session establishes the foundation
every subsequent session builds on. Nothing functional beyond hello-worlds — the goal is
a clean, running scaffold deployed to Vercel with Oracle hosting the API.

## Environment

- Python 3.13.2, uv 0.7.18
- Node 22.19.0, npm 10.9.3 (pnpm to be installed)
- Docker Desktop (confirmed installed)
- Git 2.51.0, configured as Abdul Rafey <abdulrafeyy23@gmail.com>
- Vercel CLI globally installed
- Oracle Cloud Always Free ARM VM — live, ap-hyderabad-1 region
- Local storage constraint: ~800MB max — data pipeline runs on Oracle, not laptop

## Repo Structure

```
pacelab/
├── apps/
│   ├── web/                  ← Next.js 15 App Router
│   └── api/                  ← FastAPI 0.115+
├── packages/
│   └── ml/                   ← Training scaffold only (empty V1)
├── data/
│   ├── raw/                  ← gitignored
│   └── processed/            ← gitignored
├── docs/
│   └── superpowers/specs/
├── .gitignore
├── README.md
└── docker-compose.yml
```

## FastAPI (`apps/api`)

- Python 3.13, managed by uv
- Single endpoint: `GET /health`
- Response shape: `{"data": {"status": "ok", "version": "0.1.0"}, "error": null, "status": "success"}`
- Pydantic v2 response models
- Multi-stage Dockerfile, non-root user
- Port: 8000

## Next.js (`apps/web`)

- Next.js 15 App Router, TypeScript, Tailwind CSS 4, shadcn/ui
- pnpm as package manager
- Dark theme from day one: `#0D0D0F` background, JetBrains Mono font
- Homepage: PaceLab wordmark + tagline + animated placeholder circuit area
- `NEXT_PUBLIC_API_URL` env var wired to FastAPI
- Port: 3000

## Docker Compose

- `api` service: builds from `apps/api/Dockerfile`, port 8000, hot reload via volume
- `web` service: builds from `apps/web/Dockerfile`, port 3000, hot reload via volume

## Data Strategy

- Full FastF1 dataset lives on Oracle Cloud VM (50GB free storage)
- Local dev uses 1 test race only (~80MB) via `FASTF1_CACHE_DIR` env var
- `data/` directory gitignored entirely

## Success Criteria

1. `docker compose up` → both services healthy
2. `curl localhost:8000/health` → `{"data":{"status":"ok",...}}`
3. `localhost:3000` → PaceLab dark homepage renders
4. Next.js deployed and live on Vercel
5. Git repo pushed to GitHub
