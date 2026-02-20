export interface AIFeedback {
  score: number;         // 0–5
  feedback: string;
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  misconceptions: string[];
}

export interface AIEvaluationInput {
  concept: string;
  prompt: string;
  correctAnswer: string;
  keyPoints: string[];
  rubric: string;
  learnerResponse: string;
  previousMisconceptions?: string[];
}

export interface AIHintInput {
  concept: string;
  prompt: string;
  learnerResponse: string;
  correctAnswer: string;
}

export interface AIMicroLessonInput {
  concept: string;
  correctAnswer: string;
  explanation: string;
  keyPoints: string[];
  misconceptions: string[];
}

export interface AIMicroLesson {
  title: string;
  content: string;
  keyTakeaways: string[];
}
