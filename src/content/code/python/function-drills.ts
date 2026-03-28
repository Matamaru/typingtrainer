import type { Lesson } from "../../../shared/types/domain";

export const pythonFunctionFlowLesson: Lesson = {
  id: "python-function-flow",
  title: "Python Function Flow",
  summary: "Train parentheses, colons, underscores, and calm indentation.",
  mode: "coding",
  kind: "code",
  codeLanguage: "python",
  estimatedMinutes: 9,
  tags: ["python", "indentation", "symbols"],
  goals: [
    "Practice function signatures without visual keyboard checks.",
    "Reinforce colon and underscore accuracy.",
    "Treat formatting as part of typing discipline.",
  ],
  prompts: [
    { id: "py-1", text: "def read_pin(pin_state: int) -> bool:" },
    { id: "py-2", text: "    return pin_state == 1" },
    { id: "py-3", text: "if sensor_ready and retry_count < 3:" },
  ],
};
