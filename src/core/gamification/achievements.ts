import type { SessionSummary } from "../../shared/types/domain";

type AchievementCategory = "consistency" | "technique" | "accuracy" | "coding";

export type AchievementDefinition = {
  id: string;
  title: string;
  description: string;
  category: AchievementCategory;
};

export type UnlockedAchievement = AchievementDefinition & {
  unlockedAt: string;
};

export type AchievementSnapshot = {
  unlocked: UnlockedAchievement[];
  locked: AchievementDefinition[];
  unlockedCount: number;
  totalCount: number;
};

export const achievementDefinitions: AchievementDefinition[] = [
  {
    id: "first-session",
    title: "First Session",
    description: "Complete your first recorded practice session.",
    category: "consistency",
  },
  {
    id: "guided-foundation",
    title: "Guided Foundation",
    description: "Finish your first guided lesson from the structured ladder.",
    category: "technique",
  },
  {
    id: "adaptive-reset",
    title: "Adaptive Reset",
    description: "Complete your first adaptive recovery session.",
    category: "consistency",
  },
  {
    id: "code-crossover",
    title: "Code Crossover",
    description: "Finish your first code-focused typing session.",
    category: "coding",
  },
  {
    id: "three-day-streak",
    title: "Three-Day Streak",
    description: "Practice on three consecutive calendar days.",
    category: "consistency",
  },
  {
    id: "ten-sessions",
    title: "Ten Sessions",
    description: "Reach ten completed practice sessions.",
    category: "consistency",
  },
  {
    id: "steady-hands",
    title: "Steady Hands",
    description: "Finish a session at 95%+ accuracy with no shift-side, drift, or hesitation errors.",
    category: "accuracy",
  },
  {
    id: "perfect-precision",
    title: "Perfect Precision",
    description: "Finish a substantial session with 100% accuracy and no logged mistakes.",
    category: "accuracy",
  },
  {
    id: "calm-capitals",
    title: "Calm Capitals",
    description: "Complete the capitalization lesson without any shift-side errors.",
    category: "technique",
  },
  {
    id: "syntax-calm",
    title: "Syntax Calm",
    description: "Finish a coding session at 95%+ accuracy with no delimiter mismatch or shift-side errors.",
    category: "coding",
  },
];

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

function getDefinitionMap() {
  return new Map(achievementDefinitions.map((achievement) => [achievement.id, achievement]));
}

function countMistakes(summary: SessionSummary) {
  return Object.values(summary.mistakeCounts).reduce((sum, count) => sum + (count ?? 0), 0);
}

function unlockAchievement(unlockedAtById: Map<string, string>, achievementId: string, unlockedAt: string) {
  if (!unlockedAtById.has(achievementId)) {
    unlockedAtById.set(achievementId, unlockedAt);
  }
}

export function buildAchievementSnapshot(summaries: SessionSummary[]): AchievementSnapshot {
  const sortedSummaries = [...summaries].sort((left, right) =>
    left.completedAt.localeCompare(right.completedAt),
  );
  const unlockedAtById = new Map<string, string>();

  let completedSessions = 0;
  let lastDayKey: string | null = null;
  let runningStreak = 0;

  for (const summary of sortedSummaries) {
    completedSessions += 1;

    unlockAchievement(unlockedAtById, "first-session", summary.completedAt);

    if (summary.mode === "guided") {
      unlockAchievement(unlockedAtById, "guided-foundation", summary.completedAt);
    }

    if (summary.mode === "adaptive") {
      unlockAchievement(unlockedAtById, "adaptive-reset", summary.completedAt);
    }

    if (summary.mode === "coding") {
      unlockAchievement(unlockedAtById, "code-crossover", summary.completedAt);
    }

    if (completedSessions >= 10) {
      unlockAchievement(unlockedAtById, "ten-sessions", summary.completedAt);
    }

    const dayKey = toDayKey(new Date(summary.completedAt));

    if (dayKey !== lastDayKey) {
      if (!lastDayKey) {
        runningStreak = 1;
      } else if (differenceInCalendarDays(dayKey, lastDayKey) === 1) {
        runningStreak += 1;
      } else {
        runningStreak = 1;
      }

      lastDayKey = dayKey;
    }

    if (runningStreak >= 3) {
      unlockAchievement(unlockedAtById, "three-day-streak", summary.completedAt);
    }

    if (
      summary.accuracy >= 95 &&
      summary.shiftSideErrors === 0 &&
      summary.likelyWrongFingerCount === 0 &&
      summary.timingHesitationCount === 0
    ) {
      unlockAchievement(unlockedAtById, "steady-hands", summary.completedAt);
    }

    if (
      summary.scoredKeystrokes >= 12 &&
      summary.accuracy === 100 &&
      countMistakes(summary) === 0
    ) {
      unlockAchievement(unlockedAtById, "perfect-precision", summary.completedAt);
    }

    if (summary.lessonId === "en-capitalization-ladders" && summary.shiftSideErrors === 0) {
      unlockAchievement(unlockedAtById, "calm-capitals", summary.completedAt);
    }

    if (
      summary.mode === "coding" &&
      summary.accuracy >= 95 &&
      summary.shiftSideErrors === 0 &&
      (summary.mistakeCounts["delimiter-mismatch"] ?? 0) === 0
    ) {
      unlockAchievement(unlockedAtById, "syntax-calm", summary.completedAt);
    }
  }

  const definitionMap = getDefinitionMap();
  const unlocked = [...unlockedAtById.entries()]
    .map(([id, unlockedAt]) => {
      const definition = definitionMap.get(id);

      if (!definition) {
        return null;
      }

      return {
        ...definition,
        unlockedAt,
      } satisfies UnlockedAchievement;
    })
    .filter((entry): entry is UnlockedAchievement => entry !== null)
    .sort((left, right) => right.unlockedAt.localeCompare(left.unlockedAt));
  const locked = achievementDefinitions.filter((achievement) => !unlockedAtById.has(achievement.id));

  return {
    unlocked,
    locked,
    unlockedCount: unlocked.length,
    totalCount: achievementDefinitions.length,
  };
}
