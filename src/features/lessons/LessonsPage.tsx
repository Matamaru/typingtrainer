import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import {
  lessonCatalog,
  getCodingLessons,
  getLessonsForStage,
  guidedLessonStages,
} from "../../core/content/catalog";
import { buildLessonProgressMap, type LessonProgress } from "../../core/content/lesson-progress";
import { listSessionSummaries } from "../../core/storage/session-summaries";
import type { Lesson, SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

function renderLessonAction(lesson: Lesson, progress: LessonProgress | undefined) {
  if (!progress) {
    return (
      <Link className="panel-link" to={`/lesson/${lesson.id}`}>
        Start lesson
      </Link>
    );
  }

  if (progress.status === "locked") {
    return (
      <>
        <span className="status-line">
          Pacing still recommends mastering the prerequisite lesson first.
        </span>
        <Link className="panel-link" to={`/lesson/${lesson.id}`}>
          Open lesson early
        </Link>
      </>
    );
  }

  return (
    <Link className="panel-link" to={`/lesson/${lesson.id}`}>
      {progress.status === "ready" ? "Start lesson" : "Repeat lesson"}
    </Link>
  );
}

function getStatusPillClass(status: LessonProgress["status"]) {
  if (status === "mastered") {
    return "pill pill--success";
  }

  if (status === "repeat") {
    return "pill pill--warning";
  }

  if (status === "locked") {
    return "pill pill--muted";
  }

  return "pill pill--soft";
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

  const progressMap = useMemo(() => {
    return buildLessonProgressMap(lessonCatalog, summaries);
  }, [summaries]);

  const codingLessons = getCodingLessons();

  return (
    <div className="page-grid">
      <PageSection eyebrow="guided path" title="Guided beginner ladder">
        <p>
          The catalog is now ordered as a deliberate beginner path. Pacing still marks later
          lessons as locked until earlier mechanics are stable enough, but you can open any lesson
          early if you want to practice ahead of the recommendation.
        </p>
      </PageSection>

      {guidedLessonStages.map((stage) => {
        const lessons = getLessonsForStage(stage.stage);

        return (
          <PageSection key={stage.stage} eyebrow={`stage ${stage.stage}`} title={stage.title}>
            <p>{stage.description}</p>
            <div className="card-grid">
              {lessons.map((lesson) => {
                const progress = progressMap.get(lesson.id);
                const status = progress?.status ?? "locked";

                return (
                  <article
                    key={lesson.id}
                    className={`lesson-card${status === "locked" ? " lesson-card--locked" : status === "mastered" ? " lesson-card--earned" : ""}`}
                  >
                    <div className="lesson-card__header">
                      <span className="pill">{lesson.kind}</span>
                      <span className="pill">{lesson.locale ?? lesson.codeLanguage}</span>
                      <span className={getStatusPillClass(status)}>
                        {status === "repeat" ? "repeat recommended" : status}
                      </span>
                    </div>
                    <h3>{lesson.title}</h3>
                    <p>{lesson.summary}</p>
                    <p className="status-line">
                      {progress?.bestSummary
                        ? `Best ${progress.bestSummary.accuracy.toFixed(1)}% across ${progress.attempts} attempt${progress.attempts === 1 ? "" : "s"}.`
                        : `Target ${progress?.masteryTarget.accuracy ?? 0}%+ to unlock the next step.`}
                    </p>
                    <p className="status-line">{progress?.reasons[0] ?? "Ready for a first calm run."}</p>
                    <div className="pill-row">
                      {lesson.tags.map((tag) => (
                        <span key={tag} className="pill pill--soft">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {renderLessonAction(lesson, progress)}
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
            const progress = progressMap.get(lesson.id);
            const status = progress?.status ?? "locked";

            return (
              <article
                key={lesson.id}
                className={`lesson-card${status === "locked" ? " lesson-card--locked" : status === "mastered" ? " lesson-card--earned" : ""}`}
              >
                <div className="lesson-card__header">
                  <span className="pill">{lesson.kind}</span>
                  <span className="pill">{lesson.codeLanguage}</span>
                  <span className={getStatusPillClass(status)}>
                    {status === "repeat" ? "repeat recommended" : status}
                  </span>
                </div>
                <h3>{lesson.title}</h3>
                <p>{lesson.summary}</p>
                <p className="status-line">
                  {progress?.bestSummary
                    ? `Best ${progress.bestSummary.accuracy.toFixed(1)}% across ${progress.attempts} attempt${progress.attempts === 1 ? "" : "s"}.`
                    : `Target ${progress?.masteryTarget.accuracy ?? 0}%+ before moving deeper into code.`}
                </p>
                <p className="status-line">{progress?.reasons[0] ?? "Ready for a first calm run."}</p>
                <div className="pill-row">
                  {lesson.tags.map((tag) => (
                    <span key={tag} className="pill pill--soft">
                      {tag}
                    </span>
                  ))}
                </div>
                {renderLessonAction(lesson, progress)}
              </article>
            );
          })}
        </div>
      </PageSection>
    </div>
  );
}
