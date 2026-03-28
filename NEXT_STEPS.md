# NEXT STEPS

## Purpose

This file turns the broader public-product docs into a short execution checklist.

Use it as the practical build order for the next release cycle.

Current product state:

- private/local-first v1 is already strong
- the next goal is public alpha readiness
- the bottleneck is productization, not core typing mechanics

## Build Order

Do these in order:

1. public surface
2. deploy and observability
3. retention and content depth
4. optional accounts/sync
5. billing and paid launch

Do not jump ahead to billing, AI, or team features before the first three are done.

## Sprint 1: Public Alpha Surface

Goal:

- make the app understandable to a new public user without direct help

### In Scope

- [ ] build a public landing page
- [ ] clearly explain what `typingtrainer` is for
- [ ] explain who the product is for
- [ ] explain why it is different from generic typing sites
- [ ] add clear CTA paths into the app
- [ ] add first-run onboarding in the app
- [ ] add beginner vs intermediate start choice
- [ ] add ISO vs ANSI keyboard selection
- [ ] add "recommended first lesson" guidance
- [ ] improve lessons-page copy around pacing and locked vs early-open lessons
- [ ] add a privacy policy page
- [ ] add a terms page
- [ ] add support/contact information
- [ ] add a simple feedback/report-issue path
- [ ] add version/build info in the app footer or settings

### Out Of Scope

- [ ] no billing yet
- [ ] no accounts yet
- [ ] no AI feature work yet
- [ ] no major architecture rewrite

### Exit Criteria

- [ ] a new user can understand the product within the first few minutes
- [ ] a new user can choose the right entry path without asking for help
- [ ] the public product surface feels complete enough to share externally

## Sprint 2: Deploy And Insight

Goal:

- make the product deployable, monitorable, and releasable in public

### In Scope

- [ ] choose the public hosting setup
- [ ] set up production static deploy
- [ ] set up preview deploys for branches or PRs
- [ ] configure the public app domain
- [ ] configure the landing/docs domain if split
- [ ] add privacy-respecting product analytics
- [ ] add frontend error tracking
- [ ] track key product events
- [ ] define a release checklist
- [ ] define a deploy checklist
- [ ] show the current app version in production
- [ ] verify Firefox production behavior on the deployed app
- [ ] verify Chromium behavior on the deployed app

### Key Events To Track

- [ ] first app visit
- [ ] first lesson started
- [ ] first lesson completed
- [ ] first adaptive session started
- [ ] shortcut training session started
- [ ] return session on a later day

### Exit Criteria

- [ ] the app can be deployed repeatedly without manual guesswork
- [ ] failures are visible through monitoring or error tracking
- [ ] you can observe where users start, continue, and drop off

## Sprint 3: Retention And Content Depth

Goal:

- make the product strong enough that public users want to return

### In Scope

- [ ] add more prose content
- [ ] add more symbol content
- [ ] add more shortcut content
- [ ] add more code content
- [ ] add more workflow-specific packs
- [ ] improve empty states across the app
- [ ] improve "what should I do next?" guidance
- [ ] add a simple structured training path such as a 14-day reset
- [ ] add a second structured path such as a symbols or coding bootcamp
- [ ] improve adaptive recommendations copy so it is easier to trust
- [ ] add a lightweight in-app feedback prompt after several sessions

### Suggested Content Priorities

- [ ] shortcut packs for editing and navigation
- [ ] symbol packs for real programming/operator use
- [ ] more realistic Python, MicroPython, and C drills
- [ ] English and German prose carryover packs

### Exit Criteria

- [ ] the product has enough depth that repeat usage feels natural
- [ ] users can understand what to train next without confusion
- [ ] adaptive and guided practice both feel worth returning to

## After Public Alpha

Only start these after Sprints 1 to 3 are done.

### Sprint 4: Optional Accounts And Sync

- [ ] evaluate whether public users actually want sync strongly enough
- [ ] add optional accounts
- [ ] add optional cloud sync
- [ ] keep local-only mode intact
- [ ] keep export/import intact

### Sprint 5: Monetization

- [ ] define the free vs Pro boundary clearly
- [ ] implement billing
- [ ] add upgrade and account pages
- [ ] add premium packs or premium analytics
- [ ] validate the first paid offer

### Sprint 6: Expansion

- [ ] add more layouts
- [ ] add workflow-specific advanced packs
- [ ] add optional AI drill generation
- [ ] explore team or education packaging

## Not Next

These are valid ideas, but not the immediate path:

- [ ] do not start with ads
- [ ] do not start with heavy backend work
- [ ] do not start with team features
- [ ] do not start with multi-layout expansion
- [ ] do not start with full AI coaching

## Definition Of Done For Public Alpha

You are ready to call the next major milestone a public alpha when:

- [ ] landing page exists
- [ ] onboarding exists
- [ ] legal/support pages exist
- [ ] deployment is repeatable
- [ ] analytics and error tracking are live
- [ ] the app is usable in public without direct explanation
- [ ] a small external tester group can use it and report back

## Recommendation

If you want one simple interpretation of this file:

- finish Sprint 1 first
- then finish Sprint 2
- then finish Sprint 3

That is the shortest path from the current strong private v1 to a real public alpha product.
