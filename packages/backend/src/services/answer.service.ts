import { Effect } from "effect";
import { eq, and } from "drizzle-orm";
import { nodes, learnerNodes } from "../db/schema.js";
import { query, Database } from "./Database.js";
import { resolveAIForUser } from "./ai/resolver.js";
import { AIService } from "./ai/AIService.js";
import { NotFoundError, ValidationError, DatabaseError } from "../errors.js";
import { submitReview, type ReviewResultWithMilestones } from "./review.service.js";
import {
  evaluateRecognition,
  evaluateCuedRecall,
  scoreFromSelfRating,
  capScoreForHintedAttempt,
  CORRECT_SCORE_THRESHOLD,
} from "@skillclimb/core";
import type { QuestionTemplate } from "@skillclimb/core";

export type SelfRating = "correct" | "partially_correct" | "incorrect";

export interface SubmitAnswerInput {
  nodeId: string;
  answer: string | null;
  confidence: number;
  questionType: QuestionTemplate["type"];
  attemptNumber?: number;
  selfRating?: SelfRating;
}

export interface AnswerFeedback {
  correctAnswer: string;
  explanation: string;
  aiFeedback?: string;
  keyPointsCovered?: string[];
  keyPointsMissed?: string[];
  misconceptions?: string[];
}

export interface AnswerResult {
  score: number;
  wasCorrect: boolean;
  feedback: AnswerFeedback;
  srs: {
    easiness: number;
    interval: number;
    repetitions: number;
    dueDate: string;
    nextReviewIn: string;
  };
  calibration: { quadrant: string };
  milestones: ReviewResultWithMilestones["milestones"];
}

function formatNextReviewIn(intervalDays: number): string {
  if (intervalDays <= 0) return "now";
  if (intervalDays === 1) return "1 day";
  if (intervalDays < 7) return `${intervalDays} days`;
  const weeks = Math.round(intervalDays / 7);
  if (weeks <= 4) return `${weeks} week${weeks === 1 ? "" : "s"}`;
  const months = Math.round(intervalDays / 30);
  return `${months} month${months === 1 ? "" : "s"}`;
}

export const submitAnswer = (
  userId: string,
  input: SubmitAnswerInput,
): Effect.Effect<AnswerResult, NotFoundError | ValidationError | DatabaseError, Database | AIService> =>
  Effect.gen(function* () {
    const { nodeId, answer, confidence, questionType, selfRating } = input;
    const attemptNumber = input.attemptNumber ?? 1;

    // 1. Look up the node to get question templates
    const [node] = yield* query((db) =>
      db.select().from(nodes).where(eq(nodes.id, nodeId)),
    );
    if (!node) {
      return yield* Effect.fail(new NotFoundError({ entity: "Node", id: nodeId }));
    }

    const templates = (node.questionTemplates ?? []) as QuestionTemplate[];
    const template = templates.find((t) => t.type === questionType);
    if (!template) {
      return yield* Effect.fail(
        new ValidationError({
          message: `No question template of type "${questionType}" found for node ${nodeId}`,
        }),
      );
    }

    // 2. Score by question type
    let rawScore: number;
    let aiFeedback: string | undefined;
    let keyPointsCovered: string[] | undefined;
    let keyPointsMissed: string[] | undefined;
    let misconceptions: string[] | undefined;

    switch (questionType) {
      case "recognition": {
        rawScore = evaluateRecognition(answer, template.correctAnswer);
        break;
      }
      case "cued_recall": {
        if (answer === null || answer.trim().length === 0) {
          rawScore = 0;
        } else {
          rawScore = evaluateCuedRecall(answer, template.correctAnswer, template.acceptableAnswers);
        }
        break;
      }
      case "free_recall": {
        if (answer === null || answer.trim().length === 0) {
          rawScore = 0;
        } else {
          // Try AI evaluation first
          const aiResult = yield* Effect.gen(function* () {
            // Look up previous misconceptions
            const [learnerNode] = yield* query((db) =>
              db
                .select()
                .from(learnerNodes)
                .where(and(eq(learnerNodes.userId, userId), eq(learnerNodes.nodeId, nodeId))),
            );
            const previousMisconceptions = (learnerNode?.misconceptions ?? []) as string[];

            const ai = yield* resolveAIForUser(userId);
            return yield* ai
              .evaluateFreeRecall({
                concept: node.concept,
                prompt: template.prompt,
                correctAnswer: template.correctAnswer,
                keyPoints: template.keyPoints ?? [],
                rubric: template.rubric ?? "",
                learnerResponse: answer!,
                previousMisconceptions,
              })
              .pipe(Effect.catchTag("AIRequestError", () => Effect.succeed(null)));
          });

          if (aiResult) {
            rawScore = aiResult.score;
            aiFeedback = aiResult.feedback;
            keyPointsCovered = aiResult.keyPointsCovered;
            keyPointsMissed = aiResult.keyPointsMissed;
            misconceptions = aiResult.misconceptions;
          } else if (selfRating) {
            rawScore = scoreFromSelfRating(selfRating);
          } else {
            return yield* Effect.fail(
              new ValidationError({
                message: "free_recall requires either an AI provider or selfRating when AI is unavailable",
              }),
            );
          }
        }
        break;
      }
      case "application":
      case "practical": {
        if (!selfRating) {
          return yield* Effect.fail(
            new ValidationError({
              message: `${questionType} questions require selfRating`,
            }),
          );
        }
        rawScore = scoreFromSelfRating(selfRating);
        break;
      }
    }

    // 3. Cap score for hinted attempts
    const score = capScoreForHintedAttempt(rawScore, attemptNumber);
    const wasCorrect = score >= CORRECT_SCORE_THRESHOLD;

    // 4. Submit review (SRS update, calibration, milestones)
    const reviewResult = yield* submitReview(
      userId,
      nodeId,
      score,
      confidence,
      answer ?? "",
      misconceptions,
    );

    // 5. Build response
    const nextState = reviewResult.nextState;
    return {
      score,
      wasCorrect,
      feedback: {
        correctAnswer: template.correctAnswer,
        explanation: template.explanation,
        aiFeedback,
        keyPointsCovered,
        keyPointsMissed,
        misconceptions,
      },
      srs: {
        easiness: nextState.easiness,
        interval: nextState.interval,
        repetitions: nextState.repetitions,
        dueDate: nextState.dueDate.toISOString(),
        nextReviewIn: formatNextReviewIn(nextState.interval),
      },
      calibration: { quadrant: reviewResult.calibrationQuadrant },
      milestones: reviewResult.milestones,
    };
  });
