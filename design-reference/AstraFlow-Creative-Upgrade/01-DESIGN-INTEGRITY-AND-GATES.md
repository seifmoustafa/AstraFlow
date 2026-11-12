# 01 — DESIGN INTEGRITY, CREATIVE BOUNDARIES & RELEASE GATES

> **MANDATORY. This is the highest-priority implementation contract for the AstraFlow Creative Upgrade.** Read this BEFORE `00-UNIFIED-AGENT-PROMPT.md`. It deliberately removes ambiguity from earlier instructions. This document wins when a creative-rebuild instruction conflicts with a stability / brand rule.

## What the user is actually approving

The current website's **brand direction and website shell** are approved. The **eleven scene implementations** identified in `SCENE-REPLACEMENT-MAP.md` are not approved; they are placeholders. Your job is to creatively rebuild these scenes, **not** redesign or damage the surrounding website.

**Two distinct kinds of fidelity:**

1. **STRICT FIDELITY — everything outside the 11-scene scope:** preserve visual language, navigation, type system, brand geometry, background/surface rules, spacing rhythm, footer, content, URLs and functionality. No unrelated redesigns.
2. **CREATIVE FREEDOM — inside those 11 scenes:** radically rebuild component composition, geometry, transitions and interactive behavior while staying inside the AstraFlow brand. The scene's content and meaning remain accurate. You may adjust the scene's internal layout and its own height to make a coherent experience; do not break shared containers or surrounding sections.

Never interpret "radical" as permission to replace the global design system, navigation, page IA or the entire Home hero. Never interpret "preserve the website" as a reason to keep the placeholder components.

## 🔒 Locked foundations — do not modify without documenting necessity

- Canonical AstraFlow **master SVG path geometry** and correct light/dark logo variants. No AI-generated logos, SVG approximations or CSS filters for brand colors.
- Palette and SEMANTIC color roles: Warm Ivory base, Deep Forest identity/dark reading surfaces, Signal Orange action/status/signal. The 60/30/10 principle is a **hierarchy heuristic**, not an invitation to cover scenes with orange glow.
- Approved global typography families and character, font loading strategy, navigation/footer, spacing rhythm, content widths, responsive breakpoints unless a demonstrable bug requires change.
- Existing working Next.js routes, public URLs, canonical metadata, sitemap, SEO content, verified packages, documentation, release status, content source mapping, keyboard features.
- English LTR and currently active theme; future i18n / RTL / theme scaffolding, **without switches**.
- Established Home hero composition: stationary headline and canonical A, moving orange signal only. Enhance line precision, controls and context, **not the hero's fundamental spatial structure**.
- Existing source-backed facts. Image-generation mockups contain incorrect text and logos; do not copy their content or use them as backgrounds.

Changes outside this boundary require a recorded reason, before/after evidence and explicit user review. Do not silently alter global layout, body font, brand colors, navbar or page order.

## 🎯 What must change radically (ONLY the mapped scenes)

Use the 11 entries in `SCENE-REPLACEMENT-MAP.md` as the list of REQUIRED replacements. Major creative freedom applies to their **scene internals**, including their bespoke illustration, micro-layout, controls, physical arrangement, information reveal and interactions. Do **not** import speculative UI/text/functions from the generated images.

All replacements must:

- Be visibly different from the placeholder even in a **still frame**.
- Do real user-driven work: action → connected geometric state change → accurate related content/state change.
- Be native, accessible React/HTML/SVG/optionally Hairline, not flattened mockup images or generic demo embeds.
- Retain the surrounding design language: fine rules, editorial type, warm/dark contrast, disciplined depth and purposeful orange accents.
- Have useful **static and reduced-motion states** and keyboard/touch parity.
- Avoid global animations, scroll hijacking, forced camera movement, canvas-only controls or motion on every element.

For Home `FOLLOW THE ENGINE` and Changelog, preserving a dashboard/card silhouette is not acceptable. For Packages hero, old rotated plates must be removed. For Community, old boxed logo network must be removed. The user should see new *art direction inside the scene*, not a recolored old scene.

## Mandatory staged delivery — NO big-bang changes

### Gate 0 — Audit + baseline (before editing)

- Work on a feature branch; record the starting commit; ensure no uncommitted work is lost.
- Discover actual file paths and routing. Identify all 11 replaceable component boundaries.
- Record baseline **full-page** and section screenshots for ALL six primary routes at **1440px desktop and 390px mobile** (same browser/font/assets across comparisons). Record a short baseline interaction capture where applicable.
- Run existing checks and note any PRE-EXISTING failures. Capture current implementation's runtime/performance/a11y baselines with reproducible commands.
- Give a scope table: **LOCKED / REPLACE / ADJUST CAREFULLY** per page. No new system-wide design system.

### Gate 1 — CREATIVE PILOT: Packages Hero only

Rebuild `/packages` hero from the temporary rotated cards into a **new original Module Loom** integrated into real controls. This is the first calibration test of your creative direction, *not* a project completion. Verify it in the real Next.js route, with mouse, keyboard, touch and reduced-motion states.

**Show an identical-viewport BEFORE / AFTER and a real 8–15-second browser recording** where user action visibly restructures/docks/undocks the component. Demonstrate the new scene is not the old one with more hover effects.

Then **STOP after this gate for user creative sign-off**; do not rewrite the other ten scenes until the visual direction is accepted. Keep it on the branch, not deployed or merged. This is intentional risk control, not permission to stop at a plan.

### Gate 2 — High-value interactive system

After Gate 1 approval, implement Packages Composer and Home Living Flow Atlas. Validate real selection → shape → details/install command/code linkage and rapid state changes. Present captures and tests. Home hero remains protected.

### Gate 3 — Editorial experiences

Implement Changelog Living Edition and Docs Reference Desk. Test accurate release status and searchable/readable documentation; avoid faux telemetry and fabricated content.

### Gate 4 — Remaining bespoke scenes

Implement Home Exploded Architecture, Guides Runway/Journey Chapters, Community Hero/Pathways and the minimal allowed Home Hero finishing. Run global QA, collect recordings per experience, and keep changes outside mapped areas to bug fixes only.

### Gate 5 — Release readiness

Run production build, TS/lint/tests, Playwright smoke/interaction, accessibility and motion tests, metadata SEO checks, responsive/no-overflow and budget analysis. Produce a blockers table. **Do not merge or deploy without approval.**

## Acceptance and regression rules

**Functional:** all existing routes, important links, docs search, code copy, package command generation, keyboard shortcuts, focus, nav, mobile menu, content and SEO still work. No hydration errors, console exceptions or stale state after rapid interactions.

**Visual:** compare unchanged regions to baseline for unexpected shifts, typography regressions, color/contrast changes, cropping and overlap. Changed scene may differ completely, but it must maintain page-level optical balance and mobile readability. Inspect FULL pages; avoid optimizing only a hero screenshot.

**Motion:** mouse/keyboard/touch and `prefers-reduced-motion`; meaningful animation is interruptible, settles, can be paused where applicable, works after browser tab visibility changes and does not shift surrounding layout. No constant visual noise.

**Performance:** collect before/after route-level measurements from comparable production builds. Document any measurable regression and correct serious regressions. Avoid replacing ordinary content with huge client-side animation bundles or main-thread work.

**Evidence:** each gate must include code paths, screenshot pair, interaction recording, tests, actual Hairline integration/custom source OR a justified authored SVG+Motion alternative, and unclosed issues. "Installed library" is not a result.

**If a new composition threatens the shared design system:** keep the proposed change isolated in the scene, provide two minimally different scene variants, and request targeted review rather than silently refactoring global tokens or navigation.

## Completion principle

Completion is when the **new component is visibly original, meaningfully interactive, consistent with the preserved brand, accessible and tested** — not when a dependency is installed, an animation runs, or every page has been changed. Quality cannot be guaranteed by this prompt; it must be demonstrated and accepted at each gate.
