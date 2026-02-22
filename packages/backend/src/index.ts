import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Layer } from "effect";
import { DatabaseLive } from "./services/Database.js";
import { AIServiceLive } from "./services/AIService.js";
import { createEffectHandler } from "./effectHandler.js";
import { requireAuth } from "./middleware/auth.js";
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

const app = express();
const port = process.env.PORT ?? 3001;
const appUrl = process.env.APP_URL ?? "http://localhost:5173";

app.use(cors({ origin: appUrl, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const AppLayer = Layer.mergeAll(DatabaseLive, AIServiceLive);
const handle = createEffectHandler(AppLayer);

// Public routes (no auth required)
app.use("/api/auth", authRouter);
app.use("/api/skilltrees", skilltreesRouter(handle));
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Protected routes (auth required)
app.use("/api", requireAuth);
app.use("/api/sessions", sessionsRouter(handle));
app.use("/api/reviews", reviewsRouter(handle));
app.use("/api/domains", domainsRouter(handle));
app.use("/api/users", usersRouter(handle));
app.use("/api/users", aiProviderRouter(handle));
app.use("/api/placement", placementRouter(handle));
app.use("/api/hints", hintsRouter(handle));
app.use("/api/lessons", lessonsRouter(handle));

app.listen(port, () => {
  console.log(`SkillClimb API running on http://localhost:${port}`);
});

export default app;
