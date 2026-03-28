import type { Profile, ProfilePreferences } from "../../shared/types/domain";
import { db } from "./db";

const defaultPreferences: ProfilePreferences = {
  strictness: "strict",
  showFingerGuides: true,
  preferredPracticeLanguages: ["en", "de", "python", "micropython", "c"],
};

function buildDefaultProfile(): Profile {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: "Matamaru",
    createdAt: now,
    updatedAt: now,
    preferences: defaultPreferences,
  };
}

export async function ensureDefaultProfile() {
  const existing = await db.profiles.orderBy("createdAt").first();

  if (existing) {
    return existing;
  }

  const profile = buildDefaultProfile();
  await db.profiles.add(profile);

  return profile;
}

export async function listProfiles() {
  return db.profiles.orderBy("createdAt").toArray();
}

export async function updateProfilePreferences(
  profileId: string,
  patch: Partial<ProfilePreferences>,
) {
  const existing = await db.profiles.get(profileId);

  if (!existing) {
    return null;
  }

  const updated: Profile = {
    ...existing,
    updatedAt: new Date().toISOString(),
    preferences: {
      ...existing.preferences,
      ...patch,
    },
  };

  await db.profiles.put(updated);

  return updated;
}
