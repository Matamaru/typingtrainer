import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../shared/types/domain";
import { buildAchievementSnapshot } from "./achievements";

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
    rawKeydownCount: 30,
    scoredKeystrokes: 24,
    correctKeystrokes: 24,
    backspaceCount: 0,
    accuracy: 100,
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

describe("buildAchievementSnapshot", () => {
  it("starts with all achievements locked when no history exists", () => {
    const snapshot = buildAchievementSnapshot([]);

    expect(snapshot.unlockedCount).toBe(0);
    expect(snapshot.locked.length).toBe(snapshot.totalCount);
  });

  it("unlocks consistency and technique achievements from guided history", () => {
    const snapshot = buildAchievementSnapshot([
      buildSummary("day-1", "2026-03-26T12:00:00.000Z", {
        lessonId: "en-home-row-foundations",
        lessonTitle: "Home Row Foundations",
      }),
      buildSummary("day-2", "2026-03-27T12:00:00.000Z", {
        lessonId: "en-capitalization-ladders",
        lessonTitle: "Capitalization Ladders",
      }),
      buildSummary("day-3", "2026-03-28T12:00:00.000Z", {
        lessonId: "en-calm-prose-carryover",
        lessonTitle: "Calm Prose Carryover",
      }),
    ]);

    const unlockedIds = new Set(snapshot.unlocked.map((achievement) => achievement.id));

    expect(unlockedIds.has("first-session")).toBe(true);
    expect(unlockedIds.has("guided-foundation")).toBe(true);
    expect(unlockedIds.has("three-day-streak")).toBe(true);
    expect(unlockedIds.has("steady-hands")).toBe(true);
    expect(unlockedIds.has("perfect-precision")).toBe(true);
    expect(unlockedIds.has("calm-capitals")).toBe(true);
  });

  it("unlocks adaptive and coding achievements from matching sessions", () => {
    const snapshot = buildAchievementSnapshot([
      buildSummary("adaptive", "2026-03-28T10:00:00.000Z", {
        mode: "adaptive",
        lessonId: "adaptive-generated-0",
        lessonTitle: "Adaptive Session",
      }),
      buildSummary("coding", "2026-03-28T12:00:00.000Z", {
        mode: "coding",
        lessonId: "python-function-flow",
        lessonTitle: "Python Function Flow",
        accuracy: 97,
        correctKeystrokes: 23,
      }),
    ]);

    const unlockedIds = new Set(snapshot.unlocked.map((achievement) => achievement.id));

    expect(unlockedIds.has("adaptive-reset")).toBe(true);
    expect(unlockedIds.has("code-crossover")).toBe(true);
    expect(unlockedIds.has("syntax-calm")).toBe(true);
  });

  it("requires ten sessions for the ten-sessions milestone", () => {
    const summaries = Array.from({ length: 10 }, (_, index) =>
      buildSummary(
        `session-${index + 1}`,
        `2026-03-${`${index + 1}`.padStart(2, "0")}T12:00:00.000Z`,
        {
          lessonId: "en-home-row-foundations",
          lessonTitle: "Home Row Foundations",
        },
      ),
    );
    const snapshot = buildAchievementSnapshot(summaries);

    expect(snapshot.unlocked.some((achievement) => achievement.id === "ten-sessions")).toBe(true);
  });

  it("keeps syntax-calm locked when delimiter mismatches are present", () => {
    const snapshot = buildAchievementSnapshot([
      buildSummary("coding", "2026-03-28T12:00:00.000Z", {
        mode: "coding",
        lessonId: "c-register-rhythm",
        lessonTitle: "C Register Rhythm",
        accuracy: 97,
        correctKeystrokes: 23,
        mistakeCounts: { "delimiter-mismatch": 1 },
      }),
    ]);

    expect(snapshot.unlocked.some((achievement) => achievement.id === "syntax-calm")).toBe(false);
  });
});
