import { Link } from "react-router-dom";

import { lessonCatalog } from "../../core/content/catalog";
import { PageSection } from "../../shared/ui/PageSection";

export function LessonsPage() {
  return (
    <div className="page-grid">
      <PageSection eyebrow="catalog" title="Starter lesson catalog">
        <p>
          Lessons are currently authored as typed TypeScript data so the schema can evolve cleanly
          while the trainer engine is still taking shape.
        </p>
        <div className="card-grid">
          {lessonCatalog.map((lesson) => (
            <article key={lesson.id} className="lesson-card">
              <div className="lesson-card__header">
                <span className="pill">{lesson.kind}</span>
                <span className="pill">{lesson.mode}</span>
                <span className="pill">{lesson.locale ?? lesson.codeLanguage}</span>
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
              <Link className="panel-link" to={`/lesson/${lesson.id}`}>
                Open lesson detail
              </Link>
            </article>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
