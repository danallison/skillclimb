import { useState } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import type { SessionItemResponse } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  item: SessionItemResponse;
}

export default function HintDisplay({ item }: Props) {
  const { hintText, nextItem } = useSessionStore();
  const [text, setText] = useState("");
  const { questionTemplate, node } = item;
  const type = questionTemplate.type;

  const submitSecondAttempt = (answer: string) => {
    const store = useSessionStore.getState();
    store.resetForSecondAttempt();
    // After resetting, set answer and move to confidence
    setTimeout(() => {
      const s = useSessionStore.getState();
      s.selectAnswer(answer);
      s.setPhase("second_confidence");
    }, 0);
  };

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* Hint box */}
      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          background: colors.warningBg,
          border: `2px solid ${colors.amber}`,
        }}
      >
        <div style={{ fontSize: "0.85rem", color: colors.amber, marginBottom: "0.25rem", fontWeight: 600 }}>
          Hint
        </div>
        <div style={{ color: colors.textPrimary }}>{hintText}</div>
      </div>

      {/* Repeat the question */}
      <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.5rem" }}>
        {node.concept}
      </div>
      <h2 style={{ marginBottom: "1.5rem", color: colors.textPrimary }}>
        {questionTemplate.prompt}
      </h2>

      {/* Recognition: show choices again */}
      {type === "recognition" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {questionTemplate.choices?.map((choice) => (
            <button
              key={choice}
              onClick={() => submitSecondAttempt(choice)}
              style={{
                padding: "0.75rem 1rem",
                background: colors.cardBg,
                border: `2px solid ${colors.inputBorder}`,
                color: colors.textPrimary,
                borderRadius: "8px",
                fontSize: "0.95rem",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {choice}
            </button>
          ))}
        </div>
      )}

      {/* Cued recall: text input */}
      {type === "cued_recall" && (
        <>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && text.trim()) submitSecondAttempt(text);
            }}
            placeholder="Try again..."
            style={{
              width: "100%",
              padding: "1rem",
              background: colors.cardBg,
              border: `2px solid ${colors.inputBorder}`,
              color: colors.textPrimary,
              fontSize: "0.95rem",
              borderRadius: "8px",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <button
            onClick={() => { if (text.trim()) submitSecondAttempt(text); }}
            disabled={!text.trim()}
            style={{
              ...buttonStyles.primary,
              marginTop: "1rem",
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            Submit
          </button>
        </>
      )}

      {/* Free recall: textarea */}
      {(type === "free_recall" || type === "application" || type === "practical") && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Try again..."
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
            onClick={() => { if (text.trim()) submitSecondAttempt(text); }}
            disabled={!text.trim()}
            style={{
              ...buttonStyles.primary,
              marginTop: "1rem",
              opacity: text.trim() ? 1 : 0.5,
            }}
          >
            Submit
          </button>
        </>
      )}

      {/* Skip button */}
      <button
        onClick={nextItem}
        style={{
          ...buttonStyles.secondary,
          width: "100%",
          marginTop: "0.75rem",
          textAlign: "center",
        }}
      >
        Skip — Continue to Next
      </button>
    </div>
  );
}
