# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberClimb is a test-driven cybersecurity learning platform built on spaced repetition, desirable difficulties, and adaptive assessment. The full specification lives in `CYBERCLIMB.md`.

**Current status:** Pre-implementation (planning/design phase). No application code exists yet.

## Planned Tech Stack

- **Frontend:** React + TypeScript, Zustand + React Query, IndexedDB (Dexie.js) for offline-first SRS
- **Backend:** Ruby on Rails API
- **Database:** PostgreSQL (with JSONB for flexible question/answer schemas)
- **Background Jobs:** Sidekiq + Redis
- **AI Tutor:** Claude API (Sonnet) for elaboration evaluation, hints, misconception detection
- **Lab Environment:** Docker containers for practical challenges
- **Hosting:** Fly.io or Railway

## Development Strategy

This project follows a **functional core, imperative shell** architecture. Keep domain logic (SRS calculations, session building, scoring, prerequisite graph traversal, IRT algorithms) as pure functions with no side effects. Push all I/O, database access, API calls, and state mutations to the outer shell. This applies to both the Rails backend and the React/TypeScript frontend.

## Architecture

Four-level knowledge hierarchy: **Tier** (5) → **Domain** (~25) → **Topic** (~150) → **Node** (~1,200). Nodes are the atomic knowledge units, each tracked per-user via a modified SM-2 spaced repetition algorithm with domain-weighted intervals.

Key subsystems:
- **SRS Engine** — SM-2 with `easiness`, `interval`, `repetitions`, `due_date`, `domain_weight`
- **Session Builder** — selects review items using due dates, interleaving across domains, and prerequisite reinforcement
- **Question Engine** — progressive difficulty: recognition → cued recall → free recall → application → practical lab
- **Placement Test** — adaptive IRT-based assessment (~40–60 questions)
- **Confidence Calibration** — tracks self-rated confidence vs. actual performance
- **Prerequisite Graph** — domains form a DAG; unlock at 60% mastery of prerequisites

## Core Data Model

`User` → `LearnerNode` (SRS state per user/node) → `Node` → `Topic` → `Domain` → `Tier`

Supporting entities: `Review` (single assessment event), `Session` (study session grouping reviews)

## Implementation Roadmap

Phase 1 (Weeks 1–4): PostgreSQL schema, SM-2 algorithm, session builder, minimal React UI, seed 2 domains (~80 nodes)
Phase 2 (Weeks 5–8): IRT placement test, skill tree map visualization, confidence calibration, expand to 7 domains
Phase 3 (Weeks 9–14): Claude API integration, elaboration system, adaptive difficulty, expand to ~600 nodes
Phase 4 (Weeks 15–20): Docker labs, analytics dashboard, offline-first SRS, red team challenges
Phase 5 (Weeks 21–24): Gamification, notifications, performance optimization, beta testing, launch
