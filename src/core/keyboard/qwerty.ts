import type { FingerZone, ModifierSide } from "../../shared/types/domain";

type Hand = "left" | "right";

type KeyDescriptor = {
  code: string;
  hand: Hand;
  fingerZone: FingerZone;
  base: string;
  shifted?: string;
};

const keyDescriptors: KeyDescriptor[] = [
  { code: "Backquote", hand: "left", fingerZone: "left-pinky", base: "`", shifted: "~" },
  { code: "Digit1", hand: "left", fingerZone: "left-pinky", base: "1", shifted: "!" },
  { code: "Digit2", hand: "left", fingerZone: "left-ring", base: "2", shifted: "@" },
  { code: "Digit3", hand: "left", fingerZone: "left-middle", base: "3", shifted: "#" },
  { code: "Digit4", hand: "left", fingerZone: "left-index", base: "4", shifted: "$" },
  { code: "Digit5", hand: "left", fingerZone: "left-index", base: "5", shifted: "%" },
  { code: "Digit6", hand: "right", fingerZone: "right-index", base: "6", shifted: "^" },
  { code: "Digit7", hand: "right", fingerZone: "right-index", base: "7", shifted: "&" },
  { code: "Digit8", hand: "right", fingerZone: "right-middle", base: "8", shifted: "*" },
  { code: "Digit9", hand: "right", fingerZone: "right-ring", base: "9", shifted: "(" },
  { code: "Digit0", hand: "right", fingerZone: "right-pinky", base: "0", shifted: ")" },
  { code: "Minus", hand: "right", fingerZone: "right-pinky", base: "-", shifted: "_" },
  { code: "Equal", hand: "right", fingerZone: "right-pinky", base: "=", shifted: "+" },
  { code: "KeyQ", hand: "left", fingerZone: "left-pinky", base: "q" },
  { code: "KeyW", hand: "left", fingerZone: "left-ring", base: "w" },
  { code: "KeyE", hand: "left", fingerZone: "left-middle", base: "e" },
  { code: "KeyR", hand: "left", fingerZone: "left-index", base: "r" },
  { code: "KeyT", hand: "left", fingerZone: "left-index", base: "t" },
  { code: "KeyY", hand: "right", fingerZone: "right-index", base: "y" },
  { code: "KeyU", hand: "right", fingerZone: "right-index", base: "u" },
  { code: "KeyI", hand: "right", fingerZone: "right-middle", base: "i" },
  { code: "KeyO", hand: "right", fingerZone: "right-ring", base: "o" },
  { code: "KeyP", hand: "right", fingerZone: "right-pinky", base: "p" },
  { code: "BracketLeft", hand: "right", fingerZone: "right-pinky", base: "[", shifted: "{" },
  { code: "BracketRight", hand: "right", fingerZone: "right-pinky", base: "]", shifted: "}" },
  { code: "Backslash", hand: "right", fingerZone: "right-pinky", base: "\\", shifted: "|" },
  { code: "IntlBackslash", hand: "left", fingerZone: "left-pinky", base: "\\", shifted: "|" },
  { code: "KeyA", hand: "left", fingerZone: "left-pinky", base: "a" },
  { code: "KeyS", hand: "left", fingerZone: "left-ring", base: "s" },
  { code: "KeyD", hand: "left", fingerZone: "left-middle", base: "d" },
  { code: "KeyF", hand: "left", fingerZone: "left-index", base: "f" },
  { code: "KeyG", hand: "left", fingerZone: "left-index", base: "g" },
  { code: "KeyH", hand: "right", fingerZone: "right-index", base: "h" },
  { code: "KeyJ", hand: "right", fingerZone: "right-index", base: "j" },
  { code: "KeyK", hand: "right", fingerZone: "right-middle", base: "k" },
  { code: "KeyL", hand: "right", fingerZone: "right-ring", base: "l" },
  { code: "Semicolon", hand: "right", fingerZone: "right-pinky", base: ";", shifted: ":" },
  { code: "Quote", hand: "right", fingerZone: "right-pinky", base: "'", shifted: "\"" },
  { code: "KeyZ", hand: "left", fingerZone: "left-pinky", base: "z" },
  { code: "KeyX", hand: "left", fingerZone: "left-ring", base: "x" },
  { code: "KeyC", hand: "left", fingerZone: "left-middle", base: "c" },
  { code: "KeyV", hand: "left", fingerZone: "left-index", base: "v" },
  { code: "KeyB", hand: "left", fingerZone: "left-index", base: "b" },
  { code: "KeyN", hand: "right", fingerZone: "right-index", base: "n" },
  { code: "KeyM", hand: "right", fingerZone: "right-index", base: "m" },
  { code: "Comma", hand: "right", fingerZone: "right-middle", base: ",", shifted: "<" },
  { code: "Period", hand: "right", fingerZone: "right-ring", base: ".", shifted: ">" },
  { code: "Slash", hand: "right", fingerZone: "right-pinky", base: "/", shifted: "?" },
  { code: "Space", hand: "left", fingerZone: "left-thumb", base: " " },
];

const descriptorsByCode = new Map(keyDescriptors.map((descriptor) => [descriptor.code, descriptor]));

const charToDescriptor = new Map<string, KeyDescriptor>();

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

export function getFingerZoneForCode(code: string) {
  return getKeyDescriptor(code)?.fingerZone;
}

export function getHandForCode(code: string) {
  return getKeyDescriptor(code)?.hand;
}

export function getQwertyDescriptorForCharacter(character: string) {
  return charToDescriptor.get(character);
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
