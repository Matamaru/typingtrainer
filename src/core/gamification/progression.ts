import type { SessionSummary } from "../../shared/types/domain";

export type SessionGoal = {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  unit: string;
  isComplete: boolean;
};

export function calculateLevelFromSessions(sessionsCompleted: number) {
  return Math.floor(sessionsCompleted / 5) + 1;
}

export function sessionsUntilNextLevel(sessionsCompleted: number) {
  const remainder = sessionsCompleted % 5;

  return remainder === 0 ? 5 : 5 - remainder;
}

function countMistakes(summary: SessionSummary) {
  return Object.values(summary.mistakeCounts).reduce((sum, count) => sum + (count ?? 0), 0);
}

export function calculateSessionFocusPoints(summary: SessionSummary) {
  let points = 10;

  if (summary.accuracy >= 99) {
    points = 40;
  } else if (summary.accuracy >= 96) {
    points = 34;
  } else if (summary.accuracy >= 93) {
    points = 28;
  } else if (summary.accuracy >= 90) {
    points = 22;
  } else if (summary.accuracy >= 85) {
    points = 16;
  }

  if (summary.scoredKeystrokes >= 18) {
    points += 4;
  }

  if (summary.strictness === "strict") {
    points += 2;
  }

  if (
    summary.shiftSideErrors === 0 &&
    summary.likelyWrongFingerCount === 0 &&
    summary.timingHesitationCount === 0 &&
    (summary.mistakeCounts["delimiter-mismatch"] ?? 0) === 0
  ) {
    points += 8;
  }

  if (countMistakes(summary) === 0) {
    points += 6;
  }

  return points;
}

export function calculateTotalFocusPoints(summaries: SessionSummary[]) {
  return summaries.reduce((sum, summary) => sum + calculateSessionFocusPoints(summary), 0);
}

export function calculateLevelFromFocusPoints(totalFocusPoints: number) {
  return Math.floor(totalFocusPoints / 100) + 1;
}

export function focusPointsUntilNextLevel(totalFocusPoints: number) {
  const remainder = totalFocusPoints % 100;

  return remainder === 0 ? 100 : 100 - remainder;
}

function toDayKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDayKey(dayKey: string) {
  return new Date(`${dayKey}T12:00:00`);
}

function differenceInCalendarDays(laterDayKey: string, earlierDayKey: string) {
  const msPerDay = 24 * 60 * 60 * 1000;

  return Math.round((parseDayKey(laterDayKey).getTime() - parseDayKey(earlierDayKey).getTime()) / msPerDay);
}

function getActiveDayKeys(summaries: SessionSummary[]) {
  return [...new Set(summaries.map((summary) => toDayKey(new Date(summary.completedAt))))].sort(
    (left, right) => right.localeCompare(left),
  );
}

export function calculatePracticeStreaks(summaries: SessionSummary[], now = new Date()) {
  const activeDayKeys = getActiveDayKeys(summaries);

  if (activeDayKeys.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      activeDays: 0,
      lastActiveDay: null,
    };
  }

  const todayKey = toDayKey(now);
  const currentAnchor = activeDayKeys[0]!;
  const gapFromToday = differenceInCalendarDays(todayKey, currentAnchor);

  let currentStreak = 0;
  if (gapFromToday <= 1) {
    currentStreak = 1;

    for (let index = 1; index < activeDayKeys.length; index += 1) {
      if (differenceInCalendarDays(activeDayKeys[index - 1]!, activeDayKeys[index]!) !== 1) {
        break;
      }

      currentStreak += 1;
    }
  }

  let bestStreak = 1;
  let runningStreak = 1;

  for (let index = 1; index < activeDayKeys.length; index += 1) {
    if (differenceInCalendarDays(activeDayKeys[index - 1]!, activeDayKeys[index]!) === 1) {
      runningStreak += 1;
      bestStreak = Math.max(bestStreak, runningStreak);
      continue;
    }

    runningStreak = 1;
  }

  return {
    currentStreak,
    bestStreak,
    activeDays: activeDayKeys.length,
    lastActiveDay: activeDayKeys[0] ?? null,
  };
}

export function calculateDailyGoalProgress(
  summaries: SessionSummary[],
  targetSessions = 2,
  now = new Date(),
) {
  const todayKey = toDayKey(now);
  const sessionsToday = summaries.filter((summary) => toDayKey(new Date(summary.completedAt)) === todayKey).length;

  return {
    sessionsToday,
    targetSessions,
    remainingSessions: Math.max(targetSessions - sessionsToday, 0),
    isComplete: sessionsToday >= targetSessions,
  };
}

function getTodaySummaries(summaries: SessionSummary[], now = new Date()) {
  const todayKey = toDayKey(now);

  return summaries.filter((summary) => toDayKey(new Date(summary.completedAt)) === todayKey);
}

function isFocusedSession(summary: SessionSummary) {
  return summary.accuracy >= 92 && summary.scoredKeystrokes >= 12;
}

export function buildSessionGoals(summaries: SessionSummary[], now = new Date()): SessionGoal[] {
  const todaySummaries = getTodaySummaries(summaries, now);
  const focusedSessionsToday = todaySummaries.filter(isFocusedSession).length;
  const focusPointsToday = calculateTotalFocusPoints(todaySummaries);

  return [
    {
      id: "short-reset",
      title: "Short reset",
      description: "Complete one focused session today at 92%+ accuracy.",
      current: focusedSessionsToday,
      target: 1,
      unit: "focused session",
      isComplete: focusedSessionsToday >= 1,
    },
    {
      id: "medium-block",
      title: "Medium block",
      description: "Build 60 focus points today through calm, accurate sessions.",
      current: focusPointsToday,
      target: 60,
      unit: "focus points",
      isComplete: focusPointsToday >= 60,
    },
  ];
}

export function calculateTodayFocusPoints(summaries: SessionSummary[], now = new Date()) {
  return calculateTotalFocusPoints(getTodaySummaries(summaries, now));
}
