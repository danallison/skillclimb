import { useState } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import type { SessionItemResponse } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  item: SessionItemResponse;
}

export default function QuestionCard({ item }: Props) {
  const { selectedAnswer, phase, selectAnswer, setConfidenceRating, setPhase } = useSessionStore();
  const { questionTemplate, node } = item;
  const answered = selectedAnswer !== null;
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (answered) return;
    selectAnswer(text);
    if (text.trim() === "") {
      setConfidenceRating(1);
      setPhase("feedback");
    } else {
      setPhase("confidence");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.5rem" }}>
        {node.concept}
      </div>
      <h2 style={{ marginBottom: "1.5rem", color: colors.textPrimary }}>
        {questionTemplate.prompt}
      </h2>
      {answered && phase === "confidence" && (
        <div
          style={{
            padding: "1rem",
            background: colors.cardBg,
            border: `2px solid ${colors.inputBorder}`,
            color: colors.textPrimary,
            fontSize: "0.95rem",
            borderRadius: "8px",
            whiteSpace: "pre-wrap",
          }}
        >
          {selectedAnswer}
        </div>
      )}
      {!answered && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            rows={3}
            style={{
              width: "100%",
              padding: "1rem",
              background: colors.cardBg,
              border: `2px solid ${colors.inputBorder}`,
              color: colors.textPrimary,
              fontSize: "0.95rem",
              borderRadius: "8px",
              resize: "vertical",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={handleSubmit}
            style={{
              ...buttonStyles.primary,
              marginTop: "1rem",
            }}
          >
            Submit
          </button>
        </>
      )}
    </div>
  );
}
