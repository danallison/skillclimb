import { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { MASTERY_THRESHOLD_PERCENT } from "@skillclimb/core";
import { colors } from "../styles/theme.js";

interface DomainNodeData {
  label: string;
  tier: number;
  masteryPercentage: number;
  mastered: number;
  totalNodes: number;
  hasContent: boolean;
  isRecommended: boolean;
  freshness: number;
  badge?: "fresh" | "fading" | "none";
}

const TIER_LABELS: Record<number, string> = {
  0: "T0",
  1: "T1",
  2: "T2",
  3: "T3",
  4: "T4",
};

function interpolateColor(hexA: string, hexB: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const a = parse(hexA);
  const b = parse(hexB);
  const lerp = (v0: number, v1: number, f: number) => Math.round(v0 + (v1 - v0) * f);
  const r = lerp(a[0], b[0], t);
  const g = lerp(a[1], b[1], t);
  const bl = lerp(a[2], b[2], t);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${bl.toString(16).padStart(2, "0")}`;
}

function getNodeColor(hasContent: boolean, masteryPercentage: number, freshness: number): string {
  if (!hasContent) return colors.lockedGray;
  if (masteryPercentage >= MASTERY_THRESHOLD_PERCENT) {
    // Interpolate green → amber as freshness decays (1.0 = green, 0.0 = amber)
    return interpolateColor(colors.amber, colors.green, freshness);
  }
  if (masteryPercentage >= 20) return colors.amber;
  return colors.red;
}

function DomainNode({ data }: { data: DomainNodeData }) {
  const nodeColor = getNodeColor(data.hasContent, data.masteryPercentage, data.freshness);
  const borderColor = data.isRecommended ? colors.cyan : nodeColor;
  const opacity = data.hasContent ? 1 : 0.5;

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `2px solid ${borderColor}`,
        borderRadius: "10px",
        padding: "0.75rem 1rem",
        minWidth: "160px",
        maxWidth: "200px",
        opacity,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: colors.textDim }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
          <span
            style={{
              fontSize: "0.65rem",
              color: colors.textDim,
              background: colors.neutralBg,
              padding: "0.1rem 0.4rem",
              borderRadius: "4px",
            }}
          >
            {TIER_LABELS[data.tier] ?? `T${data.tier}`}
          </span>
          {data.badge && data.badge !== "none" && (
            <span
              title={data.badge === "fresh" ? "All nodes at mastery level" : "Reviews approaching due"}
              style={{
                fontSize: "0.65rem",
                padding: "0.1rem 0.35rem",
                borderRadius: "4px",
                background: data.badge === "fresh" ? colors.successBg : colors.warningBg,
                color: data.badge === "fresh" ? colors.green : colors.amber,
                fontWeight: 600,
              }}
            >
              {data.badge === "fresh" ? "\u2713" : "\u00b7\u00b7"}
            </span>
          )}
        </div>
        {data.hasContent && (
          <span style={{ fontSize: "0.75rem", fontWeight: 600, color: nodeColor }}>
            {data.masteryPercentage}%
          </span>
        )}
      </div>

      <div style={{ fontWeight: 600, fontSize: "0.85rem", color: colors.textPrimary, marginBottom: "0.4rem" }}>
        {data.label}
      </div>

      {data.hasContent ? (
        <div
          style={{
            height: "4px",
            background: colors.divider,
            borderRadius: "2px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${data.masteryPercentage}%`,
              height: "100%",
              background: nodeColor,
            }}
          />
        </div>
      ) : (
        <div style={{ fontSize: "0.7rem", color: colors.textDim }}>Coming soon</div>
      )}

      <Handle type="source" position={Position.Right} style={{ background: colors.textDim }} />
    </div>
  );
}

export default memo(DomainNode);
