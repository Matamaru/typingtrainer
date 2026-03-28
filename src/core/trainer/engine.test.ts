import { describe, expect, it } from "vitest";

import type { KeystrokeEvent, Lesson } from "../../shared/types/domain";
import {
  buildSessionSummary,
  createLessonRunState,
  processLessonKeystroke,
} from "./engine";

function buildLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: "lesson-1",
    title: "Test Lesson",
    summary: "A lesson for engine tests.",
    mode: "guided",
    kind: "technique",
    goals: [],
    prompts: [{ id: "prompt-1", text: "A" }],
    tags: [],
    estimatedMinutes: 1,
    ...overrides,
  };
}

function buildKeystroke(overrides: Partial<KeystrokeEvent> = {}): KeystrokeEvent {
  return {
    id: "stroke-1",
    timestamp: 1,
    phase: "keydown",
    expected: null,
    key: "a",
    code: "KeyA",
    location: "standard",
    shiftPressed: false,
    shiftSide: "none",
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    repeat: false,
    ...overrides,
  };
}

describe("processLessonKeystroke", () => {
  it("blocks cursor movement on a wrong key in strict mode", () => {
    const state = createLessonRunState(buildLesson({ prompts: [{ id: "p1", text: "a" }] }), "strict", "profile-1");

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "s",
        code: "KeyS",
      }),
    );

    expect(nextState.cursorIndex).toBe(0);
    expect(nextState.currentPromptInput).toBe("");
    expect(nextState.mistakes[0]?.type).toBe("wrong-key");
  });

  it("advances and logs the mistake in guided mode", () => {
    const state = createLessonRunState(buildLesson({ prompts: [{ id: "p1", text: "a" }] }), "guided", "profile-1");

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "s",
        code: "KeyS",
      }),
    );

    expect(nextState.cursorIndex).toBe(1);
    expect(nextState.currentPromptInput).toBe("s");
    expect(nextState.mistakes[0]?.type).toBe("wrong-key");
  });

  it("enforces opposite-hand shift for technique lessons in strict mode", () => {
    const state = createLessonRunState(buildLesson(), "strict", "profile-1");

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "A",
        code: "KeyA",
        shiftPressed: true,
        shiftSide: "left",
      }),
    );

    expect(nextState.cursorIndex).toBe(0);
    expect(nextState.mistakes[0]?.type).toBe("wrong-shift-side");
  });

  it("allows acronym exceptions such as README in strict technique mode", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "README" }] }),
      "strict",
      "profile-1",
    );

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "R",
        code: "KeyR",
        shiftPressed: true,
        shiftSide: "left",
      }),
    );

    expect(nextState.cursorIndex).toBe(1);
    expect(nextState.mistakes).toHaveLength(0);
  });
});

describe("buildSessionSummary", () => {
  it("builds a summary from a completed session", () => {
    const lesson = buildLesson({ prompts: [{ id: "p1", text: "a" }] });
    const state = createLessonRunState(lesson, "strict", "profile-1");
    const completed = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "a",
        code: "KeyA",
      }),
    );

    const summary = buildSessionSummary(completed);

    expect(summary?.lessonId).toBe(lesson.id);
    expect(summary?.scoredKeystrokes).toBe(1);
    expect(summary?.accuracy).toBe(100);
  });
});
