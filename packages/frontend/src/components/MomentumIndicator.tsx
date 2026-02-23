import { useSessionStore } from "../store/sessionStore.js";
import { colors } from "../styles/theme.js";

const MOMENTUM_COLORS: Record<string, string> = {
  building: colors.green,
  steady: colors.textMuted,
  struggling: colors.amber,
};

export default function MomentumIndicator() {
  const { momentum } = useSessionStore();

  if (momentum.recentTotal === 0) return null;

  const color = MOMENTUM_COLORS[momentum.state] ?? colors.textMuted;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        fontSize: "0.8rem",
        color,
      }}
      title={momentum.message}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: color,
          display: "inline-block",
        }}
      />
      <span>{momentum.recentCorrect}/{momentum.recentTotal} correct</span>
    </div>
  );
}
