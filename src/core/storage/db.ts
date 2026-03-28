import Dexie, { type Table } from "dexie";

import type { Profile, SessionSummary } from "../../shared/types/domain";

class TypingTrainerDatabase extends Dexie {
  profiles!: Table<Profile, string>;
  sessionSummaries!: Table<SessionSummary, string>;

  constructor() {
    super("typingtrainer");

    this.version(1).stores({
      profiles: "&id, updatedAt, createdAt",
      sessionSummaries: "&id, profileId, lessonId, completedAt",
    });
  }
}

export const db = new TypingTrainerDatabase();
