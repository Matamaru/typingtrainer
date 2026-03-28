import { describe, expect, it } from "vitest";

import {
  getCodingLessons,
  getLessonsForStage,
  getLessonById,
  getNextLesson,
  isLessonUnlocked,
} from "./catalog";

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
      "en-symbol-ladders",
      "en-edge-symbols",
      "en-punctuation-and-brackets",
      "en-modifier-control",
    ]);
    expect(getLessonsForStage(4).map((lesson) => lesson.id)).toEqual([
      "en-calm-prose-carryover",
      "en-correction-control",
      "de-ruhe-und-praezision",
    ]);
  });

  it("locks later lessons until prerequisites are completed", () => {
    const capitalizationLesson = getLessonById("en-capitalization-ladders");

    expect(capitalizationLesson).toBeDefined();
    expect(isLessonUnlocked(capitalizationLesson!, new Set())).toBe(false);
    expect(isLessonUnlocked(capitalizationLesson!, new Set(["en-number-row-rhythm"]))).toBe(true);
  });

  it("includes naming-focused coding lessons in sequence order", () => {
    const codingLessons = getCodingLessons();

    expect(codingLessons.map((lesson) => lesson.id)).toEqual([
      "python-function-flow",
      "python-identifier-rhythm",
      "python-polling-function",
      "micropython-pin-rhythm",
      "micropython-state-names",
      "micropython-blink-loop",
      "c-register-rhythm",
      "c-embedded-identifiers",
      "c-poll-loop",
    ]);
    expect(codingLessons[1]?.prompts[0]?.notes).toContain("snake_case");
    expect(codingLessons[2]?.prompts).toHaveLength(4);
  });

  it("returns the next unlocked lesson in catalog order", () => {
    const completedLessonIds = new Set([
      "en-home-row-foundations",
      "en-finger-map-anchors",
      "en-top-row-reach",
      "en-bottom-row-reach",
      "en-number-row-rhythm",
      "en-capitalization-ladders",
      "en-punctuation-and-brackets",
      "en-modifier-control",
      "en-calm-prose-carryover",
    ]);

    expect(getNextLesson("en-home-row-foundations", completedLessonIds)?.id).toBe(
      "en-finger-map-anchors",
    );
    expect(getNextLesson("en-calm-prose-carryover", completedLessonIds)?.id).toBe(
      "en-correction-control",
    );
  });
});
