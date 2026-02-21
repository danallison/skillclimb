# Issues Found (Codebase Review)

Date: 2026-02-21

## 1) Broken object-level authorization on session fetch (High) — FIXED
- **What:** Any authenticated user can fetch any session by ID.
- **Fix applied:** `getSession()` now requires `userId` and queries with `AND user_id = ?`. Route passes `req.userId!`. Returns 404 when mismatched.
- **Files changed:** `packages/backend/src/services/session.service.ts`, `packages/backend/src/routes/sessions.ts`
- **Tests:** `packages/backend/src/routes/__tests__/sessions.test.ts` — "returns 404 when accessing another user's session"

## 2) Broken object-level authorization on placement endpoints (High) — FIXED
- **What:** Placement operations are not scoped to the authenticated user.
- **Fix applied:** `getPlacement`, `submitPlacementAnswer`, and `abandonPlacement` now require `userId` and query/check with `AND user_id = ?`. Routes pass `req.userId!`. `abandonPlacement` now verifies ownership before updating (previously did a blind update).
- **Files changed:** `packages/backend/src/services/placement.service.ts`, `packages/backend/src/routes/placement.ts`
- **Tests:** `packages/backend/src/routes/__tests__/placement.test.ts` (new) — 3 IDOR tests for GET, answer, and abandon

## 3) Insecure default JWT secret in backend (High) — FIXED
- **What:** JWT signing falls back to a hardcoded development secret.
- **Fix applied:** Module-level validation in `auth.service.ts` throws at startup if `NODE_ENV=production` and `JWT_SECRET` is missing or shorter than 32 characters. Non-production still uses the dev fallback.
- **Files changed:** `packages/backend/src/services/auth.service.ts`
- **Tests:** `packages/backend/src/services/__tests__/auth.service.startup.test.ts` (new) — 3 tests for missing secret, short secret, and non-production fallback

## 4) OAuth state/PKCE cookies are not marked `secure` (Medium) — FIXED
- **What:** OAuth cookies (`oauth_state`, `code_verifier`) are set without a `secure` attribute.
- **Fix applied:** All 3 OAuth cookie calls (2 Google, 1 GitHub) now include `secure: isProduction` where `isProduction = process.env.NODE_ENV === "production"`, matching the auth token cookie policy.
- **Files changed:** `packages/backend/src/routes/auth.ts`
- **Tests:** `packages/backend/src/routes/__tests__/auth.cookies.test.ts` (new) — 3 behavior tests + 1 source-code structural test

## 5) OAuth user upsert flow is non-transactional (Medium) — FIXED
- **What:** Multi-step account linking/creation is done with separate DB writes and no transaction.
- **Fix applied:** `upsertOAuthUser()` and `upsertDevUser()` are wrapped in `db.transaction()`. All queries inside use the transaction client (`tx`). `initializeLearnerNodes` accepts an optional db/tx client parameter.
- **Files changed:** `packages/backend/src/routes/auth.ts`
- **Note:** Uses READ COMMITTED isolation (Postgres default). Concurrent sign-ups with the same email could still race, but the unique constraint on `users.email` prevents duplicates (one request gets a 500). Acceptable for this app.

## 6) New-user learner-node initialization does full-table load + single large insert (Medium) — FIXED
- **What:** `initializeLearnerNodes()` loads all nodes and inserts all learner-node rows in one call.
- **Fix applied:** Inserts are now chunked into batches of 500 rows. Uses `onConflictDoNothing()` so re-running for an existing user can't overwrite their progress. Accepts a transaction client so it participates in the upsert transaction (Issue 5).
- **Files changed:** `packages/backend/src/routes/auth.ts`

## 7) GitHub OAuth callback does not validate upstream HTTP status before JSON parse (Low) — FIXED
- **What:** The code parses JSON from GitHub API responses without checking `response.ok`.
- **Fix applied:** Added `if (!response.ok) throw new Error(...)` after both GitHub API fetch calls (`/user` and `/user/emails`). Errors are caught by the existing try/catch and result in a generic `?error=oauth_failed` redirect. Status codes are logged server-side only.
- **Files changed:** `packages/backend/src/routes/auth.ts`

## 8) GitHub OAuth accepts unverified emails for account linking (Medium) — FIXED
- **What:** The GitHub email fallback chain included `emails[0]?.email` as a last resort, accepting unverified emails. Since `upsertOAuthUser` links OAuth accounts to existing users by email, an attacker could add a victim's email to their GitHub account without verifying it, then log in to get access to the victim's SkillClimb account.
- **Fix applied:** Removed the unverified email fallback. The chain is now `primary + verified → any verified`. If no verified email exists, the user is redirected with `?error=no_email`.
- **Files changed:** `packages/backend/src/routes/auth.ts`
- **Found during:** Security review of the changes for Issues 1–7

---

## Other changes made during fixes

- **Mock DB filtering:** `packages/backend/src/routes/__tests__/helpers.ts` — Enhanced the mock database to filter rows based on drizzle `eq`/`and` expressions (needed for IDOR tests). Added `makePlacement` factory and `placementRouter` to the test app.
- **Schema type fix:** `packages/backend/src/db/schema.ts` — Added missing `microLesson?: string` to the `questionTemplates` jsonb type (was present in `@skillclimb/core`'s `QuestionTemplate` but missing from the schema, causing a type error in `lessons.test.ts`).
