# MCP Server Testing Notes

Tested: 2026-02-25
Environment: Fresh seed (605 nodes, 2 skill trees), no AI provider configured

---

## What's Working

### Transport & Auth
- Stdio transport initializes cleanly, returns correct protocol version and capabilities
- API token auth (Bearer JWT) works across all endpoints
- Missing env vars (`SKILLCLIMB_URL`, `SKILLCLIMB_TOKEN`) cause `process.exit(1)` — correct behavior

### Resources (5 static + 1 template = 6 total)
| Resource | Status | Notes |
|----------|--------|-------|
| `skillclimb://guide` | OK | 4.2KB markdown, comprehensive tutoring guide |
| `skillclimb://me/profile` | OK | Returns mastery stats, tier completion, badges, streak, velocity, heatmap |
| `skillclimb://me/due` | OK | Returns all due items with SRS state |
| `skillclimb://me/domains` | OK | Per-domain mastery, freshness, badges, topic breakdown |
| `skillclimb://me/sessions` | OK | Recent sessions with analytics |
| `skillclimb://skilltrees/{id}/map` | OK | Registered as ResourceTemplate, shows up via `resources/templates/list` |

### Tools (15 registered)
| Tool | Status | Notes |
|------|--------|-------|
| `list_skill_trees` | OK | Returns id, name, createdAt |
| `list_domains` | OK | Works with and without `skilltreeId` filter |
| `get_domain_progress` | OK | Returns mastery %, node counts |
| `get_user_progress` | OK | Full per-domain breakdown |
| `start_study_session` | OK | Returns 25 items with question templates |
| `get_session` | OK | Retrieves existing session, 404 on bad ID |
| `submit_answer` | OK | Correct scoring, SRS updates, calibration, milestones |
| `submit_review` | OK | Pre-scored reviews work |
| `complete_study_session` | OK | Summary with momentum, next session info |
| `start_placement` | OK | Returns first IRT question |
| `submit_placement_answer` | OK | Adapts difficulty, returns next question |
| `abandon_placement` | OK | Cleans up gracefully |
| `generate_hint` | OK | Falls back to generic hint from explanation when no AI |
| `generate_micro_lesson` | OK | Falls back to explanation content when no AI |
| `evaluate_free_recall` | ISSUE | Returns `null` (HTTP 200) when no AI provider — see below |

### Core Flows
- Full study session lifecycle works: start → answer → complete
- Correct/incorrect answers score properly (5 for correct recognition, 0 for wrong)
- "I don't know" (null answer) scores 1 and maps to `known_unknown` calibration
- Retry flow works: `attemptNumber: 2` after hint
- Placement test lifecycle works: start → answer → abandon
- Double-completing a session returns proper 400 error
- Invalid node/session IDs return clear 404 errors

---

## Issues Found

### 1. `evaluate_free_recall` returns `null` with no AI provider (Severity: Medium)
**Observed:** `POST /api/reviews/evaluate` returns HTTP 200 with body `null` when no AI provider is configured.
**Expected:** Should return an error like `{"error": "AI provider required for free recall evaluation", "source": "noop"}` or at least a structured fallback.
**Impact:** The MCP tool will return `"null"` as text content. An AI client parsing this gets nothing actionable — no score, no feedback, no indication why.
**Compare:** `generate_hint` and `generate_micro_lesson` both handle the no-AI case gracefully with `"source": "generic"` / `"source": "fallback"` responses.

### 2. `due-items` resource returns massive payload (Severity: Medium)
**Observed:** For a fresh user, `skillclimb://me/due` returns all 605 items = **154KB** of JSON. The `skill-tree-map` resource is **73KB**. The `start_study_session` response is **47KB**.
**Impact:** These payloads can consume significant LLM context window. A client that reads `due-items` + `profile` + starts a session is already at ~200KB of JSON in context before the first question is asked.
**Suggestion:** Add pagination or summary mode for `due-items` (e.g., return counts by domain + only the top 25 due). The skill-tree-map could benefit from a `depth` parameter to omit nodes.

### 3. CLAUDE.md says "13 tools" but there are actually 15 (Severity: Low)
**Observed:** `tools/list` returns 15 tools. CLAUDE.md says "13 tools (study sessions, placement tests, AI tutor, content discovery) and 5 resources".
**Actual count:** 4 session tools + 3 answer/review tools + 3 placement tools + 3 AI tutor tools + 2-4 content discovery tools = 15.
**Impact:** Minor documentation inaccuracy.

### 4. `start_study_session` description references `sessionId` but response uses `id` (Severity: Low)
**Observed:** The tool description says "Returns ... items" and `get_session` says "The session ID returned by start_study_session". The actual response key is `id`, not `sessionId`. An AI client reading the description might look for `sessionId` and not find it.
**Impact:** Could confuse an AI client. The `complete_study_session` response does use `sessionId` (different from the session start response which uses `id`).

### 5. No session-to-answer linkage (Severity: Low)
**Observed:** `submit_answer` and `submit_review` don't take a `sessionId` parameter. Reviews are recorded globally, not tied to a specific session. The `complete_study_session` summary counts reviews by checking what happened during the session time window.
**Impact:** If a user has multiple concurrent sessions or the clock skews, reviews could be attributed to the wrong session. Also means there's no enforcement that you must answer items from the session you started.

---

## UX Friction Points

### For AI Client Developers

1. **Setup requires 3 separate steps** — start DB, start backend, then run `mcp:setup`. The setup script connects directly to the DB (not through the API), so it needs a working DB connection. Would be smoother if `mcp:setup` worked through the API or if there was a single `docker compose up` that did everything.

2. **Token management is split across 3 CLI scripts** — `mcp:setup`, `api:token` (generate-token.ts), and `api:tokens` (manage-tokens.ts). The flags are inconsistent: `mcp:setup` uses `--email`, `api:token` uses `--email`, but `api:tokens` uses `--list --email` / `--revoke <id>`. Could be a single CLI with subcommands.

3. **No way to discover what skill trees exist before auth** — `list_skill_trees` requires auth, but you need a skill tree context to make meaningful tutoring decisions. The study guide resource helps, but an AI client needs to call a tool before it even knows what curricula are available.

4. **`questionTemplate.microLesson` mentioned in study guide doesn't exist** — Line 29 of the guide says "present the `questionTemplate.microLesson` content" but the actual question template has no `microLesson` field. The guide should only reference `generate_micro_lesson` tool.

### For the AI Tutor (LLM consuming MCP)

5. **Huge JSON payloads eat context** — A typical first-session flow (read profile + read due items + start session + read guide) dumps ~250KB of JSON into context before the first user interaction. This is problematic for models with smaller context windows and increases cost for all models.

6. **Session items include full `questionTemplates` array (plural) but only one question type is relevant** — Each item's `node.questionTemplates` contains ALL template types for that node (recognition, cued_recall, etc.), but the session builder has already selected one via `item.questionTemplate` (singular). The extra templates add ~2x payload size with no value for the current session.

7. **Profile heatmap is 90 entries of zeros for a new user** — The heatmap in the profile response includes 90 days of `{"date":"...","reviewCount":0,"intensity":0}`. This is ~3KB of noise for a fresh user.

8. **No "what should I do next?" tool** — The AI tutor has to synthesize next steps from multiple sources (due items count, session history, progress). A single `get_recommendations` tool that returns "start a session" / "take placement test" / "come back tomorrow" would simplify the tutoring flow.

9. **`generate_hint` and `generate_micro_lesson` fallbacks are thin** — Without an AI provider, `generate_hint` returns the explanation wrapped in "Think about: ..." and `generate_micro_lesson` returns the explanation as `content` with empty `keyTakeaways`. These are identical to what `submit_answer` already returns in `feedback.explanation`. The fallback doesn't add value over just re-reading the explanation.

10. **Placement test sends `correctAnswer` to the client** — The placement question template includes the correct answer. This is fine for a tutor use case (the AI needs to know), but if anyone builds a non-tutor MCP client (e.g., a quiz app), the answers are leaked. Not a bug for the current use case, just a design consideration.
