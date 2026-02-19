import { create } from "zustand";
import type { ReviewRecord as CoreReviewRecord } from "@skillclimb/core";
import type { SessionResponse, ReviewResponse } from "../api/hooks.js";

const STORAGE_KEYS = {
  userId: "skillclimb_userId",
  sessionId: "skillclimb_sessionId",
  itemIndex: "skillclimb_itemIndex",
  reviewHistory: "skillclimb_reviewHistory",
} as const;

interface ReviewRecord extends CoreReviewRecord {
  nodeId: string;
  score: number;
  calibrationQuadrant: string;
}

interface SessionStore {
  userId: string | null;
  savedSessionId: string | null;
  savedItemIndex: number;
  session: SessionResponse | null;
  currentItemIndex: number;
  selectedAnswer: string | null;
  didSelectDontKnow: boolean;
  confidenceRating: number | null;
  reviewResult: ReviewResponse | null;
  reviewHistory: ReviewRecord[];
  phase: "answering" | "confidence" | "feedback" | "summary";

  setUserId: (id: string) => void;
  setSession: (session: SessionResponse) => void;
  resumeSession: (session: SessionResponse, itemIndex: number) => void;
  selectAnswer: (answer: string) => void;
  selectDontKnow: () => void;
  setConfidenceRating: (rating: number) => void;
  setReviewResult: (result: ReviewResponse) => void;
  recordReview: (record: ReviewRecord) => void;
  nextItem: () => void;
  setPhase: (phase: SessionStore["phase"]) => void;
  reset: () => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  userId: localStorage.getItem(STORAGE_KEYS.userId),
  savedSessionId: localStorage.getItem(STORAGE_KEYS.sessionId),
  savedItemIndex: parseInt(localStorage.getItem(STORAGE_KEYS.itemIndex) ?? "0", 10),
  session: null,
  currentItemIndex: 0,
  selectedAnswer: null,
  didSelectDontKnow: false,
  confidenceRating: null,
  reviewResult: null,
  reviewHistory: [],
  phase: "answering",

  setUserId: (id) => {
    localStorage.setItem(STORAGE_KEYS.userId, id);
    set({ userId: id });
  },
  setSession: (session) => {
    localStorage.setItem(STORAGE_KEYS.sessionId, session.id);
    localStorage.setItem(STORAGE_KEYS.itemIndex, "0");
    localStorage.setItem(STORAGE_KEYS.reviewHistory, "[]");
    set({ session, savedSessionId: null, savedItemIndex: 0, currentItemIndex: 0, reviewHistory: [], phase: "answering" });
  },
  resumeSession: (session, itemIndex) => {
    const isComplete = itemIndex >= session.items.length;
    let savedHistory: ReviewRecord[] = [];
    try {
      savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.reviewHistory) ?? "[]");
    } catch {}
    set({
      session,
      savedSessionId: null,
      savedItemIndex: 0,
      currentItemIndex: itemIndex,
      reviewHistory: savedHistory,
      phase: isComplete ? "summary" : "answering",
    });
  },
  selectAnswer: (answer) => set({ selectedAnswer: answer, didSelectDontKnow: false }),
  selectDontKnow: () => set({ selectedAnswer: null, didSelectDontKnow: true }),
  setConfidenceRating: (rating) => set({ confidenceRating: rating }),
  setReviewResult: (result) => set({ reviewResult: result }),
  recordReview: (record) =>
    set((state) => {
      const updated = [...state.reviewHistory, record];
      localStorage.setItem(STORAGE_KEYS.reviewHistory, JSON.stringify(updated));
      return { reviewHistory: updated };
    }),
  nextItem: () =>
    set((state) => {
      const nextIndex = state.currentItemIndex + 1;
      const isComplete = state.session && nextIndex >= state.session.items.length;
      localStorage.setItem(STORAGE_KEYS.itemIndex, String(nextIndex));
      if (isComplete) {
        localStorage.removeItem(STORAGE_KEYS.sessionId);
        localStorage.removeItem(STORAGE_KEYS.itemIndex);
        localStorage.removeItem(STORAGE_KEYS.reviewHistory);
      }
      return {
        currentItemIndex: nextIndex,
        selectedAnswer: null,
        didSelectDontKnow: false,
        confidenceRating: null,
        reviewResult: null,
        phase: isComplete ? "summary" : "answering",
      };
    }),
  setPhase: (phase) => set({ phase }),
  reset: () => {
    localStorage.removeItem(STORAGE_KEYS.sessionId);
    localStorage.removeItem(STORAGE_KEYS.itemIndex);
    localStorage.removeItem(STORAGE_KEYS.reviewHistory);
    set({
      session: null,
      savedSessionId: null,
      savedItemIndex: 0,
      currentItemIndex: 0,
      selectedAnswer: null,
      didSelectDontKnow: false,
      confidenceRating: null,
      reviewResult: null,
      reviewHistory: [],
      phase: "answering",
    });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.userId);
    localStorage.removeItem(STORAGE_KEYS.sessionId);
    localStorage.removeItem(STORAGE_KEYS.itemIndex);
    localStorage.removeItem(STORAGE_KEYS.reviewHistory);
    set({
      userId: null,
      session: null,
      savedSessionId: null,
      savedItemIndex: 0,
      currentItemIndex: 0,
      selectedAnswer: null,
      didSelectDontKnow: false,
      confidenceRating: null,
      reviewResult: null,
      reviewHistory: [],
      phase: "answering",
    });
  },
}));
