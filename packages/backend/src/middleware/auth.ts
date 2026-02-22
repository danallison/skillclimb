import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, verifyApiToken } from "../services/auth.service.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

function extractToken(req: Request): string | undefined {
  // 1. Check Authorization: Bearer header (preferred for API/MCP clients)
  const authHeader = req.headers?.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // 2. Fall back to cookie (browser clients)
  return req.cookies?.access_token;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const { userId, api, jti } = await verifyAccessToken(token);

    // API tokens must be validated against the database (revocation check)
    if (api) {
      if (!jti || !(await verifyApiToken(jti))) {
        res.status(401).json({ error: "Token has been revoked" });
        return;
      }
    }

    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
