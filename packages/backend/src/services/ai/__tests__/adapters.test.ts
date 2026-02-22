import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Effect } from "effect";
import { createNoopAdapter } from "../noop.adapter.js";
import type { AIEvaluationInput, AIHintInput, AIMicroLessonInput } from "../ai.types.js";

// ---------------------------------------------------------------------------
// SDK mocks — must come before adapter imports
// ---------------------------------------------------------------------------

const anthropicCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: anthropicCreate };
  },
}));

const openaiCreate = vi.fn();
vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: openaiCreate } };
  },
}));

// ---------------------------------------------------------------------------
// Shared test inputs
// ---------------------------------------------------------------------------

const evalInput: AIEvaluationInput = {
  concept: "TCP handshake",
  prompt: "Explain the TCP three-way handshake",
  correctAnswer: "SYN, SYN-ACK, ACK",
  keyPoints: ["SYN", "SYN-ACK", "ACK"],
  rubric: "Must mention all three steps",
  learnerResponse: "The client sends SYN, server replies SYN-ACK, then client sends ACK",
};

const hintInput: AIHintInput = {
  concept: "TCP handshake",
  prompt: "What are the steps?",
  learnerResponse: "I don't know",
  correctAnswer: "SYN, SYN-ACK, ACK",
};

const microLessonInput: AIMicroLessonInput = {
  concept: "TCP handshake",
  correctAnswer: "SYN, SYN-ACK, ACK",
  explanation: "TCP uses a three-way handshake to establish connections",
  keyPoints: ["SYN", "SYN-ACK", "ACK"],
  misconceptions: [],
};

// ---------------------------------------------------------------------------
// Helper — run Effect and capture success/failure
// ---------------------------------------------------------------------------

async function runEffect<A, E>(effect: Effect.Effect<A, E>): Promise<{ ok: true; value: A } | { ok: false; error: E }> {
  return effect.pipe(
    Effect.match({
      onFailure: (error) => ({ ok: false as const, error }),
      onSuccess: (value) => ({ ok: true as const, value }),
    }),
    Effect.runPromise,
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Noop adapter
// ═══════════════════════════════════════════════════════════════════════════

describe("createNoopAdapter", () => {
  const adapter = createNoopAdapter();

  it("evaluateFreeRecall fails with AIRequestError", async () => {
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  it("generateHint fails with AIRequestError", async () => {
    const result = await runEffect(adapter.generateHint(hintInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  it("generateMicroLesson fails with AIRequestError", async () => {
    const result = await runEffect(adapter.generateMicroLesson(microLessonInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Anthropic adapter (mocked SDK)
// ═══════════════════════════════════════════════════════════════════════════

describe("createAnthropicAdapter (mocked SDK)", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    process.env.ANTHROPIC_API_KEY = "test-key";
    anthropicCreate.mockReset();
  });

  afterEach(() => {
    if (savedEnv.ANTHROPIC_API_KEY !== undefined) {
      process.env.ANTHROPIC_API_KEY = savedEnv.ANTHROPIC_API_KEY;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  function anthropicResponse(text: string) {
    return { content: [{ type: "text", text }] };
  }

  function anthropicNonTextResponse() {
    return { content: [{ type: "tool_use", id: "t1", name: "test", input: {} }] };
  }

  async function getAdapter() {
    const mod = await import("../anthropic.adapter.js");
    return mod.createAnthropicAdapter();
  }

  it("falls back to noop when ANTHROPIC_API_KEY not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- evaluateFreeRecall ---

  it("evaluateFreeRecall — valid JSON → returns parsed AIFeedback", async () => {
    const feedback = {
      score: 4,
      feedback: "Good explanation",
      keyPointsCovered: ["SYN", "SYN-ACK", "ACK"],
      keyPointsMissed: [],
      misconceptions: [],
    };
    anthropicCreate.mockResolvedValue(anthropicResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.score).toBe(4);
      expect(result.value.feedback).toBe("Good explanation");
      expect(result.value.keyPointsCovered).toEqual(["SYN", "SYN-ACK", "ACK"]);
    }
  });

  it("evaluateFreeRecall — score 7 gets clamped to 5", async () => {
    const feedback = { score: 7, feedback: "Perfect", keyPointsCovered: [], keyPointsMissed: [], misconceptions: [] };
    anthropicCreate.mockResolvedValue(anthropicResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.score).toBe(5);
  });

  it("evaluateFreeRecall — score -2 gets clamped to 0", async () => {
    const feedback = { score: -2, feedback: "Bad", keyPointsCovered: [], keyPointsMissed: [], misconceptions: [] };
    anthropicCreate.mockResolvedValue(anthropicResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.score).toBe(0);
  });

  it("evaluateFreeRecall — fractional score 3.7 rounds to 4", async () => {
    const feedback = { score: 3.7, feedback: "OK", keyPointsCovered: [], keyPointsMissed: [], misconceptions: [] };
    anthropicCreate.mockResolvedValue(anthropicResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.score).toBe(4);
  });

  it("evaluateFreeRecall — invalid JSON → fails with AIRequestError", async () => {
    anthropicCreate.mockResolvedValue(anthropicResponse("not valid json {{{"));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  it("evaluateFreeRecall — non-text content block → fails with AIRequestError", async () => {
    anthropicCreate.mockResolvedValue(anthropicNonTextResponse());

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    // non-text block → text is "" → JSON.parse("") throws → AIRequestError
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- generateHint ---

  it("generateHint — valid text → returns trimmed string", async () => {
    anthropicCreate.mockResolvedValue(anthropicResponse("  Think about what SYN means  "));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateHint(hintInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("Think about what SYN means");
  });

  it("generateHint — empty text → fails with AIRequestError", async () => {
    anthropicCreate.mockResolvedValue(anthropicResponse("   "));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateHint(hintInput));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- generateMicroLesson ---

  it("generateMicroLesson — valid JSON → returns parsed AIMicroLesson", async () => {
    const lesson = {
      title: "TCP Handshake",
      content: "TCP uses a three-way handshake...",
      keyTakeaways: ["SYN starts connection"],
    };
    anthropicCreate.mockResolvedValue(anthropicResponse(JSON.stringify(lesson)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateMicroLesson(microLessonInput));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("TCP Handshake");
      expect(result.value.keyTakeaways).toEqual(["SYN starts connection"]);
    }
  });

  it("generateMicroLesson — invalid JSON → fails with AIRequestError", async () => {
    anthropicCreate.mockResolvedValue(anthropicResponse("Here is a lesson about TCP"));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateMicroLesson(microLessonInput));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// OpenAI adapter (mocked SDK)
// ═══════════════════════════════════════════════════════════════════════════

describe("createOpenAIAdapter (mocked SDK)", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = "test-key";
    openaiCreate.mockReset();
  });

  afterEach(() => {
    if (savedEnv.OPENAI_API_KEY !== undefined) {
      process.env.OPENAI_API_KEY = savedEnv.OPENAI_API_KEY;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  function openaiResponse(content: string | null) {
    return { choices: [{ message: { content } }] };
  }

  async function getAdapter() {
    const mod = await import("../openai.adapter.js");
    return mod.createOpenAIAdapter();
  }

  it("falls back to noop when OPENAI_API_KEY not set", async () => {
    delete process.env.OPENAI_API_KEY;
    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- evaluateFreeRecall ---

  it("evaluateFreeRecall — valid JSON → parsed correctly", async () => {
    const feedback = {
      score: 3,
      feedback: "Decent answer",
      keyPointsCovered: ["SYN"],
      keyPointsMissed: ["ACK"],
      misconceptions: [],
    };
    openaiCreate.mockResolvedValue(openaiResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.score).toBe(3);
      expect(result.value.feedback).toBe("Decent answer");
    }
  });

  it("evaluateFreeRecall — score clamping works (high)", async () => {
    const feedback = { score: 10, feedback: "OK", keyPointsCovered: [], keyPointsMissed: [], misconceptions: [] };
    openaiCreate.mockResolvedValue(openaiResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.score).toBe(5);
  });

  it("evaluateFreeRecall — score clamping works (low)", async () => {
    const feedback = { score: -5, feedback: "Bad", keyPointsCovered: [], keyPointsMissed: [], misconceptions: [] };
    openaiCreate.mockResolvedValue(openaiResponse(JSON.stringify(feedback)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.score).toBe(0);
  });

  it("evaluateFreeRecall — null content → fails with AIRequestError", async () => {
    openaiCreate.mockResolvedValue(openaiResponse(null));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));

    // null content → text is "" → JSON.parse("") throws → AIRequestError
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- generateHint ---

  it("generateHint — valid text → returns string", async () => {
    openaiCreate.mockResolvedValue(openaiResponse("  Consider the protocol steps  "));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateHint(hintInput));

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe("Consider the protocol steps");
  });

  it("generateHint — empty content → fails with AIRequestError", async () => {
    openaiCreate.mockResolvedValue(openaiResponse(""));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateHint(hintInput));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  // --- generateMicroLesson ---

  it("generateMicroLesson — valid JSON → parsed", async () => {
    const lesson = {
      title: "Understanding TCP",
      content: "TCP establishes connections using...",
      keyTakeaways: ["Three-way handshake"],
    };
    openaiCreate.mockResolvedValue(openaiResponse(JSON.stringify(lesson)));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateMicroLesson(microLessonInput));

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.title).toBe("Understanding TCP");
      expect(result.value.content).toBe("TCP establishes connections using...");
    }
  });

  it("generateMicroLesson — invalid JSON → fails with AIRequestError", async () => {
    openaiCreate.mockResolvedValue(openaiResponse("This is a plain text lesson"));

    const adapter = await getAdapter();
    const result = await runEffect(adapter.generateMicroLesson(microLessonInput));

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Ollama adapter
// ═══════════════════════════════════════════════════════════════════════════

describe("createOllamaAdapter", () => {
  it("creates successfully without API key", async () => {
    const mod = await import("../openai.adapter.js");
    const adapter = mod.createOllamaAdapter();
    expect(adapter).toBeDefined();
    expect(adapter.evaluateFreeRecall).toBeTypeOf("function");
    expect(adapter.generateHint).toBeTypeOf("function");
    expect(adapter.generateMicroLesson).toBeTypeOf("function");
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// resolveProvider
// ═══════════════════════════════════════════════════════════════════════════

describe("resolveProvider", () => {
  const savedEnv: Record<string, string | undefined> = {};

  beforeEach(() => {
    savedEnv.AI_PROVIDER = process.env.AI_PROVIDER;
    savedEnv.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    savedEnv.OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    // Ensure API keys exist so providers don't fall back to noop
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.OPENAI_API_KEY = "test-key";
  });

  afterEach(() => {
    for (const [key, val] of Object.entries(savedEnv)) {
      if (val !== undefined) process.env[key] = val;
      else delete process.env[key];
    }
  });

  async function resolve() {
    const mod = await import("../AIService.js");
    return mod.resolveProvider();
  }

  it("AI_PROVIDER=anthropic → creates adapter with evaluateFreeRecall", async () => {
    process.env.AI_PROVIDER = "anthropic";
    const adapter = await resolve();
    expect(adapter.evaluateFreeRecall).toBeTypeOf("function");
    expect(adapter.generateHint).toBeTypeOf("function");
    expect(adapter.generateMicroLesson).toBeTypeOf("function");
  });

  it("AI_PROVIDER=openai → creates adapter", async () => {
    process.env.AI_PROVIDER = "openai";
    const adapter = await resolve();
    expect(adapter.evaluateFreeRecall).toBeTypeOf("function");
  });

  it("AI_PROVIDER=ollama → creates adapter", async () => {
    process.env.AI_PROVIDER = "ollama";
    const adapter = await resolve();
    expect(adapter.evaluateFreeRecall).toBeTypeOf("function");
  });

  it("AI_PROVIDER=none → creates noop", async () => {
    process.env.AI_PROVIDER = "none";
    const adapter = await resolve();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error._tag).toBe("AIRequestError");
  });

  it("unset AI_PROVIDER → creates noop", async () => {
    delete process.env.AI_PROVIDER;
    const adapter = await resolve();
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
  });

  it("unknown AI_PROVIDER → warns and creates noop", async () => {
    process.env.AI_PROVIDER = "banana";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const adapter = await resolve();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("banana"),
    );
    const result = await runEffect(adapter.evaluateFreeRecall(evalInput));
    expect(result.ok).toBe(false);
    warnSpy.mockRestore();
  });
});
