# NETGRAPH — Career Intelligence & Interactive 3D Graph Platform

**Mining Hidden Relationships Between Skills, Technologies & Career Opportunities**

NETGRAPH is a data mining-based career intelligence platform developed to explore multi-dimensional relationships between candidate skills, modern technology stacks, academic and open-source project repositories, and real-world career pathways.

---

## Project Status

NETGRAPH frontend is actively developed with Next.js App Router, React 19, and Three.js. Core navigation, 3D network visualizations, user onboarding, and client session flows are operational in local demonstration mode. Backend API integration and live data mining algorithm pipelines are scheduled in subsequent phases.

---

## Implemented Features

- **Immersive 3D Relationship Network Graph**:
  - Rendered using Three.js, React Three Fiber, and Drei.
  - Directly integrated into the landing page background without bounding card borders.
  - Interactive auto-rotation, mouse drag orbit, and responsive camera framing.
  - Clear text labels displaying career intelligence entities (e.g., *Machine Learning*, *Data Mining*, *Python*, *Data Scientist*, *React*, *Cloud Computing*).
- **Dedicated Graph Workspace (`/graph`)**:
  - Full-screen interactive graph exploration environment.
- **Client-Side Demo Authentication & User Sessions**:
  - Functional sign-up (`/signup`) with real-time validation (email syntax, password requirements) and duplicate check.
  - Functional login (`/login`) with credential validation and a **1-Click Instant Demo Login** button (`demo@netgraph.edu`).
  - Passwords are encrypted using salted SHA-256 via the Web Crypto API (`window.crypto.subtle`) before saving to `localStorage`. Plaintext passwords are never stored.
  - Session persistence across page reloads and browser restarts.
  - Route protection across internal application routes (`/dashboard`, `/profile`, `/settings`, etc.) with redirection to login.
  - Interactive user profile editing (`/profile`) and onboarding (`/onboarding`).
- **Application Shell & Dashboards**:
  - Unified [`AppShell`](components/app-shell.tsx) with dynamic avatar initials, active user information, and a functional Sign Out button.
  - Dashboard overview (`/dashboard`) with personalized user greeting and dynamic skill counters.
  - Analytics (`/analytics`), Career pathways (`/career`), Skills explorer (`/skills`), Resume reviewer (`/resume`), and Reports (`/reports`) pages.

---

## Planned Features (In Development / Roadmap)

- **Backend Service & Database Integration**:
  - Dedicated backend service (Python FastAPI or Node.js) with persistent PostgreSQL / MongoDB storage.
- **Data Mining Algorithms**:
  - Apriori / FP-Growth association rule mining to discover co-occurring technology requirements from job market datasets.
  - Graph centrality algorithms (PageRank, Betweenness Centrality) to identify high-impact prerequisite skills.
  - Collaborative filtering and vector similarity for personalized career recommendations.
- **Production Authentication**:
  - Migration from local demo session mode to OAuth 2.0 / JWT (NextAuth, Supabase, or Clerk).
- **Resume Mining**:
  - Automated resume PDF parsing, entity extraction, and automated skill-gap analysis.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16.4.0 (App Router, Turbopack) |
| **UI Library** | React 19, TypeScript 5.7 |
| **Styling** | Tailwind CSS v4, Lucide React icons, Base UI |
| **3D Graphics** | Three.js, `@react-three/fiber`, `@react-three/drei` |
| **Charts** | Recharts |
| **Package Manager**| pnpm |

---

## Local Setup & Installation

### Prerequisites
- Node.js (v18.18.0 or newer recommended)
- pnpm (or npm / yarn)

### 1. Clone the repository
```bash
git clone https://github.com/akshayabhi0005-web/NetGraph.git
cd NetGraph/Frontend
```

### 2. Install dependencies
```bash
pnpm install
```
*(or `npm install`)*

### 3. Environment configuration
Copy the example environment file:
```bash
cp .env.example .env.local
```
> **Note**: NETGRAPH runs out-of-the-box in local demo session mode. No external API keys or credentials are required for local development.

### 4. Run the development server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build
```bash
pnpm build
pnpm start
```

---

## Authentication & Security Note

Authentication is currently implemented as a **Client-Side Demonstration Service** using salted SHA-256 Web Crypto hashing and browser `localStorage`. 

- Seeded Demo Account:
  - **Email**: `demo@netgraph.edu`
  - **Password**: `Password123`
- This is intended for rapid interface preview, interaction testing, and local development. It is not intended as production-grade authorization.
