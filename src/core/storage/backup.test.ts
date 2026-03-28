import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  db: {
    profiles: {
      bulkPut: vi.fn(),
      orderBy: vi.fn(),
    },
    sessionSummaries: {
      bulkPut: vi.fn(),
      orderBy: vi.fn(),
      where: vi.fn(),
    },
  },
}));

import { db } from "./db";
import {
  buildLocalBackup,
  getBackupFilename,
  importLocalBackup,
  serializeLocalBackup,
} from "./backup";

describe("local backup helpers", () => {
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

  it("builds a versioned backup from local profiles and session summaries", async () => {
    const profiles = [
      {
        id: "profile-1",
        name: "Matamaru",
        createdAt: "2026-03-28T08:00:00.000Z",
        updatedAt: "2026-03-28T08:00:00.000Z",
        preferences: {
          strictness: "strict" as const,
          showFingerGuides: true,
          preferredPracticeLanguages: ["en", "de", "python", "micropython", "c"],
        },
      },
    ];
    const sessionSummaries = [
      {
        id: "session-1",
        profileId: "profile-1",
        lessonId: "lesson-1",
        lessonTitle: "Home Row",
        mode: "guided" as const,
        strictness: "strict" as const,
        startedAt: "2026-03-28T08:00:00.000Z",
        completedAt: "2026-03-28T08:02:00.000Z",
        durationMs: 120000,
        rawKeydownCount: 10,
        scoredKeystrokes: 10,
        correctKeystrokes: 9,
        backspaceCount: 0,
        accuracy: 90,
        shiftSideErrors: 0,
        likelyWrongFingerCount: 0,
        timingHesitationCount: 0,
        mistakeCounts: {},
        expectedKeyCounts: [],
        mistakeKeyCounts: [],
        expectedFingerZoneCounts: [],
        mistakeFingerZoneCounts: [],
        hesitationKeyCounts: [],
        hesitationFingerZoneCounts: [],
        substitutionCounts: [],
        weakKeys: [],
        weakFingerZones: [],
      },
    ];

    vi.mocked(db.profiles.orderBy).mockReturnValue({
      toArray: vi.fn().mockResolvedValue(profiles),
    } as never);
    vi.mocked(db.sessionSummaries.orderBy).mockReturnValue({
      reverse: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue(sessionSummaries),
      }),
    } as never);
    window.localStorage.setItem("typingtrainer.activeProfileId", "profile-1");

    const backup = await buildLocalBackup();

    expect(backup.version).toBe(1);
    expect(backup.activeProfileId).toBe("profile-1");
    expect(backup.profiles).toEqual(profiles);
    expect(backup.sessionSummaries).toEqual(sessionSummaries);
  });

  it("serializes backups with a stable filename format", () => {
    const filename = getBackupFilename(new Date("2026-03-28T08:55:01.000Z"));
    const serialized = serializeLocalBackup({
      version: 1,
      exportedAt: "2026-03-28T08:55:01.000Z",
      activeProfileId: null,
      profiles: [],
      sessionSummaries: [],
    });

    expect(filename).toBe("typingtrainer-backup-20260328T085501.json");
    expect(serialized).toContain('"version": 1');
  });

  it("imports a valid backup and restores the active profile id", async () => {
    const raw = JSON.stringify({
      version: 1,
      exportedAt: "2026-03-28T08:55:01.000Z",
      activeProfileId: "profile-2",
      profiles: [
        {
          id: "profile-2",
          name: "Imported profile",
          createdAt: "2026-03-28T08:55:01.000Z",
          updatedAt: "2026-03-28T08:55:01.000Z",
          preferences: {
            strictness: "guided",
            showFingerGuides: false,
            preferredPracticeLanguages: ["en", "c"],
          },
        },
      ],
      sessionSummaries: [
        {
          id: "session-2",
          profileId: "profile-2",
          lessonId: "lesson-2",
          lessonTitle: "Shift Drill",
          mode: "adaptive",
          strictness: "guided",
          startedAt: "2026-03-28T08:56:00.000Z",
          completedAt: "2026-03-28T08:57:00.000Z",
          durationMs: 60000,
          rawKeydownCount: 24,
          scoredKeystrokes: 22,
          correctKeystrokes: 20,
          backspaceCount: 1,
          accuracy: 90.9,
          shiftSideErrors: 1,
          likelyWrongFingerCount: 0,
          timingHesitationCount: 0,
          mistakeCounts: {},
          expectedKeyCounts: [],
          mistakeKeyCounts: [],
          expectedFingerZoneCounts: [],
          mistakeFingerZoneCounts: [],
          hesitationKeyCounts: [],
          hesitationFingerZoneCounts: [],
          substitutionCounts: [],
          weakKeys: [],
          weakFingerZones: [],
        },
      ],
    });

    const result = await importLocalBackup(raw);

    expect(db.profiles.bulkPut).toHaveBeenCalledWith([
      expect.objectContaining({ id: "profile-2", name: "Imported profile" }),
    ]);
    expect(db.sessionSummaries.bulkPut).toHaveBeenCalledWith([
      expect.objectContaining({ id: "session-2", profileId: "profile-2" }),
    ]);
    expect(result).toEqual({
      profilesImported: 1,
      sessionSummariesImported: 1,
      activeProfileId: "profile-2",
    });
    expect(window.localStorage.getItem("typingtrainer.activeProfileId")).toBe("profile-2");
  });
});
