# SkillClimb

An open-source, self-hosted learning engine built on spaced repetition, desirable difficulties, and adaptive assessment. SkillClimb works with arbitrary skill trees — the cybersecurity skill tree is the first implementation.

## How It Works

SkillClimb leads with **testing, not teaching**. Learners are assessed first and receive instruction only when they struggle. This approach is grounded in learning science research on the testing effect, spacing, interleaving, and calibration.

**Knowledge hierarchy:** Tier (5) → Domain (~25) → Topic (~150) → Node (~1,200)

Each node is an atomic knowledge unit tracked per-user via a modified SM-2 spaced repetition algorithm. Questions progress through five difficulty levels: recognition → cued recall → free recall → application → practical.

Key subsystems:
- **SRS Engine** — SM-2 with domain-weighted intervals
- **Session Builder** — Selects review items using due dates, interleaving, and prerequisite reinforcement
- **Placement Test** — Adaptive IRT-based assessment (~40–60 questions)
- **Confidence Calibration** — Tracks self-rated confidence vs. actual performance
- **AI Tutor** — Pluggable providers (Anthropic, OpenAI, Ollama); evaluates free-recall responses, generates hints and micro-lessons
- **MCP Server** — Exposes learning engine to external AI agents for tutoring, session management, and content authoring

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Zustand, TanStack React Query |
| Backend | Express 5, TypeScript, Effect.js |
| Database | PostgreSQL 16, Drizzle ORM |
| AI Providers | Anthropic (default), OpenAI, Ollama — pluggable via `AI_PROVIDER` env var |
| MCP Server | Model Context Protocol — tutor tools, session management, learning state resources |
| Auth | OAuth (Google/GitHub), JWT |
| Testing | Vitest, Supertest |
| Deployment | Docker Compose (self-hosted) |
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
# Install dependencies
npm install

# Create .env (copy from .env.example and fill in values)
cp .env.example .env
# Edit .env with your settings (POSTGRES_PASSWORD, API keys, etc.)

# Start PostgreSQL
docker compose up -d postgres

# Run database migrations
npm run migrate

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
| GET | `/api/skilltrees/:id/map` | | Full skill tree hierarchy (domains → topics → nodes) |
| GET | `/api/domains` | * | List domains (filterable by skilltreeId) |
| GET | `/api/domains/:id/progress` | * | Domain mastery progress |
| POST | `/api/sessions` | * | Create study session |
| GET | `/api/sessions/:id` | * | Get session with items |
| POST | `/api/reviews` | * | Submit review (score + confidence) |
| POST | `/api/reviews/evaluate` | * | AI evaluation of free-recall response |
| GET | `/api/users/me/progress` | * | Overall learning progress |
| GET | `/api/users/me/profile` | * | Comprehensive learner profile |
| GET | `/api/users/me/calibration` | * | Confidence calibration analysis |
| GET | `/api/users/me/due-items` | * | Nodes due for review |
| GET | `/api/users/me/sessions` | * | Recent session history (last 20) |
| POST | `/api/placement` | * | Start adaptive placement test |
| POST | `/api/placement/:id/answer` | * | Submit placement answer |
| POST | `/api/hints` | * | Generate hint (static → AI → generic) |
| POST | `/api/lessons` | * | Generate micro-lesson (static → AI → fallback) |

## MCP Server

SkillClimb exposes its learning engine via the [Model Context Protocol](https://modelcontextprotocol.io), enabling AI agents to drive the full learning experience — placement tests, study sessions, review submission, and progress tracking.

### Setup

1. Generate a long-lived API token for your user:

```bash
npm run api:token --workspace=@skillclimb/backend -- --email user@example.com --name "Claude Desktop"
```

This prints a **Token ID** (for management) and the **Token** (the JWT). Tokens are revocable — see [Managing API Tokens](#managing-api-tokens) below.

2. Configure your MCP client (Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "skillclimb": {
      "command": "npx",
      "args": ["tsx", "src/mcp/index.ts"],
      "cwd": "/path/to/cyberclimb/packages/backend",
      "env": {
        "SKILLCLIMB_URL": "http://localhost:3001",
        "SKILLCLIMB_TOKEN": "<jwt from step 1>"
      }
    }
  }
}
```

The MCP server connects to the Express API over HTTP — no database access needed. It works with any hosted SkillClimb instance.

### Tools (13)

| Tool | Description |
|------|-------------|
| `start_study_session` | Start a study session with review items |
| `get_session` | Get session details and items |
| `submit_review` | Submit a review with score and confidence |
| `start_placement` | Start an adaptive placement test |
| `submit_placement_answer` | Submit a placement test answer |
| `abandon_placement` | Abandon an in-progress placement test |
| `evaluate_free_recall` | AI evaluation of a free-recall response |
| `generate_hint` | Generate a Socratic hint |
| `generate_micro_lesson` | Generate a brief micro-lesson |
| `list_skill_trees` | List available skill trees |
| `list_domains` | List domains (optionally by skill tree) |
| `get_domain_progress` | Get user progress in a domain |
| `get_user_progress` | Get overall user progress |

### Resources (5)

| Resource | URI |
|----------|-----|
| Learner Profile | `skillclimb://me/profile` |
| Due Items | `skillclimb://me/due` |
| Domain Progress | `skillclimb://me/domains` |
| Skill Tree Map | `skillclimb://skilltrees/{id}/map` |
| Session History | `skillclimb://me/sessions` |

### Managing API Tokens

List tokens for a user:

```bash
npm run api:tokens --workspace=@skillclimb/backend -- --list --email user@example.com
```

Revoke a token by ID:

```bash
npm run api:tokens --workspace=@skillclimb/backend -- --revoke <token-id>
```

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for the full deployment guide, including migrations, rollback, and updates.

## Architecture Details

See [SKILLCLIMB.md](SKILLCLIMB.md) for the full platform specification.
