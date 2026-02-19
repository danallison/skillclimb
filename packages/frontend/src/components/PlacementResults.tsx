import { colors, buttonStyles } from "../styles/theme.js";
import StatCard from "./StatCard.js";

interface Props {
  result: {
    globalTheta: number;
    domainThetas: Record<string, number>;
    domainNames?: Record<string, string>;
    classifications: {
      mastered: number;
      partial: number;
      weak: number;
      unknown: number;
    };
  };
  onContinue: () => void;
}

function AbilityBar({ label, theta }: { label: string; theta: number }) {
  // Map theta (-4 to 4) to percentage (0-100)
  const pct = Math.max(0, Math.min(100, ((theta + 4) / 8) * 100));
  const color = theta >= 1 ? colors.green : theta >= 0 ? colors.amber : colors.red;

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.85rem", color: colors.textPrimary }}>{label}</span>
        <span style={{ fontSize: "0.85rem", color, fontWeight: 600 }}>
          {theta.toFixed(1)}
        </span>
      </div>
      <div
        style={{
          height: "8px",
          background: colors.divider,
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: color,
            borderRadius: "4px",
            transition: "width 0.5s",
          }}
        />
      </div>
    </div>
  );
}

export default function PlacementResults({ result, onContinue }: Props) {
  const { classifications } = result;
  const total = classifications.mastered + classifications.partial + classifications.weak + classifications.unknown;

  return (
    <div>
      <h1>Placement Complete</h1>

      {/* Overall ability */}
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
          Estimated Ability
        </div>
        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: colors.cyan }}>
          {result.globalTheta.toFixed(1)}
        </div>
        <div style={{ fontSize: "0.8rem", color: colors.textDim }}>
          on a scale of -4 to +4
        </div>
      </div>

      {/* Per-domain ability */}
      {Object.keys(result.domainThetas).length > 0 && (
        <div
          style={{
            background: colors.cardBg,
            borderRadius: "12px",
            padding: "1.25rem",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Domain Abilities</h2>
          {Object.entries(result.domainThetas).map(([domainId, theta]) => (
            <AbilityBar
              key={domainId}
              label={result.domainNames?.[domainId] ?? domainId.slice(0, 8)}
              theta={theta}
            />
          ))}
        </div>
      )}

      {/* Node classifications */}
      <div
        style={{
          background: colors.cardBg,
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem" }}>Knowledge Map</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
          }}
        >
          <StatCard
            label="Mastered"
            count={classifications.mastered}
            percentage={total > 0 ? Math.round((classifications.mastered / total) * 100) : 0}
            color={colors.green}
            description="Scheduled 30+ days out"
            background={colors.surfaceBg}
          />
          <StatCard
            label="Partial"
            count={classifications.partial}
            percentage={total > 0 ? Math.round((classifications.partial / total) * 100) : 0}
            color={colors.amber}
            description="Review in 3 days"
            background={colors.surfaceBg}
          />
          <StatCard
            label="Weak"
            count={classifications.weak}
            percentage={total > 0 ? Math.round((classifications.weak / total) * 100) : 0}
            color={colors.red}
            description="Due immediately"
            background={colors.surfaceBg}
          />
          <StatCard
            label="Unknown"
            count={classifications.unknown}
            percentage={total > 0 ? Math.round((classifications.unknown / total) * 100) : 0}
            color={colors.textMuted}
            description="Start from scratch"
            background={colors.surfaceBg}
          />
        </div>
      </div>

      <button onClick={onContinue} style={buttonStyles.primary}>
        Start Learning
      </button>
    </div>
  );
}
