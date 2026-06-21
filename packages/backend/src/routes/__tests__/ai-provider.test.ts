import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { createTestApp, authCookie, resetIdCounter } from "./helpers.js";

// Mock node:dns/promises so tests don't hit the network and we can simulate
// DNS rebinding (hostname resolving to a private IP).
const resolve4 = vi.fn<(host: string) => Promise<string[]>>();
const resolve6 = vi.fn<(host: string) => Promise<string[]>>();
vi.mock("node:dns/promises", () => ({
  resolve4: (h: string) => resolve4(h),
  resolve6: (h: string) => resolve6(h),
}));

describe("AI Provider routes", () => {
  beforeEach(() => {
    resetIdCounter();
    // Default: hostname resolves to a public IP — pass DNS rebinding check
    resolve4.mockResolvedValue(["93.184.216.34"]);
    resolve6.mockResolvedValue([]);
  });

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

    // ── Expanded private-IP literal blocks ─────────────────────────────

    it.each([
      ["10.0.0.1", "RFC1918 10/8"],
      ["10.255.255.255", "RFC1918 10/8 upper"],
      ["172.16.0.1", "RFC1918 172.16/12 lower"],
      ["172.31.255.254", "RFC1918 172.16/12 upper"],
      ["192.168.1.1", "RFC1918 192.168/16"],
      ["0.0.0.0", "0/8 unspecified range"],
    ])("returns 400 for private IPv4 literal %s (%s)", async (ip) => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: `http://${ip}/hook` });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for IPv6 loopback ::1", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://[::1]/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for IPv6 link-local fe80::", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://[fe80::1]/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    it("returns 400 for IPv6 unique-local fc00::/7", async () => {
      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "http://[fd00::1]/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/local or internal/);
    });

    // ── DNS rebinding mitigation ──────────────────────────────────────

    it("returns 400 when hostname resolves to a private IPv4 (DNS rebinding)", async () => {
      resolve4.mockResolvedValue(["10.0.0.5"]);
      resolve6.mockResolvedValue([]);

      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://evil.example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/private|internal/i);
    });

    it("returns 400 when hostname resolves to a private IPv6 (DNS rebinding)", async () => {
      resolve4.mockResolvedValue([]);
      resolve6.mockResolvedValue(["fd00::1"]);

      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://evil.example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/private|internal/i);
    });

    it("returns 400 when hostname does not resolve", async () => {
      resolve4.mockResolvedValue([]);
      resolve6.mockResolvedValue([]);

      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://nx.example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/resolved/i);
    });

    it("returns 400 when hostname resolves to IPv4-mapped IPv6 of a private address", async () => {
      resolve4.mockResolvedValue([]);
      resolve6.mockResolvedValue(["::ffff:10.0.0.5"]);

      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://sneaky.example.com/hook" });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/private|internal/i);
    });

    it("accepts hostname that resolves to a public IP", async () => {
      resolve4.mockResolvedValue(["8.8.8.8"]);
      resolve6.mockResolvedValue([]);

      const app = createTestApp();
      const cookie = await authCookie("user-1");

      const res = await request(app)
        .put("/api/users/me/ai-provider")
        .set("Cookie", cookie)
        .send({ webhookUrl: "https://public.example.com/hook" });

      expect(res.status).toBe(200);
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
