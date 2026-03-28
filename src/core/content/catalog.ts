import { cRegisterRhythmLesson } from "../../content/code/c/registers";
import { micropythonPinsLesson } from "../../content/code/micropython/pins";
import { pythonFunctionFlowLesson } from "../../content/code/python/function-drills";
import { germanAccuracyLesson } from "../../content/lessons/de/accuracy";
import {
  englishCapitalizationLesson,
  englishHomeRowLesson,
} from "../../content/lessons/en/foundations";
import type { Lesson } from "../../shared/types/domain";

export const lessonCatalog: Lesson[] = [
  englishHomeRowLesson,
  englishCapitalizationLesson,
  germanAccuracyLesson,
  pythonFunctionFlowLesson,
  micropythonPinsLesson,
  cRegisterRhythmLesson,
];

export function getLessonById(lessonId: string) {
  return lessonCatalog.find((lesson) => lesson.id === lessonId);
}

export function getCodingLessons() {
  return lessonCatalog.filter((lesson) => lesson.kind === "code");
}
