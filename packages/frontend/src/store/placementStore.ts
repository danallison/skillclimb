import { create } from "zustand";
import type {
  PlacementQuestion,
  PlacementAnswerResponse,
} from "../api/hooks.js";

interface PlacementStore {
  placementId: string | null;
  currentQuestion: PlacementQuestion | null;
  questionsAnswered: number;
  estimatedTotal: number;
  theta: number;
  standardError: number;
  selectedAnswer: string | null;
  lastResult: PlacementAnswerResponse | null;
  phase: "answering" | "feedback" | "results";
  finalResult: PlacementAnswerResponse["result"] | null;

  startPlacement: (
    placementId: string,
    question: PlacementQuestion,
    estimatedTotal: number,
  ) => void;
  selectAnswer: (answer: string | null) => void;
  handleAnswer: (result: PlacementAnswerResponse) => void;
  advanceToNext: () => void;
  reset: () => void;
}

export const usePlacementStore = create<PlacementStore>((set, get) => ({
  placementId: null,
  currentQuestion: null,
  questionsAnswered: 0,
  estimatedTotal: 20,
  theta: 0,
  standardError: 4.0,
  selectedAnswer: null,
  lastResult: null,
  phase: "answering",
  finalResult: null,

  startPlacement: (placementId, question, estimatedTotal) => {
    set({
      placementId,
      currentQuestion: question,
      questionsAnswered: 0,
      estimatedTotal,
      theta: 0,
      standardError: 4.0,
      selectedAnswer: null,
      lastResult: null,
      phase: "answering",
      finalResult: null,
    });
  },

  selectAnswer: (answer) => set({ selectedAnswer: answer }),

  handleAnswer: (result) => {
    if (result.done) {
      set({
        lastResult: result,
        questionsAnswered: result.questionsAnswered,
        theta: result.theta,
        standardError: result.standardError,
        phase: "results",
        finalResult: result.result ?? null,
      });
    } else {
      set({
        lastResult: result,
        questionsAnswered: result.questionsAnswered,
        estimatedTotal: result.estimatedTotal,
        theta: result.theta,
        standardError: result.standardError,
        phase: "feedback",
      });
    }
  },

  advanceToNext: () => {
    const { lastResult } = get();
    if (lastResult?.question) {
      set({
        currentQuestion: lastResult.question,
        selectedAnswer: null,
        lastResult: null,
        phase: "answering",
      });
    }
  },

  reset: () => {
    set({
      placementId: null,
      currentQuestion: null,
      questionsAnswered: 0,
      estimatedTotal: 20,
      theta: 0,
      standardError: 4.0,
      selectedAnswer: null,
      lastResult: null,
      phase: "answering",
      finalResult: null,
    });
  },
}));
