# SkillClimb

A test-driven learning platform built on spaced repetition, desirable difficulties, and adaptive assessment. SkillClimb works with arbitrary skill trees — the cybersecurity skill tree is the first implementation.

## How It Works

SkillClimb leads with **testing, not teaching**. Learners are assessed first and receive instruction only when they struggle. This approach is grounded in learning science research on the testing effect, spacing, interleaving, and calibration.

**Knowledge hierarchy:** Tier (5) → Domain (~25) → Topic (~150) → Node (~1,200)

Each node is an atomic knowledge unit tracked per-user via a modified SM-2 spaced repetition algorithm. Questions progress through five difficulty levels: recognition → cued recall → free recall → application → practical.

Key subsystems:
- **SRS Engine** — SM-2 with domain-weighted intervals
- **Session Builder** — Selects review items using due dates, interleaving, and prerequisite reinforcement
- **Placement Test** — Adaptive IRT-based assessment (~40–60 questions)
- **Confidence Calibration** — Tracks self-rated confidence vs. actual performance
- **AI Tutor** — Evaluates free-recall responses, generates hints and micro-lessons via Claude

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Zustand, TanStack React Query |
| Backend | Express 5, TypeScript, Effect.js |
| Database | PostgreSQL 16, Drizzle ORM |
| AI | Anthropic Claude API |
| Auth | OAuth (Google/GitHub), JWT |
| Testing | Vitest, Supertest |
| Monorepo | npm workspaces |

## Project Structure

```
packages/
├── core/       # Pure domain logic (SRS, IRT, scoring, session builder)
├── backend/    # Express API, services, database, skill tree content
└── frontend/   # React app
```

The project follows a **functional core / imperative shell** architecture. All domain logic lives as pure functions in `@skillclimb/core`. I/O, database access, and API calls are pushed to the backend services and frontend components.

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

### Setup

```bash
# Start PostgreSQL
docker compose up -d

# Install dependencies
npm install

# Create backend .env
cat > packages/backend/.env << 'EOF'
DATABASE_URL=postgres://postgres:postgres@localhost:5432/skillclimb
ANTHROPIC_API_KEY=        # Optional — AI features degrade gracefully without it
JWT_SECRET=               # Optional — defaults to dev secret
APP_URL=http://localhost:5173
EOF

# Push schema to database
npm run db:push

# Seed skill tree content
npm run seed

# Build the core package (required before dev)
npm run build --workspace=@skillclimb/core

# Start both frontend and backend
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

### Individual Commands

```bash
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only
npm run seed            # Seed all skill trees (idempotent)
npm run seed -- --skilltree cybersecurity  # Seed specific skill tree
npm run migrate         # Run database migrations
npm run db:generate     # Generate Drizzle migrations from schema changes
npm run db:push         # Push schema directly to database
```

## Testing

```bash
npm test          # Run all tests
npm run test:watch  # Watch mode
```

Tests cover the core domain logic (SRS, IRT, scoring, session building, calibration, progress) and backend routes (auth, skilltrees, domains, reviews, sessions, hints, lessons). Route tests use Supertest with mock Effect layers — no database required.

## Skill Trees

Skill trees live in `packages/backend/src/content/<skilltree-id>/`. Each skill tree has a `skilltree.yaml` manifest and a `domains/` directory with individual domain seed files. The seed script auto-discovers and loads all skill trees.

See [SKILL_TREES.md](SKILL_TREES.md) for the authoring guide.

### Cybersecurity Skill Tree

The first skill tree covers cybersecurity across five tiers:

- **T0 — Foundations:** Networking, Operating Systems, Programming
- **T1 — Core Security:** Security Principles, Cryptography, IAM, Network Defense, Threat Landscape, Web App Security
- **T2 — Practitioner:** Penetration Testing, SOC Ops, Forensics, Cloud Security, Malware Analysis
- **T3 — Specialist:** Exploit Dev, Threat Intel, Incident Response, Security Architecture
- **T4 — AI Security:** Adversarial ML, LLM Security, AI for SOC, AI Governance

See [CYBERCLIMB.md](CYBERCLIMB.md) for the full cybersecurity domain specification.

## API

All routes under `/api`. Auth-protected routes require a JWT `access_token` cookie.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/api/skilltrees` | | List skill trees |
| GET | `/api/domains` | * | List domains (filterable by skilltreeId) |
| GET | `/api/domains/:id/progress` | * | Domain mastery progress |
| POST | `/api/sessions` | * | Create study session |
| GET | `/api/sessions/:id` | * | Get session with items |
| POST | `/api/reviews` | * | Submit review (score + confidence) |
| POST | `/api/reviews/evaluate` | * | AI evaluation of free-recall response |
| GET | `/api/users/me/progress` | * | Overall learning progress |
| GET | `/api/users/me/calibration` | * | Confidence calibration analysis |
| POST | `/api/placement` | * | Start adaptive placement test |
| POST | `/api/placement/:id/answer` | * | Submit placement answer |
| POST | `/api/hints` | * | Generate hint (static → AI → generic) |
| POST | `/api/lessons` | * | Generate micro-lesson (static → AI → fallback) |

## Architecture Details

See [SKILLCLIMB.md](SKILLCLIMB.md) for the full platform specification.
