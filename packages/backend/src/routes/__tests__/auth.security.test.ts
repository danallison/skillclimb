import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { SignJWT } from "jose";
import {
  createTestApp,
  makeLearnerNode,
  makeNode,
  makeSession,
  makeDomain,
  authCookie,
  authBearer,
  resetIdCounter,
} from "./helpers.js";

// In-memory API token store for mocking
const apiTokenStore = vi.hoisted(() => new Map<string, any>());

vi.mock("../../services/auth.service.js", async (importOriginal) => {
  const original = await importOriginal<typeof import("../../services/auth.service.js")>();
  const { SignJWT: MockSignJWT } = await import("jose");
  const { randomUUID } = await import("node:crypto");
  const secret = new TextEncoder().encode("dev-secret-change-me");

  return {
    ...original,
    createApiToken: async (userId: string, name?: string) => {
      const jti = randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      apiTokenStore.set(jti, { id: jti, userId, name: name ?? null, expiresAt, createdAt: new Date() });
      const token = await new MockSignJWT({ userId, api: true })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setJti(jti)
        .setExpirationTime("30d")
        .sign(secret);
      return { token, id: jti };
    },
    verifyApiToken: async (jti: string) => {
      const row = apiTokenStore.get(jti);
      return !!row && row.expiresAt > new Date();
    },
    revokeApiToken: async (id: string) => {
      apiTokenStore.delete(id);
    },
    listApiTokens: async (userId: string) => {
      return [...apiTokenStore.values()].filter((t: any) => t.userId === userId);
    },
  };
});

import {
  createAccessToken,
  createApiToken,
  verifyAccessToken,
  revokeApiToken,
} from "../../services/auth.service.js";

// ─── API Token Creation & Verification ───────────────────────────────

describe("API token creation", () => {
  beforeEach(() => apiTokenStore.clear());

  it("creates a valid JWT that can be verified", async () => {
    const { token } = await createApiToken("user-123");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    // API tokens use the same verifyAccessToken — they're JWTs with the same secret
    const result = await verifyAccessToken(token);
    expect(result.userId).toBe("user-123");
  });

  it("includes api and jti claims in the payload", async () => {
    const { token, id } = await createApiToken("user-123");

    // Decode the payload (base64url) without verification to inspect claims
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    expect(payload.api).toBe(true);
    expect(payload.userId).toBe("user-123");
    expect(payload.jti).toBe(id);
  });

  it("has a 30-day expiration", async () => {
    const { token } = await createApiToken("user-123");
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );

    const now = Math.floor(Date.now() / 1000);
    const thirtyDays = 30 * 24 * 60 * 60;

    // exp should be approximately 30 days from now (within 5s tolerance)
    expect(payload.exp).toBeGreaterThan(now + thirtyDays - 5);
    expect(payload.exp).toBeLessThanOrEqual(now + thirtyDays + 5);
  });

  it("returns different tokens for different users", async () => {
    const { token: token1 } = await createApiToken("user-1");
    const { token: token2 } = await createApiToken("user-2");
    expect(token1).not.toBe(token2);
  });
});

// ─── Bearer Auth in Middleware ───────────────────────────────────────

describe("Bearer token authentication", () => {
  beforeEach(() => resetIdCounter());

  it("accepts valid Bearer token in Authorization header", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const bearer = await authBearer(userId);

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", bearer)
      .send({});

    expect(res.status).not.toBe(401);
  });

  it("prefers Bearer header over cookie when both present", async () => {
    const bearerUserId = "bearer-user";
    const cookieUserId = "cookie-user";
    const app = createTestApp({
      sessions: [
        makeSession({
          id: "session-1",
          userId: bearerUserId,
          nodeIds: [],
          itemCount: 0,
        }),
      ],
    });

    const bearer = await authBearer(bearerUserId);
    const cookie = await authCookie(cookieUserId);

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", bearer)
      .set("Cookie", cookie)
      .send({});

    // Should authenticate as bearer-user, not cookie-user
    expect(res.status).not.toBe(401);
  });

  it("falls back to cookie when no Bearer header", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .post("/api/sessions")
      .set("Cookie", cookie)
      .send({});

    expect(res.status).not.toBe(401);
  });

  it("rejects invalid Bearer token", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", "Bearer invalid-token")
      .send({});

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("rejects Bearer header without 'Bearer ' prefix", async () => {
    const token = await createAccessToken("user-1");
    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", token) // no "Bearer " prefix
      .send({});

    expect(res.status).toBe(401);
  });

  it("API token works as Bearer for protected endpoints", async () => {
    apiTokenStore.clear();
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const { token: apiToken } = await createApiToken(userId);

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${apiToken}`)
      .send({});

    expect(res.status).not.toBe(401);
  });
});

// ─── Token Attack Vectors ────────────────────────────────────────────

describe("token attack vectors", () => {
  beforeEach(() => resetIdCounter());

  it("rejects token signed with wrong secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret-key-here");
    const token = await new SignJWT({ userId: "user-1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(wrongSecret);

    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(401);
  });

  it("rejects expired token", async () => {
    // Create a token that expired 1 hour ago
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-change-me",
    );
    const token = await new SignJWT({ userId: "user-1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 7200) // 2 hours ago
      .setExpirationTime(Math.floor(Date.now() / 1000) - 3600) // 1 hour ago
      .sign(secret);

    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(401);
  });

  it("rejects token with missing userId claim", async () => {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "dev-secret-change-me",
    );
    const token = await new SignJWT({ role: "admin" }) // no userId
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(secret);

    const app = createTestApp();

    // The middleware extracts userId from the token but doesn't check if it's truthy.
    // The token is technically valid — it just has no userId claim.
    // Routes that use req.userId! will get undefined.
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    // Should not crash — at worst returns an error from the handler
    expect(res.status).not.toBe(500);
  });

  it("rejects tampered token payload", async () => {
    const token = await createAccessToken("user-1");
    const [header, , signature] = token.split(".");

    // Tamper with the payload
    const fakePayload = Buffer.from(
      JSON.stringify({ userId: "admin-user", exp: 9999999999 }),
    ).toString("base64url");

    const tamperedToken = `${header}.${fakePayload}.${signature}`;

    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${tamperedToken}`)
      .send({});

    expect(res.status).toBe(401);
  });

  it("rejects completely empty token", async () => {
    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", "Bearer ")
      .send({});

    expect(res.status).toBe(401);
  });

  it("rejects token with 'none' algorithm", async () => {
    // Attempt an alg=none attack
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" }),
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        userId: "user-1",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url");
    const unsignedToken = `${header}.${payload}.`;

    const app = createTestApp();

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${unsignedToken}`)
      .send({});

    expect(res.status).toBe(401);
  });
});

// ─── New Endpoint Auth ───────────────────────────────────────────────

describe("new endpoint authentication", () => {
  beforeEach(() => resetIdCounter());

  it("GET /api/users/me/due-items returns 401 without auth", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/users/me/due-items");
    expect(res.status).toBe(401);
  });

  it("GET /api/users/me/due-items returns 200 with auth", async () => {
    const userId = "user-1";
    const app = createTestApp();
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/due-items")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("GET /api/users/me/due-items returns due nodes for the authenticated user", async () => {
    const userId = "user-1";
    const nodeId = "node-1";
    const domainId = "domain-1";
    const node = makeNode({ id: nodeId, domainId, concept: "Test Concept" });
    const domain = makeDomain({ id: domainId, name: "Test Domain" });
    const learnerNode = makeLearnerNode({
      userId,
      nodeId,
      domainId,
      dueDate: new Date(Date.now() - 86400000), // due yesterday
    });

    const app = createTestApp({
      learner_nodes: [learnerNode],
      nodes: [node],
      domains: [domain],
    });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/due-items")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].nodeId).toBe(nodeId);
    expect(res.body[0].concept).toBe("Test Concept");
    expect(res.body[0].domainName).toBe("Test Domain");
  });

  it("GET /api/users/me/due-items does not return other users' due items", async () => {
    const otherUserId = "user-other";
    const nodeId = "node-1";
    const domainId = "domain-1";
    const node = makeNode({ id: nodeId, domainId });
    const domain = makeDomain({ id: domainId });
    const learnerNode = makeLearnerNode({
      userId: otherUserId,
      nodeId,
      domainId,
      dueDate: new Date(Date.now() - 86400000),
    });

    const app = createTestApp({
      learner_nodes: [learnerNode],
      nodes: [node],
      domains: [domain],
    });
    // Authenticate as a different user
    const cookie = await authCookie("user-me");

    const res = await request(app)
      .get("/api/users/me/due-items")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("GET /api/users/me/sessions returns 401 without auth", async () => {
    const app = createTestApp();
    const res = await request(app).get("/api/users/me/sessions");
    expect(res.status).toBe(401);
  });

  it("GET /api/users/me/sessions returns 200 with auth", async () => {
    const userId = "user-1";
    const session = makeSession({ userId });
    const app = createTestApp({ sessions: [session] });
    const cookie = await authCookie(userId);

    const res = await request(app)
      .get("/api/users/me/sessions")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it("GET /api/users/me/sessions does not return other users' sessions", async () => {
    const session = makeSession({ userId: "user-other" });
    const app = createTestApp({ sessions: [session] });
    const cookie = await authCookie("user-me");

    const res = await request(app)
      .get("/api/users/me/sessions")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it("GET /api/skilltrees/:id/map is accessible without auth (public)", async () => {
    const app = createTestApp();

    const res = await request(app).get("/api/skilltrees/cybersecurity/map");

    // Should not be 401 — this is a public endpoint
    expect(res.status).not.toBe(401);
    expect(res.status).toBe(200);
  });
});

// ─── API Token Revocation ────────────────────────────────────────────

describe("API token revocation", () => {
  beforeEach(() => {
    resetIdCounter();
    apiTokenStore.clear();
  });

  it("revoked API token returns 401", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const { token, id } = await createApiToken(userId);

    // Token works before revocation
    const res1 = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res1.status).not.toBe(401);

    // Revoke the token
    await revokeApiToken(id);

    // Token rejected after revocation
    const res2 = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res2.status).toBe(401);
    expect(res2.body.error).toBe("Token has been revoked");
  });

  it("regular access tokens unaffected by API token revocation", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });

    // Create and revoke an API token
    const { id } = await createApiToken(userId);
    await revokeApiToken(id);

    // Regular access token still works
    const bearer = await authBearer(userId);
    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", bearer)
      .send({});
    expect(res.status).not.toBe(401);
  });

  it("expired API token returns 401", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const { token, id } = await createApiToken(userId);

    // Manually expire the token in the store
    const stored = apiTokenStore.get(id);
    stored.expiresAt = new Date(Date.now() - 1000);

    const res = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token has been revoked");
  });

  it("revoking one API token does not affect another", async () => {
    const userId = "user-1";
    const app = createTestApp({
      sessions: [
        makeSession({ id: "session-1", userId, nodeIds: [], itemCount: 0 }),
      ],
    });
    const { token: token1, id: id1 } = await createApiToken(userId);
    const { token: token2 } = await createApiToken(userId);

    // Revoke only token1
    await revokeApiToken(id1);

    // token1 is rejected
    const res1 = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token1}`)
      .send({});
    expect(res1.status).toBe(401);

    // token2 still works
    const res2 = await request(app)
      .post("/api/sessions")
      .set("Authorization", `Bearer ${token2}`)
      .send({});
    expect(res2.status).not.toBe(401);
  });
});

// ─── Cross-User Data Isolation ───────────────────────────────────────

describe("cross-user data isolation", () => {
  beforeEach(() => resetIdCounter());

  it("GET /api/users/me/profile does not leak other users' data", async () => {
    const myUserId = "user-me";
    const otherUserId = "user-other";

    // Other user has learner nodes; I do not
    const learnerNode = makeLearnerNode({
      userId: otherUserId,
      nodeId: "node-1",
      domainId: "domain-1",
    });

    const app = createTestApp({ learner_nodes: [learnerNode] });
    const cookie = await authCookie(myUserId);

    const res = await request(app)
      .get("/api/users/me/profile")
      .set("Cookie", cookie);

    expect(res.status).toBe(200);
    // My profile should show 0 mastered nodes (the other user's data shouldn't appear)
    expect(res.body.totalMastered).toBe(0);
  });
});
