import { useEffect, useRef } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import { useSubmitReview } from "../api/hooks.js";
import { scoreFromSelfRating } from "@skillclimb/core";
import type { SelfRating } from "@skillclimb/core";
import { colors, buttonStyles } from "../styles/theme.js";

export default function FeedbackDisplay() {
  const {
    userId,
    session,
    currentItemIndex,
    selectedAnswer,
    confidenceRating,
    reviewResult,
    setSelfRating,
    setReviewResult,
    recordReview,
    nextItem,
  } = useSessionStore();

  const submitReview = useSubmitReview();
  const autoSubmitted = useRef(false);

  const ready = !!(session && userId && selectedAnswer !== null && confidenceRating !== null);
  const isEmptyAnswer = selectedAnswer !== null && selectedAnswer.trim() === "";

  useEffect(() => {
    if (!ready || !isEmptyAnswer || reviewResult || autoSubmitted.current) return;
    autoSubmitted.current = true;

    const item = session!.items[currentItemIndex];
    setSelfRating("incorrect");

    submitReview.mutateAsync({
      userId: userId!,
      nodeId: item.node.id,
      score: 0,
      confidence: confidenceRating!,
      response: selectedAnswer!,
    }).then((result) => {
      setReviewResult(result);
      recordReview({
        nodeId: item.node.id,
        score: 0,
        confidence: confidenceRating!,
        wasCorrect: result.wasCorrect,
        calibrationQuadrant: result.calibrationQuadrant,
      });
    }).catch((err) => {
      console.error("Failed to submit review:", err);
    });
  }, [ready, isEmptyAnswer, reviewResult]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready) return null;

  const item = session!.items[currentItemIndex];
  const { questionTemplate } = item;

  const handleSelfRate = (rating: SelfRating) => {
    setSelfRating(rating);
    const score = scoreFromSelfRating(rating);

    submitReview.mutateAsync({
      userId: userId!,
      nodeId: item.node.id,
      score,
      confidence: confidenceRating!,
      response: selectedAnswer!,
    }).then((result) => {
      recordReview({
        nodeId: item.node.id,
        score,
        confidence: confidenceRating!,
        wasCorrect: result.wasCorrect,
        calibrationQuadrant: result.calibrationQuadrant,
      });
      nextItem();
    }).catch((err) => {
      console.error("Failed to submit review:", err);
    });
  };

  const ratingButtons: { label: string; value: SelfRating; color: string }[] = [
    { label: "Correct", value: "correct", color: colors.green },
    { label: "Partially Correct", value: "partially_correct", color: colors.amber },
    { label: "Incorrect", value: "incorrect", color: colors.red },
  ];

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: colors.cardBg,
          border: `2px solid ${colors.inputBorder}`,
        }}
      >
        <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
          Your answer
        </div>
        <div style={{ color: isEmptyAnswer ? colors.textMuted : colors.textPrimary, whiteSpace: "pre-wrap" }}>
          {isEmptyAnswer ? "(no answer)" : selectedAnswer}
        </div>
      </div>

      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          marginBottom: "1rem",
          background: colors.successBg,
          border: `2px solid ${colors.green}`,
        }}
      >
        <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
          Correct answer
        </div>
        <div style={{ color: colors.successText }}>{questionTemplate.correctAnswer}</div>
      </div>

      <div
        style={{
          padding: "1rem",
          borderRadius: "8px",
          background: colors.cardBg,
          marginBottom: "1.5rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
          Explanation
        </div>
        <div>{questionTemplate.explanation}</div>
      </div>

      {!isEmptyAnswer && !reviewResult && (
        <>
          <h3 style={{ marginBottom: "0.75rem", color: "#b0b0b0" }}>
            How did you do?
          </h3>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            {ratingButtons.map(({ label, value, color }) => (
              <button
                key={value}
                onClick={() => handleSelfRate(value)}
                disabled={submitReview.isPending}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: colors.cardBg,
                  border: `2px solid ${color}`,
                  color,
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {isEmptyAnswer && reviewResult && (
        <button
          onClick={nextItem}
          style={buttonStyles.primary}
        >
          Continue
        </button>
      )}
    </div>
  );
}
