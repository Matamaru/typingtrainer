import { Link } from "react-router-dom";

import { buildStarterRecommendations } from "../../core/analysis/recommendations";
import { lessonCatalog } from "../../core/content/catalog";
import { PageSection } from "../../shared/ui/PageSection";

export function AdaptivePracticePage() {
  const recommendations = buildStarterRecommendations(lessonCatalog);

  return (
    <div className="page-grid">
      <PageSection eyebrow="adaptive" title="Starter recommendation track">
        <p>
          The adaptive engine is still early, but the scaffold already separates analysis logic from
          rendering so weak-key, weak-finger, and shift-side recommendations can evolve without
          rewriting the UI layer.
        </p>
        <div className="card-grid">
          {recommendations.map((recommendation) => (
            <article key={recommendation.id} className="lesson-card">
              <h3>{recommendation.title}</h3>
              <p>{recommendation.reason}</p>
              <div className="pill-row">
                {recommendation.focus.map((focus) => (
                  <span key={focus} className="pill pill--soft">
                    {focus}
                  </span>
                ))}
              </div>
              {recommendation.lessonId ? (
                <Link className="panel-link" to={`/lesson/${recommendation.lessonId}`}>
                  Open linked lesson
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
