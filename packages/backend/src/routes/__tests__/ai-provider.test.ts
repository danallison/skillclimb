import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { createTestApp, authCookie, resetIdCounter } from "./helpers.js";

describe("AI Provider routes", () => {
  beforeEach(() => resetIdCounter());

  describe("GET /api/users/me/ai-provider", () => {
    it("returns null when no config exists", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .get("/api/users/me/ai-provider")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });

    it("returns config when one exists without exposing secret", async () => {
      const app = createTestApp({
        user_ai_providers: [
          {
            id: "provider-1",
            userId: "user-1",
            webhookUrl: "https://example.com/webhook",
            secret: "s3cret",
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .get("/api/users/me/ai-provider")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.webhookUrl).toBe("https://example.com/webhook");
      expect(res.body.hasSecret).toBe(true);
      expect(res.body.secret).toBeUndefined();
      expect(res.body.enabled).toBe(true);
    });

    it("returns hasSecret false when no secret is set", async () => {
      const app = createTestApp({
        user_ai_providers: [
          {
            id: "provider-1",
            userId: "user-1",
            webhookUrl: "https://example.com/webhook",
            secret: null,
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .get("/api/users/me/ai-provider")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.hasSecret).toBe(false);
    });

    it("returns null when config is disabled", async () => {
      const app = createTestApp({
        user_ai_providers: [
          {
            id: "provider-1",
            userId: "user-1",
            webhookUrl: "https://example.com/webhook",
            secret: null,
            enabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .get("/api/users/me/ai-provider")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body).toBeNull();
    });
  });

  describe("PUT /api/users/me/ai-provider", () => {
    it("creates config", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://example.com/hook", secret: "key123" });

      expect(res.status).toBe(200);
      expect(res.body.webhookUrl).toBe("https://example.com/hook");
      expect(res.body.hasSecret).toBe(true);
      expect(res.body.enabled).toBe(true);
    });

    it("updates existing config", async () => {
      const app = createTestApp({
        user_ai_providers: [
          {
            id: "provider-1",
            userId: "user-1",
            webhookUrl: "https://old.com/webhook",
            secret: null,
            enabled: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://new.com/webhook" });

      expect(res.status).toBe(200);
      expect(res.body.webhookUrl).toBe("https://new.com/webhook");
      expect(res.body.enabled).toBe(true);
    });

    it("returns 400 when webhookUrl is missing", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/webhookUrl/);
    });

    it("returns 400 for invalid URL scheme", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "ftp://example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/HTTP or HTTPS/);
    });

    it("returns 400 for non-URL string", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "not a url" });

      expect(res.status).toBe(400);
    });

    it("returns 400 when secret is not a string", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://example.com/hook", secret: 12345 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/secret must be a string/);
    });

    it("returns 400 for localhost webhook URL", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://localhost:8080/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for 127.x.x.x webhook URL", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://127.0.0.1:3001/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for cloud metadata IP", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://169.254.169.254/latest/meta-data/" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for URL with embedded credentials", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://admin:password@example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/credentials/);
    });

    it("returns 400 for overly long webhookUrl", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://example.com/" + "a".repeat(2100) });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at most/);
    });

    it("returns 400 for overly long secret", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://example.com/hook", secret: "x".repeat(300) });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/at most/);
    });
  });

  describe("DELETE /api/users/me/ai-provider", () => {
    it("disables config", async () => {
      const app = createTestApp({
        user_ai_providers: [
          {
            id: "provider-1",
            userId: "user-1",
            webhookUrl: "https://example.com/webhook",
            secret: null,
            enabled: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      });
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .delete("/api/users/me/ai-provider")
        .set("Cookie", cookie);

      expect(res.status).toBe(200);
      expect(res.body.disabled).toBe(true);
    });
  });

  describe("auth", () => {
    it("returns 401 without auth", async () => {
      const app = createTestApp();

      const res = await request(app).get("/api/users/me/ai-provider");

      expect(res.status).toBe(401);
    });
  });
});
