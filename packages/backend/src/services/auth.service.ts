import { randomBytes, createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { refreshTokens } from "../db/schema.js";
import type { Response } from "express";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-me",
);

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function createAccessToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAccessToken(
  token: string,
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return { userId: payload.userId as string };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await db.insert(refreshTokens).values({ userId, tokenHash, expiresAt });
  return token;
}

export async function rotateRefreshToken(
  oldToken: string,
): Promise<{ accessToken: string; refreshToken: string; userId: string } | null> {
  const oldHash = hashToken(oldToken);

  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, oldHash));

  if (!row || row.expiresAt < new Date()) {
    // If expired or not found, clean up and reject
    if (row) {
      await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));
    }
    return null;
  }

  // Delete old token
  await db.delete(refreshTokens).where(eq(refreshTokens.id, row.id));

  // Create new pair
  const accessToken = await createAccessToken(row.userId);
  const refreshToken = await createRefreshToken(row.userId);

  return { accessToken, refreshToken, userId: row.userId };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await db.delete(refreshTokens).where(eq(refreshTokens.tokenHash, tokenHash));
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("access_token", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("access_token", { path: "/" });
  res.clearCookie("refresh_token", { path: "/" });
}
