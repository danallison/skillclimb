# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SkillClimb is a generic test-driven learning platform built on spaced repetition, desirable difficulties, and adaptive assessment. It works with arbitrary skill trees via a skill tree system. The cybersecurity skill tree is the first and primary skill tree. The full platform specification lives in `SKILLCLIMB.md`. The cybersecurity skill tree specification lives in `CYBERCLIMB.md`.

## Tech Stack

- **Web Frontend:** React + TypeScript, Zustand + React Query
- **Mobile App:** React Native + Expo (planned — `@skillclimb/mobile`)
- **Backend:** Express + TypeScript (tsx for dev)
- **Database:** PostgreSQL (Drizzle ORM)
- **Monorepo:** npm workspaces — `@skillclimb/core`, `@skillclimb/backend`, `@skillclimb/frontend`, `@skillclimb/mobile` (planned)

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

## Skill Tree System

Skill trees live in `packages/backend/src/content/<skilltree-id>/`. Each skill tree has:
- `skilltree.yaml` — manifest with tier bases, domain data, prerequisites, placeholder domains
- `domains/` — individual domain seed files with topic/node data

The seed script (`npm run seed`) auto-discovers and loads all skill trees. Use `npm run seed -- --skilltree <skilltree-id>` to seed a specific skill tree.

## Core Data Model

`User` → `LearnerNode` (SRS state per user/node) → `Node` → `Topic` → `Domain` → `Tier`

Supporting entities: `Review` (single assessment event), `Session` (study session grouping reviews)
