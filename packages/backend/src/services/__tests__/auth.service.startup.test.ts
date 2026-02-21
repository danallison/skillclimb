import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("JWT secret validation", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when JWT_SECRET is missing in production", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.JWT_SECRET;

    await expect(
      import("../auth.service.js"),
    ).rejects.toThrow(/JWT_SECRET/);
  });

  it("throws when JWT_SECRET is too short in production", async () => {
    process.env.NODE_ENV = "production";
    process.env.JWT_SECRET = "short";

    await expect(
      import("../auth.service.js"),
    ).rejects.toThrow(/JWT_SECRET/);
  });

  it("allows fallback in non-production", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.JWT_SECRET;

    const mod = await import("../auth.service.js");
    expect(mod.createAccessToken).toBeDefined();
  });
});
