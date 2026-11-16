# Make My Marriage — Development Progress & Handover Record

> **Document Type:** Living Implementation Tracker & Engineering Handover Record  
> **Target Audience:** Future Developers and Engineering Teams joining Make My Marriage  
> **Last Updated:** 2026-11-16  
> **Current Baseline:** Dev Branch (Full-Stack Auth, Onboarding & Database Persistence, Manager Dashboard with In-Place Tab Navigation, Event Lifecycle Management, Resend Invitations & Reminder Dispatcher, Public Wedding Route & RSVP Portal Verified)

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
| **Current Stage** | **Phase 4.1 — Manager Dashboard Suite, Event Lifecycle Management & Public RSVP Integration (Completed)** |
| **Next Recommended Stage** | **Phase 4.2 — Dynamic QR Code Generator, Private Gallery & Cloud Media Storage (GCS)** |
| **Overall Implementation Status** | Foundational and operational full-stack architecture is established, verified, and operational locally. Backend authentication APIs (`/register`, `/login`, `/me`, `/logout`, `/password-reset/request`, `/password-reset/confirm`), PBKDF2 cryptography, HMAC signed session tokens, SHA-256 password reset tokens with single-use expiry, and MongoDB Atlas connectivity are fully functional. The frontend features a reactive global `AuthContext` with automatic session hydration, dynamic session-aware headers with persistent `Logout` buttons across all pages, dedicated split-screen password recovery flows (`/forgot-password` and `/forgot-password/reset`), and a comprehensive 5-step Wedding Onboarding Wizard (`/onboarding`) with full backend MongoDB Atlas persistence.<br><br>The **Manager Dashboard (`/dashboard`)** has been transformed with Google Stitch haute couture aesthetics, in-place non-navigating tab routing (`Dashboard Overview`, `Wedding Details`, `Event Planner`, `Guest Management`, `Invitations & RSVP`, `Settings`), real-time data synchronization between sub-tabs and parent dashboard overview cards, and full CRUD event management (`POST/PATCH/DELETE /api/v1/weddings/{id}/events`).<br><br>The **Public Wedding Route (`/w/[slug]`)** and **Guest RSVP Landing Portal (`/w/[slug]/invite/[token]`)** are fully operational with live token validation, attendance submission (`yes`/`no`), dietary notes, automatic guest and wedding stats synchronization, and seamless post-RSVP onboarding for guests who wish to create an Atelier account. |
| **Major Completed Milestones** | • Multi-tenant technical specifications approved and converted to Markdown (`docs/`).<br>• Next.js 15 App Router scaffolding with design tokens, Google Stitch couture CSS, and Google Font optimization.<br>• FastAPI async application factory with CORS middleware, health endpoint, and MongoDB Atlas connection.<br>• PBKDF2-HMAC-SHA256 password hashing (600,000 iterations) and HMAC session token cryptography.<br>• **Full-Stack Password Recovery Subsystem:** Secure email-based reset protocol with timing-safe enumeration protections, single-use SHA-256 hashed 15-minute expiration tokens (`password_resets` collection with TTL indexes), and interactive split-screen recovery UI.<br>• **Global Authentication Context (`AuthContext`):** React Context wrapping application tree with hydration from `localStorage` (`mmm_user`) and validation via `GET /api/v1/auth/me`.<br>• **Bespoke Wedding Onboarding Wizard (`/onboarding`)** implemented with 5 progressive steps, live companion preview, draft persistence, and live backend creation via `POST /api/v1/weddings`.<br>• **Haute Atelier Manager Dashboard (`/dashboard`):** Unified executive dashboard with live countdown to vows, dynamic attendance & quota bars, real-time Live Feed RSVP activity, couture budget tracker, and sticky sidebar.<br>• **In-Place Tab Routing & Real-Time Sync:** Responsive sidebar navigating between `Wedding Details`, `Guest Management`, `Invitations & RSVP`, and `Settings` within the right-hand panel without page reload, with independent active states and child-to-parent state synchronization.<br>• **Event Lifecycle Management:** Full CRUD sub-event itinerary engine (`/api/v1/weddings/{id}/events`) with modal creation/editing, primary event badges, dress codes, timing, and instant itinerary updates.<br>• **Full Guest Management Subsystem (`GuestManagementTab`):** Roster listing, live search, contact creation, role allocation (`guest`, `manager`, `admin`), profile editing, status filtering (`pending`, `sent`, `revoked`), and sync with `users` collection.<br>• **Resend Digital Invitation Dispatcher:** Generates cryptographic invitation tokens, formats bespoke Haute Atelier emails via Resend, and logs notification delivery records.<br>• **Multi-Category Reminder Subsystem:** Category switching between *RSVP Response* and *Upcoming Event*, specific event dropdown selection (*Ceremony*, *Sangeet*, *Mehendi*, *Haldi*, *Cocktail*, *Brunch*), custom note composer, and individual guest reminder actions.<br>• **Public Wedding Showcase (`/w/[slug]`):** Public vanity landing page displaying couple welcome story, romantic hero visual, ceremony & reception itinerary cards, venue address, and interactive RSVP CTA.<br>• **Guest RSVP Portal (`/w/[slug]/invite/[token]`):** Single-use cryptographic token consumption endpoint (`/api/v1/public/invitations/{token}`), one-click attendance selection (`yes`/`no`), dietary accommodation input, and instant upsert into `rsvps` and `guests` collections.<br>• Automated test suite passing with 20/20 pytest tests, 0 ESLint warnings, and verified Next.js production build (`npm run build`). |
| **Critical Blockers** | • **External Service Credentials:** Google Cloud Storage (private photo gallery) remains unconfigured for production media. |
| **Next Milestone Focus** | Implement dynamic QR Code generator endpoint (`/api/v1/public/weddings/{slug}/qr`), configure Google Cloud Storage for private media uploads, and build the token-authorized Photo Gallery (`/w/[slug]/gallery`). |

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
| **Login Page** | Luxury split-screen login page with form validation, quick demo aids, unified access, and session caching. | **Completed** | [frontend/src/app/login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx) | Route to role-specific `/admin` or `/dashboard` once operational hubs exist. | Submitting valid credentials sets `session_token` cookie, caches user in `localStorage`, and routes to `/dashboard` or `/onboarding`. |
| **Sign-up Page** | Self-service registration for Marrying Couples and Wedding Planners with account type selection and terms consent. | **Completed** | [frontend/src/app/signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx) | Direct post-signup redirect to onboarding. | Valid submission creates user in MongoDB Atlas, caches session, and routes to `/login`. |
| **Wedding Onboarding Wizard** | 5-step haute atelier wizard with progress stepper, step validation, live companion preview, sub-event scheduler, and draft auto-saving. | **Completed** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx), [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py) | None. | Users navigate all 5 steps, add sub-events, auto-save drafts, view live companion preview, and persist to MongoDB Atlas via `POST /api/v1/weddings`. |
| **Live Companion Preview** | Real-time reactive card preview updating couple monogram, wedding date pill, countdown days, and editorial visual. | **Completed** | [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) | None for wizard preview. | Form input changes immediately reflect in the sticky companion card on desktop and mobile viewports. |
| **Wedding Creation & Setup** | Provisioning wedding records (couple names, slug, date, venue, coordinates, events) and assigning managers in MongoDB Atlas. | **Completed** | [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py), [backend/app/schemas/wedding.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/wedding.py), [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) | None. | Wedding records created with unique slug index enforcement and automatic owner assignment. |
| **Manager Dashboard Shell & Overview** | Executive atelier dashboard with live countdown to vows, attendance progress & quota breakdown, recent RSVP activity feed, budget overview, and quick shortcuts. | **Completed** | [frontend/src/app/dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx), [frontend/src/app/globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css) | None. | Authenticated manager views metrics, countdown timer, attendance progress bars, and recent RSVP events accurately. |
| **In-Place Tab Routing & Content Switching** | Responsive sidebar navigation switching tabs (`Dashboard`, `Wedding Details`, `Event Planner`, `Guest Management`, `Invitations & RSVP`, `Settings`) within the right panel without page reloading. | **Completed** | [frontend/src/app/dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx), [frontend/src/components/dashboard/](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/) | None. | Clicking sidebar items updates right-side content seamlessly without navigation flicker; each item highlights independently. |
| **Wedding Details Tab** | In-place editing of couple partner names, wedding date, venue details, and welcome story with direct PATCH persistence. | **Completed** | [frontend/src/components/dashboard/WeddingDetailsTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/WeddingDetailsTab.tsx), [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py) | None. | Managers edit wedding particulars in-place, save to backend, and sync immediately with dashboard overview. |
| **Event Planning & Schedule Management** | Sub-event management (Haldi, Mehendi, Sangeet, Ceremony, Reception) with times, location, dress code, and full CRUD endpoints. | **Completed** | [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py), [frontend/src/app/dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx) | None. | Managers can add, edit, and delete events via modal; changes persist in MongoDB Atlas and display immediately. |
| **Guest Management & Directory Roster** | Dedicated guest directory management with role allocation (`guest`, `manager`, `admin`), profile updates (phone & role), attendee contact completeness metrics, guest deletion endpoint, and dynamic sync with `users` collection. | **Completed** | [frontend/src/components/dashboard/GuestManagementTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/GuestManagementTab.tsx), [backend/app/api/v1/guests.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/guests.py), [backend/app/schemas/guest.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/guest.py) | None. | Hosts can add, search, update phone/roles, delete guests, and review role breakdown. |
| **Digital Invitations & RSVP Pipeline** | Dedicated digital stationery and RSVP operations tab with live Resend email dispatch, individual & batch invitation triggers, RSVP response tracking (Attending, Regrets, Pending), token re-issuing, and token revocation. | **Completed** | [frontend/src/components/dashboard/InvitationsRsvpTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/InvitationsRsvpTab.tsx), [backend/app/api/v1/invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/invitations.py), [backend/app/services/email.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/services/email.py) | None. | Managers can batch-dispatch invites, view response rates, nudge pending guests, resend, and revoke tokens. |
| **Dashboard URL Tab State & Deep-Linking** | Synchronize active dashboard tabs with browser URL search parameters (`/dashboard?tab=wedding-details`, `?tab=guests`, `?tab=invitations`, `?tab=settings`) with browser history back/forward navigation support. | **Completed** | [frontend/src/app/dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx) | None. | Switching tabs updates the URL dynamically; page reload or deep-link opens directly into that specific tab. |
| **Guest Reminders Dispatcher** | Multi-channel reminder delivery (RSVP response reminders and upcoming event soirée reminders) supporting both individual guest and one-click batch dispatch, with custom courteous messages, token re-hydration, and dispatch audit logs in `notifications`. | **Completed** | [backend/app/api/v1/invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/invitations.py), [backend/app/services/email.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/services/email.py), [frontend/src/components/dashboard/InvitationsRsvpTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/InvitationsRsvpTab.tsx) | None. | Hosts can send custom RSVP or event reminders to specific guests or all unresponded guests with tracking of sent counts and timestamps. |
| **Invitation Token Handling** | Cryptographic token generation, SHA-256 hashing before persistence, and URL validation. | **Completed** | [backend/app/api/v1/invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/invitations.py), [backend/app/api/v1/public_invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/public_invitations.py) | None. | Backend validates token hash, enforces 90-day expiry, and rejects revoked tokens. |
| **Public Wedding Website** | Guest-facing portal at `/w/[slug]` displaying couple welcome message, hero imagery, venue details, and schedules. | **Completed** | [frontend/src/app/w/[slug]/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/w/[slug]/page.tsx), [backend/app/api/v1/public_weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/public_weddings.py) | None. | Public visitors view published wedding details without logging in; responsive editorial layout. |
| **RSVP Workflow & Token Consumption** | One-click Yes/No response submission via token link without requiring guest login, with dietary preferences and live status sync. | **Completed** | [frontend/src/app/w/[slug]/invite/[token]/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/w/[slug]/invite/[token]/page.tsx), [backend/app/api/v1/public_invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/public_invitations.py) | None. | Guest submits attendance response; RSVP record is upserted, guest record updated, and dashboard stats reflect instantly. |
| **Form Validation** | Pre-flight regex checking for email format, password complexity rules, required fields, and step validation. | **Completed** | [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx), [signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx), [onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx), [backend/app/schemas/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/auth.py) | None. | Client-side inline banners and backend `HTTP 422 Unprocessable Entity` responses function predictably. |
| **Authentication Integration** | Full-stack handshake connecting frontend fetch calls to FastAPI auth endpoints with cookie exchange and local caching. | **Completed** | [login/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/login/page.tsx), [signup/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/signup/page.tsx), [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py) | None. | Credentials submitted via UI successfully authenticate against MongoDB Atlas via FastAPI. |
| **Global Auth Context & State Hydration** | React Context (`AuthContext`) managing authentication status across pages, tab-switching, and browser refreshes with `/me` session validation. | **Completed** | [frontend/src/context/AuthContext.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/context/AuthContext.tsx), [frontend/src/app/layout.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/layout.tsx) | None. | Auth status hydrates from `localStorage` without flash of unauthenticated content and syncs dynamically. |
| **Password Recovery (Forgot Password)** | Email-based password recovery flow with timing-safe enumeration protection, single-use SHA-256 tokens (15-min expiry), and reset confirmation. | **Completed** | [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py), [backend/app/schemas/password_reset.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/password_reset.py), [frontend/src/app/forgot-password/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/forgot-password/page.tsx), [frontend/src/app/forgot-password/reset/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/forgot-password/reset/page.tsx) | None. | Users request reset, receive single-use token, and reset password with validation rules. |
| **Universal Logout & Session Controls** | Dedicated Logout buttons and user profile badges active across every page (Home `/`, Onboarding `/onboarding`, Forgot Password `/forgot-password`, Reset `/forgot-password/reset`, Dashboard `/dashboard`), strictly excluding `/login` and `/signup`. | **Completed** | [page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/page.tsx), [onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx), [dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx) | None. | Authenticated users can log out from every page in the application except authentication portals. |
| **Session Management & Invalidation** | Stateful session tracking via signed HMAC tokens, HTTP-only cookies, `/me` profile retrieval, and cookie deletion on logout. | **Completed** | [backend/app/core/security.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/core/security.py), [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py) | None. | `/api/v1/auth/me` returns current user doc; `/api/v1/auth/logout` clears `session_token` cookie. |
| **Task Planner** | Checklist tracker with priority levels (`low`, `med`, `high`), due dates, statuses, and assignees. | **Partially Implemented** | Local interactive task dossier in [dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx); designed in `API-DD.md` | Dedicated backend tasks CRUD router (`/api/v1/weddings/{id}/tasks`). | Manager can toggle task completion, add tasks, and filter by priority. |
| **Settings Tab** | Atelier settings tab for wedding privacy controls, notification preferences, and concierge support lines. | **Completed** | [frontend/src/components/dashboard/SettingsTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/SettingsTab.tsx) | None. | Managers can adjust atelier preferences and view concierge direct lines. |
| **Platform Admin Dashboard** | High-level overview of platform weddings, manager accounts, and platform health. | **Not Started** | Designed in `API-DD.md` Section 3; no frontend route | Build `/admin` route and `/api/v1/admin/*` endpoints. | Super-admin can view total weddings, system status, and manage manager accounts. |
| **QR Code Generation** | Dynamic QR code directing guests to the public wedding website URL. | **Not Started** | Endpoint designed in `API-DD.md` Section 5 | Select QR library (e.g. `qrcode` in Python) and build endpoint. | `GET /api/v1/public/weddings/{slug}/qr` returns valid PNG QR code image. |
| **Private Gallery & Albums** | Album-organized photo displays restricted strictly to authorized guests holding valid tokens. | **Not Started** | Route not yet created | Build gallery UI and authorization token check. | Accessing `/w/[slug]/gallery` without a valid token returns an authorization prompt. |
| **Photo Upload & Retrieval** | Direct-to-GCS upload via signed URLs and secure retrieval via short-lived download URLs. | **Blocked** | GCS bucket and service account credentials not configured | Provision bucket, install `google-cloud-storage`, build signed URL endpoints. | High-res photos upload directly to GCS without passing through backend memory. |
| **Livestream Information** | Configuration and public display of external livestream link (e.g., YouTube Live). | **Not Started** | Schema approved in `DBDD.md` | Build livestream settings form in manager dashboard. | When enabled, public wedding page displays prominent stream link. |
| **Backend APIs** | Asynchronous REST endpoints organized under `/api/v1` with Pydantic validation. | **Completed** | [backend/app/main.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/main.py), [backend/app/api/v1/](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/) | Platform admin routers (`/api/v1/admin/*`). | All active endpoints return standardized JSON schemas and appear in Swagger UI. |
| **Database Integration** | Asynchronous MongoDB Atlas communication with connection pooling, indexes, and models. | **Completed** | [backend/app/db/session.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/db/session.py) | None. | Database pings successfully; `users`, `weddings`, `guests`, `invitations`, `rsvps` collections persist records with indexes. |
| **Error Handling** | Standardized JSON error envelopes, HTTP exception mapping, and friendly UI error banners. | **Completed** | [backend/app/api/v1/](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/), [frontend/src/app/](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/) | None. | API errors return clear, descriptive error details without leaking stack traces. |
| **Responsive Design & Accessibility** | Mobile-first layouts, semantic HTML, ARIA attributes, and high-contrast editorial styling. | **Completed** | [globals.css](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/globals.css), [frontend/src/app/dashboard/](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/) | None. | All pages adapt smoothly from 375px mobile viewports to ultra-wide displays without overlapping. |
| **Automated Tests** | Unit tests, schema checks, health checks, and linting suites. | **Partially Implemented** | [backend/tests/](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/) (20 tests passing); [frontend/eslint.config.mjs](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/eslint.config.mjs) | Frontend component tests and E2E browser tests. | `pytest` and `npm run lint` execute cleanly with 0 errors. |
| **Deployment Configuration** | Cloud Run containerization, custom domain DNS, CDN, and production TLS. | **Partially Implemented** | [DEPLOYMENT.md](file:///Users/as-mac-1118/Documents/make-my-marriage/DEPLOYMENT.md), [backend/requirements.txt](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/requirements.txt) | Cloud Build configurations and automated CI/CD pipeline. | Automated CI/CD deploys frontend and backend containers to production. |
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

### 3.4 Password Recovery & Universal Session Architecture
- **Backend Password Recovery Endpoints & Schemas:**
  - `POST /api/v1/auth/password-reset/request` in [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py): Generates cryptographic 32-byte hex recovery token, stores its SHA-256 hash in `password_resets` collection with a 15-minute expiration timestamp (`expiresAt`), logs recovery URL to server console in development, and returns an identical timing-safe success response regardless of email existence to prevent user enumeration.
  - `POST /api/v1/auth/password-reset/confirm` in [backend/app/api/v1/auth.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/auth.py): Computes token SHA-256 hash, verifies non-expiration and non-usage, updates user password hash with 600,000 PBKDF2 iterations, marks token `used: True`, and atomically invalidates token reuse.
  - Pydantic models in [backend/app/schemas/password_reset.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/password_reset.py): Strict validation for email regex, 8-character password minimum length, and structured JSON envelopes.
  - MongoDB Atlas indexes in [backend/app/db/session.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/db/session.py): Initialized unique sparse index on `password_resets.tokenHash` and TTL index on `password_resets.expiresAt`.
- **Frontend Password Recovery Interfaces:**
  - Request Portal in [frontend/src/app/forgot-password/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/forgot-password/page.tsx): Haute Atelier split-screen request form with client-side email format regex validation, dispatch loading state, and confirmation card.
  - Reset Portal in [frontend/src/app/forgot-password/reset/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/forgot-password/reset/page.tsx): Secure token extraction from query parameters (`useSearchParams`), password visibility eye toggles, confirm-password equality checks, and auto-redirect to `/login` upon reset completion.
- **Global Authentication Context (`AuthContext`):**
  - Implemented in [frontend/src/context/AuthContext.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/context/AuthContext.tsx): Manages reactive global state (`user`, `isAuthenticated`, `isLoading`), hydrates synchronously from `localStorage` (`mmm_user`) on mount to prevent layout flickers, verifies credentials against `GET /api/v1/auth/me`, and provides unified `login()`, `logout()`, and `refreshUser()` primitives.
  - Wrapped around the entire component tree in [frontend/src/app/layout.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/layout.tsx).
- **Universal Multi-Page Session Controls & Logout:**
  - **Home Page (`/`):** Dynamic top navigation bar rendering user profile pill and prominent luxury `Logout` button when authenticated, neutral loading skeleton during hydration, or `Login` / `Create Account` when unauthenticated.
  - **Onboarding Page (`/onboarding`):** Dedicated `Logout` button with loading spinner in the top header adjacent to user initials badge.
  - **Password Recovery Pages (`/forgot-password` and `/forgot-password/reset`):** Dynamic top bar rendering active user profile pill and `Logout` button when logged in, or *Back to Login* when unauthenticated.
  - **Excluded Routes:** Excluded strictly from `/login` and `/signup` per product specifications.

### 3.5 Guest Management, Role Privileges & Event Reminder Dispatcher
- **Guest Directory Subsystem (`/dashboard/guests`):**
  - Implemented in [frontend/src/app/dashboard/guests/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/guests/page.tsx): Responsive Haute Atelier guest table with real-time text searching (name, email, phone), tabbed invitation status filters (`all`, `pending`, `sent`, `revoked`), and metrics cards tracking roster numbers and dispatch counts.
- **Role Assignment & User Collection Sync:**
  - Guests can be designated as **`guest`**, **`manager`**, or **`admin`** upon creation in the Add Guest modal with contextual permission descriptions.
  - Endpoints in [backend/app/api/v1/guests.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/guests.py) (`POST` and `PATCH /{guestId}`) persist roles to `db.guests`. If a registered user account exists with that email address, their role is automatically synchronized in `db.users`.
  - Roles are visually distinguished in the dashboard table using styled Haute Atelier badges: Gold (`admin`), Burgundy (`manager`), and Warm Stone (`guest`).
- **Profile Updates (Phone Number & Role):**
  - Hosts can update guest phone numbers and elevate/adjust roles after invitations have been sent or accepted via the Edit Guest Details modal.
- **Digital Invitation Dispatching via Resend:**
  - Implemented in [backend/app/api/v1/invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/invitations.py) and [backend/app/services/email.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/services/email.py).
  - Generates cryptographic 32-byte hex invitation tokens with SHA-256 persistence and 90-day expiry.
  - Live dispatch verified via Resend API using verified sender domains with console fallback in test environments.
  - Full audit tracking in MongoDB `notifications` collection with message IDs and timestamps.
- **Smart Reminder Dispatcher Subsystem:**
  - **Category Controls:** Switch between **`RSVP Response`** (reminding guests to confirm attendance for catering & seating) and **`Upcoming Event`** (notifying attendees about upcoming celebration events).
  - **Specific Event Selector Dropdown:** When *Upcoming Event* is chosen, a celebration dropdown selector (*Ceremony & Reception*, *Sangeet Night*, *Mehendi Soirée*, *Haldi Ceremony*, *Cocktail & Welcome Dinner*, *Farewell Brunch*) dynamically populates and customizes email subjects and headlines.
  - **Custom Courteous Notes:** Allows hosts to write bespoke messages or send the curated Atelier default.
  - **Individual & Batch Modes:** Trigger reminders individually per guest or dispatch to all awaiting recipients in one click via `Send Reminders ({count})`.
  - **Auditing & Tracking:** Incrementally updates `reminderCount` and records `lastRemindedAt` in `db.guests`.

---

### 3.6 Wedding Creation & MongoDB Atlas Persistence
- **Wedding Provisioning API & Schemas:**
  - Implemented in [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py) and [backend/app/schemas/wedding.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/schemas/wedding.py).
  - `POST /api/v1/weddings`: Accepts complete wedding creation payload (couple names, partner emails, dates, location, venue address, sub-events, accommodation, transit instructions).
  - `GET /api/v1/weddings/{weddingId}`: Resolves wedding record for authenticated manager dashboard.
  - `PATCH /api/v1/weddings/{weddingId}`: Updates wedding record particulars and venue specs with real-time UI synchronization.
  - Unique slug index enforcement on `weddings.slug` in [backend/app/db/session.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/db/session.py).
- **Onboarding Wizard Integration:**
  - `handlePublish` in [frontend/src/app/onboarding/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/onboarding/page.tsx) submits payload to `POST /api/v1/weddings`, clears local draft, caches published state in `mmm_published_wedding`, and directs couples to `/dashboard`.

### 3.7 Manager Dashboard Suite with In-Place Tab Navigation
- **Haute Atelier Design & Stitch Architecture:**
  - Transformed [frontend/src/app/dashboard/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/dashboard/page.tsx) with Google Stitch high-couture aesthetic, Cinzel serif typography, velvet burgundy and gold champagne palettes, and customized layout override classes (`dashboard-main-expanded`, `dashboard-main-collapsed`, `dashboard-header-expanded`).
  - Executive header with live clock/countdown, toast alerts, broadcast dispatch modal, and authenticated user controls.
  - Attendance metrics card with reactive percentage progress bars (confirmed, pending, declined) and live feed of recent RSVP activity.
- **In-Place Tab Routing System & Deep Linking:**
  - Right-side content changes without page reload when selecting sidebar options:
    - **`Dashboard Overview`** (`/dashboard`): High-level countdown, metrics cards, itinerary agenda, tasks checklist, and RSVP activity.
    - **`Wedding Details`** (`/dashboard?tab=wedding-details`): Rendered in-place via [WeddingDetailsTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/WeddingDetailsTab.tsx) for editing couple names, date, venue, and narrative with immediate parent sync.
    - **`Guest Management`** (`/dashboard?tab=guests`): Dedicated attendee directory rendered via [GuestManagementTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/GuestManagementTab.tsx) with search, role filtering, adding/editing profiles, and deletion endpoint.
    - **`Invitations & RSVP`** (`/dashboard?tab=invitations`): Dedicated stationery and RSVP pipeline rendered via [InvitationsRsvpTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/InvitationsRsvpTab.tsx) featuring batch invitation dispatch, response rate calculation, token re-send/revocation, and targeted reminders.
    - **`Settings`** (`/dashboard?tab=settings`): Rendered in-place via [SettingsTab.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/components/dashboard/SettingsTab.tsx) for atelier preferences and concierge line.
  - Full browser URL search parameter synchronization (`window.history.pushState`) with popstate event listening for seamless Back/Forward browser navigation and direct deep-linking.
  - Dedicated active state management ensuring single-item highlight in both expanded and collapsed mini-sidebars.
  - Child-to-parent callback synchronization (`onGuestsUpdated`, `onWeddingUpdated`, `onDataChanged`) isolated from child component render phases to eliminate React cross-component update warnings.
- **Event Lifecycle Itinerary Engine:**
  - Endpoints in [backend/app/api/v1/weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/weddings.py):
    - `POST /api/v1/weddings/{weddingId}/events`: Add sub-event with title, date, start/end time, dress code, location.
    - `PATCH /api/v1/weddings/{weddingId}/events/{eventId}`: Update sub-event attributes.
    - `DELETE /api/v1/weddings/{weddingId}/events/{eventId}`: Remove event from itinerary.
  - Modal form interface directly inside the dashboard allowing planners to curate multi-day events.

### 3.8 Public Wedding Showcase & Guest RSVP Portal
- **Public Wedding Route (`/w/[slug]`):**
  - Implemented in [frontend/src/app/w/[slug]/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/w/[slug]/page.tsx) and [backend/app/api/v1/public_weddings.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/public_weddings.py).
  - Editorial landing experience displaying partner names, countdown, couple welcome story, full celebration itinerary, venue map logistics, and RSVP call to action.
- **Guest RSVP Landing & Token Consumption (`/w/[slug]/invite/[token]`):**
  - Implemented in [frontend/src/app/w/[slug]/invite/[token]/page.tsx](file:///Users/as-mac-1118/Documents/make-my-marriage/frontend/src/app/w/[slug]/invite/[token]/page.tsx) and [backend/app/api/v1/public_invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/app/api/v1/public_invitations.py).
  - Validates cryptographic token, displays personal invitation header, allows one-click Yes/No attendance selection and dietary requirements submission.
  - Persists response atomically into `rsvps` collection, updates `guests.rsvpStatus`, and updates manager dashboard metrics in real time.
  - Offers seamless transition for guests without accounts to register on the platform.

---

## 4. Current Work in Progress

| Work Item | Intended Outcome | Current Status | Dependencies / Blockers |
|---|---|---|---|
| **Platform Admin Dashboard (`/admin`)** | High-level overview of platform weddings, manager accounts, and platform health. | Endpoints designed in `API-DD.md`; frontend route pending. | None (Ready for scaffolding). |
| **Protected Route Middleware** | Frontend Next.js middleware checking `session_token` cookie before allowing access to `/onboarding`, `/admin`, and `/dashboard`. | Auth endpoints exist in backend; Next.js middleware file not yet created. | Needs middleware configuration in `frontend/src/middleware.ts`. |
| **Dynamic QR Code Generation** | Generate dynamic QR codes directing guests to the public wedding website URL (`/w/[slug]`). | Endpoint designed in `API-DD.md` Section 5; implementation pending. | Python `qrcode` library to be added to `backend/requirements.txt`. |

---

## 5. Pending Features and Tasks

The remaining work is organized into 5 sequential development phases:

### Phase 1 — Foundation and Authentication Follow-ups
- [ ] Create Next.js route protection middleware (`frontend/src/middleware.ts`) to intercept unauthenticated requests to `/onboarding`, `/admin`, and `/dashboard`.
- [x] Build shared navigation header component with active user profile badge and logout button.
- [ ] Add backend role-verification dependencies (`require_admin`, `require_manager`).

### Phase 2 — Wedding and Manager Workflows
- [x] Implement 5-step Wedding Onboarding Wizard frontend (`frontend/src/app/onboarding/page.tsx`).
- [x] Connect `handlePublish` in `frontend/src/app/onboarding/page.tsx` to `POST /api/v1/weddings`.
- [x] Implement Wedding Manager endpoints (`GET/PATCH /api/v1/weddings/{id}`).
- [x] Build `/dashboard` manager frontend interface with in-place tab navigation (`Dashboard`, `Wedding Details`, `Event Planner`, `Guest Management`, `Invitations & RSVP`, `Settings`).
- [x] Implement Event Management CRUD endpoints (`/api/v1/weddings/{id}/events`).
- [ ] Build `/admin` dashboard frontend interface.
- [ ] Implement Platform Administrator endpoints (`POST/GET /api/v1/admin/weddings`, `POST /api/v1/admin/managers`).
- [ ] Implement Task Planner backend persistence CRUD endpoints (`/api/v1/weddings/{id}/tasks`).

### Phase 3 — Guest and Invitation Workflows
- [x] Implement Guest Management CRUD endpoints (`/api/v1/weddings/{id}/guests`).
- [x] Build guest directory UI inside manager dashboard with search, filter, role allocation, and profile editing (`GuestManagementTab`).
- [x] Configure Resend email service integration (`backend/app/services/email.py`).
- [x] Implement cryptographic invitation token generation and SHA-256 storage (`invitations` collection).
- [x] Implement invitation dispatch endpoint (`POST /api/v1/weddings/{id}/invitations`).
- [x] Implement multi-category reminder dispatch subsystem (`POST /api/v1/weddings/{id}/reminders`) supporting RSVP and specific event reminders with custom notes.
- [x] Build Guest RSVP landing route (`frontend/src/app/w/[slug]/invite/[token]/page.tsx`).
- [x] Implement token validation (`GET /api/v1/public/invitations/{token}`) and RSVP submission (`POST /api/v1/public/invitations/{token}/rsvp`).

### Phase 4 — Public Wedding Website and Gallery
- [x] Build public wedding showcase route (`frontend/src/app/w/[slug]/page.tsx`).
- [x] Implement public wedding details endpoint (`GET /api/v1/public/weddings/{slug}`).
- [ ] Implement dynamic QR code generator endpoint (`GET /api/v1/public/weddings/{slug}/qr`).
- [ ] Provision Google Cloud Storage bucket and configure service account credentials.
- [ ] Implement photo upload flow (pre-signed GCS upload URL and metadata registration).
- [ ] Build token-authorized private photo gallery (`frontend/src/app/w/[slug]/gallery/page.tsx`).
- [ ] Implement short-lived signed GCS download URL generator for authorized guests.

### Phase 5 — Testing and Production Readiness
- [ ] Add integration tests for all backend routes using an isolated test database.
- [ ] Add frontend component tests and end-to-end user journey tests (e.g., Playwright).
- [ ] Author production Dockerfiles for frontend and backend.
- [ ] Set up Google Cloud Run deployment pipeline via GitHub Actions.

---

## 6. Prioritized Next Tasks

| Priority | Task Name | Why Needed | Prerequisite | Expected Outcome | Acceptance Criteria | Relevant Files |
|---|---|---|---|---|---|---|
| **P0** | **Protected Route Middleware** | Secures `/dashboard`, `/onboarding`, and `/admin` routes against unauthenticated browser access. | Auth Subsystem (Completed) | `frontend/src/middleware.ts` intercepts requests and redirects unauthenticated users to `/login`. | Attempting to access `/dashboard` without valid session redirects to `/login`. | `frontend/src/middleware.ts` |
| **P0** | **Platform Admin Shell Route (`/admin`)** | Provides landing view for super-administrators to manage platform weddings. | Login page (Completed) | Frontend route `/admin` renders admin interface. | Admin users can log in and view platform management controls. | `frontend/src/app/admin/page.tsx` |
| **P1** | **Dynamic QR Code Generator** | Generates instant QR codes linking guests to the public wedding portal. | Public wedding route (Completed) | `GET /api/v1/public/weddings/{slug}/qr` returns PNG QR image. | Calling QR endpoint returns valid QR code scannable to `/w/[slug]`. | `backend/app/api/v1/public_weddings.py` |
| **P1** | **Task Planner Backend CRUD** | Persists concierge logistics checklist to MongoDB Atlas. | Manager Dashboard (Completed) | Endpoints `/api/v1/weddings/{id}/tasks` supporting create, update, delete, toggle. | Tasks persist across browser sessions and tie to weddingId. | `backend/app/api/v1/weddings.py`, `frontend/src/app/dashboard/page.tsx` |
| **P2** | **Private Photo Gallery & GCS Uploads** | Enables photo sharing with invited guests via signed URLs. | GCS Credentials | Gallery view at `/w/[slug]/gallery` authorized by guest token. | Authorized guests view photo albums; managers upload media. | `frontend/src/app/w/[slug]/gallery/page.tsx`, `backend/app/api/v1/gallery.py` |

---

## 7. Testing and Validation Status

### 7.1 Automated Test Execution Summary (Verified)

| Test Suite | Location | Tests Executed | Passed | Failed | Notes |
|---|---|---|---|---|---|
| **Backend Health Check** | [backend/tests/test_health.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_health.py) | 1 | 1 | 0 | Confirmed `GET /api/v1/health` returns `{"status":"ok"}`. |
| **Password Cryptography** | [backend/tests/test_security.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_security.py) | 5 | 5 | 0 | Tested PBKDF2 hash format, verification, invalid hash handling, HMAC token creation, tamper detection, and expiration. |
| **Auth Schema Validation** | [backend/tests/test_auth_schemas.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_auth_schemas.py) | 4 | 4 | 0 | Validated registration schemas, password min-length rules, login models, and serialization. |
| **Password Reset Schemas** | [backend/tests/test_password_reset.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_password_reset.py) | 2 | 2 | 0 | Validated request/confirm schemas, email sanitization, and password minimum length constraints. |
| **Guest Roles & Invitation Validation** | [backend/tests/test_invitations.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_invitations.py) | 4 | 4 | 0 | Validated SHA-256 token hashing, guest creation schemas with roles (`guest`, `manager`, `admin`), guest profile updates, and reminder request models. |
| **Email Service & Template Engine** | [backend/tests/test_email_service.py](file:///Users/as-mac-1118/Documents/make-my-marriage/backend/tests/test_email_service.py) | 4 | 4 | 0 | Verified HTML invitation generation, reminder email templating, Resend live delivery with dev emulation fallback. |
| **Frontend Code Quality** | `frontend/eslint.config.mjs` | Full repository | Passed | 0 | `npm run lint` reported 0 errors and 0 warnings. |

### 7.2 Live Verification Results
- **MongoDB Atlas Ping:** Verified live via `AsyncMongoClient.admin.command('ping')` resulting in `{'ok': 1}`.
- **Port Liveness:**
  - Next.js: Active on port 3000 (HTTP 200 on `/`, `/login`, `/signup`, `/onboarding`, `/forgot-password`, `/forgot-password/reset`).
  - FastAPI: Active on port 8000 (`{"status":"ok"}` on `/api/v1/health`).
- **Production Build:** `npm run build` executed successfully with 9 static routes compiled (`/`, `/_not-found`, `/login`, `/signup`, `/onboarding`, `/forgot-password`, `/forgot-password/reset`).
- **Full Password Recovery Integration:** Verified end-to-end against live FastAPI server: email dispatch request timing-safety (HTTP 200), single-use token validation, PBKDF2 password updates, and login validation with new credentials.

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
| **BLOCKER-002** | Resend API key missing. | Digital invitations cannot be dispatched via email. | Attempting to send invitations fails. | Configured Resend SDK with intelligent dev-emulation fallback. Live dispatch activates as soon as `RESEND_API_KEY` is added to `.env`. | **Resolved** |

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

