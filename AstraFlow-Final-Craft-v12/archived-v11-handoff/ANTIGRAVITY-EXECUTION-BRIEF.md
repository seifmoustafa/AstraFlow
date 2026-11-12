> **V11 note:** This is inherited from v10. Read and follow `ANTIGRAVITY-FINAL-EXECUTION.md` first; v11 supersedes any conflicting older logo/motion/QA instructions.

# Antigravity — AstraFlow "Connected Instruments" final implementation brief

**Status: visual REBUILD candidate, not sign-off.** User explicitly rejected AstraFlow Crafted v7's secondary page compositions and generic boxed figures. **Do not convert v7 pixel-for-pixel**. The new `AstraFlow-Experience-Reset-v9` sketches are a **design grammar and interaction proof**. Your task is to produce a much more polished **Next.js 16 implementation** in a working branch, with real Hairline figures and component behavior, then compare the actual renders to the new visual intent and user screenshots. The local HTML is proof of composition, not a production content/database source.

## Read this exact order

1. `UX-AUDIT-AND-REPLACEMENT-MAP.md`: what failed, what to delete, replacement rules.
2. `TECH-AND-LIBRARIES.md`: verified libraries, deliberately excluded dependencies, links, skill.
3. `index.html`, `packages.html`, `docs.html`, `guides.html`, `changelog.html`, `community.html`, `assets/vision.css`, `assets/vision.js`; view screenshots in `screenshots/`. These are conceptual v9 components (not pixel-approved final pages).
4. Existing `AstraFlow-Crafted-v7` only for the user-approved logo paths, known flows, package inventory and documentation sources. Do not import CSS "craft" layers or v7 page layouts.
5. Authoritative AstraFlow repository `README.md`, `docs/`, `CHANGELOG.md`, packaging metadata and NuGet package availability. Preserve factual differences between code in progress, GitHub releases and installable packages.
6. Upstream Hairline, Motion, Next, next-intl, Fumadocs official docs. Confirm current package versions from your local lock/install, do not blindly choose unverified latest.

## Core creative idea: components are the layout

This is a high-end **editorial engineering instrument**. It is not a product dashboard; components, lines, labels, code, and the actual state changes form the page's geometry. The site's primary composition must be 60% warm reading ground, 30% dark structural contrast, 10% or less bright emphasis **as a heuristic**. The only approved active palette is Paper/Forest/Vermilion; Orange is signal, not body copy or wallpaper.

**Hero motion:** Home mark, h1, buttons, diagram geometry remain visually stable. A **single subtle trace highlight** travels along a prepared path (or progresses on intentional user interaction); no perpetual floating UI, text parallax, auto-scroll or motion-caused CLS. Under reduced motion, show the completed static path. Pause offscreen using IntersectionObserver and when document is hidden. No visible pause button if motion is purely minor and nonessential; if animation becomes substantial, expose a control. All other page hero artwork is still at rest and only responds to pointer/focus or discrete state change.

**Interlocking rule:** Hairline figures and semantic selection controls occupy one connected surface with overlap, not a centered image inside a green rounded rectangle. At least some elements physically cross section boundaries with safe `z-index`; lines and callouts anchor to actual semantic content. Every selected state must affect both figure and text/code, not only shadow/glow.

## Target routes and composition — unique per page

| Route | First viewport requirement | Below the fold | Motion / UI behavior |
|---|---|---|---|
| `/` | Signature aligned A + Orange route, headline and CTAs, 3 proof statements in first scroll; no floating mark | Interactive Flow Lab; open layered components outside a box; editorial, asymmetric ecosystem; source-backed Quick Start; footer | Route signal subtle, scenario/stage selects sync code; no generic on-scroll slide everywhere |
| `/packages` | "Assembly Bench" with staggered **real interlocking** figures on paper, no dark artwork card; direct CTA to composer | 15-package directory from actual metadata, small clear category filters; accessible add/remove composer and exact install commands; package detail pages where content supports them | click/keyboard selection, matched moving layer with Motion, selected package and install list sync |
| `/docs` | Search and six highly relevant task entryways, not an oversized code-editor decoration | 61 real Markdown articles with clean reading layout and complete TOC; code/copy, previous/next, breadcrumbs, content status | dialog keyboard and focus, no autoplay; snippets compile with version-specific packages |
| `/guides` | Long horizontal **learning runway** with readable selected step, not four tiny nodes in a box | six real journeys, progress and prerequisite links; source-backed examples | focus/click step transition; retained URL hash or explicit route as useful; no fake progress persistence |
| `/changelog` | Editorial Version Folio with *real* release distinction visually understandable in first fold | Full repository changelog (not 3 rows); stable anchors per version; filters by availability/source/status | release sheet selection and expanded details via accessible disclosure; no misleading publication badges |
| `/community` | Open branching editorial illustration anchored to real repository/issue/PR docs links, no dark rectangle | Contribution process, decision logs, issue reporting, code review and sources | branch highlights follow hover/focus; not a simulated community dashboard |

**Package details** (at least the umbrella, Mediator, Mapper, Testing, Diagnostics, CLI): a consistent product-detail content template is okay, but hero artwork and examples must match the responsibility. Reuse design tokens, not a repeated "headline + dark box" hero.

## Full component specification

- **Navigation:** sticky but non-obscuring, logo exact path, keyboard/mobile menu with Escape and focus management, active state. Hover underlines use one short Motion transition; no sticky scroll-progress line over the text.
- **Buttons:** primary/outline/text variants; native `<button>` or `<a>` semantics; visible focus, disabled/loading/copy result; no cursor-following button that changes hit area; minimum target size suitable for touch.
- **HeroRoute:** accessible SVG; static geometry; one signal path `<path>` with stroke-dash animation on composited/SVG property, paused offscreen or reduced motion; no overflowing transforms.
- **InterlockingStack:** visual Hairline `Exploded` or `Stack`; semantic package toggle list layered adjacent to it. Focus state = same visual response as pointer. On screenreader, list remains understandable when SVG is removed. Change `--hairline-*` CSS tokens; set `intensity` around 0.25 to avoid chaos.
- **FlowExplorer:** three factual illustrative scenarios (dispatch, mapping, diagnostics). Sync stage names, explanatory text, C# snippets and active node via one state machine. Label *"Conceptual example — not a live runtime tracer"*. 0/3 or 0/4 stage handling accurate; Previous disabled at start, Next->Restart at end; keyboard accessible.
- **PackageComposer:** actual package IDs and separate availability status; multi-select, search/filter, empty state, copy feedback. No invented auto-resolve dependencies or package install success.
- **DocsIndex:** client search dialog only, index static SSR and crawlable. Command-K is optional if implemented correctly; body scroll must not be hijacked, `Escape` closes and restores focus.
- **DocsReader:** content is real, authored from the repository Markdown; semantic headings, stable code formatting, TOC/anchors, link resolution and no layout jump from font loading.
- **GuideRunway:** interactive progression, not just four disabled-looking decorative blocks. Aria labels and descriptions should update with selected step.
- **ReleaseFolio:** sheets + accessible chronological rows, full source entries, exact source/publication qualifier, provenance link, no unverified date.
- **CommunityBranches:** visual links require actual hrefs and readable labels; branch illustration doesn't need focus if no interactive role.
- **Footer:** information architecture, no fake subscription/community claims, consistent color contrast.

## Libraries — install only what solves known problems

- Next.js 16 App Router + TypeScript (verify versions), CSS variables and Tailwind 4 optional but preferred only if it improves implementation clarity.
- `@lucasmarkes/hairline`: selected figures only; import from `@lucasmarkes/hairline/react`. Read API and theme variables. Install the upstream **skill** in Antigravity if supported: `npx skills add lucasmarkes/hairline`, then review `/hairline-create` and `/hairline-adopt` if the agent provides those commands. Skill is not assumed installed or required for basic figures.
- `motion` for React: shared layout and selected state transitions using `layout`, `layoutId`, `AnimatePresence`; `MotionConfig reducedMotion="user"`. Do **not** add GSAP unless an actual hero/scroll timeline needs exact scrub and the alternative has been proved inadequate; do not add Lenis by default.
- Radix Primitives for search/Dialog, Tabs, Accordion as needed. Use **headless** behavior + exact custom art; never dump a stock UI kit onto the product.
- Fumadocs MDX + Core for docs content source; customize the readers to the site (not default docs skin).
- `next-intl` preparation: English only initially; one dictionary, language-tag layout, future route architecture, CSS logical properties. Use default unprefixed English routes. No language switch, no theme switch, and no Arabic translation yet.

## Next.js implementation shape (guideline, not abstraction theater)

```text
src/app/[locale]/layout.tsx             # <html lang dir data-theme>, metadata, fonts, providers
src/app/[locale]/page.tsx                # Home, server rendered wrapper
src/app/[locale]/packages/page.tsx
src/app/[locale]/packages/[slug]/page.tsx   # only sourced package pages
src/app/[locale]/docs/page.tsx
src/app/[locale]/docs/[...slug]/page.tsx
src/app/[locale]/guides/page.tsx
src/app/[locale]/changelog/page.tsx
src/app/[locale]/community/page.tsx
src/components/brand/hero-route.tsx
src/components/art/interlocking-hairline.tsx
src/components/flow/flow-explorer.tsx
src/components/packages/package-composer.tsx
src/components/docs/docs-reader.tsx
src/components/changelog/release-folio.tsx
src/components/common/header.tsx, footer.tsx, button.tsx
src/content/docs/**/*               # original markdown source or synchronized source pipeline
src/lib/releases.ts                 # parses entire changelog and status
src/lib/packages.ts                 # exact package inventory + NuGet verification data
src/i18n/routing.ts, request.ts, messages/en.json
src/styles/tokens.css, global.css
src/app/sitemap.ts, robots.ts
proxy.ts                            # next-intl when needed by chosen strategy
```

## SEO and publishing must be tested, not narrated

1. All important copy, code/docs source, key package metadata and release entries are present in **server-rendered HTML**; client UI enhances, never gates crawlability.
2. Each route has verified unique title/description/canonical/OG and breadcrumb where relevant. `metadataBase` derives from an explicitly configured/verified production origin. Do not invent a domain.
3. Sitemap includes all published docs and package pages. Exclude local concepts/QA/preview and unsupported localized routes.
4. Structured data must represent real software/code only, not fabricated ratings/downloads. Ensure `robots.txt` and `noindex` preview routes are appropriate.
5. Full release history from `CHANGELOG.md` is a hard requirement. Unpublished versions must be labeled as source/in-progress and never featured as a NuGet current version without per-package proof.
6. Content parity against repository Markdown (line links, internal anchors, headings, snippets). Version pin real code tests where possible.
7. Use Lighthouse in CI/preview and real Core Web Vitals from deployment; targets (not guarantees): LCP <2.5s, INP <200ms, CLS <0.1 at p75. Keep Hairline imports and client islands small.

## Accessibility, responsiveness, RTL, future theme

- WCAG 2.2 AA target; keyboard/zoom/reduced motion, meaningful focus order, adequate contrast, 44-ish px touch affordances where useful. Source documents remain readable under 200% zoom.
- Browser viewport test matrix: 320 / 360 / 390 / 768 / 1024 / 1440 / 1920, screenshots across 6 routes and high-interaction states, no sideways page scroll.
- Use `margin-inline`, `padding-inline`, `inset-inline`, `text-align:start`, and CSS logical borders. Content `lang=en`, `dir=ltr` now. When future Arabic arrives, UI reverses intentionally, but C#, terminal commands, URLs, trademarks, package IDs and graph semantics stay isolated LTR where needed.
- Only one approved theme now. Store semantic CSS tokens under `data-theme="warm-forest"`; do not create a second theme or theme selector. No auto dark mode.
- No transitions/animations on initial page for the user who has reduced motion; no layout shift. Test touch and keyboard where pointer-only interaction exists.

## Required working process — don't deliver all pages before visual check

**Gate A — visual:** build Home hero and `Packages / Assembly Bench` plus one Docs/Guides interior slice. Run Chrome at desktop/mobile, capture screenshots, compare against `screenshots/`, review carefully for cramped fonts, overflow and unnatural blank space. Fix before cascading the component system.

**Gate B — interaction:** integrate actual Hairline figures and Motion. Inspect pointer vs focus parity, selected state, code sync, layout overlap and reduced motion. Keep an exact screenshot/recording of rests and activated states.

**Gate C — completeness:** build all six top-level routes, real docs, package detail routes and full changelog. Validate links and content integrity. Do not replace source docs with synthetic summaries.

**Gate D — quality:** Playwright interaction/visual regression, axe, keyboard, responsive, light/dark token constraints, RTL smoke samples, build/SEO/sitemap/OG checks, live preview performance. Provide an issue list; iterate, don't declare 100% by assertion.

## Explicit DO-NOT list

Do not: preserve v7's inner hero pattern, drop a demo into a dark rectangle, use identical 3-col feature cards on every route, animate the logo/heading while reading, add lots of glow and fake 3D blocks, claim runtime tracing, publish unreleased packages, silently change release semantics, install every animation package for its own sake, add unnecessary microservices/services/CMS/backend/analytics, make up screenshots, overwrite AstraFlow source or packaging.

## Copy-paste task for the Antigravity coordinator

> You are implementing the **AstraFlow Connected Instruments visual rebuild** from the attached `AstraFlow-Experience-Reset-v9` folder. The user rejected the previous Crafted v7 layout. **This is not a faithful port of v7.** Read `UX-AUDIT-AND-REPLACEMENT-MAP.md`, `TECH-AND-LIBRARIES.md`, this full brief and inspect all six HTML visual study pages/screenshots before coding. Keep the exact approved AstraFlow SVG mark and the Warm Ivory / Forest / Vermilion direction, but replace every repeated boxed inner hero with the route-specific compositions documented here. The homepage mark, content and main art must stay stationary while only the signal line moves subtly. Build genuine interlocking Hairline figures outside dark panels using `@lucasmarkes/hairline`, small state transitions with Motion for React, native scroll, Radix for accessible primitives, server-rendered source-backed Docs and Changelog via Fumadocs/MDX where useful. Add future-ready `next-intl` with **English only** and logical RTL-ready layout, plus single active warm-forest theme tokens; do NOT add switchers, Arabic content, dark mode, fake features, fictional release status, or generic stock component skins. Read the original docs/README/CHANGELOG and check published package IDs before stating version facts. Build one audited slice first, then six pages and package details; verify at seven responsive widths, keyboard/reduced motion, source completeness, SEO, metadata, sitemap, server-rendering, Lighthouse and error-free interaction. Return real screenshots, failures, diffs and a preview link; do not claim production ready until gates pass. Take creative initiative only within the documented art direction, and make all exceptions explicit for approval.

### Optional library research (DO NOT install unapproved packs)

Study official examples at Motion Primitives, React Bits, and 21st.dev to learn component transitions and compositional geometry. Custom-build AstraFlow-branded primitives rather than importing their default visual skins. Consider Rive only if the user approves a unique state-machine brand interaction and the measurable experience benefit beats SVG + Motion + Hairline. These references are optional inspiration, not part of the required production dependencies.
