import type { LearnerNodeState, QuestionTemplate } from "../types.js";

const QUESTION_TYPE_ORDER: QuestionTemplate["type"][] = [
  "recognition",
  "cued_recall",
  "free_recall",
  "application",
  "practical",
];

/**
 * Get the ordinal difficulty of a question type (0–4).
 */
export function getQuestionTypeDifficulty(type: QuestionTemplate["type"]): number {
  return QUESTION_TYPE_ORDER.indexOf(type);
}

const QUESTION_TYPE_LABELS: Record<QuestionTemplate["type"], string> = {
  recognition: "Multiple Choice",
  cued_recall: "Short Answer",
  free_recall: "Free Recall",
  application: "Application",
  practical: "Practical",
};

/**
 * Get the human-readable label for a question type.
 */
export function getQuestionTypeLabel(type: QuestionTemplate["type"]): string {
  return QUESTION_TYPE_LABELS[type] ?? type;
}

/**
 * Select the appropriate question type based on learner mastery level.
 *
 * - New/struggling nodes (repetitions 0–2 or easiness < 1.8) → recognition
 * - Intermediate (repetitions 3–5, easiness ≥ 1.8) → cued_recall
 * - Strong (repetitions 6+, easiness ≥ 2.2) → free_recall
 *
 * Always falls back to the best available type at or below the computed level.
 */
export function selectQuestionType(
  state: LearnerNodeState,
  availableTypes: QuestionTemplate["type"][],
): QuestionTemplate["type"] {
  if (availableTypes.length === 0) {
    return "recognition"; // fallback default
  }

  // Determine target level
  let targetType: QuestionTemplate["type"];

  if (state.repetitions >= 6 && state.easiness >= 2.2) {
    targetType = "free_recall";
  } else if (state.repetitions >= 3 && state.easiness >= 1.8) {
    targetType = "cued_recall";
  } else {
    targetType = "recognition";
  }

  const targetDifficulty = getQuestionTypeDifficulty(targetType);

  // Find the best available type at or below the target level
  const availableWithDifficulty = availableTypes
    .map((type) => ({ type, difficulty: getQuestionTypeDifficulty(type) }))
    .filter((t) => t.difficulty <= targetDifficulty)
    .sort((a, b) => b.difficulty - a.difficulty);

  if (availableWithDifficulty.length > 0) {
    return availableWithDifficulty[0].type;
  }

  // If nothing at or below target, pick the easiest available type
  const sorted = availableTypes
    .map((type) => ({ type, difficulty: getQuestionTypeDifficulty(type) }))
    .sort((a, b) => a.difficulty - b.difficulty);

  return sorted[0].type;
}
