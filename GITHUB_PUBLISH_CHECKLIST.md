# GITHUB PUBLISH CHECKLIST

## Positioning

- `typingtrainer` is an open-source proof project built inside the `automated_company` environment
- it should provide concrete public proof of product execution, local-first architecture, and build quality
- it should not be framed as the new flagship company product

## Audit Snapshot

Checks completed during this pass:

- clean git worktree at audit start
- MIT `LICENSE` already present
- README updated to make the proof-project role explicit
- `package.json` now carries `description` and `license` metadata
- no `.env`, certificate, or key files found in the repo scan
- no obvious secrets or private tokens found by string scan
- no tracked `dist/` artifacts found
- only bundled static asset found in the repo scan was `public/favicon.svg`
- install and run instructions already exist in `README.md`
- `npm run test:run` passed
- `npm run build` passed
- `npm run test:e2e` passed when run with local port binding available

Manual sign-off still needed:

- confirm all lesson prose and code content is original or otherwise safe to redistribute
- confirm `public/favicon.svg` is original and safe to redistribute
- decide whether exploratory docs such as `PUBLIC_ROADMAP.md` and `MONETIZATION_PLAN.md` should stay public as-is
- decide whether to publish the current state as `v0.3.1` or cut a doc-refresh release first

## Before Making The Repo Public

- review `README.md`, `LICENSE`, and this checklist for public wording
- confirm the GitHub repo name, owner, description, and visibility plan
- confirm there are no unpublished company links or private references that still need removal
- decide whether GitHub Issues and Discussions should be enabled from day one
- prepare a short repo description that keeps `typingtrainer` clearly subordinate to `automated_company`

## Suggested GitHub Metadata

- description: `Open-source proof project from automated_company: a local-first browser typing trainer focused on disciplined QWERTY keyboard mastery.`
- topics: `typing`, `touch-typing`, `qwerty`, `local-first`, `react`, `vite`, `typescript`, `indexeddb`, `keyboard-training`

## Publish Sequence

1. Create the GitHub repo under the intended owner and keep it private until the final pass is complete.
2. Push the current default branch and confirm the README, license, and root docs render cleanly.
3. Flip the repo visibility to public.
4. Add the repo description, homepage if available, and suggested topics.
5. Create the first GitHub release and include the README plus checklist framing in the release notes.
6. Use the GitHub URL as external proof in article CTA, source, or related-links blocks rather than inside the main article body.

## Residual Risks

- public deployment under a subpath will need a quick review of PWA manifest details before shipping a hosted app
- lesson-content provenance still needs human confirmation because automated scanning cannot prove copyright ownership
- exploratory public-product docs may confuse readers if they are not clearly presented as optional future paths

## Article Queue

Recommended next article:

- working title: `Why We Open-Sourced typingtrainer`
- angle: `typingtrainer` is not a new flagship. It is a public proof project that shows how `automated_company` can take a narrow product idea from internal build to inspectable public release.
- core proof points:
  - real local-first browser product, not a mockup
  - offline-capable after first load
  - disciplined keyboard-technique focus instead of generic typing-site metrics
  - public code, public docs, and reproducible local setup
- CTA placement: keep the GitHub link in a source block, CTA block, or related-links block
- supporting story:
  - why open source is stronger proof than another closed demo
  - what this project proves about the build system and product process
  - why `automated_company` stays the flagship while proof projects improve in public
