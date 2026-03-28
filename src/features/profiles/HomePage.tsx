import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import { lessonCatalog } from "../../core/content/catalog";
import { buildLessonProgressMap, getRecommendedLesson } from "../../core/content/lesson-progress";
import { buildAchievementSnapshot } from "../../core/gamification/achievements";
import {
  buildSessionGoals,
  calculateLevelFromFocusPoints,
  calculateLevelFromSessions,
  calculatePracticeStreaks,
  calculateTodayFocusPoints,
  calculateTotalFocusPoints,
  focusPointsUntilNextLevel,
} from "../../core/gamification/progression";
import { listSessionSummaries } from "../../core/storage/session-summaries";
import type { SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

export function HomePage() {
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

  const sessionsCompleted = summaries.length;
  const legacyLevel = calculateLevelFromSessions(sessionsCompleted);
  const streaks = calculatePracticeStreaks(summaries);
  const totalFocusPoints = calculateTotalFocusPoints(summaries);
  const currentLevel = calculateLevelFromFocusPoints(totalFocusPoints);
  const focusPointsToNextLevel = focusPointsUntilNextLevel(totalFocusPoints);
  const focusPointsToday = calculateTodayFocusPoints(summaries);
  const sessionGoals = buildSessionGoals(summaries);
  const achievements = buildAchievementSnapshot(summaries);
  const progressMap = buildLessonProgressMap(lessonCatalog, summaries);
  const recommendedLesson = getRecommendedLesson(lessonCatalog, progressMap);
  const masteredLessonCount = lessonCatalog.filter(
    (lesson) => progressMap.get(lesson.id)?.status === "mastered",
  ).length;
  const repeatLessonCount = lessonCatalog.filter(
    (lesson) => progressMap.get(lesson.id)?.status === "repeat",
  ).length;

  return (
    <div className="page-grid">
      <PageSection eyebrow="dashboard" title="Phase 2 vertical slice">
        <p>
          The app now has a real lesson runner: raw browser key events feed a plain TypeScript
          typing engine, session summaries persist locally, and stats can start accumulating from
          actual practice rather than placeholders.
        </p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Total starter lessons</span>
            <strong>{lessonCatalog.length}</strong>
          </article>
          <article className="metric-card">
            <span>Completed sessions</span>
            <strong>{sessionsCompleted}</strong>
          </article>
          <article className="metric-card">
            <span>Current level</span>
            <strong>{currentLevel}</strong>
          </article>
          <article className="metric-card">
            <span>Focus points to next level</span>
            <strong>{focusPointsToNextLevel}</strong>
          </article>
          <article className="metric-card">
            <span>Current streak</span>
            <strong>{streaks.currentStreak} days</strong>
          </article>
          <article className="metric-card">
            <span>Best streak</span>
            <strong>{streaks.bestStreak} days</strong>
          </article>
          <article className="metric-card">
            <span>Focus points today</span>
            <strong>
              {focusPointsToday}
            </strong>
          </article>
          <article className="metric-card">
            <span>Achievements</span>
            <strong>
              {achievements.unlockedCount}/{achievements.totalCount}
            </strong>
          </article>
          <article className="metric-card">
            <span>Mastered lessons</span>
            <strong>{masteredLessonCount}</strong>
          </article>
          <article className="metric-card">
            <span>Repeat recommended</span>
            <strong>{repeatLessonCount}</strong>
          </article>
        </div>
        <p className="status-line">
          Level progress is now driven by focus points, so calm accurate sessions climb faster than
          rushed sloppy ones. Legacy session-count level would currently read {legacyLevel}.
        </p>
      </PageSection>

      <PageSection eyebrow="profile" title="Local profile bootstrap">
        <p>
          Active profile: <strong>{profile?.name ?? "Loading..."}</strong>
        </p>
        <p>
          Strictness starts at <strong>{profile?.preferences.strictness ?? "strict"}</strong> and
          finger guidance is <strong>{profile?.preferences.showFingerGuides ? "on" : "off"}</strong>.
        </p>
      </PageSection>

      <PageSection eyebrow="achievements" title="Technique achievements">
        <div className="card-grid">
          {achievements.unlocked.length > 0 ? (
            achievements.unlocked.slice(0, 4).map((achievement) => (
              <article key={achievement.id} className="lesson-card lesson-card--earned">
                <div className="lesson-card__header">
                  <span className="pill">{achievement.category}</span>
                  <span className="pill pill--soft">earned</span>
                </div>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
                <p className="status-line">Unlocked {achievement.unlockedAt.slice(0, 10)}</p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No achievements unlocked yet</h3>
              <p>Complete a few sessions and the first technique milestones will show up here.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="goals" title="Session goals">
        <div className="card-grid">
          {sessionGoals.map((goal) => (
            <article
              key={goal.id}
              className={`lesson-card${goal.isComplete ? " lesson-card--earned" : ""}`}
            >
              <div className="lesson-card__header">
                <span className="pill">{goal.id === "short-reset" ? "short" : "medium"}</span>
                <span className={`pill${goal.isComplete ? " pill--soft" : ""}`}>
                  {goal.isComplete ? "complete" : "in progress"}
                </span>
              </div>
              <h3>{goal.title}</h3>
              <p>{goal.description}</p>
              <p>
                {goal.current}/{goal.target} {goal.unit}
              </p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="next" title="Suggested first paths">
        <div className="link-grid">
          <Link className="panel-link" to="/lessons">
            Start a guided lesson
          </Link>
          <Link className="panel-link" to="/practice/free">
            Inspect raw key capture
          </Link>
          <Link className="panel-link panel-link--accent" to="/stats">
            Review stats and achievements
          </Link>
        </div>
        {recommendedLesson ? (
          <p className="status-line">
            Current paced focus: <strong>{recommendedLesson.title}</strong>. Open lessons to repeat
            unstable drills before pushing deeper into the ladder.
          </p>
        ) : null}
      </PageSection>
    </div>
  );
}
