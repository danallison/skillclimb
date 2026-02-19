# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillClimb is a generic test-driven learning platform built on spaced repetition, desirable difficulties, and adaptive assessment. It works with arbitrary skill trees via a content pack system. The cybersecurity content pack is the first and primary content pack. The full cybersecurity specification lives in `CYBERCLIMB.md`.

## Tech Stack

- **Frontend:** React + TypeScript, Zustand + React Query
- **Backend:** Express + TypeScript (tsx for dev)
- **Database:** PostgreSQL (Drizzle ORM)
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

## Content Pack System

Content packs live in `packages/backend/src/content/<pack-id>/`. Each pack has:
- `index.ts` — exports a `ContentPack` object (manifest with tier bases, domain data, prerequisites, placeholder domains)
- `domains/` — individual domain seed files with topic/node data

The seed script (`npm run seed`) auto-discovers and loads all content packs. Use `npm run seed -- --pack <pack-id>` to seed a specific pack.

## Core Data Model

`User` → `LearnerNode` (SRS state per user/node) → `Node` → `Topic` → `Domain` → `Tier`

Supporting entities: `Review` (single assessment event), `Session` (study session grouping reviews)
