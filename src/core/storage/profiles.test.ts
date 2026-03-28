import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  db: {
    profiles: {
      add: vi.fn(),
      get: vi.fn(),
      orderBy: vi.fn(),
      put: vi.fn(),
    },
  },
}));

import { db } from "./db";
import { createProfile, renameProfile, resolveInitialProfile } from "./profiles";

describe("profile storage helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const storage = new Map<string, string>();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn((key: string) => storage.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
          storage.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
          storage.delete(key);
        }),
      },
    });
  });

  it("creates a profile with a normalized fallback name", async () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );

    const profile = await createProfile("   ");

    expect(profile.id).toBe("00000000-0000-4000-8000-000000000001");
    expect(profile.name).toBe("New profile");
    expect(db.profiles.add).toHaveBeenCalledWith(profile);
  });

  it("renames an existing profile", async () => {
    vi.mocked(db.profiles.get).mockResolvedValue({
      id: "profile-1",
      name: "Matamaru",
      createdAt: "2026-03-28T08:00:00.000Z",
      updatedAt: "2026-03-28T08:00:00.000Z",
      preferences: {
        strictness: "strict",
        showFingerGuides: true,
        preferredPracticeLanguages: ["en", "de", "python", "micropython", "c"],
      },
    });

    const renamed = await renameProfile("profile-1", "Work profile");

    expect(renamed?.name).toBe("Work profile");
    expect(db.profiles.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "profile-1",
        name: "Work profile",
      }),
    );
  });

  it("prefers the stored active profile during bootstrap", async () => {
    const profiles = [
      {
        id: "profile-1",
        name: "Matamaru",
        createdAt: "2026-03-28T08:00:00.000Z",
        updatedAt: "2026-03-28T08:00:00.000Z",
        preferences: {
          strictness: "strict",
          showFingerGuides: true,
          preferredPracticeLanguages: ["en", "de", "python", "micropython", "c"],
        },
      },
      {
        id: "profile-2",
        name: "Travel keyboard",
        createdAt: "2026-03-28T09:00:00.000Z",
        updatedAt: "2026-03-28T09:00:00.000Z",
        preferences: {
          strictness: "guided",
          showFingerGuides: true,
          preferredPracticeLanguages: ["en", "de"],
        },
      },
    ];

    vi.mocked(db.profiles.orderBy).mockReturnValue({
      first: vi.fn().mockResolvedValue(profiles[0]),
      toArray: vi.fn().mockResolvedValue(profiles),
    } as never);

    window.localStorage.setItem("typingtrainer.activeProfileId", "profile-2");

    const resolved = await resolveInitialProfile();

    expect(resolved?.id).toBe("profile-2");
    expect(window.localStorage.getItem("typingtrainer.activeProfileId")).toBe("profile-2");
  });
});
