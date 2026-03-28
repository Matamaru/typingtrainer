import { describe, expect, it } from "vitest";

import {
  isKeyboardCaptureTarget,
  shouldBypassKeyboardCapture,
  shouldIgnoreEditableTargetForGlobalShortcut,
} from "./keyboard";

describe("keyboard helpers", () => {
  it("treats keyboard capture textareas as allowed shortcut targets", () => {
    const normalInput = document.createElement("input");
    const captureInput = document.createElement("textarea");

    captureInput.dataset.keyboardCapture = "true";

    expect(shouldIgnoreEditableTargetForGlobalShortcut(normalInput)).toBe(true);
    expect(isKeyboardCaptureTarget(captureInput)).toBe(true);
    expect(shouldIgnoreEditableTargetForGlobalShortcut(captureInput)).toBe(false);
  });

  it("bypasses browser and desktop shortcut chords", () => {
    expect(
      shouldBypassKeyboardCapture({
        key: "l",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
    expect(
      shouldBypassKeyboardCapture({
        key: "ArrowLeft",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
    expect(
      shouldBypassKeyboardCapture({
        key: "F5",
        ctrlKey: false,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(true);
  });

  it("does not bypass AltGraph character composition", () => {
    expect(
      shouldBypassKeyboardCapture({
        key: "@",
        ctrlKey: false,
        metaKey: false,
        altKey: true,
        getModifierState: (modifier) => modifier === "AltGraph",
      }),
    ).toBe(false);
  });

  it("keeps ctrl/alt backspace inside capture so chunk deletion can be trained", () => {
    expect(
      shouldBypassKeyboardCapture({
        key: "Backspace",
        ctrlKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe(false);
    expect(
      shouldBypassKeyboardCapture({
        key: "Backspace",
        ctrlKey: false,
        metaKey: false,
        altKey: true,
      }),
    ).toBe(false);
  });
});
