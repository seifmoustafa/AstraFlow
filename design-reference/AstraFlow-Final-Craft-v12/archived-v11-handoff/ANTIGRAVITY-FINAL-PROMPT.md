> **V11 note:** This is inherited from v10. Read and follow `ANTIGRAVITY-FINAL-EXECUTION.md` first; v11 supersedes any conflicting older logo/motion/QA instructions.

# PASTE INTO ANTIGRAVITY — AstraFlow Website Production Port

## Role, goal and hard boundary

You are the lead product designer and senior Next.js engineer implementing a **production-grade, source-backed, multi-page developer-tool website** for the independent open-source .NET package family **AstraFlow**. The supplied `AstraFlow-Connected-Final-v10` folder is the **reviewed visual reference**. Your job is NOT to brainstorm another art direction, install every frontend-effects library, or invent new website content; your job is to **faithfully realize the reviewed composition with production-grade craft and real React interactivity**, verify it, and show evidence.

**Do not silently restyle the site.** Reimplement the accepted Warm Ivory / Deep Forest / Vermilion visual direction and exact three-part A. If HTML implementation quality limits a figure, **improve the fidelity** using Hairline's real figures and Motion, not by replacing it with a generic SaaS UI kit, 3D monolith, or dashboard cards.

## Read this package in order

1. `README.md` and `DESIGN-AND-MOTION-CONTRACT.md`.
2. Open actual `index.html` and `community.html`; study `assets/final.css`, `assets/final.js`, `assets/vision.css`, `assets/vision.js`; compare rendered browser to `screenshots/home-full.png`, `screenshots/home-hero.png`, `screenshots/home-flow.png`, `screenshots/home-assembly.png`, `screenshots/community-hero.png`, `screenshots/HERO-SIGNAL-MOTION.gif`.
3. Open `packages.html`, `docs.html`, `guides.html`, `changelog.html`. **They are preserved v9 visual directions**: do not revert them to earlier v7.
4. Read `CONTENT-AND-SEO-CONTRACT.md`, `QA-AND-ACCEPTANCE.md` and source snapshots in `source-materials/`. Inspect the live AstraFlow repository at a pinned commit before porting documentation or version claims.
5. Inspect current official Hairline, Motion, Next.js, Fumadocs, Radix and next-intl docs and pin exact compatible versions in a lockfile. Avoid unverified API names and downloads.

## Creative and behavioral invariants

- The homepage's **A mark and heading do not move**. The only automatic hero motion is a single **request signal** traveling along the white-dashed orange trace physically integrated into the A. Keep pause/resume, offscreen stop, visibility pause and reduced-motion semantics. DO NOT replace with a generic squiggly horizontal line or move the logo as a giant 3D rock. Preserve exact designed geometry and spacing.
- Home below hero is explicitly designed and approved as a sequence: **proof strip → dark Flow Explorer → open-page interlocking composition with selectable layers → editorial package section → Footer**. Show all these sections in one full-page Playwright screenshot; do not submit only a hero crop.
- Flow Explorer is a **guided documentation instrument**. Scenario, active step, code and explanation must be one synchronized state. It is NOT a runtime tracer or benchmark. Do not fabricate execution numbers.
- Home composition's 3 layers sit on the Ivory canvas and geometrically overlap; actual selectable semantic HTML controls sit beside them. Port the custom illustrative SVG to a real Hairline `Exploded`/`Stack` or custom figure via upstream skill **if it clearly improves**. It must still be keyboard/touch accessible, and selection must update the actual explanation.
- Community first fold is **open source branching geometry, no boxed green logo illustration**. The four genuinely navigable paths are source, issues, PRs and docs. Each link highlights its route on focus/hover; no invented Discord, testimonials or community metrics.
- Packages first fold = distinct Assembly Bench, not “headline + rectangle”. Composer selects actual package IDs and synchronizes install command. Docs first fold prioritizes search and reading. Guides is a learning runway. Changelog is a release folio; never confuse repository code with published NuGet assets. Preserve this distinctness.
- Preserve all existing approved page wording unless repository facts contradict it. Update factual claims using real sources, and document the changes; no invented APIs/benchmark numbers/releases.
- Do not use the blanket `60% ivory / 30% green / 10% orange` as a mechanical pixel test. Apply it as a hierarchy: editorial reading ground, structural contrast, sparing action emphasis. No new purple/cyan themes, neon, glass cards or background planets.

## Approved libraries (small, justified set)

- Next.js **16** App Router, React, TypeScript; Tailwind CSS 4 if it materially improves maintainability, otherwise semantic CSS/variables are sufficient. Exact versions pinned and lockfile committed.
- `@lucasmarkes/hairline` official library for **selected open-page isometric/branch figures only**. Import from `@lucasmarkes/hairline/react` and verify exports before use. Start intensity ~0.2–0.3 and `play={false}`. Define themed Hairline CSS tokens on the actual page surface; must not surround every figure with another black panel. If agent supports skills, inspect/install `npx skills add lucasmarkes/hairline` and decide whether `/hairline-adopt` or `/hairline-create` is appropriate. This is optional build guidance, not permission to create an unrelated new mark.
- `motion` for real state transitions and shared layout where needed. `MotionConfig reducedMotion="user"`. Use CSS/SVG for the single ambient hero signal. Do not install Lenis, GSAP, Three.js, React Bits, animated template kits or extra dependency collections by default.
- Headless Radix controls for accessible Dialog/Tabs/Accordion where native HTML is insufficient. Design every surface to match AstraFlow; no stock styling.
- Fumadocs MDX/Core, **if** it helps ingest/search/TOC of 61 original docs while keeping fully custom AstraFlow reader UX. Don't swap Docs to a default Fumadocs theme.
- `next-intl` as **prepared infrastructure**. **English + `warm-forest` only today; no theme switcher, no locale switcher, no public Arabic route/translation/hreflang.** Prepare `lang`, `dir`, typed messages, CSS logical props and an easily extendable locale registry. Do not enable locale auto-detection redirect for languages not supported.

## Route architecture (no speculative services)

- `/` homepage; `/packages` directory; add sourced `/packages/[slug]` only for real packages with actual content; `/docs` index and `/docs/[...slug]` for all 61 original Markdown docs; `/guides`; `/changelog`; `/community`; 404/error pages. Keep stable English canonical routes.
- Use Server Components for static/SEO content, narrow Client Components only for hero pause controller, Flow Explorer, Layer Selector/Hairline response, Package Composer, Docs Search, Changelog release disclosure and mobile nav.
- Make a small token system (color, type, space, border, focus) and a small set of true shared primitives. Do **not** extract an abstract animation component for every element or refactor two simple similar sections into a coupled dependency.
- Prefer server/static build from pinned source Markdown and package metadata. No database or API/microservice needed to render a docs site. Do not build back office/admin/analytics features without a real requirement.

## Required visual craftsmanship and exact user-facing flows

1. **Global navigation:** stable sticky header that never obscures anchor headings, exact mark, correct active route, accessible mobile menu, real search entry and keyboard `Escape` behavior. No scroll progress line appearing across the menu text.
2. **Home Hero:** visually match v10 at 1440 and 390 and motion GIF; heading/CTAs readable before motion or without JS; one moving signal only; animation pauses instantly when toggled or document hidden. Choose subtle line glow with consistent stroke, not randomized noisy effects.
3. **Home Flow Explorer:** three documented scenarios, interactive stages, synchronized code and description, `aria-pressed`/selected state, Previous/Next disabled and Restart semantics. Keyboard and touch equal to pointer. Code factual/compiled where claimed.
4. **Home Assembly:** open canvas, real *interlocking* geometry. Selectors update three layer states (input/composition/inspection). On mobile the selectors stack in reading order; figure doesn't collide with text.
5. **Packages:** real package list and accessible search/filter, independent package composer updates install commands, empty/disabled/copy feedback, correct package ID and release availability. Avoid repeated generic tile gradients.
6. **Docs:** source-backed search and article reader, stable sidebar, TOC, syntax highlighting, copy, links, breadcrumb, article metadata, mobile UX, keyboard command search if implemented. No placeholder article replacing source docs.
7. **Guides:** timeline selection updates meaningful content and actual links; guide cards lead to sourced routes and are not just motion loops.
8. **Changelog:** source-driven full chronological history, distinct status labels (source/preview/GitHub/published NuGet), accessible disclosure, filters if justified; verified dates/version, link to source. No fake “latest” badge.
9. **Community:** figure and 4 real destinations integrated on the background; focus/hover highlights exact branch. Helpful GitHub workflow steps in second section; no fake metrics/Discord.
10. **Footer:** accessible and quiet; real links, no unverified community/support CTA.

## SEO, docs and publication truth (mandatory)

- Follow `CONTENT-AND-SEO-CONTRACT.md` exactly. Generate route-specific `metadata`, canonical, Open Graph/Twitter images, `sitemap.ts`, `robots.ts`, proper titles/descriptions, JSON-LD with verified properties only, semantic HTML and indexable SSR.
- Verify `AstraFlow` package publication **per NuGet ID**; the user README and repository `CHANGELOG.md` have conflicted, so never silently assume 2.3.0 is universally released. 2.4.0 currently described as in-progress by supplied snapshot. Preserve every older changelog entry, not just feature highlights.
- Keep the changelog updated in the repo each time a release changes; CI should check completeness/version alignment rather than deleting old history.
- Documentation must use all **61 Markdown** source files supplied, reconciled against latest pinned source. Preserve code fences, internal links, anchors, status notes and ADRs. Verify critical C# snippets by compiling a consumer project against verified package versions.

## Delivery / verification gate (do not declare done before all pass)

**Implementation:** `npm ci`, `npm run typecheck`, lint, production `next build`, working production preview; no unpublished placeholder links. Show minimal dependency justification and bundle inspection for client islands.

**Browser:** Playwright on **real HTTP-hosted Next.js**, Chrome and at least one alternate engine when feasible, 320/360/390/768/1024/1440/1920 widths; verify **no unintended horizontal overflow**, no key text cutoff, no sticky-header anchor hiding, no focus traps and no overlapping CTA/visual on 200% zoom. Capture **full homepage** and every interior first fold with screenshots; run screenshot diff/visual review before claiming fidelity. Test non-JS readability.

**Interactions:** hero signal visually moving, Pause/Resume actual animation stop, offscreen hidden stop, reduced-motion disabled; Flow selector/steps/code sync; layer selection; package composer search/select/copy; docs search, links and TOC; guide progression; changelog disclosure; community branch focus/highlight; keyboard/touch parity. Interactions must produce **actual content state changes**, not only color/shadow.

**Accessibility:** WCAG 2.2 AA intent, axe scan plus manual keyboard/heading/landmark review; readable contrast; no autoplay movement when reduced motion; logical code flow always `dir=ltr`; placeholder future RTL structural test with **sample long RTL strings** in development only, no Arabic public pages.

**Performance/SEO:** Lighthouse on deployed/preview site, Core Web Vitals field data when available; ensure LCP/CLS/INP diagnosed rather than claim perfect scores. Confirm canonical/sitemap/robots/OG/JSON-LD with actual deployed URL. No invented benchmarks.

**Output:** give the working branch/PR, screenshots for all six routes and full homepage, Playwright/axe/Lighthouse reports, list of deviations from v10 with rationale, source snapshot commit, truthful release status, and a concise list of any remaining gates. If any gate fails, mark it explicitly as an open issue rather than claiming 100%.

## Non-negotiable instruction

**Do not ask to re-invent the design. Do not return generic inspirational images. Implement and validate the supplied HTML's chosen visual design using real Next.js components; only change implementation details necessary for fidelity, accessibility, performance, actual Hairline integration, responsive behavior or factual correctness.**
