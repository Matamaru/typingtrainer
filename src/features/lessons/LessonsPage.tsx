import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import {
  getCodingLessons,
  getLessonsForStage,
  guidedLessonStages,
  isLessonUnlocked,
} from "../../core/content/catalog";
import { listSessionSummaries } from "../../core/storage/session-summaries";
import type { Lesson, SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

function renderLessonAction(lesson: Lesson, completedLessonIds: Set<string>) {
  const completed = completedLessonIds.has(lesson.id);
  const unlocked = isLessonUnlocked(lesson, completedLessonIds);

  if (completed || unlocked) {
    return (
      <Link className="panel-link" to={`/lesson/${lesson.id}`}>
        {completed ? "Repeat lesson" : "Start lesson"}
      </Link>
    );
  }

  return <span className="status-line">Finish prerequisite lessons first.</span>;
}

export function LessonsPage() {
  const profile = useAppStore((state) => state.activeProfile);
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSummaries() {
      const nextSummaries = await listSessionSummaries(profile?.id);

      if (!cancelled) {
        setSummaries(nextSummaries);
      }
    }

    void loadSummaries();

    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const completedLessonIds = useMemo(() => {
    return new Set(summaries.map((summary) => summary.lessonId));
  }, [summaries]);

  const codingLessons = getCodingLessons();

  return (
    <div className="page-grid">
      <PageSection eyebrow="guided path" title="Guided beginner ladder">
        <p>
          The catalog is now ordered as a deliberate beginner path. Later lessons stay locked until
          the earlier mechanics are completed for the active local profile.
        </p>
      </PageSection>

      {guidedLessonStages.map((stage) => {
        const lessons = getLessonsForStage(stage.stage);

        return (
          <PageSection key={stage.stage} eyebrow={`stage ${stage.stage}`} title={stage.title}>
            <p>{stage.description}</p>
            <div className="card-grid">
              {lessons.map((lesson) => {
                const completed = completedLessonIds.has(lesson.id);
                const unlocked = isLessonUnlocked(lesson, completedLessonIds);

                return (
                  <article key={lesson.id} className={`lesson-card${!completed && !unlocked ? " lesson-card--locked" : ""}`}>
                    <div className="lesson-card__header">
                      <span className="pill">{lesson.kind}</span>
                      <span className="pill">{lesson.locale ?? lesson.codeLanguage}</span>
                      <span className={`pill${completed ? " pill--soft" : ""}`}>
                        {completed ? "completed" : unlocked ? "unlocked" : "locked"}
                      </span>
                    </div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <div className="pill-row">
                      {lesson.tags.map((tag) => (
                        <span key={tag} className="pill pill--soft">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {renderLessonAction(lesson, completedLessonIds)}
                  </article>
                );
              })}
            </div>
          </PageSection>
        );
      })}

      <PageSection eyebrow="coding packs" title="Code crossover lessons">
        <p>
          These sit after the beginner ladder and use the same technique-first approach in Python,
          MicroPython, and bare-metal flavored C.
        </p>
        <div className="card-grid">
          {codingLessons.map((lesson) => {
            const completed = completedLessonIds.has(lesson.id);
            const unlocked = isLessonUnlocked(lesson, completedLessonIds);

            return (
              <article key={lesson.id} className={`lesson-card${!completed && !unlocked ? " lesson-card--locked" : ""}`}>
                <div className="lesson-card__header">
                  <span className="pill">{lesson.kind}</span>
                  <span className="pill">{lesson.codeLanguage}</span>
                  <span className={`pill${completed ? " pill--soft" : ""}`}>
                    {completed ? "completed" : unlocked ? "unlocked" : "locked"}
                  </span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <div className="pill-row">
                  {lesson.tags.map((tag) => (
                    <span key={tag} className="pill pill--soft">
                      {tag}
                    </span>
                  ))}
                </div>
                {renderLessonAction(lesson, completedLessonIds)}
              </article>
            );
          })}
        </div>
      </PageSection>
    </div>
  );
}
