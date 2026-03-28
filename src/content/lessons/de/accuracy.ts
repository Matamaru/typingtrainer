import type { Lesson } from "../../../shared/types/domain";

export const germanAccuracyLesson: Lesson = {
  id: "de-ruhe-und-praezision",
  title: "Ruhe Und Praezision",
  summary: "German prose support with a calm accuracy-first cadence.",
  mode: "guided",
  kind: "prose",
  locale: "de",
  estimatedMinutes: 7,
  tags: ["german", "prose", "accuracy"],
  goals: [
    "Train calm sentence flow without abandoning touch-typing form.",
    "Keep the pace smooth enough to avoid finger watching.",
    "Carry good mechanics from drills into real prose.",
  ],
  prompts: [
    { id: "de-1", text: "ruhe vor tempo bringt klare fingerwege." },
    { id: "de-2", text: "ein guter anschlag fuehlt sich ruhig und sicher an." },
    { id: "de-3", text: "praezision baut das tempo spaeter fast von selbst." },
  ],
};
