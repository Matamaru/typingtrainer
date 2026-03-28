# ROADMAP

## Guiding Goal

Build a local-first browser typing trainer that develops correct QWERTY touch typing, strong muscle memory, and full keyboard control, with coding-oriented practice included as a subordinate training mode.

## Product Priorities

Priority order for v1:

1. accuracy
2. correct fingering
3. muscle memory consistency
4. speed after technique is stable

## Phase 0: Product Definition

- [x] Agree project direction and constraints
- [x] Agree `README.md`
- [x] Agree `ROADMAP.md`
- [x] Agree `AGENTS.md`

Exit criteria:

- stable v1 scope
- stable non-goals
- stable implementation guardrails

## Phase 1: Foundations

Goal: establish the app shell and reliable keyboard-input model.

- [x] Choose frontend stack
- [x] Scaffold Vite + React + TypeScript app shell
- [x] Implement local-first storage for named profiles
- [x] Define keyboard event capture model for Firefox-first support
- [x] Normalize ISO physical keyboard assumptions
- [x] Define QWERTY key/finger mapping tables
- [x] Define lesson/content data format
- [x] Define stats/progress data model
- [x] Define initial route structure
- [x] Separate core typing engine modules from React UI state
- [x] Ensure offline-capable behavior after first load

Concrete scaffold choices for Phase 1:

- Vite
- React
- TypeScript
- Zustand for app/session state
- Dexie with IndexedDB for local persistence
- Vitest and Testing Library for unit and component testing
- Playwright for end-to-end testing
- Firefox-first browser validation

Planned repository structure for initial scaffold:

```text
src/
  app/
    routes/
  core/
    keyboard/
    trainer/
    analysis/
    storage/
    content/
    gamification/
    ai/
  features/
    profiles/
    lessons/
    practice/
    coding/
    stats/
    settings/
  shared/
    ui/
    lib/
    types/
  content/
    lessons/
      en/
      de/
    code/
      python/
      micropython/
      c/
  styles/
public/
tests/
  e2e/
```

Planned initial routes:

- `/`
- `/lessons`
- `/lesson/:id`
- `/practice/adaptive`
- `/practice/free`
- `/coding`
- `/stats`
- `/settings`

Concrete first implementation steps:

1. scaffold the Vite React TypeScript app and test tooling
2. create the route shell and base layout for dashboard, lessons, practice, coding, stats, and settings
3. define the core TypeScript domain models for profiles, lessons, prompts, keystrokes, mistakes, stats, and recommendations
4. implement the keyboard capture module with Firefox-first handling for `code`, `key`, modifier state, and `location`
5. wire Dexie-backed local profile storage and verify the app works offline after first load

Phase 1 status:

- complete
- production builds now include a service worker and runtime cache population for same-origin app assets

Exit criteria:

- app starts locally
- profile can be created and loaded
- key events can be captured and classified for training logic
- training content format is stable enough for first lessons

## Phase 2: Core Typing Engine

Goal: make typing sessions functionally correct.

- [x] Build prompt rendering and input matching
- [x] Track raw keystrokes and resulting correctness
- [x] Add live WPM and accuracy
- [x] Add strictness modes
- [x] Implement technique-aware mistake classification
- [x] Implement shift-side policy
- [ ] Add likely wrong-finger detection heuristics
- [ ] Add per-key and per-finger statistics beyond starter summaries
- [x] Add session summaries

Concrete Phase 2 design rules:

1. score lesson progress from `keydown` events and use `keyup` only to keep modifier tracking accurate
2. treat lesson input as physical-key-driven typing rather than accepting pasted text
3. in strict mode, wrong keys do not advance the cursor
4. in guided and relaxed modes, wrong keys advance but are logged as mistakes
5. allow backspace only outside strict mode
6. enforce opposite-hand shift usage for strict technique lessons
7. allow acronym and all-caps exceptions such as `README`
8. auto-advance between prompts and store a local session summary on completion

Current Phase 2 vertical slice:

- lesson detail page acts as an actual typing runner
- live accuracy and WPM are visible during the session
- session summaries persist locally through Dexie
- stats pages read real stored session data
- shift-side mistakes are detected for strict technique prompts

Exit criteria:

- a full lesson can be typed end to end
- the app can detect mistakes and produce useful stats
- strict technique lessons behave differently from relaxed modes

## Phase 3: Guided Beginner Path

Goal: create a very guided path for foundational touch typing.

- [ ] Home-row lessons
- [ ] Finger-to-key mapping lessons
- [ ] Letter expansion lessons
- [ ] Number-row lessons
- [ ] Punctuation and bracket lessons
- [ ] Capitalization lessons
- [ ] Modifier lessons
- [ ] English-first prose lessons
- [ ] German prose support

Exit criteria:

- a beginner can progress through a clear structured path
- lesson difficulty increases in a controlled way
- finger guidance can be shown or hidden

## Phase 4: Adaptive Training

Goal: make the trainer respond to personal weakness patterns.

- [ ] Analyze weak keys
- [ ] Analyze weak fingers
- [ ] Analyze common substitutions
- [ ] Analyze timing hesitation patterns
- [ ] Generate targeted adaptive drills from personal errors
- [ ] Add lesson recommendations
- [ ] Add progress-over-time views
- [ ] Add heatmaps

Exit criteria:

- the trainer can explain what the user is weak at
- the next recommended drill changes based on actual history

## Phase 5: Coding Teacher V1

Goal: add code-shaped typing without losing the typing-first focus.

- [ ] Add Python drill pack
- [ ] Add MicroPython drill pack
- [ ] Add C drill pack
- [ ] Add symbol and delimiter drills
- [ ] Add indentation drills
- [ ] Add identifier and naming drills
- [ ] Add short realistic snippets
- [ ] Add small full functions/programs
- [ ] Add light concept prompts
- [ ] Add adaptive code drills based on syntax-related typing mistakes

Exit criteria:

- code practice feels distinct from prose practice
- code drills improve symbol and syntax confidence
- coding mode remains clearly subordinate to typing goals

## Phase 6: Motivation Layer

Goal: increase consistency without turning the app into a gimmick.

- [ ] Add streak tracking
- [ ] Add level progression
- [ ] Add achievements
- [ ] Add session goals for short and medium practice windows
- [ ] Tune reward logic so accuracy is rewarded more than reckless speed

Exit criteria:

- motivation features increase repeat usage
- gamification does not encourage bad technique

## Phase 7: Polish And Stability

Goal: make the app reliable enough for daily personal use.

- [ ] Improve session UX and transitions
- [ ] Improve visual clarity of guidance and correction
- [ ] Add settings for strictness and guidance visibility
- [ ] Add profile management polish
- [ ] Add export/import for local profile data if useful
- [ ] Test Firefox thoroughly
- [ ] Test keyboard behavior under realistic desktop usage
- [ ] Tune pacing and difficulty

Exit criteria:

- stable for daily use
- no major data-loss risk
- lessons, stats, and profiles feel coherent

## Later Versions

### Layouts

- [ ] Add support for additional keyboard layouts
- [ ] Add layout recommendation mode
- [ ] Add migration path from QWERTY-first training to other layouts

### AI Features

- [ ] Add optional local AI-generated drills via Ollama
- [ ] Keep AI generation optional and local-first
- [ ] Use AI to generate prose/code drills only when it clearly improves training value

### Advanced Keyboard Mastery

- [ ] Add shortcut training
- [ ] Add navigation-key drills
- [ ] Add workflow-specific drill packs
- [ ] Add VR-oriented keyboard control practice concepts

## Non-Goals For V1

- cloud backend
- online accounts
- multiplayer
- leaderboards
- mobile app
- multi-layout training
- general-purpose coding tutor
