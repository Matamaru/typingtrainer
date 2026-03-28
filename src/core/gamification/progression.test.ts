import { describe, expect, it } from "vitest";

import { calculateLevelFromSessions, sessionsUntilNextLevel } from "./progression";

describe("progression helpers", () => {
  it("starts at level one", () => {
    expect(calculateLevelFromSessions(0)).toBe(1);
  });

  it("counts five sessions per level", () => {
    expect(calculateLevelFromSessions(5)).toBe(2);
    expect(sessionsUntilNextLevel(7)).toBe(3);
  });
});
