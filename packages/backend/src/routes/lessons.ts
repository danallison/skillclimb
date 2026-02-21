import { Router } from "express";
import { Effect } from "effect";
import { and, eq } from "drizzle-orm";
import { query } from "../services/Database.js";
import { nodes, learnerNodes } from "../db/schema.js";
import { AIService } from "../services/AIService.js";
import { ValidationError, NotFoundError } from "../errors.js";
import { HttpResponse, type EffectHandler } from "../effectHandler.js";
import type { QuestionTemplate } from "@skillclimb/core";

interface LessonResponse {
  title: string;
  content: string;
  keyTakeaways: string[];
  source: string;
}

export function lessonsRouter(handle: EffectHandler) {
  const router = Router();

  router.post(
    "/",
    handle((req) =>
      Effect.gen(function* () {
        const userId = req.userId!;
        const { nodeId } = req.body;

        if (!nodeId) {
          return yield* Effect.fail(
            new ValidationError({
              message: "nodeId is required",
            }),
          );
        }

        // Look up node
        const [node] = yield* query((db) =>
          db.select().from(nodes).where(eq(nodes.id, nodeId)),
        );
        if (!node) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Node", id: nodeId }),
          );
        }

        const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
        const template = templates[0];

        // Check for hand-authored micro-lesson
        if (template?.microLesson) {
          const response: LessonResponse = {
            title: node.concept,
            content: template.microLesson,
            keyTakeaways: [],
            source: "static",
          };
          return new HttpResponse(200, response);
        }

        // Look up learnerNode for misconceptions
        const [learnerNode] = yield* query((db) =>
          db
            .select()
            .from(learnerNodes)
            .where(
              and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId)),
            ),
        );
        const misconceptions = (learnerNode?.misconceptions ?? []) as string[];

        // Try AI generation
        const ai = yield* AIService;
        const lesson: LessonResponse = yield* ai
          .generateMicroLesson({
            concept: node.concept,
            correctAnswer: template?.correctAnswer ?? "",
            explanation: template?.explanation ?? "",
            keyPoints: template?.keyPoints ?? [],
            misconceptions,
          })
          .pipe(
            Effect.map((result): LessonResponse => ({
              ...result,
              source: "ai",
            })),
            Effect.catchTag("AIRequestError", () =>
              Effect.succeed<LessonResponse>({
                title: node.concept,
                content: template?.explanation ?? `Review the concept: ${node.concept}`,
                keyTakeaways: template?.keyPoints ?? [],
                source: "fallback",
              }),
            ),
          );

        return new HttpResponse(200, lesson);
      }),
    ),
  );

  return router;
}
