import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import { lessonCatalog } from "../../core/content/catalog";
import {
  calculateLevelFromSessions,
  sessionsUntilNextLevel,
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
  const currentLevel = calculateLevelFromSessions(sessionsCompleted);
  const sessionsToNextLevel = sessionsUntilNextLevel(sessionsCompleted);

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
            <span>Sessions to next level</span>
            <strong>{sessionsToNextLevel}</strong>
          </article>
        </div>
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

      <PageSection eyebrow="next" title="Suggested first paths">
        <div className="link-grid">
          <Link className="panel-link" to="/lessons">
            Start a guided lesson
          </Link>
          <Link className="panel-link" to="/practice/free">
            Inspect raw key capture
          </Link>
          <Link className="panel-link" to="/stats">
            Review stored session summaries
          </Link>
        </div>
      </PageSection>
    </div>
  );
}
