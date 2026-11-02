# Make My Marriage — Backend

The asynchronous REST API for the Make My Marriage multi-wedding platform, built with [FastAPI](https://fastapi.tiangolo.com/), Python 3.12, and [MongoDB Atlas](https://www.mongodb.com/atlas) via `pymongo[asyncio]`.

---

## Tech Stack

- **Framework:** FastAPI 0.115+
- **ASGI Server:** Uvicorn (standard)
- **Runtime:** Python 3.12+
- **Package & Env Manager:** `uv`
- **Database:** MongoDB Atlas via Async PyMongo (`AsyncMongoClient`)
- **Settings & Schemas:** Pydantic & Pydantic-Settings
- **Security:** PBKDF2-HMAC-SHA256 password hashing (600,000 iterations) and HMAC session tokens

---

## Directory Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── auth.py        # Authentication routes (/login, /register, /me, /logout)
│   ├── core/
│   │   ├── config.py          # Pydantic Settings & environment validation
│   │   └── security.py        # PBKDF2 password hashing & HMAC signed tokens
│   ├── db/
│   │   └── session.py         # MongoDB Atlas async lifespan, ping & indexes
│   ├── schemas/
│   │   └── auth.py            # Pydantic request/response validation models
│   └── main.py                # FastAPI app factory, CORS, health route
├── tests/
│   ├── test_auth_schemas.py   # Auth schema validation tests
│   ├── test_health.py         # Health check tests
│   └── test_security.py       # Password hashing & HMAC token tests
├── pyproject.toml             # Project dependencies and tool configurations
└── uv.lock                    # Dependency lockfile
```

---

## Getting Started

### 1. Prerequisites

- **Python:** 3.12 or higher
- **Package Manager:** `uv` (recommended) or standard `pip` / `venv`
- **Database:** A running MongoDB Atlas instance or local MongoDB server

### 2. Environment Configuration

Copy the sample environment file to `.env`:

```bash
cp .env.example .env
```

Ensure the following variables are configured in `.env`:

```ini
# MongoDB Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=make-my-marriage-dev

# Security Key for HMAC session token signing
SECRET_KEY=your-secure-random-secret-key

# Allowed CORS Origins (Frontend)
CORS_ORIGINS=http://localhost:3000
```

### 3. Setup Virtual Environment and Dependencies

Using `uv`:

```bash
# Create virtual environment
uv venv

# Install project with development dependencies
uv pip install -e ".[dev]"
```

Using standard `venv`:

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

### 4. Run the Backend Server

Using virtual environment directly:

```bash
.venv/bin/uvicorn app.main:app --reload --port 8000
```

Or from the repository root:

```bash
backend/.venv/bin/uvicorn app.main:app --app-dir backend --env-file backend/.env --reload --port 8000
```

Once running:
- **Health Check:** `http://localhost:8000/api/v1/health`
- **Interactive Swagger UI:** [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **ReDoc Documentation:** [http://localhost:8000/api/redoc](http://localhost:8000/api/redoc)

---

## Running Tests

Run the test suite using `pytest` from within the `backend/` directory:

```bash
.venv/bin/pytest
```

> **Note:** Always execute `pytest` from within `backend/` so that `backend/.env` is resolved correctly by the settings loader.

---

## API Endpoints (Current Baseline)

### Health Check

- `GET /api/v1/health` — Confirms FastAPI server is responsive.

### Authentication (`/api/v1/auth`)

- `POST /api/v1/auth/register` — Self-registration for couple or planner accounts.
- `POST /api/v1/auth/login` — Sign-in with email & password, sets HTTP-only `session_token` cookie.
- `GET /api/v1/auth/me` — Returns authenticated user profile using cookie or Bearer token.
- `POST /api/v1/auth/logout` — Clears `session_token` cookie and terminates session.

---

## Security Architecture

- **Password Hashing:** PBKDF2-HMAC-SHA256 using 600,000 iterations and 16-byte cryptographically secure salts.
- **Session Tokens:** Compact HMAC-SHA256 signature `<user_id>.<timestamp>.<signature>` with constant-time comparison to prevent timing attacks.
- **Data Isolation:** Future wedding models enforce strict scoping to tenant `weddingId`.
