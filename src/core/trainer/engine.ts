import {
  areQwertyCodesNeighboring,
  getExpectedShiftSideForCharacter,
  getFingerZoneForCode,
  getHandForCode,
  getDisplayLabelForCode,
  getQwertyDescriptorForCharacter,
  usesAcronymException,
} from "../keyboard/qwerty";
import type {
  FingerZone,
  FingerZoneCount,
  KeyCount,
  KeySubstitutionCount,
  KeystrokeEvent,
  Lesson,
  MistakeType,
  ModifierSide,
  PracticeStrictness,
  Session,
  SessionMistake,
  SessionStatus,
  SessionSummary,
} from "../../shared/types/domain";

type FeedbackTone = "neutral" | "success" | "warning" | "error";

const TIMING_HESITATION_THRESHOLD_MS = 1500;
const delimiterCharacters = new Set(["(", ")", "[", "]", "{", "}", "<", ">", "'", "\"", "`"]);

export type LessonRunState = {
  profileId: string;
  lesson: Lesson;
  session: Session;
  promptIndex: number;
  cursorIndex: number;
  currentPromptInput: string;
  promptHistory: string[];
  rawKeydownCount: number;
  scoredKeystrokes: number;
  correctKeystrokes: number;
  backspaceCount: number;
  mistakes: SessionMistake[];
  lastFeedback: {
    tone: FeedbackTone;
    message: string;
  };
};

function initialFeedback() {
  return {
    tone: "neutral" as const,
    message: "Focus the lesson area and type without looking at the keyboard.",
  };
}

function createSession(lesson: Lesson, strictness: PracticeStrictness): Session {
  return {
    id: crypto.randomUUID(),
    lessonId: lesson.id,
    mode: lesson.mode,
    strictness,
    startedAt: new Date().toISOString(),
    status: "ready",
    promptIndex: 0,
    keystrokes: [],
  };
}

function isModifierStroke(keystroke: KeystrokeEvent) {
  return (
    keystroke.code.startsWith("Shift") ||
    keystroke.code.startsWith("Alt") ||
    keystroke.code.startsWith("Control") ||
    keystroke.code.startsWith("Meta")
  );
}

function normalizeScoredInput(keystroke: KeystrokeEvent) {
  if (keystroke.key === "Enter") {
    return "\n";
  }

  if (keystroke.key === "Tab") {
    return "\t";
  }

  if (keystroke.key.length === 1) {
    return keystroke.key;
  }

  return null;
}

function strictnessAllowsBackspace(strictness: PracticeStrictness) {
  return strictness !== "strict";
}

function shouldEnforceStrictShift(
  lesson: Lesson,
  strictness: PracticeStrictness,
  expectedCharacter: string,
  promptText: string,
  charIndex: number,
  expectedShiftSide: ModifierSide | null,
) {
  if (strictness !== "strict") {
    return false;
  }

  if (lesson.kind !== "technique") {
    return false;
  }

  if (!expectedShiftSide) {
    return false;
  }

  if (usesAcronymException(promptText, charIndex) && /[A-Z]/.test(expectedCharacter)) {
    return false;
  }

  return true;
}

function buildMistake(
  keystroke: KeystrokeEvent,
  promptId: string,
  promptIndex: number,
  charIndex: number,
  expected: string | null,
  type: MistakeType,
  tags: MistakeType[] = [],
  expectedShiftSide?: ModifierSide,
): SessionMistake {
  const expectedDescriptor = expected ? getQwertyDescriptorForCharacter(expected) : undefined;

  return {
    id: `${promptId}-${charIndex}-${keystroke.timestamp}-${type}`,
    promptId,
    promptIndex,
    charIndex,
    timestamp: keystroke.timestamp,
    expected,
    actual: keystroke.key,
    key: keystroke.key,
    code: keystroke.code,
    type,
    tags,
    shiftSide: keystroke.shiftSide,
    expectedShiftSide,
    expectedCode: expectedDescriptor?.code,
    expectedFingerZone: expectedDescriptor?.fingerZone,
    actualFingerZone: getFingerZoneForCode(keystroke.code),
  };
}

function incrementCount<T extends string>(counts: Map<T, number>, entry: T | undefined) {
  if (!entry) {
    return;
  }

  counts.set(entry, (counts.get(entry) ?? 0) + 1);
}

function mapToKeyCounts(counts: Map<string, number>): KeyCount[] {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([code, count]) => ({
      code,
      label: getDisplayLabelForCode(code),
      count,
    }));
}

function mapToFingerZoneCounts(counts: Map<FingerZone, number>): FingerZoneCount[] {
  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([fingerZone, count]) => ({
      fingerZone,
      count,
    }));
}

function mapToSubstitutionCounts(counts: Map<string, { expectedCode: string; actualCode: string; count: number }>): KeySubstitutionCount[] {
  return [...counts.values()]
    .sort((left, right) => right.count - left.count)
    .map((entry) => ({
      expectedCode: entry.expectedCode,
      expectedLabel: getDisplayLabelForCode(entry.expectedCode),
      actualCode: entry.actualCode,
      actualLabel: getDisplayLabelForCode(entry.actualCode),
      count: entry.count,
    }));
}

function detectLikelyWrongFinger(expectedCharacter: string, keystroke: KeystrokeEvent) {
  const expectedDescriptor = getQwertyDescriptorForCharacter(expectedCharacter);
  const actualFingerZone = getFingerZoneForCode(keystroke.code);
  const actualHand = getHandForCode(keystroke.code);

  if (!expectedDescriptor || !actualFingerZone || !actualHand) {
    return false;
  }

  if (expectedDescriptor.code === keystroke.code) {
    return false;
  }

  if (expectedDescriptor.hand !== actualHand) {
    return false;
  }

  if (expectedDescriptor.fingerZone === actualFingerZone) {
    return false;
  }

  return areQwertyCodesNeighboring(expectedDescriptor.code, keystroke.code);
}

function detectDelimiterMismatch(lesson: Lesson, expectedCharacter: string, actualText: string) {
  if (lesson.kind !== "code" || expectedCharacter === actualText) {
    return false;
  }

  return delimiterCharacters.has(expectedCharacter) && delimiterCharacters.has(actualText);
}

function getLastScoredKeydown(keystrokes: KeystrokeEvent[]) {
  for (let index = keystrokes.length - 1; index >= 0; index -= 1) {
    const keystroke = keystrokes[index];

    if (keystroke?.phase === "keydown" && keystroke.expected) {
      return keystroke;
    }
  }

  return null;
}

function detectTimingHesitation(state: LessonRunState, incomingKeystroke: KeystrokeEvent) {
  if (state.cursorIndex === 0) {
    return false;
  }

  const lastScoredKeydown = getLastScoredKeydown(state.session.keystrokes);

  if (!lastScoredKeydown) {
    return false;
  }

  return incomingKeystroke.timestamp - lastScoredKeydown.timestamp >= TIMING_HESITATION_THRESHOLD_MS;
}

export function createLessonRunState(
  lesson: Lesson,
  strictness: PracticeStrictness,
  profileId: string,
): LessonRunState {
  return {
    profileId,
    lesson,
    session: createSession(lesson, strictness),
    promptIndex: 0,
    cursorIndex: 0,
    currentPromptInput: "",
    promptHistory: [],
    rawKeydownCount: 0,
    scoredKeystrokes: 0,
    correctKeystrokes: 0,
    backspaceCount: 0,
    mistakes: [],
    lastFeedback: initialFeedback(),
  };
}

export function getCurrentPromptText(state: LessonRunState) {
  return state.lesson.prompts[state.promptIndex]?.text ?? "";
}

export function getCurrentPromptId(state: LessonRunState) {
  return state.lesson.prompts[state.promptIndex]?.id ?? "unknown-prompt";
}

export function getLessonRunStatus(state: LessonRunState): SessionStatus {
  return state.session.status ?? "ready";
}

export function getAccuracyPercent(state: LessonRunState) {
  if (state.scoredKeystrokes === 0) {
    return 100;
  }

  return (state.correctKeystrokes / state.scoredKeystrokes) * 100;
}

export function getElapsedMs(state: LessonRunState) {
  const startedAt = new Date(state.session.startedAt).getTime();
  const completedAt = state.session.completedAt
    ? new Date(state.session.completedAt).getTime()
    : Date.now();

  return Math.max(completedAt - startedAt, 1);
}

export function getLiveWpm(state: LessonRunState) {
  const minutes = getElapsedMs(state) / 60000;

  if (minutes <= 0) {
    return 0;
  }

  return state.correctKeystrokes / 5 / minutes;
}

export function processLessonKeystroke(
  state: LessonRunState,
  incomingKeystroke: KeystrokeEvent,
): LessonRunState {
  const keystrokes = [...state.session.keystrokes];
  const status = getLessonRunStatus(state);

  const baseState: LessonRunState = {
    ...state,
    session: {
      ...state.session,
      status: status === "ready" ? "in_progress" : status,
      keystrokes,
    },
  };

  if (status === "completed") {
    keystrokes.push(incomingKeystroke);
    return baseState;
  }

  if (incomingKeystroke.phase === "keyup") {
    keystrokes.push(incomingKeystroke);
    return baseState;
  }

  const rawKeydownCount = state.rawKeydownCount + 1;
  const promptText = getCurrentPromptText(state);
  const promptId = getCurrentPromptId(state);

  if (incomingKeystroke.key === "Backspace") {
    const keystroke = {
      ...incomingKeystroke,
      expected: null,
      isCorrect: strictnessAllowsBackspace(state.session.strictness),
    };

    keystrokes.push(keystroke);

    if (!strictnessAllowsBackspace(state.session.strictness) || state.cursorIndex === 0) {
      return {
        ...baseState,
        rawKeydownCount,
        backspaceCount: state.backspaceCount + 1,
        lastFeedback: {
          tone: "warning",
          message: "Strict mode keeps the cursor anchored. Correct the expected key directly.",
        },
      };
    }

    return {
      ...baseState,
      rawKeydownCount,
      backspaceCount: state.backspaceCount + 1,
      cursorIndex: Math.max(state.cursorIndex - 1, 0),
      currentPromptInput: state.currentPromptInput.slice(0, -1),
      lastFeedback: {
        tone: "neutral",
        message: "Backspace moved the cursor back by one character.",
      },
    };
  }

  if (isModifierStroke(incomingKeystroke)) {
    keystrokes.push({
      ...incomingKeystroke,
      expected: null,
      isCorrect: true,
    });

    return {
      ...baseState,
      rawKeydownCount,
    };
  }

  const actualText = normalizeScoredInput(incomingKeystroke);

  if (actualText === null) {
    keystrokes.push({
      ...incomingKeystroke,
      expected: null,
      isCorrect: true,
    });

    return {
      ...baseState,
      rawKeydownCount,
    };
  }

  const expectedCharacter = promptText[state.cursorIndex] ?? null;

  if (expectedCharacter === null) {
    keystrokes.push({
      ...incomingKeystroke,
      expected: null,
      isCorrect: true,
    });

    return {
      ...baseState,
      rawKeydownCount,
    };
  }

  const expectedShiftSide = getExpectedShiftSideForCharacter(expectedCharacter);
  const shiftMismatch =
    expectedShiftSide !== null &&
    incomingKeystroke.shiftPressed &&
    incomingKeystroke.shiftSide !== "both" &&
    incomingKeystroke.shiftSide !== expectedShiftSide &&
    !(usesAcronymException(promptText, state.cursorIndex) && /[A-Z]/.test(expectedCharacter));
  const keyMatches = actualText === expectedCharacter;
  const strictlyBlockShift = shouldEnforceStrictShift(
    state.lesson,
    state.session.strictness,
    expectedCharacter,
    promptText,
    state.cursorIndex,
    expectedShiftSide,
  );
  const fullyCorrect = keyMatches && !shiftMismatch;
  const shouldAdvance =
    state.session.strictness === "strict"
      ? fullyCorrect || (keyMatches && shiftMismatch && !strictlyBlockShift)
      : true;
  const mistakeTags =
    !keyMatches && detectLikelyWrongFinger(expectedCharacter, incomingKeystroke)
      ? (["likely-wrong-finger"] as MistakeType[])
      : [];
  const delimiterMismatch =
    !keyMatches && detectDelimiterMismatch(state.lesson, expectedCharacter, actualText);
  const timingHesitation = detectTimingHesitation(state, incomingKeystroke);
  const enrichedMistakeTags: MistakeType[] = delimiterMismatch
    ? [...mistakeTags, "delimiter-mismatch"]
    : mistakeTags;
  const mistakeType: MistakeType | undefined = !keyMatches
    ? "wrong-key"
    : shiftMismatch
      ? "wrong-shift-side"
      : undefined;

  keystrokes.push({
    ...incomingKeystroke,
    expected: expectedCharacter,
    isCorrect: fullyCorrect,
    errorType: mistakeType,
    errorTags: timingHesitation ? [...enrichedMistakeTags, "timing-hesitation"] : enrichedMistakeTags,
  });

  const mistakes = [...state.mistakes];

  if (mistakeType !== undefined) {
    mistakes.push(
      buildMistake(
        incomingKeystroke,
        promptId,
        state.promptIndex,
        state.cursorIndex,
        expectedCharacter,
        mistakeType,
        enrichedMistakeTags,
        expectedShiftSide ?? undefined,
      ),
    );
  }

  if (timingHesitation) {
    mistakes.push(
      buildMistake(
        incomingKeystroke,
        promptId,
        state.promptIndex,
        state.cursorIndex,
        expectedCharacter,
        "timing-hesitation",
      ),
    );
  }

  const nextScoredKeystrokes = state.scoredKeystrokes + 1;
  const nextCorrectKeystrokes = state.correctKeystrokes + (fullyCorrect ? 1 : 0);
  const nextCursorIndex = shouldAdvance ? state.cursorIndex + 1 : state.cursorIndex;
  const nextPromptInput = shouldAdvance
    ? `${state.currentPromptInput}${actualText}`
    : state.currentPromptInput;
  const promptCompleted = nextCursorIndex >= promptText.length;

  if (!promptCompleted) {
    return {
      ...baseState,
      rawKeydownCount,
      scoredKeystrokes: nextScoredKeystrokes,
      correctKeystrokes: nextCorrectKeystrokes,
      cursorIndex: nextCursorIndex,
      currentPromptInput: nextPromptInput,
      mistakes,
      lastFeedback: fullyCorrect
        ? timingHesitation
          ? {
              tone: "warning",
              message: `Correct key, but the pause before "${expectedCharacter}" was long. Keep the rhythm steadier.`,
            }
          : {
              tone: "success",
              message: "Clean keystroke. Keep the rhythm steady.",
            }
        : shiftMismatch
          ? {
              tone: strictlyBlockShift ? "error" : "warning",
              message: strictlyBlockShift
                ? `Use ${expectedShiftSide} Shift for this character in strict technique mode.`
                : "Shift-side technique is off. The character was accepted but logged.",
            }
          : mistakeTags.includes("likely-wrong-finger")
            ? {
                tone: state.session.strictness === "strict" ? "error" : "warning",
                message:
                  state.session.strictness === "strict"
                    ? `Expected "${expectedCharacter}". The miss looks like adjacent finger drift.`
                    : `Expected "${expectedCharacter}". Logged the miss and tagged it as likely finger drift.`,
              }
            : delimiterMismatch
              ? {
                  tone: state.session.strictness === "strict" ? "error" : "warning",
                  message:
                    state.session.strictness === "strict"
                      ? `Expected "${expectedCharacter}". This looks like paired-delimiter drift in code syntax.`
                      : `Expected "${expectedCharacter}". Logged the miss as a code delimiter mismatch.`,
                }
            : {
                tone: state.session.strictness === "strict" ? "error" : "warning",
                message:
                  state.session.strictness === "strict"
                    ? `Expected "${expectedCharacter}" before moving on.`
                    : `Expected "${expectedCharacter}" but logged "${actualText}".`,
              },
    };
  }

  const promptHistory = [...state.promptHistory, nextPromptInput];
  const finalPrompt = state.promptIndex === state.lesson.prompts.length - 1;

  if (finalPrompt) {
    return {
      ...baseState,
      rawKeydownCount,
      scoredKeystrokes: nextScoredKeystrokes,
      correctKeystrokes: nextCorrectKeystrokes,
      cursorIndex: promptText.length,
      currentPromptInput: nextPromptInput,
      promptHistory,
      mistakes,
      session: {
        ...baseState.session,
        promptIndex: state.lesson.prompts.length,
        status: "completed",
        completedAt: new Date().toISOString(),
      },
      lastFeedback: {
        tone: "success",
        message: "Lesson complete. Session summary is ready to store locally.",
      },
    };
  }

  return {
    ...baseState,
    rawKeydownCount,
    scoredKeystrokes: nextScoredKeystrokes,
    correctKeystrokes: nextCorrectKeystrokes,
    promptIndex: state.promptIndex + 1,
    cursorIndex: 0,
    currentPromptInput: "",
    promptHistory,
    mistakes,
    session: {
      ...baseState.session,
      promptIndex: state.promptIndex + 1,
      status: "in_progress",
    },
    lastFeedback: {
      tone: "success",
      message: "Prompt complete. Move to the next line without looking down.",
    },
  };
}

export function buildSessionSummary(state: LessonRunState): SessionSummary | null {
  if (getLessonRunStatus(state) !== "completed" || !state.session.completedAt) {
    return null;
  }

  const mistakeCounts = new Map<MistakeType, number>();
  const expectedKeyCounts = new Map<string, number>();
  const mistakeKeyCounts = new Map<string, number>();
  const expectedFingerZoneCounts = new Map<FingerZone, number>();
  const mistakeFingerZoneCounts = new Map<FingerZone, number>();
  const hesitationKeyCounts = new Map<string, number>();
  const hesitationFingerZoneCounts = new Map<FingerZone, number>();
  const substitutionCounts = new Map<
    string,
    { expectedCode: string; actualCode: string; count: number }
  >();

  for (const keystroke of state.session.keystrokes) {
    if (keystroke.phase !== "keydown" || !keystroke.expected) {
      continue;
    }

    const expectedDescriptor = getQwertyDescriptorForCharacter(keystroke.expected);

    incrementCount(expectedKeyCounts, expectedDescriptor?.code);
    incrementCount(expectedFingerZoneCounts, expectedDescriptor?.fingerZone);
  }

  for (const mistake of state.mistakes) {
    const countedTypes = new Set([mistake.type, ...(mistake.tags ?? [])]);

    for (const countedType of countedTypes) {
      incrementCount(mistakeCounts, countedType);
    }

    if (mistake.type === "timing-hesitation") {
      incrementCount(hesitationKeyCounts, mistake.expectedCode);
      incrementCount(hesitationFingerZoneCounts, mistake.expectedFingerZone);
      continue;
    }

    incrementCount(mistakeKeyCounts, mistake.expectedCode);
    incrementCount(mistakeFingerZoneCounts, mistake.expectedFingerZone);

    if (mistake.expectedCode && mistake.code && mistake.expectedCode !== mistake.code) {
      const key = `${mistake.expectedCode}->${mistake.code}`;
      const current = substitutionCounts.get(key);

      substitutionCounts.set(key, {
        expectedCode: mistake.expectedCode,
        actualCode: mistake.code,
        count: (current?.count ?? 0) + 1,
      });
    }
  }

  const expectedKeyCountList = mapToKeyCounts(expectedKeyCounts);
  const mistakeKeyCountList = mapToKeyCounts(mistakeKeyCounts);
  const expectedFingerZoneCountList = mapToFingerZoneCounts(expectedFingerZoneCounts);
  const mistakeFingerZoneCountList = mapToFingerZoneCounts(mistakeFingerZoneCounts);
  const hesitationKeyCountList = mapToKeyCounts(hesitationKeyCounts);
  const hesitationFingerZoneCountList = mapToFingerZoneCounts(hesitationFingerZoneCounts);
  const substitutionCountList = mapToSubstitutionCounts(substitutionCounts);

  return {
    id: state.session.id,
    profileId: state.profileId,
    lessonId: state.lesson.id,
    lessonTitle: state.lesson.title,
    mode: state.lesson.mode,
    strictness: state.session.strictness,
    startedAt: state.session.startedAt,
    completedAt: state.session.completedAt,
    durationMs: getElapsedMs(state),
    rawKeydownCount: state.rawKeydownCount,
    scoredKeystrokes: state.scoredKeystrokes,
    correctKeystrokes: state.correctKeystrokes,
    backspaceCount: state.backspaceCount,
    accuracy: getAccuracyPercent(state),
    shiftSideErrors: mistakeCounts.get("wrong-shift-side") ?? 0,
    likelyWrongFingerCount: mistakeCounts.get("likely-wrong-finger") ?? 0,
    timingHesitationCount: mistakeCounts.get("timing-hesitation") ?? 0,
    mistakeCounts: Object.fromEntries(mistakeCounts),
    expectedKeyCounts: expectedKeyCountList,
    mistakeKeyCounts: mistakeKeyCountList,
    expectedFingerZoneCounts: expectedFingerZoneCountList,
    mistakeFingerZoneCounts: mistakeFingerZoneCountList,
    hesitationKeyCounts: hesitationKeyCountList,
    hesitationFingerZoneCounts: hesitationFingerZoneCountList,
    substitutionCounts: substitutionCountList,
    weakKeys: mistakeKeyCountList.slice(0, 5),
    weakFingerZones: mistakeFingerZoneCountList.slice(0, 5),
  };
}
