import { cIdentifierLesson, cPollLoopLesson, cRegisterRhythmLesson } from "../../content/code/c/registers";
import {
  micropythonBlinkLoopLesson,
  micropythonNamingLesson,
  micropythonPinsLesson,
} from "../../content/code/micropython/pins";
import {
  pythonFunctionFlowLesson,
  pythonPollingFunctionLesson,
  pythonIdentifierRhythmLesson,
} from "../../content/code/python/function-drills";
import { germanAccuracyLesson } from "../../content/lessons/de/accuracy";
import {
  englishBottomRowLesson,
  englishCapitalizationLesson,
  englishCorrectionLesson,
  englishEdgeSymbolLesson,
  englishFingerMapLesson,
  englishHomeRowLesson,
  englishModifierLesson,
  englishNumberRowLesson,
  englishProseLesson,
  englishPunctuationLesson,
  englishSymbolLesson,
  englishTopRowLesson,
} from "../../content/lessons/en/foundations";
import type { Lesson } from "../../shared/types/domain";

export const guidedLessonStages = [
  {
    stage: 1,
    title: "Stage 1: Home Row Stability",
    description: "Lock in home-row anchors and finger identity before reaching wider.",
  },
  {
    stage: 2,
    title: "Stage 2: Reach Expansion",
    description: "Expand to top row, bottom row, and the number row without losing the return path.",
  },
  {
    stage: 3,
    title: "Stage 3: Capitals And Symbols",
    description:
      "Build disciplined Shift use, number-row/operator symbol control, and modifier confidence.",
  },
  {
    stage: 4,
    title: "Stage 4: Prose Carryover",
    description:
      "Carry drill mechanics into English first, then correction discipline and German prose support.",
  },
] as const;

function sortLessonCatalog(left: Lesson, right: Lesson) {
  const leftStage = left.stage ?? Number.MAX_SAFE_INTEGER;
  const rightStage = right.stage ?? Number.MAX_SAFE_INTEGER;

  if (leftStage !== rightStage) {
    return leftStage - rightStage;
  }

  const leftSequence = left.sequence ?? Number.MAX_SAFE_INTEGER;
  const rightSequence = right.sequence ?? Number.MAX_SAFE_INTEGER;

  if (leftSequence !== rightSequence) {
    return leftSequence - rightSequence;
  }

  return left.title.localeCompare(right.title);
}

export const lessonCatalog: Lesson[] = [
  englishHomeRowLesson,
  englishFingerMapLesson,
  englishTopRowLesson,
  englishBottomRowLesson,
  englishNumberRowLesson,
  englishCapitalizationLesson,
  englishSymbolLesson,
  englishEdgeSymbolLesson,
  englishPunctuationLesson,
  englishModifierLesson,
  englishProseLesson,
  englishCorrectionLesson,
  germanAccuracyLesson,
  pythonFunctionFlowLesson,
  pythonIdentifierRhythmLesson,
  pythonPollingFunctionLesson,
  micropythonPinsLesson,
  micropythonNamingLesson,
  micropythonBlinkLoopLesson,
  cRegisterRhythmLesson,
  cIdentifierLesson,
  cPollLoopLesson,
].sort(sortLessonCatalog);

export function getLessonById(lessonId: string) {
  return lessonCatalog.find((lesson) => lesson.id === lessonId);
}

export function getGuidedLessons() {
  return lessonCatalog.filter((lesson) => lesson.mode === "guided");
}

export function getCodingLessons() {
  return lessonCatalog.filter((lesson) => lesson.kind === "code");
}

export function getLessonsForStage(stage: number) {
  return getGuidedLessons().filter((lesson) => lesson.stage === stage);
}

export function isLessonUnlocked(lesson: Lesson, completedLessonIds: Set<string>) {
  return (lesson.prerequisiteLessonIds ?? []).every((lessonId) => completedLessonIds.has(lessonId));
}

export function getNextLesson(currentLessonId: string, completedLessonIds: Set<string>) {
  const currentIndex = lessonCatalog.findIndex((lesson) => lesson.id === currentLessonId);

  if (currentIndex < 0) {
    return undefined;
  }

  for (let index = currentIndex + 1; index < lessonCatalog.length; index += 1) {
    const candidate = lessonCatalog[index];

    if (candidate && isLessonUnlocked(candidate, completedLessonIds)) {
      return candidate;
    }
  }

  return undefined;
}
