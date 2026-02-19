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
  choices: string[];
  correctAnswer: string;
  explanation: string;
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
}

export interface SessionResult {
  items: SessionItem[];
  totalItems: number;
}

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
