// === Knowledge hierarchy ===

export interface Domain {
  id: string;
  tier: number;
  name: string;
  description: string;
  prerequisites: string[]; // domain IDs
  displayOrder: number;
}

export interface Topic {
  id: string;
  domainId: string;
  name: string;
  complexityWeight: number;
  displayOrder: number;
}

export interface QuestionTemplate {
  type: "recognition" | "cued_recall" | "free_recall" | "application" | "practical";
  prompt: string;
  choices?: string[];              // recognition
  correctAnswer: string;          // recognition, cued_recall
  explanation: string;
  acceptableAnswers?: string[];   // cued_recall: alternative correct answers
  hints?: string[];               // all types: for second-attempt hint system
  rubric?: string;                // free_recall: what a good answer covers
  keyPoints?: string[];           // free_recall: key points for AI evaluation
  microLesson?: string;           // optional hand-authored micro-lesson content
}

export interface Node {
  id: string;
  topicId: string;
  domainId: string; // denormalized for session builder convenience
  concept: string;
  questionTemplates: QuestionTemplate[];
}

// === SRS state ===

export interface LearnerNodeState {
  userId: string;
  nodeId: string;
  domainId: string; // denormalized for interleaving
  easiness: number; // 1.3–5.0, starts at 2.5
  interval: number; // days
  repetitions: number;
  dueDate: Date;
  confidenceHistory: CalibrationEntry[];
  domainWeight: number; // 0.5–2.0
  misconceptions?: string[];
}

export interface CalibrationEntry {
  confidence: number; // 1–5
  wasCorrect: boolean;
  timestamp: Date;
}

export interface CalibrationHistory {
  entries: CalibrationEntry[];
}

// === Reviews ===

export interface ReviewInput {
  score: number; // 0–5
  confidence: number; // 1–5
  response: string;
}

export interface ReviewResult {
  previousState: LearnerNodeState;
  nextState: LearnerNodeState;
  wasCorrect: boolean;
  calibrationQuadrant: CalibrationQuadrant;
}

export type CalibrationQuadrant =
  | "calibrated" // high confidence + correct
  | "illusion" // high confidence + incorrect
  | "undervalued" // low confidence + correct
  | "known_unknown"; // low confidence + incorrect

// === Sessions ===

export interface SessionConfig {
  minItems: number; // default 15
  maxItems: number; // default 25
  targetItems: number; // default 20
}

export interface SessionItem {
  node: Node;
  learnerState: LearnerNodeState;
  questionTemplate: QuestionTemplate;
  priority: number;
  needsLesson?: boolean;
}

export interface SessionResult {
  items: SessionItem[];
  totalItems: number;
}

/** Score threshold for considering a review "correct" (0–5 scale) */
export const CORRECT_SCORE_THRESHOLD = 3;

/** Mastery percentage required to unlock prerequisite domains */
export const MASTERY_THRESHOLD_PERCENT = 60;

export const DEFAULT_SESSION_CONFIG: SessionConfig = {
  minItems: 15,
  maxItems: 25,
  targetItems: 20,
};

export const DEFAULT_LEARNER_STATE: Omit<LearnerNodeState, "userId" | "nodeId" | "domainId"> = {
  easiness: 2.5,
  interval: 0,
  repetitions: 0,
  dueDate: new Date(0),
  confidenceHistory: [],
  domainWeight: 1.0,
};

// === IRT (Item Response Theory) ===

export interface IRTItem {
  nodeId: string;
  domainId: string;
  difficulty: number;
}

export interface IRTResponse {
  nodeId: string;
  domainId: string;
  difficulty: number;
  correct: boolean;
}

export interface IRTState {
  theta: number;
  standardError: number;
  responses: IRTResponse[];
  domainThetas: Map<string, number>;
}

export interface PlacementConfig {
  minItems: number;        // minimum questions before termination (default 20)
  maxItems: number;        // hard cap (default 60)
  sePrecisionTarget: number; // SE threshold for early termination (default 0.3)
  seRelaxedTarget: number;   // SE threshold after extended test (default 0.5)
  relaxedMinItems: number;   // when to apply relaxed SE target (default 40)
  topK: number;              // top-K items for randomized selection (default 5)
  domainCoverageWeight: number; // weight for under-represented domains (default 2.0)
}

export const DEFAULT_PLACEMENT_CONFIG: PlacementConfig = {
  minItems: 20,
  maxItems: 60,
  sePrecisionTarget: 0.3,
  seRelaxedTarget: 0.5,
  relaxedMinItems: 40,
  topK: 5,
  domainCoverageWeight: 2.0,
};

export type NodeClassification = "mastered" | "partial" | "weak" | "unknown";

export interface NodeClassificationResult {
  nodeId: string;
  domainId: string;
  classification: NodeClassification;
  probability: number;
  initialState: Omit<LearnerNodeState, "userId" | "nodeId" | "domainId">;
}

export interface PlacementResult {
  globalTheta: number;
  domainThetas: Record<string, number>;
  nodeClassifications: NodeClassificationResult[];
}

// === Calibration Analytics ===

export interface CalibrationTrend {
  periodStart: Date;
  periodEnd: Date;
  score: number;
  entryCount: number;
}

export interface CalibrationInsight {
  type: "overconfident" | "underconfident" | "well_calibrated" | "improving" | "declining" | "domain_specific";
  message: string;
  severity: "info" | "warning" | "success";
}

export interface CalibrationAnalysis {
  overallScore: number;
  quadrantCounts: Record<CalibrationQuadrant, number>;
  quadrantPercentages: Record<CalibrationQuadrant, number>;
  domainBreakdown: Array<{
    domainId: string;
    score: number;
    quadrantCounts: Record<CalibrationQuadrant, number>;
    entryCount: number;
  }>;
  trend: CalibrationTrend[];
  insights: CalibrationInsight[];
  totalEntries: number;
}
