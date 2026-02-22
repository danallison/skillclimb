import { Effect } from "effect";
import { AIRequestError } from "../../errors.js";
import type { AIServiceShape } from "./AIService.js";

export function createNoopAdapter(): AIServiceShape {
  const fail = () =>
    Effect.fail(
      new AIRequestError({
        cause: new Error("No AI provider configured (AI_PROVIDER not set)"),
      }),
    );

  return {
    evaluateFreeRecall: fail,
    generateHint: fail,
    generateMicroLesson: fail,
  };
}
