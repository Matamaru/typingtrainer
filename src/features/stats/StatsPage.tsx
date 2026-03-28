import { useEffect, useMemo, useState } from "react";

import { useAppStore } from "../../app/store/app-store";
import {
  buildSessionInsights,
  type HeatmapEntry,
} from "../../core/analysis/session-insights";
import { buildAchievementSnapshot } from "../../core/gamification/achievements";
import {
  buildSessionGoals,
  calculateLevelFromFocusPoints,
  calculatePracticeStreaks,
  calculateTodayFocusPoints,
  calculateTotalFocusPoints,
  focusPointsUntilNextLevel,
} from "../../core/gamification/progression";
import { listSessionSummaries } from "../../core/storage/session-summaries";
import type { SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function buildHeatmapTone(entry: HeatmapEntry) {
  if (entry.total === 0) {
    return "heatmap-key heatmap-key--idle";
  }

  if (entry.intensity >= 0.5) {
    return "heatmap-key heatmap-key--hot";
  }

  if (entry.intensity >= 0.2) {
    return "heatmap-key heatmap-key--warm";
  }

  return "heatmap-key heatmap-key--cool";
}

export function StatsPage() {
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

  const insights = useMemo(() => buildSessionInsights(summaries), [summaries]);
  const streaks = useMemo(() => calculatePracticeStreaks(summaries), [summaries]);
  const totalFocusPoints = useMemo(() => calculateTotalFocusPoints(summaries), [summaries]);
  const currentLevel = useMemo(
    () => calculateLevelFromFocusPoints(totalFocusPoints),
    [totalFocusPoints],
  );
  const focusPointsToNextLevel = useMemo(
    () => focusPointsUntilNextLevel(totalFocusPoints),
    [totalFocusPoints],
  );
  const focusPointsToday = useMemo(() => calculateTodayFocusPoints(summaries), [summaries]);
  const sessionGoals = useMemo(() => buildSessionGoals(summaries), [summaries]);
  const achievements = useMemo(() => buildAchievementSnapshot(summaries), [summaries]);

  const heatmapRows = useMemo(() => {
    const rows = new Map<number, HeatmapEntry[]>();

    for (const entry of insights.heatmapEntries) {
      const current = rows.get(entry.row) ?? [];
      current.push(entry);
      rows.set(entry.row, current);
    }

    return [...rows.entries()].sort((left, right) => left[0] - right[0]);
  }, [insights.heatmapEntries]);

  return (
    <div className="page-grid">
      <PageSection eyebrow="stats" title="Stored session summaries">
        <p>
          This view now reads actual lesson summaries from IndexedDB and turns them into trend,
          substitution, and keyboard heatmap views instead of flat counters alone.
        </p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Sessions completed</span>
            <strong>{insights.sessionsCompleted}</strong>
          </article>
          <article className="metric-card">
            <span>Scored keystrokes</span>
            <strong>{insights.scoredKeystrokes}</strong>
          </article>
          <article className="metric-card">
            <span>Average accuracy</span>
            <strong>{insights.averageAccuracy.toFixed(1)}%</strong>
          </article>
          <article className="metric-card">
            <span>Shift-side errors</span>
            <strong>{insights.shiftSideErrors}</strong>
          </article>
          <article className="metric-card">
            <span>Likely finger drift calls</span>
            <strong>{insights.likelyWrongFingerCount}</strong>
          </article>
          <article className="metric-card">
            <span>Timing hesitation calls</span>
            <strong>{insights.timingHesitationCount}</strong>
          </article>
          <article className="metric-card">
            <span>Current streak</span>
            <strong>{streaks.currentStreak} days</strong>
          </article>
          <article className="metric-card">
            <span>Total focus points</span>
            <strong>{totalFocusPoints}</strong>
          </article>
          <article className="metric-card">
            <span>Level</span>
            <strong>{currentLevel}</strong>
          </article>
          <article className="metric-card">
            <span>Focus points today</span>
            <strong>{focusPointsToday}</strong>
          </article>
          <article className="metric-card">
            <span>Achievements</span>
            <strong>
              {achievements.unlockedCount}/{achievements.totalCount}
            </strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="consistency" title="Consistency and momentum">
        <div className="metric-grid">
          <article className="metric-card">
            <span>Best streak</span>
            <strong>{streaks.bestStreak} days</strong>
          </article>
          <article className="metric-card">
            <span>Active days</span>
            <strong>{streaks.activeDays}</strong>
          </article>
          <article className="metric-card">
            <span>Last active day</span>
            <strong>{streaks.lastActiveDay ?? "none yet"}</strong>
          </article>
          <article className="metric-card">
            <span>Points to next level</span>
            <strong>{focusPointsToNextLevel}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="goals" title="Short and medium goals">
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

      <PageSection eyebrow="achievements" title="Achievement wall">
        <div className="card-grid">
          {achievements.unlocked.map((achievement) => (
            <article key={achievement.id} className="lesson-card lesson-card--earned">
              <div className="lesson-card__header">
                <span className="pill">{achievement.category}</span>
                <span className="pill pill--soft">earned</span>
              </div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
              <p className="status-line">Unlocked {formatSessionDate(achievement.unlockedAt)}</p>
            </article>
          ))}
          {achievements.locked.map((achievement) => (
            <article key={achievement.id} className="lesson-card lesson-card--locked">
              <div className="lesson-card__header">
                <span className="pill">{achievement.category}</span>
                <span className="pill">locked</span>
              </div>
              <h3>{achievement.title}</h3>
              <p>{achievement.description}</p>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="progress" title="Recent progress">
        <div className="card-grid">
          {insights.recentProgress.length > 0 ? (
            insights.recentProgress.map((entry) => (
              <article key={entry.id} className="lesson-card">
                <div className="lesson-card__header">
                  <h3>{entry.lessonTitle}</h3>
                  <span className="pill">{formatSessionDate(entry.completedAt)}</span>
                </div>
                <div className="progress-track" aria-hidden="true">
                  <span style={{ width: `${Math.max(entry.accuracy, 4)}%` }} />
                </div>
                <p>
                  {entry.accuracy.toFixed(1)}% accuracy at {entry.wpm.toFixed(1)} WPM.
                </p>
                <p>
                  {entry.shiftSideErrors} shift-side errors, {entry.likelyWrongFingerCount} likely
                  finger drift calls, {entry.timingHesitationCount} timing hesitation calls.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No progress data yet</h3>
              <p>Finish a guided lesson to start building the session trend view.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="substitutions" title="Most common substitutions">
        <div className="card-grid">
          {insights.commonSubstitutions.length > 0 ? (
            insights.commonSubstitutions.map((entry) => (
              <article
                key={`${entry.expectedCode}-${entry.actualCode}`}
                className="lesson-card"
              >
                <h3>
                  {entry.expectedLabel} -&gt; {entry.actualLabel}
                </h3>
                <p>
                  Logged {entry.count} times. This is your most repeated expected-to-actual swap for
                  those keys.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No substitution pattern yet</h3>
              <p>Once you repeat the same wrong-key swaps, they will show up here.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="timing" title="Timing hesitation hotspots">
        <div className="card-grid">
          {insights.hesitantKeys.length > 0 ? (
            insights.hesitantKeys.map((entry) => (
              <article key={entry.label} className="lesson-card">
                <h3>{entry.label}</h3>
                <p>
                  Long pauses were logged {entry.count} times before this target key in completed
                  sessions.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No hesitation pattern yet</h3>
              <p>Once you pause repeatedly before the same targets, they will show up here.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="keyboard map" title="Target-key heatmap">
        <p>
          Keys only heat up when they were expected in finished sessions. Idle keys simply have not
          been trained enough yet.
        </p>
        <div className="keyboard-heatmap">
          {heatmapRows.map(([row, entries]) => (
            <div key={row} className="keyboard-row">
              {entries.map((entry) => (
                <article key={entry.code} className={buildHeatmapTone(entry)}>
                  <strong>{entry.label}</strong>
                  <span>
                    {entry.accuracy === null
                      ? "no data"
                      : `${entry.accuracy.toFixed(0)}% / ${entry.total}`}
                  </span>
                </article>
              ))}
            </div>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="focus areas" title="Weakest target keys">
        <div className="card-grid">
          {insights.weakKeys.length > 0 ? (
            insights.weakKeys.map((entry) => (
              <article key={entry.label} className="lesson-card">
                <h3>{entry.label}</h3>
                <p>
                  {entry.accuracy.toFixed(1)}% accuracy across {entry.total} expected hits with{" "}
                  {entry.mistakes} logged misses.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No key data yet</h3>
              <p>Finish a guided lesson to compute target-key weakness.</p>
            </article>
          )}
        </div>
      </PageSection>

      <PageSection eyebrow="finger map" title="Weakest target finger zones">
        <div className="card-grid">
          {insights.weakFingerZones.length > 0 ? (
            insights.weakFingerZones.map((entry) => (
              <article key={entry.label} className="lesson-card">
                <h3>{entry.label}</h3>
                <p>
                  {entry.accuracy.toFixed(1)}% accuracy across {entry.total} expected hits with{" "}
                  {entry.mistakes} logged misses.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No finger-zone data yet</h3>
              <p>Finish a guided lesson to compute target-finger weakness.</p>
            </article>
          )}
        </div>
      </PageSection>
    </div>
  );
}
