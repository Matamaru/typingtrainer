import type { SessionSummary } from "../../shared/types/domain";
import { db } from "./db";

function normalizeCountList<T extends { count: number }>(entries: unknown): T[] {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.filter((entry): entry is T => {
    return (
      typeof entry === "object" &&
      entry !== null &&
      "count" in entry &&
      typeof entry.count === "number"
    );
  });
}

function normalizeSessionSummary(summary: SessionSummary): SessionSummary {
  return {
    ...summary,
    shiftSideErrors: summary.shiftSideErrors ?? 0,
    likelyWrongFingerCount: summary.likelyWrongFingerCount ?? 0,
    timingHesitationCount: summary.timingHesitationCount ?? 0,
    mistakeCounts: summary.mistakeCounts ?? {},
    expectedKeyCounts: normalizeCountList(summary.expectedKeyCounts),
    mistakeKeyCounts: normalizeCountList(summary.mistakeKeyCounts),
    expectedFingerZoneCounts: normalizeCountList(summary.expectedFingerZoneCounts),
    mistakeFingerZoneCounts: normalizeCountList(summary.mistakeFingerZoneCounts),
    hesitationKeyCounts: normalizeCountList(summary.hesitationKeyCounts),
    hesitationFingerZoneCounts: normalizeCountList(summary.hesitationFingerZoneCounts),
    substitutionCounts: normalizeCountList(summary.substitutionCounts),
    weakKeys: normalizeCountList(summary.weakKeys),
    weakFingerZones: normalizeCountList(summary.weakFingerZones),
  };
}

export async function saveSessionSummary(summary: SessionSummary) {
  await db.sessionSummaries.put(summary);
}

export async function listSessionSummaries(profileId?: string) {
  if (!profileId) {
    const summaries = await db.sessionSummaries.orderBy("completedAt").reverse().toArray();

    return summaries.map(normalizeSessionSummary);
  }

  const summaries = await db.sessionSummaries.where("profileId").equals(profileId).toArray();

  return summaries
    .map(normalizeSessionSummary)
    .sort((left, right) => right.completedAt.localeCompare(left.completedAt));
}
