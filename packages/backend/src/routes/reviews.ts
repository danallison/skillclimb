import { Router } from "express";
import { eq } from "drizzle-orm";
import { submitReview } from "../services/review.service.js";
import { db } from "../db/connection.js";
import { nodes } from "../db/schema.js";
import { evaluateFreeRecall, isAIAvailable } from "../services/ai.service.js";
import type { QuestionTemplate } from "@skillclimb/core";

const router = Router();

router.post("/evaluate", async (req, res) => {
  try {
    const { nodeId, response } = req.body;

    if (!nodeId || !response) {
      res.status(400).json({ error: "nodeId and response are required" });
      return;
    }

    if (!isAIAvailable()) {
      res.json(null);
      return;
    }

    const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId));
    if (!node) {
      res.status(404).json({ error: "Node not found" });
      return;
    }

    const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
    const template = templates.find((t) => t.type === "free_recall") ?? templates[0];
    if (!template) {
      res.json(null);
      return;
    }

    const result = await evaluateFreeRecall(
      node.concept,
      template.prompt,
      template.correctAnswer,
      template.keyPoints ?? [],
      template.rubric ?? "",
      response,
    );

    res.json(result);
  } catch (err) {
    console.error("Error evaluating answer:", err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, nodeId, score, confidence, response } = req.body;

    if (!userId || !nodeId || score == null || confidence == null) {
      res.status(400).json({
        error: "userId, nodeId, score, and confidence are required",
      });
      return;
    }

    if (score < 0 || score > 5) {
      res.status(400).json({ error: "score must be between 0 and 5" });
      return;
    }

    if (confidence < 1 || confidence > 5) {
      res.status(400).json({ error: "confidence must be between 1 and 5" });
      return;
    }

    const result = await submitReview(userId, nodeId, score, confidence, response ?? "");
    res.status(201).json(result);
  } catch (err) {
    console.error("Error submitting review:", err);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

export default router;
