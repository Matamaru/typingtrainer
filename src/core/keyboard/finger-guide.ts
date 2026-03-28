import {
  getDisplayLabelForCode,
  getExpectedShiftSideForCharacter,
  getQwertyDescriptorForCharacter,
  usesAcronymException,
} from "./qwerty";
import type { FingerZone, ModifierSide } from "../../shared/types/domain";

export type FingerGuide = {
  character: string;
  characterLabel: string;
  keyLabel: string;
  keyCode: string;
  fingerZone: FingerZone;
  fingerZoneLabel: string;
  handLabel: string;
  rowLabel: string;
  shiftSide: ModifierSide | null;
  shiftHint: string | null;
  returnCue: string | null;
};

function formatFingerZoneLabel(fingerZone: FingerZone) {
  return fingerZone
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function getRowLabel(row: number) {
  switch (row) {
    case 0:
      return "Number row";
    case 1:
      return "Top row";
    case 2:
      return "Home row";
    case 3:
      return "Bottom row";
    case 4:
      return "Thumb row";
    default:
      return "Keyboard";
  }
}

function getCharacterLabel(character: string) {
  if (character === " ") {
    return "Space";
  }

  return character;
}

function getShiftHint(
  promptText: string,
  cursorIndex: number,
  character: string,
  shiftSide: ModifierSide | null,
) {
  if (!shiftSide) {
    return null;
  }

  if (usesAcronymException(promptText, cursorIndex) && /[A-Z]/.test(character)) {
    return "Acronym exception active. Same-side Shift is allowed here.";
  }

  return `Use ${shiftSide} Shift for this character.`;
}

function getReturnCue(row: number, keyCode: string) {
  if (row === 2 || keyCode === "Space") {
    return null;
  }

  return "Make the reach, then return to home row.";
}

export function getFingerGuide(promptText: string, cursorIndex: number): FingerGuide | null {
  const character = promptText[cursorIndex] ?? null;

  if (!character) {
    return null;
  }

  const descriptor = getQwertyDescriptorForCharacter(character);

  if (!descriptor) {
    return null;
  }

  const shiftSide = getExpectedShiftSideForCharacter(character);

  return {
    character,
    characterLabel: getCharacterLabel(character),
    keyLabel: getDisplayLabelForCode(descriptor.code),
    keyCode: descriptor.code,
    fingerZone: descriptor.fingerZone,
    fingerZoneLabel: formatFingerZoneLabel(descriptor.fingerZone),
    handLabel: `${descriptor.hand[0]?.toUpperCase()}${descriptor.hand.slice(1)} hand`,
    rowLabel: getRowLabel(descriptor.row),
    shiftSide,
    shiftHint: getShiftHint(promptText, cursorIndex, character, shiftSide),
    returnCue: getReturnCue(descriptor.row, descriptor.code),
  };
}
