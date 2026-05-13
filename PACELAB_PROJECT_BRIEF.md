# PaceLab — Project Brief & Claude Code Handoff Document

> Drop this entire file into your Claude Code session as the first message, or save it as `PROJECT_BRIEF.md` in the repo root and reference it. It contains everything needed to continue without losing context.

---

## 0. Who I Am (Builder Context)

- 23-year-old Mechanical Engineering student.
- Strong interest in AI/ML, industrial AI, predictive maintenance, computer vision, F1 engineering systems.
- Comfortable with Python and ML pipelines.
- Self-described "vibe coder" — can build end-to-end with AI assistance, learning web frontend as I go.
- **Zero budget.** Everything must be free tier / open source / public datasets.
- Goal: build resume-defining, industry-grade projects that get me hired at AI startups, industrial AI companies, or motorsport engineering teams.

## 1. The Project — PaceLab

**One-liner:** An AI-powered Formula 1 race strategy intelligence platform that predicts tire degradation, simulates pit-stop strategies, and visualizes everything on a dashboard that looks like it belongs on a Mercedes pit wall.

**Why this project:** Combines time-series ML, reinforcement learning, simulation, real-time data, and a stunning frontend. Uses only free public data (FastF1, OpenF1, Ergast). Story-friendly for recruiters at any AI/motorsport company.

## 2. Core Features (V1 Scope)

1. **Tire Wear Predictor** — Given race, driver, compound, track, weather, predict lap-by-lap pace degradation with calibrated uncertainty bands (not just a line — a probability fan).
2. **Strategy Simulator** — Interactive "what-if": run 10,000 Monte Carlo race simulations to see how alternate pit strategies would have played out. Output: probability distribution over finishing position.
3. **Live Race Mode** — During a Grand Prix weekend, pull OpenF1 live timing, update predictions every lap, recommend optimal pit window in real time.

## 3. What Will Make It Stand Out (Visual / UX Differentiators)

This is NOT a Streamlit-with-matplotlib project. The frontend is the moat.

- **F1 broadcast aesthetic** — dark theme, monospace fonts (JetBrains Mono / IBM Plex Mono), neon team accents, sharp angular borders.
- **3D animated circuit map** — Three.js + React Three Fiber. Car position animates lap-by-lap.
- **Animated number/card transitions** — Framer Motion everywhere.
- **Live-looking gauges** — speed, tire temp, fuel, RPM. They move even on static data.
- **Probability fan charts** — predicted finish position as a glowing distribution, not a point.
- **Strategy comparison cards** — hover plays a mini alternate-history animation.
- **Cinematic hero animation** — 8–10 second intro: circuit traces draw themselves, telemetry scrolls, dashboard reveals.
- **Team-themed color modes** — Mercedes teal, Ferrari red, McLaren papaya, etc.

## 4. Architecture

Four independent components:

```
┌──────────────────────┐      ┌──────────────────────┐
│  Data Pipeline (PY)  │─────▶│  Parquet Data Store  │
│  FastF1 + OpenF1     │      │  (DuckDB / files)    │
│  Run weekly          │      └──────────┬───────────┘
└──────────────────────┘                 │
                                         ▼
┌──────────────────────┐      ┌──────────────────────┐
│  Trainer (Kaggle)    │─────▶│  ML Model Artifacts  │
│  PyTorch / XGBoost   │      │  (.pkl / .onnx)      │
│  Free GPU training   │      └──────────┬───────────┘
└──────────────────────┘                 │
                                         ▼
                              ┌──────────────────────┐
                              │  Backend API (PY)    │
                              │  FastAPI on Oracle   │
                              │  Cloud Free ARM VM   │
                              └──────────┬───────────┘
                                         │  REST / JSON
                                         ▼
                              ┌──────────────────────┐
                              │  Frontend (Next.js)  │
                              │  Deployed on Vercel  │
                              │  pacelab.vercel.app  │
                              └──────────────────────┘
```

## 5. Tech Stack (All Free)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion (animations)
- Three.js + React Three Fiber (3D)
- Recharts + Visx + D3.js (charts)
- TanStack Query (data fetching)
- Zustand (state)

**Backend**
- FastAPI
- Pydantic
- DuckDB (analytical DB, zero setup)
- Redis (cache, add later)
- Uvicorn

**Data**
- FastF1 (historical telemetry, free)
- OpenF1 (live race data, free)
- Ergast (results history, free)

**ML**
- PyTorch
- XGBoost / LightGBM (baselines)
- Temporal Fusion Transformer (sequence model)
- scikit-learn (preprocessing, calibration)
- Conformal prediction (uncertainty)
- Optuna (HP tuning)
- MLflow (experiment tracking)

**Deployment**
- Vercel (frontend, free)
- Oracle Cloud Free Tier ARM VM (backend, free forever — 4 cores, 24GB RAM)
- HuggingFace Spaces (fallback for ML inference)
- Kaggle (free GPU training)

**DevOps**
- Git + GitHub
- GitHub Actions (CI, free for public repos)
- Docker + Docker Compose
- pnpm (frontend pkg manager)
- uv or poetry (Python pkg manager)

## 6. Repo Structure (Proposed)

```
pacelab/
├── README.md
├── PROJECT_BRIEF.md          ← this file
├── .gitignore
├── docker-compose.yml
│
├── apps/
│   ├── web/                  ← Next.js frontend
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tailwind.config.ts
│   │
│   └── api/                  ← FastAPI backend
│       ├── pacelab_api/
│       │   ├── main.py
│       │   ├── routes/
│       │   ├── models/
│       │   ├── services/
│       │   └── schemas/
│       ├── tests/
│       ├── pyproject.toml
│       └── Dockerfile
│
├── packages/
│   └── ml/                   ← Training code (run locally / Kaggle)
│       ├── data/
│       ├── features/
│       ├── models/
│       │   ├── tire_degradation/
│       │   └── strategy_rl/
│       ├── training/
│       ├── notebooks/
│       └── pyproject.toml
│
├── data/                     ← gitignored, local cache of FastF1
│   ├── raw/
│   ├── processed/
│   └── models/               ← trained artifacts
│
└── docs/
    ├── architecture.md
    ├── data-schema.md
    └── decisions/            ← ADRs
```

## 7. Build Phases / Milestones

**Phase 0 — Setup (Day 1)**
- All accounts created (GitHub, Vercel, Kaggle, Oracle Cloud, HuggingFace).
- Local toolchain installed (Python 3.11+, Node 20+, Git, Claude Code, Docker).
- GitHub repo created and pushed.
- Monorepo scaffold done.

**Phase 1 — Data Foundation (Week 1)**
- FastF1 data pipeline pulling 2019–2024 race data.
- Cleaned, normalized lap data in Parquet.
- DuckDB query layer.
- Basic FastAPI endpoint `/races`, `/drivers`, `/laps` returning JSON.

**Phase 2 — Frontend Skeleton (Week 2)**
- Next.js project scaffolded with Tailwind + shadcn.
- Dark theme + monospace fonts + team color tokens.
- Landing page with cinematic hero animation (Framer Motion).
- Race selector dropdown wired to backend.
- Basic lap-time chart (Recharts).
- Deployed to Vercel.

**Phase 3 — Tire Degradation Model (Week 3–4)**
- Feature engineering: pace-relative-to-clean-air, stint position, track temp, compound.
- XGBoost baseline first → report MAE per compound.
- Temporal Fusion Transformer for sequence prediction.
- Conformal prediction wrapper for calibrated intervals.
- Model artifact saved + loaded by API.

**Phase 4 — Predictor UI (Week 4–5)**
- Probability fan chart visualization (Visx).
- Driver / compound / track selector.
- Animated transitions between predictions.

**Phase 5 — Strategy Simulator (Week 5–6)**
- Monte Carlo race simulator in Python (10k runs in < 5s).
- State: lap, position, tire compound, tire age, gap, weather, SC probability.
- Reward: final position + race time.
- Backend endpoint `/simulate` returns distribution.
- Frontend: interactive what-if panel with strategy cards.

**Phase 6 — 3D Track Map (Week 6–7)**
- Three.js / React Three Fiber circuit visualization.
- GeoJSON of each circuit (free public data).
- Animated car position per lap.

**Phase 7 — Live Race Mode (Week 7–8)**
- OpenF1 polling during race weekends.
- WebSocket from backend to frontend.
- Live pit window recommendation card.

**Phase 8 — Polish & Launch (Week 8)**
- Cinematic intro animation.
- 90-second demo video for LinkedIn.
- README with screenshots, architecture diagram, results.
- Blog post explaining the engineering decisions.

## 8. Engineering Principles (Non-Negotiables)

1. **Predict pace delta, not raw lap time.** Factor out traffic, fuel load, track evolution.
2. **Always output uncertainty,** never bare point predictions.
3. **Backtest on real races** and honestly compare model recommendations to what teams actually did.
4. **Measure and document latency** for every API call. Real-time means bounded, not "fast."
5. **No fake data without disclosure.** If we synthesize, the README says so.
6. **Frontend performance matters** — Lighthouse score ≥ 90, animations 60fps.
7. **The README is the product** for recruiters. Treat it like a research paper, not a list of npm scripts.
8. **Ablations + failure cases get their own section** in the README. What didn't work is more credible than what did.

## 9. What's Done, What's Next

**Done:**
- Project scope, vision, architecture, stack decided.
- This brief written.

**Next immediate steps (where we pick up):**
1. Confirm all accounts are created and local tools installed.
2. Initialize the monorepo skeleton (folders + base config files).
3. Wire up FastAPI hello-world + Next.js hello-world locally.
4. First commit, push to GitHub, deploy Next.js stub to Vercel.

## 10. Open Questions to Decide With Claude Code

- Monorepo with Turborepo, or just plain folders? (Lean: plain folders for simplicity; add Turborepo only if needed.)
- ML training: notebooks-first on Kaggle, or scripted from day one? (Lean: scripted from day one — better for portfolio.)
- State management complexity: just Zustand, or also TanStack Query? (Lean: both — they handle different concerns.)
- Authentication: skip for V1 (public demo), add later if needed.

## 11. Frontend Visual References / Inspiration (To Show Claude Code)

- F1 TV broadcast graphics overlay
- Linear app aesthetic (linear.app)
- Vercel dashboard (vercel.com/dashboard)
- Mercedes AMG Petronas official telemetry visuals
- Spotify Wrapped 2023 (motion design quality bar)

## 12. Reference Datasets / APIs

- **FastF1** — `pip install fastf1` — historical telemetry, laps, events 2018–present.
- **OpenF1** — `https://api.openf1.org` — live + historical, REST.
- **Ergast** — `http://ergast.com/mrd/` — results since 1950.
- **Circuit GeoJSON** — F1 circuit shapes available on GitHub (search "f1 circuits geojson").

## 13. Stretch Goals (Not V1)

- Driver biometrics overlay (HRV, reaction time) from public sources where available.
- Weather radar integration for wet-race strategy.
- CFD surrogate model for aero setup suggestions (graph neural network).
- Multi-season comparison mode (driver evolution).
- Mobile app (React Native) sharing the same API.

---

## How to Use This Document in Claude Code

1. Save this file as `PROJECT_BRIEF.md` in your repo root.
2. Open Claude Code in the repo directory.
3. Start your first message with:

> "Read PROJECT_BRIEF.md. We're at Phase 0. Help me scaffold the monorepo and get the FastAPI + Next.js hello-world running locally."

Claude Code will have full context and can pick up from exactly where this chat left off.

---

**End of brief. Build something they've never seen.**
