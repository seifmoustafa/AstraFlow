# 03 — PRODUCTION / DESIGN QUALITY GATES

All phases include actual browser inspections (desktop and mobile). Never claim browser testing without running it.

## G0: Inspect and protect
- Verify `portal/` is absent or empty, identify pre-existing packages/docs/config and Git status. Create a feature branch; do not delete unrelated work. Enumerate actual reference assets and inspect final screenshots/video. Read every source file for truthful claims.
- Create an inventory of six public page routes, docs content sources, design tokens and source-backed release history.

## G1: Scaffold + visual shell before advanced motion
- Create Next.js 16 stable + React + TypeScript strict in `portal/`. Supported Node LTS, pinned lockfile. App Router, server components by default, CSS variables and scoped styles, Tailwind v4 only if useful. No needless CMS/API/global store.
- Build Header, Footer, logo variants, IVORY base surfaces, theme-safe texts, buttons and site-width grid. Build six visual page shells. Home hero SVG base unchanged. Use v12 screenshots as visual reference at 1440×900 and 390×844.
- REQUIRED side-by-side screenshot check of ALL SIX page tops. If Docs/Guides/Packages/Changelog/Community are dark or wordmark is invisible, STOP/FIX. If any theme button exists, STOP/FIX. No creative figures yet.

## G2: Functional pages and reliable content
- Populate Docs from current repo markdown, preserve navigation/search/TOC and indexable static article routes. Use safe markdown/MDX rendering (no arbitrary execution).
- Changelog complete available history and truthful status. Packages/commands verified. All primary routes/CTAs, metadata, canonical, sitemap, robots, OG, 404, sources.
- English-only UI. `html[lang=en][dir=ltr]`; future-ready logical properties/dictionary with no actual extra locale pages and no theme controls.

## G3: Original creative scenes (one at a time, no uncontrolled full re-theme)
- Prioritize Packages Module Loom, Home Flow Atlas, Changelog Edition, then Packages Composer, Home Assembly, Docs, Guides and Community.
- For EACH: old baseline vs new SAME viewport, actual state/hover/keyboard/touch demo, explanation of Hairline/custom implementation, performance check; UI must visibly improve, not simply move.
- After each scene, capture a full-page screenshot, inspect shell regressions before continuing. Do not require a user question for each step unless there is a true creative fork; proceed through the complete approved scope.

## G4: Production verification, no claims without evidence
- `tsc --noEmit` (or equivalent), lint, tests, Next `build` production mode, actual HTTP server smoke tests, Playwright across pages and interactions, axe accessibility, reduced motion, 200% zoom, keyboard Tab/Enter/Escape/Arrow, touch/mobile, 320/390/768/1024/1440/1920 widths, no overflow/overlap/hydration errors.
- Verify SEO output including metadata, sitemap/robots/schema only if truthful, code/Markdown sanitization, no indexless docs. Record Lighthouse and CWV lab metrics; don't mislabel them field metrics.
- Run basic content/link tests and compare releases/packages to repo/NuGet.
- Report real unresolved blockers and deployment decisions. No deployment or release without explicit user authorization.

## Required artifacts from implementation

1. Source code and running `portal/` app.
2. 6 screenshots at 1440 desktop + 6 at 390 mobile of final design, and before/after creative scene comparisons.
3. Short **real browser recordings** for Home signal, Flow Atlas, Package Assembly, Changelog Edition, Community hover/keyboard and Guides track; don't call screenshots videos.
4. All actual commands/test outputs (success/failure), affected component source paths, SEO checklist and open risks.
5. Design integrity diff: list any global token, navbar, background or typography change. If a baseline lock was changed, explain why and give screenshot proof.

**STOP rule:** If any screenshot violates `01-BRAND-LOCK.md`, correct it immediately. Do not proceed to other pages and propagate the wrong global theme.
