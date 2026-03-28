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

  it("tags neighboring same-hand misses as likely wrong-finger errors", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "s" }] }),
      "strict",
      "profile-1",
    );

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "a",
        code: "KeyA",
      }),
    );

    expect(nextState.mistakes[0]?.type).toBe("wrong-key");
    expect(nextState.mistakes[0]?.tags).toContain("likely-wrong-finger");
  });

  it("does not tag far misses as likely wrong-finger errors", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "s" }] }),
      "strict",
      "profile-1",
    );

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "p",
        code: "KeyP",
      }),
    );

    expect(nextState.mistakes[0]?.tags ?? []).not.toContain("likely-wrong-finger");
  });

  it("tags paired-delimiter slips inside code lessons", () => {
    const state = createLessonRunState(
      buildLesson({
        mode: "coding",
        kind: "code",
        prompts: [{ id: "p1", text: ")" }],
      }),
      "strict",
      "profile-1",
    );

    const nextState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "]",
        code: "BracketRight",
        shiftPressed: true,
        shiftSide: "left",
      }),
    );

    expect(nextState.mistakes[0]?.type).toBe("wrong-key");
    expect(nextState.mistakes[0]?.tags).toContain("delimiter-mismatch");
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

  it("logs timing hesitation on long pauses within a prompt", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "aa" }] }),
      "strict",
      "profile-1",
    );

    const firstState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "a",
        code: "KeyA",
        timestamp: 1000,
      }),
    );
    const nextState = processLessonKeystroke(
      firstState,
      buildKeystroke({
        key: "a",
        code: "KeyA",
        timestamp: 2800,
      }),
    );

    expect(nextState.mistakes.some((mistake) => mistake.type === "timing-hesitation")).toBe(true);
  });

  it("allows chunk deletion with ctrl-backspace outside strict mode", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "steady rhythm again" }] }),
      "guided",
      "profile-1",
    );

    const typedState = {
      ...state,
      cursorIndex: "steady rhythm again".length,
      currentPromptInput: "steady rhythm again",
    };

    const nextState = processLessonKeystroke(
      typedState,
      buildKeystroke({
        key: "Backspace",
        code: "Backspace",
        ctrlKey: true,
      }),
    );

    expect(nextState.cursorIndex).toBe("steady rhythm ".length);
    expect(nextState.currentPromptInput).toBe("steady rhythm ");
    expect(nextState.backspaceCount).toBe(1);
    expect(nextState.lastFeedback.message).toContain("Chunk delete");
  });

  it("keeps chunk deletion blocked in strict mode", () => {
    const state = createLessonRunState(
      buildLesson({ prompts: [{ id: "p1", text: "steady rhythm again" }] }),
      "strict",
      "profile-1",
    );

    const typedState = {
      ...state,
      cursorIndex: "steady rhythm again".length,
      currentPromptInput: "steady rhythm again",
    };

    const nextState = processLessonKeystroke(
      typedState,
      buildKeystroke({
        key: "Backspace",
        code: "Backspace",
        ctrlKey: true,
      }),
    );

    expect(nextState.cursorIndex).toBe("steady rhythm again".length);
    expect(nextState.currentPromptInput).toBe("steady rhythm again");
    expect(nextState.lastFeedback.message).toContain("Strict mode keeps the cursor anchored");
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
    expect(summary?.expectedKeyCounts[0]?.code).toBe("KeyA");
  });

  it("counts likely wrong-finger mistakes against the expected key and finger zone", () => {
    const lesson = buildLesson({ prompts: [{ id: "p1", text: "s" }] });
    const state = createLessonRunState(lesson, "strict", "profile-1");
    const completed = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "a",
        code: "KeyA",
      }),
    );

    const summary = buildSessionSummary({
      ...completed,
      session: {
        ...completed.session,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    });

    expect(summary?.likelyWrongFingerCount).toBe(1);
    expect(summary?.mistakeCounts["wrong-key"]).toBe(1);
    expect(summary?.mistakeCounts["likely-wrong-finger"]).toBe(1);
    expect(summary?.mistakeKeyCounts[0]).toMatchObject({
      code: "KeyS",
      label: "S",
      count: 1,
    });
    expect(summary?.mistakeFingerZoneCounts[0]).toMatchObject({
      fingerZone: "left-ring",
      count: 1,
    });
    expect(summary?.timingHesitationCount).toBe(0);
    expect(summary?.substitutionCounts[0]).toMatchObject({
      expectedCode: "KeyS",
      expectedLabel: "S",
      actualCode: "KeyA",
      actualLabel: "A",
      count: 1,
    });
  });

  it("stores timing hesitation separately from wrong-key weakness counts", () => {
    const lesson = buildLesson({ prompts: [{ id: "p1", text: "aa" }] });
    const state = createLessonRunState(lesson, "strict", "profile-1");
    const firstState = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "a",
        code: "KeyA",
        timestamp: 1000,
      }),
    );
    const completed = processLessonKeystroke(
      firstState,
      buildKeystroke({
        key: "a",
        code: "KeyA",
        timestamp: 3000,
      }),
    );

    const summary = buildSessionSummary(completed);

    expect(summary?.timingHesitationCount).toBe(1);
    expect(summary?.hesitationKeyCounts[0]).toMatchObject({
      code: "KeyA",
      label: "A",
      count: 1,
    });
    expect(summary?.mistakeKeyCounts).toHaveLength(0);
  });

  it("counts delimiter mismatch tags for completed code sessions", () => {
    const lesson = buildLesson({
      mode: "coding",
      kind: "code",
      prompts: [{ id: "p1", text: ")" }],
    });
    const state = createLessonRunState(lesson, "strict", "profile-1");
    const completed = processLessonKeystroke(
      state,
      buildKeystroke({
        key: "]",
        code: "BracketRight",
        shiftPressed: true,
        shiftSide: "left",
      }),
    );

    const summary = buildSessionSummary({
      ...completed,
      session: {
        ...completed.session,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
    });

    expect(summary?.mistakeCounts["delimiter-mismatch"]).toBe(1);
    expect(summary?.substitutionCounts[0]).toMatchObject({
      expectedCode: "Digit0",
      actualCode: "BracketRight",
      count: 1,
    });
  });
});
