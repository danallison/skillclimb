import { describe, it, expect } from "vitest";
import { Effect } from "effect";
import { createNoopAdapter } from "../noop.adapter.js";

describe("createNoopAdapter", () => {
  const adapter = createNoopAdapter();

  it("evaluateFreeRecall fails with AIRequestError", async () => {
    const result = await adapter
      .evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "test",
      })
      .pipe(
        Effect.match({
          onFailure: (e) => e,
          onSuccess: () => null,
        }),
        Effect.runPromise,
      );

    expect(result).not.toBeNull();
    expect(result!._tag).toBe("AIRequestError");
  });

  it("generateHint fails with AIRequestError", async () => {
    const result = await adapter
      .generateHint({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        learnerResponse: "test",
      })
      .pipe(
        Effect.match({
          onFailure: (e) => e,
          onSuccess: () => null,
        }),
        Effect.runPromise,
      );

    expect(result).not.toBeNull();
    expect(result!._tag).toBe("AIRequestError");
  });

  it("generateMicroLesson fails with AIRequestError", async () => {
    const result = await adapter
      .generateMicroLesson({
        concept: "test",
        correctAnswer: "test",
        explanation: "test",
        keyPoints: [],
        misconceptions: [],
      })
      .pipe(
        Effect.match({
          onFailure: (e) => e,
          onSuccess: () => null,
        }),
        Effect.runPromise,
      );

    expect(result).not.toBeNull();
    expect(result!._tag).toBe("AIRequestError");
  });
});

describe("createAnthropicAdapter without API key", () => {
  it("falls back to noop when ANTHROPIC_API_KEY not set", async () => {
    // Remove the key if set
    const originalKey = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    try {
      const { createAnthropicAdapter } = await import(
        "../anthropic.adapter.js"
      );
      const adapter = createAnthropicAdapter();

      const result = await adapter
        .evaluateFreeRecall({
          concept: "test",
          prompt: "test",
          correctAnswer: "test",
          keyPoints: [],
          rubric: "",
          learnerResponse: "test",
        })
        .pipe(
          Effect.match({
            onFailure: (e) => e,
            onSuccess: () => null,
          }),
          Effect.runPromise,
        );

      expect(result).not.toBeNull();
      expect(result!._tag).toBe("AIRequestError");
    } finally {
      if (originalKey) process.env.ANTHROPIC_API_KEY = originalKey;
    }
  });
});
