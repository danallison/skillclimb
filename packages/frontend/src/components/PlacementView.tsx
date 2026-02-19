import { useEffect, useState } from "react";
import { usePlacementStore } from "../store/placementStore.js";
import { useSubmitPlacementAnswer } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";
import PlacementResults from "./PlacementResults.js";

interface Props {
  onComplete: () => void;
  onSkip: () => void;
}

export default function PlacementView({ onComplete, onSkip }: Props) {
  const {
    placementId,
    currentQuestion,
    questionsAnswered,
    estimatedTotal,
    selectedAnswer,
    lastResult,
    phase,
    finalResult,
    selectAnswer,
    handleAnswer,
    advanceToNext,
  } = usePlacementStore();

  const submitAnswer = useSubmitPlacementAnswer();
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-advance after brief feedback
  useEffect(() => {
    if (phase === "feedback") {
      const timer = setTimeout(() => advanceToNext(), 1200);
      return () => clearTimeout(timer);
    }
  }, [phase, advanceToNext]);

  if (phase === "results" && finalResult) {
    return <PlacementResults result={finalResult} onContinue={onComplete} />;
  }

  if (!currentQuestion || !placementId) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>
        Loading placement test...
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    (questionsAnswered / estimatedTotal) * 100,
  );

  const handleSelect = async (answer: string | null) => {
    selectAnswer(answer);
    setSubmitError(null);

    try {
      const result = await submitAnswer.mutateAsync({
        placementId,
        nodeId: currentQuestion.nodeId,
        selectedAnswer: answer,
        confidence: 3,
      });
      handleAnswer(result);
    } catch (err) {
      console.error("Failed to submit placement answer:", err);
      setSubmitError("Failed to submit answer. Please try again.");
    }
  };

  const template = currentQuestion.questionTemplate;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h1 style={{ margin: 0, fontSize: "1.3rem" }}>Placement Test</h1>
        <button
          onClick={onSkip}
          style={{ ...buttonStyles.secondary, padding: "0.4rem 0.8rem" }}
        >
          Skip
        </button>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
          <span style={{ fontSize: "0.85rem", color: colors.textMuted }}>
            Question {questionsAnswered + 1}
          </span>
          <span style={{ fontSize: "0.85rem", color: colors.textMuted }}>
            ~{estimatedTotal} estimated
          </span>
        </div>
        <div
          style={{
            height: "6px",
            background: colors.divider,
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progressPct}%`,
              height: "100%",
              background: colors.cyan,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Feedback overlay */}
      {phase === "feedback" && lastResult && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: lastResult.correct ? colors.successBg : colors.errorBg,
            border: `2px solid ${lastResult.correct ? colors.green : colors.red}`,
            textAlign: "center",
          }}
        >
          <span style={{ fontWeight: 600, color: lastResult.correct ? colors.green : colors.red }}>
            {lastResult.correct ? "Correct" : "Incorrect"}
          </span>
        </div>
      )}

      {/* Error message */}
      {submitError && (
        <div
          style={{
            padding: "0.75rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: colors.errorBg,
            border: `1px solid ${colors.red}`,
            color: colors.red,
            fontSize: "0.9rem",
          }}
        >
          {submitError}
        </div>
      )}

      {/* Question */}
      {phase === "answering" && (
        <>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginBottom: "0.5rem" }}>
            {currentQuestion.concept}
          </div>

          <div
            style={{
              background: colors.cardBg,
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "1.5rem",
            }}
          >
            <p style={{ fontSize: "1.05rem", lineHeight: 1.5, marginTop: 0 }}>
              {template.prompt}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {template.choices.map((choice) => (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={submitAnswer.isPending}
                  style={{
                    padding: "0.75rem 1rem",
                    background: selectedAnswer === choice ? colors.selectedBg : colors.surfaceBg,
                    border: selectedAnswer === choice
                      ? `2px solid ${colors.cyan}`
                      : `1px solid ${colors.inputBorder}`,
                    borderRadius: "8px",
                    color: colors.textPrimary,
                    fontSize: "0.95rem",
                    textAlign: "left",
                    cursor: submitAnswer.isPending ? "not-allowed" : "pointer",
                    opacity: submitAnswer.isPending ? 0.6 : 1,
                  }}
                >
                  {choice}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleSelect(null)}
              disabled={submitAnswer.isPending}
              style={{
                ...buttonStyles.secondary,
                marginTop: "1rem",
                width: "100%",
                opacity: submitAnswer.isPending ? 0.6 : 1,
              }}
            >
              I don't know
            </button>
          </div>
        </>
      )}
    </div>
  );
}
