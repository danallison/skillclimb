/**
 * Streak and consistency tracking — pure functions.
 *
 * Computes current/longest streaks and heat map data from a list of
 * study-day records. The streak freeze system allows one missed day
 * per calendar week (Mon–Sun) without breaking the streak.
 */

export interface StudyDay {
  date: string; // YYYY-MM-DD
  reviewCount: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  /** Descriptive summary, e.g. "14 of the last 21 days" */
  recentSummary: string;
}

export interface HeatMapEntry {
  date: string; // YYYY-MM-DD
  reviewCount: number;
  intensity: number; // 0.0–1.0 (0 = no activity, 1 = max activity in window)
}

/** Parse "YYYY-MM-DD" to a Date at midnight UTC. */
function parseDate(d: string): Date {
  return new Date(d + "T00:00:00Z");
}

/** Format a Date to "YYYY-MM-DD" in UTC. */
function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Get the ISO week number's Monday for a given date (used for freeze-week grouping). */
function getISOWeekMonday(d: Date): string {
  const date = new Date(d);
  const day = date.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? 6 : day - 1; // days since Monday
  date.setUTCDate(date.getUTCDate() - diff);
  return formatDate(date);
}

/**
 * Compute streak info from study day records.
 *
 * Freeze rule: within any ISO calendar week (Mon–Sun), one missed day
 * does not break the streak. Two or more consecutive missed days where
 * the week's freeze has been used will break it.
 */
export function computeStreakInfo(
  studyDays: StudyDay[],
  today: string, // YYYY-MM-DD
): StreakInfo {
  if (studyDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      recentSummary: "0 of the last 21 days",
    };
  }

  const daySet = new Set(studyDays.map((d) => d.date));

  // Recent summary: count study days in last 21 days
  const todayDate = parseDate(today);
  let recentCount = 0;
  for (let i = 0; i < 21; i++) {
    const d = new Date(todayDate);
    d.setUTCDate(d.getUTCDate() - i);
    if (daySet.has(formatDate(d))) recentCount++;
  }
  const recentSummary = `${recentCount} of the last 21 days`;

  // Build sorted list of all dates from earliest study day to today
  const allDates = Array.from(daySet).sort();
  const earliest = allDates[0];
  const dates: string[] = [];
  const cursor = parseDate(earliest);
  const end = parseDate(today);
  while (cursor <= end) {
    dates.push(formatDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  // Walk through dates computing streaks with freeze logic
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;
  const weekMisses = new Map<string, number>(); // weekMonday → missed days used as freeze

  for (const date of dates) {
    const studied = daySet.has(date);
    if (studied) {
      streak++;
    } else {
      // Check if we can use a freeze for this week
      const weekKey = getISOWeekMonday(parseDate(date));
      const usedFreezes = weekMisses.get(weekKey) ?? 0;
      if (usedFreezes < 1) {
        // Use the freeze — streak continues
        weekMisses.set(weekKey, usedFreezes + 1);
        // Don't increment streak, but don't break it
      } else {
        // No freeze available — streak breaks
        if (streak > longestStreak) longestStreak = streak;
        streak = 0;
      }
    }
  }
  if (streak > longestStreak) longestStreak = streak;

  // Current streak: walk backwards from today
  currentStreak = 0;
  const backWeekMisses = new Map<string, number>();
  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    const studied = daySet.has(date);
    if (studied) {
      currentStreak++;
    } else {
      const weekKey = getISOWeekMonday(parseDate(date));
      const usedFreezes = backWeekMisses.get(weekKey) ?? 0;
      if (usedFreezes < 1) {
        backWeekMisses.set(weekKey, usedFreezes + 1);
        // Freeze used, streak continues but day doesn't count
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalStudyDays: daySet.size,
    recentSummary,
  };
}

/**
 * Compute heat map entries for the last N days.
 */
export function computeHeatMap(
  studyDays: StudyDay[],
  today: string,
  daysBack: number = 90,
): HeatMapEntry[] {
  const dayMap = new Map<string, StudyDay>();
  for (const d of studyDays) {
    dayMap.set(d.date, d);
  }

  // Build entries for the window first, then compute max from windowed data
  const entries: HeatMapEntry[] = [];
  const todayDate = parseDate(today);
  let maxReviews = 1;
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setUTCDate(d.getUTCDate() - i);
    const dateStr = formatDate(d);
    const day = dayMap.get(dateStr);
    const reviewCount = day?.reviewCount ?? 0;
    if (reviewCount > maxReviews) maxReviews = reviewCount;
    entries.push({ date: dateStr, reviewCount, intensity: 0 });
  }

  // Scale intensity relative to windowed max
  for (const entry of entries) {
    entry.intensity = entry.reviewCount > 0 ? entry.reviewCount / maxReviews : 0;
  }

  return entries;
}
