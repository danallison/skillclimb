import { colors } from "../styles/theme.js";

interface Props {
  label: string;
  count: number;
  color: string;
  description: string;
  percentage?: number;
  background?: string;
}

export default function StatCard({ label, count, color, description, percentage, background }: Props) {
  return (
    <div
      style={{
        padding: "1rem",
        background: background ?? colors.cardBg,
        borderRadius: "8px",
        borderLeft: `4px solid ${color}`,
      }}
    >
      <div style={{ fontWeight: 600, fontSize: "1.5rem", color }}>{count}</div>
      <div style={{ fontWeight: 500, fontSize: "0.9rem" }}>
        {label}
        {percentage !== undefined && (
          <span style={{ color: colors.textDim }}> ({percentage}%)</span>
        )}
      </div>
      <div style={{ fontSize: percentage !== undefined ? "0.75rem" : "0.8rem", color: colors.textMuted }}>
        {description}
      </div>
    </div>
  );
}
