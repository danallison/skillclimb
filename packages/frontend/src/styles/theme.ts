import type { CSSProperties } from "react";

export const colors = {
  // Backgrounds
  cardBg: "#151c2c",
  surfaceBg: "#111827",
  inputBorder: "#2a3040",
  divider: "#2a3040",

  // Accent
  cyan: "#00d4ff",
  cyanDark: "#0a0e17",

  // Status
  green: "#00c853",
  red: "#ff5252",
  amber: "#ffab40",

  // Text
  textPrimary: "#e0e0e0",
  textMuted: "#888",
  textDim: "#555",
} as const;

export const buttonStyles = {
  primary: {
    width: "100%",
    padding: "0.8rem",
    background: colors.cyan,
    color: colors.cyanDark,
    fontWeight: 600,
    fontSize: "1rem",
  } satisfies CSSProperties,

  secondary: {
    padding: "0.6rem 1rem",
    background: "transparent",
    border: "1px solid #3a3a4a",
    color: colors.textMuted,
    fontSize: "0.85rem",
    borderRadius: "6px",
  } satisfies CSSProperties,
};
