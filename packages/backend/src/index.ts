import express from "express";
import cors from "cors";
import sessionsRouter from "./routes/sessions.js";
import reviewsRouter from "./routes/reviews.js";
import domainsRouter from "./routes/domains.js";
import usersRouter from "./routes/users.js";
import placementRouter from "./routes/placement.js";
import hintsRouter from "./routes/hints.js";

const app = express();
const port = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.use("/api/sessions", sessionsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/domains", domainsRouter);
app.use("/api/users", usersRouter);
app.use("/api/placement", placementRouter);
app.use("/api/hints", hintsRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`SkillClimb API running on http://localhost:${port}`);
});

export default app;
