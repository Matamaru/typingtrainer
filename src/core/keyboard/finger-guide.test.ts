import { describe, expect, it } from "vitest";

import { getFingerGuide } from "./finger-guide";

describe("getFingerGuide", () => {
  it("maps a normal home-row letter to the expected finger information", () => {
    const guide = getFingerGuide("sad", 1);

    expect(guide).toMatchObject({
      character: "a",
      characterLabel: "a",
      keyLabel: "A",
      keyCode: "KeyA",
      fingerZone: "left-pinky",
      fingerZoneLabel: "Left Pinky",
      handLabel: "Left hand",
      rowLabel: "Home row",
      shiftSide: null,
      returnCue: null,
    });
  });

  it("provides shift guidance and a return cue for uppercase reach keys", () => {
    const guide = getFingerGuide("Aq", 1);

    expect(guide).toMatchObject({
      character: "q",
      keyCode: "KeyQ",
      rowLabel: "Top row",
      returnCue: "Make the reach, then return to home row.",
    });

    const uppercaseGuide = getFingerGuide("A", 0);
    expect(uppercaseGuide?.shiftHint).toBe("Use right Shift for this character.");
  });

  it("recognizes acronym exceptions for shift guidance", () => {
    const guide = getFingerGuide("README", 0);

    expect(guide?.shiftHint).toBe("Acronym exception active. Same-side Shift is allowed here.");
  });
});
