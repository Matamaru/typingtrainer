import { getFingerGuide } from "../../core/keyboard/finger-guide";

type FingerGuidePanelProps = {
  promptText: string;
  cursorIndex: number;
};

export function FingerGuidePanel({ promptText, cursorIndex }: FingerGuidePanelProps) {
  const guide = getFingerGuide(promptText, cursorIndex);

  if (!guide) {
    return null;
  }

  return (
    <div className="guide-panel">
      <p className="eyebrow">finger guide</p>
      <div className="guide-grid">
        <article className="metric-card">
          <span>Target character</span>
          <strong>{guide.characterLabel}</strong>
        </article>
        <article className="metric-card">
          <span>Target key</span>
          <strong>{guide.keyLabel}</strong>
        </article>
        <article className="metric-card">
          <span>Finger</span>
          <strong>{guide.fingerZoneLabel}</strong>
        </article>
        <article className="metric-card">
          <span>Hand and row</span>
          <strong>
            {guide.handLabel}, {guide.rowLabel}
          </strong>
        </article>
      </div>
      {guide.shiftHint ? <p className="lesson-helper">{guide.shiftHint}</p> : null}
      {guide.returnCue ? <p className="lesson-helper">{guide.returnCue}</p> : null}
    </div>
  );
}
