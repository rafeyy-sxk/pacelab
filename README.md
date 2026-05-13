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
- API Docs: http://localhost:8000/docs

## Structure

```
apps/web/      ← Next.js frontend
apps/api/      ← FastAPI backend
packages/ml/   ← Training code (run on Kaggle)
data/          ← gitignored — full dataset lives on Oracle
```

## Features

- **Tire Degradation Predictor** — lap-by-lap pace delta with calibrated uncertainty bands
- **Safety Car-Aware Monte Carlo Simulator** — 10,000 race simulations per query
- **Ghost Strategy Replay** — what teams should have done vs what they did
- **Undercut/Overcut Calculator** — probability a position swap succeeds
- **SHAP Explainer UI** — why the model predicted what it predicted
- **Live Race Mode** — real-time pit window recommendations via OpenF1
