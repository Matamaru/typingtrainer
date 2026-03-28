import { describe, expect, it } from "vitest";

import { getLessonsForStage, getLessonById, isLessonUnlocked } from "./catalog";

describe("content catalog", () => {
  it("keeps the guided stage order stable", () => {
    const stageOneLessons = getLessonsForStage(1);
    const stageThreeLessons = getLessonsForStage(3);

    expect(stageOneLessons.map((lesson) => lesson.id)).toEqual([
      "en-home-row-foundations",
      "en-finger-map-anchors",
    ]);
    expect(stageThreeLessons.map((lesson) => lesson.id)).toEqual([
      "en-capitalization-ladders",
      "en-punctuation-and-brackets",
      "en-modifier-control",
    ]);
  });

  it("locks later lessons until prerequisites are completed", () => {
    const capitalizationLesson = getLessonById("en-capitalization-ladders");

    expect(capitalizationLesson).toBeDefined();
    expect(isLessonUnlocked(capitalizationLesson!, new Set())).toBe(false);
    expect(isLessonUnlocked(capitalizationLesson!, new Set(["en-number-row-rhythm"]))).toBe(true);
  });
});
