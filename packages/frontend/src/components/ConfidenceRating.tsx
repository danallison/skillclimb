import { useEffect } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import { useSubmitReview } from "../api/hooks.js";
import { evaluateRecognition } from "@skillclimb/core";
import { colors } from "../styles/theme.js";

export default function ConfidenceRating() {
  const {
    userId,
    session,
    currentItemIndex,
    selectedAnswer,
    didSelectDontKnow,
    setConfidenceRating,
    setReviewResult,
    recordReview,
    setPhase,
  } = useSessionStore();

  const submitReview = useSubmitReview();

  const item = session?.items[currentItemIndex];

  // Auto-submit with confidence 1 when "I don't know" was selected
  useEffect(() => {
    if (didSelectDontKnow && item && userId && !submitReview.isPending) {
      handleSubmit(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didSelectDontKnow]);

  if (!session || !userId || !item) return null;
  if (!selectedAnswer && !didSelectDontKnow) return null;

  const { questionTemplate, node } = item;

  const handleSubmit = async (confidence: number) => {
    setConfidenceRating(confidence);

    const score = evaluateRecognition(selectedAnswer, questionTemplate.correctAnswer);

    try {
      const result = await submitReview.mutateAsync({
        userId,
        nodeId: node.id,
        score,
        confidence,
        response: selectedAnswer ?? "",
      });

      setReviewResult(result);
      recordReview({
        nodeId: node.id,
        score,
        confidence,
        wasCorrect: result.wasCorrect,
        calibrationQuadrant: result.calibrationQuadrant,
      });
      setPhase("feedback");
    } catch (err) {
      console.error("Failed to submit review:", err);
    }
  };

  // Don't render the rating UI for "I don't know" — it auto-submits above
  if (didSelectDontKnow) return null;

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
            onClick={() => handleSubmit(rating)}
            disabled={submitReview.isPending}
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
