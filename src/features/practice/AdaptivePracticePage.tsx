import { useEffect, useMemo, useRef, useState } from "react";

import { useAppStore } from "../../app/store/app-store";
import { buildAdaptiveLessonPlan } from "../../core/analysis/adaptive-drills";
import { KeyboardCaptureEngine } from "../../core/keyboard/capture-engine";
import { listSessionSummaries, saveSessionSummary } from "../../core/storage/session-summaries";
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
import type { SessionSummary } from "../../shared/types/domain";
import { KeyboardCaptureSurface } from "../../shared/ui/KeyboardCaptureSurface";
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

export function AdaptivePracticePage() {
  const profile = useAppStore((state) => state.activeProfile);
  const strictness = profile?.preferences.strictness ?? "strict";
  const captureSurfaceRef = useRef<HTMLTextAreaElement | null>(null);
  const captureEngineRef = useRef(new KeyboardCaptureEngine());
  const [summaries, setSummaries] = useState<SessionSummary[]>([]);
  const [generationSeed, setGenerationSeed] = useState(0);
  const [runState, setRunState] = useState<LessonRunState | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const adaptivePlan = useMemo(
    () => buildAdaptiveLessonPlan(summaries, generationSeed),
    [summaries, generationSeed],
  );

  async function reloadSummaries() {
    const nextSummaries = await listSessionSummaries(profile?.id);
    setSummaries(nextSummaries);
  }

  useEffect(() => {
    void reloadSummaries();
  }, [profile?.id]);

  useEffect(() => {
    if (!profile) {
      setRunState(null);
      return;
    }

    captureEngineRef.current = new KeyboardCaptureEngine();
    setRunState(createLessonRunState(adaptivePlan.lesson, strictness, profile.id));
    setSaveState("idle");
  }, [adaptivePlan.lesson, profile, strictness]);

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
  }, [runState]);

  const summary = useMemo(() => (runState ? buildSessionSummary(runState) : null), [runState]);

  async function generateNextSession() {
    await reloadSummaries();
    setGenerationSeed((current) => current + 1);
  }

  function restartSession() {
    if (!profile) {
      return;
    }

    captureEngineRef.current = new KeyboardCaptureEngine();
    setRunState(createLessonRunState(adaptivePlan.lesson, strictness, profile.id));
    setSaveState("idle");
  }

  function handleLessonKeyEvent(event: React.KeyboardEvent<HTMLTextAreaElement>) {
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

  if (!profile || !runState) {
    return (
      <div className="page-grid">
        <PageSection eyebrow="adaptive" title="Adaptive session">
          <p>Loading profile-backed adaptive session state.</p>
        </PageSection>
      </div>
    );
  }

  const status = getLessonRunStatus(runState);
  const currentPromptText = getCurrentPromptText(runState);
  const promptNumber = Math.min(runState.promptIndex + 1, adaptivePlan.lesson.prompts.length);

  return (
    <div className="page-grid">
      <PageSection eyebrow="adaptive" title="Generated adaptive session">
        <p>{adaptivePlan.lesson.summary}</p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Prompt</span>
            <strong>
              {promptNumber}/{adaptivePlan.lesson.prompts.length}
            </strong>
          </article>
          <article className="metric-card">
            <span>Strictness</span>
            <strong>{strictness}</strong>
          </article>
          <article className="metric-card">
            <span>Shift-side errors used</span>
            <strong>{adaptivePlan.overview.shiftSideErrors}</strong>
          </article>
          <article className="metric-card">
            <span>Finger drift signals used</span>
            <strong>{adaptivePlan.overview.likelyWrongFingerCount}</strong>
          </article>
          <article className="metric-card">
            <span>Timing pauses used</span>
            <strong>{adaptivePlan.overview.timingHesitationCount}</strong>
          </article>
          <article className="metric-card">
            <span>Status</span>
            <strong>{status}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="focus" title="Why this session was generated">
        <div className="card-grid">
          {adaptivePlan.blocks.map((block) => (
            <article key={block.title} className="lesson-card">
              <h3>{block.title}</h3>
              <p>{block.reason}</p>
              <div className="pill-row">
                {block.tags.map((tag) => (
                  <span key={tag} className="pill pill--soft">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </PageSection>

      <PageSection eyebrow="runner" title="Adaptive runner">
        <p>
          This session is generated from your stored weakness data. Finish it, then generate the
          next session to pull in the latest saved summary.
        </p>

        <KeyboardCaptureSurface
          ref={captureSurfaceRef}
          ariaLabel="Adaptive lesson typing capture"
          autoFocus
          className="capture-surface lesson-surface"
          onKeyDown={handleLessonKeyEvent}
          onKeyUp={handleLessonKeyEvent}
        >
          <p className="eyebrow">current prompt</p>
          <div className="lesson-prompt" aria-live="polite">
            {renderPrompt(currentPromptText, runState.currentPromptInput, runState.cursorIndex)}
          </div>
          <p className="lesson-helper">
            Focus this panel and type the generated prompt. Regenerate after completion to use the
            newest saved session data.
          </p>
        </KeyboardCaptureSurface>

        <div className={`feedback-banner feedback-banner--${runState.lastFeedback.tone}`}>
          {runState.lastFeedback.message}
        </div>

        <div className="button-row">
          <button className="panel-button" type="button" onClick={restartSession}>
            Restart this session
          </button>
          <button className="panel-button" type="button" onClick={() => void generateNextSession()}>
            Generate next session
          </button>
        </div>
      </PageSection>

      <PageSection eyebrow="session" title="Current adaptive session details">
        <div className="metric-grid">
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
            <span>Scored keystrokes</span>
            <strong>{runState.scoredKeystrokes}</strong>
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
                {summary.weakKeys.map((entry) => (
                  <span key={entry.code} className="pill pill--soft">
                    {entry.label} x{entry.count}
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
              <p>
                Likely finger drift calls: <strong>{summary.likelyWrongFingerCount}</strong>
              </p>
              <p>
                Timing hesitation calls: <strong>{summary.timingHesitationCount}</strong>
              </p>
            </article>
          </div>
        ) : (
          <p>Complete the adaptive session to store a new summary in IndexedDB.</p>
        )}
      </PageSection>
    </div>
  );
}
