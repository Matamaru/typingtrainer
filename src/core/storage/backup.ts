import type { LocalBackup, Profile, SessionSummary } from "../../shared/types/domain";
import { db } from "./db";
import { getStoredActiveProfileId, listProfiles, storeActiveProfileId } from "./profiles";
import { listSessionSummaries, normalizeSessionSummary } from "./session-summaries";

const SUPPORTED_BACKUP_VERSION = 1;

const fallbackPracticeLanguages = ["en", "de", "python", "micropython", "c"] as const;

type ImportResult = {
  profilesImported: number;
  sessionSummariesImported: number;
  activeProfileId: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeImportedProfile(entry: unknown): Profile | null {
  if (!isRecord(entry)) {
    return null;
  }

  if (
    typeof entry.id !== "string" ||
    typeof entry.name !== "string" ||
    typeof entry.createdAt !== "string" ||
    typeof entry.updatedAt !== "string"
  ) {
    return null;
  }

  const strictness =
    entry.preferences &&
    isRecord(entry.preferences) &&
    (entry.preferences.strictness === "strict" ||
      entry.preferences.strictness === "guided" ||
      entry.preferences.strictness === "relaxed")
      ? entry.preferences.strictness
      : "strict";

  const showFingerGuides =
    entry.preferences &&
    isRecord(entry.preferences) &&
    typeof entry.preferences.showFingerGuides === "boolean"
      ? entry.preferences.showFingerGuides
      : true;

  const preferredPracticeLanguages =
    entry.preferences &&
    isRecord(entry.preferences) &&
    Array.isArray(entry.preferences.preferredPracticeLanguages)
      ? entry.preferences.preferredPracticeLanguages.filter(
          (value): value is Profile["preferences"]["preferredPracticeLanguages"][number] =>
            typeof value === "string",
        )
      : [...fallbackPracticeLanguages];

  return {
    id: entry.id,
    name: entry.name.trim().length > 0 ? entry.name.trim() : "Imported profile",
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
    preferences: {
      strictness,
      showFingerGuides,
      preferredPracticeLanguages:
        preferredPracticeLanguages.length > 0
          ? preferredPracticeLanguages
          : [...fallbackPracticeLanguages],
    },
  };
}

function normalizeImportedSessionSummary(entry: unknown): SessionSummary | null {
  if (!isRecord(entry)) {
    return null;
  }

  const requiredStringFields = [
    "id",
    "profileId",
    "lessonId",
    "lessonTitle",
    "mode",
    "strictness",
    "startedAt",
    "completedAt",
  ] as const;
  const requiredNumberFields = [
    "durationMs",
    "rawKeydownCount",
    "scoredKeystrokes",
    "correctKeystrokes",
    "backspaceCount",
    "accuracy",
  ] as const;

  if (
    requiredStringFields.some((field) => typeof entry[field] !== "string") ||
    requiredNumberFields.some((field) => typeof entry[field] !== "number")
  ) {
    return null;
  }

  return normalizeSessionSummary(entry as SessionSummary);
}

export async function buildLocalBackup(): Promise<LocalBackup> {
  const [profiles, sessionSummaries] = await Promise.all([
    listProfiles(),
    listSessionSummaries(),
  ]);

  return {
    version: SUPPORTED_BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    activeProfileId: getStoredActiveProfileId(),
    profiles,
    sessionSummaries,
  };
}

export function getBackupFilename(timestamp = new Date()) {
  const compact = timestamp.toISOString().replaceAll(":", "").replaceAll("-", "").slice(0, 15);

  return `typingtrainer-backup-${compact}.json`;
}

export function serializeLocalBackup(backup: LocalBackup) {
  return JSON.stringify(backup, null, 2);
}

export async function importLocalBackup(raw: string): Promise<ImportResult> {
  const parsed = JSON.parse(raw) as unknown;

  if (!isRecord(parsed) || parsed.version !== SUPPORTED_BACKUP_VERSION) {
    throw new Error("Unsupported backup format.");
  }

  if (!Array.isArray(parsed.profiles) || !Array.isArray(parsed.sessionSummaries)) {
    throw new Error("Backup file is missing profiles or session summaries.");
  }

  const profiles = parsed.profiles
    .map((entry) => normalizeImportedProfile(entry))
    .filter((entry): entry is Profile => entry !== null);
  const sessionSummaries = parsed.sessionSummaries
    .map((entry) => normalizeImportedSessionSummary(entry))
    .filter((entry): entry is SessionSummary => entry !== null);

  if (profiles.length === 0) {
    throw new Error("Backup file did not contain any valid profiles.");
  }

  await db.profiles.bulkPut(profiles);
  await db.sessionSummaries.bulkPut(sessionSummaries);

  const preferredActiveProfileId =
    typeof parsed.activeProfileId === "string" &&
    profiles.some((profile) => profile.id === parsed.activeProfileId)
      ? parsed.activeProfileId
      : profiles[0]?.id ?? null;

  if (preferredActiveProfileId) {
    storeActiveProfileId(preferredActiveProfileId);
  }

  return {
    profilesImported: profiles.length,
    sessionSummariesImported: sessionSummaries.length,
    activeProfileId: preferredActiveProfileId,
  };
}
