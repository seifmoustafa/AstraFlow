# How does the rebuilt AstraFlow portal preserve Warm Forest while upgrading every interactive scene? {#astraflow-portal-rebuild}

The new `portal/` application isolates the **locked Warm Forest global shell** (`SiteHeader`, `SiteFooter`, typography, and `#f7f3eb` page surfaces) from **eight state-driven interactive instruments** powered by repository data and shared Hairline isometric geometry.

- Every route renders statically from real `.csproj`, `docs/**/*.md`, and `CHANGELOG.md` files into `80` pages (`244 KB` JS transfer).
- Page heroes across all six sections keep Warm Ivory `#f7f3eb` backgrounds, Deep Forest `#082c26` ink, and Signal Orange `#f25e3b` accents.
- Static placeholder cards and rotated sheets are replaced inside dedicated interactive components (`src/components/scenes/*`) backed by real React state.
- Full Playwright verification (`57 passed`, `1 intentional mobile zoom skip`, `0` critical/serious/moderate WCAG 2.2 AA violations) and `60` passing `.NET` tests confirm release readiness.

@answer scope="AstraFlow Next.js 16 portal · Warm Forest brand lock · Gates G0-G4"
@meta locale=en style=editorial

## How does the new Next.js 16 portal separate brand lock from interactive scenes? {#portal-architecture}

@architecture id=portal-arch title="AstraFlow Next.js 16 Portal Architecture"
| repo-files | Repository Sources | external |
| data-engine | Data Engine | backend |
| brand-shell | Warm Forest Shell | frontend |
| hairline-kernel | Hairline Kernel | frontend |
| home-scenes | Home Flow Scenes | frontend |
| package-docs | Packages & Docs | frontend |
| editorial-scenes | Guides & Community | frontend |
| repo-files > data-engine | source metadata |
| data-engine > brand-shell | static routes |
| data-engine > package-docs | 16 pkgs, 62 docs |
| data-engine > editorial-scenes | 36 releases |
| hairline-kernel > home-scenes | isometric prisms | emphasis |
| hairline-kernel > package-docs | loom & composer |
| hairline-kernel > editorial-scenes | runway & hub |

@steps id=portal-arch-steps
| step-repo | Repository Sources | Build-time loaders read `src/*/*.csproj`, `docs/**/*.md`, `CHANGELOG.md`, and `CONTRIBUTING.md`. | portal-arch | repo-files |
| step-data | Data Engine | Generates `68` doc routes, `16` package manifests, `36` changelog entries, and `6` learning milestones. | portal-arch | data-engine |
| step-shell | Warm Forest Shell | App Router layout pins `lang="en"`, `dir="ltr"`, `data-theme="warm-forest"`, canonical SVGs, and Warm Ivory backgrounds. | portal-arch | brand-shell |
| step-hairline | Hairline Kernel | Shared isometric projection helpers synchronize SVG plates, conduits, and reduced-motion guards across all scenes. | portal-arch | hairline-kernel |

## What stayed locked versus what changed across the six pages? {#design-boundaries}

| Page | Locked v12 Foundation | Interactive Upgrade in `portal/` | Provenance Guard |
| --- | --- | --- | --- |
| Home (`/`) | Stationary `A` hero, Warm Ivory band, proof strip | `LivingFlowAtlas` + `HomeExplodedArchitecture` {good:Synced C#} | Conceptual flow shapes, zero fake timing |
| Packages (`/packages`) | Split hero, composer panel, package index | `PackagesModuleLoom` + `PackagesStackComposer` {good:16 .csproj} | `AstraFlow.Assertions` flagged `2.4.0` unreleased |
| Docs (`/docs`) | Warm Ivory intro, 3-column reading preview | `DocsReferenceDesk` + `DocArticleEnhancer` {good:62 docs} | Direct Markdown AST & GitHub source links |
| Guides (`/guides`) | Hero heading + 4-stage milestone framing | `GuidesKineticRunway` 6-station isometric workbench {good:CLI + C#} | Milestone `06` explicitly tagged `2.4.0` preview |
| Changelog (`/changelog`) | Honest record framing & editorial chronology | `ChangelogFolioHero` + `ChangelogChronicle` {good:36 versions} | Separates `2.3.0` NuGet vs `2.4.0` source |
| Community (`/community`) | GitHub-first copy & public governance grid | `CommunityContributionCurrent` 6-node network {good:Keyboard nav} | Zero fabricated chat counts or Discord links |

## How were Gates G0 through G4 verified? {#quality-gates}

All Next.js (`tsc`, ESLint, `next build`, Playwright + `axe-core`, lab CWV, Gate 4 screenshots and `.webm` videos) and `.NET` checks ran after the final edits. Notice CSS contrast and mobile grid fixes reduced axe violations to zero and removed mobile clipping on `/community`.

@facts id=gate4-facts
| Static Next.js routes built | 80 pages (`6` main routes, `68` doc pages, metadata, `404`) |
| Source-backed catalog | `16` `.csproj` packages · `62` canonical Markdown docs · `36` changelog versions |
| Playwright E2E suite | `57 passed`, `1` desktop-only zoom skip on mobile, `0` failed |
| WCAG 2.2 AA (`@axe-core/playwright`) | `0` critical, `0` serious, `0` moderate violations across `7` routes |
| Layout shift & JS bundle | `0` CLS on all `6` routes · `244,483` bytes total JS transfer |
| Visual evidence & `.webm` videos | `14` PNGs (`1440×900` & `390×844`) · `6` Before/After PNGs · `6` `.webm` videos |
| `.NET` regression baseline | `37/37` `AstraFlow.Mediator.Tests` + `23/23` `AstraFlow.Mapper.Tests` passing |

- [x] Verify `npx tsc --noEmit`, `npm run lint`, and `npm run build` exit `0` after final CSS polish fixes
- [x] Confirm all `6` Before/After comparison PNGs and `390×844` mobile captures show Warm Ivory framing without clipping
- [x] Confirm zero edits to `.NET` source, tests, docs, samples, or `CHANGELOG.md`
