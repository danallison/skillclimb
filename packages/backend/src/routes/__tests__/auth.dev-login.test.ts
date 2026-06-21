import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import express from "express";
import cookieParser from "cookie-parser";
import request from "supertest";

// Mock heavy collaborators so we can import auth.ts cheaply for routing-only tests.
// upsertDevUser is the only real side-effect along the /dev path; stub it to a fixed userId.
vi.mock("../../db/connection.js", () => ({
  db: {
    transaction: vi.fn(),
  },
  client: {},
}));

vi.mock("../../services/oauth.config.js", () => ({
  google: {},
  github: {},
  appUrl: "http://localhost:5173",
}));

vi.mock("../../services/auth.service.js", () => ({
  createAccessToken: vi.fn(async () => "test-access-token"),
  createRefreshToken: vi.fn(async () => ({ token: "test-refresh-token" })),
  rotateRefreshToken: vi.fn(),
  revokeRefreshToken: vi.fn(),
  setAuthCookies: vi.fn((res: any) => res),
  clearAuthCookies: vi.fn(),
  verifyAccessToken: vi.fn(),
}));

async function loadAuthRouter() {
  vi.resetModules();
  const mod = await import("../auth.js");
  return mod.authRouter ?? mod.default;
}

function makeApp(router: any) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", router);
  return app;
}

describe("Dev login route gating (ENABLE_DEV_LOGIN)", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv.NODE_ENV = process.env.NODE_ENV;
    savedEnv.ENABLE_DEV_LOGIN = process.env.ENABLE_DEV_LOGIN;
  });

  afterEach(() => {
    for (const key of ["NODE_ENV", "ENABLE_DEV_LOGIN"] as const) {
      if (savedEnv[key] === undefined) delete process.env[key];
      else process.env[key] = savedEnv[key];
    }
  });

  it("returns 404 when ENABLE_DEV_LOGIN is unset (non-production)", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.ENABLE_DEV_LOGIN;

    const router = await loadAuthRouter();
    const app = makeApp(router);

    const res = await request(app)
      .post("/api/auth/dev")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when NODE_ENV=production even with ENABLE_DEV_LOGIN=true", async () => {
    process.env.NODE_ENV = "production";
    process.env.ENABLE_DEV_LOGIN = "true";

    const router = await loadAuthRouter();
    const app = makeApp(router);

    const res = await request(app)
      .post("/api/auth/dev")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(404);
  });

  it("returns 404 when ENABLE_DEV_LOGIN is something other than 'true'", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_LOGIN = "1"; // truthy-looking but not exactly "true"

    const router = await loadAuthRouter();
    const app = makeApp(router);

    const res = await request(app)
      .post("/api/auth/dev")
      .send({ email: "test@example.com" });

    expect(res.status).toBe(404);
  });

  it("mounts /dev route when NODE_ENV != production and ENABLE_DEV_LOGIN=true", async () => {
    process.env.NODE_ENV = "development";
    process.env.ENABLE_DEV_LOGIN = "true";

    const router = await loadAuthRouter();
    const app = makeApp(router);

    // We don't fully exercise upsertDevUser (it hits the real db); just confirm
    // the route is registered by sending an empty body and expecting 400 from
    // the email-required guard, NOT 404 from a missing route.
    const res = await request(app)
      .post("/api/auth/dev")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/email/i);
  });
});
