# Make My Marriage — Development Progress & Handover Record

> **Document Type:** Living Implementation Tracker & Engineering Handover Record  
> **Target Audience:** Future Developers and Engineering Teams joining Make My Marriage  
> **Last Updated:** 2026-10-30  
> **Current Baseline:** Dev Branch (Full-Stack Auth & Wedding Onboarding Wizard Verified)

---

## Table of Contents

1. [Development Summary](#1-development-summary)
2. [Feature Implementation Matrix](#2-feature-implementation-matrix)
3. [Completed Work](#3-completed-work)
4. [Current Work in Progress](#4-current-work-in-progress)
5. [Pending Features and Tasks](#5-pending-features-and-tasks)
6. [Prioritized Next Tasks](#6-prioritized-next-tasks)
7. [Testing and Validation Status](#7-testing-and-validation-status)
8. [Known Issues and Blockers](#8-known-issues-and-blockers)
9. [Infrastructure and Deployment Readiness](#9-infrastructure-and-deployment-readiness)
10. [Recommended Next Development Session](#10-recommended-next-development-session)
11. [Progress Update Rules](#11-progress-update-rules)

---

## 1. Development Summary

| Metric / Dimension | Current Verified State |
|---|---|
| **Current Stage** | **Phase 2.5 — Wedding Onboarding Wizard & Experience Flow (Completed)** |
| **Next Recommended Stage** | **Phase 3 — Platform Administration & Wedding Provisioning Backend Sync** |
| **Overall Implementation Status** | Foundational full-stack architecture is established, verified, and operational locally. Backend authentication APIs (`/register`, `/login`, `/me`, `/logout`), PBKDF2 cryptography, HMAC signed session tokens, and MongoDB Atlas connectivity are fully functional. The frontend features haute couture split-screen editorial pages for landing, login, and registration, plus a comprehensive 5-step Wedding Onboarding Wizard (`/onboarding`) with live companion preview, draft auto-saving, and reactive preview synchronization. Authentication is integrated with local token/user persistence and post-login redirection into the onboarding flow. |
| **Major Completed Milestones** | • Multi-tenant technical specifications approved and converted to Markdown (`docs/`).<br>• Next.js 15 App Router scaffolding with design tokens and Google Font optimization.<br>• FastAPI async application factory with CORS middleware and health endpoint.<br>• MongoDB Atlas live connection verified with index initialization and environment-guarded demo seeding.<br>• PBKDF2-HMAC-SHA256 password hashing (600,000 iterations) and HMAC session token cryptography.<br>• Full-stack authentication integration verified across API and client forms.<br>• **Bespoke Wedding Onboarding Wizard (`/onboarding`)** implemented with 5 progressive steps (Essential Details, Couple Dossier, Soirée Events, Villa & Map, Review & Publish) and draft persistence in `localStorage`.<br>• **Live Companion Preview Card** featuring real-time reactive updates, monogram crest generation, countdown days calculation, and guest-view simulation.<br>• **Auth & Navigation Integration:** Post-login routing transitions users directly to `/onboarding`, homepage CTA buttons ("Set Up Wedding", "Launch Atelier Wizard"), and signup/login token preservation in `localStorage`.<br>• **Universal CSS Input Protections:** Form layout enhancements in `globals.css` guaranteeing input padding override protections and decorative icon layering.<br>• Automated test suite passing with 10/10 pytest tests, 0 ESLint warnings, and verified Next.js production build (`npm run build`). |
| **Critical Blockers** | • **Dashboard Routes Missing:** Frontend `/login` now routes to `/onboarding`. Dedicated `/admin` and `/dashboard` operational shells are needed to manage the wedding post-creation.<br>• **Onboarding Backend Persistence Sync:** Wedding creation currently persists locally in `mmm_published_wedding` and `mmm_onboarding_draft`; awaiting backend wedding provisioning endpoint (`POST /api/v1/admin/weddings` or `POST /api/v1/weddings`) for live Atlas storage.<br>• **External Service Credentials:** Resend (email invitations) and Google Cloud Storage (private photo gallery) have no active API keys or buckets configured in the local development environment. |
| **Next Milestone Focus** | Implement wedding creation backend API (`POST /api/v1/admin/weddings` / `POST /api/v1/weddings`) to persist the onboarding payload to MongoDB Atlas, and build `/dashboard` and `/admin` operational shells. |

---

## 2. Feature Implementation Matrix

> **Status Definitions:**
> - **Completed:** Implemented, functionally integrated, and verified with tests or live execution.
> - **Partially Implemented:** Functional implementation exists, but integrations, dependent UI, or sub-flows remain incomplete.
> - **In Progress:** Actively under engineering development.
> - **Not Started:** Designed in specifications (`PRD.md`, `SDD.md`, `API-DD.md`) but no codebase implementation exists.
> - **Blocked:** Cannot proceed until upstream dependencies or credentials are provided.
> - **Not Applicable:** Explicitly excluded from the approved V1 release scope.
> - **Needs Verification:** Evidence is currently insufficient to confirm operational status.

| Feature | Intended Behavior | Status | Evidence / File Paths | Remaining Work | Acceptance Criteria |
|---|---|---|---|---|---|
| **Landing Page** | Editorial public landing page showcasing brand aesthetic, live preview, feature grid, and navigation links. | **Completed** | [frontend/src/app/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/page.tsx) | None for initial MVP. | Page renders responsively on port 3000 with interactive links to `/login`, `/signup`, and `/onboarding`. |
| **Login Page** | Luxury split-screen login page with form validation, quick demo aids, unified access, and session caching. | **Completed** | [frontend/src/app/login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx) | Route to role-specific `/admin` or `/dashboard` once operational hubs exist. | Submitting valid credentials sets `session_token` cookie, caches user in `localStorage`, and routes to `/onboarding`. |
| **Sign-up Page** | Self-service registration for Marrying Couples and Wedding Planners with account type selection and terms consent. | **Completed** | [frontend/src/app/signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx) | Direct post-signup redirect to onboarding. | Valid submission creates user in MongoDB Atlas, caches session, and routes to `/login`. |
| **Wedding Onboarding Wizard** | 5-step haute atelier wizard with progress stepper, step validation, live companion preview, sub-event scheduler, and draft auto-saving. | **Completed** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx), [frontend/src/app/globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css) | Wire publication payload to backend persistence API. | Users navigate all 5 steps, add sub-events, auto-save drafts, view live companion preview, and trigger publish modal. |
| **Live Companion Preview** | Real-time reactive card preview updating couple monogram, wedding date pill, countdown days, and editorial visual. | **Completed** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) | None for wizard preview. | Form input changes immediately reflect in the sticky companion card on desktop and mobile viewports. |
| **Form Validation** | Pre-flight regex checking for email format, password complexity rules, required fields, and step validation. | **Completed** | [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx), [signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx), [onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx), [backend/app/schemas/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/auth.py) | Form validation for upcoming backend wedding creation schema. | Client-side inline banners and backend `HTTP 422 Unprocessable Entity` responses function predictably. |
| **Authentication Integration** | Full-stack handshake connecting frontend fetch calls to FastAPI auth endpoints with cookie exchange and local caching. | **Completed** | [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx), [signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx), [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py) | Protected dashboard route guards. | Credentials submitted via UI successfully authenticate against MongoDB Atlas via FastAPI. |
| **Session Management & Logout** | Stateful session tracking via signed HMAC tokens, HTTP-only cookies, `/me` profile retrieval, and cookie deletion on logout. | **Completed** | [backend/app/core/security.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/core/security.py), [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py) | Frontend logout button in dashboard and onboarding headers. | `/api/v1/auth/me` returns current user doc; `/api/v1/auth/logout` clears `session_token` cookie. |
| **Wedding Creation & Setup** | Provisioning wedding records (couple names, slug, date, venue, coordinates, events) and assigning managers. | **Partially Implemented** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx); designed in `API-DD.md` | Build `POST /api/v1/admin/weddings` and connect `handlePublish` in onboarding. | Wedding records created with unique slug index enforcement. |
| **Event Planning & Schedules** | Sub-event management (Haldi, Mehendi, Sangeet, Ceremony, Reception) with times, location, and dress code. | **Partially Implemented** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) (Step 3 Soirée Events) | Build backend `events` CRUD endpoints and manager schedule UI. | Manager can add/edit events; public events display on the public wedding page. |
| **Platform Admin Dashboard** | High-level overview of platform weddings, manager accounts, and platform health. | **Not Started** | Designed in `API-DD.md` Section 3; no frontend route | Build `/admin` route and `/api/v1/admin/*` endpoints. | Super-admin can view total weddings, system status, and manage manager accounts. |
| **Manager Dashboard** | Wedding operational center displaying guest RSVPs, task checklists, and event timelines. | **Not Started** | Designed in `API-DD.md` Section 4; no frontend route | Build `/dashboard` route and `/api/v1/weddings/{id}/dashboard` API. | Authenticated manager views metrics strictly scoped to their assigned `weddingId`. |
| **Public Wedding Website** | Guest-facing portal at `/w/[slug]` displaying couple welcome message, venue details, and schedules. | **Not Started** | Route not yet created | Build dynamic App Router segment `frontend/src/app/w/[slug]/page.tsx` and public API. | Public visitors view published wedding details without logging in. |
| **Task Planner** | Checklist tracker with priority levels (`low`, `med`, `high`), due dates, statuses, and assignees. | **Not Started** | Designed in `API-DD.md` Section 4 | Build `tasks` CRUD endpoints and dashboard UI. | Manager can toggle task completion and filter by priority. |
| **Guest Management** | Contact directory for guests with email, phone, and invitation tracking status. | **Not Started** | Designed in `API-DD.md` Section 4 | Build `guests` CRUD endpoints and manager table UI. | Guest list is searchable and private; never exposed to unauthenticated users. |
| **Digital Invitations** | Dispatching personalized invitation emails containing secure single-use invitation tokens via Resend. | **Blocked** | Resend API key and client not configured | Configure Resend, author email templates, build invitation sending endpoint. | Manager can trigger invitations; guest receives email with unique link. |
| **Invitation Token Handling** | Cryptographic token generation, SHA-256 hashing before persistence, and URL validation. | **Not Started** | Security model approved in `SDD.md` | Implement token hashing and validation endpoints. | Backend validates token hash and rejects revoked or expired tokens. |
| **RSVP Workflow** | One-click Yes/No response submission via token link without requiring guest login. | **Not Started** | Route `w/[slug]/invite/[token]` not yet created | Build RSVP landing route and upsert API (`POST /api/v1/invitations/rsvp`). | Guest submits attendance response; RSVP record is upserted and dashboard counts update. |
| **QR Code Generation** | Dynamic QR code directing guests to the public wedding website URL. | **Not Started** | Endpoint designed in `API-DD.md` Section 5 | Select QR library (e.g. `qrcode` in Python) and build endpoint. | `GET /api/v1/public/weddings/{slug}/qr` returns valid PNG QR code image. |
| **Private Gallery & Albums** | Album-organized photo displays restricted strictly to authorized guests holding valid tokens. | **Not Started** | Route not yet created | Build gallery UI and authorization token check. | Accessing `/w/[slug]/gallery` without a valid token returns an authorization prompt. |
| **Photo Upload & Retrieval** | Direct-to-GCS upload via signed URLs and secure retrieval via short-lived download URLs. | **Blocked** | GCS bucket and service account credentials not configured | Provision bucket, install `google-cloud-storage`, build signed URL endpoints. | High-res photos upload directly to GCS without passing through backend memory. |
| **Livestream Information** | Configuration and public display of external livestream link (e.g., YouTube Live). | **Not Started** | Schema approved in `DBDD.md` | Build livestream settings form in manager dashboard. | When enabled, public wedding page displays prominent stream link. |
| **Notifications & Reminders** | Email reminders sent to non-responding guests prior to RSVP deadlines. | **Blocked** | Depends on Resend integration | Build reminder dispatch API and notification history logging. | Manager can trigger reminders to filtered unconfirmed guest lists. |
| **Backend APIs** | Asynchronous REST endpoints organized under `/api/v1` with Pydantic validation. | **Partially Implemented** | [backend/app/main.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/main.py), [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py) | Remaining resource routers (admin, weddings, public, invitations). | All active endpoints return standardized JSON schemas and appear in Swagger UI. |
| **Database Integration** | Asynchronous MongoDB Atlas communication with connection pooling, indexes, and models. | **Completed** | [backend/app/db/session.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/db/session.py) | Add indexes for upcoming collections (`weddings`, `events`, `invitations`). | Database pings successfully; `users` collection persists records with unique email index. |
| **Error Handling** | Standardized JSON error envelopes, HTTP exception mapping, and friendly UI error banners. | **Completed** | [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py), [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx) | Global FastAPI exception handler middleware. | API errors return clear, descriptive error details without leaking stack traces. |
| **Responsive Design & Accessibility** | Mobile-first layouts, semantic HTML, ARIA attributes, and high-contrast editorial styling. | **Completed** | [globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css), [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx), [onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) | Apply same standards to future dashboard components. | All existing pages adapt smoothly from 375px mobile viewports to ultra-wide displays. |
| **Automated Tests** | Unit tests, schema checks, health checks, and linting suites. | **Partially Implemented** | [backend/tests/](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/) (10 tests passing); [frontend/eslint.config.mjs](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/eslint.config.mjs) | Frontend component tests, live DB integration tests, and E2E browser tests. | `pytest` and `npm run lint` execute cleanly with 0 errors. |
| **Deployment Configuration** | Cloud Run containerization, custom domain DNS, CDN, and production TLS. | **Not Started** | Proposed in `SDD.md` Section 9 | Dockerfiles, Cloud Build configurations, and domain mapping. | Automated CI/CD deploys frontend and backend containers to production. |
| **Expense Tracker** | Expense tracking and budget allocation module. | **Not Applicable** | Documented in `DBDD.md`; excluded from V1 UI | None for V1 release. | Feature remains strictly excluded from V1 release scope. |

---

## 3. Completed Work

The following items have been fully implemented, verified, and checked into the repository:

### 3.1 Backend Authentication & Security Subsystem
- **FastAPI Lifespan & App Factory:** Configured in [backend/app/main.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/main.py) with CORS middleware, interactive Swagger documentation (`/api/docs`), and health endpoint (`/api/v1/health`).
- **Configuration Management:** [backend/app/core/config.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/core/config.py) validates required environment variables at boot using Pydantic Settings.
- **OWASP-Compliant Password Cryptography:** [backend/app/core/security.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/core/security.py) implements PBKDF2-HMAC-SHA256 with 600,000 iterations and 16-byte random salt, complete with constant-time verification.
- **Signed Session Token Cryptography:** Implements `<user_id>.<timestamp>.<signature>` using HMAC-SHA256, protecting against payload tampering and supporting configurable expirations.
- **Authentication Endpoints:**
  - `POST /api/v1/auth/register`: Validates email and password, creates user in MongoDB Atlas, and issues session cookie.
  - `POST /api/v1/auth/login`: Verifies credentials, updates `lastLoginAt`, and issues session cookie.
  - `GET /api/v1/auth/me`: Resolves user profile from `session_token` cookie or `Authorization: Bearer` header.
  - `POST /api/v1/auth/logout`: Invalidates session and clears cookie.
- **Database Connection & Demo Seeding:** [backend/app/db/session.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/db/session.py) connects to MongoDB Atlas using `pymongo.AsyncMongoClient`, establishes a unique index on `email`, and seeds demo accounts in non-production environments.

### 3.2 Frontend Editorial Pages & Brand Identity
- **Design Token System:** [frontend/src/app/globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css) and [tailwind.config.js](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/tailwind.config.js) establish brand tokens for gold, burgundy, surface, and charcoal.
- **Typography Integration:** [frontend/src/app/layout.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/layout.tsx) configures `next/font/google` for `Cinzel`, `Playfair Display`, and `Plus Jakarta Sans`.
- **Editorial Landing Page:** [frontend/src/app/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/page.tsx) renders the platform showcase with responsive cards, direct links to `/login` and `/signup`, and prominent call-to-actions linking to `/onboarding`.
- **Split-Screen Atelier Login Portal:** [frontend/src/app/login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx) features pre-set demo credential buttons, client validation, animated loading states, full API integration, `localStorage` session caching, and immediate transition to `/onboarding`.
- **Split-Screen Registration Portal:** [frontend/src/app/signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx) provides role selection between `couple` and `planner`, validation for password complexity, terms consent, and `localStorage` session caching.
- **Centralized Constants:** [frontend/src/lib/constants.ts](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/lib/constants.ts) centralizes `API_BASE_URL` with environment override support.

### 3.3 Wedding Onboarding Wizard & Live Companion Experience
- **5-Step Interactive Atelier Creation Stepper:** [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx)
  - **Step 01 — Wedding Details:** Collects website title, partner full names, celebration date, sanitized custom vanity URL slug, and couple welcome story.
  - **Step 02 — Couple Dossier:** Captures partner roles, verified email addresses, personal bios, and the commemorative "How We Met" narrative.
  - **Step 03 — Soirée Events:** Interactive schedule management allowing couples to schedule multiple sub-events (e.g. Haldi, Sangeet, Ceremony, Reception) with times, location, and dress code via a modal form.
  - **Step 04 — Villa & Map Logistics:** Provisions venue name, street address, city, country, timezone, GPS coordinates, transportation arrival logistics, and accommodation notes.
  - **Step 05 — Review & Publish:** Consolidated dossier audit cards with quick-edit links to previous steps, formal readiness validation, and a publication success modal with copyable public URL.
- **Sticky Live Companion Preview Card ("Guest View"):**
  - Real-time reactive updates directly mirroring form inputs onto a mobile/desktop guest card overlay.
  - Dynamic monogram crest calculation (e.g., "S&J") based on entered partner names.
  - Timezone-safe days remaining countdown calculator.
  - Reactive hero photo layout, destination city tag, and wedding date pill.
  - Vanity URL copy-to-clipboard action with visual toast notification.
- **Client-Side State & Draft Persistence:**
  - Auto-saves draft state to `localStorage` (`mmm_onboarding_draft`) with timestamp tracking and user confirmation toast.
  - Automatic hydration on initial mount: hydrates from existing draft or pre-fills from logged-in user profile (`mmm_user`).
  - Two-tier validation: per-step boundary validation and comprehensive all-step validation on publish with automatic redirection to the first invalid step.
- **Universal Form Styling Enhancements:**
  - [frontend/src/app/globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css) enforces universal padding override rules for inputs with leading/trailing icons (`pl-10`, `pl-11`, `pl-12`) and layers decorative icons properly.

---

## 4. Current Work in Progress

| Work Item | Intended Outcome | Current Status | Dependencies / Blockers |
|---|---|---|---|
| **Onboarding Backend Persistence Sync** | Persist the completed onboarding payload from `handlePublish` into MongoDB Atlas via backend API. | Frontend completes wizard and saves to `mmm_published_wedding` in `localStorage`; backend endpoint pending. | Blocked by missing `POST /api/v1/admin/weddings` or `POST /api/v1/weddings` endpoint. |
| **Post-Login Role Redirection** | Direct authenticated users to their corresponding dashboard (`/admin` for admin, `/dashboard` for existing weddings, `/onboarding` for new setups). | Login routes to `/onboarding` as an immediate onboarding flow. | Blocked by missing `/admin` and `/dashboard` frontend page routes. |
| **Protected Route Middleware** | Frontend Next.js middleware checking `session_token` cookie before allowing access to `/onboarding`, `/admin`, and `/dashboard`. | Auth endpoints exist in backend; Next.js middleware file not yet created. | Needs dashboard route shells to protect. |

---

## 5. Pending Features and Tasks

The remaining work is organized into 5 sequential development phases:

### Phase 1 — Foundation and Authentication Follow-ups
- [ ] Create Next.js route protection middleware (`frontend/src/middleware.ts`) to intercept unauthenticated requests to `/onboarding`, `/admin`, and `/dashboard`.
- [ ] Build shared navigation header component with active user profile badge and logout button.
- [ ] Add backend role-verification dependencies (`require_admin`, `require_manager`).

### Phase 2 — Wedding and Manager Workflows
- [x] Implement 5-step Wedding Onboarding Wizard frontend (`frontend/src/app/onboarding/page.tsx`).
- [ ] Implement Platform Administrator & Wedding Creation endpoints:
  - `POST /api/v1/admin/weddings`: Provision new wedding records from onboarding payload.
  - `GET /api/v1/admin/weddings`: List platform weddings with manager assignments.
  - `POST /api/v1/admin/managers`: Onboard wedding managers.
- [ ] Connect `handlePublish` in `frontend/src/app/onboarding/page.tsx` to `POST /api/v1/admin/weddings` or `POST /api/v1/weddings`.
- [ ] Build `/admin` dashboard frontend interface.
- [ ] Implement Wedding Manager endpoints:
  - `GET /api/v1/weddings/{id}/dashboard`: Aggregate summary metrics.
  - `PATCH /api/v1/weddings/{id}`: Update wedding details and venue information.
- [ ] Build `/dashboard` manager frontend interface.
- [ ] Implement Event Management CRUD endpoints (`/api/v1/weddings/{id}/events`).
- [ ] Implement Task Planner CRUD endpoints (`/api/v1/weddings/{id}/tasks`).

### Phase 3 — Guest and Invitation Workflows
- [ ] Implement Guest Management CRUD endpoints (`/api/v1/weddings/{id}/guests`).
- [ ] Build guest directory UI inside manager dashboard (search, filter, pagination).
- [ ] Configure Resend email service integration (`backend/app/services/email.py`).
- [ ] Implement cryptographic invitation token generation and SHA-256 storage (`invitations` collection).
- [ ] Implement invitation dispatch endpoint (`POST /api/v1/weddings/{id}/invitations`).
- [ ] Build Guest RSVP landing route (`frontend/src/app/w/[slug]/invite/[token]/page.tsx`).
- [ ] Implement token validation (`GET /api/v1/invitations/validate`) and RSVP submission (`POST /api/v1/invitations/rsvp`).

### Phase 4 — Public Wedding Website and Gallery
- [ ] Build public wedding showcase route (`frontend/src/app/w/[slug]/page.tsx`).
- [ ] Implement public wedding details endpoint (`GET /api/v1/public/weddings/{slug}`).
- [ ] Implement dynamic QR code generator endpoint (`GET /api/v1/public/weddings/{slug}/qr`).
- [ ] Provision Google Cloud Storage bucket and configure service account credentials.
- [ ] Implement photo upload flow (pre-signed GCS upload URL and metadata registration).
- [ ] Build token-authorized private photo gallery (`frontend/src/app/w/[slug]/gallery/page.tsx`).
- [ ] Implement short-lived signed GCS download URL generator for authorized guests.

### Phase 5 — Testing and Production Readiness
- [ ] Add integration tests for all backend routes using an isolated test database.
- [ ] Add frontend component tests and end-to-end user journey tests (e.g., Playwright).
- [ ] Conduct security audit on token verification and data isolation boundaries.
- [ ] Author production Dockerfiles for frontend and backend.
- [ ] Set up Google Cloud Run deployment pipeline via GitHub Actions.

---

## 6. Prioritized Next Tasks

| Priority | Task Name | Why Needed | Prerequisite | Expected Outcome | Acceptance Criteria | Relevant Files |
|---|---|---|---|---|---|---|
| **P0** | **Wedding Creation Backend API** | Connects the completed `/onboarding` wizard to persistent storage in MongoDB Atlas. | Onboarding Wizard (Completed), Auth module (Completed) | `POST /api/v1/admin/weddings` or `POST /api/v1/weddings` provisions wedding records. | Endpoint accepts couple names, date, slug, venue, and sub-events; inserts doc into `weddings` collection. | `backend/app/api/v1/admin.py`, `backend/app/schemas/wedding.py` |
| **P0** | **Connect Onboarding Publish to Backend** | Enables couples to persist their onboarding dossier beyond browser `localStorage`. | Wedding Creation API | `handlePublish` in `/onboarding/page.tsx` submits payload to API and navigates to manager dashboard. | Successfully published wedding generates MongoDB record and opens `/dashboard` or `/w/[slug]`. | `frontend/src/app/onboarding/page.tsx` |
| **P0** | **Manager Dashboard Shell Route** | Provides operational container for couples and managers after completing onboarding. | Login & Onboarding (Completed) | Frontend route `/dashboard` renders authenticated manager shell. | Accessing `/dashboard` when authenticated displays welcome card, stats, and sign-out button. | `frontend/src/app/dashboard/page.tsx` |
| **P0** | **Platform Admin Shell Route** | Provides landing view for super-administrators to manage platform weddings. | Login page (Completed) | Frontend route `/admin` renders admin interface. | Admin users can log in and view platform management controls. | `frontend/src/app/admin/page.tsx` |
| **P1** | **Public Wedding Route (`/w/[slug]`)** | Enables guests and couples to view the published wedding website. | Wedding Creation API | Public route renders couple names, dates, schedule, and venue details without authentication. | Navigating to `/w/[slug]` returns HTTP 200 with formatted wedding details. | `frontend/src/app/w/[slug]/page.tsx`, `backend/app/api/v1/public.py` |
| **P2** | **Event Management CRUD** | Allows managers to manage sub-events after the initial onboarding wizard. | Wedding Creation API | Endpoints and UI to create, update, and list sub-events. | Events persist in `events` collection and appear on public wedding page if `isPublic=true`. | `backend/app/api/v1/events.py`, `frontend/src/app/dashboard/events/` |
| **P2** | **Guest List Management** | Allows managers to build and curate their guest roster. | Manager Dashboard | Endpoints and UI to add, import, and edit guest records. | Guests persist in `guests` collection scoped to `weddingId`. | `backend/app/api/v1/guests.py`, `frontend/src/app/dashboard/guests/` |

---

## 7. Testing and Validation Status

### 7.1 Automated Test Execution Summary (Verified)

| Test Suite | Location | Tests Executed | Passed | Failed | Notes |
|---|---|---|---|---|---|
| **Backend Health Check** | [backend/tests/test_health.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_health.py) | 1 | 1 | 0 | Confirmed `GET /api/v1/health` returns `{"status":"ok"}`. |
| **Password Cryptography** | [backend/tests/test_security.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_security.py) | 5 | 5 | 0 | Tested PBKDF2 hash format, verification, invalid hash handling, HMAC token creation, tamper detection, and expiration. |
| **Auth Schema Validation** | [backend/tests/test_auth_schemas.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_auth_schemas.py) | 4 | 4 | 0 | Validated registration schemas, password min-length rules, login models, and serialization. |
| **Frontend Code Quality** | `frontend/eslint.config.mjs` | Full repository | Passed | 0 | `npm run lint` reported 0 errors and 0 warnings. |

### 7.2 Live Verification Results
- **MongoDB Atlas Ping:** Verified live via `AsyncMongoClient.admin.command('ping')` resulting in `{'ok': 1}`.
- **Port Liveness:**
  - Next.js: Active on port 3000 (HTTP 200 on `/`, `/login`, `/signup`, `/onboarding`).
  - FastAPI: Active on port 8000 (`{"status":"ok"}` on `/api/v1/health`).
- **Production Build:** `npm run build` executed successfully with 7 static routes compiled (including `/onboarding` at 12.3 kB size / 123 kB First Load JS).

### 7.3 Testing Gaps
- **No Frontend Automated Tests:** Jest, Vitest, and React Testing Library are not currently installed or configured.
- **No Live DB Integration Tests:** Existing pytest tests use mocks or in-memory fixtures; integration tests executing full HTTP round-trips against MongoDB Atlas remain to be written.
- **No End-to-End (E2E) Browser Tests:** Automated browser journeys (e.g. Playwright) for user registration through onboarding are not yet established.

---

## 8. Known Issues and Blockers

| Issue ID | Description | Impact | Reproduction Steps | Suggested Next Action | Status |
|---|---|---|---|---|---|
| **ISSUE-001** | Running `pytest` from repository root fails with Pydantic validation error (`mongodb_uri missing`). | Developers running `pytest backend/tests` from root encounter test abort. | Run `pytest` from repository root. Root directory lacks `.env`, causing `app.core.config.Settings` to fail. | Run `pytest` from within the `backend/` directory, or configure `pytest.ini` with `env_files = backend/.env`. | **Confirmed (Workaround available)** |
| **ISSUE-002** | Login page redirects to `/onboarding` by default rather than role-specific destination. | All authenticated users are directed to the onboarding wizard regardless of account role or existing wedding state. | Sign in at `http://localhost:3000/login` with any credentials. | Create `/dashboard` and `/admin` routes and branch `router.push()` based on user role and existing wedding status. | **Updated (Redirect to `/` resolved)** |
| **BLOCKER-001** | GCS Bucket credentials missing. | Photo upload and private gallery signed URL features cannot be executed locally. | Attempting to call GCS SDK fails due to missing service account JSON. | Provision development GCS bucket and configure `GOOGLE_APPLICATION_CREDENTIALS`. | **Confirmed Blocker** |
| **BLOCKER-002** | Resend API key missing. | Digital invitations cannot be dispatched via email. | Attempting to send invitations fails. | Obtain development API key from Resend and configure `RESEND_API_KEY` in `backend/.env`. | **Confirmed Blocker** |

---

## 9. Infrastructure and Deployment Readiness

| Infrastructure Component | Current Environment State | Production Deployment State |
|---|---|---|
| **Database** | **Configured & Verified:** MongoDB Atlas cluster (`make-my-marriage-cluste.q54gv5h.mongodb.net`, db: `make-my-marriage-dev`) | **Planned:** Atlas dedicated cluster with automated backups and VPC peering |
| **Backend Server** | **Active Locally:** Uvicorn dev server running on port 8000 | **Planned:** Google Cloud Run serverless container runtime |
| **Frontend Server** | **Active Locally:** Next.js dev server running on port 3000 | **Planned:** Google Cloud Run or Google Cloud VM container |
| **Environment Configuration** | **Configured:** Local `.env` and `.env.local` files present | **Planned:** Google Cloud Secret Manager |
| **Media Storage** | **Not Configured:** GCS bucket not yet provisioned | **Planned:** Private Google Cloud Storage bucket with signed URL policies |
| **Domain & HTTPS** | **Local Development:** `http://localhost` | **Planned:** Custom domain with automated Cloud Managed TLS |
| **CI/CD Automation** | **Not Configured:** Local manual git commits | **Planned:** GitHub Actions pipeline running lint, pytest, and container deploy |
| **Monitoring & Logging** | **Console Output Only:** Uvicorn and Next.js terminal logs | **Planned:** Google Cloud Logging and Error Reporting |

---

## 10. Recommended Next Development Session

To maintain velocity and preserve technical alignment, the next engineering session should execute these 5 tasks in strict dependency order:

1. **Task 1 — Implement Wedding Creation Backend API:**
   - Create `backend/app/schemas/wedding.py` defining `WeddingCreate` (with fields corresponding to the onboarding payload: couple names, slug, date, venue, events) and `WeddingPublic`.
   - Create `backend/app/api/v1/admin.py` (or `weddings.py`) with `POST /api/v1/admin/weddings` to insert wedding documents into MongoDB with unique slug validation.
   - Mount router in `backend/app/main.py`.

2. **Task 2 — Connect Onboarding Wizard Publish to Backend API:**
   - In `frontend/src/app/onboarding/page.tsx`, update `handlePublish` to send the complete onboarding payload to the newly created wedding creation endpoint.
   - Transition to `/dashboard` upon successful creation.

3. **Task 3 — Create Manager Dashboard Shell Route:**
   - Create `frontend/src/app/dashboard/page.tsx` with high-level summary cards (Guests, RSVPs, Events, Tasks) and sign-out button.
   - Ensure the layout adheres to the existing Atelier theme tokens (`Cinzel`, burgundy, gold).

4. **Task 4 — Create Platform Admin Shell Route:**
   - Create `frontend/src/app/admin/page.tsx` displaying platform metrics and wedding provisioning overview.

5. **Task 5 — Build Dynamic Public Wedding Route:**
   - Create `frontend/src/app/w/[slug]/page.tsx` and `backend/app/api/v1/public.py` (`GET /api/v1/public/weddings/{slug}`).
   - Verify public visitors can view couple names, sub-events, and wedding dates without logging in.

---

## 11. Progress Update Rules

Future engineers and AI assistants must follow these rules when updating this document:

1. **Update After Every Feature:** Update the feature matrix, milestones, and backlog whenever code is merged or verified.
2. **Never Mark Complete Without Evidence:** A feature is only *Completed* when both implementation and automated/manual testing have passed. Provide exact file paths as evidence.
3. **Record All New Blockers:** Document external service requirements, API key gaps, or breaking changes immediately under Section 8.
4. **Preserve Specification Scope:** Respect confirmed deferred items (No guest accounts, No SMS/OTP in V1, No Expense Tracker UI in V1). Do not change approved architecture specifications without explicit owner consent.
5. **Keep Overview Document Distinct:** Maintain `PROJECT_OVERVIEW.md` as the high-level architectural reference, and use `DEVELOPMENT_PROGRESS.md` as the living progress tracker.

