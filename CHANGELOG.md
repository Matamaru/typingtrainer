# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning while it is still pre-1.0.

## [0.3.1] - 2026-03-28

### Added

- dedicated symbol lessons for number-row/operator symbols and edge symbols such as `` ` ~ \ | ``
- correction-control training with guided Backspace and chunk-delete practice
- browser-safe shortcut training for word deletion, word jumps, selection growth, `Home`, `End`, and `Ctrl+A`

### Changed

- updated the lessons page so paced-locked lessons can still be opened early for deliberate practice
- synced README and ROADMAP to reflect shortcut training and the expanded symbol/correction path

### Fixed

- lesson-to-lesson focus handoff by remounting the lesson detail route per lesson id
- symbol and edge-symbol lesson discoverability by replacing dead-end locked cards with actionable entry links

### Verification

- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## [0.3.0] - 2026-03-28

### Added

- shared runner-insights panels with clearer prompt flow, transition, and correction feedback
- local profile switching, creation, and rename flows in settings and the sidebar
- versioned local backup export/import for profiles and session summaries
- mastery-paced lesson progression with `ready`, `repeat recommended`, and `mastered` states
- browser-safe keyboard helper coverage and pacing tests for the guided ladder

### Changed

- reworked the lessons page and dashboard to surface paced progression instead of binary completed/locked state
- updated lesson and adaptive runners to explain whether a completed run actually stabilized the pattern enough to move on
- hardened typing capture surfaces so app shortcuts still work while focused and capture state is visibly shown
- synced README and ROADMAP through full Phase 7 completion

### Fixed

- stale modifier state after focus loss by resetting capture-engine modifiers on blur
- browser and desktop shortcut interference by allowing command chords and app navigation to pass through capture surfaces
- local-profile bootstrap drift by persisting and restoring the active profile id cleanly across reloads and imports

### Verification

- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## [0.2.1] - 2026-03-28

### Added

- keyboard-first lesson flow with `Next lesson`, `Next adaptive session`, and page-level shortcuts
- release-from-capture behavior so `Tab` and `Escape` work cleanly on lesson and practice surfaces
- finger-guide helper panel and settings-aware runner integration
- additional coding lessons for identifier rhythm, naming, and small full functions in Python, MicroPython, and C
- syntax-aware adaptive code drills based on symbol substitutions and delimiter drift
- streak tracking, focus-point progression, short/medium session goals, and a derived achievement wall

### Changed

- reworked the adaptive runner to behave like a keyboard-first training loop instead of a mouse-first generator page
- switched level momentum from raw session count to focus points earned from calmer, cleaner sessions
- expanded dashboard and stats views to surface consistency, goals, and achievement progress
- synced README and ROADMAP to the current product state through Phase 6

### Fixed

- lesson and adaptive capture traps that previously blocked keyboard-only navigation
- flaky lesson progression path by resolving next lessons from real catalog order and unlock state
- multiple browser-flow regressions around hidden typing capture and static-route navigation

### Verification

- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## [0.2.0] - 2026-03-28

### Added

- real guided lesson runner with strict, guided, and relaxed typing behavior
- shift-side enforcement with acronym exceptions such as `README`
- likely wrong-finger detection for adjacent-key drift
- timing-hesitation detection for long pauses within prompts
- local session summary persistence with Dexie/IndexedDB
- adaptive practice generation from stored weakness data
- stats pages for weak keys, weak finger zones, substitutions, timing hotspots, recent progress, and keyboard heatmaps
- staged beginner lesson ladder with prerequisite-based unlocking
- typed lesson packs for English technique, English prose, German prose, Python, MicroPython, and C
- Firefox end-to-end coverage for full app navigation and core flows

### Changed

- switched client routing to hash-based navigation for static-host friendliness
- set a production base path suitable for GitHub Pages-style deployment
- expanded the lesson catalog from a flat starter list into an ordered guided path
- tightened the docs so README and ROADMAP reflect the current shipped state instead of only planning intent

### Fixed

- Vimium interference on typing surfaces by moving capture to hidden textareas
- stats-page crashes caused by older local session summaries missing newer analytics fields
- internal navigation failures on static hosting/subpath deployments
- lesson and adaptive save-state cancellation bug caused by effect cleanup during persistence

### Verification

- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## [0.1.0] - 2026-03-28

### Added

- initial Vite + React + TypeScript scaffold
- local-first profile bootstrap
- basic app shell, route structure, and planning docs
- offline caching after first load
- initial Firefox Playwright smoke coverage
