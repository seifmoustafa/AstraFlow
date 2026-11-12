# 02 — APPROVED SCENE REDESIGN / BEHAVIOR CONTRACT

The **reference v12 supplies the baseline shell**; the new creative images supply *direction inside scenes*. Build responsive, semantic, interactive React components, not image crops. Original user intent: beautiful carefully connected physical components; purposeful motion, not background theater.

## 1. Home Hero: Signal Architecture (PROTECTED BASELINE)

Keep v12 composition and canonical A geometry. It must be readable without JS. Only the orange tracer progresses through the existing path, with Pause/Resume, page visibility, reduced-motion behavior; carefully refine timing, motion blur if performant and focus. No parallax/tilt of hero or heading.

## 2. Home Follow the Engine: Living Flow Atlas (REBUILD INTERNAL SCENE)

Replace the existing boxed THREE-column dashboard as the *primary creative scene*. Retain an accessible code viewer and scenario navigation, but create an open coherent engineering path that visually moves through request/pipeline/handler/result; avoid repeating three black cards. One discriminated typed state controls scenario, stage, geometry, signal progress, annotation, code example, focused code lines and progress count. Arrow-key accessible stages, clickable nodes, touch-friendly targets, rapid-switch interruption, no stale states. Label accurately as a guided illustration; no fake runtime telemetry. Visual source: `visual-inspiration/08-home-flow-atlas-detail.png`.

## 3. Home Architecture: Exploded Instrument

Build 3 meaningful layers representing declared intent / composed behavior / inspectable evidence (not a false runtime dependency DAG). When chosen, the layer lifts, connectors/annotation react, related detail updates and other layers settle. Accessible buttons + SVG graphics as presentation, not unclickable canvas-only interactions. Hairline custom authoring as a *prototype tool* is possible; integrate as React.

## 4. Packages Hero: Module Loom

Replace old three rotated plate illustrations, while preserving approved ivory page shell, original title typography hierarchy and CTAs. Instead, draw a visually distinct module geometry that appears docked/interconnected. Interaction should inspect capabilities and optionally dock components with actual semantic controls; module placements don't imply hard package dependencies. No cyan, no dark page hero. Visual source: `02-packages-module-loom.png`.

## 5. Packages Composer: Living Stack

Replace checkbox+terminal layout with a coherent assembly, but maintain true control list and readable `dotnet add package` output in HTML. Selecting package adds/removes a part in the connected figure, adjusts count, description and command list synchronously. Verify NuGet IDs and versions. Clean disabled/empty/busy states. Keyboard and pointer parity. UI must not overlap at 320/390.

## 6. Docs: Living Reference Desk

Keep ivory Hero, clean global typography/nav, and real docs reading experience. Upgrade generic topic tiles into a search-led inspector with keyboard navigation, grouped real search results, meaningful content preview and deep links. Search indexes actual repository docs. Document TOC, anchors, permalink, code highlighting/copy, next/previous, breadcrumbs, source link. Do not make reading dependent on motion.

## 7. Guides: Kinetic Learning Runway

Keep ivory hero and readable heading. Build a progression track with an orange path that advances with selected milestone and reveals real content. Do not convert entire page to dark, don't use giant full-screen cards for phone, and don't make user scroll through animations to access content. Present easy link to guide.

## 8. Changelog: Living Edition

Preserve approved ivory page/typographic shell but replace the old rotated decorative cards. Implement an editorial release spine + selected release folio: a real accessible selector updates verified version content. Status distinction is mandatory: published NuGet / GitHub release / merged source / WIP. Full available history, not only three flashy releases. No invented release metadata, screenshots, or benchmarks. Strong readability and responsive fallback.

## 9. Community: Contribution Current

Preserve ivory hero and real community routes. Replace simple four small boxes around logo with engaging connected contribution pathways that respond to hover, focus, click/tap, each real link. Do not invent Discord/forums/community stats. Motion highlights real relationship and stops when idle.

## 10. Supporting micro-interactions

Navbar active route; restrained hover/focus with signal orange; selection indicator travels between elements without layout shift; copy success toast/announcement; accordions/disclosures; Docs search command shortcut only if reliable; button press feedback; journey/code line emphasis. Use elegant scroll-triggered *reveal of structure* where supported but never hide information or hijack the browser scroll. Animate SVG/path, opacity/transform only where practical; no global canvas overlay.

## Hairline technical reality

- `@lucasmarkes/hairline/react` renders **existing** Hairline SVG figures. Reuse a stock figure only if it truly matches. Verify its actual API at build time.
- Hairline's `hairline-create` skill currently produces a standalone HTML demo with intensity/theme controls. This is **NOT** a usable React component by itself, and its demo's theme switch must NOT appear on AstraFlow.
- For original figures: author a custom SVG and keyboard-accessible React controls, optionally use Hairline concepts/integration, connect to typed state and verify browser behavior. No stock demo as a placeholder.
- Motion for React is appropriate for state-driven layout/selection transitions. Keep components isolated and avoid loading animation libraries on docs articles that don't need them.

## Motion signature / acceptance

- Three visual signatures: smooth orange A signal; purpose-built request-flow progression; connected assembly/docking.
- User intent drives major scene changes. Ambient motion is sparse and optional. No constant generic scroll-magic on every section.
- All motion is cancelable/interruptible, and visually stable when rapidly re-selecting or navigating away. `prefers-reduced-motion` uses useful instantaneous state, not hidden UI.
- Scene height can be tuned inside its bounds; surrounding container, page background, navbar, typography system and footer remain baseline locked.
