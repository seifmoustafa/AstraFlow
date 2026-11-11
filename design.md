# AstraFlow — Brand & Design System

> **Design-system specification · Version 0.2 · 2026-11-11**  
> **Direction:** The Trace / **Engineered Clarity**  
> **Status:** Locked Reference Baseline (v0.2). Incorporates approved visual reference lock (`approved-reference.jpg`), canonical 3-path SVG mark (`logo-mark-color.svg`), and 6-pillar Next.js 16 Portal architecture (`portal/`).  
> **Applies to:** AstraFlow's public identity, Next.js 16 Portal & Docs Platform (`portal/`), GitHub/NuGet assets, documentation, release communications, and related founder communications.

---

## 0. Purpose, scope, and source of truth

This document defines **one coherent design language**, not three loosely related visual styles. It is intended to be usable by a designer, an engineer, or an AI-assisted production workflow without allowing arbitrary aesthetic decisions on every asset.

It has two layers:

1. **Brand identity — immediate scope:** positioning, mark, wordmark, colors, typography, graphics, image direction, layout, copy, and export rules.
2. **Product UI & Portal foundations — active scope:** semantic tokens, typography, accessibility, responsive layout, multi-language (`en` LTR + `ar` RTL), dual theme (`dark` default + `light`), interactive showcases, and code presentation for the AstraFlow Next.js 16 Portal (`portal/`).

**Source hierarchy:**

1. Product facts and release states: `README.md`, `CHANGELOG.md`, `docs/roadmap.md`, `docs/strategy/north-star.md`, and `docs/strategy/decision-log.md`.
2. Approved design decisions, `approved-reference.jpg`, and canonical vector mark `logo-mark-color.svg`.
3. This document (v0.2) for brand rules, portal architecture, and implementation defaults.
4. Generated concept images as **visual exploration only**, never overriding `logo-mark-color.svg` or technical product truth.
5. Existing `docs/branding.md` and `assets/branding/astraflow-icon.png` describe the **legacy** package icon until NuGet icon replacement is separately executed.

If this design spec conflicts with a product claim in the technical documentation, **the technical documentation wins**. Do not infer shipped behavior from an aspirational design.

### Decision register

| Decision | Status | Notes |
| --- | --- | --- |
| Core brand concept: **Engineered Clarity** | Locked (v0.2) | Expresses explicitness, predictability, and inspectability. |
| Main visual identity: **The Trace** | Locked (v0.2) | Geometric, deliberate, strongly typographic; no gratuitous sci-fi. |
| Tone: technical, confident, understated | Baseline | Evidence is more important than superlatives. |
| Dark-first expression (`#0C1420`); equally usable light mode (`#F7F7F3`) | Locked (v0.2) | Product interfaces must remain legible and WCAG 2.2 AA compliant in both modes. |
| Instrument Sans + IBM Plex Mono + IBM Plex Sans Arabic | Locked (v0.2) | Primary UI/headings, code/telemetry, and full RTL Arabic support (`dir="rtl"`). |
| Primary geometric **A / Trace** mark (`logo-mark-color.svg`) | **Locked (v0.2)** | Canonical 3-path SVG (`viewBox="0 0 270 215"`): Mineral apex, Ion Cyan flow ribbon, Warm Copper terminal. |
| Exact palette and layout tokens below | **Locked v0.2 tokens** | Enforced across `portal/src/app/globals.css` and all UI components. |
| 6-Pillar Next.js 16 Portal (`portal/`) | **Active (v0.2)** | `/` Overview, `/docs` Docs, `/architecture` Archify Hub, `/explore` Knowledge Graph, `/changelog` Living Changelog, `/community` Community. |
| Editorial Monolith and Celestial Instrument | Supporting exploration | Do **not** merge serif, measuring arcs, metal textures, and orbit motifs into the master identity. |

---

## 1. Brand strategy

### 1.1 Brand idea

**AstraFlow makes application flow explicit, predictable, and inspectable.**

AstraFlow is a **modular family of .NET packages** for request dispatch, mapping, diagnostics, generators, and testing. It does not prescribe an application architecture and does not require unrelated optional integrations in its core packages.

**Core proposition:** `Declare intent. Execute predictably. Inspect with confidence.`

**Short expression:** `Engineered Clarity.`

`Engineered Clarity` is a **brand expression**, not a benchmark, warranty, or completed product claim.

### 1.2 Audience

- Primary: experienced .NET developers and maintainers choosing reliable application infrastructure.
- Secondary: tech leads, architects, open-source contributors, and teams reviewing upgrades and security posture.
- Tertiary: developers encountering the package via GitHub, NuGet, conference slides, or release posts.

The brand must communicate quality **before** a reader studies documentation, while the documentation must justify confidence **after** the first impression.

### 1.3 Brand attributes

| Attribute | What it means visually | What it is **not** |
| --- | --- | --- |
| **Precise** | Consistent geometry, measured alignment, deliberate spacing. | Busy pseudo-engineering decoration. |
| **Inspectable** | Visible structure, annotated relationships, traceable diagrams. | Secretive black-box or unreadable effects. |
| **Dependable** | Stable shapes, strong contrast, restrained visual hierarchy. | Flashiness mistaken for maturity. |
| **Composable** | Reusable graphic grammar; modular presentation. | An inflexible all-in-one corporate template. |
| **Modern** | Distinctive type, confident whitespace, clean digital materials. | Trend-chasing neon, glassmorphism, or crypto aesthetics. |

### 1.4 Brand personality

**Calm authority** rather than loud disruption. **Technical sophistication** rather than decorative futurism. **Engineering honesty** rather than exaggerated marketing.

**Preferred language:** explicit, typed, inspectable, composable, optional, measured, predictable, diagnostic, verifiable.  
**Avoid by default:** magic, ultimate, revolutionary, zero-cost, fastest, enterprise-grade, AI-powered, fully secure, 100% AOT compatible — unless an exact, properly scoped claim is independently supported.

### 1.5 Product truth and roadmap boundaries

At the time of this specification, the maintainer reports **2.3.0** as published. **2.4.0** is in development and unpublished; it includes an assertions foundation and an in-progress / release-verification generated-mapping expansion. **Generated mediator dispatch** and **explainable flow intelligence** remain separate roadmap candidates, not shipped capabilities.

Brand materials may **suggest** precision and future potential. They must not present roadmap candidates as available products. Always verify version, package and support claims against the canonical technical sources **at publication time**.

---

## 2. Art direction: The Trace

### 2.1 The master expression

A distinctive **geometric A** intersects with a purposeful **flow trace**. The mark captures intention becoming a readable route; the surrounding graphics show the system's order and inspectability.

**Composition formula:**

`Confident typographic anchor + strong geometric symbol + one meaningful trace + generous negative space.`

The logo is the visual anchor. The flow trace is the **system's secondary graphic device**, not something to force into every layout.

### 2.2 Hierarchy of influences

1. **The Trace — 80%:** structural, crisp, minimal, technical.
2. **Editorial discipline — 15%:** typographic contrast, framing, confident composition. *Not a second serif-based brand.*
3. **Celestial instrumentation — 5% maximum:** optional precision textures for a special campaign. *Never necessary for identity recognition.*

These percentages are **art-direction guidance**, not literal asset measurements.

### 2.3 Anti-patterns

Do not use: glowing stars, default orbit logos, generic infinity symbols, endless blue-purple gradients, random network nodes, decorative circuit boards, 3D glass marks, metallic pseudo-luxury, unearned golden-ratio overlays, illegible micro-copy, or AI-generated text embedded in final deliverables.

An asset that looks impressive only because of bloom, reflections, or background effects **has failed** the identity test.

### 2.4 Reference Lock (`approved-reference.jpg` & `logo-mark-color.svg`)

The visual direction and canonical mark geometry are **locked** against `approved-reference.jpg` and the master vector file `logo-mark-color.svg` at the repository root:

1. **Canonical SVG Geometry (`logo-mark-color.svg`):**
   - Exact dimensions and viewBox: `width="270" height="215" viewBox="0 0 270 215"`.
   - **Path 1 — Mineral White Apex (`url(#mineral)` / `#F2F1EC`):**
     `d="M129 7 H173 L222 87 H181 L152 40 L98 129 C92 139 87 143 77 143 H44 Z"`
   - **Path 2 — Ion Cyan Flow Trace (`url(#flow)` / `#72D5DE` on dark, `#0F6875` on light):**
     `d="M30 166 H91 C104 166 111 160 119 148 L137 116 C147 102 157 98 169 98 H230 L249 128 H177 C165 128 160 134 154 144 L132 180 C119 196 107 200 89 200 H10 Z"`
   - **Path 3 — Warm Copper Terminal Accent (`url(#metal)` / `#D9A477` on dark, `#9A601B` on light):**
     `d="M199 145 H237 L259 182 H220 Z"`
2. **Hero & Lockup Composition (`approved-reference.jpg`):**
   - Three-piece asymmetric `A / Trace` mark paired with `AstraFlow` wordmark (`Instrument Sans` 600–700) and `ENGINEERED CLARITY` mono overline/subtitle.
   - Right-aligned or balanced editorial statement: `"A .NET INFRASTRUCTURE FOR EXPLICIT, PREDICTABLE, AND INSPECTABLE FLOWS."`
   - Dual thin Flow Trace SVG path with Ion Cyan (`#72D5DE`) and Warm Copper (`#D9A477`) micro-node (`< 5%` visible area).
   - Primary CTA buttons strictly use `Midnight Ink #0C1420` text on `Ion Cyan #72D5DE` surface in Dark mode (10.81:1 contrast) — never white text on cyan.
3. **Strict Product Truth Lock:**
   - **v2.3.0** is the latest **published** stable release (`dotnet add package AstraFlow --version 2.3.0`).
   - **v2.4.0** is **unreleased / in development** (previewing `AstraFlow.Assertions` and expanded executable generated mapping). Never claim v2.4.0 is already published on NuGet.
   - **v2.5.0** (*Explainable Flow Intelligence*) and *Generated Mediator Dispatch* are **candidate / roadmap** items, never presented as shipped features.

---

## 3. Identity system: symbol, wordmark, lockups

### 3.1 Mark concept — `A / Trace`

**Design brief for the final vector artist:**

- Begin with a recognizably **A-derived silhouette** that does not look like a stock font glyph.
- Integrate **one intentional traversing trace** that creates or interacts with the crossbar/negative space; the trace must read as a designed path, **not** a swoosh pasted on top.
- Prefer **one dominant structural form plus one trace**, not layered ornaments.
- Use square or intentionally chamfered terminals consistently; avoid unrelated rounded and razor-sharp detailing in the same mark.
- Ensure strong visual balance without perfect symmetry if asymmetry helps communicate direction.
- All essential geometry must work **in one color**; cyan is an accent, not a structural crutch.
- Copper is **not required** inside the master mark and should generally be absent from small versions.
- Construction guides are allowed in design exploration; do not present a decorative measurement grid as proof of mathematical construction.

**Do not infer exact Bézier curves, ratios, or ownership from generated concept images.** The final path geometry must be redrawn and independently reviewed as vector artwork.

### 3.2 Geometry and spacing contract

Use the final symbol height as `H` and its width as `W`.

| Rule | Starting constraint |
| --- | --- |
| Artwork frame | Square, optically centered; protect negative space. |
| Clear space | Minimum `0.25H` on all sides of the symbol or full lockup. |
| Symbol-to-wordmark gap | Begin at `0.30H`; adjust optically, document the final value. |
| Internal strokes | No essential hairlines; evaluate at 16, 24, 32, 64 and 128 px. |
| Construction | Reuse intentional angles/curvature; minimize control points. |
| Optical correction | Allowed when visual balance requires it; record deviations from grid. |

**Acceptance:** a recognizable silhouette when blurred, a balanced inverse mark, no stuck/merged paths at 16 px, and no dependence on shadows or outlines to separate elements.

### 3.3 Wordmark

**Text:** `AstraFlow` — exactly that capitalization. Do not change it to `ASTRA FLOW`, `Astra Flow`, or `ASTRAFLOW` as the principal wordmark.

- Starting family: **Instrument Sans**, 600–700 weight; custom optical kerning and potentially subtle custom letter treatments.
- Maintain a clear distinction between `Astra` and `Flow` **through letterforms and rhythm**, not mandatory color splitting.
- No decorative sci-fi cuts unless they demonstrably increase distinctiveness and legibility.
- Avoid extreme tracking; the name should remain readable at smaller widths.
- Deliver the finalized wordmark as **outlined vector paths**, plus an editable master with font/source metadata.

### 3.4 Required logo family

| Asset | Description | Color variants |
| --- | --- | --- |
| `primary-horizontal` | Symbol left, wordmark right | Dark, light, 1-color |
| `primary-stacked` | Symbol above wordmark | Dark, light, 1-color |
| `symbol` | Standalone, no text | Dark, light, 1-color |
| `wordmark` | Standalone lettering | Dark, light, 1-color |
| `micro-symbol` | Simplified for thumbnails | Dark, light, 1-color |

A **micro-symbol is allowed to differ** from the full mark when fine trace details fail at 16–32 px, but it must preserve the silhouette.

### 3.5 Sizing and protective use

- **Micro use:** 16–24 px, simplified single-color icon; verify pixel grid manually.
- **Standard avatar/package icon:** 32–128 px, simplified symbol with generous internal margins.
- **Full symbol:** 48 px and larger; use accent only if it remains clear.
- **Full horizontal lockup:** do not set a universal minimum width until the vector is complete; test on real navigation and README contexts.
- Never stretch, skew, rotate, add outer glows, recolor ad hoc, crop essential geometry, or place the logo over detailed imagery without sufficient contrast.
- Never treat the generated concept renders as final source artwork.

### 3.6 Trademark / distinctiveness review

Before replacing a public logo: run visual similarity checks against adjacent developer tooling, test common favicon/app-icon contexts, inspect optical balance with independent reviewers, and decide whether trademark clearance is necessary for intended markets. **Concept approval is not legal clearance.**

---

## 4. Color system

### 4.1 Foundation palette — v0.1

| Token | Hex | Role |
| --- | --- | --- |
| `ink.950` | `#0C1420` | Signature dark canvas and strongest ink. |
| `slate.900` | `#172231` | Raised dark surfaces. |
| `mineral.50` | `#F2F1EC` | Signature near-white text/surfaces. |
| `ion.400` | `#72D5DE` | Brand signal, line emphasis, focus on dark. |
| `copper.400` | `#D9A477` | Rare editorial accent, never the main CTA color. |

This is an identity with **strong neutrals and one primary accent**. Copper should normally occupy **less than ~5% of visible color area** in a branded composition; it is not a mandatory ingredient.

### 4.2 Supporting functional colors

| Token | Hex | Use |
| --- | --- | --- |
| `dark.text.muted` | `#A5B4C4` | Muted body text on `ink.950` / `slate.900`. |
| `dark.text.subtle` | `#8899AD` | Secondary text on `slate.900` (still readable). |
| `dark.border` | `#405267` | Dark UI separators, not primary text. |
| `dark.success` | `#89CBA4` | Success labels and indicators. |
| `dark.warning` | `#F0C57C` | Warnings and caveats. |
| `dark.danger` | `#F39A98` | Errors and destructive notices. |
| `light.canvas` | `#F7F7F3` | Light UI canvas. |
| `light.surface` | `#FFFFFF` | Cards, dialogs, controls. |
| `light.text` | `#243342` | Primary light-mode text. |
| `light.text.muted` | `#4D6072` | Light-mode secondary text. |
| `light.border` | `#B8C6D0` | Visible dividers; not a substitute for focus. |
| `light.accent.text` | `#0F6875` | Accessible cyan-family text and links in light mode. |
| `light.danger.text` | `#A9463C` | Error text on light surfaces. |
| `light.warning.text` | `#9A601B` | Warning text on light surfaces. |

Functional colors must be accompanied by text, labels, icons or other non-color cues. No status is conveyed by color alone.

### 4.3 Semantic tokens (implementation-facing)

**Dark mode — canonical brand mode:**

| Semantic token | Maps to |
| --- | --- |
| `--af-bg-canvas` | `#0C1420` |
| `--af-bg-surface` | `#172231` |
| `--af-text-primary` | `#F2F1EC` |
| `--af-text-secondary` | `#A5B4C4` |
| `--af-border` | `#405267` |
| `--af-accent` | `#72D5DE` |
| `--af-accent-on` | `#0C1420` |
| `--af-link` | `#72D5DE` |
| `--af-focus` | `#72D5DE` |

**Light mode — accessibility-first counterpart:**

| Semantic token | Maps to |
| --- | --- |
| `--af-bg-canvas` | `#F7F7F3` |
| `--af-bg-surface` | `#FFFFFF` |
| `--af-text-primary` | `#243342` |
| `--af-text-secondary` | `#4D6072` |
| `--af-border` | `#B8C6D0` |
| `--af-accent` | `#0F6875` for text/solid UI controls |
| `--af-accent-on` | `#FFFFFF` for dark-teal solid controls |
| `--af-link` | `#0F6875` |
| `--af-focus` | `#0F6875` |

**Important:** brand cyan `#72D5DE` is **not** suitable as small text on white/light surfaces. On light backgrounds, use the darker semantic teal token for text and accessible interactions; reserve cyan for appropriate illustration and non-text decoration.

### 4.4 Contrast checks (computed for these solid color pairs)

| Foreground / background | Approx. contrast | Use |
| --- | ---: | --- |
| Mineral White / Midnight Ink | **16.34:1** | Body text: passes AA. |
| Mineral White / Carbon Surface | **14.18:1** | Body text: passes AA. |
| Ion Cyan / Midnight Ink | **10.81:1** | Text and accents: passes AA. |
| Ion Cyan / Carbon Surface | **9.38:1** | Text and accents: passes AA. |
| Warm Copper / Midnight Ink | **8.38:1** | Small text in principle; use sparingly. |
| Muted text `#A5B4C4` / Carbon Surface | **7.58:1** | Body text: passes AA. |
| Primary light text / Light canvas | **12.02:1** | Body text: passes AA. |
| Secondary light text / Light canvas | **6.05:1** | Body text: passes AA. |
| Light accent text `#0F6875` / Light canvas | **6.00:1** | Light-mode links/body: passes AA. |
| **Ion Cyan / White** | **1.51:1** | **Fail:** never use as small foreground text. |
| Midnight Ink / Ion Cyan | **10.81:1** | Dark label on cyan button: passes AA. |

Ratios assume opaque, flat colors and standard WCAG relative luminance. **Recheck** when opacity, overlays, gradients, disabled states, anti-aliasing, images or changed surfaces are involved. For accessible user-facing products, target **WCAG 2.2 AA**: 4.5:1 normal text; 3:1 large text and relevant non-text interface boundaries. See [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### 4.5 Color discipline

- Prefer **solid surfaces** over gradients; if a gradient is used, it must be subtle, locally purposeful, and not carry text contrast requirements.
- No default neon, bloom, or colored drop shadows.
- Never put Mineral White text on Ion Cyan buttons. Use Midnight Ink instead.
- Dark mode is **brand-preferred**, not an excuse to ship an unreadable light mode.
- Avoid using copper for semantic `warning`; visually distinguish brand accent from application status.

---

## 5. Typography

### 5.1 Families

| Context | Typeface | Fallbacks |
| --- | --- | --- |
| Wordmark direction, UI, headings, editorial body | **Instrument Sans** | `Inter`, `Arial`, sans-serif |
| Code, commands, badges, small technical labels, diagram metadata | **IBM Plex Mono** | `SFMono-Regular`, `Consolas`, monospace |
| Optional Arabic-language materials | **IBM Plex Sans Arabic** | `Noto Sans Arabic`, system sans-serif |

Instrument Sans and IBM Plex are distributed under **SIL Open Font License 1.1**; retain upstream license/notice files in any font distribution. Only bundle font subsets actually used. Confirm Arabic glyph and mixed-direction handling on final surfaces instead of assuming the Latin font covers all needs.

### 5.2 Type roles and initial scale

| Role | Desktop starting style | Mobile starting style |
| --- | --- | --- |
| Hero display | 64 px / 1.04 / 650 | 40 px / 1.09 / 650 |
| H1 | 48 px / 1.12 / 650 | 34 px / 1.14 / 650 |
| H2 | 36 px / 1.18 / 600 | 28 px / 1.20 / 600 |
| H3 | 26 px / 1.24 / 600 | 22 px / 1.27 / 600 |
| Body large | 18 px / 1.58 / 400 | 17 px / 1.55 / 400 |
| Body default | 16 px / 1.60 / 400 | 16 px / 1.58 / 400 |
| Body small | 14 px / 1.50 / 400 | 14 px / 1.50 / 400 |
| Technical label | 11–12 px / 1.4 / 500, mono | 11–12 px / 1.4 / 500, mono |
| Inline/code block | 13–14 px / 1.55 / 400, mono | 13–14 px / 1.55 / 400, mono |

Values are **starting implementation tokens**, not typography tuned against a final website. The `650` weight assumes variable-font support; use `600` or `700` if a runtime does not support the requested axis reliably.

### 5.3 Typography rules

- Headings are **sentence case** by default. All-caps is reserved for small navigational labels, overlines, and technical classification.
- Body copy is never fully justified; line length target is **60–75 characters** in long-form docs.
- Marketing heroes can use tighter tracking; ordinary product UI should use normal letterspacing.
- Mono is for **meaningful metadata**, not entire paragraphs or luxury decoration.
- Use tabular numerals for metrics, versions, measurements and aligned values.
- Prefer real text over baked-in raster text. Any image with important copy needs an accessible text equivalent.
- Do not claim a serif headline is Instrument Sans. Early generated editorial concepts are **typographic mood references**, not font-accurate specifications.

---

## 6. Layout, spacing, and surfaces

### 6.1 Spacing foundation

Base grid: **4 px**; primary rhythm: **8 px**.

| Token | Value | Typical use |
| --- | ---: | --- |
| `space.1` | 4 px | Icon-label micro-gap |
| `space.2` | 8 px | Related metadata |
| `space.3` | 12 px | Compact UI spacing |
| `space.4` | 16 px | Controls, small blocks |
| `space.6` | 24 px | Card padding |
| `space.8` | 32 px | Component grouping |
| `space.12` | 48 px | Content bands |
| `space.16` | 64 px | Major section spacing |
| `space.24` | 96 px | Spacious hero/section framing |

**Rule:** use token increments, not unrelated values scattered throughout the system. Optical exceptions are allowed for logos and special editorial work, but they are deliberate, not incidental.

### 6.2 Grid and responsive behavior

| Context | Initial layout contract |
| --- | --- |
| Desktop ≥ 1200 px | 12-column conceptual grid; content max-width `1200px`; 24–32 px gutters. |
| Tablet 768–1199 px | 8-column grid; 24 px margins; 20–24 px gutters. |
| Mobile < 768 px | 4-column grid; 16–20 px margins; 16 px gutters. |
| Documentation prose | Max line measure around `72ch`; diagrams/cards may expand separately. |
| Full-width graphics | Keep essential label/mark information inside a safe center region. |

These breakpoints are practical defaults, **not a claim of a shipping product's current behavior**. Test intermediate widths and zoom, not only these three presets.

### 6.3 Alignment and balance

- Left-align body copy in LTR contexts; for Arabic, align to the reading direction and handle mixed English/code runs intentionally.
- Prefer purposeful asymmetry: strong headline block paired with open graphic space.
- Preserve quiet regions; not every square centimeter needs a diagram, line or caption.
- A single hero focal point is stronger than a hero containing every feature.
- Use rules, dividers, and small mono labels to explain hierarchy — not as ornamental wallpaper.

### 6.4 Surfaces and shape language

| Element | Initial rule |
| --- | --- |
| Main canvas | Flat Midnight Ink or Light Canvas. |
| Cards | Subtle elevation by background and border, not giant shadows. |
| UI card radius | 8 px. |
| Input/button radius | 6 px. |
| Tags/chips | 4 px. |
| Thin separators | 1 px; ensure enough contrast where boundaries are functional. |
| Floating dialog | 12 px, modest shadow only when needed for layering. |

The **logo** and **decorative trace** may have distinct geometric terminals; this does not justify using five unrelated corner-radius styles in UI.

---

## 7. Signature graphic language — Flow Trace

The trace is **AstraFlow's repeatable graphic grammar**. It must look authored, not algorithmically randomized.

### 7.1 Visual primitives

1. **Route:** one deliberate continuous or segmented line.
2. **Node:** a square or compact rounded-square connection point.
3. **Transform:** a clearly labeled shape-change marker.
4. **Branch:** a real split/merge; not decoration pretending to prove concurrency.
5. **Inspection point:** a bounded marker for observable information or diagnostics.
6. **Uncertainty:** a clearly labeled dashed/partial relationship only when the underlying information is incomplete.

### 7.2 Graphic tokens

| Property | Baseline |
| --- | --- |
| Diagram route stroke | 1.5–2 px at normal desktop scale. |
| Decorative background route | 1 px and low emphasis; never critical information. |
| Main node | 8–12 px for typical diagram scale. |
| Connection ends | Prefer precise square terminals; keep consistent. |
| Turn style | Orthogonal where explanatory; controlled rounded elbow radius 8–16 px where appropriate. |
| Active/selected signal | Ion Cyan on dark; accessible teal on light. |
| Annotation text | IBM Plex Mono, 11–13 px, high enough contrast to read. |
| Grid | Optional 8/16/32 px construction guide at very low emphasis. |
| Direction | Explicit arrows only when direction is semantically meaningful. |

Never change node size or route shape in a **semantic** diagram merely for visual drama.

### 7.3 Semantic diagram grammar

| Representation | Meaning | Caveat |
| --- | --- | --- |
| Solid route + labeled nodes | Known relation from a documented source. | Cite or reference what is known. |
| Dotted or dashed route | Possible/partial/unknown relation. | Include a legend; dashes alone are insufficient. |
| Accent-highlighted segment | Selected area of discussion or observed focus. | Do not imply this is always the runtime hot path. |
| Warning label + distinct symbol | Reported diagnostic or risk. | Do not imply security certification. |
| Node group box | Logical package / module responsibility. | Not necessarily a runtime service or deployment boundary. |

**Truth rule:** when a diagram depicts actual AstraFlow functionality, make the relationship and execution order technically valid. The brand system does **not** permit inventing universal end-to-end runtime traces or exposing sensitive data.

### 7.4 Brand versus explanatory use

- **Brand illustration:** abstract trace permitted, no false technical labels or claims.
- **Architecture diagram:** every node, edge, and status must be verifiable; unknown/dynamic areas labeled.
- **Performance chart:** use actual published measurements, axes and methodology; never invent numbers to fill a graphic.
- **Security imagery:** prefer explicit safe/blocked/redacted states, not padlock imagery standing in for evidence.

---

## 8. Iconography, illustration, imagery

### 8.1 Icon system

- Consistent 24×24 design canvas, 1.75–2 px stroke for regular UI icons.
- Square/soft-square geometry compatible with Flow Trace nodes.
- Avoid mixing multiple unrelated icon packs or outline/solid treatments in the same hierarchy.
- Technical symbols must be comprehensible: dispatch, map, inspect, test should not all use visually identical stacked squares.
- Use accessible labels when meaning is ambiguous; icons are not substitutes for text.

### 8.2 Illustration system

Preferred: **vector-first technical illustration** with a small number of layers, meaningful geometry, explicit focal paths, clear annotations when needed, and generous negative space.

Allowed special cases: macro engineering imagery or material textures in an editorial campaign, as a **secondary** layer only. Real mechanical objects should not falsely imply that AstraFlow is a hardware or aerospace product.

Not allowed: stock photo people in server rooms, random 3D ribbons, glowing particle clouds, stock-code screenshots, gratuitous fake terminal outputs, or galaxy backgrounds because the name contains “Astra.”

### 8.3 Photography and materials

Photography is not part of the core logo system. For founder posts or event assets, use authentic photography with the identity overlaid **cleanly and sparingly**. Never make a generated portrait or fabricated scene look like documented participation in an event.

### 8.4 Generative-image policy

Generative tools may explore art direction and composition, but final branded assets must undergo review:

1. Recreate important wordmarks, labels, icons and diagrams as accurate editable vectors/text.
2. Validate typography, alignment, spelling, package/version references, technical diagrams and proportions.
3. Remove fake construction ratios, ornamental circuitry, and meaningless pseudo-interface details.
4. Export through a controlled layout; do not publish an unreviewed mood-board raster as the official brand specification.

---

## 9. Motion and interaction behavior

**Motion principle:** information becomes visible or changes state; it does not perform for attention.

| Motion | Baseline |
| --- | --- |
| UI hover/focus transition | 120–160 ms, restrained ease-out. |
| Standard state change | 160–220 ms. |
| Panel/modal entrance | 180–240 ms, opacity + short translation only if useful. |
| Decorative route reveal | 450–900 ms, once, if it clarifies direction. |
| Endless pulsing / glowing | Prohibited by default. |
| Reduced motion | Respect `prefers-reduced-motion: reduce`; remove nonessential movement. |

Do not animate the **logo** itself by default. Optional launch animations must preserve recognizability and have static equivalents. Loading indicators should indicate actual progress/state where possible, rather than implying an unmeasured execution path.

---

## 10. Writing, voice, and product claims

### 10.1 Voice

- Direct, specific, useful; technical before promotional.
- Lead with a developer outcome; follow with a supported reason.
- Distinguish **released**, **in development**, **candidate**, and **research** explicitly.
- Never present speculation as a current feature or benchmark result.
- Package descriptions should explain the smallest useful responsibility; avoid collapsing everything into a generic “framework.”

### 10.2 Brand copy hierarchy

| Level | Sample copy | Status |
| --- | --- | --- |
| Brand expression | **Engineered Clarity.** | Brand positioning, not technical claim. |
| One-line product explanation | **Explicit application flow for .NET.** | Broad description; verify fit to the asset. |
| Support line | **Dispatch requests. Define mappings. Inspect what your application declares.** | Use with qualifying documentation, not as universal runtime tracing. |
| Product family | **Mediator · Mapper · Diagnostics · Testing** | Existing capability categories; avoid presenting roadmap categories as shipped. |
| Future-facing editorial | **A clearer view of application flow.** | Vision phrasing; do not imply a shipping Flow Intelligence UI. |

### 10.3 Forbidden shortcuts

Do not publish claims such as “the fastest .NET mediator,” “zero-allocation mapping,” “enterprise-certified,” “fully AOT safe,” “complete compile-time flow intelligence,” or “unbreakable upgrades” without scoped, current, reproducible proof. Do not show `v2.4.0` as published until it actually is.

### 10.4 Naming

Product: **AstraFlow**. Package names use their exact API/NuGet casing, such as `AstraFlow.Mediator` and `AstraFlow.Mapper`. Separate `AstraFlow.Assertions` from `AstraFlow.Testing` in product explanations. Future package candidates are never added to an official “available packages” graphic before they ship.

---

## 11. Asset and channel specifications

### 11.1 Required brand deliverables

| Asset | Master format | Practical review/export tests |
| --- | --- | --- |
| Primary horizontal lockup | Editable vector + SVG | Dark/light/mono; nav and wide header uses. |
| Primary stacked lockup | Editable vector + SVG | Square and portrait framing. |
| Core symbol | Editable vector + SVG | 16, 24, 32, 64, 128, 256, 512 px. |
| Micro symbol | Editable vector + SVG | 16, 24, 32 px without merging details. |
| Wordmark | Outlined SVG + editable source | Light/dark; no font substitutions on export. |
| Palette and tokens | Machine-readable token source | Both themes, accessible semantics. |
| Flow Trace primitives | Editable vector components | Solid, unknown, inspection and branch rules. |
| Typography specimens | Layout source | Real headings, docs paragraph, commands, Arabic if used. |

### 11.2 GitHub / repository presence

**README hero:** suggested working canvas **1600 × 560 px** (or an accessible responsive SVG), with the primary lockup, a short positioning statement and one restrained trace. Keep text at useful sizes; avoid volatile version numbers baked into imagery. Include equivalent README text, because images alone are not reliable documentation.

**GitHub social preview:** prepare **1280 × 640 px** as an internal design master; verify the platform's actual crop/output requirements at publishing time. Safe center content, no micro-text.

**GitHub avatar:** square, symbol only; review at **32 × 32 px** and in dark/light browser contexts.

### 11.3 NuGet package icon

- Square, **text-free**, micro-symbol first.
- Create a clean **512 × 512 px** master and export PNG variants to the dimensions supported/required by the current package pipeline; do not assume master size equals NuGet's mandatory output size.
- Maintain visible safe padding, clear alpha/solid background behavior, and a strong small-size silhouette.
- Package icon must remain identifiable without copper, tiny outlines, or ambient glow.
- Replace `assets/branding/astraflow-icon.png` only after final approval and package compatibility review.

### 11.4 Release and social templates

| Template | Key content |
| --- | --- |
| Release announcement | Product, **verified** release number, one release outcome, package/version state, small trace. |
| Feature explainer | Capability label, before/after *if factual*, small code/detail area, relevant graphic. |
| Architecture card | Small scoped diagram, labels, legend, factual note. |
| Maintainer / personal-brand cover | AstraFlow identity as a product, founder identity as a separate credit, not a fused permanent logo. |
| Conference slide | One idea per slide, high contrast, diagrams readable from a distance. |

**Social master canvases** (e.g., 1200 × 630 or 1080 × 1080) are **production starting points**, not current platform guarantees. Verify target platform safe areas/cropping before final export.

### 11.5 Composition patterns

**Pattern A — Hero:** large wordmark/statement on the left; trace focal point on the right; no more than one dominant accent.

**Pattern B — Technical evidence:** restrained header, precise diagram or code sample, evidence/source line; minimal ornamental graphics.

**Pattern C — Release editorial:** strong numeral/version, concise claim verified against changelog, branded divider, small symbol.

**Pattern D — Minimal avatar:** centered monochrome or two-tone mark with sufficient padding, no microcopy.

**Rule:** do not force the same background graphic into every asset. Recognition should survive layout variation because of mark, typography, color discipline, and trace grammar.

---

## 12. Product UI & Next.js 16 Portal Architecture (`portal/`)

This section defines the **token, layout, localization, and 6-pillar architecture contract** for the AstraFlow Next.js 16 (App Router + Tailwind CSS v4) Portal & Documentation Platform in `portal/`.

### 12.0 6-Pillar Portal Architecture & Dual-Theme / Multi-Language Mandate

1. **`/` — Overview & Interactive Showcases:**
   - Pattern A Hero (`approved-reference.jpg` + `logo-mark-color.svg`), Flow Trace Pipeline Simulator, Transparent Benchmark & Footprint Visualizer, Interactive Split-View Code Comparison Matrix, Roslyn Analyzer & Generator Inspector, and Filterable 16-Package Ecosystem Navigator.
2. **`/docs` & `/docs/[...slug]` — Documentation & API Reference:**
   - Dynamically ingested from `../docs/` and `../README.md` with categorized left sidebar, GFM tables, copyable code blocks, heading anchors, version status banner (`v2.3.0 Published` vs `v2.4.0 Preview`), and right-hand Table of Contents.
3. **`/architecture` — The Archify Architecture Hub:**
   - Interactive native Flow Trace architecture blueprints and embedded Live Archify Artifact Viewer (`portal/public/archify/*.html`).
4. **`/explore` — The Understand Anything Knowledge Graph:**
   - Interactive multi-layer dependency and codebase knowledge graph covering all 16 `src/` packages, semantic path finder, and step-by-step guided architectural tours.
5. **`/changelog` — Searchable Living Changelog:**
   - Directly parsed from `../CHANGELOG.md` with version timeline, keyword search, category filter chips, and release status badges (`Unreleased / In Development` vs `Published`).
6. **`/community` — Community, Governance & Ecosystem:**
   - GitHub repository governance, contribution workflow, security disclosure policy, ADR & Decision Log explorer, and NuGet package matrix.

**Theme & Localization Contract:**
- **Dual Theme:** `dark` default (`#0C1420` Midnight Ink canvas, `#72D5DE` Ion Cyan accent with `#0C1420` text on solid buttons) and `light` mode (`#F7F7F3` Light Canvas, `#FFFFFF` surface, `#0F6875` accessible teal accent).
- **Multi-Language (`en` LTR + `ar` RTL):** Full English (`dir="ltr"`) and Arabic (`dir="rtl"` using `IBM Plex Sans Arabic`) support via `PortalContext`.

### 12.1 Implement first only if needed

Start with a small primitive set: type, color, spacing, button, link, input, badge, card, alert, code block, and responsive navigation **only when a real screen needs them**. Abstract after repetition proves useful; do not build a comprehensive component framework in advance.

### 12.2 Interactive states

| State | Required treatment |
| --- | --- |
| Default | Legible text, clear affordance, sufficient target size. |
| Hover | Small color or border change; not the only indication of interactivity. |
| Focus-visible | Clearly visible ring/outline using semantic focus token, ideally 2 px with offset; test on both modes. |
| Active / pressed | Distinct from hover; preserve text contrast. |
| Selected | Distinguishable by more than color; use state/aria as appropriate. |
| Disabled | Visibly inactive, but do not communicate critical state only through a low-contrast label. |
| Loading | Visible, announced if needed, avoids layout shift. |
| Error | Message says what failed and how to recover; not only a red border. |
| Empty | Helpful explanation and real next action, not a decorative illustration. |

### 12.3 Components: starting size tokens

| Element | Initial size |
| --- | --- |
| Default action/button height | 40 px; ensure required interactive target size through layout. |
| Compact control | 36 px only where density is justified and accessibility holds. |
| Spacious/primary control | 44 px. |
| Input height | 40–44 px. |
| Standard icon | 20 px inside a 24 px design canvas. |
| Content card padding | 24 px desktop; 16 px mobile. |
| Focus outline | 2 px with 2 px offset as a starting treatment; verify visible contrast. |

WCAG 2.2 AA includes requirements for text contrast, non-text contrast in relevant cases, keyboard operation, visible focus, and target size exceptions/thresholds. Passing a token table **does not** mean the final screen passes WCAG.

### 12.4 Documentation UI

- Provide persistent navigation only if information architecture warrants it.
- Code blocks need line wrapping/scroll behavior, copy affordance, syntax contrast and visible language labels where useful.
- Error/diagnostic IDs must be selectable/copyable text.
- Tables must be usable horizontally at small widths; preserve column meaning.
- CLI output and examples must be real, version-appropriate, and redact secrets.
- Favor semantic HTML, keyboard interaction, and maintainable CSS over decorative custom controls.

### 12.5 Technical content and data visualization

- Data visuals use labels, axes, units, source and methodology; no fake precision.
- Prefer neutral data colors with one accent for the key series; use shape/label differences for accessibility.
- Diagrams must distinguish declared/static facts from inferred/dynamic behavior.
- Never visually imply that a traced edge reveals live payload contents, PII or confidential data.

---

## 13. Reference implementation tokens

The following is **starter CSS**, intentionally small and framework-agnostic. This is *not* a published npm package or complete design-token build pipeline.

```css
:root,
[data-theme="dark"] {
  --af-bg-canvas: #0c1420;
  --af-bg-surface: #172231;
  --af-text-primary: #f2f1ec;
  --af-text-secondary: #a5b4c4;
  --af-border: #405267;
  --af-accent: #72d5de;
  --af-accent-on: #0c1420;
  --af-link: #72d5de;
  --af-focus: #72d5de;

  --af-font-sans: "Instrument Sans", Inter, Arial, sans-serif;
  --af-font-mono: "IBM Plex Mono", Consolas, monospace;

  --af-radius-control: 6px;
  --af-radius-card: 8px;
  --af-radius-dialog: 12px;
  --af-content-max: 1200px;
}

[data-theme="light"] {
  --af-bg-canvas: #f7f7f3;
  --af-bg-surface: #ffffff;
  --af-text-primary: #243342;
  --af-text-secondary: #4d6072;
  --af-border: #b8c6d0;
  --af-accent: #0f6875;
  --af-accent-on: #ffffff;
  --af-link: #0f6875;
  --af-focus: #0f6875;
}

:where(body) {
  background: var(--af-bg-canvas);
  color: var(--af-text-primary);
  font-family: var(--af-font-sans);
}

:where(a) {
  color: var(--af-link);
}

:where(:focus-visible) {
  outline: 2px solid var(--af-focus);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Token rule:** implementation should use semantic variables (`--af-text-primary`) rather than hard-code brand hex values in components. Keep the source of tokens singular when the first actual UI implementation begins.

---

## 14. File organization, handoff, and versioning

Canonical repository and portal branding structure for the v0.2 reference lock:

```text
design.md                              # this root design-system specification
logo-mark-color.svg                    # canonical v0.2 editable vector mark (viewBox 0 0 270 215)
assets/
  branding/
    exports/
      approved-reference.jpg           # locked primary reference sheet
      astraflow-avatar-512.png         # 512x512 NuGet & avatar raster export
      astraflow-readme-hero.jpg        # clean 2D vector-minimal Trace banner for README.md
      astraflow-social-preview.jpg     # OpenGraph / social preview banner
      astraflow-campaign-bento-v24.jpg # editorial campaign & release exploration visual
      astraflow-campaign-monolith.jpg  # editorial campaign exploration visual
      astraflow-campaign-stack.jpg     # editorial campaign exploration visual
      astraflow-campaign-toolkit.jpg   # editorial campaign exploration visual
    astraflow-icon.png                 # public NuGet package icon (updated to v0.2 Trace mark)
    astraflow-icon-legacy.png          # backup of legacy orbital-star icon
portal/
  public/
    images/
      brand/                           # mirrored public web brand & media kit exports
```

**Canonical package icon filename is `assets/branding/astraflow-icon.png`**, backed up at `assets/branding/astraflow-icon-legacy.png`.

### 14.1 Source file ownership

- Keep **editable vector** as master, not a PNG.
- Keep font licenses and asset provenance with source files; do not redistribute font binaries as part of casual asset handoff.
- Export raster assets only from reviewed masters, with reproducible size and background settings.
- Avoid embedding future release numbers in reusable masters.
- Record asset version, review date, and any approved exceptions in the commit/PR description.
- Keep source naming consistent: `astraflow-{asset}-{variant}-{size}.{ext}` where applicable.

### 14.2 Figma handoff checklist

The Figma design should contain only needed structures: **Foundations**, **Logo**, **Trace Primitives**, **Asset Templates**, and later **UI Components (when implemented)**. Use variables/styles for actual shared colors/type and reusable components for proven recurring elements. A dozen speculative component variants are not progress.

For each component or export, make sure the file includes:

- Intended usage and minimum size.
- Light/dark and monochrome variants where relevant.
- Actual vector/source geometry, editable text, and type licensing note.
- Contrast/zoom/mobile checks where relevant.
- Export instructions and version provenance.

---

## 15. Quality gates — when is a design actually finished?

### Gate 1 — Meaning

- [ ] An experienced .NET developer can identify this as serious developer infrastructure, not aerospace hardware, crypto, or an AI startup.
- [ ] The visual language reflects explicitness, predictability, inspectability, and modularity.
- [ ] Every externally facing technical claim matches current released documentation.

### Gate 2 — Distinctiveness

- [ ] The icon is recognizable **without** the product name, gradient, copper accent, or backdrop.
- [ ] The mark has been reviewed for similarity to adjacent developer tooling.
- [ ] The wordmark has intentional kerning and is not an untouched typed font sample.

### Gate 3 — Craft

- [ ] The final mark is clean editable vector with no accidental overlaps or malformed paths.
- [ ] Small-size output is inspected at **16, 24, 32, and 64 px**.
- [ ] A one-color version looks deliberate, not degraded.
- [ ] Text is real, correctly spelled, and aligned; no AI text artifacts.
- [ ] Optical spacing remains consistent at full-size, small-size, and compressed previews.

### Gate 4 — Accessibility and robustness

- [ ] Actual text/surface contrasts are checked, not assumed from brand swatches.
- [ ] Any product UI supports keyboard, focus, zoom, mobile and reduced motion as applicable.
- [ ] Technical diagrams remain understandable without color and with a legend.
- [ ] Light/dark rendering, crops, transparent backgrounds, and alt-text are reviewed.

### Gate 5 — Production integrity

- [ ] Final graphics are exported from **one reviewed master**.
- [ ] Actual GitHub/NuGet/platform asset requirements are verified at release time.
- [ ] Replacing the existing NuGet icon does not unintentionally degrade package presentation.
- [ ] Reusable assets do not contain unreleased versions or imaginary product capabilities.
- [ ] The final brand system can generate a hero, avatar, release post, and diagram **without inventing new styling rules**.

---

## 16. Suggested rollout (deliberately small)

### Phase A — Finalize the identity

1. Redraw **one** primary `A / Trace` concept in Figma as actual vector paths.
2. Test distinctiveness, optical geometry, and monochrome clarity at 16–128 px.
3. Refine the AstraFlow wordmark; select approved mark + lockups.
4. Freeze the essential color and type tokens after contrast and real-asset checks.

**Exit:** approved editable master, complete logo variants, and legible micro-symbol.

### Phase B — Ship the public brand

1. Export NuGet/GitHub avatars and README hero.
2. Update legacy branding documentation and icon **in the same intentional change**.
3. Make one release announcement template and one minimal technical diagram template.
4. Verify actual published paths, crops, alt-text and platform behavior.

**Exit:** identity is coherent across repository, package, and one real announcement.

### Phase C — Extend only where needed

When an actual product UI or docs refresh is approved, implement the token layer and only the required components. Validate through real screens; do not prebuild an entire design-system package.

**Exit:** no duplicated palette or conflicting button/typography rules in the surfaces that actually exist.

---

## 17. Open decisions before calling this `1.0`

1. **Final symbol:** which precisely drawn vector construction is approved after size and originality review?
2. **Wordmark:** standard Instrument Sans with optical tweaks, or carefully customized glyphs?
3. **Copper:** retained only for editorial campaigns, or removed entirely from core marketing?
4. **Brand environments:** which light-mode compositions are required on day one?
5. **Multilingual support:** whether Arabic brand materials are planned now, and if so which typographic proofs are needed?
6. **Legacy migration:** exact approval and release timing for replacing the existing icon and `docs/branding.md`.

Until these are resolved, the document is a **detailed working design system**, not a claim that final identity assets or UI components already exist.

---

## 18. References

**AstraFlow project sources**

- `README.md` — product/package boundaries and current release state.
- `docs/branding.md` — legacy icon and orbital-star direction that this proposal would replace.
- `docs/strategy/north-star.md` — product promise, inspectability, evidence and boundaries.
- `docs/strategy/decision-log.md` — approved versus candidate direction.
- `docs/roadmap.md` — status language and release constraints.
- `docs/plans/v2.4-release.md` — current unreleased work.
- `docs/plans/v2.5-flow-intelligence.md` — candidate explainable-flow work, not current functionality.

**External standards and font references**

- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — accessibility requirements.
- [Instrument Sans](https://github.com/Instrument/instrument-sans) — font project and license.
- [IBM Plex](https://github.com/IBM/plex) — font families and OFL license.

**Concept-image references**

- Initial generated **Editorial Monolith**, **The Trace**, and **Celestial Instrument** exploration boards (conversation assets). Treat them as **exploration**, not as final brand masters or proof of fonts, geometry, or implementation.

---

**North-star test:** *If the decoration disappears, does the work still communicate deliberate engineering?* If not, simplify until the identity carries the meaning by itself.
