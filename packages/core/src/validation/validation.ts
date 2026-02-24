export const VALID_QUESTION_TYPES = [
  "recognition",
  "cued_recall",
  "free_recall",
  "application",
  "practical",
] as const;

export type ValidQuestionType = (typeof VALID_QUESTION_TYPES)[number];

// --- Assert guards (throw RangeError) ---

export function assertScore(n: number): void {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 5) {
    throw new RangeError(`score must be an integer between 0 and 5, got ${n}`);
  }
}

export function assertConfidence(n: number): void {
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 5) {
    throw new RangeError(`confidence must be an integer between 1 and 5, got ${n}`);
  }
}

export function assertEasiness(n: number): void {
  if (!Number.isFinite(n) || n < 1.3 || n > 5.0) {
    throw new RangeError(`easiness must be between 1.3 and 5.0, got ${n}`);
  }
}

export function assertInterval(n: number): void {
  if (!Number.isFinite(n) || n < 0) {
    throw new RangeError(`interval must be >= 0, got ${n}`);
  }
}

export function assertRepetitions(n: number): void {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`repetitions must be a non-negative integer, got ${n}`);
  }
}

export function assertDomainWeight(n: number): void {
  if (!Number.isFinite(n) || n <= 0) {
    throw new RangeError(`domainWeight must be > 0, got ${n}`);
  }
}

export function assertNonEmptyString(s: string, label = "value"): void {
  if (typeof s !== "string" || s.trim().length === 0) {
    throw new RangeError(`${label} must be a non-empty string`);
  }
}

export function assertQuestionType(s: string): void {
  if (!(VALID_QUESTION_TYPES as readonly string[]).includes(s)) {
    throw new RangeError(
      `questionType must be one of ${VALID_QUESTION_TYPES.join(", ")}, got "${s}"`,
    );
  }
}

// --- Boolean guards ---

export function isValidScore(n: number): boolean {
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n <= 5;
}

export function isValidConfidence(n: number): boolean {
  return Number.isFinite(n) && Number.isInteger(n) && n >= 1 && n <= 5;
}

export function isValidQuestionType(s: string): boolean {
  return (VALID_QUESTION_TYPES as readonly string[]).includes(s);
}
