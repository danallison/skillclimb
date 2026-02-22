import { Effect } from "effect";
import { createHmac } from "node:crypto";
import { AIRequestError } from "../../errors.js";
import type { AIServiceShape } from "./AIService.js";
import type { AIFeedback, AIMicroLesson } from "./ai.types.js";

export interface WebhookConfig {
  webhookUrl: string;
  secret: string | null;
  userId: string;
}

const MAX_RESPONSE_BYTES = 64 * 1024; // 64 KB — plenty for AI feedback

async function callWebhook(
  config: WebhookConfig,
  method: string,
  input: unknown,
): Promise<unknown> {
  const body = JSON.stringify({ method, input, userId: config.userId });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.secret) {
    const signature = createHmac("sha256", config.secret)
      .update(body)
      .digest("hex");
    headers["X-Signature-256"] = `sha256=${signature}`;
  }

  const response = await fetch(config.webhookUrl, {
    method: "POST",
    headers,
    body,
    signal: AbortSignal.timeout(10_000),
    redirect: "error", // prevent SSRF via redirect to internal services
  });

  if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}`);
  }

  // Guard against oversized responses
  const contentLength = response.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_RESPONSE_BYTES) {
    throw new Error(`Webhook response too large: ${contentLength} bytes`);
  }

  const text = await response.text();
  if (text.length > MAX_RESPONSE_BYTES) {
    throw new Error(`Webhook response too large: ${text.length} chars`);
  }

  const json = JSON.parse(text);
  return (json as any).result;
}

const MAX_STRING = 10_000; // max length for any single string field

function clampScore(score: number): number {
  return Math.max(0, Math.min(5, Math.round(score)));
}

function truncate(s: string): string {
  return s.length > MAX_STRING ? s.slice(0, MAX_STRING) : s;
}

function truncateArray(arr: unknown[]): string[] {
  return arr
    .filter((x): x is string => typeof x === "string")
    .slice(0, 50)
    .map(truncate);
}

function validateFeedback(raw: unknown): AIFeedback {
  if (
    raw == null ||
    typeof raw !== "object" ||
    typeof (raw as any).score !== "number" ||
    typeof (raw as any).feedback !== "string"
  ) {
    throw new Error("Invalid AIFeedback from webhook");
  }
  const r = raw as Record<string, unknown>;
  return {
    score: clampScore(r.score as number),
    feedback: truncate(r.feedback as string),
    keyPointsCovered: truncateArray(Array.isArray(r.keyPointsCovered) ? r.keyPointsCovered : []),
    keyPointsMissed: truncateArray(Array.isArray(r.keyPointsMissed) ? r.keyPointsMissed : []),
    misconceptions: truncateArray(Array.isArray(r.misconceptions) ? r.misconceptions : []),
  };
}

function validateMicroLesson(raw: unknown): AIMicroLesson {
  if (
    raw == null ||
    typeof raw !== "object" ||
    typeof (raw as any).title !== "string" ||
    typeof (raw as any).content !== "string"
  ) {
    throw new Error("Invalid AIMicroLesson from webhook");
  }
  const r = raw as Record<string, unknown>;
  return {
    title: truncate(r.title as string),
    content: truncate(r.content as string),
    keyTakeaways: truncateArray(Array.isArray(r.keyTakeaways) ? r.keyTakeaways : []),
  };
}

export function createWebhookAdapter(
  config: WebhookConfig,
  fallback: AIServiceShape,
): AIServiceShape {
  return {
    evaluateFreeRecall: (input) =>
      Effect.tryPromise({
        try: async () => {
          const raw = await callWebhook(config, "evaluateFreeRecall", input);
          return validateFeedback(raw);
        },
        catch: (cause) => new AIRequestError({ cause }),
      }).pipe(
        Effect.catchTag("AIRequestError", () => fallback.evaluateFreeRecall(input)),
      ),

    generateHint: (input) =>
      Effect.tryPromise({
        try: async () => {
          const raw = await callWebhook(config, "generateHint", input);
          if (typeof raw !== "string") {
            throw new Error("Invalid hint from webhook: expected string");
          }
          return truncate(raw);
        },
        catch: (cause) => new AIRequestError({ cause }),
      }).pipe(
        Effect.catchTag("AIRequestError", () => fallback.generateHint(input)),
      ),

    generateMicroLesson: (input) =>
      Effect.tryPromise({
        try: async () => {
          const raw = await callWebhook(config, "generateMicroLesson", input);
          return validateMicroLesson(raw);
        },
        catch: (cause) => new AIRequestError({ cause }),
      }).pipe(
        Effect.catchTag("AIRequestError", () =>
          fallback.generateMicroLesson(input),
        ),
      ),
  };
}
