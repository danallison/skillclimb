import type { AIFeedbackResponse } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  feedback: AIFeedbackResponse;
  onAccept: (score: number) => void;
  onSelfRate: () => void;
}

export default function AIFeedbackDisplay({ feedback, onAccept, onSelfRate }: Props) {
  const scoreColor =
    feedback.score >= 4 ? colors.green :
    feedback.score >= 2 ? colors.amber :
    colors.red;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* AI Score */}
      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: colors.cardBg,
          border: `2px solid ${scoreColor}`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
          <div style={{ fontSize: "0.85rem", color: colors.textMuted }}>AI Evaluation</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", color: scoreColor }}>
            {feedback.score} / 5
          </div>
        </div>
        <div style={{ color: colors.textPrimary, lineHeight: 1.5 }}>{feedback.feedback}</div>
      </div>

      {/* Key points covered */}
      {feedback.keyPointsCovered.length > 0 && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "0.75rem",
            background: colors.successBg,
          }}
        >
          <div style={{ fontSize: "0.85rem", color: colors.successText, marginBottom: "0.5rem", fontWeight: 600 }}>
            Key Points Covered
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: colors.textPrimary }}>
            {feedback.keyPointsCovered.map((point, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key points missed */}
      {feedback.keyPointsMissed.length > 0 && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "0.75rem",
            background: colors.errorBg,
          }}
        >
          <div style={{ fontSize: "0.85rem", color: colors.errorText, marginBottom: "0.5rem", fontWeight: 600 }}>
            Key Points Missed
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: colors.textPrimary }}>
            {feedback.keyPointsMissed.map((point, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Misconceptions */}
      {feedback.misconceptions.length > 0 && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: colors.warningBg,
            border: `1px solid ${colors.amber}`,
          }}
        >
          <div style={{ fontSize: "0.85rem", color: colors.amber, marginBottom: "0.5rem", fontWeight: 600 }}>
            Misconceptions
          </div>
          <ul style={{ margin: 0, paddingLeft: "1.25rem", color: colors.textPrimary }}>
            {feedback.misconceptions.map((item, i) => (
              <li key={i} style={{ marginBottom: "0.25rem" }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
        <button
          onClick={() => onAccept(feedback.score)}
          style={{
            ...buttonStyles.primary,
            flex: 2,
          }}
        >
          Accept ({feedback.score}/5)
        </button>
        <button
          onClick={onSelfRate}
          style={{
            ...buttonStyles.secondary,
            flex: 1,
            textAlign: "center",
          }}
        >
          I'll self-rate
        </button>
      </div>
    </div>
  );
}
