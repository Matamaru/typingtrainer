import type { KeyLocation, KeystrokeEvent, ModifierSide } from "../../shared/types/domain";
import type { KeyboardEventLike } from "./types";

function isShiftCode(code: string) {
  return code === "ShiftLeft" || code === "ShiftRight";
}

function locationToSide(location: KeyLocation): Exclude<ModifierSide, "none" | "both"> | null {
  if (location === "left") {
    return "left";
  }

  if (location === "right") {
    return "right";
  }

  return null;
}

function shiftSideFromSet(activeShiftSides: Set<"left" | "right">): ModifierSide {
  if (activeShiftSides.size === 0) {
    return "none";
  }

  if (activeShiftSides.size === 2) {
    return "both";
  }

  return activeShiftSides.has("left") ? "left" : "right";
}

export function normalizeKeyLocation(location: number): KeyLocation {
  switch (location) {
    case 1:
      return "left";
    case 2:
      return "right";
    case 3:
      return "numpad";
    default:
      return "standard";
  }
}

export class KeyboardCaptureEngine {
  private activeShiftSides = new Set<"left" | "right">();

  processEvent(event: KeyboardEventLike): KeystrokeEvent {
    const phase = event.type;
    const location = normalizeKeyLocation(event.location);
    const shiftLocationSide = locationToSide(location);

    if (isShiftCode(event.code) && phase === "keyup" && shiftLocationSide) {
      this.activeShiftSides.delete(shiftLocationSide);
    }

    if (isShiftCode(event.code) && phase === "keydown" && shiftLocationSide) {
      this.activeShiftSides.add(shiftLocationSide);
    }

    const activeShiftSide = shiftSideFromSet(this.activeShiftSides);
    const shiftSide = isShiftCode(event.code)
      ? shiftLocationSide ?? activeShiftSide
      : activeShiftSide;
    const shiftPressed = isShiftCode(event.code)
      ? phase === "keydown" || activeShiftSide !== "none"
      : event.shiftKey || activeShiftSide !== "none";

    return {
      id: `${event.timeStamp}-${event.code}-${phase}`,
      timestamp: event.timeStamp,
      phase,
      expected: null,
      key: event.key,
      code: event.code,
      location,
      shiftPressed,
      shiftSide,
      altKey: event.altKey,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      repeat: event.repeat,
    };
  }
}
