import { describe, expect, it, vi } from "vitest";

vi.mock("./db", () => ({
  db: {
    sessionSummaries: {
      orderBy: vi.fn(),
      where: vi.fn(),
      put: vi.fn(),
    },
  },
}));

import { db } from "./db";
import { listSessionSummaries } from "./session-summaries";

describe("listSessionSummaries", () => {
  it("normalizes legacy summaries with missing analytics fields", async () => {
    vi.mocked(db.sessionSummaries.where).mockReturnValue({
      equals: vi.fn().mockReturnValue({
        toArray: vi.fn().mockResolvedValue([
          {
            id: "session-1",
            profileId: "profile-1",
            lessonId: "lesson-1",
            lessonTitle: "Lesson",
            mode: "guided",
            strictness: "strict",
            startedAt: "2026-03-28T00:00:00.000Z",
            completedAt: "2026-03-28T00:01:00.000Z",
            durationMs: 60000,
            rawKeydownCount: 12,
            scoredKeystrokes: 10,
            correctKeystrokes: 8,
            backspaceCount: 0,
            accuracy: 80,
            shiftSideErrors: 1,
            likelyWrongFingerCount: 0,
            mistakeCounts: { "wrong-key": 2 },
            expectedKeyCounts: [{ code: "KeyA", label: "A", count: 2 }],
            mistakeKeyCounts: [{ code: "KeyA", label: "A", count: 1 }],
            expectedFingerZoneCounts: [{ fingerZone: "left-pinky", count: 2 }],
            mistakeFingerZoneCounts: [{ fingerZone: "left-pinky", count: 1 }],
            weakKeys: [{ code: "KeyA", label: "A", count: 1 }],
            weakFingerZones: [{ fingerZone: "left-pinky", count: 1 }],
          },
        ]),
      }),
    } as never);

    const summaries = await listSessionSummaries("profile-1");

    expect(summaries[0]?.timingHesitationCount).toBe(0);
    expect(summaries[0]?.hesitationKeyCounts).toEqual([]);
    expect(summaries[0]?.hesitationFingerZoneCounts).toEqual([]);
    expect(summaries[0]?.substitutionCounts).toEqual([]);
  });
});
