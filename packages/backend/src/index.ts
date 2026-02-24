import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { Layer } from "effect";
import { sql } from "drizzle-orm";
import { logger } from "./logger.js";
import { db } from "./db/connection.js";
import { DatabaseLive } from "./services/Database.js";
import { AIServiceLive } from "./services/AIService.js";
import { createEffectHandler } from "./effectHandler.js";
import { requireAuth } from "./middleware/auth.js";
import { globalLimiter, authLimiter } from "./middleware/rateLimiter.js";
import { authRouter } from "./routes/auth.js";
import { sessionsRouter } from "./routes/sessions.js";
import { reviewsRouter } from "./routes/reviews.js";
import { domainsRouter } from "./routes/domains.js";
import { usersRouter } from "./routes/users.js";
import { placementRouter } from "./routes/placement.js";
import { hintsRouter } from "./routes/hints.js";
import { skilltreesRouter } from "./routes/skilltrees.js";
import { lessonsRouter } from "./routes/lessons.js";
import { aiProviderRouter } from "./routes/ai-provider.js";
import { dataRouter } from "./routes/data.js";
import { answersRouter } from "./routes/answers.js";

const app = express();
const port = process.env.PORT ?? 3001;
const appUrl = process.env.APP_URL ?? "http://localhost:5173";

app.use(helmet());
app.use(cors({ origin: appUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const AppLayer = Layer.mergeAll(DatabaseLive, AIServiceLive);
const handle = createEffectHandler(AppLayer);

// Public routes (no auth required)
app.use("/api/auth", authLimiter, authRouter);
app.use("/api", globalLimiter);
app.use("/api/skilltrees", skilltreesRouter(handle));
app.get("/api/health", async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ok" });
  } catch (err) {
    logger.error("Health check failed: database unreachable", { cause: String(err) });
    res.status(503).json({ status: "error", message: "database unreachable" });
  }
});

// Protected routes (auth required)
app.use("/api", requireAuth);
app.use("/api/sessions", sessionsRouter(handle));
app.use("/api/reviews", reviewsRouter(handle));
app.use("/api/answers", answersRouter(handle));
app.use("/api/domains", domainsRouter(handle));
app.use("/api/users", usersRouter(handle));
app.use("/api/users", aiProviderRouter(handle));
app.use("/api/users/me/data", dataRouter(handle));
app.use("/api/placement", placementRouter(handle));
app.use("/api/hints", hintsRouter(handle));
app.use("/api/lessons", lessonsRouter(handle));

const server = app.listen(port, () => {
  logger.info(`SkillClimb API running on http://localhost:${port}`);
});

function shutdown(signal: string) {
  logger.info(`Received ${signal}, shutting down`);
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
  // Force exit after 10s if connections don't close
  setTimeout(() => {
    logger.warn("Forcing shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

export default app;
