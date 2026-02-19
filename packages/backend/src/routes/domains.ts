import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { domains, learnerNodes, nodes } from "../db/schema.js";

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

    // Get all nodes in this domain
    const domainNodes = await db.select().from(nodes).where(eq(nodes.domainId, domainId));

    // Get learner state for these nodes
    const userLearnerNodes = await db
      .select()
      .from(learnerNodes)
      .where(eq(learnerNodes.userId, userId));

    const learnerMap = new Map(userLearnerNodes.map((ln) => [ln.nodeId, ln]));

    const totalNodes = domainNodes.length;
    let mastered = 0;
    let inProgress = 0;
    let notStarted = 0;

    for (const node of domainNodes) {
      const ln = learnerMap.get(node.id);
      if (!ln) {
        notStarted++;
      } else if (ln.repetitions >= 3 && ln.easiness >= 2.0) {
        mastered++;
      } else {
        inProgress++;
      }
    }

    res.json({
      domainId,
      totalNodes,
      mastered,
      inProgress,
      notStarted,
      masteryPercentage: totalNodes > 0 ? Math.round((mastered / totalNodes) * 100) : 0,
    });
  } catch (err) {
    console.error("Error fetching domain progress:", err);
    res.status(500).json({ error: "Failed to fetch domain progress" });
  }
});

export default router;
