import { Context, Effect, Layer } from "effect";
import type {
  AIFeedback,
  AIEvaluationInput,
  AIHintInput,
  AIMicroLessonInput,
  AIMicroLesson,
} from "./ai.types.js";
import { AIRequestError } from "../../errors.js";
import { createAnthropicAdapter } from "./anthropic.adapter.js";
import { createOpenAIAdapter, createOllamaAdapter } from "./openai.adapter.js";
import { createNoopAdapter } from "./noop.adapter.js";

export interface AIServiceShape {
  readonly evaluateFreeRecall: (
    input: AIEvaluationInput,
  ) => Effect.Effect<AIFeedback, AIRequestError>;
  readonly generateHint: (
    input: AIHintInput,
  ) => Effect.Effect<string, AIRequestError>;
  readonly generateMicroLesson: (
    input: AIMicroLessonInput,
  ) => Effect.Effect<AIMicroLesson, AIRequestError>;
}

export class AIService extends Context.Tag("AIService")<
  AIService,
  AIServiceShape
>() {}

export function resolveProvider(): AIServiceShape {
  const provider = (process.env.AI_PROVIDER ?? "none").toLowerCase();

  switch (provider) {
    case "anthropic":
      return createAnthropicAdapter();
    case "openai":
      return createOpenAIAdapter();
    case "ollama":
      return createOllamaAdapter();
    case "none":
    case "":
      return createNoopAdapter();
    default:
      console.warn(
        `Unknown AI_PROVIDER "${provider}" — falling back to noop`,
      );
      return createNoopAdapter();
  }
}

export const AIServiceLive = Layer.succeed(AIService, resolveProvider());
