import type { Lesson, SessionSummary } from "../../shared/types/domain";

export type LessonPacingStatus = "locked" | "ready" | "repeat" | "mastered";

export type LessonMasteryTarget = {
  accuracy: number;
  maxShiftSideErrors: number;
  maxLikelyWrongFingerCount: number;
  maxTimingHesitationCount: number;
  maxDelimiterMismatchCount: number;
};

export type LessonProgress = {
  lessonId: string;
  status: LessonPacingStatus;
  attempts: number;
  isAvailable: boolean;
  bestSummary: SessionSummary | null;
  latestSummary: SessionSummary | null;
  masteryTarget: LessonMasteryTarget;
  reasons: string[];
};

function buildMasteryTarget(lesson: Lesson): LessonMasteryTarget {
  const target: LessonMasteryTarget =
    lesson.kind === "technique"
      ? {
          accuracy: 94,
          maxShiftSideErrors: 2,
          maxLikelyWrongFingerCount: 2,
          maxTimingHesitationCount: 2,
          maxDelimiterMismatchCount: 1,
        }
      : lesson.kind === "prose"
        ? {
            accuracy: 92,
            maxShiftSideErrors: 2,
            maxLikelyWrongFingerCount: 3,
            maxTimingHesitationCount: 3,
            maxDelimiterMismatchCount: 1,
          }
        : {
            accuracy: 93,
            maxShiftSideErrors: 1,
            maxLikelyWrongFingerCount: 3,
            maxTimingHesitationCount: 3,
            maxDelimiterMismatchCount: 0,
          };

  if (lesson.tags.some((tag) => ["shift", "capitalization", "modifiers"].includes(tag))) {
    target.accuracy = Math.max(target.accuracy, 95);
    target.maxShiftSideErrors = 0;
  }

  if (lesson.tags.some((tag) => ["symbols", "punctuation", "brackets", "delimiters", "operators"].includes(tag))) {
    target.accuracy = Math.max(target.accuracy, 94);
    target.maxDelimiterMismatchCount = 0;
  }

  if (lesson.tags.some((tag) => ["home-row", "fingering", "anchors", "beginner"].includes(tag))) {
    target.maxLikelyWrongFingerCount = 1;
  }

  return target;
}

function getDelimiterMismatchCount(summary: SessionSummary) {
  return summary.mistakeCounts["delimiter-mismatch"] ?? 0;
}

function sortSummaries(left: SessionSummary, right: SessionSummary) {
  const leftMastered = left.accuracy;
  const rightMastered = right.accuracy;

  if (leftMastered !== rightMastered) {
    return rightMastered - leftMastered;
  }

  return right.completedAt.localeCompare(left.completedAt);
}

export function isLessonMastered(lesson: Lesson, summary: SessionSummary) {
  const target = buildMasteryTarget(lesson);

  return (
    summary.accuracy >= target.accuracy &&
    summary.shiftSideErrors <= target.maxShiftSideErrors &&
    summary.likelyWrongFingerCount <= target.maxLikelyWrongFingerCount &&
    summary.timingHesitationCount <= target.maxTimingHesitationCount &&
    getDelimiterMismatchCount(summary) <= target.maxDelimiterMismatchCount
  );
}

function buildRepeatReasons(summary: SessionSummary, target: LessonMasteryTarget) {
  const reasons: string[] = [];

  if (summary.accuracy < target.accuracy) {
    reasons.push(`Accuracy is ${summary.accuracy.toFixed(1)}%; target is ${target.accuracy}%.`);
  }

  if (summary.shiftSideErrors > target.maxShiftSideErrors) {
    reasons.push("Shift-side technique still needs cleaner reps.");
  }

  if (summary.likelyWrongFingerCount > target.maxLikelyWrongFingerCount) {
    reasons.push("Finger drift is still showing up in the weak zones.");
  }

  if (summary.timingHesitationCount > target.maxTimingHesitationCount) {
    reasons.push("Long hesitations suggest the reach is not stable yet.");
  }

  if (getDelimiterMismatchCount(summary) > target.maxDelimiterMismatchCount) {
    reasons.push("Delimiter or symbol control is still too noisy for this lesson.");
  }

  if (reasons.length === 0) {
    reasons.push(`Repeat once more at ${target.accuracy}%+ accuracy to stabilize the pattern.`);
  }

  return reasons;
}

export function buildLessonProgressMap(lessons: Lesson[], summaries: SessionSummary[]) {
  const summariesByLesson = new Map<string, SessionSummary[]>();

  for (const summary of summaries) {
    const existing = summariesByLesson.get(summary.lessonId) ?? [];
    existing.push(summary);
    summariesByLesson.set(summary.lessonId, existing);
  }

  const progressMap = new Map<string, LessonProgress>();

  for (const lesson of lessons) {
    const lessonSummaries = [...(summariesByLesson.get(lesson.id) ?? [])];
    lessonSummaries.sort((left, right) => right.completedAt.localeCompare(left.completedAt));

    const latestSummary = lessonSummaries[0] ?? null;
    const bestSummary = [...lessonSummaries].sort(sortSummaries)[0] ?? null;
    const prerequisitesMastered = (lesson.prerequisiteLessonIds ?? []).every((lessonId) => {
      return progressMap.get(lessonId)?.status === "mastered";
    });
    const hasAttempts = lessonSummaries.length > 0;
    const isAvailable = hasAttempts || prerequisitesMastered;
    const masteryTarget = buildMasteryTarget(lesson);
    const mastered = bestSummary ? isLessonMastered(lesson, bestSummary) : false;

    progressMap.set(lesson.id, {
      lessonId: lesson.id,
      status: !isAvailable ? "locked" : mastered ? "mastered" : hasAttempts ? "repeat" : "ready",
      attempts: lessonSummaries.length,
      isAvailable,
      bestSummary,
      latestSummary,
      masteryTarget,
      reasons:
        bestSummary && !mastered
          ? buildRepeatReasons(bestSummary, masteryTarget)
          : mastered
            ? [`Mastered at ${bestSummary?.accuracy.toFixed(1)}% accuracy.`]
            : [`Reach ${masteryTarget.accuracy}%+ accuracy to unlock the next lesson.`],
    });
  }

  return progressMap;
}

export function getNextPacedLesson(
  lessons: Lesson[],
  currentLessonId: string,
  progressMap: Map<string, LessonProgress>,
) {
  const currentIndex = lessons.findIndex((lesson) => lesson.id === currentLessonId);

  if (currentIndex < 0) {
    return undefined;
  }

  for (let index = currentIndex + 1; index < lessons.length; index += 1) {
    const candidate = lessons[index];

    if (candidate && progressMap.get(candidate.id)?.status !== "locked") {
      return candidate;
    }
  }

  return undefined;
}

export function getRecommendedLesson(lessons: Lesson[], progressMap: Map<string, LessonProgress>) {
  return (
    lessons.find((lesson) => progressMap.get(lesson.id)?.status === "repeat") ??
    lessons.find((lesson) => progressMap.get(lesson.id)?.status === "ready")
  );
}
