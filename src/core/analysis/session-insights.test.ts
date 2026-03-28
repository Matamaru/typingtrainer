import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../shared/types/domain";
import { buildSessionInsights } from "./session-insights";

function buildSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: "session-1",
    profileId: "profile-1",
    lessonId: "lesson-1",
    lessonTitle: "Lesson",
    mode: "guided",
    strictness: "strict",
    startedAt: "2026-03-28T08:00:00.000Z",
    completedAt: "2026-03-28T08:05:00.000Z",
    durationMs: 300000,
    rawKeydownCount: 20,
    scoredKeystrokes: 10,
    correctKeystrokes: 9,
    backspaceCount: 0,
    accuracy: 90,
    shiftSideErrors: 1,
    likelyWrongFingerCount: 1,
    timingHesitationCount: 2,
    mistakeCounts: { "wrong-key": 1 },
    expectedKeyCounts: [
      { code: "KeyS", label: "S", count: 4 },
      { code: "KeyA", label: "A", count: 2 },
    ],
    mistakeKeyCounts: [{ code: "KeyS", label: "S", count: 1 }],
    expectedFingerZoneCounts: [{ fingerZone: "left-ring", count: 4 }],
    mistakeFingerZoneCounts: [{ fingerZone: "left-ring", count: 1 }],
    hesitationKeyCounts: [{ code: "KeyS", label: "S", count: 2 }],
    hesitationFingerZoneCounts: [{ fingerZone: "left-ring", count: 2 }],
    substitutionCounts: [
      {
        expectedCode: "KeyS",
        expectedLabel: "S",
        actualCode: "KeyA",
        actualLabel: "A",
        count: 1,
      },
    ],
    weakKeys: [{ code: "KeyS", label: "S", count: 1 }],
    weakFingerZones: [{ fingerZone: "left-ring", count: 1 }],
    ...overrides,
  };
}

describe("buildSessionInsights", () => {
  it("aggregates substitution patterns and heatmap accuracy", () => {
    const insights = buildSessionInsights([
      buildSummary(),
      buildSummary({
        id: "session-2",
        completedAt: "2026-03-28T09:05:00.000Z",
        substitutionCounts: [
          {
            expectedCode: "KeyS",
            expectedLabel: "S",
            actualCode: "KeyA",
            actualLabel: "A",
            count: 2,
          },
        ],
      }),
    ]);

    expect(insights.commonSubstitutions[0]).toMatchObject({
      expectedCode: "KeyS",
      actualCode: "KeyA",
      count: 3,
    });
    expect(insights.timingHesitationCount).toBe(4);
    expect(insights.hesitantKeys[0]).toMatchObject({
      label: "S",
      count: 4,
    });
    expect(insights.recentProgress).toHaveLength(2);
    expect(insights.recentProgress[1]?.id).toBe("session-2");
    expect(insights.recentProgress[1]?.timingHesitationCount).toBe(2);

    const keyS = insights.heatmapEntries.find((entry) => entry.code === "KeyS");
    expect(keyS).toMatchObject({
      total: 8,
      mistakes: 2,
    });
    expect(keyS?.accuracy).toBe(75);
  });

  it("returns an idle heatmap when no sessions exist", () => {
    const insights = buildSessionInsights([]);

    expect(insights.sessionsCompleted).toBe(0);
    expect(insights.commonSubstitutions).toHaveLength(0);
    expect(insights.timingHesitationCount).toBe(0);
    expect(insights.heatmapEntries.some((entry) => entry.code === "KeyA")).toBe(true);
    expect(insights.heatmapEntries.every((entry) => entry.accuracy === null)).toBe(true);
  });
});
