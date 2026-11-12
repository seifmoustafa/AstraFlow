# AstraFlow — Motion & Interaction Craft Pass 02

**Status:** Implementation specification for the existing Next.js website, **not** a new website design, not a report of changes already implemented.

**Inputs:** Current agent-built Next.js app (must be inspected in the working tree), approved `design-reference/AstraFlow-Final-Craft-v12/` package and its screenshots, motion clips, logo assets, content contracts. **The actual Next.js repository was not provided with this brief, so this document does not claim a code audit.**

**Goal:** Go beyond a faithful static HTML-to-Next.js port by building a few bespoke, meaningful, accessible, high-craft, interruptible spatial interactions. Distinct page identities and proven product facts remain fixed.

## The problem to solve

A port can reproduce the CSS and still miss the *interaction design*. That gap is not filled by a generic Framer Motion fade-in, running `play` on every Hairline component, or adding a 3D object in every hero.

Evaluate the actual implementation on: (1) visual fidelity and optical alignment, (2) spatial cause-and-effect, (3) interaction feedback, (4) performance, (5) accessibility, (6) truthful communication of functionality. Fix the biggest gaps, not the largest number of widgets.

### What we are NOT doing

- No aesthetic reset: retain Warm Ivory, Deep Forest and Signal Orange, editorial typography, known logo geometry, copy and established page compositions.
- No rebuild-from-scratch of the *new* functioning Next.js app; improve that implementation in place on a feature branch.
- Do not animate the entire Home A mark, the headline, or hero layout. A fixed mark with a **single moving signal** is a signature feature.
- No generic Hairline figure pasted over an unrelated diagram; no misleading dependency graphs, fake package relationships, fabricated telemetry, benchmarks or publication statuses.
- No automatic GSAP, Lenis, Three.js, Rive, global cursor follower, scroll-snap hijack, heavy shader or autonomous movement across all cards.
- No hard numerical ratio per screenshot: **60/30/10 refers to visual emphasis**, with Orange reserved for current state, action and meaningful signal.

## Reference components and suggested upgrades

| Surface | Current reference | Production-grade upgrade | Implement with | How to verify |
|---|---|---|---|---|
| Global header | `site-header`, logos, active link | Low-contrast rule draws into active nav underline, controlled focus, menu origin-aware entry, no floating animated bar | CSS first; Motion `layoutId` if a shared active background is clearly better | Scroll, keyboard, Escape, pointer, mobile and 200% zoom |
| Home Hero | `.v10-logo-svg`, `#signature-route`, `.signature-flow-dot` | Preserve stationary logo/headline. Precise visible signal follows the actual path at a comfortable cadence, clean path glow (not bloom), pause/hidden-tab/offscreen controls; optional subtle highlight on signal crossing meaningful nodes | SVG motion or Motion path properties; no Hairline replacement | A/headline never translate or scale; only signal changes |
| Home `02 / FOLLOW THE ENGINE` | `#experience`, `.v10-flow-instrument`, `.v12-stage-current`, `#flow-code` | **Flow State Machine**: click Request/Mapping/Diagnostics -> stage 0 reset; shared animated active indicator travels node-to-node, connecting rail updates in sync with decision detail + actual C# code + stage counter; diff/line emphasis reveals which code line matters. No intermediate mismatched state. | Typed React state + Motion `layoutId`/SVG path and `AnimatePresence` only where meaningful | Three scenarios × four stages, rapid switching, keyboard/touch, reduced motion |
| Home `03 / ENGINEERED TO CONNECT` | `.v10-assembly-svg`, `[data-layer]` | **Astra Assembly**: 3 distinct geometric plates interlock in ONE spatial composition; tapping one rises it, neighbours react softly, connection segments draw and detail text updates. Figure is open on ivory, **not a dark-card generic illustration**. | Custom Hairline figure **only after visual/semantic comparison**; otherwise authored SVG + Motion. Official `hairline-adopt` can be trialled from source SVG but **redraws** rather than tracing it. | No semantic inversion of Declare/Compose/Inspect; focusable HTML controls; stable on mobile |
| Home module links | `v10-modules-section` | Quiet connected rule across distinct modules, meaningful focus/hover states, hover/selected states never rely only on color | CSS and pointer events; no forced Hairline | Readable and clickable without hovering |
| Packages Hero + Composer | package plate artwork, package picker | **Build Your Stack**: selected *real* packages become parts of one connected isometric assembly, with a shared selected focus state, animated physical placement, install command synchronized. Do not imply mandatory dependencies where none exist. | Hairline `Rebuild` as study only, custom assembly + Motion layout for actual state | Rapid selection/deselection and keyboard; command exactly matches selection |
| Docs Home + Docs Articles | Search and reference desk | Better search keyboard shortcut, focus-preserving results, originated dialog opening, accessible tab/copy states, non-jarring TOC reading progress; keep article body nearly static | Radix if needed + Motion Primitives inspiration + CSS | Search works, active heading updates, copy feedback, reduced motion |
| Guides | `JourneyRail` | **Learning Runway**: active marker glides along true connector rail, step card reveals only the necessary details, next step is discoverable, no fake mandatory completion | Motion shared indicator or CSS, no default Hairline | Any step selectable by keyboard, deep link valid |
| Changelog | `VersionFolio`, release rows | **Release Spine**: editorial vertical hairline with active marker attached to the *actual selected release*. Expansion pushes adjacent records naturally and preserves scroll position; GitHub/NuGet statuses exact | SVG/CSS + Motion `layout` for disclosure, not fake Hairline graph | All historic entries accessible, status source-qualified |
| Community | `.v10-community-branches` | **Open Source Network**: real links (code/issues/PRs/docs) wired to the central source. Hover/focus lights one complete route and brings that linked label into focus; idle network remains calm. | `Relay`/`Hub` as study, **custom** figure or authored SVG with HTML links | Works via keyboard/touch, all destinations real |
| Footer | logo and navigation | Correct inverse SVG, precise underline/border/copy states, no floating mascot or giant idle movement | CSS | Contrast on deep background; focus visible |

## Hairline: what is real vs what needs bespoke work

**Verified from current official documentation** (2026-11-12 at authoring): `@lucasmarkes/hairline` v0.5.1 has 33 stock figures; React import is `@lucasmarkes/hairline/react`; documented properties include `intensity`, `theme`, `label`, `onRead`, `play`, and div props. It is *not* a scene graph for AstraFlow package dependencies and stock figures cannot be assumed to accept product-specific selected-state props.

### Practical implementation protocol

1. Install only after comparing existing dependencies and verifying the package/peer version. Start with a single `Exploded`, `Stack`, `Relay`, `Hub`, or `Rebuild` **spike** in a feature sandbox and inspect DOM/rendering.
2. Verify rendering matches the AstraFlow palette; map `--hairline-plate` to the exact surface background so masking does not leave white rectangles; use `--hairline-hi`, `--hairline-edge`, `--hairline-mid`, `--hairline-lo`, `--hairline-stroke` deliberately.
3. Keep stock figures where their metaphor and actual behavior fit. For bespoke AstraFlow elements, use `/hairline-create` with an object/gesture/readout brief or `/hairline-adopt public/brand/<approved>.svg` as a **creative recreation exercise**; the latter *does not preserve original SVG paths*. Do **not** use `hairline-adopt` to replace the canonical logo.
4. A custom drawing should reuse Hairline's interaction model/visual grammar while reflecting real UI state; if integration demands forking private internals, prefer custom SVG + Motion rather than coupling the website to unstable implementation details.
5. A Hairline figure is visual; semantic interactions live in actual HTML buttons/links unless the figure explicitly implements accessible focus & keyboard semantics. Ensure touch and keyboard parity.
6. Test `play={false}` as default. Most custom figures should react **on interaction**, not autoplay.
7. Do not put figures in long documentation articles, code blocks, or the primary Hero A artwork just to increase library usage.

Example of a *spike only* (not a replacement for the approved artwork):

```tsx
'use client';
import { Exploded } from '@lucasmarkes/hairline/react';
export function HairlineTrial() {
  return (
    <div className="hairline-trial">
      <Exploded intensity={0.22} play={false} theme="light"
        label="Interactive study of interlocking architectural layers" />
    </div>
  );
}
```

```css
.hairline-trial {
  --hairline-plate: #f7f3eb;
  --hairline-hi: #082c26;
  --hairline-edge: #667c70;
  --hairline-mid: #9eb0a5;
  --hairline-lo: #d3d0c7;
  --hairline-stroke: 0.9;
}
```

**Install optional agent skills only if the agent's tool environment supports them and their source is reviewed:**

```sh
npx skills add lucasmarkes/hairline
npx skills add emilkowalski/skill
```

Hairline offers `hairline-create` and `hairline-adopt`. Emil's current published skill set includes `emil-design-eng`, `review-animations`, `improve-animations` and `animate`. The latter are audits and guided implementation, not substitutes for visual checks.

## Motion system: reusable DESIGN TOKENS, not animation wrappers everywhere

- **Micro feedback:** 120–220ms, usually opacity, color, underline, small translations 1–2px, press scale ~0.98 if needed.
- **UI structure:** 220–380ms, focus/selection, disclosure, active tabs. `ease-out` for entry, appropriate gentle spring for spatial rearrangement.
- **Signature state change:** 350–550ms, moving node/layer/shared marker that teaches product behavior. Interruptible immediately; no stacked animation queues.
- **Ambient:** Only the existing home trace signal (long, controlled loop). Avoid repeated hover bounce and infinite pulses.
- **Scroll:** native document scroll and normal anchors. A single hairline progression indicator may tell where the reader is, but no custom scroll hijack; viewport entry effects only where they add explanatory order.
- **Prefer GPU-friendly `transform` and `opacity`;** do not repaint large blurred SVG masks or update dozens of components each scroll frame.
- **Reduced motion:** no essential meaning lost; state changes are instant or minimal opacity. Stop the Hero signal. No auto-playing tours in this mode.
- **Avoid hydration/CLS problems:** SSR important content, stable element dimensions before JavaScript, reduced-client-islands and lazy load interactive scenes below the fold.

## Three signature demonstrations to earn approval

### Demo A — Flow Path (Home)

Start on Request dispatch at stage 1. Press Next three times. A single position indicator tracks the rail from node to node; each stop updates the exact relevant C# snippet, active node, decision explanation and stage counter in one stable transition. Switch to Mapping mid-animation: the in-flight animation must be interrupted cleanly, the new scenario starts at stage 1, and no code from the old scenario flashes. Repeat with `prefers-reduced-motion` and with Tab/Enter keys.

### Demo B — Build Your Stack (Packages)

Start with a minimal selected package. Add Mapper and Diagnostics in an accessible package picker. Their plates are inserted into the **same visually coherent assembly** rather than appearing in generic isolated cards; one shared focal state and rule/connector follows the current selection. The install command updates immediately and accurately. Remove a package while transition is in flight: order remains meaningful, command correct, no z-index or overlap glitches.

### Demo C — Open Source Paths (Community)

Focus Source using Tab, then move to Issues or Pull Requests. The corresponding branch line is traced, the matching destination is visually highlighted, and a descriptive accessible link remains clickable. At rest nothing moves. Touch does not require hover and links never become inaccessible behind SVG.

## Reference inspiration — study interactions, never copy branding

- Hairline: https://hairline.lucasmarkes.com/figures (coherent pointer-responsive isometric grammar).
- Hairline agent skills: https://hairline.lucasmarkes.com/skills (create/adopt interactive figures, with explicit redraw limitation).
- Motion layout: https://motion.dev/docs/react-layout-animations (shared position/size, scoped layout and interruptibility).
- Motion Primitives: https://motion-primitives.com/docs/animated-background (active selection that migrates).
- Emil Kowalski: https://emilkowal.ski/ui/great-animations (natural, purposeful, fast and interruptible).
- Rauno's Craft: https://rauno.me/craft (many small, refined interaction studies, emphasis on restraint).
- Archify: https://archify.si/ (meaningful connected graph exploration).
- Understand Anything: https://understand-anything.com/ (link data, progressive drill-down, readable explorable flow).
- Taste Skill: https://www.tasteskill.dev/docs (source- and screenshot-based design checks; don't blindly apply all marketing heuristics to documentation pages).

## Verification requirements

### Phase 0 — audit of the *actual* Next.js code (mandatory)

List current dynamic components, all Hairline imports actually used, all Motion imports actually used, what has only generic CSS animation, current performance limitations. Record before screenshots/video for desktop and mobile. The v12 reference cannot prove what the agent already implemented.

### Phase 1 — signature slices

Implement Flow Explorer + Packages Assembly + Community Network and have each pass the Demo A/B/C above. No more screenshot-only work counted as feature completion.

### Phase 2 — supporting craftsmanship

Guides journey, Changelog timeline, Docs search and copy feedback, navigation focus/hover and scroll polish, section transitions and optical spacing. Do not alter the homepage visual identity.

### Phase 3 — QA and performance

- Build/test the **production Next.js app**, not only `next dev`.
- Playwright at **320, 390, 768, 1024, 1440, 1920px** for all six primary routes, 200% zoom, dark-background logo, long article and current release.
- Capture **before/after** screenshots and short **video clips** for three signature demos and 2 meaningful hover/focus interactions.
- Test rapid click cancellation, keyboard, touch, reduced motion, tab visibility, offscreen animation pauses, high zoom and 404/refresh.
- No console or hydration errors, clipped text, hidden controls, horizontal overflow, unreadable dim states, unintended scroll jumps, broken links, package mismatches or fake measured outcomes.
- Record a Lighthouse (mobile/desktop) and axe accessibility audit with concrete issues, not just scores. Targets: **WCAG 2.2 AA-oriented**, and pursue good real-user Core Web Vitals: **LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 at p75**, which cannot be *certified* using local lab runs alone.
- A quiet, low-motion version must still look premium; effects should explain decisions or relationships rather than conceal weak composition.

### Required output from the agent

1. Component inventory with before/after implementation changes, dependencies and rationale.
2. Actual implemented Hairline or custom figure file paths and videos, not a list of installed packages.
3. Motion token map + component-specific behavior + keyboard equivalents.
4. Before/after side-by-side screenshots: first fold, full page and each key component; same viewport and content.
5. Videos of A/B/C demonstrations.
6. Tests: commands, outputs, responsive and accessibility results, known limitations.
7. Readable PR/diff on an isolated branch, no production deployment without approval.

**Release gate:** If the agent can show only a screenshot that looks like the original v12 with new fade/hover animations, the craft pass is NOT done.
