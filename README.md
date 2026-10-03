# NETGRAPH — Career Intelligence & Interactive 3D Graph Platform

**Mining Hidden Relationships Between Skills, Technologies & Career Opportunities**

NETGRAPH is a premium, data mining-based career intelligence platform developed to explore multi-dimensional relationships between candidate skills, modern technology stacks, academic and open-source project repositories, and real-world career pathways.

---

## 🌟 Key Features

### Public Experience (No Login Required)
- **Modern Sticky Navbar**: Glassmorphism blur, smooth scroll navigation to Features, How It Works, and About sections.
- **Hero Section**: Recreated faithfully from the reference design with high-impact typography and dual call-to-actions.
- **Interactive 3D Hero Graph**: WebGL-powered Three.js 3D spherical network visualization supporting 360° mouse drag, touch rotation, zoom, auto-rotation toggle, and interactive node selection inspector.
- **Features Grid**: 8 feature cards with live interactive preview thumbnails and direct action links.
- **How NETGRAPH Works**: Visual 5-step methodology stepper detailing the data mining pipeline.
- **Academic Research Foundation**: Contextual documentation of association rule mining, graph theory, and ethical transparency disclosures.

### Authenticated Experience (Accessible via Demo Sign-In or Registration)
- **Role-Based Protected Routing**: Strict unauthenticated protection with seamless redirection back to the requested route post-login.
- **Analytics-Driven Dashboard**: Real-time metric cards (Total Skills, Tech Stack Count, Projects Analyzed, Career Matches, Role Alignment), Recharts visualizations, and recent research activity stream.
- **Comprehensive Candidate Profile**: Multi-tab manager for Personal Background, Education, Experience, Skills with tag management & proficiency, Project Repositories, Certifications, Career Preferences, External Links, and Optional Resume Upload.
- **Skill Analysis Engine**: 12-step simulated data mining execution engine with real-time progress bar, token extraction stages, and source provenance tracking (User, Project, Resume, GitHub).
- **Career Matches & Alignment**: In-depth role cards with predicted alignment percentages, represented vs. missing skill diagnostics, and detailed modal inspector.
- **Skill Gap Analysis**: Target role benchmark diagnostics, skill coverage meters, and recommended bridge opportunities.
- **Advanced Career Analytics**: Interactive Recharts suite (Skill Distribution by category with market average comparison, Skill Coverage stacked bars, Role Alignment horizontal bars, Skill Demand Trends over 6M/1Y, and Project Tech frequency).
- **Full 3D Graph Explorer**: Fullscreen-capable Three.js force graph with search, category filtering, relationship filtering (`REQUIRES_SKILL`, `RELATED_TO`, `USES_TECHNOLOGY`, `DEMONSTRATED_IN`, `BELONGS_TO`, `MENTIONS`), inferred edge highlights, OrbitControls, and collapsible node inspection drawer.
- **Career Pathway Roadmaps**: Multi-stage milestone roadmaps (Foundation, Intermediate Specialization, Advanced Execution, Role Attainment) with readiness scores.
- **A4 PDF Report Generation & Download**: Multi-page branded PDF reports generated using `jsPDF` and `jspdf-autotable`, section checklist configuration, live A4 print preview modal, safe dynamic file naming, and persistent report history.
- **Dedicated Resume Builder**: Standalone optional career tool in the sidebar featuring a 9-step guided wizard, 4 ATS-friendly templates (*Professional*, *Modern Indigo*, *Minimalist ATS*, *Technical Engineer*), live sheet preview, and PDF export.
- **Platform Settings**: Local session management, career preferences, data reset, and logout controls.

---

## 🛠️ Technology Stack

| Purpose | Technology |
|---|---|
| Frontend Framework | React 19 (TypeScript) |
| Build Tool & Dev Server | Vite |
| Styling Layer | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| Icons | Lucide React |
| Charting & Visual Analytics | Recharts |
| 3D Visualization | Three.js (WebGL with OrbitControls & Raycaster) |
| Routing | React Router DOM v7 |
| PDF Document Engine | jsPDF + jsPDF-AutoTable |
| State Management | React Context API (`AuthContext`, `AppDataContext`) with local persistence |
| Testing | Vitest |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (tested on Node v26)
- npm v9+

### Installation & Local Setup

1. **Clone or Navigate to the Frontend Directory**:
   ```bash
   cd "C:\Users\Akshay N\Documents\NetGraph\Frontend"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Run Automated Test Suite**:
   ```bash
   npx vitest run
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔑 Demo Access & Login Credentials

The application provides an instant **1-Click Demo Sign In** on the login page:

- **Navigate to**: `/login`
- **One-Click Demo Button**: Click **"Demo Sign In"** to authenticate immediately as scholar **Akshay N**.
- **Manual Credentials (Optional)**:
  - **Email**: `akshay.n@netgraph.edu`
  - **Password**: `demo123` (any password >= 4 characters accepted)

---

## 📄 PDF Generation Workflows

1. **Career Intelligence Report**:
   - Access via sidebar **Reports** (`/reports`), Dashboard quick action, or Analytics header.
   - Choose focus: *Complete Analysis*, *Skill Gap*, or *Skill Inventory*.
   - Customize included sections via checkboxes.
   - Click **Generate & Preview** to review the live A4 preview.
   - Click **Download PDF** to export `NETGRAPH_Career_Analysis_[Name]_[ID].pdf`.

2. **Resume Builder Export**:
   - Access via sidebar **Resume Builder** (`/resume-builder`).
   - Follow the 9-step wizard or select from 4 templates (*Professional*, *Modern*, *Minimal*, *Technical*).
   - Click **Export PDF** to generate a clean, printable ATS resume.

---

## ⚖️ Academic Research & Ethical Disclaimers

- **Frontend-Only Execution**: In this initial development phase, data mining algorithms, skill parsing, and role alignments are simulated client-side using deterministic ontologies.
- **Privacy & Permissions**: All profile edits, uploaded resume files, and report drafts remain isolated within browser local storage. No data scraping is conducted on private profiles.
- **Advisory Matching**: Career alignment percentages and skill gap diagnostics represent heuristic profile-alignment estimations for academic exploration, not formal hiring guarantees or employment certifications.
