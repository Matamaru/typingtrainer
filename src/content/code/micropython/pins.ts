import type { Lesson } from "../../../shared/types/domain";

export const micropythonPinsLesson: Lesson = {
  id: "micropython-pin-rhythm",
  title: "MicroPython Pin Rhythm",
  summary: "Practice embedded-flavored syntax with quick Pin patterns.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 4,
  prerequisiteLessonIds: ["python-function-flow"],
  codeLanguage: "micropython",
  estimatedMinutes: 8,
  tags: ["micropython", "embedded", "delimiters"],
  goals: [
    "Improve comfort with commas, dots, and parentheses.",
    "Keep embedded syntax short enough for accuracy-first practice.",
    "Build trust in symbol-heavy typing patterns.",
  ],
  prompts: [
    {
      id: "mp-1",
      text: "from machine import Pin",
      notes: "Import lines are good delimiter drills because they are short and syntax-heavy.",
    },
    {
      id: "mp-2",
      text: "led = Pin(25, Pin.OUT)",
      notes: "This creates an output pin object. Stay precise on commas, dots, and parentheses.",
    },
    {
      id: "mp-3",
      text: "button = Pin(15, Pin.IN, Pin.PULL_UP)",
      notes: "Read it as configuration: pin number, mode, then pull resistor.",
    },
  ],
};

export const micropythonNamingLesson: Lesson = {
  id: "micropython-state-names",
  title: "MicroPython State Names",
  summary: "Practice readable embedded names for pins, flags, and timing variables.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 5,
  prerequisiteLessonIds: ["micropython-pin-rhythm"],
  codeLanguage: "micropython",
  estimatedMinutes: 8,
  tags: ["micropython", "identifiers", "embedded"],
  goals: [
    "Train descriptive state names common in embedded Python code.",
    "Keep underscore-heavy names readable under pressure.",
    "Build meaning into the typing so identifiers stop feeling random.",
  ],
  prompts: [
    {
      id: "mp-name-1",
      text: "button_pressed_at_ms = ticks_ms()",
      notes: "A time-stamp style variable should read like a sentence: what happened, and in which unit.",
    },
    {
      id: "mp-name-2",
      text: "blink_interval_ms = 250",
      notes: "The `_ms` suffix keeps units explicit and improves readability in embedded code.",
    },
    {
      id: "mp-name-3",
      text: "is_wifi_connected = wlan.isconnected()",
      notes: "Boolean-style names often read best as `is_` or `has_` questions.",
    },
  ],
};

export const micropythonBlinkLoopLesson: Lesson = {
  id: "micropython-blink-loop",
  title: "MicroPython Blink Loop",
  summary: "Type a small full helper function for a blinking LED loop.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 6,
  prerequisiteLessonIds: ["micropython-state-names"],
  codeLanguage: "micropython",
  estimatedMinutes: 9,
  tags: ["micropython", "functions", "embedded"],
  goals: [
    "Practice a compact full function common in microcontroller tutorials and experiments.",
    "Reinforce indentation, underscores, and call syntax in a realistic embedded flow.",
    "Keep code-shaped typing meaningful instead of fragment-only repetition.",
  ],
  prompts: [
    {
      id: "mp-fn-1",
      text: "def blink_led(led: Pin, blink_count: int) -> None:",
      notes: "This helper name should read clearly: what it acts on, and what it does.",
    },
    {
      id: "mp-fn-2",
      text: "    for _ in range(blink_count):",
      notes: "The underscore is an intentional throwaway loop variable. Stay calm on Shift and parentheses.",
    },
    {
      id: "mp-fn-3",
      text: "        led.toggle()",
      notes: "Method calls should feel like one smooth shape: object, dot, method, parentheses.",
    },
    {
      id: "mp-fn-4",
      text: "        sleep_ms(200)",
      notes: "The `_ms` suffix is a good embedded naming habit because the unit stays explicit.",
    },
  ],
};
