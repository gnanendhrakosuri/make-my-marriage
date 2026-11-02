# Make My Marriage — Frontend

The web client for the Make My Marriage platform, built with [Next.js](https://nextjs.org/) (App Router), TypeScript, and Tailwind CSS / custom design tokens.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Atelier bespoke design tokens (`Cinzel`, `Playfair Display`, `Plus Jakarta Sans`, Gold/Burgundy accents)
- **State & Storage:** React state + `localStorage` draft preservation
- **Package Manager:** `npm`

---

## Directory Structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, metadata)
│   │   ├── page.tsx           # Atelier showcase landing page
│   │   ├── globals.css        # Global CSS & input layout safeguards
│   │   ├── stitch.css         # Atelier UI design tokens & utilities
│   │   ├── login/             # Split-screen Atelier login portal
│   │   ├── signup/            # Couple/Planner registration page
│   │   └── onboarding/        # 5-step wedding onboarding wizard & live companion preview
│   └── lib/
│       └── constants.ts       # Shared constants (API base URL, endpoints)
├── public/                    # Static images and assets
├── tailwind.config.js         # Theme extensions and palette tokens
├── next.config.mjs            # Next.js build configuration
└── package.json               # Dependencies and scripts
```

---

## Getting Started

### 1. Prerequisites

- **Node.js:** v20.x or higher
- **npm:** v10.x or higher

### 2. Environment Configuration

Copy the sample environment file to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the backend API URL (default is `http://localhost:8000`):

```ini
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts Next.js development server on port 3000 |
| `npm run build` | Compiles optimized static and server pages for production |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs Next.js ESLint validation |

---

## Route Map

| Path | Description | Access |
| :--- | :--- | :--- |
| `/` | Editorial landing showcase with interactive hero & CTAs | Public |
| `/login` | Split-screen authentication with demo account toggles | Public |
| `/signup` | Account creation for couples and planners | Public |
| `/onboarding` | 5-step wedding creation wizard with live companion preview | Authenticated / Public Draft |
| `/admin` | Super-admin platform overview *(planned)* | Admin |
| `/dashboard` | Wedding manager operational center *(planned)* | Manager / Couple |
| `/w/[slug]` | Guest-facing bespoke wedding portal *(planned)* | Public |
| `/w/[slug]/invite/[token]` | Personalized guest RSVP portal *(planned)* | Token-authorized |
| `/w/[slug]/gallery` | Private photo gallery *(planned)* | Token-authorized |

---

## Key Features Implemented

1. **Atelier Split-Screen Auth:** Full integration with backend authentication endpoints (`/login`, `/signup`) with role persistence and validation.
2. **5-Step Onboarding Wizard:**
   - **01. Wedding Details:** Title, couple names, date, custom slug generator.
   - **02. Couple Dossier:** Partner roles, emails, bios, and "How We Met" story.
   - **03. Soirée Events:** Interactive sub-event scheduler modal.
   - **04. Villa & Map:** Venue details, GPS coordinates, transport and accommodation notes.
   - **05. Review & Launch:** Validation summary with one-click edit and draft/publish state.
3. **Live Companion Preview:** Sticky mobile/desktop live card preview with dynamic monogram calculation (`S&J`), days-remaining countdown, and theme visualization.
4. **Resilient Local Persistence:** Auto-saves drafts to `localStorage` (`mmm_onboarding_draft`) with user pre-fill hydration.
