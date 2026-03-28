import { describe, expect, it } from "vitest";

import type { KeystrokeEvent } from "../../shared/types/domain";
import { shortcutDrills, shortcutStrokeMatchesDrill } from "./shortcut-trainer";

function buildKeystroke(overrides: Partial<KeystrokeEvent> = {}): KeystrokeEvent {
  return {
    id: "stroke-1",
    timestamp: 1,
    phase: "keydown",
    expected: null,
    key: "Backspace",
    code: "Backspace",
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

describe("shortcut trainer", () => {
  it("accepts both ctrl-backspace and alt-backspace for word deletion", () => {
    const drill = shortcutDrills.find((entry) => entry.id === "delete-last-word");

    expect(drill).toBeDefined();
    expect(
      shortcutStrokeMatchesDrill(
        buildKeystroke({
          ctrlKey: true,
        }),
        drill!,
      ),
    ).toBe(true);
    expect(
      shortcutStrokeMatchesDrill(
        buildKeystroke({
          altKey: true,
        }),
        drill!,
      ),
    ).toBe(true);
  });

  it("matches ctrl-shift-arrow word selection drills", () => {
    const drill = shortcutDrills.find((entry) => entry.id === "select-word-left");

    expect(drill).toBeDefined();
    expect(
      shortcutStrokeMatchesDrill(
        buildKeystroke({
          code: "ArrowLeft",
          key: "ArrowLeft",
          ctrlKey: true,
          shiftPressed: true,
        }),
        drill!,
      ),
    ).toBe(true);
    expect(
      shortcutStrokeMatchesDrill(
        buildKeystroke({
          code: "ArrowLeft",
          key: "ArrowLeft",
          ctrlKey: true,
        }),
        drill!,
      ),
    ).toBe(false);
  });
});
