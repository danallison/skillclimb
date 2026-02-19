import { useSessionStore } from "../store/sessionStore.js";
import { colors, buttonStyles } from "../styles/theme.js";

export default function FeedbackDisplay() {
  const {
    session,
    currentItemIndex,
    selectedAnswer,
    didSelectDontKnow,
    reviewResult,
    nextItem,
  } = useSessionStore();

  if (!session || !reviewResult) return null;
  if (!selectedAnswer && !didSelectDontKnow) return null;

  const item = session.items[currentItemIndex];
  const { questionTemplate } = item;
  const isCorrect = reviewResult.wasCorrect;

  const quadrantLabels: Record<string, string> = {
    calibrated: "Well calibrated — you knew it and you knew you knew it.",
    illusion: "Careful — you felt confident but got it wrong.",
    undervalued: "You knew more than you thought!",
    known_unknown: "Honest self-assessment — keep studying this one.",
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: isCorrect ? colors.successBg : didSelectDontKnow ? colors.neutralBg : colors.errorBg,
          border: isCorrect
            ? `2px solid ${colors.green}`
            : didSelectDontKnow
              ? "2px solid #5c5c8a"
              : `2px solid ${colors.red}`,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.5rem" }}>
          {isCorrect ? "Correct!" : didSelectDontKnow ? "Here's the answer" : "Incorrect"}
        </div>
        {!isCorrect && !didSelectDontKnow && selectedAnswer && (
          <div style={{ marginBottom: "0.5rem", color: colors.errorText }}>
            Your answer: {selectedAnswer}
          </div>
        )}
        <div style={{ color: colors.successText }}>
          {didSelectDontKnow ? "" : "Correct answer: "}
          {questionTemplate.correctAnswer}
        </div>
      </div>

      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          background: colors.cardBg,
          marginBottom: "1rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
          Explanation
        </div>
        <div>{questionTemplate.explanation}</div>
      </div>

      <div
        style={{
          padding: "0.75rem",
          borderRadius: "6px",
          background: "#1a1f2e",
          marginBottom: "1.5rem",
          fontSize: "0.9rem",
          color: "#aaa",
        }}
      >
        {quadrantLabels[reviewResult.calibrationQuadrant] ?? ""}
      </div>

      <button
        onClick={nextItem}
        style={buttonStyles.primary}
      >
        Continue
      </button>
    </div>
  );
}
