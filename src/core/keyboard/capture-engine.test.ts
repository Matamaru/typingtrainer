import { describe, expect, it } from "vitest";

import { KeyboardCaptureEngine, normalizeKeyLocation } from "./capture-engine";

function buildKeyboardEvent(overrides: Partial<Parameters<KeyboardCaptureEngine["processEvent"]>[0]>) {
  return {
    altKey: false,
    code: "KeyA",
    ctrlKey: false,
    key: "a",
    location: 0,
    metaKey: false,
    repeat: false,
    shiftKey: false,
    timeStamp: 1,
    type: "keydown" as const,
    ...overrides,
  };
}

describe("normalizeKeyLocation", () => {
  it("maps DOM keyboard locations to internal values", () => {
    expect(normalizeKeyLocation(0)).toBe("standard");
    expect(normalizeKeyLocation(1)).toBe("left");
    expect(normalizeKeyLocation(2)).toBe("right");
    expect(normalizeKeyLocation(3)).toBe("numpad");
  });
});

describe("KeyboardCaptureEngine", () => {
  it("tracks right shift across a following letter key", () => {
    const engine = new KeyboardCaptureEngine();

    engine.processEvent(
      buildKeyboardEvent({
        code: "ShiftRight",
        key: "Shift",
        location: 2,
        shiftKey: true,
      }),
    );

    const letterStroke = engine.processEvent(
      buildKeyboardEvent({
        code: "KeyA",
        key: "A",
        shiftKey: true,
        timeStamp: 2,
      }),
    );

    expect(letterStroke.shiftSide).toBe("right");
    expect(letterStroke.shiftPressed).toBe(true);
  });

  it("drops shiftPressed after releasing the last held shift key", () => {
    const engine = new KeyboardCaptureEngine();

    engine.processEvent(
      buildKeyboardEvent({
        code: "ShiftLeft",
        key: "Shift",
        location: 1,
        shiftKey: true,
      }),
    );

    const releaseStroke = engine.processEvent(
      buildKeyboardEvent({
        code: "ShiftLeft",
        key: "Shift",
        location: 1,
        shiftKey: false,
        timeStamp: 2,
        type: "keyup",
      }),
    );

    expect(releaseStroke.shiftSide).toBe("left");
    expect(releaseStroke.shiftPressed).toBe(false);
  });
});
