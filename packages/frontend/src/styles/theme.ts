import type { CSSProperties } from "react";

export const colors = {
  // Backgrounds — warm bark and soil tones
  cardBg: "#242019",
  surfaceBg: "#1a1714",
  inputBorder: "#332e26",
  divider: "#332e26",

  // Accent — sage canopy green
  cyan: "#7cab6e",
  cyanDark: "#1a2317",

  // Status — natural tones
  green: "#7cab6e",
  red: "#c47a5a",
  amber: "#d4a54a",

  // Text — birch and weathered wood
  textPrimary: "#d8d0c4",
  textMuted: "#968a7a",
  textDim: "#5c5347",

  // Feedback backgrounds
  successBg: "#1a2317",
  errorBg: "#2a1c15",
  neutralBg: "#242019",
  selectedBg: "#2a3020",

  // Feedback text
  successText: "#9cc08e",
  errorText: "#d49580",

  // Severity backgrounds (for insights)
  warningBg: "#2a2215",

  // Locked/disabled
  lockedGray: "#3a3530",
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
    border: `1px solid ${colors.inputBorder}`,
    color: colors.textMuted,
    fontSize: "0.85rem",
    borderRadius: "6px",
  } satisfies CSSProperties,
};
