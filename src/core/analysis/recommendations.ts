import type { Lesson, Recommendation } from "../../shared/types/domain";

export function buildStarterRecommendations(lessons: Lesson[]): Recommendation[] {
  const homeRowLesson = lessons.find((lesson) => lesson.id === "en-home-row-foundations");
  const capitalizationLesson = lessons.find(
    (lesson) => lesson.id === "en-capitalization-ladders",
  );
  const cLesson = lessons.find((lesson) => lesson.id === "c-register-rhythm");

  return [
    {
      id: "starter-home-row",
      title: "Lock in home row rhythm",
      reason: "Finger confidence comes before speed gains and helps reduce visual checking.",
      lessonId: homeRowLesson?.id,
      focus: ["accuracy", "home row", "fingering"],
    },
    {
      id: "starter-capitals",
      title: "Practice disciplined shift use",
      reason: "Modifier-side control is central to your long-term keyboard control goal.",
      lessonId: capitalizationLesson?.id,
      focus: ["shift side", "capitalization", "muscle memory"],
    },
    {
      id: "starter-code",
      title: "Train symbols through embedded-flavored C",
      reason: "Short code drills reinforce brackets, operators, and pinky-heavy symbol work.",
      lessonId: cLesson?.id,
      focus: ["symbols", "coding", "accuracy"],
    },
  ];
}
