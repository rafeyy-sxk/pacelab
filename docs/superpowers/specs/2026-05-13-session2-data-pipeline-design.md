# PaceLab Session 2 — Data Pipeline Design

**Date:** 2026-05-13
**Scope:** FastF1 ingestion pipeline, DuckDB schema, FastAPI data endpoints, Oracle setup script
**Status:** Approved

---

## Context

Session 1 delivered the monorepo scaffold with a working FastAPI `/health` endpoint and Next.js homepage. Session 2 wires in real F1 data. The pipeline pulls FastF1 race + qualifying sessions, normalizes lap data (including pace delta), stores it in Parquet + DuckDB, and exposes it via versioned FastAPI routes.

Full dataset lives on Oracle Cloud (50GB free). Local dev uses 1 race (Monaco 2024, ~80MB).

---

## Architecture

```
FastF1 API (external)
      │
      ▼
fastf1_loader.py    ← downloads sessions, returns raw DataFrames
      │
      ▼
transforms.py       ← cleans laps, computes pace_delta, stint_number
      │
      ▼
db.py               ← writes Parquet files + loads into DuckDB
      │
      ▼
pacelab.duckdb      ← analytical DB, queried by FastAPI
      │
      ▼
FastAPI routes      ← /api/v1/races, /laps, /drivers
```

---

## Pipeline (`packages/ml/pacelab_ml/data/`)

### config.yaml
```yaml
data:
  cache_dir: "data/raw"
  db_path: "data/processed/pacelab.duckdb"
  parquet_dir: "data/processed/laps"

pipeline:
  local:
    seasons: [2024]
    rounds: [8]          # Monaco
    sessions: ["R"]      # Race only
  full:
    seasons: [2023, 2024]
    rounds: null         # all rounds
    sessions: ["R", "Q"] # Race + Qualifying
```

### Modules

**`fastf1_loader.py`** — one public function:
```python
def load_session(year: int, round_number: int, session_type: str, cache_dir: str) -> pd.DataFrame
```
Returns raw FastF1 laps DataFrame with metadata columns attached (year, round, event_name, circuit).

**`transforms.py`** — one public function:
```python
def clean_and_enrich(raw_laps: pd.DataFrame) -> pd.DataFrame
```
- Drops inaccurate laps (`IsAccurate == False`)
- Converts timedelta columns to float seconds
- Computes `stint_number` (increments on each pit stop)
- Computes `pace_delta_s`: lap_time minus rolling median for same compound + stint_age bin (±2 laps). Removes fuel load and track evolution — leaves pure tire degradation signal.
- Renames columns to snake_case

**`db.py`** — two public functions:
```python
def write_parquet(laps: pd.DataFrame, parquet_dir: str, year: int, round_number: int) -> Path
def load_into_duckdb(parquet_dir: str, db_path: str) -> None
```
Parquet files saved as `laps/year={year}/round={round}/laps.parquet` (partitioned).
DuckDB reads all Parquet via `read_parquet('data/processed/laps/**/*.parquet', hive_partitioning=true)`.

**`pipeline.py`** — CLI entrypoint:
```bash
uv run python -m pacelab_ml.data.pipeline --mode local
uv run python -m pacelab_ml.data.pipeline --mode full
```

---

## DuckDB Schema

```sql
-- Races dimension table (created from FastF1 event schedule)
CREATE TABLE IF NOT EXISTS races (
    year        INTEGER NOT NULL,
    round       INTEGER NOT NULL,
    name        VARCHAR NOT NULL,   -- "Monaco Grand Prix"
    circuit     VARCHAR NOT NULL,   -- "Circuit de Monaco"
    country     VARCHAR NOT NULL,
    date        DATE    NOT NULL,
    PRIMARY KEY (year, round)
);

-- Laps fact table (loaded from Parquet)
CREATE VIEW laps AS
SELECT * FROM read_parquet('data/processed/laps/**/*.parquet', hive_partitioning=true);
```

Laps Parquet columns:
`year, round, driver, team, lap_number, compound, tyre_life, stint_number, lap_time_s, pace_delta_s, s1_time_s, s2_time_s, s3_time_s, speed_fl, is_pit_lap, is_accurate`

---

## FastAPI Routes (`apps/api/pacelab_api/routes/`)

All routes follow the `APIResponse[T]` envelope from `schemas/base.py`.

| Method | Path | Returns |
|--------|------|---------|
| GET | `/api/v1/races` | `list[RaceSummary]` |
| GET | `/api/v1/races/{year}` | `list[RaceSummary]` |
| GET | `/api/v1/races/{year}/{round}/drivers` | `list[str]` |
| GET | `/api/v1/races/{year}/{round}/laps` | `list[LapRecord]` (filterable by `?driver=VER`) |

**New files:**
- `pacelab_api/routes/__init__.py`
- `pacelab_api/routes/races.py`
- `pacelab_api/services/__init__.py`
- `pacelab_api/services/database.py`  ← DuckDB connection singleton
- `pacelab_api/schemas/races.py`      ← RaceSummary, LapRecord Pydantic models

**`database.py`** manages a single DuckDB connection (read-only, opened at startup via FastAPI lifespan). Path from `DB_PATH` env var, defaults to `data/processed/pacelab.duckdb`.

---

## Oracle Setup Script (`setup_oracle.sh`)

Runs once on a fresh Ubuntu 22.04 ARM VM:
1. Install Python 3.13 via deadsnakes PPA
2. Install uv
3. Clone repo from GitHub
4. `uv sync` in `packages/ml/`
5. Run `pipeline.py --mode full` (downloads 2023–2024, ~20 min)
6. `uv sync` in `apps/api/`
7. Write systemd unit for FastAPI on port 8000
8. Open firewall port 8000

---

## Success Criteria

1. `uv run python -m pacelab_ml.data.pipeline --mode local` completes without error
2. `data/processed/pacelab.duckdb` exists with `races` table populated
3. `GET /api/v1/races` returns Monaco 2024 with correct name/circuit
4. `GET /api/v1/races/2024/8/laps?driver=VER` returns Verstappen's laps with `pace_delta_s` column
5. All new API tests pass
6. `setup_oracle.sh` is present and executable
