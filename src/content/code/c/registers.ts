import type { Lesson } from "../../../shared/types/domain";

export const cRegisterRhythmLesson: Lesson = {
  id: "c-register-rhythm",
  title: "C Register Rhythm",
  summary: "Bare-metal flavored C snippets for operators, macros, and symbols.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 7,
  prerequisiteLessonIds: ["micropython-pin-rhythm"],
  codeLanguage: "c",
  estimatedMinutes: 11,
  tags: ["c", "bare-metal", "operators"],
  goals: [
    "Train semicolons, parentheses, stars, and bit-shift operators.",
    "Use short register-style lines as symbol control drills.",
    "Bridge typing practice with your embedded C interest.",
  ],
  prompts: [
    {
      id: "c-1",
      text: "#define GPIOA_ODR (*(volatile unsigned int*)0x48000014u)",
      notes: "This is a bare-metal macro pattern: a named register alias over a fixed address.",
    },
    {
      id: "c-2",
      text: "GPIOA_ODR |= (1u << 5);",
      notes: "The bit-shift selects a single pin bit before OR-ing it into the output register.",
    },
    {
      id: "c-3",
      text: "if ((status & READY_MASK) != 0u) { start_loop(); }",
      notes: "Read this as: mask the status register, then branch if the ready bit is set.",
    },
  ],
};

export const cIdentifierLesson: Lesson = {
  id: "c-embedded-identifiers",
  title: "C Embedded Identifiers",
  summary: "Practice register names, status flags, and bare-metal naming patterns.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 8,
  prerequisiteLessonIds: ["c-register-rhythm"],
  codeLanguage: "c",
  estimatedMinutes: 9,
  tags: ["c", "identifiers", "bare-metal"],
  goals: [
    "Build comfort with uppercase masks and lower_snake_case helpers.",
    "Keep long embedded identifiers readable and controlled.",
    "Reinforce naming patterns common in low-level C code.",
  ],
  prompts: [
    {
      id: "c-id-1",
      text: "static unsigned int frame_timeout_ticks = 0u;",
      notes: "Low-level state variables often stay in lower_snake_case even when constants are uppercase.",
    },
    {
      id: "c-id-2",
      text: "const unsigned int UART_TX_READY_MASK = (1u << 7);",
      notes: "Mask constants read best when their name explains both the peripheral and the bit meaning.",
    },
    {
      id: "c-id-3",
      text: "void wait_for_frame_sync(void) { poll_status_register(); }",
      notes: "Function names in embedded C should describe the behavior directly, not just abbreviate it.",
    },
  ],
};

export const cPollLoopLesson: Lesson = {
  id: "c-poll-loop",
  title: "C Poll Loop",
  summary: "Type a small full bare-metal helper with a while loop and register polling.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 9,
  prerequisiteLessonIds: ["c-embedded-identifiers"],
  codeLanguage: "c",
  estimatedMinutes: 10,
  tags: ["c", "functions", "bare-metal"],
  goals: [
    "Practice a complete low-level helper instead of isolated register lines.",
    "Reinforce braces, masks, comparisons, and semicolons in a realistic control loop.",
    "Make embedded C syntax feel deliberate rather than visually noisy.",
  ],
  prompts: [
    {
      id: "c-fn-1",
      text: "static void wait_for_tx_ready(void) {",
      notes: "Start with the full helper signature, including storage class, return type, and opening brace.",
    },
    {
      id: "c-fn-2",
      text: "    while ((UART_STATUS & UART_TX_READY_MASK) == 0u) {",
      notes: "Read this as a register poll: keep looping while the ready bit is still clear.",
    },
    {
      id: "c-fn-3",
      text: "        poll_status_register();",
      notes: "This helper call keeps the body short while still feeling like real embedded code.",
    },
    {
      id: "c-fn-4",
      text: "    }",
      notes: "Closing braces are part of the typing rhythm too. Do not rush them.",
    },
    {
      id: "c-fn-5",
      text: "}",
      notes: "Finish the function cleanly with a dedicated closing brace.",
    },
  ],
};
