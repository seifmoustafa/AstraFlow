# AstraFlow Portal — Internal Maintainer & Developer Guide

> **Internal Maintainer File Only:** This document lives at `portal/MAINTAINER_GUIDE.md` (outside `portal/src/` and `portal/public/`) so it is **never** bundled, rendered, or served by the public AstraFlow website.

---

## 1. Deployment & Rebuild Model

**The portal does not auto-update at runtime.**

- `npm run build` (`next build --webpack`) compiles **62 Static & SSG routes** (`○ Static` and `● SSG`) by reading `../Directory.Build.props`, `../src/*/*.csproj`, `../CHANGELOG.md`, and `src/content/docs/*.md` from disk **at build time** (`fs.readFileSync`).
- There is **no** live runtime polling of NuGet.org or GitHub APIs.
- Whenever you publish a new version, deprecate a version/API, add a package, or edit docs, you must **rebuild and redeploy `portal/`**.

---

## 2. Release & Deprecation Playbooks

### A. Publishing a New Version (e.g., `2.4.0` → `2.5.0`)

| Step | File | What to Change |
| :--- | :--- | :--- |
| 1 | `../Directory.Build.props` | Set `<Version>2.5.0</Version>` and update `<PackageReleaseNotes>`. |
| 2 | `../CHANGELOG.md` | Prepend `## 2.5.0 (YYYY-MM-DD)` with all 7 required headings: `Breaking Changes`, `Added`, `Changed`, `Fixed`, `Deprecated`, `Removed`, `Security`. |
| 3 | `../README.md` | Update the release status note and `--version 2.5.0` quick-start snippet. |
| 4 | `src/lib/site-config.ts` | Update `LATEST_PUBLISHED_VERSION`, `LATEST_PUBLISHED_DATE`, `LATEST_PUBLISHED_PROVENANCE`, and `PREVIOUS_PUBLISHED_VERSION`. |
| 5 | `src/content/docs/*.md` & `src/lib/guides.ts` | Document any new shipped APIs, CLI commands, or milestones. |
| 6 | Verify & Redeploy | Run `verify-changelog-entry.ps1`, `npm run typecheck`, `npx eslint . --max-warnings 0`, `npm run build`, and `npm run test:e2e`, then redeploy `portal/`. |

### B. Deprecating an Entire Version (or Yanked/Retired Release)

1. In `../CHANGELOG.md`, change the release heading qualifier to `deprecated` (or `yanked` / `retired`):
   ```markdown
   ## 2.2.0 (deprecated 2026-12-01)
   ```
2. Optional: explain the replacement path under `### Deprecated` inside that release block.
3. If you deprecated the **current `LATEST_PUBLISHED_VERSION`**, also update `LATEST_PUBLISHED_VERSION` in `src/lib/site-config.ts` to the recommended stable replacement.
4. Rebuild and redeploy `portal/`.
5. **Automatic Portal Behavior**:
   - `VersionDeck` (`src/components/scenes/changelog/VersionDeck.tsx`) excludes deprecated editions from the 6 hero cards.
   - `ReleaseFolio` (`src/components/scenes/changelog/ReleaseFolio.tsx`) renders an Amber-Brown `Deprecated` badge, excludes it from `publishedCount`, and activates the `Deprecated` filter pill.

### C. Deprecating Specific APIs Within an Active Release

1. In `../CHANGELOG.md`, replace `- None.` under `### Deprecated` with real bullet items.
2. Rebuild and redeploy `portal/`.
3. **Automatic Portal Behavior**:
   - `hasDeprecations` becomes `true` while preserving the release's active status (`Latest Milestone` / `Feature Release`).
   - `ReleaseFolio` adds a `Deprecated` row tag, a `Deprecations` chip, an Amber-Brown `Deprecated` section heading, and enables the `Deprecated` filter pill.
   - `../scripts/verify-changelog-entry.ps1` continues to pass because the `### Deprecated` category remains intact.

---

## 3. What Auto-Updates vs. What Needs Manual Registration

| Change Type | Auto-Updates on Rebuild? | Where You Must Edit |
| :--- | :--- | :--- |
| New `CHANGELOG.md` release entry | **Yes** (after rebuild) | Only `../CHANGELOG.md`; `VersionDeck` shifts its 6-card sliding window & `ReleaseFolio` indexes it automatically. |
| Version / API deprecation | **Yes** (after rebuild) | Only `../CHANGELOG.md` (plus `src/lib/site-config.ts` if deprecating the latest version). |
| Package `.csproj` TFMs, dependencies, tags, description | **Yes** (after rebuild) | Only `../src/<Pkg>/<Pkg>.csproj`; `src/lib/packages.ts` parses XML dynamically at build time. |
| Global version badge (`2.4.0`) across scenes | **Yes** (after rebuild) | Only `LATEST_PUBLISHED_VERSION` & `LATEST_PUBLISHED_DATE` in `src/lib/site-config.ts`. |
| Adding a **brand-new `.NET` package** | **Partial** | Add `../src/<NewPkg>/<NewPkg>.csproj` **and** register it in `CURATED_METADATA` + `PACKAGE_ORDER` inside `src/lib/packages.ts`. All 3D/isometric stack scenes scale automatically. |
| Adding a **new doc page** | **No** (explicit registry) | Create `src/content/docs/<slug>.md` **and** add `<slug>` to `CURATED_DOC_ORDER` + `DOC_CATEGORY_MAP` in `src/lib/docs.ts`. |
| Adding a **new guide milestone** | **No** (explicit array) | Add a `RawMilestone` object in `src/lib/guides.ts`. |
| New portal UI component / layout / section | **Requires Brainstorming** | **STOP** and run `/using-superpowers` + `/brainstorming` with the user first (mandatory rule in `../.agents/rules/portal-and-content.md`). |

---

## 4. Complete Portal Architecture Map

### Global Shell, Motion & Geometry Layers
- **Root Layout & Metadata**: `src/app/layout.tsx`, `src/app/template.tsx` (route sweep), `src/app/not-found.tsx`, `src/app/error.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.svg`.
- **Navigation & Footer**: `src/components/shell/SiteHeader.tsx`, `src/components/shell/SiteFooter.tsx`.
- **Motion & Smooth Scroll**:
  - `src/components/motion/SmoothScrollProvider.tsx` (`scrollToElementOrHash`, Lenis + GSAP ticker)
  - `src/components/motion/HeroChoreography.tsx` (`HeroTextReveal`, `HeroStageEntrance`, `MagneticButton`)
  - `src/components/motion/ScrollReveal.tsx`
- **Hairline Isometric Kernel**:
  - `src/components/hairline/iso-kernel.ts`
  - `src/components/hairline/IsoPrism.tsx`
  - `src/components/hairline/IsoSignalConduit.tsx`
  - `src/components/hairline/useReducedMotionSafe.ts`
  - `src/components/hairline/useViewportActivity.ts`
- **Global Styles & Shared Copy**: `src/styles/globals.css`, `src/content/ui-copy.ts`.

### Route-by-Route Ownership

| Route | Page Entry | Primary Scene Components | Data Source(s) |
| :--- | :--- | :--- | :--- |
| `/` (Home) | `src/app/page.tsx` | `src/components/home/SignalArchitectureHero.tsx`, `src/components/scenes/home/LivingFlowAtlas.tsx`, `HomeExplodedArchitecture.tsx`, `HomeDetailsMatterSection.tsx` | `site-config.ts`, `ui-copy.ts` |
| `/packages` | `src/app/packages/page.tsx` | `src/components/scenes/packages/PackagesWorkspace.tsx`, `PackagesModuleLoom.tsx`, `PackagesStackComposer.tsx`, `PackagesDirectory.tsx`, `stack-resolver.ts` | `src/lib/packages.ts` (`../src/*/*.csproj`) |
| `/docs` | `src/app/docs/page.tsx` | `src/components/scenes/docs/DocsHeroDesk.tsx`, `DocsSearch.tsx` | `src/lib/docs.ts`, `src/content/docs/*.md` |
| `/docs/[...slug]` | `src/app/docs/[...slug]/page.tsx` | `src/components/scenes/docs/DocEnhancements.tsx` (progress, copy code, TOC) | `src/lib/docs.ts`, `src/lib/markdown.ts` |
| `/guides` | `src/app/guides/page.tsx` | `src/components/scenes/guides/GuidesKineticRunway.tsx` | `src/lib/guides.ts` |
| `/changelog` | `src/app/changelog/page.tsx` | `src/components/scenes/changelog/ChangelogShell.tsx`, `VersionDeck.tsx`, `ReleaseFolio.tsx` | `src/lib/changelog.ts` (`../CHANGELOG.md`) |
| `/community` | `src/app/community/page.tsx` | `src/components/scenes/community/CommunityContributionCurrent.tsx`, `CommunityStudySection.tsx` | `src/lib/community.ts` |

---

## 5. Step-by-Step Extension Recipes

### Recipe 1: Adding a New Package to `/packages` & the Interactive Stack
1. Create or confirm `../src/<NewPkg>/<NewPkg>.csproj` exists.
2. Open `src/lib/packages.ts`:
   - Add `<NewPkg>` to `CURATED_METADATA` (`shortName`, `category`, `roleSummary`, `capabilities`, `installKind`, `docHref`).
   - Place `<NewPkg>` in `PACKAGE_ORDER` at the desired display position.
   - Optionally add it to an existing or new entry in `COMPOSER_PRESETS`.
3. Do **not** touch `PackagesStackComposer.tsx` or `stack-resolver.ts` — they automatically compute isometric plate elevation (`stepZ`), `fitCamera` bounds, transitive `ProjectReference` resolution, and shared TFM intersection.
4. Update package counts in `src/content/ui-copy.ts` and `tests/scenes-interaction.spec.ts` if count assertions change.

### Recipe 2: Adding or Updating a Documentation Page
1. Write clean `.NET` developer documentation in `src/content/docs/<slug>.md` (use `# Title`, clean `csharp`/`bash`/`xml` fences, and zero internal jargon).
2. Open `src/lib/docs.ts`:
   - Add `'<slug>'` to `CURATED_DOC_ORDER` in the desired position.
   - Map `'<slug>'` to one of the 5 `DocCategory` tracks in `DOC_CATEGORY_MAP`.
   - If replacing or aliasing an old URL, add `['old-slug', '<slug>']` to `DOC_SLUG_ALIASES`.

### Recipe 3: Adding a Same-Page `#hash` CTA or Section Jump
- Use `<MagneticButton href="#section-id">` for hero CTAs (renders a native `<a>` intercepted by `SmoothScrollProvider`).
- Use `scrollToElementOrHash("section-id")` from `@/components/motion` for `<button>` click handlers.
- Do **not** add `scroll-margin-top` rules to `globals.css`; `html { scroll-padding-top }` and `scrollToElementOrHash` already apply exact sticky-header clearance once.

### Recipe 4: Adding a New UI Component, Section, or UX Change
1. **Mandatory Gate**: Invoke `/using-superpowers` and `/brainstorming` with the user before writing UI code.
2. Keep **Warm Forest** tokens intact (`#f7f3eb` paper, `#082c26` forest ink, `#f25e3b` signal, `#b73921` terracotta action, `color-scheme: light`).
3. Ensure `CLS = 0` (`opacity: 1` resting state for above-the-fold text/headings), `prefers-reduced-motion` parity, and keyboard accessibility (`Arrow` keys, `Enter`/`Space`, `aria-selected`).

---

## 6. Hard Guardrails

- **Warm Forest Lock**: Never add dark mode, theme toggles, language switches, or cyan/blue accents.
- **Product-Only Content Firewall**: Never expose inside `portal/src/` or `portal/public/` any internal governance or maintainer terms: `ADR-000*`, `Architecture Decision`, `roadmap`, `future-ideas`, `engineering-blueprint`, `api-governance`, `AFAN*` / `AFD*` / `AFPEF*` rule IDs, `Scope In 1.8*`, `UNRELEASED SOURCE`, `GitHub Unverified`, or `$env:DOTNET_CLI_HOME` (enforced by `tests/content-seo-a11y.spec.ts` and `tests/scenes-interaction.spec.ts`).
- **No Unintended `.NET` Edits**: Keep `../src/`, `../tests/`, `../docs/`, `../samples/`, `../benchmarks/`, and `../AstraFlow.slnx` untouched when doing portal-only updates.

---

## 7. Mandatory Verification & Deploy Checklist

Run these commands from the repository root (`AstraFlow/`) before every deployment:

```powershell
# 1. Validate CHANGELOG.md format against Directory.Build.props
powershell -ExecutionPolicy Bypass -File scripts/verify-changelog-entry.ps1

# 2. Strict TypeScript, zero-warning ESLint, and production Next.js build
Set-Location portal
npm run typecheck
npx eslint . --max-warnings 0
npm run build

# 3. Full Playwright E2E, WCAG 2.2 AA (axe-core), jargon firewall, and favicon checks
npx playwright test --reporter=list
```
