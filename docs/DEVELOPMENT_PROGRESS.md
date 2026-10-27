# Make My Marriage — Development Progress

> **Purpose:** This is the living development-tracking document for the Make My Marriage project. It records what has actually been built, what is in progress, and what remains. Update this document after meaningful development work. Never claim a feature is complete without evidence.

---

## Table of Contents

1. [Project Status](#1-project-status)
2. [Initial Scaffolding](#2-initial-scaffolding)
3. [Environment and Startup Verification](#3-environment-and-startup-verification)
4. [Feature Implementation Tracker](#4-feature-implementation-tracker)
5. [Technical Decisions](#5-technical-decisions)
6. [Issues and Resolutions](#6-issues-and-resolutions)
7. [Development Milestones](#7-development-milestones)
8. [Next Steps](#8-next-steps)
9. [Instructions for Future Developers and AI Assistants](#9-instructions-for-future-developers-and-ai-assistants)

---

## 1. Project Status

| Field | Value |
|---|---|
| **Current Phase** | Phase 1 — Initial Scaffolding |
| **Last Updated** | 2026-10-27 |
| **Overall Status** | Scaffolding complete; no features implemented; environment not fully verified |

**Summary:** The frontend (Next.js) and backend (FastAPI) project structures have been created with foundational files. The frontend is running in development mode (confirmed by user activity). The backend has been scaffolded with a health check endpoint but startup with a real MongoDB Atlas connection has not been verified. No application features beyond the health check endpoint have been implemented.

---

## 2. Initial Scaffolding

### 2.1 Frontend Files Created

| File / Directory | Type | Purpose |
|---|---|---|
| `frontend/package.json` | Created | npm project definition; defines dependencies and dev scripts |
| `frontend/package-lock.json` | Generated | Locked dependency versions |
| `frontend/node_modules/` | Generated | Installed npm packages (Next.js 15, React 19, TypeScript 5, ESLint) |
| `frontend/tsconfig.json` | Created | TypeScript compiler options with strict mode and App Router plugin |
| `frontend/next.config.mjs` | Created | Next.js config; permits remote images from `storage.googleapis.com` |
| `frontend/.env.example` | Created | Template for `NEXT_PUBLIC_API_BASE_URL` |
| `frontend/.env.local` | Created | Local environment file (mirrors `.env.example`; not committed) |
| `frontend/next-env.d.ts` | Generated | Next.js TypeScript declarations |
| `frontend/.next/` | Generated | Next.js build cache and output directory |
| `frontend/src/app/globals.css` | Created | Complete CSS design token system (colors, typography, spacing, shadows, transitions) |
| `frontend/src/app/layout.tsx` | Created | Root layout with page metadata ("Make My Marriage") |
| `frontend/src/app/page.tsx` | Complete | Full platform landing page with hero, live preview, features, and role cards |

### 2.2 Backend Files Created

| File / Directory | Type | Purpose |
|---|---|---|
| `backend/pyproject.toml` | Created | Python project definition, dependencies, build config, pytest options |
| `backend/uv.lock` | Generated | Locked Python dependency versions |
| `backend/.venv/` | Generated | Python virtual environment managed by uv |
| `backend/.env.example` | Created | Template for MONGODB_URI, DATABASE_NAME, SECRET_KEY, CORS_ORIGINS |
| `backend/.env` | Created | Local environment file (mirrors `.env.example`; not committed) |
| `backend/app/main.py` | Created | FastAPI app factory, CORS middleware, health check endpoint (`GET /api/v1/health`) |
| `backend/app/core/config.py` | Created | Pydantic Settings: validates all env vars at startup |
| `backend/app/db/session.py` | Created | PyMongo Async client lifecycle (`lifespan_db`, `get_database`) |

### 2.3 Root-Level Files

| File | Purpose |
|---|---|
| `README.md` | Project overview, architecture table, document hierarchy, scope clarifications, route map, setup instructions |
| `.gitignore` | Git ignore rules |

### 2.4 Project Documentation

| File | Status |
|---|---|
| `docs/PRD.doc` | Existing — Product Requirements Document v1.0 |
| `docs/SDD.doc` | Existing — System Design Document v1.2 |
| `docs/DBDD.doc` | Existing — Database Design Document v1.0 |
| `docs/API-DD.doc` | Existing — API Design Document v1.0 |
| `docs/PROJECT_OVERVIEW.md` | Created (this session) — Consolidated project overview |
| `docs/DEVELOPMENT_PROGRESS.md` | Created (this session) — This file |

---

## 3. Environment and Startup Verification

> Status definitions: **Not Started** | **In Progress** | **Passed** | **Failed** | **Blocked**

| Check | Status | Evidence / Notes |
|---|---|---|
| Frontend dependencies installed | **Passed** | `node_modules/` exists; `package-lock.json` present |
| Frontend starts successfully | **In Progress** | User is running `npm run dev` in `frontend/` (confirmed by active terminal session). Fully passing has not been verified by a health check or screenshot. |
| Frontend production build succeeds | **Not Started** | `npm run build` not yet executed |
| Backend dependencies installed | **Passed** | `.venv/` exists; `uv.lock` present |
| Backend starts successfully | **Not Started** | `uvicorn app.main:app --reload` not yet run and confirmed |
| Health endpoint responds with `{"status":"ok"}` | **Not Started** | Requires backend to be running |
| MongoDB connection verified | **Not Started** | Requires backend startup with a valid `MONGODB_URI` in `.env` |

> **Note:** The user's active terminal shows `npm run dev` running in the frontend directory for over 8 minutes, suggesting the dev server is likely running. However, successful rendering has not been independently verified in this session.

---

## 4. Feature Implementation Tracker

| Feature / Module | Planned Functionality | Implementation Status | Testing Status | Relevant Files | Notes / Blockers |
|---|---|---|---|---|---|
| **Health Check** | `GET /api/v1/health` returns `{"status":"ok"}` | Scaffolded | Not tested | `backend/app/main.py` | Requires backend to be started to verify |
| **Authentication** | Login, logout, current user (`/api/v1/auth/`); secure credential validation; session/token management | Not Started | Not Started | — | Auth mechanism (cookie vs. token) not yet finalized |
| **Platform Admin — Wedding Creation** | `POST /api/v1/admin/weddings`; create wedding records | Not Started | Not Started | — | Requires auth module first |
| **Platform Admin — Manager Accounts** | `POST /api/v1/admin/managers`; create, list, update Managers | Not Started | Not Started | — | Requires auth module; password-setup email flow not finalized |
| **Wedding Manager Dashboard** | `GET /api/v1/weddings/{id}/dashboard`; summaries (guests, RSVPs, tasks, events) | Not Started | Not Started | — | Requires all sub-modules |
| **Wedding Setup (Manager)** | `PATCH /api/v1/weddings/{id}`; update wedding details from dashboard | Not Started | Not Started | — | Requires auth and wedding creation |
| **Event Management** | CRUD for events; public event listing | Not Started | Not Started | — | Requires wedding module |
| **Task Planner** | CRUD for tasks; status/priority tracking | Not Started | Not Started | — | Requires wedding module |
| **Expense Tracker (Backend)** | CRUD for expenses; expense summary | Not Started | Not Started | — | UI feature deferred; backend data model may be implemented; see Section 5 |
| **Guest Management** | CRUD for guests; guest list (paginated, searchable) | Not Started | Not Started | — | Guest contact data is private; never returned by public APIs |
| **Digital Invitations** | Generate secure token; send invitation email via Resend | Not Started | Not Started | — | Resend not yet configured; token generation approach not implemented |
| **RSVP — Token Validation** | Validate invitation token; return guest/wedding info | Not Started | Not Started | — | No OTP in V1 |
| **RSVP — Submission** | Accept Yes/No RSVP; upsert one record per guest per wedding | Not Started | Not Started | — | |
| **RSVP — Summary** | `GET /api/v1/weddings/{id}/rsvps/summary` | Not Started | Not Started | — | |
| **Email Reminders** | Send reminder emails to selected guests | Not Started | Not Started | — | Requires Resend integration |
| **QR Codes** | Generate/return QR code for public wedding website URL | Not Started | Not Started | — | QR generation library not yet chosen |
| **Photo Gallery — Upload** | Signed GCS upload URL; confirm upload; save metadata | Not Started | Not Started | — | GCS bucket and credentials not yet configured |
| **Photo Gallery — Album Management** | CRUD for photo albums | Not Started | Not Started | — | |
| **Photo Gallery — Authorized Guest Access** | Validate invitation token; issue short-lived signed GCS URLs | Not Started | Not Started | — | Critical: slug alone must not grant access |
| **Livestream Management** | Configure optional livestream URL for a wedding | Not Started | Not Started | — | Optional feature |
| **Public Wedding Website (`/w/[slug]`)** | Frontend pages: public info, events, venue, QR code | Not Started | Not Started | — | No frontend routes exist yet beyond homepage placeholder |
| **Login Page (`/login`)** | Shared Admin/Manager login form; role-based redirect | Not Started | Not Started | — | Route does not exist yet |
| **Admin Dashboard (`/admin`)** | Platform admin UI | Not Started | Not Started | — | Route does not exist yet |
| **Manager Dashboard (`/dashboard`)** | Wedding manager UI | Not Started | Not Started | — | Route does not exist yet |
| **Guest Invitation Page (`/w/[slug]/invite/[token]`)** | RSVP form; token-based auth | Not Started | Not Started | — | Route does not exist yet |
| **Private Gallery Page (`/w/[slug]/gallery`)** | Token-authorized gallery viewer | Not Started | Not Started | — | Route does not exist yet |

---

## 5. Technical Decisions

### 5.1 Confirmed Decisions

| Decision Area | Decision | Reason | Source |
|---|---|---|---|
| Frontend framework | Next.js 15 (App Router) | Multi-page SSR/SSG capabilities; established ecosystem | SDD v1.2; package.json |
| Frontend language | TypeScript (strict mode) | Type safety across the codebase | tsconfig.json |
| Frontend styling | Vanilla CSS with design tokens in `globals.css` | Full control; no framework lock-in | globals.css |
| Backend framework | FastAPI (Python 3.12) | Async support; automatic OpenAPI docs; pydantic validation | SDD v1.2; pyproject.toml |
| Backend package manager | uv | Modern, fast Python dependency manager | pyproject.toml; uv.lock |
| Database | MongoDB Atlas | Flexible document schema for wedding data | SDD v1.2; .env.example |
| Database driver | PyMongo Async (pymongo[asyncio]) | Native async support matching FastAPI's async model | pyproject.toml |
| Media storage | Google Cloud Storage | Managed object storage; signed URL support for private access | SDD v1.2; next.config.mjs |
| API versioning | All endpoints under `/api/v1` | Forward-compatible versioning | README.md; main.py |
| OTP — deferred | OTP verification excluded from V1 | PRD v1.0 required it; SDD v1.2, DBDD v1.0, API-DD v1.0 excluded it. Decision: deferred to future release | README.md |
| Expense Tracker — deferred | Expense UI excluded from V1 product scope | PRD excludes it; SDD/DBDD include the data model | README.md |
| Guest auth model | No guest accounts; invitation token only | Simplicity and privacy; no OTP in V1 | SDD v1.2; README.md |
| Wedding data isolation | Every query scoped by weddingId from authenticated session | Prevents cross-wedding data leakage | DBDD v1.0; SDD v1.2 |
| Password storage | Secure hash required; plaintext forbidden | Security baseline | DBDD v1.0; SDD v1.2 |
| Invitation token storage | Store hash only; raw token never persisted | Security baseline | DBDD v1.0; API-DD v1.0 |
| Gallery access control | Slug alone insufficient; requires valid invitation token | README.md security note | README.md; DBDD v1.0 |

### 5.2 Pending Decisions

| Decision Area | Options | Notes |
|---|---|---|
| Authentication mechanism | HTTP-only secure cookie vs. bearer token | Must be finalized before auth implementation |
| Admin role boundary | Platform Administrator only vs. wedding-level Admin supervisory role | SDD v1.2 describes both; boundary not finalized |
| Invitation expiration policy | No expiry vs. time-limited | Not yet specified |
| Guest gallery access recovery | Action when guest loses invitation link | Not yet specified |
| Guest email field | Mandatory or optional | Email needed for invitation flow; behavior when absent not defined |
| Hosting platform | Cloud Run vs. Compute Engine VM | Pending |
| Email provider configuration | Resend proposed; not yet set up | Requires API key and account |
| QR code generation library | Not yet chosen | — |
| Session lifetime and refresh | Not yet specified | — |
| Production domain | Not yet specified | — |

---

## 6. Issues and Resolutions

No verified issues are currently recorded. This section will be updated as issues are discovered and resolved during development.

> When adding an issue, include: date discovered, description, root cause (if known), and resolution (or current status if unresolved).

---

## 7. Development Milestones

| Date | Milestone | Notes |
|---|---|---|
| Date not recorded | Four source specification documents created | PRD.doc v1.0, SDD.doc v1.2, DBDD.doc v1.0, API-DD.doc v1.0 |
| Date not recorded | Scope clarifications documented in README.md | OTP deferred; Expense Tracker UI deferred; gallery authorization approach defined |
| Date not recorded | Frontend scaffolding created | Next.js 15, React 19, TypeScript 5, Vanilla CSS design tokens |
| Date not recorded | Backend scaffolding created | FastAPI, Python 3.12, PyMongo Async, pydantic-settings, uv |
| Date not recorded | Health check endpoint implemented | `GET /api/v1/health` returns `{"status":"ok"}` |
| Date not recorded | CSS design token system defined | globals.css: colors, typography, spacing, shadows, transitions |
| 2026-10-27 | PROJECT_OVERVIEW.md and DEVELOPMENT_PROGRESS.md created | Initial documentation pass based on source documents and workspace inspection |

---

## 8. Next Steps

The following tasks are prioritized for the next development phase. Complete environment verification before implementing features.

### Priority 1 — Environment Verification (Do First)

- [ ] Confirm the frontend dev server renders the homepage correctly in a browser
- [ ] Start the backend: `cd backend && uvicorn app.main:app --reload`
- [ ] Verify `GET http://localhost:8000/api/v1/health` returns `{"status":"ok"}`
- [ ] Verify the Swagger UI loads at `http://localhost:8000/api/docs`
- [ ] Connect to a MongoDB Atlas cluster by setting `MONGODB_URI` in `backend/.env`
- [ ] Confirm the backend starts without errors when `MONGODB_URI` is set
- [ ] Run `npm run build` in `frontend/` to verify the production build succeeds
- [ ] Update the "Environment and Startup Verification" table in this document with results

### Priority 2 — Authentication Module

- [ ] Finalize the authentication mechanism (cookie vs. bearer token)
- [ ] Implement `POST /api/v1/auth/login` with credential validation and hashed password check
- [ ] Implement `POST /api/v1/auth/logout`
- [ ] Implement `GET /api/v1/auth/me`
- [ ] Implement backend role and wedding-assignment enforcement middleware
- [ ] Create the `users` MongoDB collection and index design
- [ ] Create the `/login` frontend page with form and role-based redirect

### Priority 3 — Platform Administration

- [ ] Implement `POST /api/v1/admin/weddings` (create wedding)
- [ ] Implement `GET /api/v1/admin/weddings` (list weddings)
- [ ] Implement `POST /api/v1/admin/managers` (create Manager account with activation email)
- [ ] Create the `/admin` dashboard frontend page

### Priority 4 — Wedding Setup and Public Website

- [ ] Implement public wedding API (`GET /api/v1/public/weddings/{slug}`)
- [ ] Implement `PATCH /api/v1/weddings/{id}` (update wedding details)
- [ ] Create the `/w/[slug]` frontend route (public wedding website)

### Priority 5 — Events, Tasks, and Guest Management

- [ ] Implement event CRUD APIs and public event listing
- [ ] Implement task CRUD APIs
- [ ] Implement guest CRUD APIs (private; management access only)
- [ ] Create corresponding frontend UI for Manager dashboard

### Priority 6 — Invitations and RSVP

- [ ] Implement invitation token generation (cryptographically secure)
- [ ] Configure Resend email integration
- [ ] Implement invitation sending API
- [ ] Implement token validation endpoint
- [ ] Implement RSVP submission API (Yes / No; upsert)
- [ ] Create `/w/[slug]/invite/[token]` frontend RSVP page

### Priority 7 — Photo Gallery

- [ ] Provision GCS bucket with private access controls
- [ ] Implement signed upload URL generation
- [ ] Implement upload confirmation and metadata saving
- [ ] Implement authorized gallery access (token-based signed URL issuance)
- [ ] Create `/w/[slug]/gallery` frontend page

### Priority 8 — QR Codes, Livestream, and Reminders

- [ ] Choose and integrate a QR code generation library
- [ ] Implement QR code endpoint
- [ ] Implement livestream configuration and public display
- [ ] Implement reminder email API

---

## 9. Instructions for Future Developers and AI Assistants

These rules must be followed throughout development to maintain project integrity and avoid losing context.

### 9.1 Before Starting Any Work

1. **Read `docs/PROJECT_OVERVIEW.md` before making significant changes.** It is the consolidated reference for project requirements, architecture, roles, and confirmed decisions.
2. **Consult the relevant original design document before implementing a feature.** `docs/SDD.doc` covers architecture, `docs/DBDD.doc` covers the database schema, and `docs/API-DD.doc` covers endpoint specifications.
3. **Inspect the actual code before updating progress.** Do not assume a feature is built because it appears in a design document. Verify that the relevant files and logic actually exist.

### 9.2 During Development

4. **Do not implement OTP in V1.** This is a confirmed deferred decision. See `docs/PROJECT_OVERVIEW.md` Section 13.3.
5. **Do not build the Expense Tracker UI in V1.** The backend data model may be implemented; the user-facing UI is deferred. See `docs/PROJECT_OVERVIEW.md` Section 13.4.
6. **Enforce wedding-level data isolation in every backend query.** Always scope by `weddingId` derived from the authenticated session, never from client-supplied data.
7. **Never store raw invitation tokens.** Store only the hash. The raw token exists only in the email and in the URL when the guest opens it.
8. **Gallery access requires a valid invitation token, not just the wedding slug.** Enforce this at the API level.
9. **Do not modify `docs/PRD.doc`, `docs/SDD.doc`, `docs/DBDD.doc`, or `docs/API-DD.doc`.** These are read-only source documents.

### 9.3 After Development Work

10. **Update this progress document after meaningful development work.** Add new milestones with accurate dates, update feature statuses, and record verified environment checks.
11. **Record implementation status and testing status separately.** A feature is not complete until both implementation and testing are confirmed.
12. **Never mark a feature as complete without evidence.** "In Progress" or "Not Started" is always acceptable when uncertain.
13. **Record issues as they arise.** Include the date discovered, a description, the root cause, and the resolution or current workaround.

### 9.4 When Specifications Conflict

14. **Preserve existing requirements and ask for clarification when specifications conflict.** Do not silently choose one interpretation. Record the conflict and the agreed resolution in this document and in `PROJECT_OVERVIEW.md`.
15. **Where source documents disagree, later technical documents (SDD v1.2, DBDD v1.0, API-DD v1.0) supersede PRD v1.0.** This is documented in `README.md` under "Specification Precedence."
