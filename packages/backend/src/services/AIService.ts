import { Context, Effect, Layer } from "effect";
import Anthropic from "@anthropic-ai/sdk";
import type { AIFeedback, AIEvaluationInput, AIHintInput } from "./ai.types.js";
import { AIRequestError } from "../errors.js";

export interface AIServiceShape {
  readonly evaluateFreeRecall: (
    input: AIEvaluationInput,
  ) => Effect.Effect<AIFeedback, AIRequestError>;
  readonly generateHint: (
    input: AIHintInput,
  ) => Effect.Effect<string, AIRequestError>;
}

export class AIService extends Context.Tag("AIService")<
  AIService,
  AIServiceShape
>() {}

const TUTOR_SYSTEM_PROMPT = `You are a patient, encouraging learning tutor for SkillClimb, a spaced repetition learning platform. Your role is to evaluate learner responses to free-recall questions and provide constructive feedback.

When evaluating, be:
- Fair but rigorous — partial knowledge should get partial credit
- Encouraging — acknowledge what the learner got right before pointing out gaps
- Specific — reference exact key points covered or missed
- Educational — briefly explain misconceptions without being condescending

Respond ONLY with valid JSON matching this schema:
{
  "score": <number 0-5>,
  "feedback": "<2-3 sentences of constructive feedback>",
  "keyPointsCovered": ["<points the learner addressed>"],
  "keyPointsMissed": ["<points the learner missed>"],
  "misconceptions": ["<any incorrect claims, empty array if none>"]
}

Score guide:
0 = completely wrong or blank
1 = shows vague awareness but mostly wrong
2 = partially correct, major gaps
3 = mostly correct, some gaps
4 = correct with minor omissions
5 = comprehensive and accurate`;

const HINT_SYSTEM_PROMPT = `You are a Socratic learning tutor. Generate a brief, helpful hint that guides the learner toward the correct answer WITHOUT revealing it directly.

The hint should:
- Point the learner in the right direction
- Reference a related concept or framework that helps recall
- Be 1-2 sentences maximum
- Never state the answer directly

Respond with ONLY the hint text, no JSON or formatting.`;

const apiKey = process.env.ANTHROPIC_API_KEY;
const client = apiKey ? new Anthropic() : null;

const evaluateFreeRecall = (
  input: AIEvaluationInput,
): Effect.Effect<AIFeedback, AIRequestError> => {
  if (!client) {
    return Effect.fail(
      new AIRequestError({ cause: new Error("ANTHROPIC_API_KEY not set") }),
    );
  }

  const userMessage = `Concept: ${input.concept}
Question: ${input.prompt}
Correct answer: ${input.correctAnswer}
${input.keyPoints.length > 0 ? `Key points to cover:\n${input.keyPoints.map((p) => `- ${p}`).join("\n")}` : ""}
${input.rubric ? `Rubric: ${input.rubric}` : ""}

Learner's response: ${input.learnerResponse}`;

  return Effect.tryPromise({
    try: async () => {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: TUTOR_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      const parsed = JSON.parse(text) as AIFeedback;
      parsed.score = Math.max(0, Math.min(5, Math.round(parsed.score)));
      return parsed;
    },
    catch: (cause) => new AIRequestError({ cause }),
  });
};

const generateHint = (
  input: AIHintInput,
): Effect.Effect<string, AIRequestError> => {
  if (!client) {
    return Effect.fail(
      new AIRequestError({ cause: new Error("ANTHROPIC_API_KEY not set") }),
    );
  }

  const userMessage = `Concept: ${input.concept}
Question: ${input.prompt}
Correct answer (DO NOT reveal this): ${input.correctAnswer}
${input.learnerResponse ? `Learner's incorrect response: ${input.learnerResponse}` : "The learner got this wrong."}

Generate a Socratic hint:`;

  return Effect.tryPromise({
    try: async () => {
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 150,
        system: HINT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      const text =
        response.content[0].type === "text"
          ? response.content[0].text.trim()
          : "";
      if (!text) throw new Error("Empty AI response");
      return text;
    },
    catch: (cause) => new AIRequestError({ cause }),
  });
};

export const AIServiceLive = Layer.succeed(AIService, {
  evaluateFreeRecall,
  generateHint,
});
