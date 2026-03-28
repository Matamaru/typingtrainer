import type { Lesson } from "../../../shared/types/domain";

export const cRegisterRhythmLesson: Lesson = {
  id: "c-register-rhythm",
  title: "C Register Rhythm",
  summary: "Bare-metal flavored C snippets for operators, macros, and symbols.",
  mode: "coding",
  kind: "code",
  codeLanguage: "c",
  estimatedMinutes: 11,
  tags: ["c", "bare-metal", "operators"],
  goals: [
    "Train semicolons, parentheses, stars, and bit-shift operators.",
    "Use short register-style lines as symbol control drills.",
    "Bridge typing practice with your embedded C interest.",
  ],
  prompts: [
    { id: "c-1", text: "#define GPIOA_ODR (*(volatile unsigned int*)0x48000014u)" },
    { id: "c-2", text: "GPIOA_ODR |= (1u << 5);" },
    { id: "c-3", text: "if ((status & READY_MASK) != 0u) { start_loop(); }" },
  ],
};
