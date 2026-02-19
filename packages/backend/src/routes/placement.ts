import { Router } from "express";
import {
  startPlacement,
  submitPlacementAnswer,
  getPlacement,
  abandonPlacement,
} from "../services/placement.service.js";

const router = Router();

// POST /api/placement — Start a new placement test
router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const result = await startPlacement(userId);
    res.status(201).json(result);
  } catch (err: any) {
    console.error("Error starting placement:", err);
    res.status(500).json({ error: err.message ?? "Failed to start placement" });
  }
});

// POST /api/placement/:id/answer — Submit an answer
router.post("/:id/answer", async (req, res) => {
  try {
    const placementId = req.params.id;
    const { nodeId, selectedAnswer, confidence } = req.body;

    if (!nodeId) {
      res.status(400).json({ error: "nodeId is required" });
      return;
    }

    const result = await submitPlacementAnswer(
      placementId,
      nodeId,
      selectedAnswer ?? null,
      confidence ?? 3,
    );

    res.json(result);
  } catch (err: any) {
    console.error("Error submitting placement answer:", err);
    res.status(500).json({ error: err.message ?? "Failed to submit answer" });
  }
});

// GET /api/placement/:id — Get current placement state
router.get("/:id", async (req, res) => {
  try {
    const placement = await getPlacement(req.params.id);
    if (!placement) {
      res.status(404).json({ error: "Placement test not found" });
      return;
    }
    res.json(placement);
  } catch (err: any) {
    console.error("Error fetching placement:", err);
    res.status(500).json({ error: "Failed to fetch placement" });
  }
});

// POST /api/placement/:id/abandon — Abandon the test
router.post("/:id/abandon", async (req, res) => {
  try {
    await abandonPlacement(req.params.id);
    res.json({ status: "abandoned" });
  } catch (err: any) {
    console.error("Error abandoning placement:", err);
    res.status(500).json({ error: "Failed to abandon placement" });
  }
});

export default router;
