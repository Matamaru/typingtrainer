import { useEffect, useRef, useState } from "react";

import { KeyboardCaptureEngine } from "../../core/keyboard/capture-engine";
import {
  shortcutDrills,
  shortcutStrokeMatchesDrill,
  type ShortcutPreview,
} from "../../core/keyboard/shortcut-trainer";
import type { KeystrokeEvent } from "../../shared/types/domain";
import { shouldIgnoreEditableTargetForGlobalShortcut, shouldReleaseKeyboardCapture } from "../../shared/lib/keyboard";
import { KeyboardCaptureSurface } from "../../shared/ui/KeyboardCaptureSurface";
import { PageSection } from "../../shared/ui/PageSection";

type FeedbackState = {
  tone: "neutral" | "success" | "warning";
  message: string;
};

function renderShortcutPreview(preview: ShortcutPreview) {
  const selectionStart = preview.selectionStart ?? preview.cursorIndex;
  const selectionEnd = preview.selectionEnd ?? preview.cursorIndex;

  return preview.text.split("").map((character, index) => {
    const isSelected = index >= selectionStart && index < selectionEnd;
    const isCursor = selectionStart === selectionEnd && index === preview.cursorIndex;
    const className = isSelected
      ? "shortcut-char shortcut-char--selected"
      : isCursor
        ? "shortcut-char shortcut-char--cursor"
        : "shortcut-char";

    return (
      <span key={`${character}-${index}`} className={className}>
        {character === " " ? "\u00A0" : character}
      </span>
    );
  });
}

function formatStroke(event: KeystrokeEvent | null) {
  if (!event) {
    return "No shortcut attempt yet.";
  }

  const modifiers = [
    event.ctrlKey ? "Ctrl" : null,
    event.altKey ? "Alt" : null,
    event.shiftPressed ? "Shift" : null,
    event.metaKey ? "Meta" : null,
  ].filter(Boolean);

  return `${modifiers.length > 0 ? `${modifiers.join("+")}+` : ""}${event.code}`;
}

export function ShortcutTrainingPage() {
  const captureSurfaceRef = useRef<HTMLTextAreaElement | null>(null);
  const restartButtonRef = useRef<HTMLButtonElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);
  const captureEngineRef = useRef(new KeyboardCaptureEngine());
  const [drillIndex, setDrillIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctHits, setCorrectHits] = useState(0);
  const [resolvedDrillIds, setResolvedDrillIds] = useState<string[]>([]);
  const [lastStroke, setLastStroke] = useState<KeystrokeEvent | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>({
    tone: "neutral",
    message: "Focus the panel and press the requested editor shortcut.",
  });

  const currentDrill = shortcutDrills[drillIndex] ?? null;
  const isCurrentResolved = currentDrill ? resolvedDrillIds.includes(currentDrill.id) : false;
  const progressLabel = `${Math.min(drillIndex + 1, shortcutDrills.length)}/${shortcutDrills.length}`;
  const accuracy = attempts === 0 ? 100 : (correctHits / attempts) * 100;
  const preview = currentDrill ? (isCurrentResolved ? currentDrill.after : currentDrill.before) : null;

  useEffect(() => {
    captureSurfaceRef.current?.focus();
  }, [drillIndex]);

  useEffect(() => {
    if (!currentDrill || !isCurrentResolved) {
      return;
    }

    window.requestAnimationFrame(() => {
      nextButtonRef.current?.focus();
    });
  }, [currentDrill, isCurrentResolved]);

  function restartPack() {
    captureEngineRef.current = new KeyboardCaptureEngine();
    setDrillIndex(0);
    setAttempts(0);
    setCorrectHits(0);
    setResolvedDrillIds([]);
    setLastStroke(null);
    setFeedback({
      tone: "neutral",
      message: "Shortcut pack restarted. Focus the panel and press the requested editor shortcut.",
    });
  }

  function goToNextDrill() {
    setDrillIndex((current) => Math.min(current + 1, shortcutDrills.length - 1));
    setLastStroke(null);
    setFeedback({
      tone: "neutral",
      message: "Next shortcut loaded. Press the requested chord without touching the mouse.",
    });
  }

  function handleShortcutKeyEvent(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!currentDrill) {
      return;
    }

    if (event.key === "Escape") {
      event.currentTarget.blur();
      restartButtonRef.current?.focus();
      return;
    }

    if (shouldReleaseKeyboardCapture(event.key)) {
      return;
    }

    if (!event.ctrlKey && !event.metaKey && event.altKey && event.shiftKey) {
      return;
    }

    if (event.metaKey) {
      return;
    }

    event.preventDefault();

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

    if (keystroke.phase !== "keydown") {
      return;
    }

    setLastStroke(keystroke);
    setAttempts((current) => current + 1);

    if (shortcutStrokeMatchesDrill(keystroke, currentDrill)) {
      setCorrectHits((current) => current + 1);
      setResolvedDrillIds((current) =>
        current.includes(currentDrill.id) ? current : [...current, currentDrill.id],
      );
      setFeedback({
        tone: "success",
        message: `Correct. ${currentDrill.shortcutLabel} is now mapped to this editor action.`,
      });
      return;
    }

    setFeedback({
      tone: "warning",
      message: `Expected ${currentDrill.shortcutLabel}. Try the chord again without reaching for the mouse.`,
    });
  }

  useEffect(() => {
    function handleShortcutTrainingShortcut(event: KeyboardEvent) {
      if (
        event.defaultPrevented ||
        !event.altKey ||
        !event.shiftKey ||
        event.ctrlKey ||
        event.metaKey ||
        shouldIgnoreEditableTargetForGlobalShortcut(event.target)
      ) {
        return;
      }

      if (event.code === "KeyT") {
        event.preventDefault();
        captureSurfaceRef.current?.focus();
        return;
      }

      if (event.code === "KeyR") {
        event.preventDefault();
        restartPack();
        return;
      }

      if (event.code === "KeyN" && isCurrentResolved && drillIndex < shortcutDrills.length - 1) {
        event.preventDefault();
        goToNextDrill();
      }
    }

    window.addEventListener("keydown", handleShortcutTrainingShortcut);

    return () => {
      window.removeEventListener("keydown", handleShortcutTrainingShortcut);
    };
  }, [drillIndex, isCurrentResolved]);

  if (!currentDrill || !preview) {
    return (
      <div className="page-grid">
        <PageSection eyebrow="shortcuts" title="Shortcut training">
          <p>All shortcut drills are complete.</p>
        </PageSection>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <PageSection eyebrow="shortcuts" title="Shortcut training">
        <p>
          This pack trains browser-safe editor shortcuts such as word jumps, chunk deletion, line
          navigation, and selection chords. Browser-reserved commands like address-bar focus are
          intentionally excluded.
        </p>
        <div className="metric-grid">
          <article className="metric-card">
            <span>Drill</span>
            <strong>{progressLabel}</strong>
          </article>
          <article className="metric-card">
            <span>Accuracy</span>
            <strong>{accuracy.toFixed(1)}%</strong>
          </article>
          <article className="metric-card">
            <span>Resolved drills</span>
            <strong>{resolvedDrillIds.length}</strong>
          </article>
          <article className="metric-card">
            <span>Latest attempt</span>
            <strong>{formatStroke(lastStroke)}</strong>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="drill" title={currentDrill.title}>
        <p>{currentDrill.description}</p>
        <div className="summary-grid">
          <article className="lesson-card">
            <h3>Press</h3>
            <p className="shortcut-target">
              <strong>{currentDrill.shortcutLabel}</strong>
            </p>
          </article>
          <article className="lesson-card">
            <h3>Why it matters</h3>
            <p>
              Use this to recover or navigate in chunks so correction stays deliberate instead of
              character-by-character.
            </p>
          </article>
        </div>
      </PageSection>

      <PageSection eyebrow="preview" title="Editor preview">
        <KeyboardCaptureSurface
          ref={captureSurfaceRef}
          ariaLabel="Shortcut training capture"
          autoFocus
          className="capture-surface lesson-surface"
          onCaptureBlur={() => {
            captureEngineRef.current.resetModifiers();
          }}
          onKeyDown={handleShortcutKeyEvent}
          onKeyUp={handleShortcutKeyEvent}
        >
          <p className="eyebrow">before and after action</p>
          <div className="shortcut-preview" aria-live="polite">
            {renderShortcutPreview(preview)}
          </div>
          <p className="lesson-helper">
            Press the target shortcut inside this panel. Tab leaves capture, Escape blurs it, and
            Alt+Shift+T focuses it again.
          </p>
        </KeyboardCaptureSurface>

        <div className={`feedback-banner feedback-banner--${feedback.tone}`}>
          {feedback.message}
        </div>

        <div className="button-row">
          <button
            ref={restartButtonRef}
            className="panel-button"
            type="button"
            aria-keyshortcuts="Alt+Shift+R"
            onClick={restartPack}
          >
            Restart pack
          </button>
          <button
            ref={nextButtonRef}
            className="panel-button"
            type="button"
            aria-keyshortcuts="Alt+Shift+N"
            disabled={!isCurrentResolved || drillIndex >= shortcutDrills.length - 1}
            onClick={goToNextDrill}
          >
            Next drill
          </button>
        </div>
      </PageSection>
    </div>
  );
}
