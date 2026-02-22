import { Effect } from "effect";
import Anthropic from "@anthropic-ai/sdk";
import { AIRequestError } from "../../errors.js";
import type { AIFeedback, AIMicroLesson } from "./ai.types.js";
import type { AIServiceShape } from "./AIService.js";
import {
  TUTOR_SYSTEM_PROMPT,
  HINT_SYSTEM_PROMPT,
  MICRO_LESSON_SYSTEM_PROMPT,
} from "./prompts.js";
import {
  buildEvaluationMessage,
  buildHintMessage,
  buildMicroLessonMessage,
} from "./messages.js";
import { createNoopAdapter } from "./noop.adapter.js";

export function createAnthropicAdapter(): AIServiceShape {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn(
      "AI_PROVIDER=anthropic but ANTHROPIC_API_KEY not set — falling back to noop",
    );
    return createNoopAdapter();
  }

  const client = new Anthropic();
  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  return {
    evaluateFreeRecall: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.messages.create({
            model,
            max_tokens: 500,
            system: TUTOR_SYSTEM_PROMPT,
            messages: [{ role: "user", content: buildEvaluationMessage(input) }],
          });
          const text =
            response.content[0].type === "text" ? response.content[0].text : "";
          const parsed = JSON.parse(text) as AIFeedback;
          parsed.score = Math.max(0, Math.min(5, Math.round(parsed.score)));
          return parsed;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),

    generateHint: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.messages.create({
            model,
            max_tokens: 150,
            system: HINT_SYSTEM_PROMPT,
            messages: [{ role: "user", content: buildHintMessage(input) }],
          });
          const text =
            response.content[0].type === "text"
              ? response.content[0].text.trim()
              : "";
          if (!text) throw new Error("Empty AI response");
          return text;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),

    generateMicroLesson: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.messages.create({
            model,
            max_tokens: 800,
            system: MICRO_LESSON_SYSTEM_PROMPT,
            messages: [
              { role: "user", content: buildMicroLessonMessage(input) },
            ],
          });
          const text =
            response.content[0].type === "text" ? response.content[0].text : "";
          return JSON.parse(text) as AIMicroLesson;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),
  };
}
