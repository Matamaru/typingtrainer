import type { Profile, ProfilePreferences } from "../../shared/types/domain";
import { db } from "./db";

const ACTIVE_PROFILE_STORAGE_KEY = "typingtrainer.activeProfileId";

const defaultPreferences: ProfilePreferences = {
  strictness: "strict",
  showFingerGuides: true,
  preferredPracticeLanguages: ["en", "de", "python", "micropython", "c"],
};

function normalizeProfileName(name: string) {
  const trimmed = name.trim();

  return trimmed.length > 0 ? trimmed : "New profile";
}

function buildProfile(name: string): Profile {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    name: normalizeProfileName(name),
    createdAt: now,
    updatedAt: now,
    preferences: {
      ...defaultPreferences,
      preferredPracticeLanguages: [...defaultPreferences.preferredPracticeLanguages],
    },
  };
}

function buildDefaultProfile() {
  return buildProfile("Matamaru");
}

export function getStoredActiveProfileId() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY);
}

export function storeActiveProfileId(profileId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, profileId);
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

export async function createProfile(name: string) {
  const profile = buildProfile(name);

  await db.profiles.add(profile);

  return profile;
}

export async function renameProfile(profileId: string, name: string) {
  const existing = await db.profiles.get(profileId);

  if (!existing) {
    return null;
  }

  const updated: Profile = {
    ...existing,
    name: normalizeProfileName(name),
    updatedAt: new Date().toISOString(),
  };

  await db.profiles.put(updated);

  return updated;
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

export async function resolveInitialProfile() {
  await ensureDefaultProfile();

  const profiles = await listProfiles();
  const storedProfileId = getStoredActiveProfileId();
  const selected =
    profiles.find((profile) => profile.id === storedProfileId) ?? profiles[0] ?? null;

  if (selected) {
    storeActiveProfileId(selected.id);
  }

  return selected;
}
