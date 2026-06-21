import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later." },
});

/** Stricter per-user rate limit for AI-calling endpoints (cost control). */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    const userId = (req as any).userId;
    if (typeof userId === "string" && userId.length > 0) return userId;
    return ipKeyGenerator(req.ip ?? "unknown");
  },
  message: { error: "Too many AI requests, please try again later." },
});
