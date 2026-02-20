import { useCalibration } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";
import StatCard from "./StatCard.js";

interface Props {
  userId: string;
  skilltreeId?: string;
  onBack: () => void;
}

function scoreColor(score: number): string {
  if (score >= 75) return colors.green;
  if (score >= 50) return colors.amber;
  return colors.red;
}

function TrendChart({ trend }: { trend: Array<{ score: number; entryCount: number }> }) {
  if (trend.length < 2) return null;

  const width = 300;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 10, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const points = trend.map((t, i) => {
    const x = padding.left + (i / (trend.length - 1)) * chartWidth;
    const y = padding.top + (1 - t.score / 100) * chartHeight;
    return { x, y, score: t.score };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", maxWidth: "400px", height: "auto" }}
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => (
        <line
          key={v}
          x1={padding.left}
          y1={padding.top + (1 - v / 100) * chartHeight}
          x2={width - padding.right}
          y2={padding.top + (1 - v / 100) * chartHeight}
          stroke={colors.divider}
          strokeWidth={0.5}
        />
      ))}
      {/* Trend line */}
      <path d={pathD} fill="none" stroke={colors.cyan} strokeWidth={2} />
      {/* Data points */}
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill={scoreColor(p.score)}
        />
      ))}
    </svg>
  );
}

export default function CalibrationDashboard({ userId, skilltreeId, onBack }: Props) {
  const { data, isLoading, error } = useCalibration(userId, skilltreeId);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Loading...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: colors.red }}>
        Failed to load calibration data
      </div>
    );
  }

  if (data.totalEntries === 0) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ marginBottom: 0 }}>Calibration</h1>
          <button onClick={onBack} style={{ ...buttonStyles.secondary, padding: "0.4rem 0.8rem" }}>
            Back
          </button>
        </div>
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "2rem",
            textAlign: "center",
            color: colors.textMuted,
          }}
        >
          Complete some review sessions to see your calibration data.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: 0 }}>Calibration</h1>
        <button onClick={onBack} style={{ ...buttonStyles.secondary, padding: "0.4rem 0.8rem" }}>
          Back
        </button>
      </div>

      {/* Overall Score */}
      <div
        style={{
          background: colors.cardBg,
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "0.9rem", color: colors.textMuted, marginBottom: "0.5rem" }}>
          Calibration Score
        </div>
        <div style={{ fontSize: "3rem", fontWeight: 700, color: scoreColor(data.overallScore) }}>
          {data.overallScore}
        </div>
        <div style={{ fontSize: "0.8rem", color: colors.textDim }}>
          Based on {data.totalEntries} reviews
        </div>
      </div>

      {/* Quadrant Grid */}
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
          count={data.quadrantCounts.calibrated ?? 0}
          percentage={data.quadrantPercentages.calibrated ?? 0}
          color={colors.green}
          description="Confident & correct"
        />
        <StatCard
          label="Illusion"
          count={data.quadrantCounts.illusion ?? 0}
          percentage={data.quadrantPercentages.illusion ?? 0}
          color={colors.red}
          description="Confident & wrong"
        />
        <StatCard
          label="Undervalued"
          count={data.quadrantCounts.undervalued ?? 0}
          percentage={data.quadrantPercentages.undervalued ?? 0}
          color={colors.amber}
          description="Unsure & correct"
        />
        <StatCard
          label="Known Unknown"
          count={data.quadrantCounts.known_unknown ?? 0}
          percentage={data.quadrantPercentages.known_unknown ?? 0}
          color={colors.textMuted}
          description="Unsure & wrong"
        />
      </div>

      {/* Per-domain breakdown */}
      {data.domainBreakdown.length > 0 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>By Domain</h2>
          {data.domainBreakdown.map((d) => (
            <div
              key={d.domainId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.5rem 0",
                borderBottom: `1px solid ${colors.divider}`,
              }}
            >
              <div>
                <div style={{ fontSize: "0.9rem", color: colors.textPrimary }}>{d.domainName}</div>
                <div style={{ fontSize: "0.75rem", color: colors.textMuted }}>{d.entryCount} reviews</div>
              </div>
              <span style={{ fontWeight: 600, color: scoreColor(d.score) }}>
                {d.score}%
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Trend */}
      {data.trend.length >= 2 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Trend</h2>
          <TrendChart trend={data.trend} />
        </div>
      )}

      {/* Insights */}
      {data.insights.length > 0 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Insights</h2>
          {data.insights.map((insight, i) => (
            <div
              key={i}
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "0.5rem",
                background: insight.severity === "success"
                  ? colors.successBg
                  : insight.severity === "warning"
                  ? colors.warningBg
                  : colors.neutralBg,
                borderLeft: `4px solid ${
                  insight.severity === "success"
                    ? colors.green
                    : insight.severity === "warning"
                    ? colors.amber
                    : colors.cyan
                }`,
                fontSize: "0.9rem",
                color: colors.textPrimary,
              }}
            >
              {insight.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
