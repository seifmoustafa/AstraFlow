# ASTRAFLOW — CREATIVE COMPONENT REBUILD / PASS 03

> **Priority:** This is the NEWEST user-approved mandate. It expressly **supersedes** the restrictive visual-freeze clauses of `AstraFlow-Final-Craft-v12`, `Motion-Craft-Pass-02`, and any instructions telling you to preserve existing scene composition, existing hero structure, existing generic panel layouts, or existing component visuals. Their assets are historical references, NOT pixel-perfect requirements.
>
> **Preserve:** authentic AstraFlow logo geometry and its accessible contrast variants; Warm Ivory / Deep Forest / Signal Orange identity; real product capabilities, existing URLs and trustworthy content; secure/maintainable Next.js structure; SEO, accessibility, localization/RTL and theme-token foundations (English and one theme visible). The Home Hero's recognizable A-plus-trace idea is retained, but its execution can be materially refined.
>
> **Replace:** the user-marked placeholder diagrams, overlapping cards, dark instrument rectangles, rotated version cards, generic list/card sections, and their behaviors. You have permission to substantially redesign and reimplement EVERY marked page scene, including major layout, hierarchy, SVG geometry, component architecture, and interactions.

## What you are building

The current app is an acceptable initial HTML-to-Next.js port. This assignment is **NOT A PORT, NOT A MOTION PATCH, AND NOT A MAINTENANCE PASS**. It is a **creative rebuild of the visual experience and interaction components** inside the functioning Next.js app.

The user explicitly rejects the present placeholder components in the screenshots. Matching those screenshots again is **a failure**. Keep the brand and truthful text. Replace the placeholder scenes with distinctive interactive editorial engineering illustrations made for AstraFlow, not generic marketing or stock Hairline demos.

The current Next.js local working tree is your actual implementation source. Read it before editing. The static historical files in `design-reference/AstraFlow-Final-Craft-v12/` are *not* the standard for these components anymore. User-provided screenshots show what to replace; do not use them as final target screenshots. Do not touch unrelated .NET package projects.

## Rules of the engagement

1. **Real replacement, not cosmetics.** A scene counts as rebuilt only when visual composition AND interactive behavior are materially different. Adding hover scale, floating dots, a fade, a progress underline, a new border, or installing Hairline does not count.
2. **Make the illustration part of the page.** Figures should stand openly on the Ivory canvas, connect through hairlines and precise negative space, and intersect editorial headings in a controlled, accessible composition. Do not put every hero in a dark rectangle. Dark Forest may be used for ONE purposeful technical chapter, never as a default wrapping container.
3. **Distinct visual metaphors.** Home Flow ≠ Home Assembly ≠ Packages Composer ≠ Changelog ≠ Community. Do not reuse a generic geometry diagram with a new title. Each page gets its own scene and user action.
4. **Meaningful response.** Pointer, focus, touch and explicit controls change actual state/relationships in the visual and adjacent explanation. Motion does not have to run autonomously; interactions must feel responsive and expertly crafted.
5. **Brand with restraint.** Keep canonical AstraFlow logo paths, palette and typography roles. Signal Orange is a state/decision/CTA color, not a universal glow filter. The visual 60/30/10 hierarchy is a guide, not a pixel ratio.
6. **No false product claims.** A flow illustration is conceptual, not live telemetry. Package blocks represent independently adoptable capabilities, not invented dependency edges. Changelog entries must reflect source/release/NuGet evidence.
7. **Implement, don't end at recommendations.** Build actual React/TypeScript components, integrate them, render them, record interactions, compare before/after, iterate until convincing. Only claim done based on working code and visual proof.

## NEW authoring brief — six page chapters

Read `SCENE-REPLACEMENT-MAP.md` for every target, user trigger, exact behavior and practical technology decision. The intended creative concepts are:

### Home: THE LIVING FLOW ATLAS
- Hero: retain unmistakable original A silhouette and the moving signal on its route; dramatically improve path/label craft, layering, kinetic linework and material/typography balance, without moving the whole logo/headline. Signal pause/reduced motion, no endless glow blooms.
- Replace the **entire boxed three-column** `FOLLOW THE ENGINE` widget with an **open spatial flow instrument**: four large well-composed nodes connected by one living path, a stage-bound contextual code sheet, and a scenario selector that can reconfigure the flow. The active signal travels to the new node, the selected node becomes an inspected object, the explanation and genuine sample code update together. Preserve content and semantics, NOT the table/dashboard layout. A dramatic dark chapter is allowed if it is architecturally open and legible, not a rectangle around all elements.
- Replace existing 3-layer Home composition with a custom tactile **Exploded Architecture** connected object: layers lift, pivot subtly and magnetically settle, neighbours react proportionately, annotations and connection lines respond. No floating cards.

### Packages: THE MODULE LOOM
- **Destroy/rebuild the current static rotated-plate hero illustration.** Create an original modular weaving/assembly device: physical modules approach intentional docking rails, joining a shared artifact when selected; the composition is asymmetric and integrated with page copy (not the 3 tilted cards).
- **Destroy/rebuild the generic split package list+code box** as a stateful *Build Your Stack* workbench. Selected items visually form one stack/object with insertion/removal sequences and live, accurate install commands. Keyboard and touch must be full citizens; avoid fake drag gestures if they add no value.
- Hero and composer share design grammar but remain distinct scenes.

### Docs: THE REFERENCE DESK
- Remove the conventional big headline + six boxed links as its only interaction. Turn the first fold into a useful editorial documentation front door: a responsive command/search surface, topic index whose active result morphs to a preview/context line, and a coherent connection into actual docs articles. Keep reading areas quiet, fast and accessible. Do not place an autonomous animation in article bodies.

### Guides: THE LEARNING RUNWAY
- Replace the four numbered static boxes + 6 generic cards as the dominant visual. Create one connected, tactile learning rail. Selecting a milestone causes a common progress signal to travel to that step; a paper/terminal detail sheet unfolds from its actual origin and reveals one accurate code/example/learning outcome. Journeys can be selected out of order; no fictional completion tracking.

### Changelog: THE LIVING EDITION
- **Replace all current rotated version cards.** Create a dynamic editorial release index: a spine of verified release records and an expressive physical **folio/sheet** system that opens/reorders/peels as a user selects a version. Metadata and statuses remain readable and source-verified. Do not sacrifice scanability for a page-flip trick. Design a separate reduced-motion state.

### Community: THE CONTRIBUTION CURRENT
- **Replace the four small boxed links around the center and the three generic contribution cards.** Build a spacious, organically structured branching diagram integrated into the Ivory canvas. The source has four real paths (code, issue, PR, docs), with path inspection/activation via hover, focus, tap, and real accessible links. Each selected branch changes shape/emphasis and exposes its exact next action and source destination. Idle scene remains calm. No fake community statistics.

## Hairline: the right way (crucial)

Official docs: https://hairline.lucasmarkes.com/docs and https://hairline.lucasmarkes.com/skills . As of 2026-11-12 the docs describe 33 stock figures, a React entry, a palette of CSS variables, and agent skills `/hairline-create` / `/hairline-adopt`.

**Critical distinction:** `hairline-create` is a *standalone HTML figure generator*, not a magical application-aware React scene builder. Its output must be validated and **integrated or intentionally re-authored** into the actual React app. Converting the prototype to a React component, connecting real app state, providing semantic buttons and keyboard/touch equivalents, theme matching and reduced motion are separate tasks. Do not report a standalone HTML experiment, installed skill, or stock `<Exploded />` mount as an integrated AstraFlow figure.

Implementation order:
1. Audit current installed Hairline and actual usage in production bundle.
2. Use `/hairline-create` for **at least two original AstraFlow-specific interaction studies** (e.g. exploded architecture and contribution current); input concept must specify object, pointer/focus action, readout, rest pose and tour. Use `/hairline-adopt` only when a genuine source SVG exists and geometry recreation is acceptable. Never redraw the canonical brand logo by using adopt.
3. Browser-test each standalone figure, including 0.2–0.4 intensity and strong settings, mobile size, animation pause and contrast on Ivory.
4. Integrate the winning originals with the current React state model using documented public API or a clean adapted custom SVG+Motion component. Do NOT fork undocumented Hairline internals to force coupling.
5. For each custom piece report `concept file -> React component path -> page usage -> actual state inputs -> demo video`.
6. Use stock Hairline components **only** where the stock metaphor clearly improves a smaller supporting moment (e.g. blank states, supplementary guide illustration). A library import alone is NOT a delivered custom scene.

Official Hairline visual options: `--hairline-plate`, `--hairline-hi`, `--hairline-edge`, `--hairline-mid`, `--hairline-lo`, `--hairline-stroke`; `play` defaults to false. Distinct page scenes should not feel like the same stock figure multiplied everywhere.

For real state transitions use `motion/react` (`layout`, `layoutId`, `AnimatePresence`, SVG stroke/path animation), CSS transforms or WAAPI where appropriate. Avoid introducing GSAP/Lenis/Three.js/Rive without a measured problem that the simpler stack cannot solve.

## Suggested creative motion choreography (not generic fade presets)

- **Hover/focus:** physical relationship changes—nearby layer shifts, current node reveals a labeled hairline, connector becomes active, neighbouring components yield subtly. On pointer leave the scene settles naturally; all state also reachable via keyboard and tap.
- **Selection:** a focus outline travels from former to newly selected element, trace reaches its new destination, an inspector panel morphs from the physical selected part, typed code sample and semantic text update together.
- **Scroll:** ONE or TWO chapter-level narrative sequences can use scroll progress, e.g. the connection rail arriving from the hero into the Flow Atlas, or folio spine progressing between version entries. No scroll hijack or obligatory pinning; skip/disable gracefully on mobile and reduced motion. Other scroll reveals should be restrained.
- **Navigation:** refined active-link transition and route transition consistent with content loading. No delayed keyboard navigation or giant page wipes on every docs link.
- **No ambient chaos:** once idle, the interface is beautiful and still, except the deliberately pausable home signal.

## Mandatory review artifacts, not optional

For each 11 scene targets in `SCENE-REPLACEMENT-MAP.md` provide a line in `CRAFT-CHANGELOG.md`:
`route/section | old component/file | new component/file | old visual metaphor | new metaphor | changed interaction | Hairline/CSS/Motion | proof link | known limitations`.

Provide actual Playwright videos (not GIF assembled from static screenshots) of:
1. Home: switch all three scenarios and go through stages, show code and trace synchronicity.
2. Home: custom architecture layers respond to pointer, keyboard and touch.
3. Packages: select/deselect modules, show assembly physically change and install commands agree after rapid toggling.
4. Changelog: select versions and expand folio, preserve accurate status and keyboard navigation.
5. Community: highlight 4 routes via hover, focus and tap, then follow real destinations.
6. Guides: select any step, inspect flowing rail and contextual detail transition.

Capture *before and after* same viewport screenshots: first fold, full page, key states on desktop & mobile. Screenshot-only proof is insufficient. Audit reduced-motion, 320/390/768/1024/1440/1920 px, keyboard, 200% zoom, popstate/back, no horizontal overflow, hydration errors, source mismatch or unbounded animation loops. Run production build, TypeScript checks and relevant Playwright/axe; measure significant performance regressions. If visual effect fails reduced-motion, keyboard, or mobile, fix it or omit it.

## Acceptance / veto gates

**Automatic REJECT if:**
- Any targeted scene is still substantively the old static figure/cards with just hover, opacity or `translateY` added.
- A new dark dashboard panel is used as the default hero for every page.
- All six routes share a single hero-template with shuffled headings.
- Hairline is declared complete based only on installation, a stock import, or a standalone skill demo.
- Motion is unsynchronized from actual UI state or becomes distracting.
- Product facts, keyboard interactions, content, SEO, accessibility or performance regress.
- Only screenshots, no actual interaction videos, are submitted.

**Accept only when:** at least the six main chapters and 11 screenshot targets have materially distinct geometries/behavior; original interactive work is inspectable in source code; there is evidence for the changes; product intent remains instantly understandable; the app remains fast and accessible. Do NOT give an invented quality percentage or claim it is the world's best.

## Run plan — implement in this order, do not stop after outlining

0. Inspect current working tree, installed dependencies and existing components. Create feature branch. Record 11 BEFORE screenshots + representative video and file inventory. Read brand assets and authoritative product docs.
1. Build **three creative replacement slices immediately**: (a) Packages hero + composer, (b) Home Flow Atlas, (c) Changelog folio. They MUST NOT look like v12. Show comparative screenshots and browser videos as soon as they function; refine until difference and polish are obvious.
2. Build Home architecture, Docs, Guides and Community with similarly bespoke visual language. Do not reuse the same graph for all.
3. Polish supporting micro-interactions, responsive behavior and motion profiles, then complete verification. Record exact component paths and evidence. No production deployment without authorization.

**Stop preserving placeholder UI. The user is approving an original creative redesign of those components, not a faithful port.**
