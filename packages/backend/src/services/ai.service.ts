import Anthropic from "@anthropic-ai/sdk";
import type { AIFeedback } from "./ai.types.js";

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

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

export async function evaluateFreeRecall(
  concept: string,
  prompt: string,
  correctAnswer: string,
  keyPoints: string[],
  rubric: string,
  learnerResponse: string,
): Promise<AIFeedback | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const userMessage = `Concept: ${concept}
Question: ${prompt}
Correct answer: ${correctAnswer}
${keyPoints.length > 0 ? `Key points to cover:\n${keyPoints.map((p) => `- ${p}`).join("\n")}` : ""}
${rubric ? `Rubric: ${rubric}` : ""}

Learner's response: ${learnerResponse}`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      system: TUTOR_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const parsed = JSON.parse(text) as AIFeedback;

    // Validate score range
    parsed.score = Math.max(0, Math.min(5, Math.round(parsed.score)));

    return parsed;
  } catch (err) {
    console.error("AI evaluation failed:", err);
    return null;
  }
}

const HINT_SYSTEM_PROMPT = `You are a Socratic learning tutor. Generate a brief, helpful hint that guides the learner toward the correct answer WITHOUT revealing it directly.

The hint should:
- Point the learner in the right direction
- Reference a related concept or framework that helps recall
- Be 1-2 sentences maximum
- Never state the answer directly

Respond with ONLY the hint text, no JSON or formatting.`;

export async function generateHint(
  concept: string,
  prompt: string,
  learnerResponse: string,
  correctAnswer: string,
): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const userMessage = `Concept: ${concept}
Question: ${prompt}
Correct answer (DO NOT reveal this): ${correctAnswer}
${learnerResponse ? `Learner's incorrect response: ${learnerResponse}` : "The learner got this wrong."}

Generate a Socratic hint:`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      system: HINT_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return response.content[0].type === "text" ? response.content[0].text.trim() : null;
  } catch (err) {
    console.error("AI hint generation failed:", err);
    return null;
  }
}
