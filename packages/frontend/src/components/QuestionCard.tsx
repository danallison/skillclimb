import { useSessionStore } from "../store/sessionStore.js";
import type { SessionItemResponse } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  item: SessionItemResponse;
}

export default function QuestionCard({ item }: Props) {
  const { selectedAnswer, didSelectDontKnow, selectAnswer, selectDontKnow, setPhase } =
    useSessionStore();
  const { questionTemplate, node } = item;
  const answered = selectedAnswer !== null || didSelectDontKnow;

  const handleSelect = (choice: string) => {
    if (answered) return;
    selectAnswer(choice);
    setPhase("confidence");
  };

  const handleDontKnow = () => {
    if (answered) return;
    selectDontKnow();
    // Skip confidence — go straight to submitting (ConfidenceRating handles this)
    setPhase("confidence");
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.5rem" }}>
        {node.concept}
      </div>
      <h2 style={{ marginBottom: "1.5rem", color: colors.textPrimary }}>
        {questionTemplate.prompt}
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {questionTemplate.choices.map((choice) => {
          const isSelected = selectedAnswer === choice;
          return (
            <button
              key={choice}
              onClick={() => handleSelect(choice)}
              style={{
                padding: "1rem",
                background: isSelected ? colors.selectedBg : colors.cardBg,
                border: isSelected ? `2px solid ${colors.cyan}` : `2px solid ${colors.inputBorder}`,
                color: colors.textPrimary,
                textAlign: "left",
                fontSize: "0.95rem",
                borderRadius: "8px",
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {!answered && (
        <button
          onClick={handleDontKnow}
          style={{
            ...buttonStyles.secondary,
            marginTop: "1rem",
            width: "100%",
          }}
        >
          I don't know
        </button>
      )}
    </div>
  );
}
