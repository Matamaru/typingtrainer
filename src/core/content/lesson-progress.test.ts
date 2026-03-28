import { describe, expect, it } from "vitest";

import { lessonCatalog } from "./catalog";
import {
  buildLessonProgressMap,
  getNextPacedLesson,
  getRecommendedLesson,
  isLessonMastered,
} from "./lesson-progress";

describe("lesson progress", () => {
  it("requires mastery before unlocking the next untouched lesson", () => {
    const summaries = [
      {
        id: "session-1",
        profileId: "profile-1",
        lessonId: "en-home-row-foundations",
        lessonTitle: "Home Row Foundations",
        mode: "guided" as const,
        strictness: "strict" as const,
        startedAt: "2026-03-28T09:00:00.000Z",
        completedAt: "2026-03-28T09:02:00.000Z",
        durationMs: 120000,
        rawKeydownCount: 24,
        scoredKeystrokes: 20,
        correctKeystrokes: 18,
        backspaceCount: 0,
        accuracy: 90,
        shiftSideErrors: 0,
        likelyWrongFingerCount: 2,
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
      },
    ];

    const progressMap = buildLessonProgressMap(lessonCatalog, summaries);

    expect(progressMap.get("en-home-row-foundations")?.status).toBe("repeat");
    expect(progressMap.get("en-finger-map-anchors")?.status).toBe("locked");
  });

  it("unlocks the next lesson after a mastered attempt", () => {
    const homeRowLesson = lessonCatalog.find((lesson) => lesson.id === "en-home-row-foundations");

    expect(homeRowLesson).toBeDefined();
    expect(
      isLessonMastered(homeRowLesson!, {
        id: "session-2",
        profileId: "profile-1",
        lessonId: "en-home-row-foundations",
        lessonTitle: "Home Row Foundations",
        mode: "guided",
        strictness: "strict",
        startedAt: "2026-03-28T09:00:00.000Z",
        completedAt: "2026-03-28T09:02:00.000Z",
        durationMs: 120000,
        rawKeydownCount: 24,
        scoredKeystrokes: 20,
        correctKeystrokes: 20,
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
      }),
    ).toBe(true);

    const summaries = [
      {
        id: "session-2",
        profileId: "profile-1",
        lessonId: "en-home-row-foundations",
        lessonTitle: "Home Row Foundations",
        mode: "guided" as const,
        strictness: "strict" as const,
        startedAt: "2026-03-28T09:00:00.000Z",
        completedAt: "2026-03-28T09:02:00.000Z",
        durationMs: 120000,
        rawKeydownCount: 24,
        scoredKeystrokes: 20,
        correctKeystrokes: 20,
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
      },
    ];

    const progressMap = buildLessonProgressMap(lessonCatalog, summaries);

    expect(progressMap.get("en-home-row-foundations")?.status).toBe("mastered");
    expect(progressMap.get("en-finger-map-anchors")?.status).toBe("ready");
    expect(
      getNextPacedLesson(lessonCatalog, "en-home-row-foundations", progressMap)?.id,
    ).toBe("en-finger-map-anchors");
  });

  it("recommends the first repeat-needed lesson before fresh ready lessons", () => {
    const summaries = [
      {
        id: "session-3",
        profileId: "profile-1",
        lessonId: "en-home-row-foundations",
        lessonTitle: "Home Row Foundations",
        mode: "guided" as const,
        strictness: "strict" as const,
        startedAt: "2026-03-28T09:00:00.000Z",
        completedAt: "2026-03-28T09:02:00.000Z",
        durationMs: 120000,
        rawKeydownCount: 24,
        scoredKeystrokes: 20,
        correctKeystrokes: 19,
        backspaceCount: 0,
        accuracy: 95,
        shiftSideErrors: 0,
        likelyWrongFingerCount: 2,
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
      },
    ];

    const progressMap = buildLessonProgressMap(lessonCatalog, summaries);

    expect(getRecommendedLesson(lessonCatalog, progressMap)?.id).toBe("en-home-row-foundations");
  });
});
