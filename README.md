# Make My Marriage

A reusable, multi-wedding website and management platform built with Next.js, FastAPI, and MongoDB Atlas.

---

## Architecture Overview

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js (App Router), TypeScript, Vanilla CSS |
| Backend | FastAPI, Python 3.12 |
| Database | MongoDB Atlas — PyMongo Async (`pymongo[asyncio]`) |
| Media Storage | Google Cloud Storage (GCS) with signed URLs |
| Package Management | npm (frontend) · uv + pyproject.toml (backend) |

---

## Document Hierarchy and Scope Clarifications

The `docs/` directory contains the original source-of-truth specification documents in their original binary format. They are preserved as-is and must not be modified, renamed, or deleted.

| File | Version | Description |
| :--- | :--- | :--- |
| `docs/PRD.doc` | v1.0 | Product Requirements Document |
| `docs/SDD.doc` | v1.2 | System Design Document |
| `docs/DBDD.doc` | v1.0 | Database Design Document |
| `docs/API-DD.doc` | v1.0 | API Design Document |

### Specification Precedence

Where the documents disagree, the later technical specifications (SDD v1.2, DBDD v1.0, API-DD v1.0) supersede the original PRD v1.0 for implementation purposes.

### OTP Requirement — Deferred

**PRD v1.0, Section 5.9** describes SMS/phone OTP verification for guests accessing or updating RSVP information.

**Decision for Version 1 (MVP):** This requirement is **deferred to a future release**. The later technical specifications (SDD v1.2, DBDD v1.0, API-DD v1.0) explicitly exclude guest accounts, guest login, and OTP verification.

For V1, guests identify themselves exclusively through cryptographic unique invitation tokens delivered via email (e.g. `/w/[slug]/invite/[token]`). No account creation, phone number verification, or OTP is required.

### Expense Tracker — Deferred

**PRD and SDD** describe an Expense Tracker feature.

**Decision for Version 1 (MVP):** The Expense Tracker is **excluded from V1 scope**. It is deferred to a future release.

**V1 MVP scope includes:** Events timeline, Guest management, Invitation dispatch, RSVP management (token-based), Task Planner, Photo gallery (private, GCS-backed, signed URLs), Venue location and QR code, and Livestream information.

### Private Photo Gallery Authorization

The wedding slug alone (`/w/[slug]/gallery`) must not grant access to private photos. Guests must hold a valid invitation token that the backend validates and scopes to the correct wedding before issuing short-lived Google Cloud Storage signed URLs for photo access. This is not implemented in V1 scaffolding but is the designated approach.

---

## Repository Structure

```
make-my-marriage/
├── docs/                   # Source-of-truth specification documents (unchanged)
├── frontend/               # Next.js application (App Router, npm, Vanilla CSS)
│   ├── src/app/            # Route tree (landing, login, admin, dashboard, w/[slug])
│   └── ...
├── backend/                # FastAPI application (Python 3.12, uv)
│   ├── app/core/           # Settings and security utilities
│   ├── app/db/             # MongoDB async connection lifecycle
│   └── app/main.py         # FastAPI entrypoint and health check
├── .gitignore
└── README.md
```

---

## Route Map

| URL | Audience |
| :--- | :--- |
| `/` | Platform landing page |
| `/login` | Shared Admin and Manager sign-in (role-based redirect) |
| `/admin` | Platform Administrator dashboard |
| `/dashboard` | Wedding Manager dashboard |
| `/w/[slug]` | Public wedding website |
| `/w/[slug]/invite/[token]` | Guest RSVP page (token-authorized) |
| `/w/[slug]/gallery` | Private photo gallery (requires valid invitation token) |

---

## API Base Path

All backend REST endpoints are versioned under `/api/v1`.

Health check: `GET /api/v1/health`

---

## Getting Started

> **Note:** Dependencies must be installed manually. Do not run setup commands until the scaffolding is reviewed and approved.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Requires Node.js 20+. Copy `frontend/.env.example` to `frontend/.env.local` and set the required variables.

### Backend

```bash
cd backend
uv venv
uv pip install -e .
uvicorn app.main:app --reload
```

Requires Python 3.12 and `uv`. Copy `backend/.env.example` to `backend/.env` and set the required variables.
