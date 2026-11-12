# AstraFlow — v7 UX audit → v9 redesign contract

**Purpose:** This is a fresh, intentionally different component composition to supersede the rejected v7 inner pages; do not present it as a pixel-approved final site. v7 is reference material for content and real behavior, not the layout source of truth.

## Root cause of v7’s weak visual quality

1. **Repeated hero template:** identical 50/50 split across Packages, Docs, Guides, Changelog, Community; only the caption and the rectangular dark artwork changed. The pages feel like six permutations of one banner rather than different developer workflows.
2. **Illustrations trapped in containers:** large dark rectangles contain small ornamental diagrams. This creates "a slide inserted into the website" instead of a component that participates in the page's spatial geometry.
3. **Interaction as veneer:** pointer parallax on a separate illustration is not the same as an interlocking component system with state-dependent relationships.
4. **Motion without priority:** hero composition drifts, revealing objects that users need to read. Keep the logo and content stable; animate the **route signal** and state transitions only.
5. **Poor density control:** tertiary pages spend too much of the first viewport on hero decoration, leaving actual tasks below the fold. Navigation latency is caused by content hierarchy, not only animation.
6. **Type repeats:** oversized dark title + orange italic word is the sole punctuation mark across the site. Diversify scale, proportion, line length, background inversion, and semantic layout without abandoning the palette.
7. **Too many generic cards:** the components offer little differentiation or affordance. A package selection panel should respond to selection; a guide should actually advance through a path; a release list should expose trustworthy change history.
8. **Hairline was visually approximated, not integrated:** the hand-drawn SVG box is not upstream Hairline, and hovering only the whole box misses the figure's interactive value.

## Exact section and component replacement map

| Route / component in v7 | REMOVE / DO NOT PORT | v9 replacement and visual specification | Interaction source | Recommended React integration |
|---|---|---|---|---|
| Shared inner hero (`.inner-hero`) | Universal left h1 / right dark panel | **Different composition per route.** Specific first-fold answer, varied geometry, immediate route-specific function | none by default | Server Component, CSS grid |
| Home `.signature-stage` | Logo bob/parallax and invasive pointer drift | **Anchored mark and composition.** Only a subtle moving trace highlight travels on the SVG path; no layout shift | Path motion independent of content. Pause offscreen and reduced motion | Custom SVG + CSS or Motion |
| Home `.flow-lab` | One giant dark window containing three nested UI boxes | A single structured **teaching instrument**; accessible scenario selector, state node rail, synchronized code and explanation. Dark background only here because code belongs here | click / keyboard | React state + Motion `layoutId`, Radix Tabs if relevant |
| Home `.craft-join` | Floating box containing a crude isometric stack | **Open, interlocking spatial composition on Ivory**, with real overlap, hairline geometry and connective relationships outside a dark bounding panel | pointer/focus on individual layer; no idle wobble | Hairline `Exploded` or `Stack`, with accessible overlay controls |
| Home `.features-grid` | Repetitive tiles with generic icons | Editorial 2 large / 4 small rhythm or 3 full-width feature bands; each feature has a different useful interaction or diagram | links, specific focus states | Shared primitive, distinct art directions |
| Packages `.package-visual` | Tilted logo board with 3 boxed labels | **Assembly Bench:** physically staggered layers on paper; selected package joins stack and the CLI preview updates | click/keyboard selection and copy | Hairline `Exploded`, `Stack` or `Patch` as **illustration**, React controls separate |
| Packages listing | Generic cards of equal weight | Searchable 15-package directory with filter chips and compact scannable rows; keep selection composer separate from directory | filter, search, empty, selected, copy | Client search; no arbitrary card kit |
| Docs `.docs-hero-editor` | Full code editor as *decoration* | Documentation **index and search** within the first viewport; source article immediately accessible; code samples have provenance | search and command dialog | Fumadocs MDX/Core + custom UI, Radix Dialog |
| Docs content | All pages inherit landing-card look | Dedicated reader layout: stable article width, TOC, semantic headings, accessible code, breadcrumbs; no gigantic hero on articles | search, TOC, copy, next/previous | Server-rendered MDX |
| Guides `.guide-visual` | Four squares with two-pixel line inside a dark box | **Learning Runway:** full-width, accessible progression where selecting a step changes the explanation and doc link | tabs/states | Hairline `Branches`/`Relay` as enhancement, proper tablist |
| Changelog `.change-visual` | v2.2/2.3/2.4 stacked into a fake app card | **Version Folio / Release Rail**: folded paper sheets, chronological high-density rows and selected details. Exact publication qualifiers in content | accordion, filter by version/status | Hairline `Riffle` if helpful; source parser |
| Community `.community-visual` | Brand logo inside dark rectangular box | **Open Collaboration Graph**: connected direct GitHub paths on ivory; interactive hotspots have useful destinations | focus + hover | Hairline `Branches`/`Hub`; no invented community |
| Shared `button`, `card` | Unnecessary hover float everywhere | 3 explicit actions: primary, outline, text; pressed/loading/disabled/focus; no motion for labels | real states | CSS + accessible native elements |

## New page-specific creative direction

- **Home — Signature Trace:** editorial hero stays a single composition; one orange signal moves while the A and headline stay fixed; proof strip; genuinely functional Flow Lab; open interlocking component study; nonuniform ecosystem; source-backed Quick Start. No hero full-screen scroll hijack.
- **Packages — Assembly Bench:** first screen shows selected capabilities and a physically layered diagram, not a black mockup. Actual composer uses independently selectable lines and a single live installation panel. Search and filter the 15 separate package entries, with exact metadata from repository + NuGet.
- **Docs — Reference Desk:** first screen is search + relevant entry topics, not a product ad. Reading layout is an editorial instrument; code and anchors are the focal experience. Preserve all 61 Markdown sources and add complete content indexing.
- **Guides — Learning Runway:** sequence on open canvas; selected path includes next action, estimated prerequisites from docs only if known, direct real links. Six purposeful journeys. The four-step visual shorthand cannot replace six real journeys.
- **Changelog — Version Folio:** large typographic numbers and overlapping release sheets. Timeline rows expand, filter, and link to source. Full GitHub `CHANGELOG.md` history; differentiate source milestone, GitHub Release, and installable NuGet version per package.
- **Community — Open Branches:** an expressive system of lines and nodes connecting repository, issues, pull requests and docs. No generic "community platform" visuals, fake Discord link, stars/downloads, or metrics.

## Component behavior contract

- Hairline figures are **visual enhancements, not buttons, tabs, or data models**. Pair their real interaction with semantic controls, visible focus, and accessible text. Do not fake them with static tilted cards in the production Next app.
- Each interlocking plate shows one responsibility and one relationship; when selection changes, both geometry and explanatory content update together. Never move a critical text target under the pointer.
- Animated lines run in one location at a time, or react to user state; no perpetual site-wide motion layers. Reset based on offscreen visibility. Prefer `transform` and `opacity` instead of layout properties.
- `prefers-reduced-motion` disables moving signal and animated layout. Keyboard/touch has an equivalent explanation. No GSAP/Lenis/global smooth-scroll unless a specific interaction needs it and passes usability testing.
- Respect body and heading readability, stable focus, no content jumps, `scroll-margin` on anchors and no wheel hijacking.

## Concrete color and type quality bar

- Use ~60% Paper/Ivory for **reading**, ~30% Deep Forest for **structural moments**, <=~10% Vermilion as **signal**, on an experience-level basis. Not a literal DOM/pixel-counting gate.
- Sample token anchors: paper `#F7F3EB`, paper-elevated `#FFFDF7`, sand `#ECE5D9`, forest `#082C26`, forest-deep `#051E19`, signal `#F25E3B`, accessible primary button `#B73921` with white text (confirm using computed contrast in CI).
- Minimum WCAG 2.2 AA contrast and scalable type, unclipped italic headings at 200% zoom, sensible content widths (`65–75ch` for long body text) and intentional line-height.
- Prefer one high-quality variable display face plus a separate mono face. Font files must be appropriately licensed, self-hosted and covered by font-display strategy. Do not disguise poor spacing with another font switch.

## Failure gates — reject the implementation if

- Two interior pages still share the same 50/50 hero with a dark illustration panel.
- Hairline appears only as a boxed picture, or the library is imported in every component just because it exists.
- The logo or text bobs while reading, or the animation makes the hero inaccessible without JS.
- `Changelog` displays work-in-progress as published; docs claims a live inspector or unverified generated mapping behavior.
- A button has no real action, a state has no keyboard equivalent, or documentation is hidden behind marketing effects.
- A screenshot is used as proof of motion, accessibility, or performance.
