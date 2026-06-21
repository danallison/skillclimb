import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { aiLimiter, authLimiter, globalLimiter } from "../rateLimiter.js";

function makeApp(middlewares: express.RequestHandler[], userId?: string) {
  const app = express();
  app.use(express.json());
  if (userId) {
    // Stand in for the real auth middleware — populate req.userId so the
    // aiLimiter's keyGenerator pins to the user, not the test IP.
    app.use((req, _res, next) => {
      (req as any).userId = userId;
      next();
    });
  }
  for (const m of middlewares) app.use(m);
  app.get("/ping", (_req, res) => res.json({ ok: true }));
  return app;
}

describe("aiLimiter", () => {
  it("allows up to 20 requests per minute, then 429s", { timeout: 15_000 }, async () => {
    const app = makeApp([aiLimiter], "user-rate-1");

    // 20 requests should all succeed
    for (let i = 0; i < 20; i++) {
      const res = await request(app).get("/ping");
      expect(res.status).toBe(200);
    }

    const blocked = await request(app).get("/ping");
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toMatch(/too many ai requests/i);
  });

  it("keys by userId, so different users get independent quotas", { timeout: 15_000 }, async () => {
    const appA = makeApp([aiLimiter], "user-rate-A");
    const appB = makeApp([aiLimiter], "user-rate-B");

    // Exhaust user A's quota
    for (let i = 0; i < 20; i++) {
      await request(appA).get("/ping");
    }
    const blockedA = await request(appA).get("/ping");
    expect(blockedA.status).toBe(429);

    // User B should still be allowed (separate key)
    const allowedB = await request(appB).get("/ping");
    expect(allowedB.status).toBe(200);
  });

  it("exposes standard draft-7 rate limit headers", async () => {
    const app = makeApp([aiLimiter], "user-rate-headers");

    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    // express-rate-limit emits these when standardHeaders: "draft-7"
    expect(res.headers["ratelimit"]).toBeDefined();
    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });
});

describe("authLimiter", () => {
  it("emits rate-limit headers and allows requests under the limit", async () => {
    const app = makeApp([authLimiter]);

    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });
});

describe("globalLimiter", () => {
  it("emits rate-limit headers and allows requests under the limit", async () => {
    const app = makeApp([globalLimiter]);

    const res = await request(app).get("/ping");
    expect(res.status).toBe(200);
    expect(res.headers["ratelimit-policy"]).toBeDefined();
  });
});
