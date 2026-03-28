# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project follows Semantic Versioning while it is still pre-1.0.

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
