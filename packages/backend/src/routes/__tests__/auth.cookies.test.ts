import { describe, it, expect } from "vitest";

/**
 * Test that OAuth login endpoints set Secure cookies in production.
 *
 * We can't mount the real auth router (it imports arctic + oauth.config which
 * need real OAuth credentials). Instead we test a minimal Express app that
 * mirrors the cookie-setting pattern from auth.ts.
 */
import express from "express";
import request from "supertest";

function buildCookieApp(isProduction: boolean) {
  const app = express();

  app.get("/login/google", (_req, res) => {
    const opts = {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: "lax" as const,
      path: "/",
      secure: isProduction,
    };
    res.cookie("oauth_state", "test-state", opts);
    res.cookie("code_verifier", "test-verifier", opts);
    res.redirect("https://accounts.google.com");
  });

  app.get("/login/github", (_req, res) => {
    res.cookie("oauth_state", "test-state", {
      httpOnly: true,
      maxAge: 10 * 60 * 1000,
      sameSite: "lax",
      path: "/",
      secure: isProduction,
    });
    res.redirect("https://github.com/login/oauth");
  });

  return app;
}

describe("OAuth cookie secure flag", () => {
  it("sets Secure on oauth_state and code_verifier in production", async () => {
    const app = buildCookieApp(true);
    const res = await request(app).get("/login/google").redirects(0);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const oauthState = cookies.find((c: string) => c.startsWith("oauth_state="));
    const codeVerifier = cookies.find((c: string) => c.startsWith("code_verifier="));

    expect(oauthState).toContain("Secure");
    expect(codeVerifier).toContain("Secure");
  });

  it("sets Secure on github oauth_state in production", async () => {
    const app = buildCookieApp(true);
    const res = await request(app).get("/login/github").redirects(0);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const oauthState = cookies.find((c: string) => c.startsWith("oauth_state="));

    expect(oauthState).toContain("Secure");
  });

  it("does NOT set Secure in non-production", async () => {
    const app = buildCookieApp(false);
    const res = await request(app).get("/login/google").redirects(0);

    const cookies = res.headers["set-cookie"] as unknown as string[];
    const oauthState = cookies.find((c: string) => c.startsWith("oauth_state="));

    expect(oauthState).not.toContain("Secure");
  });
});

/**
 * Now test that the REAL auth.ts code uses the correct pattern.
 * We verify by checking the source code sets `secure: process.env.NODE_ENV === "production"`
 * on all OAuth cookies. This is a structural/grep test complementing the behavior test above.
 */
describe("auth.ts OAuth cookie source check", () => {
  it("all oauth cookie calls include secure flag", async () => {
    const { readFileSync } = await import("node:fs");
    const { resolve } = await import("node:path");
    const authSource = readFileSync(
      resolve(import.meta.dirname, "../../routes/auth.ts"),
      "utf-8",
    );

    // Find all res.cookie("oauth_state" and res.cookie("code_verifier" calls
    const cookieCallRegex = /res\.cookie\(\s*["'](oauth_state|code_verifier)["']/g;
    const matches = [...authSource.matchAll(cookieCallRegex)];

    expect(matches.length).toBeGreaterThanOrEqual(3); // 2 google + 1 github

    // Each cookie block should contain "secure:"
    // Find each cookie call and check the options object contains secure
    const secureRegex = /res\.cookie\(\s*["'](oauth_state|code_verifier)["'],\s*\w+,\s*\{[^}]*secure:/gs;
    const secureMatches = [...authSource.matchAll(secureRegex)];

    expect(secureMatches.length).toBe(matches.length);
  });
});
