import express from "express";
import cors from "cors";
import { Layer } from "effect";
import { DatabaseLive } from "./services/Database.js";
import { AIServiceLive } from "./services/AIService.js";
import { createEffectHandler } from "./effectHandler.js";
import { sessionsRouter } from "./routes/sessions.js";
import { reviewsRouter } from "./routes/reviews.js";
import { domainsRouter } from "./routes/domains.js";
import { usersRouter } from "./routes/users.js";
import { placementRouter } from "./routes/placement.js";
import { hintsRouter } from "./routes/hints.js";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

const AppLayer = Layer.mergeAll(DatabaseLive, AIServiceLive);
const handle = createEffectHandler(AppLayer);

app.use("/api/sessions", sessionsRouter(handle));
app.use("/api/reviews", reviewsRouter(handle));
app.use("/api/domains", domainsRouter(handle));
app.use("/api/users", usersRouter(handle));
app.use("/api/placement", placementRouter(handle));
app.use("/api/hints", hintsRouter(handle));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`SkillClimb API running on http://localhost:${port}`);
});

export default app;
