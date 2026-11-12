# AstraFlow — Final Craft v12 (HTML design contract)

**Status: approved-direction candidate, not a production deployment.** Based on `AstraFlow-Connected-Polish-v11`. This v12 package preserves the chosen Warm Ivory / Deep Forest / Signal Orange visual identity, six page compositions, all attached source snapshots, and the stationary Home Hero with a single animated trace signal.

## What changed from v11

- `assets/craft-v12.css`: restrained last-mile surface polish, finer stage/diagram relationships, responsive visual-state consistency, and stronger intended contrast in the Flow Explorer. The hero logo geometry and site content are unchanged.
- `assets/craft-v12.js`: stage-linked moving indicator tied to the **existing** Flow Explorer state via MutationObserver. The active code, decision label, stage number, and signal now correspond. Home/End keyboard shortcuts work inside the stage path. No autoplay, no new state machine, no extra dependencies.
- Page-specific CSS on Packages, Docs, Guides, Changelog, and Community focuses on each page's current interactions instead of making everything float or animate.
- Agent handoff files below specify what Next.js should replicate and what it should improve with React/Hairline/Motion.

## Review

Open `index.html` in a browser, then view `#experience` and `#composition`. Use `review.html` for navigating all six pages. Visual screenshots are in `screenshots-final/`, including `index-full.png`. All static files and the source archive are included.

## Handoff reading order

1. `AGENT-START-HERE.md` — concise copy/paste execution command.
2. `NEXTJS-PAGE-AND-COMPONENT-CONTRACT.md` — exact page/component intent and library replacement rules.
3. `MOTION-HAIRLINE-DESIGN-CONTRACT.md` — motion budgets, real Hairline configuration and component mapping.
4. `I18N-THEME-SEO-PRODUCTION.md` — routing/SEO/docs/release status, theme and localization foundations, test gates.
5. `QA-v12-RESULTS.json` — recorded Chromium smoke results for this HTML prototype.
6. Existing historical v11 documents for additional explanation (not a substitute for v12 precedence).

## Precedence

For appearance: **v12 HTML/CSS/SVG and v12 Desktop/Mobile screenshots** > v11 legacy guidance > AI conceptual renders. For truth about .NET features and publication: **pinned live AstraFlow repository and separately verified NuGet package IDs**, never visual copy.

Avoid claiming the HTML prototype is a Next.js production website. The final implementation still needs a Next.js build, actual Hairline/React components, responsive visual diff testing, doc source ingestion, SEO metadata, accessibility QA and deployment-based performance measurements.
