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
}

const TIER_LABELS: Record<number, string> = {
  0: "T0",
  1: "T1",
  2: "T2",
  3: "T3",
  4: "T4",
};

function getNodeColor(hasContent: boolean, masteryPercentage: number): string {
  if (!hasContent) return colors.lockedGray;
  if (masteryPercentage >= MASTERY_THRESHOLD_PERCENT) return colors.green;
  if (masteryPercentage >= 20) return colors.amber;
  return colors.red;
}

function DomainNode({ data }: { data: DomainNodeData }) {
  const nodeColor = getNodeColor(data.hasContent, data.masteryPercentage);
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
