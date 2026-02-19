import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db/connection.js";
import { nodes } from "../db/schema.js";
import type { QuestionTemplate } from "@skillclimb/core";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { nodeId, questionType } = req.body;

    if (!nodeId) {
      res.status(400).json({ error: "nodeId is required" });
      return;
    }

    const [node] = await db.select().from(nodes).where(eq(nodes.id, nodeId));
    if (!node) {
      res.status(404).json({ error: "Node not found" });
      return;
    }

    const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
    // Pick the template matching the question type, or fall back to first
    const template = (questionType && templates.find((t) => t.type === questionType)) ?? templates[0];

    if (!template) {
      res.status(404).json({ error: "No question template found" });
      return;
    }

    // Try static hints first (from the matched template)
    if (template.hints && template.hints.length > 0) {
      res.json({ hint: template.hints[0], source: "static" });
      return;
    }

    // Try AI-generated hint
    try {
      const { generateHint } = await import("../services/ai.service.js");
      const aiHint = await generateHint(
        node.concept,
        template.prompt,
        "",
        template.correctAnswer,
      );
      if (aiHint) {
        res.json({ hint: aiHint, source: "ai" });
        return;
      }
    } catch {
      // AI service not available, fall through
    }

    // Fall back to generic hint derived from explanation
    const genericHint = `Think about: ${template.explanation.split(".")[0]}.`;
    res.json({ hint: genericHint, source: "generic" });
  } catch (err) {
    console.error("Error fetching hint:", err);
    res.status(500).json({ error: "Failed to fetch hint" });
  }
});

export default router;
