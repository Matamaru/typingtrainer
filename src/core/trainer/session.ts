import type { Lesson, Session } from "../../shared/types/domain";

export function createSessionFromLesson(lesson: Lesson): Session {
  return {
    id: crypto.randomUUID(),
    lessonId: lesson.id,
    mode: lesson.mode,
    strictness: "strict",
    startedAt: new Date().toISOString(),
    promptIndex: 0,
    keystrokes: [],
  };
}

export function getSessionProgress(session: Session, lesson: Lesson) {
  if (lesson.prompts.length === 0) {
    return 0;
  }

  return session.promptIndex / lesson.prompts.length;
}
