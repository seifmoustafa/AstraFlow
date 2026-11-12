# Next.js implementation map — final page & component contract

## Architecture — simplest reliable implementation

Next.js 16 App Router + TypeScript + CSS variable tokens, Server Components by default. Client components only where state and DOM interaction are required. No backend/microservices/database for a static documentation and product site. Tailwind 4 optional; do **not** rewrite visually precise CSS merely to adopt a utility framework.

Proposed architecture:

```text
app/
  layout.tsx               # html lang/dir, shared server fonts/tokens, metadata defaults
  page.tsx                 # Home
  packages/page.tsx
  docs/page.tsx
  docs/[...slug]/page.tsx  # MD/MDX-derived docs, generateStaticParams
  guides/page.tsx
  changelog/page.tsx
  community/page.tsx
  not-found.tsx
  sitemap.ts
  robots.ts
  opengraph-image.tsx     # or verified static OG asset
components/
  site/Header.tsx Footer.tsx MobileNavigation.tsx SkipLink.tsx
  hero/HomeHero.tsx SignatureA.tsx SignalTrace.tsx
  home/FlowExplorer.tsx FlowStageRail.tsx DecisionPanel.tsx CodeExample.tsx
  home/ArchitectureAssembly.tsx PackagePreview.tsx
  packages/PackageComposer.tsx PackageInventory.tsx
  docs/DocsShell.tsx DocsSearch.tsx ArticleToc.tsx CopyCode.tsx
  guides/JourneyRail.tsx
  changelog/VersionFolio.tsx ReleaseDetails.tsx
  community/ContributionNetwork.tsx
  motion/ReducedMotionProvider.tsx
content/ # canonical pinned README/doc source + release metadata
messages/en.json
styles/tokens.css styles/layout.css styles/components.css styles/motion.css
public/brand/ # copy original approved SVGs, no bitmap recreation
```

## Preserve/replace by page

| Baseline selection | Production component | Visual contract | Interaction contract | Rendering |
|---|---|---|---|---|
| `.site-header`, `.brand`, `.nav`, `.small-btn` | Header, MobileNavigation | Same logo variants, sizes, sticky header, weight/spacing; correct active state | proper links, Esc, keyboard focus, mobile nav | Server shell + client menu |
| `.v12-home-hero`, `.v10-logo-svg` | HomeHero + SignatureA | **Static** giant A geometry and headline. Preserve orange path and label spacing | pause/resume, intersection/visibility, reduced-motion; signal only | Server SVG + tiny client SignalTrace |
| `#experience`, `.v10-flow-instrument`, `.v12-stage-current` | FlowExplorer + FlowStageRail | Same 3-column dense dark instrument and stage-linked animated point; follow v12 data model | 3 capabilities × 4 stages, buttons/keys, synchronized code/decision/progress; no measured runtime claims | Client island |
| `#composition`, `.v10-assembly-figure` | ArchitectureAssembly | Integrated isometric plates, open on ivory, selected layer in place | selected layer + description update; pointer, touch, keyboard | Client island; Hairline conditional |
| `.v10-modules-section` | PackagePreview | Editorial lines, no unnecessary cards | correct links and package descriptions | Server |
| Packages Hero `.overlap-scene` | PackagesHeroAssembly | Colored physical package plates, not a generic badge card | plates can signal selection; must not claim package dependency semantics unless source-proven | Server or client depending on effect |
| `#composer`, `[data-pkg]` | PackageComposer | Existing composer layout, clear active states and command output | set of selected packages; copy command(s), empty state; NuGet IDs verified | Client island |
| Docs Hero + `#reading` | DocsHome + DocsShell | real focused search and reading/navigation design | working search, URLs, accessible TOC, heading anchors, docs markdown | Server-first + isolated search client |
| `[data-guide]` | JourneyRail | horizontal editorial progression | four meaningful states on home, six actual sourced guides; links | Client |
| `.release-row` | VersionFolio | editorial chronology, not randomly floating promotional cards | accessible disclosure, per-record status, source links, full history | Server + small disclosure |
| `.v10-community-branches` | ContributionNetwork | central source and four connected links on open paper | keyboard focus and pointer highlight matching route; links must be real | Server + client highlight |
| `.footer` | Footer | approved inverse logo (`mark-on-dark.svg`) and readable heading | correct navigation | Server |

## Flow Explorer state model (no duplicated state)

```ts
type Capability = 'dispatch' | 'mapping' | 'diagnostics';
type StepIndex = 0 | 1 | 2 | 3;
interface FlowState { capability: Capability; step: StepIndex }
```

Define a verified `FlowScenario` data object containing stage labels, explanation and exact C# sample. Every change to `FlowState` updates five views in the **same React render**: selected capability, selected node, stage number, detail, code + moving indicator. Use `useLayoutEffect` / `ResizeObserver` only to locate active node center when using custom CSS trace; or Motion `layoutId` for a highlight that genuinely migrates between nodes. Never regenerate code or invent measured timings. Provide focus restoration and persistent button labels.

## Distinct page structure rules

- **Home** = editorial value proposition + architectural signature + useful Flow Explorer + compositional proof + ecosystem + meaningful footer. Do not animate headline/logo coordinates.
- **Packages** = deliberate assembly and install decision. Display package boundaries prominently; preserve choice feedback, avoid claiming all packages required.
- **Docs** = functional search and reading-first hierarchy. Do not force giant marketing hero into article pages. Source lines/code snippets must be syntax highlighted, accessible and tested.
- **Guides** = guided progression linking real documentation. One stage active with a clear next action; no decorative carousel when a simple list is better.
- **Changelog** = truthful release provenance, searchable/filterable if useful. Not a marketing showcase of three handpicked versions. Every entry has version, date where source supports it, status and source.
- **Community** = four honest paths (read source, issues, contributions, docs); no fictitious social channels or stats.

## Visual freeze conditions

No alternate logo geometry, no new purple/blue/gradient palette, no 3D rotating cube, no auto-changing headline, no font substitution without screenshot review, no global route crossfade, no cursor follower, no fake glassy cards, no accidental over-darkening of words on dark green, no margin/padding regression due to framework defaults.
