# AGENTS

## Purpose

This file defines how coding agents and contributors should work on `typingtrainer`.

The project is a browser-based, local-first typing trainer with a strong focus on touch-typing technique, QWERTY muscle memory, and full keyboard control.

Agents must preserve product intent and avoid scope drift.

## Current Stage

The project starts with planning-first discipline.

Before implementation begins, these files must be agreed:

- `README.md`
- `ROADMAP.md`
- `AGENTS.md`

Do not start coding before those docs are approved.

## Product Truths

These decisions are currently foundational:

- browser app, not terminal app
- Firefox-first desktop support
- local-first architecture
- offline-capable after first load
- multiple named local profiles
- ISO physical keyboard support
- QWERTY only in v1
- English-first, with German also supported
- accuracy, fingering, and muscle memory before speed
- strict corrective coaching in foundational lessons
- coding teacher is a typing mode, not a separate programming-learning platform

If a proposed implementation conflicts with these truths, raise it before coding.

## V1 Boundaries

Agents should keep v1 narrow and coherent.

### In Scope

- guided touch-typing lessons
- adaptive drills from personal mistakes
- prose and code practice
- live stats
- heatmaps and progress views
- streaks, levels, achievements
- local profiles
- strictness settings
- technique-aware feedback

### Out Of Scope

- cloud services
- real user accounts
- multiplayer
- leaderboards
- multiple keyboard layouts
- full AI tutoring
- broad educational platform behavior
- mobile-first redesign

Do not quietly add out-of-scope systems.

## Input And Keyboard Rules

Keyboard observability is central to the product.

Agents should prefer implementations that preserve:

- physical-key awareness where possible
- modifier-side awareness where browser APIs allow it
- distinction between displayed character and physical key identity
- lesson logic that can reason about fingering and modifier technique

Do not reduce the app to plain text-input comparison if it would discard useful keyboard information.

## Technique Rules

The trainer is opinionated about technique.

Agents should support:

- standard touch-typing guidance
- adaptive coaching around user habits
- configurable strictness
- stronger enforcement in foundational lessons
- lighter guidance in free practice

Shift policy must remain nuanced:

- enforce correct shift-side usage in strict technique lessons
- allow acronym/all-caps exceptions such as `README`
- warn rather than fail in more relaxed modes unless strict mode is enabled

## Coding Teacher Rules

The coding teacher exists to improve keyboard skill in programming contexts.

Agents must keep it subordinate to typing goals.

### Allowed In V1

- syntax-focused drills
- delimiter drills
- indentation drills
- identifier drills
- short realistic snippets
- small full functions/programs
- light concept prompts tied directly to typing exercises
- language packs for Python, MicroPython, and C

### Not Allowed In V1

- full code execution/judging pipelines
- open-ended programming tasks
- full curriculum systems
- pair-programming workflows
- broad AI teaching behavior

If a feature sounds like a coding tutor more than a typing trainer, it probably does not belong in v1.

## UX Rules

The product should feel corrective, motivating, and focused.

Agents should preserve:

- clarity over visual noise
- game-like motivation without gimmick overload
- strong feedback loops
- fast session startup
- support for both short and medium sessions
- optional visual guidance for fingering

Do not design reward systems that encourage sloppy high-speed typing.

## Architecture Guidance

Prefer simple local-first architecture.

Guidelines:

- keep core training logic isolated from UI concerns
- keep stats and lesson models explicit and testable
- keep profile storage portable and understandable
- design content packs so prose and code lessons can evolve separately
- avoid locking the app to network availability
- treat optional AI generation as a later integration, not a core dependency

## Data And Content Guidance

Agents should structure content so the app can support:

- fixed lessons
- adaptive generated drills from local error history
- prose content in English and German
- code content in Python, MicroPython, and C

Curated built-in content comes first.

AI-generated content is a later optional extension and must remain local-first if added.

## Testing Expectations

Agents should add or update tests when changing core logic.

High-value areas for testing:

- key classification
- modifier handling
- shift-side policy
- lesson matching logic
- adaptive drill generation
- profile persistence
- stats aggregation
- strictness-mode behavior

## Decision Discipline

When requirements are unclear:

- do not guess on product-defining behavior
- ask for clarification if the ambiguity changes scope or user experience
- otherwise choose the simplest implementation consistent with the docs

When tradeoffs appear:

- protect typing quality over feature count
- protect local-first simplicity over speculative platform features
- protect product focus over cleverness

## Collaboration Rule

Agents must not overwrite user intent with “more scalable” or “more general” ideas unless explicitly requested.

This project should become excellent at one thing first:

teaching disciplined QWERTY touch typing with meaningful prose and code practice.
