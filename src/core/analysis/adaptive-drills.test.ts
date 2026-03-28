import { describe, expect, it } from "vitest";

import type { SessionSummary } from "../../shared/types/domain";
import { buildAdaptiveLessonPlan } from "./adaptive-drills";

function buildSummary(overrides: Partial<SessionSummary> = {}): SessionSummary {
  return {
    id: "summary-1",
    profileId: "profile-1",
    lessonId: "lesson-1",
    lessonTitle: "Lesson 1",
    mode: "guided",
    strictness: "strict",
    startedAt: "2026-03-28T00:00:00.000Z",
    completedAt: "2026-03-28T00:01:00.000Z",
    durationMs: 60000,
    rawKeydownCount: 30,
    scoredKeystrokes: 24,
    correctKeystrokes: 20,
    backspaceCount: 0,
    accuracy: 83.3,
    shiftSideErrors: 0,
    likelyWrongFingerCount: 0,
    timingHesitationCount: 0,
    mistakeCounts: {},
    expectedKeyCounts: [{ code: "KeyS", label: "S", count: 10 }],
    mistakeKeyCounts: [{ code: "KeyS", label: "S", count: 4 }],
    expectedFingerZoneCounts: [{ fingerZone: "left-ring", count: 10 }],
    mistakeFingerZoneCounts: [{ fingerZone: "left-ring", count: 4 }],
    hesitationKeyCounts: [],
    hesitationFingerZoneCounts: [],
    substitutionCounts: [],
    weakKeys: [{ code: "KeyS", label: "S", count: 4 }],
    weakFingerZones: [{ fingerZone: "left-ring", count: 4 }],
    ...overrides,
  };
}

describe("buildAdaptiveLessonPlan", () => {
  it("falls back to a starter adaptive block with no history", () => {
    const plan = buildAdaptiveLessonPlan([], 0);

    expect(plan.lesson.mode).toBe("adaptive");
    expect(plan.blocks[0]?.title).toBe("Starter adaptive rhythm");
    expect(plan.lesson.prompts.length).toBeGreaterThan(0);
  });

  it("includes a shift block when shift-side mistakes exist", () => {
    const plan = buildAdaptiveLessonPlan([buildSummary({ shiftSideErrors: 3 })], 0);

    expect(plan.blocks.some((block) => block.type === "shift-side")).toBe(true);
  });

  it("includes a timing block when hesitation data exists", () => {
    const plan = buildAdaptiveLessonPlan(
      [
        buildSummary({
          timingHesitationCount: 2,
          hesitationKeyCounts: [{ code: "KeyS", label: "S", count: 2 }],
        }),
      ],
      0,
    );

    expect(plan.blocks.some((block) => block.type === "timing")).toBe(true);
    expect(plan.overview.timingHesitationCount).toBe(2);
  });

  it("builds target-key and finger-zone drills from stored weakness data", () => {
    const plan = buildAdaptiveLessonPlan(
      [
        buildSummary({
          likelyWrongFingerCount: 2,
          expectedKeyCounts: [{ code: "KeyS", label: "S", count: 12 }],
          mistakeKeyCounts: [{ code: "KeyS", label: "S", count: 5 }],
          expectedFingerZoneCounts: [{ fingerZone: "left-ring", count: 12 }],
          mistakeFingerZoneCounts: [{ fingerZone: "left-ring", count: 5 }],
        }),
      ],
      1,
    );

    expect(plan.blocks.some((block) => block.type === "key")).toBe(true);
    expect(plan.blocks.some((block) => block.type === "finger-zone")).toBe(true);
    expect(plan.lesson.summary).toContain("Reinforce target key");
  });

  it("generates code-shaped syntax drills from stored symbol substitutions", () => {
    const plan = buildAdaptiveLessonPlan(
      [
        buildSummary({
          lessonId: "c-register-rhythm",
          lessonTitle: "C Register Rhythm",
          mode: "coding",
          substitutionCounts: [
            {
              expectedCode: "BracketRight",
              expectedLabel: "]",
              actualCode: "Digit0",
              actualLabel: ")",
              count: 3,
            },
          ],
          mistakeCounts: { "delimiter-mismatch": 3 },
        }),
      ],
      0,
    );

    expect(plan.lesson.kind).toBe("code");
    const codeSyntaxBlock = plan.blocks.find((block) => block.type === "code-syntax");

    expect(codeSyntaxBlock).toBeDefined();
    expect(codeSyntaxBlock?.reason).toContain("swapping");
  });
});
