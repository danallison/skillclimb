import { create } from "zustand";
import type { ReviewRecord as CoreReviewRecord, SelfRating } from "@skillclimb/core";
import type { SessionResponse, ReviewResponse } from "../api/hooks.js";

const STORAGE_KEYS = {
  userId: "skillclimb_userId",
  selectedSkillTreeId: "skillclimb_selectedSkillTreeId",
  sessionId: "skillclimb_sessionId",
  itemIndex: "skillclimb_itemIndex",
  reviewHistory: "skillclimb_reviewHistory",
} as const;

interface ReviewRecord extends CoreReviewRecord {
  nodeId: string;
  score: number;
  calibrationQuadrant: string;
}

type SessionPhase =
  | "lesson"
  | "answering"
  | "confidence"
  | "feedback"
  | "hint"
  | "second_attempt"
  | "second_confidence"
  | "second_feedback"
  | "summary";

interface SessionStore {
  userId: string | null;
  selectedSkillTreeId: string | null;
  savedSessionId: string | null;
  savedItemIndex: number;
  session: SessionResponse | null;
  currentItemIndex: number;
  selectedAnswer: string | null;
  selfRating: SelfRating | null;
  confidenceRating: number | null;
  reviewResult: ReviewResponse | null;
  reviewHistory: ReviewRecord[];
  phase: SessionPhase;
  attemptNumber: 1 | 2;
  hintText: string | null;
  lessonContent: { title: string; content: string; keyTakeaways: string[] } | null;

  setUserId: (id: string) => void;
  setSelectedSkillTreeId: (id: string | null) => void;
  setSession: (session: SessionResponse) => void;
  resumeSession: (session: SessionResponse, itemIndex: number) => void;
  selectAnswer: (answer: string) => void;
  setSelfRating: (rating: SelfRating) => void;
  setConfidenceRating: (rating: number) => void;
  setReviewResult: (result: ReviewResponse) => void;
  recordReview: (record: ReviewRecord) => void;
  nextItem: () => void;
  setPhase: (phase: SessionPhase) => void;
  showHint: (hint: string) => void;
  setLessonContent: (lesson: { title: string; content: string; keyTakeaways: string[] }) => void;
  dismissLesson: () => void;
  resetForSecondAttempt: () => void;
  reset: () => void;
  logout: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  userId: localStorage.getItem(STORAGE_KEYS.userId),
  selectedSkillTreeId: localStorage.getItem(STORAGE_KEYS.selectedSkillTreeId),
  savedSessionId: localStorage.getItem(STORAGE_KEYS.sessionId),
  savedItemIndex: parseInt(localStorage.getItem(STORAGE_KEYS.itemIndex) ?? "0", 10),
  session: null,
  currentItemIndex: 0,
  selectedAnswer: null,
  selfRating: null,
  confidenceRating: null,
  reviewResult: null,
  reviewHistory: [],
  phase: "answering",
  attemptNumber: 1,
  hintText: null,
  lessonContent: null,

  setUserId: (id) => {
    localStorage.setItem(STORAGE_KEYS.userId, id);
    set({ userId: id });
  },
  setSelectedSkillTreeId: (id) => {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.selectedSkillTreeId, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.selectedSkillTreeId);
    }
    set({ selectedSkillTreeId: id });
  },
  setSession: (session) => {
    localStorage.setItem(STORAGE_KEYS.sessionId, session.id);
    localStorage.setItem(STORAGE_KEYS.itemIndex, "0");
    localStorage.setItem(STORAGE_KEYS.reviewHistory, "[]");
    set({ session, savedSessionId: null, savedItemIndex: 0, currentItemIndex: 0, reviewHistory: [], phase: "answering", attemptNumber: 1, hintText: null, lessonContent: null });
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
      attemptNumber: 1,
      hintText: null,
      lessonContent: null,
    });
  },
  selectAnswer: (answer) => set({ selectedAnswer: answer }),
  setSelfRating: (rating) => set({ selfRating: rating }),
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
        selfRating: null,
        confidenceRating: null,
        reviewResult: null,
        phase: isComplete ? "summary" : "answering",
        attemptNumber: 1,
        hintText: null,
        lessonContent: null,
      };
    }),
  setPhase: (phase) => set({ phase }),
  showHint: (hint) => set({ phase: "hint", hintText: hint }),
  setLessonContent: (lesson) => set({ phase: "lesson", lessonContent: lesson }),
  dismissLesson: () => set({ phase: "answering", lessonContent: null }),
  resetForSecondAttempt: () =>
    set({
      phase: "second_attempt",
      attemptNumber: 2,
      selectedAnswer: null,
      selfRating: null,
      confidenceRating: null,
      reviewResult: null,
    }),
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
      selfRating: null,
      confidenceRating: null,
      reviewResult: null,
      reviewHistory: [],
      phase: "answering",
      attemptNumber: 1,
      hintText: null,
      lessonContent: null,
    });
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.userId);
    localStorage.removeItem(STORAGE_KEYS.selectedSkillTreeId);
    localStorage.removeItem(STORAGE_KEYS.sessionId);
    localStorage.removeItem(STORAGE_KEYS.itemIndex);
    localStorage.removeItem(STORAGE_KEYS.reviewHistory);
    set({
      userId: null,
      selectedSkillTreeId: null,
      session: null,
      savedSessionId: null,
      savedItemIndex: 0,
      currentItemIndex: 0,
      selectedAnswer: null,
      selfRating: null,
      confidenceRating: null,
      reviewResult: null,
      reviewHistory: [],
      phase: "answering",
      attemptNumber: 1,
      hintText: null,
      lessonContent: null,
    });
  },
}));
