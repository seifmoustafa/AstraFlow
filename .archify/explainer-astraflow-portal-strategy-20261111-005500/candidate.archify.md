# AstraFlow Portal: The Trace & Engineered Clarity Strategy {#astraflow-portal-strategy}

AstraFlow will feature an integrated **Next.js 16 (App Router) + Tailwind CSS v4** portal in `portal/`, executing **The Trace** design system with **Engineered Clarity**.

- Co-locating in `portal/` provides atomic synchronization between C# code, docs, and changelog with zero drift.
- The Trace palette establishes Midnight Ink `#0C1420`, Carbon Surface `#172231`, Mineral White `#F2F1EC`, Ion Cyan `#72D5DE`, and Warm Copper `#D9A477`.
- Typography is anchored by Instrument Sans for headlines/UI and IBM Plex Mono for code/telemetry.
- Native interactive islands deliver zero-alloc benchmarks, Flow Trace pipeline simulators, and side-by-side code comparisons.

@answer scope="The Trace · Engineered Clarity · Next.js 16 · Tailwind CSS v4"
@meta locale=en

## How do the three architectural approaches compare? {#approaches-comparison}

| Criterion | Approach 1: Integrated Next.js 16 (Recommended) | Approach 2: Starlight / Fumadocs Hybrid | Approach 3: Single-Page Web App (SPA) |
| --- | --- | --- | --- |
| Code & Docs Synchronization | Atomic git commits {good:Zero Drift} | Separate repos or sync scripts {caution:Sync Lag} | Atomic in repo {good:In Sync} |
| The Trace Design System Fidelity | Complete token parity with design.md {good:Pixel Perfect} | Constrained by docs theme limits {caution:Compromised} | Custom CSS canvas {good:Flexible} |
| SEO & AEO (AI Engine Optimization) | Pre-rendered static pages + metadata {good:Peak Discoverability} | Good static SEO {good:High} | Client-side CSR {bad:Poor Discoverability} |
| Archify & Understand Anything Embeds | Seamless full-viewport canvas islands {good:Native Integration} | Iframe sandboxing with borders {caution:Friction} | In-canvas tabs {good:Integrated} |
| .NET Solution Isolation | Pure `portal/` isolation without touching .NET {good:Zero Impact on C#} | Fully decoupled {good:Isolated} | Potential root clutter {caution:Requires Monorepo Tools} |

## What is the 6-pillar information architecture? {#six-pillars}

@tree id=portal-structure title="AstraFlow Portal Information Architecture"
| portal_root | AstraFlow Portal | - |
| overview | Overview Landing | portal_root |
| docs | Documentation | portal_root |
| architecture | Architecture Hub | portal_root |
| knowledge | Knowledge Graph | portal_root |
| changelog | Living Changelog | portal_root |
| community | Community Hub | portal_root |
| hero_sim | Hero & Flow Simulator | overview |
| benchmarks | Zero-Alloc Benchmarks | overview |
| diffs | Syntax Comparison Matrix | overview |
| pkg_grid | 16-Package Grid | overview |
| getting_started | Getting Started | docs |
| mediator_guide | Mediator Deep Dive | docs |
| mapper_guide | Mapper & Projections | docs |
| assertions_guide | Assertions Guide | docs |
| blueprints | System Blueprints | architecture |
| sequences | Request Pipelines | architecture |
| dep_tree | Dependency Tree | knowledge |
| guided_tours | Guided Code Tours | knowledge |
| history | Search & Version Filter | changelog |
| metrics | GitHub & NuGet Metrics | community |

## What are the key stages for delivery? {#delivery-steps}

@steps id=implementation-roadmap
| step_tokens | Extract Tokens from design.md | Set up Midnight Ink, Carbon Surface, Ion Cyan, and font bindings. |
| step_scaffold | Scaffold Next.js 16 in portal/ | App Router, Tailwind CSS v4, Instrument Sans, IBM Plex Mono, and Lucide. |
| step_showcase | Build The Trace Showcase Islands | Implement Flow Simulator, Zero-Alloc Benchmarks, and Code Diff Split-View. |
| step_docs | Implement Docs & Changelog Pipeline | Ingest existing markdown docs, API references, and parse CHANGELOG.md. |
| step_visuals | Embed Archify & Understand Anything | Mount interactive diagram views and AST knowledge explorer routes. |
| step_deploy | Verification & Production Build | Run next build, static export validation, and link checks. |

## What design tokens govern the implementation? {#technical-governance}

- [ ] Midnight Ink `#0C1420` as primary canvas void and Carbon Surface `#172231` for cards
- [ ] Mineral White `#F2F1EC` for high-contrast typography and Ion Cyan `#72D5DE` for signals
- [ ] Warm Copper `#D9A477` reserved for micro-accents and strictly under 5% of visible area
- [ ] Instrument Sans for headings and UI, IBM Plex Mono for code and metadata
- [ ] 4px base grid with 8px rhythm and 8px card radius / 6px button radius
- [ ] Responsive layouts meeting WCAG 2.2 AA accessibility standards (16:1 text contrast on dark)
