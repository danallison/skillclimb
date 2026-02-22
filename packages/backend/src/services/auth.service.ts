import { randomBytes, createHash, randomUUID } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../db/connection.js";
import { refreshTokens, apiTokens } from "../db/schema.js";
import type { Response } from "express";

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required in production");
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters in production");
  }
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-change-me",
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
): Promise<{ userId: string; api?: boolean; jti?: string }> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return {
    userId: payload.userId as string,
    api: payload.api as boolean | undefined,
    jti: payload.jti as string | undefined,
  };
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

const API_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createApiToken(
  userId: string,
  name?: string,
): Promise<{ token: string; id: string }> {
  const jti = randomUUID();
  const expiresAt = new Date(Date.now() + API_TOKEN_EXPIRY_MS);

  await db.insert(apiTokens).values({ id: jti, userId, name: name ?? null, expiresAt });

  const token = await new SignJWT({ userId, api: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(jti)
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  return { token, id: jti };
}

export async function verifyApiToken(jti: string): Promise<boolean> {
  const [row] = await db
    .select({ id: apiTokens.id })
    .from(apiTokens)
    .where(and(eq(apiTokens.id, jti), gt(apiTokens.expiresAt, new Date())));
  return !!row;
}

export async function revokeApiToken(id: string): Promise<void> {
  await db.delete(apiTokens).where(eq(apiTokens.id, id));
}

export async function listApiTokens(userId: string): Promise<
  Array<{ id: string; name: string | null; createdAt: Date; expiresAt: Date }>
> {
  return db
    .select({
      id: apiTokens.id,
      name: apiTokens.name,
      createdAt: apiTokens.createdAt,
      expiresAt: apiTokens.expiresAt,
    })
    .from(apiTokens)
    .where(eq(apiTokens.userId, userId));
}
