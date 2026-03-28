import type { SessionSummary } from "../../shared/types/domain";
import { db } from "./db";

export async function saveSessionSummary(summary: SessionSummary) {
  await db.sessionSummaries.put(summary);
}

export async function listSessionSummaries(profileId?: string) {
  if (!profileId) {
    return db.sessionSummaries.orderBy("completedAt").reverse().toArray();
  }

  const summaries = await db.sessionSummaries.where("profileId").equals(profileId).toArray();

  return summaries.sort((left, right) => right.completedAt.localeCompare(left.completedAt));
}
