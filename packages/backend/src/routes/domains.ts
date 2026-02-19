import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { domains, learnerNodes } from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { computeDomainProgress } from "@cyberclimb/core";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const allDomains = await db.select().from(domains).orderBy(domains.displayOrder);
    res.json(allDomains);
  } catch (err) {
    console.error("Error fetching domains:", err);
    res.status(500).json({ error: "Failed to fetch domains" });
  }
});

router.get("/:id/progress", async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== "string") {
      res.status(400).json({ error: "userId query parameter is required" });
      return;
    }

    const domainId = req.params.id;

    const rows = await db
      .select()
      .from(learnerNodes)
      .where(eq(learnerNodes.userId, userId));

    const states = rows.map(dbRowToLearnerState);
    const domainProgress = computeDomainProgress(states);
    const dp = domainProgress.find((d) => d.domainId === domainId);

    res.json({
      domainId,
      totalNodes: dp?.totalNodes ?? 0,
      mastered: dp?.mastered ?? 0,
      inProgress: dp?.inProgress ?? 0,
      notStarted: dp?.notStarted ?? 0,
      masteryPercentage: dp?.masteryPercentage ?? 0,
    });
  } catch (err) {
    console.error("Error fetching domain progress:", err);
    res.status(500).json({ error: "Failed to fetch domain progress" });
  }
});

export default router;
