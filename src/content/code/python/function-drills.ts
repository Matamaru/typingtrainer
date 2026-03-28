import type { Lesson } from "../../../shared/types/domain";

export const pythonFunctionFlowLesson: Lesson = {
  id: "python-function-flow",
  title: "Python Function Flow",
  summary: "Train parentheses, colons, underscores, and calm indentation.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 1,
  prerequisiteLessonIds: ["en-modifier-control"],
  codeLanguage: "python",
  estimatedMinutes: 9,
  tags: ["python", "indentation", "symbols"],
  goals: [
    "Practice function signatures without visual keyboard checks.",
    "Reinforce colon and underscore accuracy.",
    "Treat formatting as part of typing discipline.",
  ],
  prompts: [
    {
      id: "py-1",
      text: "def read_pin(pin_state: int) -> bool:",
      notes: "Type a realistic function signature. Focus on snake_case and the return annotation.",
    },
    {
      id: "py-2",
      text: "    return pin_state == 1",
      notes: "This line turns a numeric pin state into a boolean-style check.",
    },
    {
      id: "py-3",
      text: "if sensor_ready and retry_count < 3:",
      notes: "Keep the boolean condition readable while maintaining calm underscore control.",
    },
  ],
};

export const pythonIdentifierRhythmLesson: Lesson = {
  id: "python-identifier-rhythm",
  title: "Python Identifier Rhythm",
  summary: "Train snake_case names, constants, and short readable identifiers.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 2,
  prerequisiteLessonIds: ["python-function-flow"],
  codeLanguage: "python",
  estimatedMinutes: 8,
  tags: ["python", "identifiers", "naming"],
  goals: [
    "Build comfort with snake_case variable and function names.",
    "Contrast normal identifiers with constant-style names.",
    "Treat naming rhythm as part of code typing, not an afterthought.",
  ],
  prompts: [
    {
      id: "py-id-1",
      text: "sensor_ready = read_pin_state(raw_value)",
      notes: "This drills snake_case for both a boolean-style variable and a function call.",
    },
    {
      id: "py-id-2",
      text: "MAX_RETRY_COUNT = 3",
      notes: "Use constant-style uppercase naming without rushing the Shift rhythm.",
    },
    {
      id: "py-id-3",
      text: "next_frame_deadline_ms = tick_start_ms + frame_interval_ms",
      notes: "Long descriptive names should stay readable and calm, not collapsed into random abbreviations.",
    },
  ],
};

export const pythonPollingFunctionLesson: Lesson = {
  id: "python-polling-function",
  title: "Python Polling Function",
  summary: "Type a short full function with a guard loop, counters, and a clear return path.",
  mode: "coding",
  kind: "code",
  stage: 5,
  sequence: 3,
  prerequisiteLessonIds: ["python-identifier-rhythm"],
  codeLanguage: "python",
  estimatedMinutes: 9,
  tags: ["python", "functions", "control-flow"],
  goals: [
    "Practice a small complete function instead of disconnected code fragments.",
    "Keep loop conditions, counters, and return expressions readable under pressure.",
    "Make Python control flow feel like calm typing, not a symbol rush.",
  ],
  prompts: [
    {
      id: "py-fn-1",
      text: "def wait_for_sensor(sensor_ready: bool, retry_count: int) -> bool:",
      notes: "This is a full function signature with two readable parameter names and a return annotation.",
    },
    {
      id: "py-fn-2",
      text: "    while not sensor_ready and retry_count > 0:",
      notes: "Read the loop as a sentence: keep waiting while the sensor is not ready and retries remain.",
    },
    {
      id: "py-fn-3",
      text: "        retry_count -= 1",
      notes: "Stay precise on indentation and the compact decrement operator.",
    },
    {
      id: "py-fn-4",
      text: "    return sensor_ready or retry_count > 0",
      notes: "The return line summarizes the function: succeed if the sensor became ready before retries ran out.",
    },
  ],
};
