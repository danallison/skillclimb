import { Router } from "express";
import { eq, and, isNull } from "drizzle-orm";
import { generateState, generateCodeVerifier, decodeIdToken } from "arctic";
import { google, github, appUrl } from "../services/oauth.config.js";
import {
  createAccessToken,
  createRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  verifyAccessToken,
} from "../services/auth.service.js";
import { db } from "../db/connection.js";
import { users, oauthAccounts, learnerNodes, nodes } from "../db/schema.js";
// Type that accepts both the db connection and a transaction client
type DbClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

const router = Router();
const isProduction = process.env.NODE_ENV === "production";

// --- Google OAuth ---

router.get("/login/google", (_req, res) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "email",
    "profile",
  ]);

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 10 * 60 * 1000,
    sameSite: "lax",
    path: "/",
  });
  res.cookie("code_verifier", codeVerifier, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 10 * 60 * 1000,
    sameSite: "lax",
    path: "/",
  });

  res.redirect(url.toString());
});

router.get("/callback/google", async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;
  const codeVerifier = req.cookies?.code_verifier;

  // Clear OAuth cookies
  res.clearCookie("oauth_state", { path: "/" });
  res.clearCookie("code_verifier", { path: "/" });

  if (!code || !state || state !== storedState || !codeVerifier) {
    res.redirect(`${appUrl}?error=invalid_state`);
    return;
  }

  try {
    const tokens = await google.validateAuthorizationCode(
      code as string,
      codeVerifier,
    );
    const idToken = tokens.idToken();
    const claims = decodeIdToken(idToken) as {
      sub: string;
      email: string;
      name?: string;
    };

    const userId = await upsertOAuthUser(
      "google",
      claims.sub,
      claims.email,
      claims.name ?? null,
    );

    const accessToken = await createAccessToken(userId);
    const refreshToken = await createRefreshToken(userId);
    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(appUrl);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${appUrl}?error=oauth_failed`);
  }
});

// --- GitHub OAuth ---

router.get("/login/github", (_req, res) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, ["user:email"]);

  res.cookie("oauth_state", state, {
    httpOnly: true,
    secure: isProduction,
    maxAge: 10 * 60 * 1000,
    sameSite: "lax",
    path: "/",
  });

  res.redirect(url.toString());
});

router.get("/callback/github", async (req, res) => {
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  res.clearCookie("oauth_state", { path: "/" });

  if (!code || !state || state !== storedState) {
    res.redirect(`${appUrl}?error=invalid_state`);
    return;
  }

  try {
    const tokens = await github.validateAuthorizationCode(code as string);
    const accessToken = tokens.accessToken();

    // Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userResponse.ok) {
      throw new Error(`GitHub user API returned ${userResponse.status}`);
    }
    const githubUser = (await userResponse.json()) as {
      id: number;
      name: string | null;
      login: string;
    };

    // Fetch email (may be private)
    const emailResponse = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!emailResponse.ok) {
      throw new Error(`GitHub emails API returned ${emailResponse.status}`);
    }
    const emails = (await emailResponse.json()) as Array<{
      email: string;
      primary: boolean;
      verified: boolean;
    }>;
    const primaryEmail =
      emails.find((e) => e.primary && e.verified)?.email ??
      emails.find((e) => e.verified)?.email;

    if (!primaryEmail) {
      res.redirect(`${appUrl}?error=no_email`);
      return;
    }

    const userId = await upsertOAuthUser(
      "github",
      String(githubUser.id),
      primaryEmail,
      githubUser.name ?? githubUser.login,
    );

    const jwtAccessToken = await createAccessToken(userId);
    const refreshToken = await createRefreshToken(userId);
    setAuthCookies(res, jwtAccessToken, refreshToken);

    res.redirect(appUrl);
  } catch (err) {
    console.error("GitHub OAuth callback error:", err);
    res.redirect(`${appUrl}?error=oauth_failed`);
  }
});

// --- Dev login (non-production only) ---

if (process.env.NODE_ENV !== "production") {
  router.post("/dev", async (req, res) => {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({ error: "email is required" });
      return;
    }

    try {
      const userId = await upsertDevUser(email);
      const accessToken = await createAccessToken(userId);
      const refreshToken = await createRefreshToken(userId);
      setAuthCookies(res, accessToken, refreshToken);
      res.json({ ok: true });
    } catch (err) {
      console.error("Dev login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  });
}

// --- Token refresh ---

router.post("/refresh", async (req, res) => {
  const oldToken = req.cookies?.refresh_token;
  if (!oldToken) {
    res.status(401).json({ error: "No refresh token" });
    return;
  }

  const result = await rotateRefreshToken(oldToken);
  if (!result) {
    clearAuthCookies(res);
    res.status(401).json({ error: "Invalid refresh token" });
    return;
  }

  setAuthCookies(res, result.accessToken, result.refreshToken);
  res.json({ ok: true });
});

// --- Logout ---

router.post("/logout", async (req, res) => {
  const token = req.cookies?.refresh_token;
  if (token) {
    await revokeRefreshToken(token);
  }
  clearAuthCookies(res);
  res.json({ ok: true });
});

// --- Current user ---

router.get("/me", async (req, res) => {
  const token = req.cookies?.access_token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  try {
    const { userId } = await verifyAccessToken(token);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    res.json({ id: user.id, email: user.email, name: user.name });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});

// --- Upsert logic (account linking) ---

async function upsertOAuthUser(
  provider: string,
  providerAccountId: string,
  email: string,
  name: string | null,
): Promise<string> {
  return db.transaction(async (tx) => {
    // 1. Check for existing oauth_account
    const [existingOAuth] = await tx
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerAccountId, providerAccountId),
        ),
      );

    if (existingOAuth) {
      // Update name if we have one and user doesn't
      if (name) {
        await tx
          .update(users)
          .set({ name })
          .where(and(eq(users.id, existingOAuth.userId), isNull(users.name)));
      }
      return existingOAuth.userId;
    }

    // 2. Check for existing user by email (account linking)
    const [existingUser] = await tx
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      // Link this OAuth provider to the existing user
      await tx.insert(oauthAccounts).values({
        userId: existingUser.id,
        provider,
        providerAccountId,
        email,
      });
      // Update name if missing
      if (name && !existingUser.name) {
        await tx
          .update(users)
          .set({ name })
          .where(eq(users.id, existingUser.id));
      }
      return existingUser.id;
    }

    // 3. Create new user + oauth_account + initialize learner nodes
    const [newUser] = await tx
      .insert(users)
      .values({ email, name })
      .returning();

    await tx.insert(oauthAccounts).values({
      userId: newUser.id,
      provider,
      providerAccountId,
      email,
    });

    await initializeLearnerNodes(newUser.id, tx);

    return newUser.id;
  });
}

async function upsertDevUser(email: string): Promise<string> {
  return db.transaction(async (tx) => {
    // Check for existing user by email
    const [existingUser] = await tx
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return existingUser.id;
    }

    // Create new user + initialize learner nodes
    const [newUser] = await tx
      .insert(users)
      .values({ email })
      .returning();

    await initializeLearnerNodes(newUser.id, tx);

    return newUser.id;
  });
}

const BATCH_SIZE = 500;

export async function initializeLearnerNodes(
  userId: string,
  client: DbClient | typeof db = db,
): Promise<void> {
  const allNodes = await client.select().from(nodes);
  if (allNodes.length === 0) return;

  const rows = allNodes.map((node) => ({
    userId,
    nodeId: node.id,
    domainId: node.domainId,
    easiness: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: new Date(),
    confidenceHistory: [] as Array<{ confidence: number; wasCorrect: boolean; timestamp: string }>,
    domainWeight: 1.0,
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await client.insert(learnerNodes).values(batch).onConflictDoNothing();
  }
}

export const authRouter = router;
