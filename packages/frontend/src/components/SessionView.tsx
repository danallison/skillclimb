import { useSessionStore } from "../store/sessionStore.js";
import { colors } from "../styles/theme.js";
import QuestionCard from "./QuestionCard.js";
import ConfidenceRating from "./ConfidenceRating.js";
import FeedbackDisplay from "./FeedbackDisplay.js";
import HintDisplay from "./HintDisplay.js";
import SessionSummary from "./SessionSummary.js";

interface Props {
  onFinished: () => void;
}

export default function SessionView({ onFinished }: Props) {
  const { session, currentItemIndex, phase } = useSessionStore();

  if (!session) return null;

  if (phase === "summary") {
    return <SessionSummary onViewProgress={onFinished} />;
  }

  if (currentItemIndex >= session.items.length) {
    return <SessionSummary onViewProgress={onFinished} />;
  }

  const item = session.items[currentItemIndex];
  const progress = `${currentItemIndex + 1} / ${session.totalItems}`;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ marginBottom: 0 }}>SkillClimb</h1>
        <div style={{ color: colors.textMuted, fontSize: "0.9rem" }}>{progress}</div>
      </div>

      <div
        style={{
          height: "4px",
          background: colors.divider,
          borderRadius: "2px",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${((currentItemIndex + 1) / session.totalItems) * 100}%`,
            background: colors.cyan,
            borderRadius: "2px",
            transition: "width 0.3s ease",
          }}
        />
      </div>

      {/* Answering phase (first attempt) */}
      {phase === "answering" && <QuestionCard key={`${currentItemIndex}-1`} item={item} />}

      {/* Confidence phase (first attempt) */}
      {phase === "confidence" && (
        <>
          <QuestionCard key={`${currentItemIndex}-1`} item={item} />
          <ConfidenceRating />
        </>
      )}

      {/* Feedback phase (first attempt) */}
      {phase === "feedback" && (
        <>
          <QuestionCard key={`${currentItemIndex}-1`} item={item} />
          <FeedbackDisplay />
        </>
      )}

      {/* Hint phase — shows hint + second attempt input */}
      {phase === "hint" && <HintDisplay item={item} />}

      {/* Second attempt — re-renders question card for second try */}
      {phase === "second_attempt" && <QuestionCard key={`${currentItemIndex}-2`} item={item} />}

      {/* Second confidence */}
      {phase === "second_confidence" && (
        <>
          <QuestionCard key={`${currentItemIndex}-2`} item={item} />
          <ConfidenceRating />
        </>
      )}

      {/* Second feedback */}
      {phase === "second_feedback" && (
        <>
          <QuestionCard key={`${currentItemIndex}-2`} item={item} />
          <FeedbackDisplay />
        </>
      )}
    </div>
  );
}
