import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Effect } from "effect";
import { createHmac } from "node:crypto";
import { createWebhookAdapter, type WebhookConfig } from "../webhook.adapter.js";
import type { AIServiceShape } from "../AIService.js";
import type { AIFeedback, AIMicroLesson } from "../ai.types.js";

const mockFeedback: AIFeedback = {
  score: 4,
  feedback: "Good answer",
  keyPointsCovered: ["point1"],
  keyPointsMissed: [],
  misconceptions: [],
};

const mockLesson: AIMicroLesson = {
  title: "Test Lesson",
  content: "Lesson content",
  keyTakeaways: ["takeaway1"],
};

function makeFallback(): AIServiceShape {
  return {
    evaluateFreeRecall: vi.fn(() =>
      Effect.succeed({
        score: 2,
        feedback: "fallback feedback",
        keyPointsCovered: [],
        keyPointsMissed: [],
        misconceptions: [],
      }),
    ),
    generateHint: vi.fn(() => Effect.succeed("fallback hint")),
    generateMicroLesson: vi.fn(() =>
      Effect.succeed({
        title: "Fallback",
        content: "fallback content",
        keyTakeaways: [],
      }),
    ),
  };
}

/** Build a mock Response matching the real fetch API (text + headers.get) */
function mockResponse(body: unknown) {
  const text = JSON.stringify(body);
  return {
    ok: true,
    headers: { get: (name: string) => (name === "content-length" ? String(text.length) : null) },
    text: () => Promise.resolve(text),
  };
}

function mockErrorResponse(status: number) {
  return { ok: false, status };
}

const baseConfig: WebhookConfig = {
  webhookUrl: "https://example.com/webhook",
  secret: null,
  userId: "user-123",
};

describe("webhook adapter", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns parsed result on valid webhook response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: mockFeedback }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "my answer",
      }),
    );

    expect(result.score).toBe(4);
    expect(result.feedback).toBe("Good answer");
    expect(fallback.evaluateFreeRecall).not.toHaveBeenCalled();
  });

  it("clamps scores on webhook response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: { ...mockFeedback, score: 10 } }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "my answer",
      }),
    );

    expect(result.score).toBe(5);
  });

  it("falls back on timeout", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("timeout"));

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "my answer",
      }),
    );

    expect(result.score).toBe(2);
    expect(result.feedback).toBe("fallback feedback");
    expect(fallback.evaluateFreeRecall).toHaveBeenCalled();
  });

  it("falls back on HTTP error", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(mockErrorResponse(500));

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    expect(result).toBe("fallback hint");
    expect(fallback.generateHint).toHaveBeenCalled();
  });

  it("falls back on invalid JSON", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => "12" },
      text: () => Promise.resolve("not valid json"),
    });

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateMicroLesson({
        concept: "test",
        correctAnswer: "test",
        explanation: "test",
        keyPoints: [],
        misconceptions: [],
      }),
    );

    expect(result.title).toBe("Fallback");
    expect(fallback.generateMicroLesson).toHaveBeenCalled();
  });

  it("sends HMAC signature when secret is set", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: "a hint" }),
    );

    const config: WebhookConfig = {
      ...baseConfig,
      secret: "my-secret",
    };
    const fallback = makeFallback();
    const adapter = createWebhookAdapter(config, fallback);

    await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const [, options] = fetchCall;
    const body = options.body;
    const expectedSig = createHmac("sha256", "my-secret")
      .update(body)
      .digest("hex");

    expect(options.headers["X-Signature-256"]).toBe(`sha256=${expectedSig}`);
  });

  it("does not send signature header when secret is null", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: "a hint" }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    const [, options] = fetchCall;

    expect(options.headers["X-Signature-256"]).toBeUndefined();
  });

  it("sets redirect: error to prevent SSRF via redirect", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(
      new TypeError("fetch failed (redirect: error)"),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    expect(result).toBe("fallback hint");
    expect(fallback.generateHint).toHaveBeenCalled();
    const fetchCall = (globalThis.fetch as any).mock.calls[0];
    expect(fetchCall[1].redirect).toBe("error");
  });

  it("falls back when webhook response is too large (Content-Length)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: (name: string) => (name === "content-length" ? "100000" : null) },
      text: () => Promise.resolve("x"),
    });

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    expect(result).toBe("fallback hint");
    expect(fallback.generateHint).toHaveBeenCalled();
  });

  it("falls back when webhook response body exceeds size limit", async () => {
    const oversizedBody = JSON.stringify({ result: "x".repeat(70_000) });
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null }, // no Content-Length header
      text: () => Promise.resolve(oversizedBody),
    });

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    expect(result).toBe("fallback hint");
    expect(fallback.generateHint).toHaveBeenCalled();
  });

  it("falls back when webhook returns malformed feedback (missing required fields)", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: { garbage: true } }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "my answer",
      }),
    );

    expect(result.feedback).toBe("fallback feedback");
    expect(fallback.evaluateFreeRecall).toHaveBeenCalled();
  });

  it("falls back when generateHint webhook returns non-string", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: { object: "not a string" } }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.generateHint({
        concept: "test",
        prompt: "test",
        learnerResponse: "",
        correctAnswer: "test",
      }),
    );

    expect(result).toBe("fallback hint");
    expect(fallback.generateHint).toHaveBeenCalled();
  });

  it("defaults missing array fields in feedback response", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(
      mockResponse({ result: { score: 3, feedback: "Decent" } }),
    );

    const fallback = makeFallback();
    const adapter = createWebhookAdapter(baseConfig, fallback);

    const result = await Effect.runPromise(
      adapter.evaluateFreeRecall({
        concept: "test",
        prompt: "test",
        correctAnswer: "test",
        keyPoints: [],
        rubric: "",
        learnerResponse: "my answer",
      }),
    );

    expect(result.score).toBe(3);
    expect(result.feedback).toBe("Decent");
    expect(result.keyPointsCovered).toEqual([]);
    expect(result.keyPointsMissed).toEqual([]);
    expect(result.misconceptions).toEqual([]);
  });
});
