import { useState } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import type { SessionItemResponse } from "../api/hooks.js";
import { getQuestionTypeLabel } from "@skillclimb/core";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  item: SessionItemResponse;
}

export default function QuestionCard({ item }: Props) {
  const { selectedAnswer, phase, selectAnswer, setConfidenceRating, setPhase } = useSessionStore();
  const { questionTemplate, node } = item;
  const answered = selectedAnswer !== null;
  const [text, setText] = useState("");

  const handleTextSubmit = () => {
    if (answered) return;
    selectAnswer(text);
    if (text.trim() === "") {
      setConfidenceRating(1);
      setPhase("feedback");
    } else {
      setPhase("confidence");
    }
  };

  const handleChoiceSelect = (choice: string) => {
    if (answered) return;
    selectAnswer(choice);
    setPhase("confidence");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "Enter") {
      handleTextSubmit();
    }
  };

  const type = questionTemplate.type;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: colors.textMuted }}>
          {node.concept}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: colors.cyan,
            background: colors.cardBg,
            border: `1px solid ${colors.inputBorder}`,
            borderRadius: "4px",
            padding: "0.1rem 0.4rem",
          }}
        >
          {getQuestionTypeLabel(type)}
        </div>
      </div>
      <h2 style={{ marginBottom: "1.5rem", color: colors.textPrimary }}>
        {questionTemplate.prompt}
      </h2>

      {/* Recognition: multiple choice buttons */}
      {type === "recognition" && !answered && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {questionTemplate.choices?.map((choice) => (
            <button
              key={choice}
              onClick={() => handleChoiceSelect(choice)}
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
          <button
            onClick={() => { selectAnswer("__idk__"); setConfidenceRating(1); setPhase("feedback"); }}
            style={{
              padding: "0.5rem 1rem",
              background: "transparent",
              border: `1px solid ${colors.inputBorder}`,
              color: colors.textMuted,
              borderRadius: "8px",
              fontSize: "0.85rem",
              textAlign: "center",
              cursor: "pointer",
              marginTop: "0.25rem",
            }}
          >
            I don't know
          </button>
        </div>
      )}

      {/* Recognition: show selected answer */}
      {type === "recognition" && answered && phase === "confidence" && (
        <div
          style={{
            padding: "1rem",
            background: colors.selectedBg,
            border: `2px solid ${colors.cyan}`,
            color: colors.textPrimary,
            fontSize: "0.95rem",
            borderRadius: "8px",
          }}
        >
          {selectedAnswer}
        </div>
      )}

      {/* Cued recall: single-line text input */}
      {type === "cued_recall" && !answered && (
        <>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleTextSubmit(); }}
            placeholder="Type your answer..."
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
            onClick={handleTextSubmit}
            style={{
              ...buttonStyles.primary,
              marginTop: "1rem",
            }}
          >
            Submit
          </button>
        </>
      )}

      {/* Cued recall: show submitted answer */}
      {type === "cued_recall" && answered && phase === "confidence" && (
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

      {/* Free recall: textarea */}
      {(type === "free_recall" || type === "application" || type === "practical") && !answered && (
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
            onClick={handleTextSubmit}
            style={{
              ...buttonStyles.primary,
              marginTop: "1rem",
            }}
          >
            Submit
          </button>
        </>
      )}

      {/* Free recall: show submitted answer */}
      {(type === "free_recall" || type === "application" || type === "practical") && answered && phase === "confidence" && (
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
    </div>
  );
}
