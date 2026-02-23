import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import helmet from "helmet";

function createHelmetApp() {
  const app = express();
  app.use(helmet());
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  return app;
}

describe("security headers", () => {
  it("includes x-content-type-options: nosniff", async () => {
    const res = await request(createHelmetApp()).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });

  it("includes x-frame-options", async () => {
    const res = await request(createHelmetApp()).get("/api/health");
    expect(res.headers["x-frame-options"]).toBeDefined();
  });

  it("includes strict-transport-security", async () => {
    const res = await request(createHelmetApp()).get("/api/health");
    expect(res.headers["strict-transport-security"]).toBeDefined();
  });

  it("includes content-security-policy", async () => {
    const res = await request(createHelmetApp()).get("/api/health");
    expect(res.headers["content-security-policy"]).toBeDefined();
  });
});
