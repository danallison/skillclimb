import { useSessionStore } from "../store/sessionStore.js";
import { colors } from "../styles/theme.js";
import QuestionCard from "./QuestionCard.js";
import ConfidenceRating from "./ConfidenceRating.js";
import FeedbackDisplay from "./FeedbackDisplay.js";
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

      <QuestionCard key={currentItemIndex} item={item} />

      {phase === "confidence" && <ConfidenceRating />}
      {phase === "feedback" && <FeedbackDisplay />}
    </div>
  );
}
