import { useProfile } from "../api/hooks.js";
import type { ProfileResponse } from "../api/hooks.js";
import { colors, buttonStyles } from "../styles/theme.js";

interface Props {
  skilltreeId?: string;
  onBack: () => void;
}

function StreakCard({ profile }: { profile: ProfileResponse }) {
  return (
    <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Consistency</h3>
      <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.cyan }}>{profile.streak.currentStreak}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>current streak</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.textMuted }}>{profile.streak.longestStreak}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>longest streak</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.textMuted }}>{profile.streak.totalStudyDays}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>total days</div>
        </div>
      </div>
      <div style={{ fontSize: "0.85rem", color: colors.textMuted, marginBottom: "0.75rem" }}>
        {profile.streak.recentSummary}
      </div>
      {/* Heat map calendar */}
      <HeatMapCalendar heatMap={profile.heatMap} />
    </div>
  );
}

function HeatMapCalendar({ heatMap }: { heatMap: ProfileResponse["heatMap"] }) {
  if (heatMap.length === 0) return null;

  // 90 days → ~13 weeks. Display as 7-row grid (Mon–Sun per column)
  const CELL_SIZE = 10;
  const GAP = 2;

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
          gridAutoFlow: "column",
          gap: `${GAP}px`,
          width: "fit-content",
        }}
      >
        {heatMap.map((entry) => (
          <div
            key={entry.date}
            title={`${entry.date}: ${entry.reviewCount} reviews`}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              borderRadius: "2px",
              background: entry.intensity === 0
                ? colors.divider
                : `rgba(0, 212, 255, ${0.2 + entry.intensity * 0.8})`,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: colors.textDim, marginTop: "0.25rem" }}>
        <span>Less</span>
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity) => (
            <div
              key={intensity}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                borderRadius: "2px",
                background: intensity === 0 ? colors.divider : `rgba(0, 212, 255, ${0.2 + intensity * 0.8})`,
              }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  );
}

function BadgeSummary({ profile }: { profile: ProfileResponse }) {
  return (
    <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Domain Badges</h3>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.green }}>{profile.badges.fresh}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>mastered</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.amber }}>{profile.badges.fading}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>fading</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: colors.textDim }}>{profile.badges.total - profile.badges.fresh - profile.badges.fading}</div>
          <div style={{ fontSize: "0.8rem", color: colors.textMuted }}>in progress</div>
        </div>
      </div>
    </div>
  );
}

function VelocityCard({ profile }: { profile: ProfileResponse }) {
  const trendArrow = profile.velocity.trend === "increasing" ? "\u2191"
    : profile.velocity.trend === "decreasing" ? "\u2193"
    : "\u2192";
  const trendColor = profile.velocity.trend === "increasing" ? colors.green
    : profile.velocity.trend === "decreasing" ? colors.amber
    : colors.textMuted;

  return (
    <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Learning Velocity</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "2rem", fontWeight: 700, color: colors.cyan }}>{profile.velocity.nodesPerWeek}</span>
        <span style={{ fontSize: "0.9rem", color: colors.textMuted }}>nodes/week</span>
        <span style={{ fontSize: "1.5rem", color: trendColor }}>{trendArrow}</span>
      </div>
      {/* Mini bar chart of weekly breakdown */}
      <div style={{ display: "flex", gap: "4px", alignItems: "flex-end", height: "40px" }}>
        {profile.velocity.weeklyBreakdown.map((count, i) => {
          const max = Math.max(...profile.velocity.weeklyBreakdown, 1);
          const height = (count / max) * 40;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${height}px`,
                background: i === profile.velocity.weeklyBreakdown.length - 1 ? colors.cyan : colors.inputBorder,
                borderRadius: "2px 2px 0 0",
                minHeight: "2px",
              }}
              title={`Week ${i + 1}: ${count} nodes`}
            />
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: colors.textDim, marginTop: "0.25rem" }}>
        <span>4 weeks ago</span>
        <span>This week</span>
      </div>
    </div>
  );
}

function RetentionMeter({ value }: { value: number }) {
  const clampedValue = Math.max(0, Math.min(100, value));
  const barColor = clampedValue >= 70 ? colors.green : clampedValue >= 40 ? colors.amber : colors.red;

  return (
    <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
      <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Retention Strength</h3>
      <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <span style={{ fontSize: "2rem", fontWeight: 700, color: barColor }}>{clampedValue}%</span>
        <span style={{ fontSize: "0.85rem", color: colors.textMuted }}>average freshness</span>
      </div>
      <div style={{ height: "8px", background: colors.divider, borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ width: `${clampedValue}%`, height: "100%", background: barColor, transition: "width 0.3s" }} />
      </div>
    </div>
  );
}

export default function KnowledgeProfileView({ skilltreeId, onBack }: Props) {
  const { data: profile, isLoading, error } = useProfile(skilltreeId);

  if (isLoading) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.textMuted }}>Loading profile...</div>;
  }

  if (error || !profile) {
    return <div style={{ textAlign: "center", padding: "3rem", color: colors.red }}>Failed to load profile</div>;
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Knowledge Profile</h1>
        <button onClick={onBack} style={{ ...buttonStyles.secondary, padding: "0.4rem 0.8rem" }}>
          Back
        </button>
      </div>

      {/* Knowledge summary */}
      <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem", textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", fontWeight: 700, color: colors.cyan }}>
          {profile.totalMastered}
        </div>
        <div style={{ color: colors.textMuted }}>
          of {profile.totalNodes} concepts mastered
        </div>
        {profile.tierCompletion.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "0.75rem", fontSize: "0.8rem" }}>
            {profile.tierCompletion.map((tc) => (
              <span key={tc.tier} style={{ color: colors.textMuted }}>
                T{tc.tier}: {tc.percentage}%
              </span>
            ))}
          </div>
        )}
      </div>

      <StreakCard profile={profile} />
      <BadgeSummary profile={profile} />
      <VelocityCard profile={profile} />
      <RetentionMeter value={profile.retentionStrength} />

      {/* Calibration score */}
      <div style={{ background: colors.cardBg, borderRadius: "12px", padding: "1.25rem", marginBottom: "1rem" }}>
        <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Calibration Score</h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontSize: "2rem", fontWeight: 700, color: colors.cyan }}>{profile.calibrationScore}</span>
          <span style={{ fontSize: "0.85rem", color: colors.textMuted }}>/ 100</span>
        </div>
        <div style={{ fontSize: "0.8rem", color: colors.textMuted, marginTop: "0.25rem" }}>
          How accurately you predict your own performance
        </div>
      </div>
    </div>
  );
}
