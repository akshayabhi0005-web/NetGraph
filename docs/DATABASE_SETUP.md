# NETGRAPH Backend & Database Setup Guide

This document explains how to set up, configure, and maintain the PostgreSQL database and backend API for **NETGRAPH** (Mining Hidden Structures and Relationships in Complex Networks).

---

## 1. Architecture Overview

NETGRAPH utilizes a hybrid architecture designed for progressive enhancement:
- **Client Fallback (Demonstration Mode)**: When `DATABASE_URL` is not configured, the frontend gracefully uses browser `localStorage`. No errors or white screens occur.
- **Production Server & Database Foundation**: When `DATABASE_URL` is set, API routes in `app/api/` connect via **Prisma ORM** to a PostgreSQL relational database.
- **Relational Integrity**:
  - `User`: Root credentials, email (unique), salted password hash (`scrypt`), timestamps.
  - `UserSession`: Database-backed sessions with expiration, user agent, IP tracking, and revocation.
  - `UserProfile`: 1-to-1 relationship with `User`, containing headline, bio, location, target roles, experience level, portfolio links, and completion metrics.
  - `Education`, `Skill`, `Project`, `Experience`, `Certification`: Relational child models with strict cascade-delete semantics (`onDelete: Cascade`) and compound unique constraints (e.g. `@@unique([userId, name])` for skills).
  - `UserSettings`: Theme preference, demonstration mode toggle, email summaries, analytics sharing, and graph layout defaults.

---

## 2. Prerequisites

- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **pnpm**: v9.0+ or v12+
- **PostgreSQL**: v14.0 or higher (Local installation, Supabase, Neon, or Docker)

---

## 3. Quickstart: Setting up PostgreSQL

### Option A: Using Docker (Recommended for Local Dev)
Run a PostgreSQL container in your terminal:
```bash
docker run --name netgraph-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=netgraph \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Option B: Local PostgreSQL Service (Windows / macOS / Linux)
1. Ensure the PostgreSQL service is running on port `5432`.
2. Connect to PostgreSQL and create the `netgraph` database:
```sql
CREATE DATABASE netgraph;
```

---

## 4. Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
2. Open `.env` and verify the `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/netgraph?schema=public"
AUTH_SECRET="your-secure-random-secret-at-least-32-chars"
```

> **Security Rule**: Never commit `.env` or `.env.local` to git. Keep `.env` included in `.gitignore`.

---

## 5. Database Schema & Migrations

To apply the schema to your database:

### Development Prototyping (Fast sync):
```bash
npx prisma db push
```

### Production Migrations (Audited SQL history):
```bash
npx prisma migrate dev --name init_netgraph_schema
```

### Generate Prisma Client:
Whenever `prisma/schema.prisma` is modified, regenerate the type-safe client:
```bash
npx prisma generate
```

---

## 6. Seeding Development Data

To populate the database with synthetic profiles and initial test users:
```bash
npx tsx prisma/seed.ts
```
*(Or `npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" prisma/seed.ts`)*

The seed script creates:
- **User 1**: `alex.chen@example.com` (Password: `NetGraph2026!`)
  - Full profile with Network Science & Graph ML specialization, 6 skills, 2 education records, 2 projects, 2 experiences, and 2 certifications.
- **User 2**: `sarah.lin@example.com` (Password: `NetGraph2026!`)
  - Full profile with Data Engineering & Distributed Systems focus.

---

## 7. API Endpoints Reference

All endpoints return standardized JSON `{ success: boolean, data?: ..., error?: { message, code } }`.

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/api/auth/register` | `POST` | Registers a new user with scrypt-hashed password | No |
| `/api/auth/login` | `POST` | Authenticates credentials, creates session & sets HTTP-only cookie | No |
| `/api/auth/logout` | `POST` | Revokes the active session and clears auth cookie | Yes |
| `/api/auth/me` | `GET` | Returns authenticated user details and active session status | Yes |
| `/api/profile` | `GET` | Retrieves complete user profile including child relations | Yes |
| `/api/profile` | `PUT` | Upserts primary profile metadata and target roles | Yes |
| `/api/profile/education` | `POST` / `DELETE` | Adds or removes education record (scoped to user) | Yes |
| `/api/profile/skills` | `POST` / `DELETE` | Adds/updates or removes skill record | Yes |
| `/api/profile/projects` | `POST` / `DELETE` | Adds or removes project record | Yes |
| `/api/profile/experience` | `POST` / `DELETE` | Adds or removes work experience record | Yes |
| `/api/profile/certifications` | `POST` / `DELETE` | Adds or removes certification record | Yes |
| `/api/settings` | `GET` / `PUT` | Retrieves or updates user preferences & theme | Yes |
| `/api/analytics` | `GET` | Computes or retrieves cached complete data mining overview | Yes |
| `/api/analytics/skills` | `GET` | Analyzes user skill distributions, domains, and weights | Yes |
| `/api/analytics/careers` | `GET` | Derives career pathway matching scores and prioritized skill gaps | Yes |
| `/api/analytics/associations` | `GET` | Mines association rules with Support, Confidence, and Lift | Yes |
| `/api/graph` | `GET` | Constructs personalized multi-entity network graph nodes & edges | Yes |

---

## 8. Security Foundations

1. **Password Hashing**: Node.js native `crypto.scrypt` with a cryptographically secure 16-byte random salt, 64-byte key length, and constant-time comparison via `crypto.timingSafeEqual`. Plaintext passwords are never stored or logged.
2. **Session Security**: Sessions are tracked in the `UserSession` table and transmitted via `netgraph_session` HTTP-only, SameSite=Lax cookies (or `Authorization: Bearer <token>` for API clients).
3. **Data Isolation (Tenant Scoping)**: All database queries filter strictly by `userId` extracted from the authenticated session. Users cannot view, modify, or delete another user's records.
4. **Injection Prevention**: Prisma ORM executes parameterized queries for all operations, mitigating SQL injection risks.
5. **Sanitized Error Responses**: Database internal errors and stack traces are suppressed in production; generic, sanitized messages are returned to clients.
