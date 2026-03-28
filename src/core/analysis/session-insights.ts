import { getAllQwertyKeyDescriptors } from "../keyboard/qwerty";
import type {
  FingerZoneCount,
  KeyCount,
  KeySubstitutionCount,
  SessionSummary,
} from "../../shared/types/domain";

export type AccuracyEntry = {
  label: string;
  mistakes: number;
  total: number;
  accuracy: number;
};

export type SubstitutionEntry = {
  expectedCode: string;
  expectedLabel: string;
  actualCode: string;
  actualLabel: string;
  count: number;
};

export type ProgressEntry = {
  id: string;
  lessonTitle: string;
  completedAt: string;
  accuracy: number;
  wpm: number;
  shiftSideErrors: number;
  likelyWrongFingerCount: number;
  timingHesitationCount: number;
};

export type HeatmapEntry = {
  code: string;
  label: string;
  row: number;
  x: number;
  total: number;
  mistakes: number;
  accuracy: number | null;
  intensity: number;
};

export type SessionInsights = {
  sessionsCompleted: number;
  scoredKeystrokes: number;
  averageAccuracy: number;
  shiftSideErrors: number;
  likelyWrongFingerCount: number;
  timingHesitationCount: number;
  weakKeys: AccuracyEntry[];
  weakFingerZones: AccuracyEntry[];
  hesitantKeys: Array<{ label: string; count: number }>;
  hesitantFingerZones: Array<{ label: string; count: number }>;
  commonSubstitutions: SubstitutionEntry[];
  recentProgress: ProgressEntry[];
  heatmapEntries: HeatmapEntry[];
};

function aggregateKeyCounts(entries: KeyCount[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const entry of entries) {
    const current = counts.get(entry.code);

    counts.set(entry.code, {
      label: entry.label,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return counts;
}

function aggregateFingerZoneCounts(entries: FingerZoneCount[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry.fingerZone, (counts.get(entry.fingerZone) ?? 0) + entry.count);
  }

  return counts;
}

function aggregateSimpleKeyCounts(entries: KeyCount[]) {
  const counts = new Map<string, { label: string; count: number }>();

  for (const entry of entries) {
    const current = counts.get(entry.code);

    counts.set(entry.code, {
      label: entry.label,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return counts;
}

function toTopCountEntries(counts: Map<string, { label: string; count: number }>) {
  return [...counts.values()].sort((left, right) => right.count - left.count).slice(0, 5);
}

function toTopFingerZoneCountEntries(counts: Map<string, number>) {
  return [...counts.entries()]
    .map(([label, count]) => ({
      label,
      count,
    }))
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function aggregateSubstitutionCounts(entries: KeySubstitutionCount[]) {
  const counts = new Map<
    string,
    { expectedCode: string; expectedLabel: string; actualCode: string; actualLabel: string; count: number }
  >();

  for (const entry of entries) {
    const key = `${entry.expectedCode}->${entry.actualCode}`;
    const current = counts.get(key);

    counts.set(key, {
      expectedCode: entry.expectedCode,
      expectedLabel: entry.expectedLabel,
      actualCode: entry.actualCode,
      actualLabel: entry.actualLabel,
      count: (current?.count ?? 0) + entry.count,
    });
  }

  return counts;
}

function buildAccuracyEntries(
  expectedCounts: Map<string, { label: string; count: number }>,
  mistakeCounts: Map<string, number>,
): AccuracyEntry[] {
  return [...expectedCounts.entries()]
    .map(([key, expected]) => {
      const mistakes = mistakeCounts.get(key) ?? 0;
      const accuracy = expected.count === 0 ? 100 : ((expected.count - mistakes) / expected.count) * 100;

      return {
        label: expected.label,
        mistakes,
        total: expected.count,
        accuracy,
      };
    })
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.mistakes - left.mistakes;
    })
    .slice(0, 5);
}

function buildFingerZoneAccuracyEntries(
  expectedCounts: Map<string, number>,
  mistakeCounts: Map<string, number>,
): AccuracyEntry[] {
  return [...expectedCounts.entries()]
    .map(([fingerZone, total]) => {
      const mistakes = mistakeCounts.get(fingerZone) ?? 0;
      const accuracy = total === 0 ? 100 : ((total - mistakes) / total) * 100;

      return {
        label: fingerZone,
        mistakes,
        total,
        accuracy,
      };
    })
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.mistakes - left.mistakes;
    })
    .slice(0, 5);
}

function buildProgressEntries(summaries: SessionSummary[]): ProgressEntry[] {
  return [...summaries]
    .sort((left, right) => left.completedAt.localeCompare(right.completedAt))
    .slice(-6)
    .map((summary) => ({
      id: summary.id,
      lessonTitle: summary.lessonTitle,
      completedAt: summary.completedAt,
      accuracy: summary.accuracy,
      wpm:
        summary.durationMs > 0 ? summary.correctKeystrokes / 5 / (summary.durationMs / 60000) : 0,
      shiftSideErrors: summary.shiftSideErrors,
      likelyWrongFingerCount: summary.likelyWrongFingerCount,
      timingHesitationCount: summary.timingHesitationCount,
    }));
}

function buildHeatmapEntries(
  expectedCounts: Map<string, { label: string; count: number }>,
  mistakeCounts: Map<string, number>,
): HeatmapEntry[] {
  return getAllQwertyKeyDescriptors()
    .filter((descriptor) => descriptor.code !== "IntlBackslash")
    .map((descriptor) => {
      const total = expectedCounts.get(descriptor.code)?.count ?? 0;
      const mistakes = mistakeCounts.get(descriptor.code) ?? 0;
      const accuracy = total > 0 ? ((total - mistakes) / total) * 100 : null;
      const intensity = total > 0 ? Math.min(mistakes / total, 1) : 0;

      return {
        code: descriptor.code,
        label: descriptor.code === "Space" ? "Space" : descriptor.base.toUpperCase(),
        row: descriptor.row,
        x: descriptor.x,
        total,
        mistakes,
        accuracy,
        intensity,
      };
    })
    .sort((left, right) => {
      if (left.row !== right.row) {
        return left.row - right.row;
      }

      return left.x - right.x;
    });
}

export function buildSessionInsights(summaries: SessionSummary[]): SessionInsights {
  if (summaries.length === 0) {
    return {
      sessionsCompleted: 0,
      scoredKeystrokes: 0,
      averageAccuracy: 0,
      shiftSideErrors: 0,
      likelyWrongFingerCount: 0,
      timingHesitationCount: 0,
      weakKeys: [],
      weakFingerZones: [],
      hesitantKeys: [],
      hesitantFingerZones: [],
      commonSubstitutions: [],
      recentProgress: [],
      heatmapEntries: buildHeatmapEntries(new Map(), new Map()),
    };
  }

  const totalAccuracy = summaries.reduce((sum, summary) => sum + summary.accuracy, 0);
  const scoredKeystrokes = summaries.reduce((sum, summary) => sum + summary.scoredKeystrokes, 0);
  const shiftSideErrors = summaries.reduce((sum, summary) => sum + summary.shiftSideErrors, 0);
  const likelyWrongFingerCount = summaries.reduce(
    (sum, summary) => sum + summary.likelyWrongFingerCount,
    0,
  );
  const timingHesitationCount = summaries.reduce(
    (sum, summary) => sum + summary.timingHesitationCount,
    0,
  );

  const expectedKeyCounts = aggregateKeyCounts(
    summaries.flatMap((summary) => summary.expectedKeyCounts),
  );
  const mistakeKeyCounts = summaries
    .flatMap((summary) => summary.mistakeKeyCounts)
    .reduce<Map<string, number>>((counts, entry) => {
      counts.set(entry.code, (counts.get(entry.code) ?? 0) + entry.count);
      return counts;
    }, new Map());
  const expectedFingerZoneCounts = aggregateFingerZoneCounts(
    summaries.flatMap((summary) => summary.expectedFingerZoneCounts),
  );
  const mistakeFingerZoneCounts = aggregateFingerZoneCounts(
    summaries.flatMap((summary) => summary.mistakeFingerZoneCounts),
  );
  const hesitationKeyCounts = aggregateSimpleKeyCounts(
    summaries.flatMap((summary) => summary.hesitationKeyCounts),
  );
  const hesitationFingerZoneCounts = aggregateFingerZoneCounts(
    summaries.flatMap((summary) => summary.hesitationFingerZoneCounts),
  );
  const substitutionCounts = aggregateSubstitutionCounts(
    summaries.flatMap((summary) => summary.substitutionCounts),
  );

  return {
    sessionsCompleted: summaries.length,
    scoredKeystrokes,
    averageAccuracy: totalAccuracy / summaries.length,
    shiftSideErrors,
    likelyWrongFingerCount,
    timingHesitationCount,
    weakKeys: buildAccuracyEntries(expectedKeyCounts, mistakeKeyCounts),
    weakFingerZones: buildFingerZoneAccuracyEntries(
      expectedFingerZoneCounts,
      mistakeFingerZoneCounts,
    ),
    hesitantKeys: toTopCountEntries(hesitationKeyCounts),
    hesitantFingerZones: toTopFingerZoneCountEntries(hesitationFingerZoneCounts),
    commonSubstitutions: [...substitutionCounts.values()]
      .sort((left, right) => right.count - left.count)
      .slice(0, 5),
    recentProgress: buildProgressEntries(summaries),
    heatmapEntries: buildHeatmapEntries(expectedKeyCounts, mistakeKeyCounts),
  };
}
