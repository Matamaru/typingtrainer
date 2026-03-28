import type { KeyCount, Lesson, Recommendation, SessionSummary } from "../../shared/types/domain";

function topCountsByCode(entries: KeyCount[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const entry of entries) {
    const current = counts.get(entry.code);

    counts.set(entry.code, {
      label: entry.label,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return [...counts.entries()]
    .sort((left, right) => right[1].count - left[1].count)
    .map(([code, data]) => ({
      code,
      label: data.label,
      count: data.count,
    }));
}

function findLesson(lessons: Lesson[], lessonId: string) {
  return lessons.find((lesson) => lesson.id === lessonId);
}

function topSubstitution(summaries: SessionSummary[]) {
  const counts = new Map<
    string,
    { expectedLabel: string; actualLabel: string; count: number }
  >();

  for (const entry of summaries.flatMap((summary) => summary.substitutionCounts)) {
    const key = `${entry.expectedCode}->${entry.actualCode}`;
    const current = counts.get(key);

    counts.set(key, {
      expectedLabel: entry.expectedLabel,
      actualLabel: entry.actualLabel,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return [...counts.values()].sort((left, right) => right.count - left.count)[0];
}

function topHesitationKey(summaries: SessionSummary[]) {
  return topCountsByCode(summaries.flatMap((summary) => summary.hesitationKeyCounts))[0];
}

export function buildStarterRecommendations(lessons: Lesson[]): Recommendation[] {
  const homeRowLesson = findLesson(lessons, "en-home-row-foundations");
  const capitalizationLesson = findLesson(lessons, "en-capitalization-ladders");
  const cLesson = findLesson(lessons, "c-register-rhythm");

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

export function buildAdaptiveRecommendations(
  lessons: Lesson[],
  summaries: SessionSummary[],
): Recommendation[] {
  if (summaries.length === 0) {
    return buildStarterRecommendations(lessons);
  }

  const recommendations: Recommendation[] = [];
  const homeRowLesson = findLesson(lessons, "en-home-row-foundations");
  const capitalizationLesson = findLesson(lessons, "en-capitalization-ladders");
  const cLesson = findLesson(lessons, "c-register-rhythm");

  const totalShiftErrors = summaries.reduce((sum, summary) => sum + summary.shiftSideErrors, 0);
  const totalLikelyWrongFinger = summaries.reduce(
    (sum, summary) => sum + summary.likelyWrongFingerCount,
    0,
  );
  const totalTimingHesitations = summaries.reduce(
    (sum, summary) => sum + summary.timingHesitationCount,
    0,
  );
  const repeatedSwap = topSubstitution(summaries);
  const hesitationKey = topHesitationKey(summaries);
  const topWeakKeys = topCountsByCode(summaries.flatMap((summary) => summary.mistakeKeyCounts));
  const topWeakFingerZones = summaries
    .flatMap((summary) => summary.mistakeFingerZoneCounts)
    .reduce<Map<string, number>>((counts, entry) => {
      counts.set(entry.fingerZone, (counts.get(entry.fingerZone) ?? 0) + entry.count);
      return counts;
    }, new Map());
  const topWeakFingerZone = [...topWeakFingerZones.entries()].sort(
    (left, right) => right[1] - left[1],
  )[0];

  if (totalLikelyWrongFinger > 0 || topWeakFingerZone) {
    recommendations.push({
      id: "adaptive-home-row-drift",
      title: "Re-center finger travel",
      reason: topWeakFingerZone
        ? `${topWeakFingerZone[0]} is carrying the most target misses. Repeating calm home-row work should reduce adjacent-key drift.`
        : repeatedSwap
          ? `The repeated ${repeatedSwap.expectedLabel} -> ${repeatedSwap.actualLabel} swap suggests finger travel is drifting under pressure.`
          : "Neighbor-key misses suggest finger travel is still drifting under pressure.",
      lessonId: homeRowLesson?.id,
      focus: ["home row", "finger drift", "accuracy"],
    });
  }

  if (totalShiftErrors > 0) {
    recommendations.push({
      id: "adaptive-shift-discipline",
      title: "Tighten shift-side discipline",
      reason: `${totalShiftErrors} shift-side mistakes are stored so far. A focused capitalization pass should clean that up.`,
      lessonId: capitalizationLesson?.id,
      focus: ["shift side", "capitalization", "technique"],
    });
  }

  if (totalTimingHesitations > 0) {
    recommendations.push({
      id: "adaptive-steady-rhythm",
      title: "Smooth out hesitation spikes",
      reason: hesitationKey
        ? `${hesitationKey.label} is showing the most long-pause activity. Repeat calmer rhythm work before pushing speed.`
        : `${totalTimingHesitations} timing hesitation calls are stored so far. A slower reset should steady the rhythm.`,
      lessonId: homeRowLesson?.id,
      focus: ["timing", "rhythm", "muscle memory"],
    });
  }

  if (topWeakKeys[0] || topWeakFingerZone?.[0]?.includes("pinky")) {
    recommendations.push({
      id: "adaptive-symbol-reach",
      title: "Reinforce pinky-heavy reach",
      reason: topWeakKeys[0]
        ? `The target key ${topWeakKeys[0].label} is a recurring miss. Symbol-heavy code drills are a good way to slow that down and make it deliberate.`
        : "Pinky-heavy misses are showing up often enough to justify targeted symbol work.",
      lessonId: cLesson?.id,
      focus: ["symbols", "pinky control", "coding"],
    });
  }

  return recommendations.slice(0, 3);
}
