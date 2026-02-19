import { useSessionStore } from "../store/sessionStore.js";
import { colors } from "../styles/theme.js";

export default function ConfidenceRating() {
  const { selectedAnswer, attemptNumber, setConfidenceRating, setPhase } = useSessionStore();

  if (selectedAnswer === null) return null;

  const handleSelect = (rating: number) => {
    setConfidenceRating(rating);
    setPhase(attemptNumber === 2 ? "second_feedback" : "feedback");
  };

  const labels = ["Very unsure", "Unsure", "Somewhat sure", "Sure", "Very sure"];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <h2 style={{ marginBottom: "1rem", color: "#b0b0b0" }}>
        How confident are you in your answer?
      </h2>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleSelect(rating)}
            style={{
              flex: 1,
              padding: "0.75rem 0.5rem",
              background: colors.cardBg,
              border: `2px solid ${colors.inputBorder}`,
              color: colors.textPrimary,
              borderRadius: "8px",
              fontSize: "0.85rem",
            }}
          >
            <div style={{ fontSize: "1.2rem", marginBottom: "0.25rem" }}>{rating}</div>
            <div style={{ fontSize: "0.7rem", color: colors.textMuted }}>{labels[rating - 1]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
