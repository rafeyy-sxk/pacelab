# PaceLab Session 1 — Monorepo Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Working monorepo with FastAPI `/health` endpoint and Next.js 15 dark homepage, both running locally via Docker Compose, Next.js deployed to Vercel.

**Architecture:** Plain folder monorepo at `E:\PROJECTS\RESUME PROJECTS\PaceLab`. FastAPI runs on port 8000, Next.js on port 3000. No shared packages in V1 — each app is fully self-contained. Data lives on Oracle, never locally.

**Tech Stack:** Python 3.13 + uv + FastAPI 0.115 + Pydantic v2 | Next.js 15 App Router + TypeScript + Tailwind 4 + shadcn/ui + Framer Motion | Docker Compose | pnpm

---

## File Map

**Created this session:**
```
apps/
  api/
    pacelab_api/
      __init__.py
      main.py
      schemas/
        __init__.py
        base.py
    tests/
      __init__.py
      test_health.py
    pyproject.toml
    .python-version
    Dockerfile
    .dockerignore
  web/
    app/
      layout.tsx          ← root layout, fonts, dark theme
      page.tsx            ← homepage entry
      globals.css         ← Tailwind 4 + CSS variables
    components/
      hero-section.tsx    ← animated hero with circuit SVG
      circuit-path.tsx    ← Framer Motion circuit draw animation
      api-status.tsx      ← live API health pill
    lib/
      api.ts              ← typed fetch wrapper
    .env.local            ← NEXT_PUBLIC_API_URL
    next.config.ts
    package.json
    tsconfig.json
packages/
  ml/
    pyproject.toml        ← empty scaffold
data/
  raw/                    ← empty, gitignored
  processed/              ← empty, gitignored
.gitignore
README.md
docker-compose.yml
```

---

## Task 0: Prerequisites

**Files:** none (terminal only)

- [ ] **Step 1: Install pnpm globally**

```bash
npm install -g pnpm
```

Expected output: `added 1 package ...`

- [ ] **Step 2: Verify all tools**

```bash
python --version   # 3.13.x
node --version     # v22.x
pnpm --version     # 9.x or 10.x
uv --version       # 0.7.x
docker --version   # 27.x or newer
git --version      # 2.x
```

- [ ] **Step 3: Verify Docker is running**

```bash
docker ps
```

Expected: empty table (no error). If error: open Docker Desktop and wait for it to start.

---

## Task 1: Root Scaffold

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `docker-compose.yml`

- [ ] **Step 1: Create .gitignore**

Create `E:\PROJECTS\RESUME PROJECTS\PaceLab\.gitignore`:

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/
*.egg-info/
dist/
.pytest_cache/
.mypy_cache/
.ruff_cache/

# Node
node_modules/
.next/
.turbo/
out/

# Data — never commit race data
data/raw/
data/processed/
data/models/
*.parquet
*.duckdb

# Env
.env
.env.local
.env*.local
!.env.example

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# uv
uv.lock
```

- [ ] **Step 2: Create README.md**

Create `E:\PROJECTS\RESUME PROJECTS\PaceLab\README.md`:

```markdown
# PaceLab

> F1 Race Strategy Intelligence Platform

Predict tire degradation with calibrated uncertainty. Simulate 10,000 race strategies. Understand what teams should have done — and why they didn't.

## Stack

- **Frontend:** Next.js 15, Tailwind CSS 4, shadcn/ui, Framer Motion, Three.js
- **Backend:** FastAPI, DuckDB, Pydantic v2, uv
- **ML:** XGBoost, Conformal Prediction, SHAP
- **Data:** FastF1, OpenF1, Ergast
- **Deploy:** Vercel (web) · Oracle Cloud ARM (api)

## Local Development

```bash
docker compose up
```

- Frontend: http://localhost:3000
- API: http://localhost:8000
- Docs: http://localhost:8000/docs

## Structure

```
apps/web/      ← Next.js frontend
apps/api/      ← FastAPI backend
packages/ml/   ← Training code (run on Kaggle)
data/          ← gitignored — lives on Oracle
```
```

- [ ] **Step 3: Create docker-compose.yml**

Create `E:\PROJECTS\RESUME PROJECTS\PaceLab\docker-compose.yml`:

```yaml
services:
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./apps/api:/app
    environment:
      - ENV=development
    restart: unless-stopped

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - api
    restart: unless-stopped
```

- [ ] **Step 4: Create empty data directories**

```bash
mkdir -p "E:/PROJECTS/RESUME PROJECTS/PaceLab/data/raw"
mkdir -p "E:/PROJECTS/RESUME PROJECTS/PaceLab/data/processed"
mkdir -p "E:/PROJECTS/RESUME PROJECTS/PaceLab/data/models"
```

---

## Task 2: FastAPI Backend

**Files:**
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/.python-version`
- Create: `apps/api/pacelab_api/__init__.py`
- Create: `apps/api/pacelab_api/schemas/__init__.py`
- Create: `apps/api/pacelab_api/schemas/base.py`
- Create: `apps/api/pacelab_api/main.py`
- Create: `apps/api/tests/__init__.py`
- Create: `apps/api/tests/test_health.py`
- Create: `apps/api/Dockerfile`
- Create: `apps/api/.dockerignore`

- [ ] **Step 1: Create pyproject.toml**

Create `apps/api/pyproject.toml`:

```toml
[project]
name = "pacelab-api"
version = "0.1.0"
description = "PaceLab F1 Strategy Intelligence API"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.115.0",
    "uvicorn[standard]>=0.32.0",
    "pydantic>=2.10.0",
]

[dependency-groups]
dev = [
    "pytest>=8.3.0",
    "httpx>=0.27.0",
    "pytest-asyncio>=0.24.0",
]

[tool.pytest.ini_options]
asyncio_mode = "auto"

[tool.ruff]
line-length = 88
target-version = "py313"

[tool.ruff.lint]
select = ["E", "F", "I", "UP"]
```

- [ ] **Step 2: Create .python-version**

Create `apps/api/.python-version`:

```
3.13
```

- [ ] **Step 3: Init uv and install dependencies**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/api"
uv sync
uv sync --group dev
```

Expected: `.venv` created, packages installed.

- [ ] **Step 4: Create base response schema**

Create `apps/api/pacelab_api/__init__.py`: (empty file)

Create `apps/api/pacelab_api/schemas/__init__.py`: (empty file)

Create `apps/api/pacelab_api/schemas/base.py`:

```python
from typing import Generic, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standard response envelope for all PaceLab API endpoints."""

    data: T | None
    error: str | None
    status: str
```

- [ ] **Step 5: Write the failing health test**

Create `apps/api/tests/__init__.py`: (empty file)

Create `apps/api/tests/test_health.py`:

```python
import pytest
from httpx import AsyncClient, ASGITransport


@pytest.mark.asyncio
async def test_health_returns_success_status():
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
async def test_health_data_contains_ok():
    from pacelab_api.main import app

    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")

    body = response.json()
    assert body["data"]["status"] == "ok"
    assert body["data"]["version"] == "0.1.0"
```

- [ ] **Step 6: Run test — verify it fails**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/api"
uv run pytest tests/test_health.py -v
```

Expected: `ModuleNotFoundError: No module named 'pacelab_api'` or `ImportError`.

- [ ] **Step 7: Implement main.py**

Create `apps/api/pacelab_api/main.py`:

```python
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
    allow_origins=["http://localhost:3000", "https://pacelab.vercel.app"],
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
```

- [ ] **Step 8: Run test — verify it passes**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/api"
uv run pytest tests/test_health.py -v
```

Expected:
```
PASSED tests/test_health.py::test_health_returns_success_status
PASSED tests/test_health.py::test_health_data_contains_ok
2 passed
```

- [ ] **Step 9: Verify API runs locally**

```bash
uv run uvicorn pacelab_api.main:app --reload --port 8000
```

Open browser: `http://localhost:8000/health`
Expected JSON:
```json
{"data": {"status": "ok", "version": "0.1.0"}, "error": null, "status": "success"}
```

Open `http://localhost:8000/docs` — Swagger UI should render.

Stop server: `Ctrl+C`

- [ ] **Step 10: Create Dockerfile**

Create `apps/api/Dockerfile`:

```dockerfile
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
```

Create `apps/api/.dockerignore`:

```
.venv/
__pycache__/
*.pyc
tests/
.pytest_cache/
.ruff_cache/
```

- [ ] **Step 11: Commit backend**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git add apps/api/
git commit -m "feat(api): FastAPI scaffold with /health endpoint and Pydantic v2 response schema"
```

---

## Task 3: Next.js Frontend

**Files:** All under `apps/web/`

- [ ] **Step 1: Scaffold Next.js 15 app**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps"
pnpm create next-app@latest web --typescript --tailwind --app --no-src-dir --import-alias "@/*" --no-git
```

When prompted:
- Would you like to use ESLint? → **Yes**
- Would you like to customize the import alias? → **No** (already set to @/*)

- [ ] **Step 2: Install additional dependencies**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/web"
pnpm add framer-motion
pnpm add -D @types/node
```

- [ ] **Step 3: Install shadcn/ui**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/web"
pnpm dlx shadcn@latest init
```

When prompted:
- Which style? → **Default**
- Which color? → **Neutral**
- CSS variables? → **Yes**

- [ ] **Step 4: Update globals.css with PaceLab dark theme**

Replace `apps/web/app/globals.css` entirely:

```css
@import "tailwindcss";

@layer base {
  :root {
    --background: #0D0D0F;
    --surface: #141418;
    --border: #1E1E24;
    --text-primary: #FFFFFF;
    --text-muted: #6B6B7A;
    --accent-red: #E8002D;
    --accent-teal: #00D2BE;
    --accent-blue: #3671C6;
    --accent-orange: #FF8000;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--background);
  color: var(--text-primary);
  font-family: var(--font-jetbrains-mono), 'Courier New', monospace;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--surface); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
```

- [ ] **Step 5: Update root layout with JetBrains Mono font**

Replace `apps/web/app/layout.tsx`:

```tsx
import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "PaceLab — F1 Strategy Intelligence",
  description:
    "Predict tire degradation, simulate pit strategies, and understand what F1 teams should have done.",
  keywords: ["F1", "Formula 1", "race strategy", "tire degradation", "pit stop"],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 6: Create circuit path animation component**

Create `apps/web/components/circuit-path.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"

export function CircuitPath() {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none">
      <svg
        viewBox="0 0 800 500"
        className="w-full max-w-4xl"
        fill="none"
        stroke="#E8002D"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Simplified abstract F1 circuit outline */}
        <motion.path
          d="M 150 250
             L 150 150 Q 150 80 220 80
             L 420 80 Q 520 80 520 150
             L 520 180 Q 520 220 580 220
             L 650 220 Q 700 220 700 270
             L 700 320 Q 700 380 640 380
             L 400 380 Q 320 380 280 340
             L 240 300 Q 200 260 150 250 Z"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut", delay: 0.3 }}
        />
        {/* DRS zone indicator */}
        <motion.line
          x1="150" y1="245" x2="150" y2="255"
          stroke="#00D2BE"
          strokeWidth="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.2 }}
        />
        <motion.line
          x1="520" y1="145" x2="520" y2="185"
          stroke="#00D2BE"
          strokeWidth="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.4 }}
        />
        {/* Start/finish line */}
        <motion.line
          x1="145" y1="240" x2="155" y2="260"
          stroke="#FFFFFF"
          strokeWidth="3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.6 }}
        />
      </svg>
    </div>
  )
}
```

- [ ] **Step 7: Create API status component**

Create `apps/web/lib/api.ts`:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

export interface APIResponse<T> {
  data: T | null
  error: string | null
  status: string
}

export async function fetchAPI<T>(path: string): Promise<APIResponse<T>> {
  const res = await fetch(`${API_URL}${path}`, {
    next: { revalidate: 30 },
  })
  if (!res.ok) {
    return { data: null, error: `HTTP ${res.status}`, status: "error" }
  }
  return res.json() as Promise<APIResponse<T>>
}
```

Create `apps/web/components/api-status.tsx`:

```tsx
"use client"

import { useEffect, useState } from "react"

type Status = "checking" | "online" | "offline"

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("checking")

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
    fetch(`${apiUrl}/health`)
      .then((r) => r.json())
      .then((body) => {
        setStatus(body?.data?.status === "ok" ? "online" : "offline")
      })
      .catch(() => setStatus("offline"))
  }, [])

  const config: Record<Status, { color: string; label: string; dot: string }> = {
    checking: { color: "text-[#6B6B7A]", label: "CONNECTING", dot: "bg-[#6B6B7A] animate-pulse" },
    online:   { color: "text-[#00D2BE]", label: "API ONLINE",  dot: "bg-[#00D2BE]" },
    offline:  { color: "text-[#E8002D]", label: "API OFFLINE", dot: "bg-[#E8002D]" },
  }

  const { color, label, dot } = config[status]

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 font-mono text-xs tracking-widest">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className={color}>{label}</span>
    </div>
  )
}
```

- [ ] **Step 8: Create hero section**

Create `apps/web/components/hero-section.tsx`:

```tsx
"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CircuitPath } from "./circuit-path"

export function HeroSection() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 border-b border-[#1E1E24]">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-white text-xl font-bold tracking-widest uppercase"
        >
          PACE<span className="text-[#E8002D]">LAB</span>
        </motion.span>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex gap-8 text-[#6B6B7A] text-xs font-mono uppercase tracking-[0.2em]"
        >
          {["Strategy", "Drivers", "Circuits", "Live"].map((item) => (
            <span
              key={item}
              className="hover:text-white transition-colors cursor-pointer"
            >
              {item}
            </span>
          ))}
        </motion.div>
      </nav>

      {/* Circuit background */}
      <CircuitPath />

      {/* Hero content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-8">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-[#E8002D] font-mono text-xs uppercase tracking-[0.4em] mb-6"
        >
          F1 Strategy Intelligence Platform
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="font-mono text-[80px] font-bold leading-none tracking-tight text-white mb-2"
        >
          PACE<span className="text-[#E8002D]">LAB</span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="h-px w-64 bg-[#1E1E24] mb-6"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-[#6B6B7A] font-mono text-sm leading-relaxed max-w-md mb-10"
        >
          Predict. Simulate. Understand.
          <br />
          Every strategic decision, decoded.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="flex gap-4"
        >
          <Link
            href="/strategy"
            className="bg-[#E8002D] text-white font-mono text-xs uppercase tracking-[0.2em] px-8 py-3 hover:bg-[#FF1040] transition-colors"
          >
            Enter Strategy Room →
          </Link>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[#1E1E24] text-[#6B6B7A] font-mono text-xs uppercase tracking-[0.2em] px-8 py-3 hover:border-[#6B6B7A] hover:text-white transition-colors"
          >
            API Docs
          </a>
        </motion.div>

        {/* Stat bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0 }}
          className="flex gap-12 mt-20 text-center"
        >
          {[
            { value: "2019–2024", label: "Race Data" },
            { value: "10,000×", label: "Monte Carlo Runs" },
            { value: "±0.3s", label: "Prediction Accuracy" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-mono text-2xl font-bold text-white">{value}</p>
              <p className="font-mono text-xs text-[#6B6B7A] uppercase tracking-widest mt-1">
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom border */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="h-px bg-gradient-to-r from-transparent via-[#E8002D] to-transparent"
      />
    </div>
  )
}
```

- [ ] **Step 9: Update homepage entry**

Replace `apps/web/app/page.tsx`:

```tsx
import { HeroSection } from "@/components/hero-section"
import { ApiStatus } from "@/components/api-status"

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <ApiStatus />
    </main>
  )
}
```

- [ ] **Step 10: Create .env.local**

Create `apps/web/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- [ ] **Step 11: Create Next.js Dockerfile**

Create `apps/web/Dockerfile`:

```dockerfile
FROM node:22-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]
```

- [ ] **Step 12: Run Next.js dev server and verify visually**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/web"
pnpm dev
```

Open browser: `http://localhost:3000`

Verify:
- Background is near-black (`#0D0D0F`)
- "PACELAB" with red LAB renders in monospace
- Circuit SVG draws itself over ~3 seconds
- Tagline and CTA appear with staggered animation
- Bottom-right shows "CONNECTING" pill → then "API OFFLINE" (expected, API not running yet)

Stop server: `Ctrl+C`

- [ ] **Step 13: Commit frontend**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git add apps/web/
git commit -m "feat(web): Next.js 15 dark theme homepage with animated circuit hero"
```

---

## Task 4: ML Package Scaffold

**Files:**
- Create: `packages/ml/pyproject.toml`

- [ ] **Step 1: Create ML package scaffold**

```bash
mkdir -p "E:/PROJECTS/RESUME PROJECTS/PaceLab/packages/ml"
```

Create `packages/ml/pyproject.toml`:

```toml
[project]
name = "pacelab-ml"
version = "0.1.0"
description = "PaceLab ML training pipeline — run on Kaggle GPU"
requires-python = ">=3.13"
dependencies = [
    "fastf1>=3.4.0",
    "xgboost>=2.1.0",
    "lightgbm>=4.5.0",
    "scikit-learn>=1.5.0",
    "shap>=0.46.0",
    "pandas>=2.2.0",
    "numpy>=2.0.0",
    "duckdb>=1.1.0",
    "pyarrow>=17.0.0",
    "mlflow>=2.17.0",
    "optuna>=4.0.0",
    "pyyaml>=6.0.0",
]
```

- [ ] **Step 2: Commit ML scaffold**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git add packages/
git commit -m "chore(ml): empty ML training scaffold with dependency spec"
```

---

## Task 5: Git + GitHub

- [ ] **Step 1: Init git and commit root files**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git init
git add .gitignore README.md docker-compose.yml docs/
git commit -m "chore: init PaceLab monorepo scaffold"
```

- [ ] **Step 2: Create GitHub repo**

Go to https://github.com/new and create:
- Name: `pacelab`
- Visibility: **Public** (portfolio visibility)
- No README (we have one)
- No .gitignore (we have one)

- [ ] **Step 3: Push to GitHub**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git remote add origin https://github.com/<YOUR_USERNAME>/pacelab.git
git branch -M main
git push -u origin main
```

Replace `<YOUR_USERNAME>` with your GitHub username.

---

## Task 6: Vercel Deploy

- [ ] **Step 1: Deploy from apps/web**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab/apps/web"
vercel
```

When prompted:
- Set up and deploy? → **Y**
- Which scope? → your personal account
- Link to existing project? → **N**
- Project name? → `pacelab`
- Directory? → `./` (already in apps/web)
- Override settings? → **N**

- [ ] **Step 2: Set environment variable on Vercel**

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

Enter value: `http://localhost:8000` (temporary — will update once Oracle API is deployed)

- [ ] **Step 3: Deploy to production**

```bash
vercel --prod
```

Expected: `✓ Production: https://pacelab-<hash>.vercel.app`

- [ ] **Step 4: Verify Vercel deployment**

Open the Vercel URL in browser. Homepage should render identically to local.

---

## Task 7: Docker Compose Smoke Test

- [ ] **Step 1: Build and start both services**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
docker compose up --build
```

Wait for both services to show `ready` in logs.

- [ ] **Step 2: Verify API health**

```bash
curl http://localhost:8000/health
```

Expected:
```json
{"data":{"status":"ok","version":"0.1.0"},"error":null,"status":"success"}
```

- [ ] **Step 3: Verify frontend**

Open `http://localhost:3000` — should render with API status showing **API ONLINE** (teal dot).

- [ ] **Step 4: Final commit**

```bash
cd "E:/PROJECTS/RESUME PROJECTS/PaceLab"
git add .
git commit -m "chore: Session 1 complete — scaffold, hello-worlds, Docker Compose, Vercel deploy"
git push
```

---

## Session 1 Complete ✓

**Deliverables:**
- Monorepo at `E:\PROJECTS\RESUME PROJECTS\PaceLab`
- `GET /health` returning standard JSON envelope
- Next.js dark homepage with animated circuit SVG
- Both services running via `docker compose up`
- Frontend live on Vercel
- GitHub repo public

**Session 2 starts here:** FastF1 data pipeline on Oracle VM.
