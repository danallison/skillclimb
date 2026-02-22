import { describe, it, expect, vi, beforeEach } from "vitest";

// In-memory store for API tokens, used by the DB mock
const apiTokenStore = vi.hoisted(() => new Map<string, any>());

vi.mock("../db/connection.js", () => {
  function toCamel(s: string): string {
    return s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
  }

  function extractConditionValues(expr: any): Record<string, any> {
    const conds: Record<string, any> = {};
    if (!expr?.queryChunks) return conds;
    let col: string | null = null;
    for (const chunk of expr.queryChunks) {
      if (chunk.name && chunk.table) {
        col = toCamel(chunk.name as string);
      } else if (col && chunk.encoder) {
        conds[col] = chunk.value;
        col = null;
      } else if (chunk.queryChunks) {
        Object.assign(conds, extractConditionValues(chunk));
        col = null;
      }
    }
    return conds;
  }

  return {
    db: {
      insert: () => ({
        values: (data: any) => {
          apiTokenStore.set(data.id, data);
          return Promise.resolve();
        },
      }),
      select: () => ({
        from: () => ({
          where: (expr: any) => {
            const conds = extractConditionValues(expr);
            let rows = [...apiTokenStore.values()];
            if (conds.id) rows = rows.filter((r: any) => r.id === conds.id);
            if (conds.userId) rows = rows.filter((r: any) => r.userId === conds.userId);
            // Handle gt(expiresAt, date) — filter out expired tokens
            if (conds.expiresAt) rows = rows.filter((r: any) => r.expiresAt > conds.expiresAt);
            return Promise.resolve(rows);
          },
        }),
      }),
      delete: () => ({
        where: (expr: any) => {
          const conds = extractConditionValues(expr);
          if (conds.id) apiTokenStore.delete(conds.id);
          return Promise.resolve();
        },
      }),
    },
  };
});

import {
  createAccessToken,
  verifyAccessToken,
  setAuthCookies,
  clearAuthCookies,
  createApiToken,
  verifyApiToken,
  revokeApiToken,
  listApiTokens,
} from "./auth.service.js";

describe("JWT access tokens", () => {
  it("creates a token that can be verified", async () => {
    const token = await createAccessToken("user-123");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3); // JWT has 3 parts

    const result = await verifyAccessToken(token);
    expect(result.userId).toBe("user-123");
  });

  it("returns different tokens for different users", async () => {
    const token1 = await createAccessToken("user-1");
    const token2 = await createAccessToken("user-2");
    expect(token1).not.toBe(token2);

    expect((await verifyAccessToken(token1)).userId).toBe("user-1");
    expect((await verifyAccessToken(token2)).userId).toBe("user-2");
  });

  it("rejects a tampered token", async () => {
    const token = await createAccessToken("user-123");
    const tampered = token.slice(0, -4) + "XXXX";
    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it("rejects a completely invalid token", async () => {
    await expect(verifyAccessToken("not-a-jwt")).rejects.toThrow();
    await expect(verifyAccessToken("")).rejects.toThrow();
  });
});

describe("setAuthCookies", () => {
  function mockResponse() {
    const cookies: Array<{ name: string; value: string; options: any }> = [];
    return {
      cookies,
      cookie: vi.fn((name: string, value: string, options: any) => {
        cookies.push({ name, value, options });
      }),
      clearCookie: vi.fn(),
    };
  }

  it("sets both access_token and refresh_token cookies", () => {
    const res = mockResponse();
    setAuthCookies(res as any, "access-tok", "refresh-tok");

    expect(res.cookie).toHaveBeenCalledTimes(2);

    const accessCookie = res.cookies.find((c) => c.name === "access_token");
    const refreshCookie = res.cookies.find((c) => c.name === "refresh_token");

    expect(accessCookie).toBeDefined();
    expect(accessCookie!.value).toBe("access-tok");
    expect(accessCookie!.options.httpOnly).toBe(true);
    expect(accessCookie!.options.path).toBe("/");

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie!.value).toBe("refresh-tok");
    expect(refreshCookie!.options.httpOnly).toBe(true);
    expect(refreshCookie!.options.path).toBe("/");
  });

  it("sets secure flag only in production", () => {
    const original = process.env.NODE_ENV;

    process.env.NODE_ENV = "production";
    const prodRes = mockResponse();
    setAuthCookies(prodRes as any, "a", "r");
    expect(prodRes.cookies[0].options.secure).toBe(true);

    process.env.NODE_ENV = "development";
    const devRes = mockResponse();
    setAuthCookies(devRes as any, "a", "r");
    expect(devRes.cookies[0].options.secure).toBe(false);

    process.env.NODE_ENV = original;
  });

  it("sets correct maxAge values", () => {
    const res = mockResponse();
    setAuthCookies(res as any, "a", "r");

    const accessCookie = res.cookies.find((c) => c.name === "access_token");
    const refreshCookie = res.cookies.find((c) => c.name === "refresh_token");

    expect(accessCookie!.options.maxAge).toBe(15 * 60 * 1000); // 15 min
    expect(refreshCookie!.options.maxAge).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
  });
});

describe("clearAuthCookies", () => {
  it("clears both cookies", () => {
    const res = { clearCookie: vi.fn() };
    clearAuthCookies(res as any);

    expect(res.clearCookie).toHaveBeenCalledTimes(2);
    expect(res.clearCookie).toHaveBeenCalledWith("access_token", { path: "/" });
    expect(res.clearCookie).toHaveBeenCalledWith("refresh_token", { path: "/" });
  });
});

// ─── API Token CRUD ─────────────────────────────────────────────────

describe("API token CRUD", () => {
  beforeEach(() => {
    apiTokenStore.clear();
  });

  it("createApiToken returns token and id", async () => {
    const { token, id } = await createApiToken("user-123");
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);
    expect(typeof id).toBe("string");
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("createApiToken stores row in DB", async () => {
    const { id } = await createApiToken("user-123", "Test Token");
    const stored = apiTokenStore.get(id);
    expect(stored).toBeDefined();
    expect(stored.userId).toBe("user-123");
    expect(stored.name).toBe("Test Token");
    expect(stored.expiresAt).toBeInstanceOf(Date);
  });

  it("createApiToken JWT contains jti matching the returned id", async () => {
    const { token, id } = await createApiToken("user-123");
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    expect(payload.jti).toBe(id);
    expect(payload.api).toBe(true);
    expect(payload.userId).toBe("user-123");
  });

  it("verifyApiToken returns true for valid token", async () => {
    const { id } = await createApiToken("user-123");
    expect(await verifyApiToken(id)).toBe(true);
  });

  it("verifyApiToken returns false for nonexistent jti", async () => {
    expect(await verifyApiToken("nonexistent-id")).toBe(false);
  });

  it("verifyApiToken returns false for expired token", async () => {
    const { id } = await createApiToken("user-123");
    // Manually set expiresAt to the past
    const stored = apiTokenStore.get(id);
    stored.expiresAt = new Date(Date.now() - 1000);
    expect(await verifyApiToken(id)).toBe(false);
  });

  it("revokeApiToken deletes from DB", async () => {
    const { id } = await createApiToken("user-123");
    expect(apiTokenStore.has(id)).toBe(true);
    await revokeApiToken(id);
    expect(apiTokenStore.has(id)).toBe(false);
  });

  it("revokeApiToken causes verifyApiToken to return false", async () => {
    const { id } = await createApiToken("user-123");
    expect(await verifyApiToken(id)).toBe(true);
    await revokeApiToken(id);
    expect(await verifyApiToken(id)).toBe(false);
  });

  it("listApiTokens returns tokens for the given user", async () => {
    await createApiToken("user-1", "Token A");
    await createApiToken("user-1", "Token B");
    await createApiToken("user-2", "Token C");

    const user1Tokens = await listApiTokens("user-1");
    expect(user1Tokens).toHaveLength(2);

    const user2Tokens = await listApiTokens("user-2");
    expect(user2Tokens).toHaveLength(1);
  });
});
