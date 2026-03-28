import { useEffect, useRef, useState } from "react";

import { KeyboardCaptureEngine } from "../../core/keyboard/capture-engine";
import type { KeystrokeEvent } from "../../shared/types/domain";
import {
  shouldBypassKeyboardCapture,
  shouldIgnoreEditableTargetForGlobalShortcut,
  shouldReleaseKeyboardCapture,
} from "../../shared/lib/keyboard";
import { KeyboardCaptureSurface } from "../../shared/ui/KeyboardCaptureSurface";
import { PageSection } from "../../shared/ui/PageSection";

const capturedEventsLimit = 12;

function formatModifierState(event: KeystrokeEvent) {
  const modifiers = [
    event.ctrlKey ? "Ctrl" : null,
    event.altKey ? "Alt" : null,
    event.metaKey ? "Meta" : null,
    event.shiftPressed ? `Shift:${event.shiftSide}` : null,
  ].filter(Boolean);

  return modifiers.length > 0 ? modifiers.join(" + ") : "None";
}

export function FreePracticePage() {
  const engineRef = useRef(new KeyboardCaptureEngine());
  const captureSurfaceRef = useRef<HTMLTextAreaElement | null>(null);
  const [capturedEvents, setCapturedEvents] = useState<KeystrokeEvent[]>([]);

  useEffect(() => {
    captureSurfaceRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleFreePracticeShortcut(event: KeyboardEvent) {
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
      }
    }

    window.addEventListener("keydown", handleFreePracticeShortcut);

    return () => {
      window.removeEventListener("keydown", handleFreePracticeShortcut);
    };
  }, []);

  function pushCapturedEvent(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.currentTarget.blur();
      return;
    }

    if (shouldReleaseKeyboardCapture(event.key)) {
      return;
    }

    if (shouldBypassKeyboardCapture(event)) {
      return;
    }

    event.preventDefault();

    const capturedEvent = engineRef.current.processEvent({
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

    setCapturedEvents((current) => [capturedEvent, ...current].slice(0, capturedEventsLimit));
  }

  const latest = capturedEvents[0];

  return (
    <div className="page-grid">
      <PageSection eyebrow="raw capture" title="Keyboard event inspection">
        <p>
          This page is the Phase 1 proof point for physical-key capture. Focus the panel and type.
          The engine records key identity, location, and active shift side so later lessons can
          reason about technique rather than just final characters.
        </p>
        <KeyboardCaptureSurface
          ref={captureSurfaceRef}
          ariaLabel="Free practice keyboard capture"
          autoFocus
          className="capture-surface"
          onCaptureBlur={() => {
            engineRef.current.resetModifiers();
          }}
          onKeyDown={pushCapturedEvent}
          onKeyUp={pushCapturedEvent}
        >
          Focused capture panel. Type here without looking down. Press Tab to leave the capture
          area or Escape to blur it.
        </KeyboardCaptureSurface>
      </PageSection>

      <PageSection eyebrow="latest event" title="Most recent keystroke">
        {latest ? (
          <div className="metric-grid">
            <article className="metric-card">
              <span>Key</span>
              <strong>{latest.key}</strong>
            </article>
            <article className="metric-card">
              <span>Code</span>
              <strong>{latest.code}</strong>
            </article>
            <article className="metric-card">
              <span>Location</span>
              <strong>{latest.location}</strong>
            </article>
            <article className="metric-card">
              <span>Shift side</span>
              <strong>{latest.shiftSide}</strong>
            </article>
            <article className="metric-card">
              <span>Modifiers</span>
              <strong>{formatModifierState(latest)}</strong>
            </article>
            <article className="metric-card">
              <span>Phase</span>
              <strong>{latest.phase}</strong>
            </article>
          </div>
        ) : (
          <p>No keystrokes captured yet.</p>
        )}
      </PageSection>

      <PageSection eyebrow="event log" title="Recent events">
        <div className="event-log">
          {capturedEvents.map((event) => (
            <article key={event.id} className="event-row">
              <code>{event.phase}</code>
              <code>{event.code}</code>
              <code>{event.key}</code>
              <code>{event.location}</code>
              <code>{formatModifierState(event)}</code>
            </article>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
