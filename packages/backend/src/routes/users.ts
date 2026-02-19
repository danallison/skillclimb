import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { users, learnerNodes, nodes, domains, topics } from "../db/schema.js";
import { dbRowToLearnerState } from "../db/mappers.js";
import { computeOverallProgress, computeTopicProgress } from "@cyberclimb/core";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    // Create user
    const [user] = await db.insert(users).values({ email }).returning();

    // Initialize learner nodes for all existing nodes
    const allNodes = await db.select().from(nodes);

    if (allNodes.length > 0) {
      await db.insert(learnerNodes).values(
        allNodes.map((node) => ({
          userId: user.id,
          nodeId: node.id,
          domainId: node.domainId,
          easiness: 2.5,
          interval: 0,
          repetitions: 0,
          dueDate: new Date(),
          confidenceHistory: [],
          domainWeight: 1.0,
        })),
      );
    }

    res.status(201).json(user);
  } catch (err: any) {
    if (err?.code === "23505") {
      // unique_violation — return existing user
      const [existing] = await db.select().from(users).where(eq(users.email, req.body.email));
      res.status(200).json(existing);
      return;
    }
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/:id/progress", async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch all learner nodes for this user
    const rows = await db
      .select()
      .from(learnerNodes)
      .where(eq(learnerNodes.userId, userId));

    const states = rows.map(dbRowToLearnerState);

    const now = new Date();
    const overall = computeOverallProgress(states, now);

    // Build nodeId → topicId mapping for topic-level breakdown
    const allNodes = await db.select().from(nodes);
    const nodeTopicMap = new Map(
      allNodes.map((n) => [n.id, { topicId: n.topicId, domainId: n.domainId }]),
    );
    const topicProgress = computeTopicProgress(states, nodeTopicMap);

    // Fetch domain and topic names for display
    const allDomains = await db.select().from(domains).orderBy(domains.displayOrder);
    const allTopics = await db.select().from(topics).orderBy(topics.displayOrder);

    const domainMap = new Map(allDomains.map((d) => [d.id, d]));
    const topicMap = new Map(allTopics.map((t) => [t.id, t]));

    // Build a lookup from domainId → progress data
    const progressByDomain = new Map(overall.domains.map((dp) => [dp.domainId, dp]));

    // Assemble response including ALL domains (even ones without content)
    const domainDetails = allDomains.map((domain) => {
      const dp = progressByDomain.get(domain.id);
      const domainTopics = topicProgress
        .filter((tp) => tp.domainId === domain.id)
        .map((tp) => {
          const topic = topicMap.get(tp.topicId);
          return {
            ...tp,
            name: topic?.name ?? "Unknown",
          };
        });

      return {
        domainId: domain.id,
        name: domain.name,
        description: domain.description,
        tier: domain.tier,
        totalNodes: dp?.totalNodes ?? 0,
        mastered: dp?.mastered ?? 0,
        inProgress: dp?.inProgress ?? 0,
        notStarted: dp?.notStarted ?? 0,
        masteryPercentage: dp?.masteryPercentage ?? 0,
        hasContent: (dp?.totalNodes ?? 0) > 0,
        topics: domainTopics,
      };
    });

    res.json({
      totalNodes: overall.totalNodes,
      mastered: overall.mastered,
      inProgress: overall.inProgress,
      notStarted: overall.notStarted,
      masteryPercentage: overall.masteryPercentage,
      nextSession: overall.nextSession,
      domains: domainDetails,
    });
  } catch (err) {
    console.error("Error fetching user progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

export default router;
