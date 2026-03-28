export type Locale = "en" | "de";
export type CodeLanguage = "python" | "micropython" | "c";
export type PracticeMode = "guided" | "adaptive" | "free" | "coding";
export type LessonKind = "technique" | "prose" | "code";
export type PracticeStrictness = "strict" | "guided" | "relaxed";
export type KeyLocation = "standard" | "left" | "right" | "numpad";
export type ModifierSide = "none" | "left" | "right" | "both";
export type KeystrokePhase = "keydown" | "keyup";
export type SessionStatus = "ready" | "in_progress" | "completed";
export type FingerZone =
  | "left-pinky"
  | "left-ring"
  | "left-middle"
  | "left-index"
  | "left-thumb"
  | "right-thumb"
  | "right-index"
  | "right-middle"
  | "right-ring"
  | "right-pinky";
export type MistakeType =
  | "wrong-key"
  | "wrong-shift-side"
  | "timing-hesitation"
  | "likely-wrong-finger"
  | "delimiter-mismatch";

export type KeyCount = {
  code: string;
  label: string;
  count: number;
};

export type FingerZoneCount = {
  fingerZone: FingerZone;
  count: number;
};

export type KeySubstitutionCount = {
  expectedCode: string;
  expectedLabel: string;
  actualCode: string;
  actualLabel: string;
  count: number;
};

export type ProfilePreferences = {
  strictness: PracticeStrictness;
  showFingerGuides: boolean;
  preferredPracticeLanguages: Array<Locale | CodeLanguage>;
};

export type Profile = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  preferences: ProfilePreferences;
};

export type Prompt = {
  id: string;
  text: string;
  notes?: string;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  mode: PracticeMode;
  kind: LessonKind;
  stage?: number;
  sequence?: number;
  prerequisiteLessonIds?: string[];
  goals: string[];
  prompts: Prompt[];
  tags: string[];
  estimatedMinutes: number;
  locale?: Locale;
  codeLanguage?: CodeLanguage;
};

export type KeystrokeEvent = {
  id: string;
  timestamp: number;
  phase: KeystrokePhase;
  expected: string | null;
  key: string;
  code: string;
  location: KeyLocation;
  shiftPressed: boolean;
  shiftSide: ModifierSide;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  repeat: boolean;
  isCorrect?: boolean;
  errorType?: MistakeType;
  errorTags?: MistakeType[];
};

export type SessionMistake = {
  id: string;
  promptId: string;
  promptIndex: number;
  charIndex: number;
  timestamp: number;
  expected: string | null;
  actual: string;
  key: string;
  code: string;
  type: MistakeType;
  tags?: MistakeType[];
  shiftSide: ModifierSide;
  expectedShiftSide?: ModifierSide;
  expectedCode?: string;
  expectedFingerZone?: FingerZone;
  actualFingerZone?: FingerZone;
};

export type Session = {
  id: string;
  lessonId: string;
  mode: PracticeMode;
  strictness: PracticeStrictness;
  startedAt: string;
  completedAt?: string;
  status?: SessionStatus;
  promptIndex: number;
  keystrokes: KeystrokeEvent[];
};

export type StatsSnapshot = {
  totalKeystrokes: number;
  correctKeystrokes: number;
  sessionsCompleted: number;
  weakestKeys: string[];
  weakestFingerZones: string[];
};

export type SessionSummary = {
  id: string;
  profileId: string;
  lessonId: string;
  lessonTitle: string;
  mode: PracticeMode;
  strictness: PracticeStrictness;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  rawKeydownCount: number;
  scoredKeystrokes: number;
  correctKeystrokes: number;
  backspaceCount: number;
  accuracy: number;
  shiftSideErrors: number;
  likelyWrongFingerCount: number;
  timingHesitationCount: number;
  mistakeCounts: Partial<Record<MistakeType, number>>;
  expectedKeyCounts: KeyCount[];
  mistakeKeyCounts: KeyCount[];
  expectedFingerZoneCounts: FingerZoneCount[];
  mistakeFingerZoneCounts: FingerZoneCount[];
  hesitationKeyCounts: KeyCount[];
  hesitationFingerZoneCounts: FingerZoneCount[];
  substitutionCounts: KeySubstitutionCount[];
  weakKeys: KeyCount[];
  weakFingerZones: FingerZoneCount[];
};

export type Recommendation = {
  id: string;
  title: string;
  reason: string;
  focus: string[];
  lessonId?: string;
};
