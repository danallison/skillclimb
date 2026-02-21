# Issues Found (Codebase Review)

Date: 2026-02-21

## 1) Broken object-level authorization on session fetch (High)
- **What:** Any authenticated user can fetch any session by ID.
- **Evidence:** [packages/backend/src/routes/sessions.ts#L27](packages/backend/src/routes/sessions.ts#L27) calls `getSession(id)` without user scoping; [packages/backend/src/services/session.service.ts#L98](packages/backend/src/services/session.service.ts#L98) queries only by `sessionId`.
- **Risk:** IDOR/BOLA data exposure across users (session contents, learner state).
- **Fix:** Require `userId` in `getSession()`, query by both `sessionId` + `userId`, and return 404/403 when mismatched.

## 2) Broken object-level authorization on placement endpoints (High)
- **What:** Placement operations are not scoped to the authenticated user.
- **Evidence:** [packages/backend/src/routes/placement.ts#L42](packages/backend/src/routes/placement.ts#L42), [packages/backend/src/routes/placement.ts#L59](packages/backend/src/routes/placement.ts#L59), and [packages/backend/src/routes/placement.ts#L78](packages/backend/src/routes/placement.ts#L78) call services with `placementId` only; services query by ID only at [packages/backend/src/services/placement.service.ts#L168](packages/backend/src/services/placement.service.ts#L168), [packages/backend/src/services/placement.service.ts#L381](packages/backend/src/services/placement.service.ts#L381), and [packages/backend/src/services/placement.service.ts#L437](packages/backend/src/services/placement.service.ts#L437).
- **Risk:** Users can read/modify/abandon other users’ placement tests if IDs are discovered.
- **Fix:** Pass `req.userId` into service methods and enforce `WHERE id = ? AND user_id = ?` on all placement reads/writes.

## 3) Insecure default JWT secret in backend (High)
- **What:** JWT signing falls back to a hardcoded development secret.
- **Evidence:** [packages/backend/src/services/auth.service.ts#L9](packages/backend/src/services/auth.service.ts#L9).
- **Risk:** If deployed without `JWT_SECRET`, tokens are forgeable.
- **Fix:** Fail fast at startup when `JWT_SECRET` is missing in non-dev; consider requiring a minimum secret length/entropy.

## 4) OAuth state/PKCE cookies are not marked `secure` (Medium)
- **What:** OAuth cookies (`oauth_state`, `code_verifier`) are set without a `secure` attribute.
- **Evidence:** [packages/backend/src/routes/auth.ts#L30](packages/backend/src/routes/auth.ts#L30), [packages/backend/src/routes/auth.ts#L36](packages/backend/src/routes/auth.ts#L36), [packages/backend/src/routes/auth.ts#L96](packages/backend/src/routes/auth.ts#L96).
- **Risk:** On non-HTTPS paths/environments, these cookies may be transmitted insecurely.
- **Fix:** Set `secure: process.env.NODE_ENV === "production"` for OAuth cookies, aligned with auth token cookie policy.

## 5) OAuth user upsert flow is non-transactional (Medium)
- **What:** Multi-step account linking/creation is done with separate DB writes and no transaction.
- **Evidence:** [packages/backend/src/routes/auth.ts#L251](packages/backend/src/routes/auth.ts#L251) onward, including inserts at [packages/backend/src/routes/auth.ts#L287](packages/backend/src/routes/auth.ts#L287) and [packages/backend/src/routes/auth.ts#L309](packages/backend/src/routes/auth.ts#L309).
- **Risk:** Race conditions can produce duplicate-key errors or partially completed user provisioning.
- **Fix:** Wrap `upsertOAuthUser()` in a DB transaction and use conflict-safe upsert patterns.

## 6) New-user learner-node initialization does full-table load + single large insert (Medium)
- **What:** `initializeLearnerNodes()` loads all nodes and inserts all learner-node rows in one call.
- **Evidence:** [packages/backend/src/routes/auth.ts#L343](packages/backend/src/routes/auth.ts#L343) and [packages/backend/src/routes/auth.ts#L346](packages/backend/src/routes/auth.ts#L346).
- **Risk:** Poor scalability for large skill trees (memory pressure, oversized SQL statements, slow sign-up).
- **Fix:** Batch inserts (chunking), or perform server-side `INSERT ... SELECT`, and consider async/background provisioning.

## 7) GitHub OAuth callback does not validate upstream HTTP status before JSON parse (Low)
- **What:** The code parses JSON from GitHub API responses without checking `response.ok`.
- **Evidence:** [packages/backend/src/routes/auth.ts#L122](packages/backend/src/routes/auth.ts#L122), [packages/backend/src/routes/auth.ts#L125](packages/backend/src/routes/auth.ts#L125), [packages/backend/src/routes/auth.ts#L132](packages/backend/src/routes/auth.ts#L132), [packages/backend/src/routes/auth.ts#L135](packages/backend/src/routes/auth.ts#L135).
- **Risk:** Error payloads can be misinterpreted as valid shapes, causing brittle behavior and noisy failures.
- **Fix:** Check `response.ok` and handle rate-limit/error responses explicitly.
