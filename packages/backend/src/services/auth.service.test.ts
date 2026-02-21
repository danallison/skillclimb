import { describe, it, expect, vi } from "vitest";
import { createAccessToken, verifyAccessToken, setAuthCookies, clearAuthCookies } from "./auth.service.js";

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
