# DEPLOYMENT PLAN

## Purpose

This document describes how `typingtrainer` could move from a local proof build into a public deployment model.

`typingtrainer` is currently a proof project for `automated_company`, not the flagship company product. This plan is exploratory and should be used only if the public proof needs a real deployed surface.

The plan favors:

- static hosting first
- local-first product behavior
- minimal backend requirements
- clean rollout to optional auth, sync, and billing later

## Current Technical Shape

Current app shape:

- Vite + React + TypeScript
- static frontend build to `dist/`
- hash routing for static-host compatibility
- IndexedDB via Dexie for local persistence
- service worker for offline reuse after first load
- no required backend for core usage

That means the safest first public deployment is still a static frontend.

## Recommended Public Deploy Stack

Recommended stack:

- frontend hosting: Cloudflare Pages
- app domain: `app.<domain>`
- landing/docs domain: `www.<domain>` or root domain
- optional backend later: Supabase
- optional billing backend/webhooks later: edge/serverless function layer

Why this stack:

- the app already matches a static deploy model well
- preview deployments are straightforward
- custom domains and rollback flows are available
- Supabase can be added later without replatforming the current app

## Environment Strategy

Use three public environments:

1. local
2. preview
3. production

### Local

Used for:

- feature development
- tests
- manual browser verification

Commands:

- `npm run dev`
- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

### Preview

Used for:

- branch and PR validation
- stakeholder review
- pre-release manual QA

Requirements:

- automatic deploy from branch/PR
- unique preview URL
- same build command as production
- visible build metadata if possible

### Production

Used for:

- public users
- stable release channel

Requirements:

- deploy from `main`
- explicit release notes
- rollback path
- custom domain

## Frontend Deployment Plan

### Phase 1: Static Public App

Deploy the current app as a static site.

Baseline config:

- build command: `npm run build`
- output directory: `dist`
- environment: production
- hash routing retained

Operational requirements:

- compression enabled
- immutable asset caching for hashed files
- safe cache policy for `index.html`
- HTTPS only

### Phase 2: Landing Site Split

Once public positioning matters more, split:

- marketing/docs site
- app site

Reason:

- app UX stays focused
- public/product pages can evolve separately
- docs and pricing pages do not need to live inside the main app shell

## CI/CD Plan

Recommended release flow:

1. open PR
2. run unit tests
3. run production build
4. run Firefox end-to-end tests
5. publish preview deploy
6. merge to `main`
7. production deploy
8. optionally tag and publish GitHub release

Minimum checks before production:

- `npm run test:run`
- `npm run build`
- `npm run test:e2e`

## Domain Plan

Recommended structure:

- root or `www` for landing pages
- `app.<domain>` for the trainer

Benefits:

- clearer separation of product site and app
- easier future auth/billing routing
- easier public communication

## Analytics And Observability

Public deployment needs visibility, but it should remain privacy-aware.

Recommended:

- privacy-respecting product analytics
- frontend error tracking
- uptime monitoring for the production app URL
- release/version identifier visible in the app

Track at minimum:

- page visits
- first-session starts/completions
- lesson starts/completions
- adaptive-session starts/completions
- upgrade-click events once monetization exists

Do not collect raw typed content by default.

## Backend Evolution Plan

The public app does not need a backend on day one.

Add backend in stages only when necessary.

### Stage 1: No Backend

Use:

- static app only
- local IndexedDB
- export/import

### Stage 2: Accounts And Sync

If public demand supports it, add:

- Supabase Auth
- Supabase Postgres
- Row Level Security
- profile sync
- progress sync
- device-aware restore

This should remain optional. Local-only use should still exist.

### Stage 3: Billing And Premium Features

When paid plans launch, add:

- billing provider integration
- entitlement checks
- secure webhook handling
- account and subscription state

These backend responsibilities should be isolated from the core training engine.

## Data Model Principles For Public Deploy

Keep the local model primary.

Principles:

- local profile remains first-class
- synced profile is an extension, not a replacement
- export/import must still work
- typed content and training logic should not depend on network availability

## Security And Privacy

Public deployment must add basic operational discipline.

Requirements:

- explicit privacy policy
- explicit terms
- dependency update routine
- no secrets in frontend bundles
- separate public env vars from private secrets
- minimal analytics collection
- no typed-content collection unless clearly opt-in

## Rollout Plan

### Step 1

- deploy the current app publicly as static frontend
- use a custom app domain
- enable preview deploys

### Step 2

- add public landing/docs pages
- add privacy and legal pages
- add analytics and error reporting

### Step 3

- invite alpha users
- monitor completion, retention, and bugs

### Step 4

- decide whether sync/accounts are justified

### Step 5

- add billing only after packaging is stable

## Operational Checklist

Before public alpha:

- production domain configured
- preview deploys working
- tests green in CI
- error tracking configured
- analytics configured
- privacy and terms pages live
- support email or contact path live
- release checklist documented

Before paid launch:

- billing provider chosen
- webhook handling tested
- refund process defined
- entitlement model implemented
- user-facing account pages live
- support SLAs defined

## Recommendation

The practical deployment sequence should be:

1. Cloudflare Pages static app
2. public alpha without mandatory accounts
3. landing/docs split
4. optional Supabase-powered sync
5. billing integration

This keeps the current app architecture intact while still leaving room for a real public product.
