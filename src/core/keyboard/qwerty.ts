import type { FingerZone, ModifierSide } from "../../shared/types/domain";

type Hand = "left" | "right";

export type QwertyKeyDescriptor = {
  code: string;
  hand: Hand;
  fingerZone: FingerZone;
  base: string;
  shifted?: string;
  row: number;
  x: number;
};

const keyDescriptors: QwertyKeyDescriptor[] = [
  { code: "Backquote", hand: "left", fingerZone: "left-pinky", base: "`", shifted: "~", row: 0, x: 0 },
  { code: "Digit1", hand: "left", fingerZone: "left-pinky", base: "1", shifted: "!", row: 0, x: 1 },
  { code: "Digit2", hand: "left", fingerZone: "left-ring", base: "2", shifted: "@", row: 0, x: 2 },
  { code: "Digit3", hand: "left", fingerZone: "left-middle", base: "3", shifted: "#", row: 0, x: 3 },
  { code: "Digit4", hand: "left", fingerZone: "left-index", base: "4", shifted: "$", row: 0, x: 4 },
  { code: "Digit5", hand: "left", fingerZone: "left-index", base: "5", shifted: "%", row: 0, x: 5 },
  { code: "Digit6", hand: "right", fingerZone: "right-index", base: "6", shifted: "^", row: 0, x: 6 },
  { code: "Digit7", hand: "right", fingerZone: "right-index", base: "7", shifted: "&", row: 0, x: 7 },
  { code: "Digit8", hand: "right", fingerZone: "right-middle", base: "8", shifted: "*", row: 0, x: 8 },
  { code: "Digit9", hand: "right", fingerZone: "right-ring", base: "9", shifted: "(", row: 0, x: 9 },
  { code: "Digit0", hand: "right", fingerZone: "right-pinky", base: "0", shifted: ")", row: 0, x: 10 },
  { code: "Minus", hand: "right", fingerZone: "right-pinky", base: "-", shifted: "_", row: 0, x: 11 },
  { code: "Equal", hand: "right", fingerZone: "right-pinky", base: "=", shifted: "+", row: 0, x: 12 },
  { code: "KeyQ", hand: "left", fingerZone: "left-pinky", base: "q", row: 1, x: 1.5 },
  { code: "KeyW", hand: "left", fingerZone: "left-ring", base: "w", row: 1, x: 2.5 },
  { code: "KeyE", hand: "left", fingerZone: "left-middle", base: "e", row: 1, x: 3.5 },
  { code: "KeyR", hand: "left", fingerZone: "left-index", base: "r", row: 1, x: 4.5 },
  { code: "KeyT", hand: "left", fingerZone: "left-index", base: "t", row: 1, x: 5.5 },
  { code: "KeyY", hand: "right", fingerZone: "right-index", base: "y", row: 1, x: 6.5 },
  { code: "KeyU", hand: "right", fingerZone: "right-index", base: "u", row: 1, x: 7.5 },
  { code: "KeyI", hand: "right", fingerZone: "right-middle", base: "i", row: 1, x: 8.5 },
  { code: "KeyO", hand: "right", fingerZone: "right-ring", base: "o", row: 1, x: 9.5 },
  { code: "KeyP", hand: "right", fingerZone: "right-pinky", base: "p", row: 1, x: 10.5 },
  { code: "BracketLeft", hand: "right", fingerZone: "right-pinky", base: "[", shifted: "{", row: 1, x: 11.5 },
  { code: "BracketRight", hand: "right", fingerZone: "right-pinky", base: "]", shifted: "}", row: 1, x: 12.5 },
  { code: "Backslash", hand: "right", fingerZone: "right-pinky", base: "\\", shifted: "|", row: 1, x: 13.5 },
  { code: "IntlBackslash", hand: "left", fingerZone: "left-pinky", base: "\\", shifted: "|", row: 3, x: 1.25 },
  { code: "KeyA", hand: "left", fingerZone: "left-pinky", base: "a", row: 2, x: 1.75 },
  { code: "KeyS", hand: "left", fingerZone: "left-ring", base: "s", row: 2, x: 2.75 },
  { code: "KeyD", hand: "left", fingerZone: "left-middle", base: "d", row: 2, x: 3.75 },
  { code: "KeyF", hand: "left", fingerZone: "left-index", base: "f", row: 2, x: 4.75 },
  { code: "KeyG", hand: "left", fingerZone: "left-index", base: "g", row: 2, x: 5.75 },
  { code: "KeyH", hand: "right", fingerZone: "right-index", base: "h", row: 2, x: 6.75 },
  { code: "KeyJ", hand: "right", fingerZone: "right-index", base: "j", row: 2, x: 7.75 },
  { code: "KeyK", hand: "right", fingerZone: "right-middle", base: "k", row: 2, x: 8.75 },
  { code: "KeyL", hand: "right", fingerZone: "right-ring", base: "l", row: 2, x: 9.75 },
  { code: "Semicolon", hand: "right", fingerZone: "right-pinky", base: ";", shifted: ":", row: 2, x: 10.75 },
  { code: "Quote", hand: "right", fingerZone: "right-pinky", base: "'", shifted: "\"", row: 2, x: 11.75 },
  { code: "KeyZ", hand: "left", fingerZone: "left-pinky", base: "z", row: 3, x: 2.25 },
  { code: "KeyX", hand: "left", fingerZone: "left-ring", base: "x", row: 3, x: 3.25 },
  { code: "KeyC", hand: "left", fingerZone: "left-middle", base: "c", row: 3, x: 4.25 },
  { code: "KeyV", hand: "left", fingerZone: "left-index", base: "v", row: 3, x: 5.25 },
  { code: "KeyB", hand: "left", fingerZone: "left-index", base: "b", row: 3, x: 6.25 },
  { code: "KeyN", hand: "right", fingerZone: "right-index", base: "n", row: 3, x: 7.25 },
  { code: "KeyM", hand: "right", fingerZone: "right-index", base: "m", row: 3, x: 8.25 },
  { code: "Comma", hand: "right", fingerZone: "right-middle", base: ",", shifted: "<", row: 3, x: 9.25 },
  { code: "Period", hand: "right", fingerZone: "right-ring", base: ".", shifted: ">", row: 3, x: 10.25 },
  { code: "Slash", hand: "right", fingerZone: "right-pinky", base: "/", shifted: "?", row: 3, x: 11.25 },
  { code: "Space", hand: "left", fingerZone: "left-thumb", base: " ", row: 4, x: 6 },
];

const descriptorsByCode = new Map(keyDescriptors.map((descriptor) => [descriptor.code, descriptor]));

const charToDescriptor = new Map<string, QwertyKeyDescriptor>();

for (const descriptor of keyDescriptors) {
  charToDescriptor.set(descriptor.base, descriptor);

  if (descriptor.shifted) {
    charToDescriptor.set(descriptor.shifted, descriptor);
  }

  if (/^[a-z]$/.test(descriptor.base)) {
    charToDescriptor.set(descriptor.base.toUpperCase(), descriptor);
  }
}

export function getKeyDescriptor(code: string) {
  return descriptorsByCode.get(code);
}

export function getAllQwertyKeyDescriptors() {
  return [...keyDescriptors];
}

export function getDisplayLabelForCode(code: string) {
  const descriptor = getKeyDescriptor(code);

  if (!descriptor) {
    return code;
  }

  if (/^[a-z]$/.test(descriptor.base)) {
    return descriptor.base.toUpperCase();
  }

  if (descriptor.code === "Space") {
    return "Space";
  }

  return descriptor.base;
}

export function getFingerZoneForCode(code: string) {
  return getKeyDescriptor(code)?.fingerZone;
}

export function getHandForCode(code: string) {
  return getKeyDescriptor(code)?.hand;
}

export function getQwertyDescriptorForCharacter(character: string) {
  return charToDescriptor.get(character);
}

export function areQwertyCodesNeighboring(expectedCode: string, actualCode: string) {
  const expectedDescriptor = getKeyDescriptor(expectedCode);
  const actualDescriptor = getKeyDescriptor(actualCode);

  if (!expectedDescriptor || !actualDescriptor) {
    return false;
  }

  const rowDistance = Math.abs(expectedDescriptor.row - actualDescriptor.row);
  const xDistance = Math.abs(expectedDescriptor.x - actualDescriptor.x);
  const euclideanDistance = Math.hypot(rowDistance, xDistance);

  return euclideanDistance <= 1.4;
}

export function getExpectedShiftSideForCharacter(character: string): ModifierSide | null {
  const descriptor = getQwertyDescriptorForCharacter(character);

  if (!descriptor) {
    return null;
  }

  const requiresShift =
    /^[A-Z]$/.test(character) || (!!descriptor.shifted && descriptor.shifted === character);

  if (!requiresShift) {
    return null;
  }

  return descriptor.hand === "left" ? "right" : "left";
}

export function usesAcronymException(promptText: string, index: number) {
  const character = promptText[index];

  if (!character || !/[A-Z]/.test(character)) {
    return false;
  }

  let start = index;
  let end = index;

  while (start > 0 && /[A-Z]/.test(promptText[start - 1]!)) {
    start -= 1;
  }

  while (end + 1 < promptText.length && /[A-Z]/.test(promptText[end + 1]!)) {
    end += 1;
  }

  return end - start + 1 >= 2;
}
