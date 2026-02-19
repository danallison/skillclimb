import { useSessionStore } from "../store/sessionStore.js";
import type { SessionItemResponse } from "../api/hooks.js";

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
      <div style={{ fontSize: "0.85rem", color: "#888", marginBottom: "0.5rem" }}>
        {node.concept}
      </div>
      <h2 style={{ marginBottom: "1.5rem", color: "#e0e0e0" }}>
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
                background: isSelected ? "#1a3a5c" : "#151c2c",
                border: isSelected ? "2px solid #00d4ff" : "2px solid #2a3040",
                color: "#e0e0e0",
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
            marginTop: "1rem",
            padding: "0.6rem 1rem",
            background: "transparent",
            border: "1px solid #3a3a4a",
            color: "#888",
            fontSize: "0.85rem",
            borderRadius: "6px",
            width: "100%",
          }}
        >
          I don't know
        </button>
      )}
    </div>
  );
}
