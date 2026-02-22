import { Effect } from "effect";
import OpenAI from "openai";
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

interface OpenAIAdapterConfig {
  apiKey?: string;
  baseURL?: string;
  model: string;
}

function createOpenAIAdapterWithConfig(
  config: OpenAIAdapterConfig,
): AIServiceShape {
  const client = new OpenAI({
    apiKey: config.apiKey ?? "ollama",
    baseURL: config.baseURL,
  });
  const model = config.model;

  return {
    evaluateFreeRecall: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.chat.completions.create({
            model,
            max_tokens: 500,
            messages: [
              { role: "system", content: TUTOR_SYSTEM_PROMPT },
              { role: "user", content: buildEvaluationMessage(input) },
            ],
          });
          const text = response.choices[0]?.message?.content ?? "";
          const parsed = JSON.parse(text) as AIFeedback;
          parsed.score = Math.max(0, Math.min(5, Math.round(parsed.score)));
          return parsed;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),

    generateHint: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.chat.completions.create({
            model,
            max_tokens: 150,
            messages: [
              { role: "system", content: HINT_SYSTEM_PROMPT },
              { role: "user", content: buildHintMessage(input) },
            ],
          });
          const text = response.choices[0]?.message?.content?.trim() ?? "";
          if (!text) throw new Error("Empty AI response");
          return text;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),

    generateMicroLesson: (input) =>
      Effect.tryPromise({
        try: async () => {
          const response = await client.chat.completions.create({
            model,
            max_tokens: 800,
            messages: [
              { role: "system", content: MICRO_LESSON_SYSTEM_PROMPT },
              { role: "user", content: buildMicroLessonMessage(input) },
            ],
          });
          const text = response.choices[0]?.message?.content ?? "";
          return JSON.parse(text) as AIMicroLesson;
        },
        catch: (cause) => new AIRequestError({ cause }),
      }),
  };
}

export function createOpenAIAdapter(): AIServiceShape {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn(
      "AI_PROVIDER=openai but OPENAI_API_KEY not set — falling back to noop",
    );
    return createNoopAdapter();
  }

  return createOpenAIAdapterWithConfig({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL,
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  });
}

export function createOllamaAdapter(): AIServiceShape {
  return createOpenAIAdapterWithConfig({
    baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
    model: process.env.OLLAMA_MODEL ?? "llama3.2",
  });
}
