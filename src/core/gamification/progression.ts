export function calculateLevelFromSessions(sessionsCompleted: number) {
  return Math.floor(sessionsCompleted / 5) + 1;
}

export function sessionsUntilNextLevel(sessionsCompleted: number) {
  const remainder = sessionsCompleted % 5;

  return remainder === 0 ? 5 : 5 - remainder;
}
