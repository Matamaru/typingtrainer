import { getCodingLessons } from "../../core/content/catalog";
import { PageSection } from "../../shared/ui/PageSection";

export function CodingPage() {
  const codingLessons = getCodingLessons();

  return (
    <div className="page-grid">
      <PageSection eyebrow="coding teacher" title="Typing-first code practice">
        <p>
          The coding teacher is scaffolded as a training mode rather than a separate programming
          course. The current packs focus on Python, MicroPython, and C syntax patterns, naming
          rhythm, and small full functions that are useful for symbol control and muscle memory.
        </p>
        <div className="card-grid">
          {codingLessons.map((lesson) => (
            <article key={lesson.id} className="lesson-card">
              <div className="lesson-card__header">
                <span className="pill">{lesson.codeLanguage}</span>
                <span className="pill">{lesson.estimatedMinutes} min</span>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.summary}</p>
              <pre className="prompt-preview">{lesson.prompts[0]?.text}</pre>
              {lesson.prompts[0]?.notes ? (
                <p className="lesson-helper">{lesson.prompts[0].notes}</p>
              ) : null}
            </article>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
