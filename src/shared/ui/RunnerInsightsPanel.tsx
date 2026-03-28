import type { SessionMistake, SessionStatus } from "../types/domain";

type RunnerInsightsPanelProps = {
  currentPromptText: string;
  cursorIndex: number;
  latestMistake?: SessionMistake;
  lastFeedback: {
    tone: "neutral" | "success" | "warning" | "error";
    message: string;
  };
  nextActionLabel: string;
  promptCount: number;
  promptHistoryLength: number;
  promptNumber: number;
  sectionTitle?: string;
  status: SessionStatus;
};

function formatCharacter(value: string | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "none";
  }

  if (value === " ") {
    return "Space";
  }

  if (value === "\n") {
    return "Enter";
  }

  if (value === "\t") {
    return "Tab";
  }

  return value;
}

function getMistakeHint(mistake: SessionMistake) {
  if (mistake.type === "wrong-shift-side") {
    return `Use ${mistake.expectedShiftSide ?? "the expected"} Shift side for this character.`;
  }

  if (mistake.type === "timing-hesitation") {
    return "The pause before this target was long. Reduce speed and keep the rhythm even.";
  }

  if (mistake.tags?.includes("delimiter-mismatch")) {
    return "Treat paired delimiters as a deliberate shape pattern rather than a fast guess.";
  }

  if (mistake.tags?.includes("likely-wrong-finger")) {
    return "This looks like adjacent finger drift. Slow the reach and return to the home position.";
  }

  return "Type the expected key cleanly before adding speed.";
}

function getMistakeLabel(mistake: SessionMistake) {
  switch (mistake.type) {
    case "wrong-key":
      return "Wrong key";
    case "wrong-shift-side":
      return "Wrong Shift side";
    case "timing-hesitation":
      return "Timing hesitation";
    case "likely-wrong-finger":
      return "Likely wrong finger";
    case "delimiter-mismatch":
      return "Delimiter mismatch";
    default:
      return mistake.type;
  }
}

function buildProgressPercent(
  status: SessionStatus,
  promptCount: number,
  promptHistoryLength: number,
  currentPromptText: string,
  cursorIndex: number,
) {
  if (promptCount === 0) {
    return 0;
  }

  if (status === "completed") {
    return 100;
  }

  const promptProgress = currentPromptText.length > 0 ? cursorIndex / currentPromptText.length : 0;
  const totalProgress = (promptHistoryLength + promptProgress) / promptCount;

  return Math.max(0, Math.min(totalProgress * 100, 100));
}

export function RunnerInsightsPanel({
  currentPromptText,
  cursorIndex,
  latestMistake,
  lastFeedback,
  nextActionLabel,
  promptCount,
  promptHistoryLength,
  promptNumber,
  sectionTitle = "Session flow",
  status,
}: RunnerInsightsPanelProps) {
  const progressPercent = buildProgressPercent(
    status,
    promptCount,
    promptHistoryLength,
    currentPromptText,
    cursorIndex,
  );
  const inPromptProgress = currentPromptText.length > 0 ? `${cursorIndex}/${currentPromptText.length}` : "0/0";
  const showTransitionPreview =
    status === "in_progress" && promptHistoryLength > 0 && cursorIndex === 0 && currentPromptText.length > 0;

  return (
    <div className="summary-grid runner-insights">
      <article className="lesson-card runner-card">
        <h3>{sectionTitle}</h3>
        <div className="progress-track progress-track--runner" aria-hidden="true">
          <span style={{ width: `${Math.max(progressPercent, 4)}%` }} />
        </div>
        <div className="runner-card__meta">
          <p>
            Prompt <strong>{promptNumber}</strong> of <strong>{promptCount}</strong>
          </p>
          <p>
            Current prompt progress: <strong>{inPromptProgress}</strong>
          </p>
        </div>
        {showTransitionPreview ? (
          <>
            <p className="status-line">Next prompt is ready. Stay on screen and carry the rhythm forward.</p>
            <pre className="prompt-preview prompt-preview--next">{currentPromptText}</pre>
          </>
        ) : status === "completed" ? (
          <p className="status-line">Session complete. Next action: {nextActionLabel}.</p>
        ) : (
          <p className="status-line">Current status: {status}. Next action stays available by keyboard or mouse.</p>
        )}
      </article>

      <article className="lesson-card runner-card">
        <h3>Latest correction</h3>
        <p className={`status-line status-line--${lastFeedback.tone}`}>{lastFeedback.message}</p>
        {latestMistake ? (
          <>
            <div className="runner-correction-grid">
              <p>
                Expected <strong>{formatCharacter(latestMistake.expected)}</strong>
              </p>
              <p>
                Actual <strong>{formatCharacter(latestMistake.actual)}</strong>
              </p>
              <p>
                Type <strong>{getMistakeLabel(latestMistake)}</strong>
              </p>
            </div>
            <div className="pill-row">
              <span className="pill pill--soft">{getMistakeLabel(latestMistake)}</span>
              {(latestMistake.tags ?? []).map((tag) => (
                <span key={tag} className="pill pill--soft">
                  {tag}
                </span>
              ))}
            </div>
            <p className="status-line">{getMistakeHint(latestMistake)}</p>
          </>
        ) : (
          <p className="status-line">
            No logged correction yet. Keep the rhythm calm and the expected key path deliberate.
          </p>
        )}
      </article>
    </div>
  );
}
