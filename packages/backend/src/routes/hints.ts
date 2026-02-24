import { Router } from "express";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import { nodes } from "../db/schema.js";
import { query } from "../services/Database.js";
import { resolveAIForUser } from "../services/AIService.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import { VALID_QUESTION_TYPES, type QuestionTemplate } from "@skillclimb/core";

export function hintsRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const { nodeId, questionType } = req.body;

        if (typeof nodeId !== "string" || !nodeId) {
          return yield* Effect.fail(
            new ValidationError({ message: "nodeId must be a string" }),
          );
        }

        if (questionType != null && !(VALID_QUESTION_TYPES as readonly string[]).includes(questionType)) {
          return yield* Effect.fail(
            new ValidationError({ message: `questionType must be one of ${VALID_QUESTION_TYPES.join(", ")}` }),
          );
        }

        const [node] = yield* query((db) =>
          db.select().from(nodes).where(eq(nodes.id, nodeId)),
        );
        if (!node) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Node", id: nodeId }),
          );
        }

        const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
        const template =
          (questionType &&
            templates.find((t) => t.type === questionType)) ??
          templates[0];

        if (!template) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "Question template",
              id: nodeId,
            }),
          );
        }

        // Try static hints first
        if (template.hints && template.hints.length > 0) {
          return new HttpResponse(200, {
            hint: template.hints[0],
            source: "static",
          });
        }

        // Try AI-generated hint
        const userId = req.userId!;
        const ai = yield* resolveAIForUser(userId);
        const aiHint = yield* ai
          .generateHint({
            concept: node.concept,
            prompt: template.prompt,
            learnerResponse: "",
            correctAnswer: template.correctAnswer,
          })
          .pipe(Effect.catchTag("AIRequestError", () => Effect.succeed(null)));

        if (aiHint) {
          return new HttpResponse(200, { hint: aiHint, source: "ai" });
        }

        // Fall back to generic hint
        const genericHint = `Think about: ${template.explanation.split(".")[0]}.`;
        return new HttpResponse(200, { hint: genericHint, source: "generic" });
      }),
    ),
  );

  return router;
}
