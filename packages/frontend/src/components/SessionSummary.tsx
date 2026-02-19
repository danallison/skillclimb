import { useSessionStore } from "../store/sessionStore.js";

interface Props {
  onViewProgress: () => void;
}

export default function SessionSummary({ onViewProgress }: Props) {
  const { reviewHistory, reset } = useSessionStore();

  const total = reviewHistory.length;
  const correct = reviewHistory.filter((r) => r.wasCorrect).length;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  const quadrantCounts = {
    calibrated: reviewHistory.filter((r) => r.calibrationQuadrant === "calibrated").length,
    illusion: reviewHistory.filter((r) => r.calibrationQuadrant === "illusion").length,
    undervalued: reviewHistory.filter((r) => r.calibrationQuadrant === "undervalued").length,
    known_unknown: reviewHistory.filter((r) => r.calibrationQuadrant === "known_unknown").length,
  };

  return (
    <div>
      <h1>Session Complete</h1>

      <div
        style={{
          padding: "1.5rem",
          background: "#151c2c",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", fontWeight: 700, color: "#00d4ff" }}>
          {percentage}%
        </div>
        <div style={{ color: "#888" }}>
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
        <CalibrationCard
          label="Calibrated"
          count={quadrantCounts.calibrated}
          color="#00c853"
          description="Confident & correct"
        />
        <CalibrationCard
          label="Illusion"
          count={quadrantCounts.illusion}
          color="#ff5252"
          description="Confident & wrong"
        />
        <CalibrationCard
          label="Undervalued"
          count={quadrantCounts.undervalued}
          color="#ffab40"
          description="Unsure & correct"
        />
        <CalibrationCard
          label="Known Unknown"
          count={quadrantCounts.known_unknown}
          color="#888"
          description="Unsure & wrong"
        />
      </div>

      <button
        onClick={() => {
          reset();
          onViewProgress();
        }}
        style={{
          width: "100%",
          padding: "0.8rem",
          background: "#00d4ff",
          color: "#0a0e17",
          fontWeight: 600,
          fontSize: "1rem",
        }}
      >
        View Progress
      </button>
    </div>
  );
}

function CalibrationCard({
  label,
  count,
  color,
  description,
}: {
  label: string;
  count: number;
  color: string;
  description: string;
}) {
  return (
    <div
      style={{
        padding: "1rem",
        background: "#151c2c",
        borderRadius: "8px",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "1.5rem", color }}>{count}</div>
      <div style={{ fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: "0.8rem", color: "#888" }}>{description}</div>
    </div>
  );
}
