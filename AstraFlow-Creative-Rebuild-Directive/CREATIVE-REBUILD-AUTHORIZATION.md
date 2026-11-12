# AstraFlow — Creative Rebuild Authorization (Supersedes visual-preservation clauses)

**Status:** Implementation directive to the agent maintaining the existing Next.js AstraFlow website.
**Date:** 2026-11-12
**Nature:** A selective visual and interaction redesign of the website's presentation layer. It is **not** a new brand identity, a documentation rewrite, or a wholesale repository rewrite.

## Why this directive exists

Previous prompts inadvertently tied the agent to the prototype's page compositions. The agent was told to 'preserve the approved layout', 'respect the existing screenshot', and 'polish the components'. That made accurate imitation the safest behavior. **Those constraints are now explicitly revoked for the screenshot-visible component compositions and their behaviors**.

The user is **not asking for v12+polish**. They are authorizing the agent to remove and replace every illustrative, generic or placeholder UI component shown in the supplied localhost screenshots, including the existing hero treatments, diagrams, assembly visuals, page-level signature experiences and transition patterns. Keep AstraFlow's visual **identity** and product accuracy. **Do not freeze AstraFlow's prior UI compositions.**

### Precedence (mandatory)

1. Correct product facts, accessible usage, security, performance and actual working navigation: never sacrificed.
2. AstraFlow's brand identity: custom A geometry, warm-ivory/deep-forest/vermillion roles, typography's editorial character, visual discipline.
3. This directive's replacement mandate and interaction acceptance gates.
4. v12 screenshots and implementation: **legacy creative references**, not pixel-perfect target layouts. The HOME orange trace-through-A concept is kept, but the rest of the Hero composition can be recomposed.
5. Older 'preserve the current layout' and 'don't redesign' prompts: **superseded** for targets in this brief.

Everything must be made consistent and future maintainable. Avoid gratuitously rebuilding valid routing, content loading, translations foundation, metadata, CI, dependencies or unrelated packages.

## Protected / free-to-change boundary

**Protected:** AstraFlow name and canonical logo path/shape; core brand color roles; meaningful slogan and factual capability claims; repository-based docs, real package IDs and release evidence; route names and working deep links; English current UI, future localization/RTL and theme foundations without visible controls; the idea of a stationary A with a trace moving inside it; functional and accessible interactions.

**Free to radically replace:** all page hero layouts other than the mark itself; every illustration and box in the screenshots; typography scale and layout relationships; all placeholder isometric cards, square tiles and little diagram boxes; all section compositions; navigation microinteractions; the entire Flow Explorer presentation layout; package assembly UI; guides rail; changelog folio; community radial graphic; low-value decorative sections; old motion primitives. Change markup and React components as much as necessary. Replace, do not re-skin.

**The website must look materially different from current localhost screenshots**, while clearly remaining AstraFlow. A screenshot with a slightly elevated card, more shadows, and an orange hover line is a failure.

## Creative North Star

Build **AstraFlow as a living engineering instrument**, not a collection of SaaS cards with pseudo-technical drawings. Visual gestures come from a meaningful cause-and-effect relationship: declaration -> routing -> transformation -> evidence. The interface should feel manufactured rather than decorated: structural rails, physical assemblies, layers that bind, dock, align and separate, connected but readable motion, precise contact points and subtle lighting. Use editorial typography and abundant neutral breathing space between high-intensity moments.

### Motion density

Use a **high-low-high-low rhythm** (e.g. signature hero, quiet text section, interactive workbench, quiet explanatory section, one bespoke assembly). An exceptional interaction is distinct because the rest of the page is calm. Repeated entrance animations and continuous global movement reduce impact.

### No-fake-feature constraint

No pretend product metrics, runtime tracing, fake automated graph knowledge, unsupported dependency relationships, synthetic NuGet release statuses, performance claims or screenshots of imaginary tools. Label guided visual demos as illustrations of documented APIs; never depict them as live observability.

## Mandatory screen replacement map

For EVERY target: write down the React file path and original DOM/component removed; replace the design AND behavior; record user action, resulting state and the animation's role. All named files/selector paths are illustrative; inspect the real repo to map them.

| Surface shown in supplied screenshots | Remove/replace | New interaction-art direction (not a fixed template) | Mandatory proof |
|---|---|---|---|
| Home Hero / Control the Flow | Refine the current flat-ish foreground, labels and route art without treating the existing screenshot as immutable. Keep canonical A and stationary type and mark. | Precision-engineered physical route with physically connected signal, subtle depth layers and active passing-through-nodes behavior. State remains stable; signal visibly travels along the approved path. Optional pointer response is gentle and does not translate the A. | 10-second real browser recording of signal; pause/reduced-motion test; screenshot at 390 and 1440. |
| Home / Follow the Engine | **Delete the whole three-column rectangular pseudo-dashboard presentation.** Existing left scenario list, row of 4 little boxes, right code panel are a draft UX, not target design. | New open **Flow Observatory**: a spatial request path and nodes connected to a context panel; relevant code visibly follows the selected node. Focus / selection visually travels through space using one state machine, not fading independent islands. Boundaries guide reading; fewer enclosing boxes. | Video: 3 scenarios x 4 stages, keyboard/touch, interrupt by switching scenarios mid-transition, no mismatched code. |
| Home / Every Piece Has a Purpose | Remove the generic stacked rhombus SVG and disconnected list. | Bespoke **Architectural Assembly**: declarations, composition and inspection fit together into one instrument. Layers physically dock/undock, dependency-independent composition remains semantically honest. Shallow, elegant parallax only on input; focus affects actual physical stack. | Live pointer and keyboard interaction; rest/hover/selected screenshots; clear physical relationship. |
| Home / Module and CTA sections | Replace repeated small placeholder feature cards / static links as necessary. | Connected typography-driven product chapters; significant negative space; contextual rail animated only when chapter enters or state changes; no generic card-grid. | Full-page before/after screenshot plus accessibility pass. |
| Packages Hero | **Remove the current three rectangular tilted CONTRACTS/MEDIATOR/MAPPER cards entirely.** | A **Purpose-Built Composition Machine**: real installable packages represented by modular plates/connectors/sockets that can snap to build a system. Artwork is open to the page and visually captivating, not a dark box. Each move has a logical consequence; do not present false mandatory dependencies. | Video: select 1, 2, 3 packages and see assembly react; desktop and mobile layouts. |
| Packages / Assembly Bench | Replace plain checklists / command-card with an integrated spatial assembly and command surface. | Package picker, physically connected figure and `dotnet add package` commands share one state. Commands should update immediately even while animation runs; select and detach layers; responsive behavior must not rely on hover. | Toggle quickly; exact command matches selected real package IDs; copy; keyboard; reduced motion. |
| Docs Hero | Replace 6 small topic boxes + static 'search' text mockup if they are merely a promotional set. | A **Living Reference Desk**: real working search, useful suggestions grouped by purpose, readable code lens or source-linked mini knowledge diagram; compact, calm, serious. No heavy Hairline graphics inside long articles. | Keyboard search, empty results, first result, source link, docs article scroll/TOC/copy. |
| Guides Hero + Journey | Replace current four-box static journey rail and repeated six-card grid. | A **Learning Route** with path-based progression. Step expansion originates at clicked point, active route grows toward next verified guide; selected details become part of same composition instead of appearing as separate disjoint panels. | Select first, middle and last step; route updates without false progress; keyboard/touch. |
| Changelog Hero + full history | **Remove floating three-piece version cards.** | A distinct **Version Archive / Mechanical Folio**: accurate release markers bound to a spine, readable detailed entries; selecting an older version pulls its sheet to front and reveals source-backed changelog details; release statuses retained. | Three different real versions and states, link to sources, full history, no fake dates. |
| Community Hero | Replace the small central A with simple four static spokes and four white mini-cards as current composition. | **Contribution Circuit / Open Branchwork**: clearly different routes lead from repo to code, issues, PRs, docs. Hover/focus highlights entire path, endpoint emerges with context, layers connect in open page space; mobile becomes a usable path list. | Real links clickable via mouse/keyboard/touch; targeted response; no fake social network. |
| Global navigation, buttons, disclosures, footer | Replace crude underline and repeated miniature hover patterns where appropriate. | Cohesive origin-aware interactions, subtle shared active location, deliberate affordance hierarchy, high-quality focus and pressed states, cross-page transitions with layout continuity only when supported. | Real screen recording of navigation, mobile menu, focus states and reduced motion. |

## Required engineering of original bespoke Hairline figures

**Do not interpret 'use Hairline' as import one stock figure and call it a day.** The official agent skill `/hairline-create` generates a **standalone HTML figure**, with an intensity slider, theme/play controls and inspection script. `/hairline-adopt` **rebuilds** an SVG on its engine; it is not a faithful SVG tracer. Inspect official rules and source before porting or integrating. The canonical AstraFlow logo must not be altered by `/hairline-adopt`.

Deliver **at least 4 genuinely bespoke and semantically distinct geometric studies**, then integrate the good ones into the Next.js website (or justify custom SVG+Motion if the Hairline engine proves incompatible). Recommended studies:

1. `astraflow-route`: a rail and signals passing through typed request, registration/composition, handler and result with focus-driven paths.
2. `astraflow-assembly`: independent capabilities snapping into an understandable assembly in response to deliberate user selection.
3. `astraflow-branchwork`: one source, four real contribution routes; pointer proximity changes emphasis, click navigates.
4. `astraflow-version-spine`: historical versions as a bound folio; selected sheet emerges, neighbouring sheets react.

Stretch studies (only after proving the essentials): `astraflow-learning-path`, `astraflow-reference-lens`.

For each study: write the metaphor (what the object is), exact pointer/focus/touch behavior, readout/text semantics, empty/rest state, motion-disabled state, and whether it should become a React component. Show the **skill-generated HTML artifact** and the **actual integrated React usage**. If the skill HTML is not compatible with the React API, do not fake it with a screenshot; implement a verified client wrapper or controlled bespoke SVG+Motion variant with clear ownership and cleanup. Maintain accessible independent DOM controls. Verify Hairline current props and import path against installed package docs, not memory.

**No fabricated count of imported Hairline figures counts as success.** Count actual custom interactions and demos users can operate.

## Signature experience acceptance contracts

### A. Home Flow Observatory

- Single typed interaction state, e.g. `{scenarioId, selectedStageId}`; derived code, labels, path highlights and stage progress.
- Scenario switch during an in-flight animation cancels/replaces it without queuing or old-code flash.
- Clicking stage 4 from stage 1 works, not only Next/Previous.
- Node/rail physically connected. Selected state must stay visually observable in reduced motion.
- Narrow screen is a deliberate alternative layout, NOT a cropped desktop SVG.

### B. Packages Composition Machine

- Only verified actual installable package IDs appear in `dotnet` commands.
- Selection changes the spatial geometry, current focus and command list.
- Remove / undo action is immediate in data, animated in appearance, interruptible.
- No false technical dependency graph; composition represents optional assembly, not runtime call chains.

### C. Community Branchwork

- Real navigable source destinations, no dead ends.
- Focus/tap equivalence for hover-only effects.
- Route emphasis reveals relationship and destination.
- Mobile has semantic accessible controls even if figure is simplified/hidden.

### D. Version Archive

- Render all verified history, including statuses, chronological navigation.
- Opening/closing a release shifts nearby entries without jumping scroll position.
- Visually and semantically distinguish repo milestone vs GitHub release vs NuGet-published artifact.

## Creative workflow — no more screenshot-only polish

### Phase 0 — Honest baseline audit

Read and inspect **the actual existing Next.js code** and record its state. The old brief is not evidence of implementation. Record `git status`, package versions, page routes, actual Hairline imports and actual rendered/interactive custom figures, Motion usage, and existing screens. Create a branch. Protect .NET packages and docs content. Preserve working SEO/i18n/theme foundations.

### Phase 1 — Radical visual invention in a real browser

Create a temporary **internal design-lab route** (`/__craft` or equivalent) with **two distinct, fully interactive alternatives** to the same critical experience, *not two Tailwind color variants*. At minimum create two working alternatives for (1) Packages Hero and (2) Home Flow Observatory, each with a materially different **spatial object, event model and composition**. Prefer one purposeful scene over many generic panels. The agent may choose which concept best balances clarity, artistic quality, performance, and implementation complexity. Do not ship `__craft` in the public sitemap or production deployment.

**No planning-only stop.** The first tangible output must be functioning bespoke interactions and browser recordings, not a design report or a static pasted figure.

### Phase 2 — Implement the replacement surfaces

Implement packages and home first, then community and changelog, then docs and guides, then global polish. Replace old markup/components. Treat the first successful slice as the new creative quality bar; do not mechanistically replicate one layout on every page. Keep routes and content intact. Keep working behaviors while changing presentation. Remove obsolete components and dead animation code.

### Phase 3 — Production-quality verification

Produce reproducible browser videos **for real pointer, focus, click, touch and scroll actions**, not just autoplay demo loops. Compare BEFORE and AFTER at identical viewports. Show full-page screenshots and 3 short interaction clips for each signature experience. Include at least one mobile behavior video for each of Home, Packages, Community.

Require: zero hydration errors, no overlay or overflow, stable scrolling/anchors, 200% zoom, keyboard focus visibility, semantic controls, no motion-only information, `prefers-reduced-motion`, offscreen/hidden-tab pause, no performance regression on realistic mid-range hardware. Audit all routes at 320,390,768,1024,1440,1920px. Run typecheck, lint, build, Playwright, axe and Lighthouse; report measured results and limitations. Do not claim field CWV from local lab results.

### Phase 4 — Ship only accepted craft

Remove unfinished visual experiments and test routes from public build. Deliver changed file inventory, installed dependencies with justifications, bespoke generated Hairline files, React integrations, videos, before/after comparison, verified package content, a QA matrix and a list of known limitations. Do not deploy without approval.

## Failure conditions (hard reject)

- Same old screenshot composition with hover/opacity/translate enhancements.
- Only CSS animations added to previously static panels.
- Hairline installed, but no original figure developed and integrated.
- Several stock Hairline components randomly scattered across pages.
- No user-operable interaction tied to a meaningful page state.
- Fake dependency or execution telemetry, made-up product facts or release dates.
- Motion obscures content, breaks keyboard navigation or mobile, causes layout shifts/jank.
- Static screenshots offered as the only proof of animation quality.
- Success declared on a patch that does not remove/replace the placeholder components shown in the reference screenshots.

## Required final response from implementation agent

1. Links or file paths to `/__craft` proof (dev only) and its alternative interactions.
2. File-by-file component replacement table: OLD -> NEW, with meaningful reason.
3. Actual Hairline skill outputs and working React integrations, or explicit justified SVG+Motion alternative.
4. 6-page full-page screenshot pairs; 4+ live behavior recordings; mobile examples.
5. Typecheck/lint/build/Playwright/axe/Lighthouse results (command + result), WCAG/reduced motion/keyboard notes.
6. Honest issues, engineering trade-offs, what is or is not done. No unsupported '100%' or 'production-ready' claims.

**Start executing without asking me to repeat the design brief. The user has explicitly authorized replacement of the placeholder visual components.**
