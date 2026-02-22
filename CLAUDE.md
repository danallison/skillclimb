# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillClimb is an open-source, self-hosted learning engine built on spaced repetition, desirable difficulties, and adaptive assessment. It works with arbitrary skill trees via a skill tree system. AI tutoring is pluggable (Anthropic, OpenAI, Ollama) and the learning engine is accessible to external AI agents via MCP. The cybersecurity skill tree is the first and primary skill tree. The full platform specification lives in `SKILLCLIMB.md`. The cybersecurity skill tree specification lives in `CYBERCLIMB.md`.

## Tech Stack

- **Web Frontend:** React + TypeScript, Zustand + React Query
- **Backend:** Express + TypeScript (tsx for dev)
- **Database:** PostgreSQL (Drizzle ORM) — runs in Docker (`docker compose up db`)
- **AI Providers:** Pluggable — Anthropic (default), OpenAI, Ollama; configured via `AI_PROVIDER` env var
- **MCP Server:** Exposes learning engine to external AI agents (tutor tools, session management, learning state resources)
- **Deployment:** Docker Compose (self-hosted)
- **Monorepo:** npm workspaces — `@skillclimb/core`, `@skillclimb/backend`, `@skillclimb/frontend`

## Development Strategy

This project follows a **functional core, imperative shell** architecture. Keep domain logic (SRS calculations, session building, scoring, prerequisite graph traversal, IRT algorithms) as pure functions with no side effects in `@skillclimb/core`. Push all I/O, database access, API calls, and state mutations to the outer shell (backend services, frontend components).

## Architecture

Four-level knowledge hierarchy: **Tier** (5) → **Domain** (~25) → **Topic** (~150) → **Node** (~1,200). Nodes are the atomic knowledge units, each tracked per-user via a modified SM-2 spaced repetition algorithm with domain-weighted intervals.

Key subsystems:
- **SRS Engine** — SM-2 with `easiness`, `interval`, `repetitions`, `due_date`, `domain_weight`
- **Session Builder** — selects review items using due dates, interleaving across domains, and prerequisite reinforcement
- **Question Engine** — progressive difficulty: recognition → cued recall → free recall → application → practical lab
- **Placement Test** — adaptive IRT-based assessment (~40–60 questions)
- **Confidence Calibration** — tracks self-rated confidence vs. actual performance
- **Prerequisite Graph** — domains form a DAG; unlock at 60% mastery of prerequisites
- **Pluggable AI** — `AIServiceShape` contract with provider adapters (Anthropic, OpenAI, Ollama); graceful fallback when no provider configured
- **MCP Server** — exposes tutor tools, session management, learning state resources, and content authoring tools to external AI agents
- **Self-Hosted Deployment** — Docker Compose with postgres, backend, and frontend services; all config via `.env`

## Skill Tree System

Skill trees live in `packages/backend/src/content/<skilltree-id>/`. Each skill tree has:
- `skilltree.yaml` — manifest with tier bases, domain data, prerequisites, placeholder domains
- `domains/` — individual domain seed files with topic/node data

The seed script (`npm run seed`) auto-discovers and loads all skill trees. Use `npm run seed -- --skilltree <skilltree-id>` to seed a specific skill tree. Skill trees are distributable as git repos — clone into the content directory and seed. AI-assisted authoring via MCP tools (`generate_skill_tree_outline`, `generate_domain_content`, `validate_skill_tree`) enables AI agents to help scaffold new skill trees.

## AI Provider Configuration

AI providers live in `packages/backend/src/services/ai/`. The `AI_PROVIDER` env var selects the provider at startup via `resolveProvider()`. Each adapter implements `AIServiceShape`.

| `AI_PROVIDER` | Adapter | Required Env |
|--------------|---------|-------------|
| `anthropic` | `anthropic.adapter.ts` | `ANTHROPIC_API_KEY` |
| `openai` | `openai.adapter.ts` | `OPENAI_API_KEY` |
| `ollama` | `openai.adapter.ts` (OpenAI-compatible) | none (defaults to localhost:11434) |
| `none` / unset | `noop.adapter.ts` | none |

Missing API keys fall back to noop adapter with a warning (never crashes).

## MCP Server

Entry point: `packages/backend/src/mcp/index.ts` — runs via stdio transport, separate from Express.

```bash
npm run mcp --workspace=@skillclimb/backend
```

The MCP server reuses the same Effect layers (`DatabaseLive`, `AIServiceLive`) and service functions as Express. 13 tools (study sessions, placement tests, AI tutor, content discovery) and 5 resources (learner profile, due items, domain progress, skill tree map, session history).

## Database Migrations

Schema changes use Drizzle's migration system. **Do NOT use `drizzle-kit push`** — it's interactive and not automatable.

1. After modifying `packages/backend/src/db/schema.ts`, generate a migration:
   ```bash
   cd packages/backend && DATABASE_URL="postgres://postgres:postgres@localhost:5432/cyberclimb" npx drizzle-kit generate
   ```
2. Apply the migration (non-interactive, safe for CI/production):
   ```bash
   DATABASE_URL="postgres://postgres:postgres@localhost:5432/cyberclimb" npm run migrate --workspace=@skillclimb/backend
   ```

Migration files live in `packages/backend/drizzle/` and should be committed.

## Core Data Model

`User` → `LearnerNode` (SRS state per user/node) → `Node` → `Topic` → `Domain` → `Tier`

Supporting entities: `Review` (single assessment event), `Session` (study session grouping reviews)
