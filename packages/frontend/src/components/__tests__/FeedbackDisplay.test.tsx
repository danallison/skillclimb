import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import FeedbackDisplay from "../FeedbackDisplay.js";
import { useSessionStore } from "../../store/sessionStore.js";

// Mock the API hooks — FeedbackDisplay calls useSubmitReview, useEvaluateAnswer, useRequestHint
vi.mock("../../api/hooks.js", () => ({
  useSubmitReview: () => ({ mutateAsync: vi.fn().mockResolvedValue({}), isPending: false }),
  useEvaluateAnswer: () => ({ mutateAsync: vi.fn().mockResolvedValue(null) }),
  useRequestHint: () => ({ mutateAsync: vi.fn().mockResolvedValue({ hint: "A hint" }) }),
}));

// Mock AIFeedbackDisplay since it's a child component we don't need to test here
vi.mock("../AIFeedbackDisplay.js", () => ({
  default: () => <div data-testid="ai-feedback-display" />,
}));

function makeItem(type: "recognition" | "cued_recall" | "free_recall" = "recognition") {
  return {
    node: {
      id: "node-1",
      topicId: "topic-1",
      domainId: "domain-1",
      concept: "Test Concept",
      questionTemplates: [],
    },
    learnerState: { easiness: 2.5, interval: 1, repetitions: 0 },
    questionTemplate: {
      type,
      prompt: "What is the answer?",
      correctAnswer: "The correct answer",
      explanation: "This is the explanation.",
      choices: type === "recognition" ? ["A", "B", "C", "The correct answer"] : undefined,
      hints: ["Here is a hint"],
    },
    priority: 1,
  };
}

function makeSession(item = makeItem()) {
  return {
    id: "session-1",
    userId: "user-1",
    startedAt: new Date().toISOString(),
    totalItems: 1,
    items: [item],
  };
}

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState(useSessionStore.getInitialState());
});

describe("FeedbackDisplay", () => {
  describe("duplicate Continue button regression", () => {
    it("shows exactly one Continue button for auto-scored IDK answer with review result", () => {
      const item = makeItem("recognition");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "__idk__",
        confidenceRating: 2,
        reviewResult: {
          wasCorrect: false,
          calibrationQuadrant: "overconfident",
          nextState: { easiness: 2.3, interval: 1, repetitions: 0 },
        },
        phase: "second_feedback",
        attemptNumber: 2,
      });

      render(<FeedbackDisplay />);

      const continueButtons = screen.getAllByRole("button", { name: /continue/i });
      expect(continueButtons).toHaveLength(1);
    });

    it("shows exactly one Continue button for auto-scored correct recognition answer", () => {
      const item = makeItem("recognition");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "The correct answer",
        confidenceRating: 4,
        reviewResult: {
          wasCorrect: true,
          calibrationQuadrant: "calibrated",
          nextState: { easiness: 2.6, interval: 6, repetitions: 1 },
        },
        phase: "feedback",
        attemptNumber: 1,
      });

      render(<FeedbackDisplay />);

      const continueButtons = screen.getAllByRole("button", { name: /continue/i });
      expect(continueButtons).toHaveLength(1);
    });

    it("shows exactly one Continue button for auto-scored incorrect recognition (answer revealed)", () => {
      const item = makeItem("recognition");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "Wrong answer",
        confidenceRating: 3,
        reviewResult: {
          wasCorrect: false,
          calibrationQuadrant: "overconfident",
          nextState: { easiness: 2.3, interval: 1, repetitions: 0 },
        },
        phase: "feedback",
        attemptNumber: 2, // second attempt — no holdingForHint
      });

      render(<FeedbackDisplay />);

      const continueButtons = screen.getAllByRole("button", { name: /continue/i });
      expect(continueButtons).toHaveLength(1);
    });
  });

  describe("free recall self-rating", () => {
    it("shows self-rating buttons for free recall when AI returns null", async () => {
      const item = makeItem("free_recall");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "My free recall answer",
        confidenceRating: 3,
        reviewResult: null,
        phase: "feedback",
        attemptNumber: 2, // bypass hint holding
      });

      render(<FeedbackDisplay />);

      // Wait for the AI evaluation mock (resolves null) to trigger self-rating fallback
      await waitFor(() => {
        expect(screen.getByText("Correct")).toBeInTheDocument();
      });
      expect(screen.getByText("Partially Correct")).toBeInTheDocument();
      expect(screen.getByText("Incorrect")).toBeInTheDocument();
    });
  });

  describe("answer display", () => {
    it("shows '(I don\\'t know)' for IDK answers", () => {
      const item = makeItem("recognition");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "__idk__",
        confidenceRating: 1,
        reviewResult: {
          wasCorrect: false,
          calibrationQuadrant: "calibrated",
          nextState: { easiness: 2.3, interval: 1, repetitions: 0 },
        },
        phase: "feedback",
        attemptNumber: 1,
      });

      render(<FeedbackDisplay />);
      expect(screen.getByText("(I don't know)")).toBeInTheDocument();
    });

    it("shows '(no answer)' for empty answers", () => {
      const item = makeItem("recognition");
      useSessionStore.setState({
        session: makeSession(item),
        currentItemIndex: 0,
        selectedAnswer: "",
        confidenceRating: 1,
        reviewResult: {
          wasCorrect: false,
          calibrationQuadrant: "calibrated",
          nextState: { easiness: 2.3, interval: 1, repetitions: 0 },
        },
        phase: "feedback",
        attemptNumber: 1,
      });

      render(<FeedbackDisplay />);
      expect(screen.getByText("(no answer)")).toBeInTheDocument();
    });
  });

  describe("not ready", () => {
    it("returns null when session is not set", () => {
      const { container } = render(<FeedbackDisplay />);
      expect(container.firstChild).toBeNull();
    });

    it("returns null when selectedAnswer is null", () => {
      useSessionStore.setState({
        session: makeSession(),
        currentItemIndex: 0,
        selectedAnswer: null,
        confidenceRating: 3,
      });

      const { container } = render(<FeedbackDisplay />);
      expect(container.firstChild).toBeNull();
    });
  });
});
