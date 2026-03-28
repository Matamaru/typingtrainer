import type { Lesson } from "../../../shared/types/domain";

export const englishHomeRowLesson: Lesson = {
  id: "en-home-row-foundations",
  title: "Home Row Foundations",
  summary: "Build steady home-row control before expanding to wider reach.",
  mode: "guided",
  kind: "technique",
  locale: "en",
  estimatedMinutes: 10,
  tags: ["home-row", "accuracy", "beginner"],
  goals: [
    "Keep the eyes on screen rather than on the keyboard.",
    "Build relaxed repetition across asdf jkl; patterns.",
    "Start linking finger placement to physical key positions.",
  ],
  prompts: [
    { id: "hr-1", text: "asdf jkl;" },
    { id: "hr-2", text: "sad lad; ask flask" },
    { id: "hr-3", text: "all fall; ask dad" },
  ],
};

export const englishCapitalizationLesson: Lesson = {
  id: "en-capitalization-ladders",
  title: "Capitalization Ladders",
  summary: "Train capital letters and shift-side control without rushing.",
  mode: "guided",
  kind: "technique",
  locale: "en",
  estimatedMinutes: 8,
  tags: ["shift", "capitalization", "technique"],
  goals: [
    "Practice opposite-hand shift habits for normal capitals.",
    "Keep rhythm while alternating lowercase and uppercase patterns.",
    "Use acronym exceptions intentionally rather than by accident.",
  ],
  prompts: [
    { id: "cap-1", text: "Ada asks Sam." },
    { id: "cap-2", text: "Calm Hands Make Clean Lines." },
    { id: "cap-3", text: "README stays easy in acronym mode." },
  ],
};
