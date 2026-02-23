import { describe, it, expect, beforeEach } from "vitest";
import { useSessionStore } from "../sessionStore.js";
import type { SessionResponse, ReviewResponse } from "../../api/hooks.js";

function makeSession(itemCount = 3): SessionResponse {
  return {
    id: "session-1",
    userId: "user-1",
    startedAt: new Date().toISOString(),
    totalItems: itemCount,
    items: Array.from({ length: itemCount }, (_, i) => ({
      node: {
        id: `node-${i}`,
        topicId: `topic-${i}`,
        domainId: `domain-${i}`,
        concept: `Concept ${i}`,
        questionTemplates: [],
      },
      learnerState: { easiness: 2.5, interval: 1, repetitions: 0 },
      questionTemplate: {
        type: "recognition" as const,
        prompt: `Question ${i}`,
        correctAnswer: `Answer ${i}`,
        explanation: `Explanation ${i}`,
      },
      priority: 1,
    })),
  };
}

function makeReviewRecord(nodeId: string, wasCorrect: boolean) {
  return {
    nodeId,
    score: wasCorrect ? 5 : 1,
    confidence: 3,
    wasCorrect,
    calibrationQuadrant: "calibrated",
  };
}

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState(useSessionStore.getInitialState());
});

describe("sessionStore", () => {
  describe("setSession", () => {
    it("resets state for a new session", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);

      const state = useSessionStore.getState();
      expect(state.session).toBe(session);
      expect(state.currentItemIndex).toBe(0);
      expect(state.reviewHistory).toEqual([]);
      expect(state.phase).toBe("answering");
      expect(state.attemptNumber).toBe(1);
      expect(state.momentum.recentTotal).toBe(0);
    });

    it("writes session to localStorage", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);

      expect(localStorage.getItem("skillclimb_sessionId")).toBe("session-1");
      expect(localStorage.getItem("skillclimb_itemIndex")).toBe("0");
      expect(localStorage.getItem("skillclimb_reviewHistory")).toBe("[]");
    });
  });

  describe("recordReview — momentum double-count regression", () => {
    it("appends when recording reviews for different nodes", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);

      useSessionStore.getState().recordReview(makeReviewRecord("node-0", true));
      useSessionStore.getState().recordReview(makeReviewRecord("node-1", false));

      const state = useSessionStore.getState();
      expect(state.reviewHistory).toHaveLength(2);
      expect(state.momentum.recentCorrect).toBe(1);
      expect(state.momentum.recentTotal).toBe(2);
    });

    it("replaces last entry when same nodeId (hint retry)", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);

      // First attempt: wrong
      useSessionStore.getState().recordReview(makeReviewRecord("node-0", false));
      expect(useSessionStore.getState().reviewHistory).toHaveLength(1);

      // Hint retry: same node, now correct — should REPLACE, not append
      useSessionStore.getState().recordReview(makeReviewRecord("node-0", true));

      const state = useSessionStore.getState();
      expect(state.reviewHistory).toHaveLength(1);
      expect(state.reviewHistory[0].wasCorrect).toBe(true);
      expect(state.momentum.recentCorrect).toBe(1);
      expect(state.momentum.recentTotal).toBe(1);
    });

    it("does not replace when a different node separates same-node reviews", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);

      useSessionStore.getState().recordReview(makeReviewRecord("node-0", false));
      useSessionStore.getState().recordReview(makeReviewRecord("node-1", true));
      // node-0 again, but node-1 is the last entry, so it should append
      useSessionStore.getState().recordReview(makeReviewRecord("node-0", true));

      expect(useSessionStore.getState().reviewHistory).toHaveLength(3);
    });
  });

  describe("pauseSession — session resume regression", () => {
    it("clears in-memory session but preserves localStorage", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);
      useSessionStore.getState().nextItem(); // advance to index 1
      useSessionStore.getState().pauseSession();

      const state = useSessionStore.getState();
      expect(state.session).toBeNull();
      expect(state.savedSessionId).toBe("session-1");
      expect(state.savedItemIndex).toBe(1);

      // localStorage should still have the session
      expect(localStorage.getItem("skillclimb_sessionId")).toBe("session-1");
    });
  });

  describe("nextItem", () => {
    it("advances index and writes to localStorage", () => {
      const session = makeSession(3);
      useSessionStore.getState().setSession(session);
      useSessionStore.getState().nextItem();

      const state = useSessionStore.getState();
      expect(state.currentItemIndex).toBe(1);
      expect(state.phase).toBe("answering");
      expect(localStorage.getItem("skillclimb_itemIndex")).toBe("1");
    });

    it("resets per-item state on advance", () => {
      const session = makeSession(3);
      useSessionStore.getState().setSession(session);

      // Simulate answering first item
      useSessionStore.getState().selectAnswer("my answer");
      useSessionStore.getState().setConfidenceRating(4);
      useSessionStore.getState().setReviewResult({
        wasCorrect: true,
        calibrationQuadrant: "calibrated",
        nextState: { easiness: 2.6, interval: 6, repetitions: 1 },
      });

      useSessionStore.getState().nextItem();

      const state = useSessionStore.getState();
      expect(state.selectedAnswer).toBeNull();
      expect(state.confidenceRating).toBeNull();
      expect(state.reviewResult).toBeNull();
      expect(state.attemptNumber).toBe(1);
      expect(state.hintText).toBeNull();
    });

    it("transitions to summary phase on last item and clears localStorage", () => {
      const session = makeSession(2);
      useSessionStore.getState().setSession(session);

      useSessionStore.getState().nextItem(); // index 1
      useSessionStore.getState().nextItem(); // index 2 → complete

      const state = useSessionStore.getState();
      expect(state.phase).toBe("summary");
      expect(localStorage.getItem("skillclimb_sessionId")).toBeNull();
      expect(localStorage.getItem("skillclimb_itemIndex")).toBeNull();
      expect(localStorage.getItem("skillclimb_reviewHistory")).toBeNull();
    });
  });

  describe("resumeSession", () => {
    it("restores review history and momentum from localStorage", () => {
      const history = [
        makeReviewRecord("node-0", true),
        makeReviewRecord("node-1", false),
      ];
      localStorage.setItem("skillclimb_reviewHistory", JSON.stringify(history));

      const session = makeSession(5);
      useSessionStore.getState().resumeSession(session, 2);

      const state = useSessionStore.getState();
      expect(state.currentItemIndex).toBe(2);
      expect(state.reviewHistory).toHaveLength(2);
      expect(state.momentum.recentCorrect).toBe(1);
      expect(state.momentum.recentTotal).toBe(2);
      expect(state.phase).toBe("answering");
    });

    it("goes to summary if itemIndex >= items.length", () => {
      const session = makeSession(3);
      useSessionStore.getState().resumeSession(session, 3);

      expect(useSessionStore.getState().phase).toBe("summary");
    });
  });

  describe("reset", () => {
    it("clears both store and localStorage", () => {
      const session = makeSession();
      useSessionStore.getState().setSession(session);
      useSessionStore.getState().recordReview(makeReviewRecord("node-0", true));
      useSessionStore.getState().reset();

      const state = useSessionStore.getState();
      expect(state.session).toBeNull();
      expect(state.savedSessionId).toBeNull();
      expect(state.reviewHistory).toEqual([]);
      expect(state.momentum.recentTotal).toBe(0);

      expect(localStorage.getItem("skillclimb_sessionId")).toBeNull();
      expect(localStorage.getItem("skillclimb_itemIndex")).toBeNull();
      expect(localStorage.getItem("skillclimb_reviewHistory")).toBeNull();
    });
  });

  describe("logout", () => {
    it("clears everything including selectedSkillTreeId", () => {
      useSessionStore.getState().setUserId("user-1");
      useSessionStore.getState().setSelectedSkillTreeId("cybersecurity");
      const session = makeSession();
      useSessionStore.getState().setSession(session);
      useSessionStore.getState().logout();

      const state = useSessionStore.getState();
      expect(state.userId).toBeNull();
      expect(state.selectedSkillTreeId).toBeNull();
      expect(state.session).toBeNull();

      expect(localStorage.getItem("skillclimb_selectedSkillTreeId")).toBeNull();
      expect(localStorage.getItem("skillclimb_sessionId")).toBeNull();
    });
  });
});
