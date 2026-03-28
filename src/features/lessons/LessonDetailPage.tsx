import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useAppStore } from "../../app/store/app-store";
import { KeyboardCaptureEngine } from "../../core/keyboard/capture-engine";
import { getLessonById } from "../../core/content/catalog";
import {
  buildSessionSummary,
  createLessonRunState,
  getAccuracyPercent,
  getCurrentPromptText,
  getElapsedMs,
  getLessonRunStatus,
  getLiveWpm,
  processLessonKeystroke,
  type LessonRunState,
} from "../../core/trainer/engine";
import { saveSessionSummary } from "../../core/storage/session-summaries";
import type { SessionSummary } from "../../shared/types/domain";
import { PageSection } from "../../shared/ui/PageSection";

type SaveState = "idle" | "saving" | "saved" | "error";

function renderPrompt(expectedText: string, enteredText: string, cursorIndex: number) {
  return expectedText.split("").map((character, index) => {
    const enteredCharacter = enteredText[index];
    let className = "prompt-char prompt-char--pending";

    if (enteredCharacter !== undefined) {
      className =
        enteredCharacter === character ? "prompt-char prompt-char--correct" : "prompt-char prompt-char--wrong";
    } else if (index === cursorIndex) {
      className = "prompt-char prompt-char--cursor";
    }

    return (
      <span key={`${character}-${index}`} className={className}>
        {character === " " ? "\u00A0" : character}
      </span>
    );
  });
}

function formatDuration(durationMs: number) {
  return `${(durationMs / 1000).toFixed(1)}s`;
}

export function LessonDetailPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLessonById(lessonId);
  const profile = useAppStore((state) => state.activeProfile);
  const captureSurfaceRef = useRef<HTMLDivElement | null>(null);
  const captureEngineRef = useRef(new KeyboardCaptureEngine());
  const [runState, setRunState] = useState<LessonRunState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const strictness = profile?.preferences.strictness ?? "strict";

  useEffect(() => {
    if (!lesson || !profile) {
      setRunState(null);
      return;
    }

    captureEngineRef.current = new KeyboardCaptureEngine();
    setRunState(createLessonRunState(lesson, strictness, profile.id));
    setSaveState("idle");
  }, [lesson, profile, strictness]);

  useEffect(() => {
    captureSurfaceRef.current?.focus();
  }, [runState?.session.id]);

  useEffect(() => {
    if (!runState) {
      return;
    }

    if (getLessonRunStatus(runState) !== "completed" || saveState !== "idle") {
      return;
    }

    const summaryToSave = buildSessionSummary(runState);

    if (!summaryToSave) {
      return;
    }

    const persistedSummary: SessionSummary = summaryToSave;

    let cancelled = false;

    async function persistSummary() {
      setSaveState("saving");

      try {
        await saveSessionSummary(persistedSummary);

        if (!cancelled) {
          setSaveState("saved");
        }
      } catch {
        if (!cancelled) {
          setSaveState("error");
        }
      }
    }

    void persistSummary();

    return () => {
      cancelled = true;
    };
  }, [runState, saveState]);

  const summary = useMemo(() => (runState ? buildSessionSummary(runState) : null), [runState]);

  function restartLesson() {
    if (!lesson || !profile) {
      return;
    }

    captureEngineRef.current = new KeyboardCaptureEngine();
    setRunState(createLessonRunState(lesson, strictness, profile.id));
    setSaveState("idle");
  }

  function handleLessonKeyEvent(event: React.KeyboardEvent<HTMLDivElement>) {
    event.preventDefault();

    if (!runState) {
      return;
    }

    const keystroke = captureEngineRef.current.processEvent({
      altKey: event.altKey,
      code: event.code,
      ctrlKey: event.ctrlKey,
      key: event.key,
      location: event.location,
      metaKey: event.metaKey,
      repeat: event.repeat,
      shiftKey: event.shiftKey,
      timeStamp: event.timeStamp,
      type: event.type === "keyup" ? "keyup" : "keydown",
    });

    setRunState((current) => (current ? processLessonKeystroke(current, keystroke) : current));
  }

  if (!lesson) {
    return (
      <div className="page-grid">
        <PageSection eyebrow="missing" title="Lesson not found">
          <p>The requested lesson does not exist in the current starter catalog.</p>
          <Link className="panel-link" to="/lessons">
            Back to lessons
          </Link>
        </PageSection>
      </div>
    );
  }

  if (!runState) {
    return (
      <div className="page-grid">
        <PageSection eyebrow="loading" title={lesson.title}>
          <p>Loading profile-backed lesson state.</p>
        </PageSection>
      </div>
    );
  }

  const status = getLessonRunStatus(runState);
  const currentPromptText = getCurrentPromptText(runState);
  const promptNumber = Math.min(runState.promptIndex + 1, lesson.prompts.length);

  return (
    <div className="page-grid">
      <PageSection eyebrow={lesson.kind} title={lesson.title}>
        <p>{lesson.summary}</p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Prompt</span>
            <strong>
              {promptNumber}/{lesson.prompts.length}
            </strong>
          </article>
          <article className="metric-card">
            <span>Strictness</span>
            <strong>{strictness}</strong>
          </article>
          <article className="metric-card">
            <span>Accuracy</span>
            <strong>{getAccuracyPercent(runState).toFixed(1)}%</strong>
          </article>
          <article className="metric-card">
            <span>Live WPM</span>
            <strong>{getLiveWpm(runState).toFixed(1)}</strong>
          </article>
          <article className="metric-card">
            <span>Elapsed</span>
            <strong>{formatDuration(getElapsedMs(runState))}</strong>
          </article>
          <article className="metric-card">
            <span>Status</span>
            <strong>{status}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="runner" title="Interactive lesson runner">
        <p>
          Keydown events are scored, keyup events keep modifier tracking accurate, and paste-style
          input is intentionally ignored. In strict mode, wrong keys do not advance the cursor.
        </p>

        <div
          ref={captureSurfaceRef}
          className="capture-surface lesson-surface"
          tabIndex={0}
          onKeyDown={handleLessonKeyEvent}
          onKeyUp={handleLessonKeyEvent}
        >
          <p className="eyebrow">current prompt</p>
          <div className="lesson-prompt" aria-live="polite">
            {renderPrompt(currentPromptText, runState.currentPromptInput, runState.cursorIndex)}
          </div>
          <p className="lesson-helper">
            Focus this panel and type the prompt. Backspace is only enabled outside strict mode.
          </p>
        </div>

        <div className={`feedback-banner feedback-banner--${runState.lastFeedback.tone}`}>
          {runState.lastFeedback.message}
        </div>

        <div className="button-row">
          <button className="panel-button" type="button" onClick={restartLesson}>
            Restart lesson
          </button>
          <Link className="panel-link" to="/lessons">
            Back to lessons
          </Link>
        </div>
      </PageSection>

      <PageSection eyebrow="goals" title="Lesson goals">
        <ul className="plain-list">
          {lesson.goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </PageSection>

      <PageSection eyebrow="session" title="Current session details">
        <div className="metric-grid">
          <article className="metric-card">
            <span>Scored keystrokes</span>
            <strong>{runState.scoredKeystrokes}</strong>
          </article>
          <article className="metric-card">
            <span>Correct keystrokes</span>
            <strong>{runState.correctKeystrokes}</strong>
          </article>
          <article className="metric-card">
            <span>Backspaces</span>
            <strong>{runState.backspaceCount}</strong>
          </article>
          <article className="metric-card">
            <span>Logged mistakes</span>
            <strong>{runState.mistakes.length}</strong>
          </article>
        </div>

        {summary ? (
          <div className="summary-grid">
            <article className="lesson-card">
              <h3>Completion summary</h3>
              <p>
                Accuracy {summary.accuracy.toFixed(1)}% across {summary.scoredKeystrokes} scored
                keystrokes in {formatDuration(summary.durationMs)}.
              </p>
              <div className="pill-row">
                {summary.weakKeys.map((key) => (
                  <span key={key} className="pill pill--soft">
                    {key}
                  </span>
                ))}
              </div>
            </article>
            <article className="lesson-card">
              <h3>Local persistence</h3>
              <p>
                Session save state: <strong>{saveState}</strong>
              </p>
              <p>
                Shift-side errors: <strong>{summary.shiftSideErrors}</strong>
              </p>
            </article>
          </div>
        ) : (
          <p>Complete the lesson to store a session summary in IndexedDB.</p>
        )}
      </PageSection>
    </div>
  );
}
