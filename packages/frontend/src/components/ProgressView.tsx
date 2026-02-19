import { useProgress } from "../api/hooks.js";
import type { DomainProgressResponse, TopicProgressResponse } from "../api/hooks.js";
import { computeTierProgress } from "@cyberclimb/core";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  userId: string;
  onStartSession: () => void;
  onBack: () => void;
}

const TIER_LABELS: Record<number, string> = {
  0: "Foundations",
  1: "Core Technical",
  2: "Intermediate",
  3: "Advanced",
  4: "Specialization",
};

function tierGroups(domains: DomainProgressResponse[]) {
  const tiers = new Map<number, DomainProgressResponse[]>();
  for (const d of domains) {
    const list = tiers.get(d.tier) ?? [];
    list.push(d);
    tiers.set(d.tier, list);
  }
  return Array.from(tiers.entries())
    .sort(([a], [b]) => a - b)
    .map(([tier, domains]) => ({
      tier,
      label: TIER_LABELS[tier] ?? `Tier ${tier}`,
      domains,
    }));
}

function formatNextSession(nextSession: {
  dueNow: number;
  nextDueDate: string | null;
  dueTodayRemaining: number;
  dueWithinWeek: number;
}): string {
  if (nextSession.dueNow > 0) {
    return `${nextSession.dueNow} items ready for review`;
  }
  if (!nextSession.nextDueDate) {
    return "No items scheduled";
  }
  const next = new Date(nextSession.nextDueDate);
  const now = new Date();
  const diffMs = next.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffHours < 1) return "Next review in less than an hour";
  if (diffHours < 24) return `Next review in ${diffHours} hour${diffHours === 1 ? "" : "s"}`;
  return `Next review in ${diffDays} day${diffDays === 1 ? "" : "s"}`;
}

function ProgressBar({
  mastered,
  inProgress,
  notStarted,
}: {
  mastered: number;
  inProgress: number;
  notStarted: number;
}) {
  const total = mastered + inProgress + notStarted;
  if (total === 0) return null;
  const mPct = (mastered / total) * 100;
  const iPct = (inProgress / total) * 100;

  return (
    <div
      style={{
        height: "8px",
        background: colors.divider,
        borderRadius: "4px",
        overflow: "hidden",
        display: "flex",
      }}
    >
      {mPct > 0 && (
        <div style={{ width: `${mPct}%`, background: colors.green, transition: "width 0.3s" }} />
      )}
      {iPct > 0 && (
        <div style={{ width: `${iPct}%`, background: colors.amber, transition: "width 0.3s" }} />
      )}
    </div>
  );
}

function TopicRow({ topic }: { topic: TopicProgressResponse }) {
  return (
    <div style={{ padding: "0.5rem 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "0.25rem",
          fontSize: "0.85rem",
        }}
      >
        <span style={{ color: "#ccc" }}>{topic.name}</span>
        <span style={{ fontSize: "0.8rem" }}>
          {topic.mastered > 0 && (
            <span style={{ color: colors.green }}>{topic.mastered} mastered</span>
          )}
          {topic.mastered > 0 && topic.inProgress > 0 && (
            <span style={{ color: colors.textMuted }}> · </span>
          )}
          {topic.inProgress > 0 && (
            <span style={{ color: colors.amber }}>{topic.inProgress} started</span>
          )}
          {topic.mastered === 0 && topic.inProgress === 0 && (
            <span style={{ color: colors.textMuted }}>{topic.totalNodes} to go</span>
          )}
        </span>
      </div>
      <ProgressBar
        mastered={topic.mastered}
        inProgress={topic.inProgress}
        notStarted={topic.notStarted}
      />
    </div>
  );
}

function DomainCard({ domain }: { domain: DomainProgressResponse }) {
  // Placeholder domain (no content yet)
  if (!domain.hasContent) {
    return (
      <div
        style={{
          background: colors.surfaceBg,
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "0.5rem",
          opacity: 0.6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{domain.name}</span>
          <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.2rem" }}>
            {domain.description}
          </div>
        </div>
        <span style={{ fontSize: "0.75rem", color: colors.textDim, whiteSpace: "nowrap", marginLeft: "1rem" }}>
          Coming soon
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: colors.cardBg,
        borderRadius: "12px",
        padding: "1.25rem",
        marginBottom: "0.75rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.75rem",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>{domain.name}</span>
        <span style={{ color: colors.cyan, fontWeight: 600 }}>{domain.masteryPercentage}%</span>
      </div>

      <ProgressBar
        mastered={domain.mastered}
        inProgress={domain.inProgress}
        notStarted={domain.notStarted}
      />

      <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "0.5rem", marginBottom: "0.75rem" }}>
        {domain.mastered} mastered · {domain.inProgress} in progress · {domain.notStarted} not
        started
      </div>

      {domain.topics.length > 0 && (
        <div style={{ borderTop: `1px solid ${colors.divider}`, paddingTop: "0.5rem" }}>
          {domain.topics.map((topic) => (
            <TopicRow key={topic.topicId} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProgressView({ userId, onStartSession, onBack }: Props) {
  const { data, isLoading, error } = useProgress(userId);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Loading...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ textAlign: "center", padding: "3rem", color: colors.red }}>
        Failed to load progress
      </div>
    );
  }

  const hasItemsDue = data.nextSession.dueNow > 0;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ marginBottom: 0 }}>Skill Tree</h1>
        <button
          onClick={onBack}
          style={{ ...buttonStyles.secondary, padding: "0.4rem 0.8rem" }}
        >
          Back
        </button>
      </div>

      {/* Overall stats */}
      <div
        style={{
          background: colors.cardBg,
          borderRadius: "12px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "1rem" }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.green }}>
              {data.mastered}
            </div>
            <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>mastered</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.amber }}>
              {data.inProgress}
            </div>
            <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>in progress</div>
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.textDim }}>
              {data.notStarted}
            </div>
            <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>to go</div>
          </div>
        </div>
        <ProgressBar
          mastered={data.mastered}
          inProgress={data.inProgress}
          notStarted={data.notStarted}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "1.5rem",
            marginTop: "0.75rem",
            fontSize: "0.8rem",
          }}
        >
          <span>
            <span style={{ color: colors.green }}>■</span> Mastered
          </span>
          <span>
            <span style={{ color: colors.amber }}>■</span> In progress
          </span>
          <span>
            <span style={{ color: colors.divider }}>■</span> Not started
          </span>
        </div>
      </div>

      {/* Next session timing */}
      <div
        style={{
          background: hasItemsDue ? "#0d2818" : "#1a1a2e",
          border: hasItemsDue ? `2px solid ${colors.green}` : "2px solid #3a3a5a",
          borderRadius: "12px",
          padding: "1rem 1.25rem",
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
            {formatNextSession(data.nextSession)}
          </div>
          {data.nextSession.dueWithinWeek > 0 && !hasItemsDue && (
            <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>
              {data.nextSession.dueWithinWeek} more due this week
            </div>
          )}
        </div>
        {hasItemsDue && (
          <button
            onClick={onStartSession}
            style={{ ...buttonStyles.primary, width: "auto", padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
          >
            Start Session
          </button>
        )}
      </div>

      {/* Domains grouped by tier */}
      {tierGroups(data.domains).map(({ tier, label, domains: tierDomains }) => {
        const tierStats = computeTierProgress(tierDomains).find((t) => t.tier === tier);

        return (
          <div key={tier} style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "0.75rem",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                <span style={{ color: colors.textDim, marginRight: "0.5rem" }}>T{tier}</span>
                {label}
              </h2>
              {tierStats && tierStats.totalNodes > 0 && (
                <span style={{ color: colors.cyan, fontWeight: 600, fontSize: "0.9rem" }}>
                  {tierStats.masteryPercentage}%
                </span>
              )}
            </div>
            {tierStats && tierStats.totalNodes > 0 && (
              <div style={{ marginBottom: "0.75rem" }}>
                <ProgressBar mastered={tierStats.mastered} inProgress={tierStats.inProgress} notStarted={tierStats.notStarted} />
              </div>
            )}
            {tierDomains.map((domain) => (
              <DomainCard key={domain.domainId} domain={domain} />
            ))}
          </div>
        );
      })}
    </div>
  );
}
