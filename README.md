# NETGRAPH

### Mining Hidden Structures and Relationships in Complex Networks

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL_3D-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E_Tests-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)](https://playwright.dev/)

**NETGRAPH** is a full-stack career intelligence and network analysis platform developed to discover, model, and visualize latent relationships across interconnected human competencies, software technology stacks, project portfolios, and industry career pathways.

By combining deterministic **Association Rule Mining (Apriori algorithm with Support, Confidence, and Lift)**, multi-entity **knowledge graph synthesis**, WebGL-accelerated **interactive 3D topology rendering**, and secure **PostgreSQL relational persistence**, NETGRAPH transforms sparse profile data into explainable networks and actionable career development roadmaps.

---

### Links & Resources

- **Live Application:** [https://net-graph.vercel.app](https://net-graph.vercel.app)
- **GitHub Repository:** [https://github.com/akshayabhi0005-web/NetGraph](https://github.com/akshayabhi0005-web/NetGraph)
- **Comprehensive Project Report (PDF):** [`NETGRAPH_Complete_Project_Report.pdf`](./NETGRAPH_Complete_Project_Report.pdf)
- **Database Architecture Guide:** [`docs/DATABASE_SETUP.md`](./docs/DATABASE_SETUP.md)

---

## Table of Contents

1. [About the Project](#about-the-project)
2. [Key Features](#key-features)
3. [Live Application & User Journey](#live-application--user-journey)
4. [Technology Stack](#technology-stack)
5. [Data Mining Methodology & Mathematical Formulation](#data-mining-methodology--mathematical-formulation)
6. [System Architecture](#system-architecture)
7. [Repository Structure](#repository-structure)
8. [Getting Started & Local Setup](#getting-started--local-setup)
9. [Environment Variables](#environment-variables)
10. [Testing & Quality Assurance](#testing--quality-assurance)
11. [Database Schema & Security Architecture](#database-schema--security-architecture)
12. [Comprehensive Project Report](#comprehensive-project-report)
13. [Future Enhancements](#future-enhancements)
14. [Contributing](#contributing)
15. [Author & Acknowledgments](#author--acknowledgments)
16. [License](#license)

---

## About the Project

Professional portfolios and engineering skill sets exhibit high-dimensional, multi-relational structures. Traditional applicant tracking systems and career boards treat candidate skills, project deliverables, and academic backgrounds as isolated flat attributes, obscuring critical co-occurrence dynamics and multi-hop relationships.

NETGRAPH addresses this challenge through an applied data mining and network science approach:

- **Entity Modeling:** Skills, projects, work experiences, academic coursework, industry certifications, and career roles are modeled as nodes in a heterogeneous knowledge graph.
- **Transaction Generation:** Portfolios and professional experiences are transformed into itemset transactions, capturing real-world technology pairings.
- **Association Rule Discovery:** Frequent itemsets and directional association rules ($\text{Antecedent} \rightarrow \text{Consequent}$) are mined to uncover technological affinities with mathematical rigor.
- **Explainable Alignment:** Rather than relying on opaque machine learning black boxes, career pathways are evaluated through weighted requirement coverage, proficiency scoring, and deterministic skill gap identification.
- **Visual Analytics:** Complex graph topologies are rendered using hardware-accelerated 3D force-directed layouts, allowing users to orbit, inspect, and analyze their personal relationship network in real time.

---

## Key Features

### 1. Interactive 3D Network Visualization
- **WebGL Acceleration:** Implemented with Three.js, React Three Fiber (`@react-three/fiber`), and Drei (`@react-three/drei`).
- **Full-Screen Exploration (`/graph`):** Dedicated workspace featuring 3D orbit controls, continuous rotational momentum, node hover tooltips, and dynamic camera framing.
- **Landing Page Hero Integration (`/`):** Ambient 3D network visualization embedded directly into the homepage background.
- **Multi-Entity Topology:** Visualizes six distinct entity node types: Skills, Projects, Work Experiences, Academic Programs, Certifications, and Target Career Roles.
- **Weighted Edges with Provenance:** Graph connections encode relationship types (`co_occurred`, `used_in_project`, `used_in_experience`, `studied_in`, `certified_by`, `supports_role`) with documented evidence strings.

### 2. Association Rule Mining Engine
- **Deterministic Apriori Pipeline:** Computes single-item frequencies (1-itemsets) and pairwise co-occurrences (2-itemsets) across user portfolio transactions.
- **Standard Mining Metrics:** Derives exact Support, Confidence, and Lift for discovered technology associations.
- **Correlation vs. Causation Guardrails:** Explicitly documents mined associations as empirical portfolio patterns rather than universal causal laws.

### 3. Career Pathway Matching & Comparison
- **Curated Role Catalogue:** Benchmarks profiles against eight standardized industry profiles: Data Analyst, Data Scientist, Machine Learning Engineer, Software Engineer, Frontend Developer, Backend Developer, Cloud Engineer, and AI Engineer.
- **Weighted Alignment Scoring:** Incorporates both required and recommended competencies with demonstrated proficiency multipliers (Beginner: 0.65, Intermediate: 0.85, Advanced: 1.0, Expert: 1.05).
- **Side-by-Side Pathway Comparator (`/career/compare`):** Direct comparative analysis evaluating coverage differentials, shared skills, and unique prerequisite requirements across any two career paths.

### 4. Prioritized Skill Gap Analysis
- **Criticality Classification:** Categorizes missing competencies into High, Medium, and Low priorities based on target role criticality and market weight.
- **Actionable Remediation:** Generates tailored learning recommendations and suggested strengthening project ideas to bridge identified gaps.

### 5. Analytics & Visual Dashboards (`/analytics`)
- **Distribution Charts:** Interactive Recharts visualizations displaying skill domain breakdowns, proficiency distributions, and pathway alignment rankings.
- **Data Quality Confidence Meter:** Automatically computes profile completeness and data quality ratings (High, Medium, Low confidence) to prevent misleading inferences on sparse profiles.

### 6. Synchronized Resume Generator (`/resume`)
- **Live Profile Integration:** Dynamically compiles a structured curriculum vitae directly from verified database records.
- **Customization Controls:** Interactive toggles to customize section visibility (Experience, Projects, Education, Skills, Certifications) and inline headline/summary editing.
- **Print & PDF Export:** Clean print stylesheet enabling instant export via browser print dialog (`window.print()`).
- *(Note: NETGRAPH generates resumes from verified profile data; it does not parse external unstructured resume PDFs).*

### 7. Comprehensive Career Intelligence Reports (`/reports`)
- **Multi-Section Executive Document:** Six-section structured report compiling executive summary, pathway alignment charts, detailed skill gaps, association tables, data quality disclosures, and a 30-60-90 day milestone roadmap.
- **Client-Side PDF Generation:** On-demand downloadable PDF report generated using jsPDF.
- **Structured JSON Export:** Downloadable raw JSON intelligence report for external academic analysis.

### 8. User Onboarding & Profile Management (`/onboarding`, `/profile`)
- **Multi-Step Onboarding Wizard:** Sequential three-step flow capturing career goals, baseline skills, education, and portfolio projects.
- **Full Relational Profile Manager:** CRUD interfaces for managing education entries, technical skills, project portfolios, work history, and certifications.
- **Onboarding Gatekeeper:** Automatically detects incomplete profiles on sign-in and guides new users through onboarding before granting access to analysis workspaces.

### 9. Secure Server-Side Authentication & Session Management
- **Cryptographic Password Hashing:** Node.js native `crypto.scrypt` with a 16-byte random salt, 64-byte key length, and constant-time equality checks (`crypto.timingSafeEqual`).
- **Stateful Database Sessions:** 32-byte high-entropy session tokens stored in the `UserSession` table and transmitted via HTTP-only, SameSite, Secure cookies.
- **Strict Tenant Isolation:** All backend API queries enforce user-scoped relational constraints (`userId`), guaranteeing that users can only access their own data.
- **Client Fallback Mode:** When running without a configured database, the application gracefully operates in a local client-session mode for frontend demonstration.

---

## Live Application & User Journey

**Production URL:** [https://net-graph.vercel.app](https://net-graph.vercel.app)

```mermaid
journey
    title NETGRAPH Production User Journey
    section Public Discovery
      Visit Landing Page: 5: Visitor
      Interact with 3D Network Graph: 5: Visitor
    section Authentication & Setup
      Create Account (/signup): 5: Visitor
      Complete Guided Onboarding (/onboarding): 4: User
    section Knowledge Intelligence
      Review Metrics on Dashboard (/dashboard): 5: User
      Explore 3D Topology (/graph): 5: User
      Inspect Association Rules (/analytics): 5: User
      Compare Career Pathways (/career/compare): 5: User
      Generate Resume & Reports (/resume, /reports): 5: User
```

1. **Public Discovery (`/`):** Visitors explore the platform introduction and interact with the real-time 3D network topology.
2. **Registration (`/signup`):** Users create an account with email and password, protected by real-time client validation and server-side hashing.
3. **Guided Onboarding (`/onboarding`):** New users complete a structured profile setup (target role, baseline skills, education, and projects).
4. **Workspace Navigation:** Authenticated users unlock access to:
   - `/dashboard` — Holistic profile overview, key metric counters, and readiness status.
   - `/graph` — 3D interactive knowledge graph with entity and edge inspection.
   - `/skills` — Technical skill distribution and category management.
   - `/career` & `/career/compare` — Role alignment rankings and comparative gap analysis.
   - `/analytics` — Empirical association rules, frequent itemsets, and domain distributions.
   - `/resume` — Synchronized resume preview with print/PDF export.
   - `/reports` — Comprehensive career intelligence report center with PDF/JSON downloads.
   - `/settings` — Theme preferences and account controls.

---

## Technology Stack

| Category | Technology | Version | Purpose / Architecture Role |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) | `16.4.0` | React Server Components, App Router, Route Handlers |
| **UI Library** | [React](https://react.dev/) | `19.0.0` | Declarative user interfaces, hooks, context state |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.7.3` | End-to-end static typing and interface contracts |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `4.3.3` | Modern utility-first CSS styling and responsive layouts |
| **3D Visualization** | [Three.js](https://threejs.org/) | `0.186.1` | WebGL 3D scene rendering, cameras, geometry, lights |
| **3D React Abstractions** | [`@react-three/fiber`](https://github.com/pmndrs/react-three-fiber) | `9.8.1` | Declarative Three.js components for React |
| **3D Helpers** | [`@react-three/drei`](https://github.com/pmndrs/drei) | `10.7.9` | OrbitControls, Float effects, HTML overlays |
| **Charts & Analytics** | [Recharts](https://recharts.org/) | `3.10.1` | Responsive SVG bar charts, radar charts, and tooltips |
| **Database & ORM** | [Prisma](https://www.prisma.io/) | `6.19.3` | Type-safe ORM, relational migrations, connection pooling |
| **Database Engine** | [PostgreSQL](https://postgresql.org/) / [Neon](https://neon.tech/) | Serverless | Cloud PostgreSQL with PgBouncer connection pooling |
| **PDF Generation** | [jsPDF](https://github.com/parallax/jsPDF) | `4.2.1` | Client-side programmatic PDF report construction |
| **Icons & Primitives** | [Lucide React](https://lucide.dev/), [Base UI](https://base-ui.com/) | Latest | Accessible accessible iconography and UI primitives |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/) | Latest | Declarative form state and schema validation |
| **E2E Testing** | [Playwright](https://playwright.dev/) | `1.64.1` | End-to-end browser testing and visual regression |
| **Unit / Test Runner** | [tsx](https://github.com/privatenumber/tsx) | Latest | Fast TypeScript execution for unit and regression tests |
| **Cloud Hosting** | [Vercel](https://vercel.com/) | Edge Runtime | Global serverless deployment with automated CI/CD |

---

## Data Mining Methodology & Mathematical Formulation

### 1. Multi-Relational Knowledge Graph Formulation

A user's profile is formalized as a heterogeneous attributed graph:

$$\mathcal{G} = (\mathcal{V}, \mathcal{E}, \mathcal{W})$$

Where:
- $\mathcal{V} = \mathcal{V}_{\text{skill}} \cup \mathcal{V}_{\text{proj}} \cup \mathcal{V}_{\text{exp}} \cup \mathcal{V}_{\text{edu}} \cup \mathcal{V}_{\text{cert}} \cup \mathcal{V}_{\text{role}}$ represents distinct entity types.
- $\mathcal{E}$ represents typed relational edges between entities.
- $\mathcal{W}: \mathcal{E} \rightarrow [0, 1]$ assigns normalized weights to edges based on relationship significance.

#### Edge Weighting Strategy:
- **Project Implementation (`used_in_project`):** Fixed weight $w = 0.90$
- **Work Experience Application (`used_in_experience`):** Fixed weight $w = 1.00$
- **Academic Coursework (`studied_in`):** Fixed weight $w = 0.80$
- **Accredited Certification (`certified_by`):** Fixed weight $w = 0.85$
- **Co-occurrence Affinity (`co_occurred`):** Normalized dynamic weight:

$$w(e) = 0.30 + 0.70 \times \left( \frac{\text{Count}(A, B)}{\max_{\forall (u, v)} \text{Count}(u, v)} \right)$$

### 2. Association Rule Mining (Apriori Algorithm)

To discover technological affinities, individual projects and work experience entries are converted into itemset transactions $T = \{t_1, t_2, \dots, t_N\}$.

```
Transaction 1 (Project A): [Python, PyTorch, Docker, Git]
Transaction 2 (Experience B): [Python, SQL, PostgreSQL, Docker]
Transaction 3 (Project C): [React, TypeScript, Next.js, Tailwind CSS]
```

#### Mathematical Formulas Implemented in Code:

1. **Itemset Support:**
   $$\text{Support}(A) = \frac{\text{Count}(A)}{N}$$

2. **Rule Support (Joint Frequency):**
   $$\text{Support}(A \rightarrow B) = \frac{\text{Count}(A \cup B)}{N}$$

3. **Rule Confidence (Conditional Reliability):**
   $$\text{Confidence}(A \rightarrow B) = \frac{\text{Count}(A \cup B)}{\text{Count}(A)}$$

4. **Rule Lift (Affinity Ratio over Statistical Independence):**
   $$\text{Lift}(A \rightarrow B) = \frac{\text{Confidence}(A \rightarrow B)}{\text{Support}(B)} = \frac{\text{Count}(A \cup B) \times N}{\text{Count}(A) \times \text{Count}(B)}$$

- **Interpretation of Lift:**
  - $\text{Lift} > 1.0$: Positive technological synergy (technologies co-occur more frequently than expected by chance).
  - $\text{Lift} = 1.0$: Statistical independence.
  - $\text{Lift} < 1.0$: Negative association (technologies substitute or rarely co-occur in the same stack).

### 3. Explainable Career Pathway Alignment

For each reference career role $R$ with required skills $\mathcal{S}_{\text{req}}$ and recommended skills $\mathcal{S}_{\text{rec}}$:

$$\text{Score}_{\text{base}} = \left( \frac{\sum_{s \in \mathcal{S}_{\text{req}}} w(s) \cdot \mu_{\text{prof}}(s)}{\sum_{s \in \mathcal{S}_{\text{req}}} w(s)} \right) \times 90$$

$$\text{Score}_{\text{bonus}} = \left( \frac{\sum_{r \in \mathcal{S}_{\text{rec}}} w(r) \cdot \mathbb{I}(r \in \text{Profile})}{\sum_{r \in \mathcal{S}_{\text{rec}}} w(r)} \right) \times 10$$

$$\text{Total Match Score} = \min\left(100, \, \text{round}\left(\text{Score}_{\text{base}} + \text{Score}_{\text{bonus}}\right)\right)$$

Where $\mu_{\text{prof}}(s)$ represents demonstrated proficiency multipliers:
- **Expert:** $1.05$
- **Advanced:** $1.00$
- **Intermediate:** $0.85$
- **Beginner:** $0.65$

Unweighted coverage percentage is also reported to provide complete transparency:

$$\text{Coverage}_{\text{unweighted}} = \text{round}\left( \frac{|\mathcal{S}_{\text{req}} \cap \text{Profile}|}{|\mathcal{S}_{\text{req}}|} \times 100 \right)$$

---

## System Architecture

```mermaid
flowchart TD
    subgraph Client_Layer ["Client Layer (Next.js App Router & React 19)"]
        UI["Modern Web UI\nTailwind CSS v4 & Lucide"]
        Canvas3D["3D Network Canvas\nThree.js & R3F"]
        RechartsView["Analytics Dashboards\nRecharts Visualizations"]
        PDFGen["Report Exporter\njsPDF Client Engine"]
    end

    subgraph API_Layer ["API & Middleware Layer (Edge & Node.js Runtime)"]
        AuthRoutes["/api/auth/*\nRegister, Login, Session, Me"]
        ProfileRoutes["/api/profile/*\nSkills, Projects, Experience, Edu, Certs"]
        MiningRoutes["/api/analytics/* & /api/graph\nRules, Career Matches, Graph Nodes"]
        Security["Security Controls\nscrypt Hashing, Session Cookies, CSRF Guard"]
    end

    subgraph Engine_Layer ["Data Mining Engine (lib/data-mining)"]
        Preprocessor["Preprocessor & Normalizer\nAlias Resolution, Provenance Merging"]
        Apriori["Apriori Association Miner\nSupport, Confidence, Lift"]
        Matcher["Career Role Matcher\nWeighted Scoring & Skill Gaps"]
        GraphGen["Graph Data Generator\nNodes, Typed Edges, Weight Normalization"]
        Cache["In-Memory LRU Cache\nInstant Invalidation on Mutation"]
    end

    subgraph Storage_Layer ["Persistence Layer"]
        PrismaORM["Prisma ORM 6.19.3\nType-safe Client & Schema"]
        PostgresDB[("Neon PostgreSQL\nServerless Connection Pool")]
        LocalFallback[("Local Fallback Mode\nClient-Side Demonstration")]
    end

    UI --> AuthRoutes
    UI --> ProfileRoutes
    UI --> MiningRoutes
    Canvas3D <--> MiningRoutes
    RechartsView <--> MiningRoutes
    PDFGen <--> MiningRoutes

    AuthRoutes --> Security
    ProfileRoutes --> Security
    MiningRoutes --> Security

    Security --> PrismaORM
    Security --> Engine_Layer

    Engine_Layer --> Preprocessor
    Preprocessor --> Apriori
    Preprocessor --> Matcher
    Apriori --> GraphGen
    Matcher --> GraphGen
    GraphGen --> Cache

    PrismaORM --> PostgresDB
    Security -.-> LocalFallback
```

---

## Repository Structure

```
NetGraph/Frontend/
├── app/                                 # Next.js App Router pages and API routes
│   ├── analytics/                       # Data mining analytics & association rules dashboard
│   ├── api/                             # Backend API route handlers
│   │   ├── analytics/                   # Aggregated mining, skills, careers, associations
│   │   ├── auth/                        # Server-side auth (login, logout, register, me)
│   │   ├── graph/                       # Graph nodes and edges endpoint
│   │   ├── profile/                     # Profile child models (skills, projects, etc.)
│   │   └── settings/                    # User preferences & configuration
│   ├── career/                          # Career pathways & side-by-side comparison (/compare)
│   ├── dashboard/                       # Authenticated home dashboard & readiness metrics
│   ├── graph/                           # Full-screen 3D interactive relationship graph
│   ├── login/ & signup/                 # Authentication pages with client & server validation
│   ├── onboarding/                      # Three-step guided onboarding wizard
│   ├── profile/                         # Comprehensive profile management workspace
│   ├── reports/                         # Career intelligence report center & PDF export
│   ├── resume/                          # Synchronized resume generator with print stylesheet
│   ├── settings/ & skills/              # Preferences and skill inventory views
│   ├── layout.tsx & page.tsx            # Root layout and public landing page with 3D canvas
│   └── globals.css                      # Global styles & Tailwind CSS v4 directives
├── components/                          # Reusable UI and 3D visualization components
│   ├── app-shell.tsx                    # Authenticated application shell & navigation
│   ├── netgraph-canvas.tsx              # Homepage ambient 3D force-directed canvas
│   ├── profile-graph-canvas.tsx         # Dedicated full-feature 3D profile graph
│   ├── data-quality-card.tsx            # Data completeness & confidence indicator
│   └── ui/                              # Design system primitives (buttons, dialogs, inputs)
├── context/                             # React context providers (AuthContext)
├── docs/                                # Technical documentation
│   └── DATABASE_SETUP.md                # PostgreSQL setup, migrations, and API reference
├── e2e/                                 # Playwright end-to-end test suites
│   ├── 01-auth-lifecycle.spec.ts        # Registration, login, session retention, signout
│   ├── 02-onboarding-profile.spec.ts    # Onboarding wizard & profile editing verification
│   ├── 03-multi-user-isolation.spec.ts  # Cross-tenant data isolation tests
│   ├── 04-data-mining-analytics.spec.ts # Association rules, career matching validation
│   ├── 05-reports-export.spec.ts        # PDF/JSON report export testing
│   ├── 06-settings.spec.ts              # Settings update & persistence
│   ├── 07-security-failure.spec.ts      # Authentication edge cases & CSRF checks
│   └── 08-visual-regression.spec.ts     # Visual snapshots across viewport breakpoints
├── lib/                                 # Core business logic and shared services
│   ├── data-mining/                     # Pure data mining algorithmic engine
│   │   ├── association-rules.ts         # Apriori algorithm (Support, Confidence, Lift)
│   │   ├── career-matcher.ts            # Weighted career alignment scoring
│   │   ├── career-roles.ts              # Curated 8-role industry benchmark catalog
│   │   ├── graph-generator.ts           # Heterogeneous graph node & edge generator
│   │   ├── normalizer.ts                # Skill canonicalization & alias resolver
│   │   ├── preprocessor.ts              # Transaction basket extraction
│   │   ├── skill-gaps.ts                # Priority-ranked skill gap derivation
│   │   └── types.ts                     # TypeScript data mining domain interfaces
│   ├── server/                          # Server-side backend foundations
│   │   ├── auth.ts                      # scrypt hashing, cookie sessions, CSRF verification
│   │   ├── env.ts                       # Environment variable assertion & validation
│   │   ├── mining-service.ts            # Database-backed mining execution & caching
│   │   ├── prisma.ts                    # Prisma client singleton
│   │   └── profile-service.ts           # Tenant-scoped database queries
│   ├── report-generator.ts              # Career intelligence report data compiler
│   └── report-pdf-generator.ts          # Client-side jsPDF document builder
├── prisma/                              # Database persistence
│   ├── migrations/                      # Audited SQL migration history
│   ├── schema.prisma                    # Relational PostgreSQL data model
│   └── seed.ts                          # Development synthetic data seeder
├── public/                              # Static public assets
├── NETGRAPH_Complete_Project_Report.pdf # Publication-quality 16-section technical PDF report
├── generate_report.py                   # Python script used to build the complete report PDF
├── next.config.mjs                      # Next.js configuration and strict security headers
├── package.json                         # Dependencies, scripts, and package manager specification
├── playwright.config.ts                 # Playwright test configuration
└── tsconfig.json                        # Strict TypeScript compiler options
```

---

## Getting Started & Local Setup

### Prerequisites

- **Node.js:** `v18.18.0` or higher (`v20.x` recommended)
- **Package Manager:** `pnpm` (recommended, v9+) or `npm` (v10+)
- **Database (Optional for local development):** PostgreSQL `v14+` or a free [Neon](https://neon.tech/) cloud database

### 1. Clone the Repository

```bash
git clone https://github.com/akshayabhi0005-web/NetGraph.git
cd NetGraph/Frontend
```

### 2. Install Dependencies

Using `pnpm`:
```bash
pnpm install
```
*(Or with `npm`: `npm install`)*

### 3. Environment Configuration

Copy the example environment template:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials. NETGRAPH operates out-of-the-box in local demonstration mode if no database is specified. To connect to PostgreSQL:

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL="http://localhost:3000"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/netgraph?schema=public"
AUTH_SECRET="your-secure-random-secret-at-least-32-chars-long"
```

### 4. Database Setup & Migrations (When using PostgreSQL)

1. **Generate the type-safe Prisma client:**
   ```bash
   npx prisma generate
   ```

2. **Apply migrations to the database:**
   ```bash
   npx prisma migrate dev --name init_netgraph
   ```
   *(Or for rapid prototyping without creating migration files: `npx prisma db push`)*

3. **(Optional) Seed development profiles:**
   ```bash
   npx tsx prisma/seed.ts
   ```

### 5. Start the Development Server

```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## Environment Variables

All environment variables used by the application are validated on server startup via `lib/server/env.ts`:

| Variable | Required in Production | Purpose | Example Placeholder |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | Yes | Defines execution runtime environment (`development`, `production`, `test`). | `development` |
| `NEXT_PUBLIC_APP_URL` | Yes | Canonical base URL used for absolute redirects and metadata. | `https://net-graph.vercel.app` |
| `DATABASE_URL` | Yes (for DB mode) | PostgreSQL connection string including credentials and host. | `postgresql://USER:PASSWORD@HOST:PORT/DB?schema=public` |
| `AUTH_SECRET` | Yes (in prod) | Cryptographic salt/secret key for session signing (minimum 32 characters). | `generate_with_openssl_rand_base64_32` |

> **Security Note:** Never commit `.env` or `.env.local` files containing real production credentials to Git. The `.gitignore` file is pre-configured to exclude environment files.

---

## Testing & Quality Assurance

NETGRAPH includes a comprehensive, multi-layered automated test suite covering unit calculations, database integrations, and end-to-end browser user journeys.

```mermaid
flowchart LR
    A[Data Mining Unit Tests\n17/17 Passed] --> B[Integration & Server Tests\nMulti-tenant Scoping]
    B --> C[Playwright E2E Tests\n8/8 Test Specs]
    C --> D[Strict Build & Typecheck\ntsc + next build]
```

### 1. Data Mining Engine & Server Unit Tests

Executes deterministic unit tests for Apriori association mining, skill normalisation, career matching, and tenant isolation:

```bash
npm test
# or: pnpm test
```

**Verified Test Suites:**
- `lib/data-mining/__tests__/mining.test.ts` — 17 unit tests verifying Support, Confidence, Lift, and graph generation.
- `lib/data-mining/__tests__/report.test.ts` — Report data compilation and deterministic structure.
- `lib/data-mining/__tests__/validation.test.ts` — Input sanitization and edge-case handling.
- `lib/data-mining/__tests__/integration-regression.test.ts` — Pipeline stability across profile updates.
- `lib/server/__tests__/backend-foundation.test.ts` — Password hashing, session TTL, and security headers.
- `lib/__tests__/frontend-auth-integration.test.ts` — Session lifecycle in client auth context.
- `lib/__tests__/profile-db-integration.test.ts` — Prisma relational mutations and cascade deletions.
- `lib/__tests__/data-mining-engine-integration.test.ts` — End-to-end data mining execution against real profiles.
- `lib/__tests__/e2e-user-journey-reliability.test.ts` — Multi-step user reliability tests.

### 2. End-to-End Browser Testing (Playwright)

Runs headless browser tests across Chromium, Firefox, and WebKit:

```bash
npx playwright test
# or: pnpm test:e2e
```

To run tests with UI mode:
```bash
npx playwright test --ui
```

### 3. Production Build & Static Type Safety

Production builds enforce zero TypeScript compile errors:

```bash
npm run build
# or: pnpm build
```

---

## Database Schema & Security Architecture

### Relational Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o| UserProfile : "has"
    User ||--o| UserSettings : "configures"
    User ||--o{ UserSession : "issues"
    User ||--o{ Education : "records"
    User ||--o{ Skill : "possesses"
    User ||--o{ Project : "develops"
    User ||--o{ Experience : "accumulates"
    User ||--o{ Certification : "earns"

    User {
        string id PK
        string email UK
        string passwordHash
        string salt
        datetime createdAt
        datetime updatedAt
    }

    UserSession {
        string id PK
        string userId FK
        string token UK
        datetime expiresAt
        datetime createdAt
    }

    UserProfile {
        string id PK
        string userId FK
        string name
        string headline
        string location
        string summary
        string careerGoal
        boolean onboarded
        int onboardingStep
    }

    Skill {
        string id PK
        string userId FK
        string name
        string category
        string proficiency
        int yearsOfExperience
    }

    Project {
        string id PK
        string userId FK
        string title
        string description
        string[] technologies
        string projectUrl
        string githubUrl
    }
```

### Security Controls

1. **Password Hashing:** Implemented with `crypto.scrypt` with a cryptographically secure 16-byte random salt and 64-byte key length. Plaintext passwords are never stored, logged, or exposed. Constant-time verification is performed with `crypto.timingSafeEqual` to prevent timing attacks.
2. **Session Cookies:** Transmitted via the `netgraph_session` cookie marked `HttpOnly`, `SameSite=Lax`, and `Secure` in production environments.
3. **Data Scoping (Multi-Tenant Isolation):** Every database mutation and query strictly scopes records by the authenticated session's `userId`. Users cannot read, modify, or delete another user's records.
4. **Relational Constraints:** Cascading deletes (`onDelete: Cascade`) guarantee that deleting a user account cleans up all associated profile child records. Compound unique indexes (e.g. `@@unique([userId, name])` on `Skill`) prevent duplicate entries.
5. **Strict Security Headers:** Configured in `next.config.mjs` including `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `Referrer-Policy`, and strict `Content-Security-Policy`.

### Known Limitations
- The career catalogue currently benchmarks against eight curated industry reference roles; custom user-defined target roles are planned for future iterations.
- Association rule mining is performed on transactions derived from the user's submitted portfolio; statistical confidence ratings reflect portfolio sample size.

---

## Comprehensive Project Report

A publication-quality, 16-section technical and academic project report is included directly in the repository:

📄 **[`NETGRAPH_Complete_Project_Report.pdf`](./NETGRAPH_Complete_Project_Report.pdf)**

### Report Contents Overview:
1. **Executive Architecture Summary & Project Metadata**
2. **Abstract & Problem Statement**
3. **Motivation & Research Objectives**
4. **Comprehensive Literature Review & Theoretical Foundations** (Complex Network Analysis, Apriori Association Rule Mining, Knowledge Graphs)
5. **Functional & Non-Functional Specifications**
6. **Detailed System Architecture & Entity-Relationship Schematics**
7. **Data Mining & Graph Theoretic Methodology** (Exact mathematical formulas for Support, Confidence, Lift, Weighted Coverage, and Edge Normalization)
8. **Curated Reference Career Roles & Competency Catalog**
9. **Implementation Details** (Frontend, 3D Canvas, Backend API, Prisma ORM, Neon PostgreSQL)
10. **Security Architecture & Multi-Tenant Data Isolation Audit**
11. **Comprehensive Automated Verification & Production Audit Results**
12. **End-to-End User Experience & Onboarding Evaluation**
13. **Limitations Disclosure & Academic Evaluation Scope**
14. **Strategic Future Enhancements Roadmap**
15. **Conclusion & Project Deliverables**
16. **Appendix: Verification Artifacts & Test Evidence**

---

## Future Enhancements

The following features represent planned research and development extensions:

- [ ] **Automated Resume Parsing:** Natural language processing (NLP) pipeline to ingest unstructured PDF/DOCX resumes and extract skill entities automatically.
- [ ] **Live Job Market Integration:** Scheduled web scrapers / API connectors aggregating live tech job postings to dynamically update benchmark skill weights.
- [ ] **Graph Community Detection:** Integration of Louvain community detection or Infomap algorithms to partition large multi-user skill networks into emergent technology clusters.
- [ ] **Graph Neural Network (GNN) Embeddings:** Graph convolutional networks (GCN) or Node2Vec embeddings for link prediction between complementary skills.
- [ ] **Enterprise / Institutional Portals:** Multi-tenant dashboards allowing universities and training bootcamps to evaluate aggregate cohort skill distributions and curriculum-to-market alignment.

---

## Contributing

Contributions, feedback, and issue reports are welcome. NETGRAPH was developed as an academic and engineering portfolio project adhering to modern software engineering standards.

### Contribution Guidelines:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/network-enhancement`).
3. Commit your changes with clear, descriptive messages (`git commit -m 'feat: add Jaccard similarity edge metric'`).
4. Ensure all unit and integration tests pass (`npm test`).
5. Push to the branch (`git push origin feature/network-enhancement`).
6. Open a Pull Request for review.

---

## Author & Acknowledgments

- **Lead Author & Developer:** [Akshay N](https://github.com/akshayabhi0005-web)
- **GitHub:** [`@akshayabhi0005-web`](https://github.com/akshayabhi0005-web)
- **Project Repository:** [`https://github.com/akshayabhi0005-web/NetGraph`](https://github.com/akshayabhi0005-web/NetGraph)

### Acknowledgments
- The **Three.js** and **React Three Fiber** open-source communities for WebGL 3D rendering tooling.
- The **Prisma** and **Neon** teams for serverless PostgreSQL developer infrastructure.
- Research literature in association rule mining and complex network analysis that informed the mathematical foundations of this platform.

---

## License

Licensing for this project has not yet been specified. All rights are reserved by the author pending formal open-source license selection. For academic evaluation, inquiries, or collaboration opportunities, please contact the repository author.
