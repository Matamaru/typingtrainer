import type { KeystrokeEvent } from "../../shared/types/domain";

export type ShortcutExpectation = {
  code: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
};

export type ShortcutPreview = {
  text: string;
  cursorIndex: number;
  selectionStart?: number;
  selectionEnd?: number;
};

export type ShortcutDrill = {
  id: string;
  title: string;
  shortcutLabel: string;
  description: string;
  accepted: ShortcutExpectation[];
  before: ShortcutPreview;
  after: ShortcutPreview;
};

function createShortcutPreview(
  text: string,
  cursorIndex: number,
  selectionStart?: number,
  selectionEnd?: number,
): ShortcutPreview {
  return {
    text,
    cursorIndex,
    selectionStart,
    selectionEnd,
  };
}

const sampleLine = "steady correction keeps the typing rhythm clean";

const wordStart = sampleLine.indexOf("typing");
const wordEnd = wordStart + "typing".length;

export const shortcutDrills: ShortcutDrill[] = [
  {
    id: "delete-last-word",
    title: "Delete Previous Word",
    shortcutLabel: "Ctrl+Backspace / Alt+Backspace",
    description: "Remove the previous word in one chunk instead of pecking backward character by character.",
    accepted: [
      { code: "Backspace", ctrlKey: true },
      { code: "Backspace", altKey: true },
    ],
    before: createShortcutPreview(sampleLine, sampleLine.length),
    after: createShortcutPreview("steady correction keeps the typing rhythm ", "steady correction keeps the typing rhythm ".length),
  },
  {
    id: "jump-word-left",
    title: "Jump Left By Word",
    shortcutLabel: "Ctrl+ArrowLeft",
    description: "Move back to the previous word boundary without touching the mouse.",
    accepted: [{ code: "ArrowLeft", ctrlKey: true }],
    before: createShortcutPreview(sampleLine, wordEnd),
    after: createShortcutPreview(sampleLine, wordStart),
  },
  {
    id: "jump-word-right",
    title: "Jump Right By Word",
    shortcutLabel: "Ctrl+ArrowRight",
    description: "Move forward by word so navigation stays keyboard-first.",
    accepted: [{ code: "ArrowRight", ctrlKey: true }],
    before: createShortcutPreview(sampleLine, wordStart),
    after: createShortcutPreview(sampleLine, wordEnd),
  },
  {
    id: "select-word-left",
    title: "Select Previous Word",
    shortcutLabel: "Ctrl+Shift+ArrowLeft",
    description: "Extend the selection to the previous word for fast correction or replacement.",
    accepted: [{ code: "ArrowLeft", ctrlKey: true, shiftKey: true }],
    before: createShortcutPreview(sampleLine, wordEnd),
    after: createShortcutPreview(sampleLine, wordEnd, wordStart, wordEnd),
  },
  {
    id: "select-word-right",
    title: "Select Next Word",
    shortcutLabel: "Ctrl+Shift+ArrowRight",
    description: "Extend the selection to the next word without dropping the keyboard rhythm.",
    accepted: [{ code: "ArrowRight", ctrlKey: true, shiftKey: true }],
    before: createShortcutPreview(sampleLine, wordStart),
    after: createShortcutPreview(sampleLine, wordStart, wordStart, wordEnd),
  },
  {
    id: "home-key",
    title: "Jump To Line Start",
    shortcutLabel: "Home",
    description: "Return to the beginning of the current line instantly.",
    accepted: [{ code: "Home" }],
    before: createShortcutPreview(sampleLine, wordEnd),
    after: createShortcutPreview(sampleLine, 0),
  },
  {
    id: "end-key",
    title: "Jump To Line End",
    shortcutLabel: "End",
    description: "Jump to the end of the current line without dragging a cursor.",
    accepted: [{ code: "End" }],
    before: createShortcutPreview(sampleLine, wordStart),
    after: createShortcutPreview(sampleLine, sampleLine.length),
  },
  {
    id: "select-all",
    title: "Select All",
    shortcutLabel: "Ctrl+A",
    description: "Grab the whole line when you want to replace or inspect everything at once.",
    accepted: [{ code: "KeyA", ctrlKey: true }],
    before: createShortcutPreview(sampleLine, sampleLine.length),
    after: createShortcutPreview(sampleLine, sampleLine.length, 0, sampleLine.length),
  },
];

export function shortcutStrokeMatchesDrill(keystroke: KeystrokeEvent, drill: ShortcutDrill) {
  if (keystroke.phase !== "keydown") {
    return false;
  }

  return drill.accepted.some((expectation) => {
    return (
      keystroke.code === expectation.code &&
      keystroke.ctrlKey === (expectation.ctrlKey ?? false) &&
      keystroke.altKey === (expectation.altKey ?? false) &&
      keystroke.shiftPressed === (expectation.shiftKey ?? false) &&
      keystroke.metaKey === (expectation.metaKey ?? false)
    );
  });
}
