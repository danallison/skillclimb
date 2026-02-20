import { useEffect, useRef, useState } from "react";
import { useSessionStore } from "../store/sessionStore.js";
import { useSubmitReview, useEvaluateAnswer, useRequestHint } from "../api/hooks.js";
import type { AIFeedbackResponse } from "../api/hooks.js";
import {
  scoreFromSelfRating,
  evaluateRecognition,
  evaluateCuedRecall,
  capScoreForHintedAttempt,
  classifyScore,
  isAutoScoredType,
  requiresSelfRating,
} from "@skillclimb/core";
import type { SelfRating } from "@skillclimb/core";
import { colors, buttonStyles } from "../styles/theme.js";
import AIFeedbackDisplay from "./AIFeedbackDisplay.js";

export default function FeedbackDisplay() {
  const {
    userId,
    session,
    currentItemIndex,
    selectedAnswer,
    confidenceRating,
    reviewResult,
    phase,
    attemptNumber,
    setSelfRating,
    setReviewResult,
    recordReview,
    nextItem,
    showHint,
  } = useSessionStore();

  const submitReview = useSubmitReview();
  const evaluateAnswer = useEvaluateAnswer();
  const requestHint = useRequestHint();
  const autoSubmitted = useRef(false);
  const [aiFeedback, setAiFeedback] = useState<AIFeedbackResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSelfRate, setShowSelfRate] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const ready = !!(session && userId && selectedAnswer !== null && confidenceRating !== null);
  const isEmptyAnswer = selectedAnswer !== null && selectedAnswer.trim() === "";
  const isIdkAnswer = selectedAnswer === "__idk__";

  const item = session?.items[currentItemIndex];
  const questionType = item?.questionTemplate?.type;
  const isSecondFeedback = phase === "second_feedback";

  // Reset state when item changes
  useEffect(() => {
    setAiFeedback(null);
    setAiLoading(false);
    setShowSelfRate(false);
    setHintLoading(false);
    setAnswerRevealed(false);
    autoSubmitted.current = false;
  }, [currentItemIndex, attemptNumber]);

  // Auto-score for recognition, cued_recall, empty, and idk answers
  useEffect(() => {
    if (!ready || reviewResult || autoSubmitted.current) return;
    if (!item) return;

    // Auto-submit for empty/"I don't know" answers
    if (isEmptyAnswer || isIdkAnswer) {
      autoSubmitted.current = true;
      const score = isIdkAnswer ? 1 : 0;
      setSelfRating("incorrect");

      submitReview.mutateAsync({
        userId: userId!,
        nodeId: item.node.id,
        score,
        confidence: confidenceRating!,
        response: selectedAnswer!,
      }).then((result) => {
        setReviewResult(result);
        recordReview({
          nodeId: item.node.id,
          score,
          confidence: confidenceRating!,
          wasCorrect: result.wasCorrect,
          calibrationQuadrant: result.calibrationQuadrant,
        });
      }).catch((err) => {
        console.error("Failed to submit review:", err);
      });
      return;
    }

    // Auto-score recognition questions
    if (questionType === "recognition") {
      autoSubmitted.current = true;
      const rawScore = evaluateRecognition(selectedAnswer, item.questionTemplate.correctAnswer);
      const score = capScoreForHintedAttempt(rawScore, attemptNumber);
      const rating: SelfRating = classifyScore(score);
      setSelfRating(rating);

      submitReview.mutateAsync({
        userId: userId!,
        nodeId: item.node.id,
        score,
        confidence: confidenceRating!,
        response: selectedAnswer!,
      }).then((result) => {
        setReviewResult(result);
        recordReview({
          nodeId: item.node.id,
          score,
          confidence: confidenceRating!,
          wasCorrect: result.wasCorrect,
          calibrationQuadrant: result.calibrationQuadrant,
        });
      }).catch((err) => {
        console.error("Failed to submit review:", err);
      });
      return;
    }

    // Auto-score cued_recall questions
    if (questionType === "cued_recall") {
      autoSubmitted.current = true;
      const rawScore = evaluateCuedRecall(
        selectedAnswer!,
        item.questionTemplate.correctAnswer,
        item.questionTemplate.acceptableAnswers,
      );
      const score = capScoreForHintedAttempt(rawScore, attemptNumber);
      const rating: SelfRating = classifyScore(score);
      setSelfRating(rating);

      submitReview.mutateAsync({
        userId: userId!,
        nodeId: item.node.id,
        score,
        confidence: confidenceRating!,
        response: selectedAnswer!,
      }).then((result) => {
        setReviewResult(result);
        recordReview({
          nodeId: item.node.id,
          score,
          confidence: confidenceRating!,
          wasCorrect: result.wasCorrect,
          calibrationQuadrant: result.calibrationQuadrant,
        });
      }).catch((err) => {
        console.error("Failed to submit review:", err);
      });
      return;
    }

    // For free_recall: try AI evaluation
    if (questionType === "free_recall" && !showSelfRate) {
      setAiLoading(true);
      evaluateAnswer.mutateAsync({
        nodeId: item.node.id,
        response: selectedAnswer!,
        userId: userId!,
      }).then((result) => {
        setAiLoading(false);
        if (result) {
          setAiFeedback(result);
        } else {
          // AI unavailable, fall back to self-rating
          setShowSelfRate(true);
        }
      }).catch(() => {
        setAiLoading(false);
        setShowSelfRate(true);
      });
    }
  }, [ready, reviewResult]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ready || !item) return null;

  const { questionTemplate } = item;
  const wasAutoScored = isAutoScoredType(questionType!);
  const autoScoreCorrect = reviewResult?.wasCorrect ?? false;

  const handleSelfRate = (rating: SelfRating) => {
    setSelfRating(rating);
    const score = capScoreForHintedAttempt(scoreFromSelfRating(rating), attemptNumber);

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

  const handleAcceptAIScore = (rawScore: number) => {
    const score = capScoreForHintedAttempt(rawScore, attemptNumber);
    const rating: SelfRating = classifyScore(score);
    setSelfRating(rating);

    submitReview.mutateAsync({
      userId: userId!,
      nodeId: item.node.id,
      score,
      confidence: confidenceRating!,
      response: selectedAnswer!,
      misconceptions: aiFeedback?.misconceptions,
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

  // Hint availability: first wrong attempt only
  const hints = questionTemplate.hints;
  const hasStaticHints = hints && hints.length > 0;
  const canOfferHint = attemptNumber === 1 && !isSecondFeedback;

  // Should we hide the answer to offer a hint first?
  // For auto-scored: wrong answer on attempt 1
  // For free_recall: before self-rating on attempt 1
  const holdingForHint = canOfferHint && !answerRevealed && !autoScoreCorrect;

  const handleTryAgainWithHint = () => {
    // Fast path: use static hints from the template
    if (hasStaticHints) {
      showHint(hints![0]);
      return;
    }
    // Slow path: fetch hint from backend (AI or generic fallback)
    setHintLoading(true);
    requestHint.mutateAsync({ nodeId: item.node.id, questionType }).then((result) => {
      setHintLoading(false);
      showHint(result.hint);
    }).catch(() => {
      setHintLoading(false);
      // Last resort: generic hint from explanation
      showHint(`Think about: ${questionTemplate.explanation.split(".")[0]}.`);
    });
  };

  const handleRevealAnswer = () => {
    setAnswerRevealed(true);
  };

  const ratingButtons: { label: string; value: SelfRating; color: string }[] = [
    { label: "Correct", value: "correct", color: colors.green },
    { label: "Partially Correct", value: "partially_correct", color: colors.amber },
    { label: "Incorrect", value: "incorrect", color: colors.red },
  ];

  const needsSelfRate = requiresSelfRating(questionType!);

  return (
    <div style={{ marginTop: "1.5rem" }}>
      {/* Your answer */}
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
        <div style={{ color: (isEmptyAnswer || isIdkAnswer) ? colors.textMuted : colors.textPrimary, whiteSpace: "pre-wrap" }}>
          {isEmptyAnswer ? "(no answer)" : isIdkAnswer ? "(I don't know)" : selectedAnswer}
        </div>
      </div>

      {/* Auto-scored: "Incorrect" label without revealing the answer (when hint is available) */}
      {wasAutoScored && reviewResult && !autoScoreCorrect && holdingForHint && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: colors.errorBg,
            border: `2px solid ${colors.red}`,
          }}
        >
          <div style={{
            fontWeight: 600,
            color: colors.errorText,
          }}>
            Incorrect
          </div>
        </div>
      )}

      {/* Hint choice buttons (shown BEFORE revealing the answer) */}
      {wasAutoScored && reviewResult && !autoScoreCorrect && holdingForHint && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
          <button
            onClick={handleTryAgainWithHint}
            disabled={hintLoading}
            style={{
              ...buttonStyles.primary,
              flex: 1,
              background: colors.amber,
              color: "#1a1a2e",
              opacity: hintLoading ? 0.7 : 1,
            }}
          >
            {hintLoading ? "Loading hint..." : "Try Again with Hint"}
          </button>
          <button
            onClick={handleRevealAnswer}
            disabled={hintLoading}
            style={{
              ...buttonStyles.secondary,
              flex: 1,
            }}
          >
            Show Answer
          </button>
        </div>
      )}

      {/* Auto-scored result with correct answer (shown after reveal or when correct) */}
      {wasAutoScored && reviewResult && !holdingForHint && (
        <div
          style={{
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1rem",
            background: autoScoreCorrect ? colors.successBg : colors.errorBg,
            border: `2px solid ${autoScoreCorrect ? colors.green : colors.red}`,
          }}
        >
          <div style={{
            fontWeight: 600,
            color: autoScoreCorrect ? colors.successText : colors.errorText,
            marginBottom: "0.5rem",
          }}>
            {autoScoreCorrect ? "Correct!" : "Incorrect"}
          </div>
          <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.25rem" }}>
            Correct answer
          </div>
          <div style={{ color: colors.successText }}>{questionTemplate.correctAnswer}</div>
        </div>
      )}

      {/* Free recall: hint choice (shown BEFORE revealing the answer) */}
      {needsSelfRate && !aiFeedback && !aiLoading && !isEmptyAnswer && !isIdkAnswer && !reviewResult && holdingForHint && (
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <button
            onClick={handleTryAgainWithHint}
            disabled={hintLoading}
            style={{
              ...buttonStyles.primary,
              flex: 1,
              background: colors.amber,
              color: "#1a1a2e",
              opacity: hintLoading ? 0.7 : 1,
            }}
          >
            {hintLoading ? "Loading hint..." : "Try Again with Hint"}
          </button>
          <button
            onClick={handleRevealAnswer}
            disabled={hintLoading}
            style={{
              ...buttonStyles.secondary,
              flex: 1,
            }}
          >
            Show Answer & Rate
          </button>
        </div>
      )}

      {/* Correct answer (for free recall / self-rated — only after reveal) */}
      {needsSelfRate && !aiFeedback && !holdingForHint && (
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
      )}

      {/* Explanation (only after answer is revealed, not for AI feedback) */}
      {!aiFeedback && !holdingForHint && (
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
      )}

      {/* Auto-scored: Continue button (after answer is revealed) */}
      {wasAutoScored && reviewResult && !holdingForHint && (
        <button
          onClick={nextItem}
          style={buttonStyles.primary}
        >
          Continue
        </button>
      )}

      {/* Free recall: AI loading spinner */}
      {needsSelfRate && aiLoading && !isEmptyAnswer && !isIdkAnswer && (
        <div style={{ textAlign: "center", padding: "2rem 0", color: colors.textMuted }}>
          <div style={{ marginBottom: "0.5rem" }}>Evaluating your answer...</div>
          <div style={{ fontSize: "0.8rem" }}>AI tutor is reviewing</div>
        </div>
      )}

      {/* Free recall: AI feedback */}
      {needsSelfRate && aiFeedback && !reviewResult && (
        <AIFeedbackDisplay
          feedback={aiFeedback}
          onAccept={handleAcceptAIScore}
          onSelfRate={() => { setAiFeedback(null); setShowSelfRate(true); }}
        />
      )}

      {/* Free recall: self-rating buttons (after answer revealed) */}
      {needsSelfRate && !holdingForHint && (showSelfRate || (!aiLoading && !aiFeedback)) && !isEmptyAnswer && !isIdkAnswer && !reviewResult && (
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

      {/* Empty answer: continue */}
      {(isEmptyAnswer || isIdkAnswer) && reviewResult && (
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
