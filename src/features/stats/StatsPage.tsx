import { useEffect, useMemo, useState } from "react";

import { useAppStore } from "../../app/store/app-store";
import { listSessionSummaries } from "../../core/storage/session-summaries";
import type { FingerZone, SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

function topCounts(entries: string[]) {
  const counts = new Map<string, number>();

  for (const entry of entries) {
    counts.set(entry, (counts.get(entry) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([entry]) => entry);
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

  const aggregate = useMemo(() => {
    if (summaries.length === 0) {
      return {
        sessionsCompleted: 0,
        scoredKeystrokes: 0,
        averageAccuracy: 0,
        weakKeys: [] as string[],
        weakFingerZones: [] as FingerZone[],
      };
    }

    const totalAccuracy = summaries.reduce((sum, summary) => sum + summary.accuracy, 0);
    const scoredKeystrokes = summaries.reduce(
      (sum, summary) => sum + summary.scoredKeystrokes,
      0,
    );

    return {
      sessionsCompleted: summaries.length,
      scoredKeystrokes,
      averageAccuracy: totalAccuracy / summaries.length,
      weakKeys: topCounts(summaries.flatMap((summary) => summary.weakKeys)),
      weakFingerZones: topCounts(
        summaries.flatMap((summary) => summary.weakFingerZones),
      ) as FingerZone[],
    };
  }, [summaries]);

  return (
    <div className="page-grid">
      <PageSection eyebrow="stats" title="Stored session summaries">
        <p>
          This view now reads actual lesson summaries from IndexedDB. It is still a simple aggregate
          layer, but the data is no longer placeholder-only.
        </p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Sessions completed</span>
            <strong>{aggregate.sessionsCompleted}</strong>
          </article>
          <article className="metric-card">
            <span>Scored keystrokes</span>
            <strong>{aggregate.scoredKeystrokes}</strong>
          </article>
          <article className="metric-card">
            <span>Average accuracy</span>
            <strong>{aggregate.averageAccuracy.toFixed(1)}%</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="focus areas" title="Current weak spots">
        <div className="card-grid">
          <article className="lesson-card">
            <h3>Weak keys</h3>
            <div className="pill-row">
              {aggregate.weakKeys.length > 0 ? (
                aggregate.weakKeys.map((key) => (
                  <span key={key} className="pill pill--soft">
                    {key}
                  </span>
                ))
              ) : (
                <span className="pill">No lesson data yet</span>
              )}
            </div>
          </article>
          <article className="lesson-card">
            <h3>Weak finger zones</h3>
            <div className="pill-row">
              {aggregate.weakFingerZones.length > 0 ? (
                aggregate.weakFingerZones.map((zone) => (
                  <span key={zone} className="pill pill--soft">
                    {zone}
                  </span>
                ))
              ) : (
                <span className="pill">No lesson data yet</span>
              )}
            </div>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="recent sessions" title="Latest completions">
        <div className="card-grid">
          {summaries.length > 0 ? (
            summaries.slice(0, 4).map((summary) => (
              <article key={summary.id} className="lesson-card">
                <h3>{summary.lessonTitle}</h3>
                <p>
                  {summary.accuracy.toFixed(1)}% accuracy, {summary.shiftSideErrors} shift-side
                  errors, {summary.scoredKeystrokes} scored keystrokes.
                </p>
              </article>
            ))
          ) : (
            <article className="lesson-card">
              <h3>No completed sessions yet</h3>
              <p>Finish a guided lesson to populate the local stats view.</p>
            </article>
          )}
        </div>
      </PageSection>
    </div>
  );
}
