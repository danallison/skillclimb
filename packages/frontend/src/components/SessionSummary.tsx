import { useSessionStore } from "../store/sessionStore.js";
import { computeSessionSummary } from "@skillclimb/core";
import { colors, buttonStyles } from "../styles/theme.js";
import StatCard from "./StatCard.js";

interface Props {
  onViewProgress: () => void;
}

export default function SessionSummary({ onViewProgress }: Props) {
  const { reviewHistory, reset } = useSessionStore();

  const summary = computeSessionSummary(reviewHistory);
  const { totalReviews: total, correctCount: correct, accuracyPercentage: percentage, calibrationCounts: quadrantCounts } = summary;

  return (
    <div>
      <h1>Session Complete</h1>

      <div
        style={{
          padding: "1.5rem",
          background: colors.cardBg,
          borderRadius: "12px",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", fontWeight: 700, color: colors.cyan }}>
          {percentage}%
        </div>
        <div style={{ color: colors.textMuted }}>
          {correct} of {total} correct
        </div>
      </div>

      <h2>Confidence Calibration</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          label="Calibrated"
          count={quadrantCounts.calibrated}
          color={colors.green}
          description="Confident & correct"
        />
        <StatCard
          label="Illusion"
          count={quadrantCounts.illusion}
          color={colors.red}
          description="Confident & wrong"
        />
        <StatCard
          label="Undervalued"
          count={quadrantCounts.undervalued}
          color={colors.amber}
          description="Unsure & correct"
        />
        <StatCard
          label="Known Unknown"
          count={quadrantCounts.known_unknown}
          color={colors.textMuted}
          description="Unsure & wrong"
        />
      </div>

      <button
        onClick={() => {
          reset();
          onViewProgress();
        }}
        style={buttonStyles.primary}
      >
        View Progress
      </button>
    </div>
  );
}
