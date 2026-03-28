import type { Lesson } from "../../../shared/types/domain";

export const micropythonPinsLesson: Lesson = {
  id: "micropython-pin-rhythm",
  title: "MicroPython Pin Rhythm",
  summary: "Practice embedded-flavored syntax with quick Pin patterns.",
  mode: "coding",
  kind: "code",
  codeLanguage: "micropython",
  estimatedMinutes: 8,
  tags: ["micropython", "embedded", "delimiters"],
  goals: [
    "Improve comfort with commas, dots, and parentheses.",
    "Keep embedded syntax short enough for accuracy-first practice.",
    "Build trust in symbol-heavy typing patterns.",
  ],
  prompts: [
    { id: "mp-1", text: "from machine import Pin" },
    { id: "mp-2", text: "led = Pin(25, Pin.OUT)" },
    { id: "mp-3", text: "button = Pin(15, Pin.IN, Pin.PULL_UP)" },
  ],
};
