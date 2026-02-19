import { useMemo } from "react";
import { ReactFlow, Background, Controls, type Node, type Edge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { DomainProgressResponse } from "../api/hooks.js";
import DomainNode from "./DomainNode.js";
import { colors } from "../styles/theme.js";

interface Props {
  domains: DomainProgressResponse[];
}

const nodeTypes = { domain: DomainNode };

export default function SkillTreeMap({ domains }: Props) {
  const { nodes, edges } = useMemo(() => {
    const tierGroups = new Map<number, DomainProgressResponse[]>();
    for (const d of domains) {
      const list = tierGroups.get(d.tier) ?? [];
      list.push(d);
      tierGroups.set(d.tier, list);
    }

    // Build a name→id map for prerequisite edge creation
    const nameToId = new Map<string, string>();
    for (const d of domains) {
      nameToId.set(d.name, d.domainId);
    }

    const TIER_X_SPACING = 280;
    const NODE_Y_SPACING = 100;

    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    // Find recommended domain (highest tier with content and items due/in progress)
    const recommended = domains
      .filter((d) => d.hasContent && d.masteryPercentage < 60)
      .sort((a, b) => a.tier - b.tier || b.totalNodes - a.totalNodes)[0];

    const sortedTiers = Array.from(tierGroups.keys()).sort((a, b) => a - b);

    for (const tier of sortedTiers) {
      const tierDomains = tierGroups.get(tier) ?? [];
      const x = tier * TIER_X_SPACING;

      // Center domains vertically within tier
      const totalHeight = (tierDomains.length - 1) * NODE_Y_SPACING;
      const startY = -totalHeight / 2;

      for (let i = 0; i < tierDomains.length; i++) {
        const d = tierDomains[i];
        const y = startY + i * NODE_Y_SPACING;

        flowNodes.push({
          id: d.domainId,
          type: "domain",
          position: { x, y },
          data: {
            label: d.name,
            tier: d.tier,
            masteryPercentage: d.masteryPercentage,
            mastered: d.mastered,
            totalNodes: d.totalNodes,
            hasContent: d.hasContent,
            isRecommended: recommended?.domainId === d.domainId,
          },
        });

        // Create edges from prerequisites
        if (d.prerequisites && d.prerequisites.length > 0) {
          for (const prereqName of d.prerequisites) {
            const prereqId = nameToId.get(prereqName);
            if (prereqId) {
              // Determine if prerequisite is met (60% mastery)
              const prereqDomain = domains.find((dd) => dd.domainId === prereqId);
              const met = prereqDomain ? prereqDomain.masteryPercentage >= 60 : false;

              flowEdges.push({
                id: `${prereqId}-${d.domainId}`,
                source: prereqId,
                target: d.domainId,
                style: {
                  stroke: met ? colors.green : colors.textDim,
                  strokeWidth: met ? 2 : 1,
                  strokeDasharray: met ? undefined : "5 5",
                },
                animated: met,
              });
            }
          }
        }
      }
    }

    return { nodes: flowNodes, edges: flowEdges };
  }, [domains]);

  return (
    <div style={{ height: "500px", borderRadius: "12px", overflow: "hidden", border: `1px solid ${colors.inputBorder}` }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
        style={{ background: colors.surfaceBg }}
      >
        <Background color={colors.divider} gap={20} />
        <Controls
          showInteractive={false}
          style={{ background: colors.cardBg, borderColor: colors.inputBorder }}
        />
      </ReactFlow>
    </div>
  );
}
