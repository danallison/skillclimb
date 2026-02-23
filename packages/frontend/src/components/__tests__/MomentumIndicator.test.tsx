import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import MomentumIndicator from "../MomentumIndicator.js";
import { useSessionStore } from "../../store/sessionStore.js";

beforeEach(() => {
  localStorage.clear();
  useSessionStore.setState(useSessionStore.getInitialState());
});

describe("MomentumIndicator", () => {
  it("returns null when recentTotal is 0", () => {
    const { container } = render(<MomentumIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it("shows correct count text", () => {
    useSessionStore.setState({
      momentum: { state: "building", recentCorrect: 3, recentTotal: 5, message: "Strong recall" },
    });

    render(<MomentumIndicator />);
    expect(screen.getByText("3/5 correct")).toBeInTheDocument();
  });

  it("uses different colors for each momentum state", () => {
    const states = [
      { state: "building" as const, message: "Strong recall", recentCorrect: 4 },
      { state: "steady" as const, message: "Steady progress", recentCorrect: 2 },
      { state: "struggling" as const, message: "Keep going", recentCorrect: 1 },
    ];

    const renderedColors: string[] = [];
    for (const s of states) {
      useSessionStore.setState({
        momentum: { state: s.state, recentCorrect: s.recentCorrect, recentTotal: 5, message: s.message },
      });
      const { unmount } = render(<MomentumIndicator />);
      renderedColors.push(screen.getByTitle(s.message).style.color);
      unmount();
    }

    // All three states should produce distinct colors
    expect(new Set(renderedColors).size).toBe(3);
    // None should be empty
    for (const c of renderedColors) {
      expect(c).not.toBe("");
    }
  });

  it("shows tooltip with momentum message", () => {
    useSessionStore.setState({
      momentum: { state: "building", recentCorrect: 4, recentTotal: 5, message: "Strong recall" },
    });

    render(<MomentumIndicator />);
    expect(screen.getByTitle("Strong recall")).toBeInTheDocument();
  });
});
