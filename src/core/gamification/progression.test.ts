import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../shared/types/domain";
import {
  buildSessionGoals,
  calculateDailyGoalProgress,
  calculateLevelFromFocusPoints,
  calculateLevelFromSessions,
  calculatePracticeStreaks,
  calculateSessionFocusPoints,
  calculateTodayFocusPoints,
  calculateTotalFocusPoints,
  focusPointsUntilNextLevel,
  sessionsUntilNextLevel,
} from "./progression";

function buildSummary(
  id: string,
  completedAt: string,
  overrides: Partial<SessionSummary> = {},
): SessionSummary {
  return {
    id,
    profileId: "profile-1",
    lessonId: "lesson-1",
    lessonTitle: "Lesson 1",
    mode: "guided",
    strictness: "strict",
    startedAt: completedAt,
    completedAt,
    durationMs: 60000,
    rawKeydownCount: 20,
    scoredKeystrokes: 16,
    correctKeystrokes: 15,
    backspaceCount: 0,
    accuracy: 93.75,
    shiftSideErrors: 0,
    likelyWrongFingerCount: 0,
    timingHesitationCount: 0,
    mistakeCounts: {},
    expectedKeyCounts: [],
    mistakeKeyCounts: [],
    expectedFingerZoneCounts: [],
    mistakeFingerZoneCounts: [],
    hesitationKeyCounts: [],
    hesitationFingerZoneCounts: [],
    substitutionCounts: [],
    weakKeys: [],
    weakFingerZones: [],
    ...overrides,
  };
}

describe("progression helpers", () => {
  it("starts at level one", () => {
    expect(calculateLevelFromSessions(0)).toBe(1);
  });

  it("counts five sessions per level", () => {
    expect(calculateLevelFromSessions(5)).toBe(2);
    expect(sessionsUntilNextLevel(7)).toBe(3);
  });

  it("calculates current and best streaks from session history", () => {
    const streaks = calculatePracticeStreaks(
      [
        buildSummary("day-1", "2026-03-28T12:00:00.000Z"),
        buildSummary("day-2", "2026-03-27T12:00:00.000Z"),
        buildSummary("day-3", "2026-03-26T12:00:00.000Z"),
        buildSummary("older", "2026-03-21T12:00:00.000Z"),
      ],
      new Date("2026-03-28T18:00:00.000Z"),
    );

    expect(streaks.currentStreak).toBe(3);
    expect(streaks.bestStreak).toBe(3);
    expect(streaks.activeDays).toBe(4);
  });

  it("drops the current streak when practice is stale", () => {
    const streaks = calculatePracticeStreaks(
      [buildSummary("old", "2026-03-24T12:00:00.000Z")],
      new Date("2026-03-28T18:00:00.000Z"),
    );

    expect(streaks.currentStreak).toBe(0);
    expect(streaks.bestStreak).toBe(1);
  });

  it("tracks daily goal completion from today's sessions", () => {
    const goal = calculateDailyGoalProgress(
      [
        buildSummary("today-1", "2026-03-28T08:00:00.000Z"),
        buildSummary("today-2", "2026-03-28T12:00:00.000Z"),
        buildSummary("older", "2026-03-27T12:00:00.000Z"),
      ],
      2,
      new Date("2026-03-28T18:00:00.000Z"),
    );

    expect(goal.sessionsToday).toBe(2);
    expect(goal.remainingSessions).toBe(0);
    expect(goal.isComplete).toBe(true);
  });

  it("rewards clean accuracy more than sloppy sessions", () => {
    const cleanSession = buildSummary("clean", "2026-03-28T12:00:00.000Z", {
      accuracy: 98,
      correctKeystrokes: 23,
      scoredKeystrokes: 24,
      strictness: "strict",
    });
    const sloppySession = buildSummary("sloppy", "2026-03-28T12:00:00.000Z", {
      accuracy: 86,
      correctKeystrokes: 21,
      scoredKeystrokes: 24,
      shiftSideErrors: 2,
      likelyWrongFingerCount: 2,
      timingHesitationCount: 1,
      mistakeCounts: {
        "wrong-key": 3,
        "wrong-shift-side": 2,
        "likely-wrong-finger": 2,
        "timing-hesitation": 1,
      },
    });

    expect(calculateSessionFocusPoints(cleanSession)).toBeGreaterThan(
      calculateSessionFocusPoints(sloppySession),
    );
  });

  it("derives level progression from accumulated focus points", () => {
    expect(calculateLevelFromFocusPoints(0)).toBe(1);
    expect(calculateLevelFromFocusPoints(100)).toBe(2);
    expect(focusPointsUntilNextLevel(135)).toBe(65);
  });

  it("sums today's focus points separately from total history", () => {
    const summaries = [
      buildSummary("today", "2026-03-28T08:00:00.000Z", {
        accuracy: 96,
        correctKeystrokes: 23,
      }),
      buildSummary("older", "2026-03-27T08:00:00.000Z", {
        accuracy: 99,
      }),
    ];

    expect(calculateTodayFocusPoints(summaries, new Date("2026-03-28T18:00:00.000Z"))).toBe(
      calculateSessionFocusPoints(summaries[0]!),
    );
    expect(calculateTotalFocusPoints(summaries)).toBe(
      calculateSessionFocusPoints(summaries[0]!) + calculateSessionFocusPoints(summaries[1]!),
    );
  });

  it("builds short and medium session goals from today's progress", () => {
    const goals = buildSessionGoals(
      [
        buildSummary("today-1", "2026-03-28T08:00:00.000Z", {
          accuracy: 96,
          correctKeystrokes: 23,
          scoredKeystrokes: 24,
        }),
        buildSummary("today-2", "2026-03-28T12:00:00.000Z", {
          accuracy: 94,
          correctKeystrokes: 22,
          scoredKeystrokes: 24,
        }),
      ],
      new Date("2026-03-28T18:00:00.000Z"),
    );

    expect(goals[0]?.isComplete).toBe(true);
    expect(goals[1]?.current).toBeGreaterThan(0);
  });
});
