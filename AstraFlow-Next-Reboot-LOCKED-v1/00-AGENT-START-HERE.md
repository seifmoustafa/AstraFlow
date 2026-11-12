# ASTRAFLOW — CLEAN ROOM NEXT.JS REBUILD / SINGLE AUTHORITATIVE AGENT PROMPT

**This is a new project implementation, not a change to the failed portal.** The user has DELETED the old `portal/` application after a severe unintended global redesign. You must build a new `portal/` from scratch and **avoid repeating that mistake**.

## Mandatory first read

1. Read this ENTIRE file.
2. Read `specification/01-BRAND-LOCK.md` — highest visual authority.
3. Read `specification/02-SCENES-AND-BEHAVIOR.md`.
4. Read `specification/03-QUALITY-GATES.md`.
5. Render/view ALL six `reference-v12/*.html` **with their actual CSS/JS assets**, plus FULL screenshots and reference GIFs in `reference-v12/screenshots-final/`.
6. Inspect the 10 separate `visual-inspiration/*.png` images, but **DO NOT treat them as page templates or assets**. Their goal is interactive geometry and material craftsmanship *within* the approved visual identity.
7. Inspect the CURRENT AstroFlow .NET repository code, README and docs for product facts and architecture. Source content wins over the old screenshot/version marketing text.

**Do not read any prior unified/creative/guarded/motion prompts as instructions.** They are superseded and CONFLICT with the actual user request. This new document and its three specifications are the only active implementation contract.

## User intent and why previous work failed

The previously approved AstraFlow v12 website is an IVORY/LIGHT editorial design with forest typography, restrained forest sections, orange interaction signals, canonical A geometry, and six distinctive page layouts. The AI-generated reference images propose much more sophisticated COMPONENT internals; **they do NOT authorize a black site or a theme switch**.

The failed agent implementation inverted nearly every page to black, inserted an `IVORY` theme button, introduced cyan focus/active colors, broke mobile composition, made the logo wordmark invisible on the header, and replaced careful page heroes with giant dark backgrounds. **These are forbidden failures.**

Treat the approved v12 pages as a **visual acceptance baseline for the shell and pages**. Use the images only to creatively rebuild the selected scenes inside those pages.

## Scope: fresh Next.js app, not fresh brand

Create a brand-new, production-quality Next.js application **inside `portal/` only**. The previous `portal/` may be absent; do not 'upgrade' or resurrect failed source. If files are still present, inspect Git status and preserve user work; do not blindly delete anything.

Preserve all existing .NET packages, tests, GitHub workflows, repo docs and unaffected project areas. Create a safe branch/checkpoint; no production deploy or unapproved infrastructure changes.

Use the **latest patched STABLE Next.js 16** available at execution time (currently 16.4.x as of November 2026; verify), React compatible with the selected Next version, TypeScript strict, App Router, Server Components by default, supported Node.js LTS, one package manager and lockfile. Tailwind v4 is optional only if it helps; authored CSS/CSS Modules are often more precise for editorial layout. Use semantic tokens. Motion for React, Hairline and accessible primitives are opt-in only where justified. No unnecessary CMS, microservices, database, UI framework, or distributed architecture.

## Absolutes: DESIGN FREEZE

- **ONLY one theme**: Warm Ivory / Forest / Orange from `reference-v12`. Dark forest used ONLY inside deliberately dark sections (e.g. Flow Atlas + Footer). No theme toggle. No theme picker or `IVORY` control. No `prefers-color-scheme: dark` restyling.
- **ONLY English LTR now**. No language switch, route translations, sample Arabic strings, automatic language redirection or `ar` production route. Prepare only minimal translation boundaries, logical CSS and `lang/dir` foundation for future languages. Do not implement future languages now.
- NO cyan/electric blue accents. NO global dark backgrounds. NO massive text that clips. NO missing/white wordmark against ivory. NO global layout/typography reimagination.
- Use the canonical v12 SVG paths and correct LIGHT/DARK logo variants. No generated/recreated emblem.
- Preserve approved header/footer/page-shell composition, navigation order, typographic personality, spacing proportions, colors, button geometry and Home Hero scene. The major A/heading are STATIONARY; only the existing orange signal animates.
- The old v12 internal interactive diagrams and repetitive card scenes CAN be replaced. New work belongs inside SCOPED scene components only. Creative scenes must feel original, tactile and interconnected, as described in `specification/02`.
- Keep true repo-based docs, release versions and package APIs. No fabricated telemetry or benchmarks.

## Deliver all six pages / indexable docs

`/`, `/packages`, `/docs`, `/guides`, `/changelog`, `/community`, plus documentation article routes, correct 404. No page shall turn into a generic dark startup template.

**Page design reference:** render `reference-v12/index.html`, `packages.html`, `docs.html`, `guides.html`, `changelog.html`, `community.html` locally. They are the approved shell/palette/typography. Screenshots should not be treated as pixel-perfect HTML source but must be compared for global visual drift.

**Creative figure references:**
- Home signal `visual-inspiration/01-home-living-flow.png`: polish existing protected hero.
- Home flow `08-home-flow-atlas-detail.png`: original open connected flow replacing dark three-column dashboard.
- Home architecture `09-home-exploded-architecture.png`: original interactive exploded layers.
- Packages Hero `02-packages-module-loom.png`: new spatial module composition instead of rotated plates.
- Packages Composer `10-packages-stack-composer.png`: real selectable assembling pieces + accurate install commands.
- Docs `03-docs-reference-desk.png`: useful search/reference desk; ivory page remains.
- Guides `04-guides-kinetic-runway.png`: real connected learning path; ivory page remains.
- Changelog `05-changelog-living-edition.png`: interactive editorial release folio; ivory page remains.
- Community `06-community-contribution-current.png`: real, semantic, animated contribution paths; ivory page remains.
- `07-motion-craft-details.png`: transitions inspiration only; not a new color theme.

## Work sequence: IMPLEMENT, NOT PROMISE

**Gate 0 — Protect.** Inspect repo, baseline source, contents, runtime/versions; create branch/checkpoint. View complete v12 screenshots and HTML. Document fixed/replaceable boundaries.

**Gate 1 — Design-perfect stable foundation.** Build `portal/`, tokens, font hierarchy, logo, header/footer, six IVORY page shells, Home Hero accurate to approved reference. **Render all six Desktop/Mobile and visually compare to v12 before building a single advanced figure.** Fix any dark/cyan/wordmark/layout regression immediately. This is the most important gate. Do NOT proceed with wrong colors.

**Gate 2 — Real functionality/content.** Docs imported from current repo with functional search and TOC, full verifiable changelog history/status, packages and accurate install commands, guides/community, metadata/SEO. All content server-rendered and accessible where possible.

**Gate 3 — Groundbreaking bespoke components, scoped.** Build actual React/TypeScript original figures in controlled scene boundaries: Packages Module Loom → Home Flow Atlas → Changelog Folio → Package Composer → Home Architecture → Docs desk → Guides → Community. Integrate Hairline where justified; for custom figures use the skill to prototype, then integrate proper React state, semantic controls and real SVG. Ensure intentional motion + hover/focus/touch, not generic animations or static visual swaps. Validate before/after appearance AND actual behavior at each iteration. DO NOT modify global theme, nav or fonts to make a figure look cool.

**Gate 4 — QA, refinement, deliver.** Run clean production build, typecheck, ESLint, real Playwright browser checks, accessibility, mobile, reduced-motion, stress rapid state changes, source links, SEO and performance measurements, plus full-page screenshots and video recordings. All must pass or give an honest blockers table. Do not deploy without authorization.

Use one clear motion system; prefer transform/opacity and authored SVG paths, interruptible state transitions, and graceful reduced-motion. No scroll hijack, heavy perpetual animations or cartoon springs. Purposeful motion can be beautiful without ruining usability.

## Immediate instructions

START NOW with Gate 0 and Gate 1, then continue through Gate 4 until the implementation is complete within the available workflow. Do not stop at design research, a plan, a single static page, or one pilot component. Do not wait for user approval at every phase; run self-checks and report visual evidence. Ask only about a genuinely blocking decision (e.g. production domain/deploy credentials), and do not let it block local implementation.

**Success is not a big CSS diff, not a black theme, and not many dependencies.** Success is six beautiful IVORY/FOREST/ORANGE routes with the correct typography and logo, plus exceptional genuinely interactive original scene components that improve the user experience while preserving the approved design language.
