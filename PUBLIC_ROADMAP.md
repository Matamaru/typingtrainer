# PUBLIC ROADMAP

## Purpose

This document turns `typingtrainer` from a strong personal/local-first v1 into a public product roadmap.

Current baseline:

- app release: `v0.3.1`
- status: strong private v1 for daily personal use
- platform: browser-first, Firefox-first, local-first
- core strength: technique-heavy keyboard mastery for prose, code, symbols, correction, and shortcuts

The next goal is not "more features at any cost." The next goal is a public product that is understandable, deployable, supportable, and monetizable without breaking the local-first product identity.

## Product Positioning

`typingtrainer` should not compete as a generic WPM game.

It should position itself as:

- a keyboard-mastery trainer for developers, writers, and keyboard-heavy users
- focused on accuracy, fingering, symbols, modifiers, correction, and shortcuts
- local-first and privacy-friendly by default
- more serious and technique-oriented than mass-market typing sites
- especially strong for users who care about code, terminals, and future VR-style keyboard control

## North Star

Build the best public keyboard-mastery trainer for users who want full keyboard control, not just faster typing tests.

## Productization Tracks

The public roadmap has five parallel tracks:

1. product and onboarding
2. deployment and operations
3. monetization and billing
4. content depth and retention
5. public growth and support

## Phase A: Public Alpha

Target window:

- April 2026 to May 2026

Goal:

- make the existing v1 understandable and safe for external testers

Deliverables:

- first-run onboarding flow
- explicit beginner vs intermediate starting path
- ISO vs ANSI keyboard selection
- clearer lesson-page copy and explanation of pacing
- public landing page
- privacy policy
- terms of service
- support/contact path
- opt-in analytics and error reporting
- public issue and feedback intake
- public alpha tester group

Success criteria:

- a new user can start without direct guidance
- the first 15 minutes of product use are understandable
- there are no critical data-loss bugs
- manual support is low enough to continue scaling testing

## Phase B: Public Beta

Target window:

- June 2026 to August 2026

Goal:

- prove retention and product clarity with a broader public audience

Deliverables:

- better empty states and "what next" guidance
- onboarding walkthroughs for lessons, adaptive practice, and stats
- more prose and code content depth
- more shortcut and correction drills
- hosted feedback widget or in-app feedback flow
- public changelog/release notes discipline
- optional accounts and cloud sync planning or initial implementation
- Firefox production validation plus Chromium validation

Success criteria:

- 100 to 300 external users
- healthy first-session completion rate
- clear day-7 retention signal
- meaningful return usage of adaptive and guided practice

## Phase C: Paid Individual Launch

Target window:

- September 2026 to November 2026

Goal:

- launch a public paid plan without damaging the free core

Deliverables:

- free vs Pro packaging
- billing integration
- account management
- receipts/invoice handling
- upgrade/downgrade flow
- refund/support workflow
- cloud sync if Pro depends on it
- premium lesson packs
- advanced long-term analytics
- stable release and support process

Success criteria:

- first paying users convert without manual sales work
- free users still get a complete and useful local-first trainer
- churn reasons are understandable
- support burden stays manageable

## Phase D: Team And Education Entry

Target window:

- December 2026 to March 2027

Goal:

- validate whether `typingtrainer` can support schools, cohorts, or technical teams

Deliverables:

- team and education plan packaging
- instructor/admin dashboard concepts
- shared lesson-pack support
- lightweight seat management
- org billing
- progress summary views for cohorts

Success criteria:

- at least 2 to 5 serious pilots
- admin workflows feel lighter than spreadsheet-based alternatives
- the team feature set does not damage the individual product experience

## Phase E: Expansion

Target window:

- 2027 and later

Focus areas:

- more keyboard layouts
- layout recommendation paths
- broader workflow packs
- embedded C and terminal packs
- VR-oriented keyboard control training
- optional local AI and hosted AI drill generation
- creator or instructor-authored packs

## Deployment Milestones

Public product readiness depends on deploy readiness.

Milestones:

1. static public app deploy
2. preview deployments for every meaningful branch or PR
3. custom domain and basic observability
4. public landing/docs/app split if needed
5. optional auth/sync backend
6. billing and account operations

See [DEPLOYMENT_PLAN.md](./DEPLOYMENT_PLAN.md) for the operational path.

## Monetization Milestones

The free product should remain credible and useful.

Monetization milestones:

1. free public beta
2. founding Pro offer
3. public Pro launch
4. team/education packaging

See [MONETIZATION_PLAN.md](./MONETIZATION_PLAN.md) for the packaging and pricing path.

## Key Metrics

Metrics that matter most:

- first-session completion rate
- lesson completion rate
- day-1, day-7, and day-30 retention
- weekly active users
- adaptive-session usage rate
- free-to-paid conversion
- annual-plan share
- churn by reason
- support load per 100 active users

## Product Risks

Main risks:

- becoming too broad and losing the strong keyboard-mastery focus
- overbuilding backend/account systems before public demand is proven
- gating too much behind paywalls and weakening the free product
- adding AI features before the deterministic training loop is fully trusted
- shipping for a broad public audience before onboarding is clear enough

## Guardrails

Public growth should respect these guardrails:

- keep the local-first mode strong
- do not turn the product into a generic coding tutor
- do not optimize the game layer in ways that reward sloppy technique
- do not require accounts for the core trainer
- do not let monetization weaken export/import or local control

## Immediate Next Steps

Concrete next steps after this document:

1. prepare a `v1.0.0` public-readiness milestone
2. implement a public landing page and policy docs
3. choose and configure the production deployment path
4. add opt-in analytics and error tracking
5. recruit the first external alpha users
