import type { AIEvaluationInput, AIHintInput, AIMicroLessonInput } from "./ai.types.js";

export function buildEvaluationMessage(input: AIEvaluationInput): string {
  const misconceptionsSection =
    input.previousMisconceptions && input.previousMisconceptions.length > 0
      ? `\nPrevious misconceptions detected for this learner on this topic:\n${input.previousMisconceptions.map((m) => `- ${m}`).join("\n")}\nPay attention to whether these persist in the current response.\n`
      : "";

  return `Concept: ${input.concept}
Question: ${input.prompt}
Correct answer: ${input.correctAnswer}
${input.keyPoints.length > 0 ? `Key points to cover:\n${input.keyPoints.map((p) => `- ${p}`).join("\n")}` : ""}
${input.rubric ? `Rubric: ${input.rubric}` : ""}${misconceptionsSection}
<learner_response>
${input.learnerResponse}
</learner_response>`;
}

export function buildHintMessage(input: AIHintInput): string {
  const responseSection = input.learnerResponse
    ? `Learner's incorrect response:\n<learner_response>\n${input.learnerResponse}\n</learner_response>`
    : "The learner got this wrong.";

  return `Concept: ${input.concept}
Question: ${input.prompt}
Correct answer (DO NOT reveal this): ${input.correctAnswer}
${responseSection}

Generate a Socratic hint:`;
}

export function buildMicroLessonMessage(input: AIMicroLessonInput): string {
  const misconceptionsSection =
    input.misconceptions.length > 0
      ? `\nKnown misconceptions this learner has:\n${input.misconceptions.map((m) => `- ${m}`).join("\n")}\nAddress these directly in the lesson.`
      : "";

  return `Concept: ${input.concept}
Correct explanation: ${input.explanation}
${input.keyPoints.length > 0 ? `Key points:\n${input.keyPoints.map((p) => `- ${p}`).join("\n")}` : ""}${misconceptionsSection}

Generate a brief, clear micro-lesson:`;
}
