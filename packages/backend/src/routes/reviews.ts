import { Router } from "express";
import { submitReview } from "../services/review.service.js";

const router = Router();

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
