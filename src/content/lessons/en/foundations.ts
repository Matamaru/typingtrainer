import type { Lesson } from "../../../shared/types/domain";

export const englishHomeRowLesson: Lesson = {
  id: "en-home-row-foundations",
  title: "Home Row Foundations",
  summary: "Build steady home-row control before expanding to wider reach.",
  mode: "guided",
  kind: "technique",
  stage: 1,
  sequence: 1,
  locale: "en",
  estimatedMinutes: 10,
  tags: ["home-row", "accuracy", "beginner"],
  goals: [
    "Keep the eyes on screen rather than on the keyboard.",
    "Build relaxed repetition across asdf jkl; patterns.",
    "Start linking finger placement to physical key positions.",
  ],
  prompts: [
    { id: "hr-1", text: "asdf jkl;" },
    { id: "hr-2", text: "sad lad; ask flask" },
    { id: "hr-3", text: "all fall; ask dad" },
  ],
};

export const englishFingerMapLesson: Lesson = {
  id: "en-finger-map-anchors",
  title: "Finger Map Anchors",
  summary: "Train each home-row finger as its own reliable anchor point.",
  mode: "guided",
  kind: "technique",
  stage: 1,
  sequence: 2,
  prerequisiteLessonIds: ["en-home-row-foundations"],
  locale: "en",
  estimatedMinutes: 9,
  tags: ["fingering", "anchors", "beginner"],
  goals: [
    "Separate pinky, ring, middle, and index work instead of smearing them together.",
    "Treat each finger as responsible for a small stable zone.",
    "Build deliberate, not rushed, repetition.",
  ],
  prompts: [
    { id: "fm-1", text: "aa ss dd ff jj kk ll ;;" },
    { id: "fm-2", text: "as sd df fj jk kl l;" },
    { id: "fm-3", text: "lad; ask; fall; dad;" },
  ],
};

export const englishTopRowLesson: Lesson = {
  id: "en-top-row-reach",
  title: "Top Row Reach",
  summary: "Expand upward without losing the home-row return path.",
  mode: "guided",
  kind: "technique",
  stage: 2,
  sequence: 1,
  prerequisiteLessonIds: ["en-finger-map-anchors"],
  locale: "en",
  estimatedMinutes: 10,
  tags: ["top-row", "reach", "accuracy"],
  goals: [
    "Reach upward and come back to home row cleanly.",
    "Keep the stretch controlled rather than snapping at keys.",
    "Reinforce QWERTY top-row muscle memory.",
  ],
  prompts: [
    { id: "tr-1", text: "qwer uiop" },
    { id: "tr-2", text: "we are quiet up here" },
    { id: "tr-3", text: "type your wire route" },
  ],
};

export const englishBottomRowLesson: Lesson = {
  id: "en-bottom-row-reach",
  title: "Bottom Row Reach",
  summary: "Expand downward while keeping pinky and ring control stable.",
  mode: "guided",
  kind: "technique",
  stage: 2,
  sequence: 2,
  prerequisiteLessonIds: ["en-top-row-reach"],
  locale: "en",
  estimatedMinutes: 10,
  tags: ["bottom-row", "reach", "accuracy"],
  goals: [
    "Keep downward reaches light and accurate.",
    "Avoid collapsing into finger watching on zxcv and nm,.",
    "Return to the home row after each reach.",
  ],
  prompts: [
    { id: "br-1", text: "zxcv nm,." },
    { id: "br-2", text: "calm zooms mix vivid moves." },
    { id: "br-3", text: "x and c stay close; n and m stay calm." },
  ],
};

export const englishNumberRowLesson: Lesson = {
  id: "en-number-row-rhythm",
  title: "Number Row Rhythm",
  summary: "Introduce the number row without throwing away finger discipline.",
  mode: "guided",
  kind: "technique",
  stage: 2,
  sequence: 3,
  prerequisiteLessonIds: ["en-bottom-row-reach"],
  locale: "en",
  estimatedMinutes: 8,
  tags: ["numbers", "reach", "discipline"],
  goals: [
    "Train the number row as precise reaches rather than random grabs.",
    "Keep the hand map stable while extending upward.",
    "Stay accuracy-first while symbols and digits begin to mix.",
  ],
  prompts: [
    { id: "nr-1", text: "12345 67890" },
    { id: "nr-2", text: "1 2 3 then 7 8 9" },
    { id: "nr-3", text: "count 1 to 5, then 6 to 0" },
  ],
};

export const englishCapitalizationLesson: Lesson = {
  id: "en-capitalization-ladders",
  title: "Capitalization Ladders",
  summary: "Train capital letters and shift-side control without rushing.",
  mode: "guided",
  kind: "technique",
  stage: 3,
  sequence: 1,
  prerequisiteLessonIds: ["en-number-row-rhythm"],
  locale: "en",
  estimatedMinutes: 8,
  tags: ["shift", "capitalization", "technique"],
  goals: [
    "Practice opposite-hand shift habits for normal capitals.",
    "Keep rhythm while alternating lowercase and uppercase patterns.",
    "Use acronym exceptions intentionally rather than by accident.",
  ],
  prompts: [
    { id: "cap-1", text: "Ada asks Sam." },
    { id: "cap-2", text: "Calm Hands Make Clean Lines." },
    { id: "cap-3", text: "README stays easy in acronym mode." },
  ],
};

export const englishPunctuationLesson: Lesson = {
  id: "en-punctuation-and-brackets",
  title: "Punctuation And Brackets",
  summary: "Slow symbol work down until brackets and punctuation feel deliberate.",
  mode: "guided",
  kind: "technique",
  stage: 3,
  sequence: 2,
  prerequisiteLessonIds: ["en-capitalization-ladders"],
  locale: "en",
  estimatedMinutes: 9,
  tags: ["punctuation", "brackets", "symbols"],
  goals: [
    "Build control around commas, periods, semicolons, and quotes.",
    "Treat brackets as shape patterns, not panic keys.",
    "Keep symbol practice accuracy-first.",
  ],
  prompts: [
    { id: "pun-1", text: "( calm ) [ clear ] { control }" },
    { id: "pun-2", text: "left, right, center; then stop." },
    { id: "pun-3", text: "quotes say, 'stay calm.'" },
  ],
};

export const englishModifierLesson: Lesson = {
  id: "en-modifier-control",
  title: "Modifier Control",
  summary: "Reinforce shift, symbols, and bracket combinations as technique work.",
  mode: "guided",
  kind: "technique",
  stage: 3,
  sequence: 3,
  prerequisiteLessonIds: ["en-punctuation-and-brackets"],
  locale: "en",
  estimatedMinutes: 8,
  tags: ["modifiers", "shift", "symbols"],
  goals: [
    "Stay calm when modifiers and symbols mix together.",
    "Keep opposite-hand shift use intentional.",
    "Treat complex key combos as trainable patterns.",
  ],
  prompts: [
    { id: "mod-1", text: "A (B) C [D] E {F}" },
    { id: "mod-2", text: "Use Shift, then release; use Shift, then relax." },
    { id: "mod-3", text: "Type: A_B + C_D == READY" },
  ],
};

export const englishProseLesson: Lesson = {
  id: "en-calm-prose-carryover",
  title: "Calm Prose Carryover",
  summary: "Carry your drill mechanics into normal English prose.",
  mode: "guided",
  kind: "prose",
  stage: 4,
  sequence: 1,
  prerequisiteLessonIds: ["en-modifier-control"],
  locale: "en",
  estimatedMinutes: 9,
  tags: ["english", "prose", "carryover"],
  goals: [
    "Keep touch-typing form while typing normal sentences.",
    "Let accuracy lead while prose length increases.",
    "Notice where technique weakens outside tight drills.",
  ],
  prompts: [
    { id: "prose-1", text: "steady practice builds control long before it builds speed." },
    { id: "prose-2", text: "the goal is to trust the keyboard without looking down." },
    { id: "prose-3", text: "calm repetition turns key positions into muscle memory." },
  ],
};
