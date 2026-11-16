# AstraFlow Portal Stabilization & Zero-CLS Design

**Status:** Approved design (pending spec review gate)  
**Date:** 2026-11-16

## Intent

Complete the second stabilization wave for the AstraFlow Next.js 16 portal following the migration to standard default browser scrolling (`behavior: "auto"`, zero Lenis interception). This work resolves all 28 failing Playwright E2E checks (without touching scroll behavior regressions, of which zero remain), eliminates remaining layout shifts across `/docs`, `/docs/[...slug]`, and `/community`, removes non-composited scroll work and WAAPI/GSAP transform contention, uninstalls unused `lenis`, and synchronizes lint ignores and agent documentation rules.

## Goals

- Bring `npm run test:e2e` from `92 passed, 28 failed` to `120 passed, 0 failed` by eliminating local `/_vercel/insights/script.js` 404 console errors and hardcoded `2.3.0`/`2.4.0` release expectations.
- Achieve near-`0` CLS across all 7 audited portal routes (`/`, `/packages`, `/docs`, `/docs/getting-started`, `/guides`, `/changelog`, `/community`) while keeping gentle live-cycling hero inspectors on `/docs` and `/community`.
- Emit documentation code-block headers and copy controls directly in SSR HTML with localized copy labels, zero post-hydration DOM wrapping, and a single shared clipboard utility reused across docs search and articles.
- Move the docs article reading progress bar from React state CSS `width` mutation to compositor `transform: scaleX(...)` via ref + `requestAnimationFrame`, and decouple WAAPI entrance vs GSAP `ScrollTrigger` `transform` on `HeroStageEntrance`.
- Localize the remaining hardcoded `MIN READ` label in `DocsSearch`, uninstall unused `lenis`, ignore `artifacts/**` in `eslint.config.mjs`, clean up untracked `portal/artifacts/` and `portal/debug.log`, and update stale `src/lib/*` / `ui-copy.ts` path references in `.agents/rules/portal-and-content.md`.

## Non-goals

- Redesigning the Warm Forest visual tokens, palette, typography, routes, or header/footer shell.
- Changing desktop/mobile navigation structure, adding new routes, or adding new third-party dependencies.
- Reintroducing smooth scrolling overrides (`Lenis`, `scroll-behavior: smooth`, or `data-scroll-behavior="smooth"`).
- Publishing NuGet packages or pushing git commits automatically.

## Approaches Considered

1. **Approach A — Unified Zero-CLS & Reliability Pass (selected):** Group the E2E fixes, compositor/motion cleanups, SSR markdown code-block rendering, hero `min-height` + crossfade stabilization, dependency cleanup, and rule-path sync into one cohesive implementation plan sharing one final build + E2E + Chromium CLS verification pass.
2. **Approach B — Two-Phase Split:** Fix non-UI E2E/compositor items first and zero-CLS UI/SSR items second. Rejected because both sets overlap inside `documentation/` modules and Playwright E2E tests, doubling full `next build` and 120-test verification cycles without lowering risk.
3. **Approach C — CSS Containment Only:** Keep `DocEnhancements` post-hydration code-block DOM wrapping and pad/hide it via CSS. Rejected because it retains hydration-time DOM height growth, hardcoded English `'Copy'` / `'Copied ✓'`, and duplicated clipboard code.

## Detailed Design

### 1. E2E Stability & Release Metadata Parity (`120/120` target)

- **Vercel Analytics Environment Guard (`portal/src/app/layout.tsx`)**
  - Currently renders `<Analytics />` unconditionally at lines 62–63, causing local `next start` runs in Playwright to request `/_vercel/insights/script.js` and log HTTP 404 console errors (14 of 28 E2E failures).
  - Change: Render `<Analytics />` only when `process.env.VERCEL === '1'` (`{process.env.VERCEL === '1' ? <Analytics /> : null}`). Vercel preview and production deployments still emit analytics; local and self-hosted builds emit zero failing requests.
- **Metadata-Driven Release Assertions (`portal/tests/package-provenance.spec.ts`, `portal/tests/scenes-interaction.spec.ts`)**
  - Currently hardcode `'2.3.0'`, `'2.4.0'`, and `'Latest Milestone'` strings stale after the `2.4.1` sync (14 of 28 E2E failures).
  - Change: Import canonical data helpers (`LATEST_PUBLISHED_VERSION` from `@core/config/site-config`, `getAllPackages`/`getPackageReleaseLabel` from `@modules/catalog/packages`, `getAllChangelogReleases`/`selectFeaturedReleases` from `@modules/releases/changelog`) so assertions verify actual published/planned release metadata dynamically instead of brittle hardcoded versions.

### 2. Zero-CLS Live Heroes (`/docs` & `/community`)

- **Docs Hero Codex Desk (`DocsHeroDesk.tsx` & `DocsHeroDesk.module.css`)**
  - Currently renders `<AnimatePresence mode="wait">` inside `.readoutBar`, causing height collapse/expansion (`~37.75 px` shift on `SECTION.DocsSearch_referenceSection___k6yG`, `0.01898`–`0.02477` CLS) whenever auto-cycling swaps volume summaries.
  - Change: Keep gentle auto-cycling enabled. Reserve a uniform responsive `min-height` on `.readoutBar` / `.readoutContentWrap` covering the tallest volume entry across `FOLIO_VOLUMES` + `documentation.en.ts` copy, and replace `mode="wait"` with `AnimatePresence initial={false} mode="sync"` inside a `display: grid` stack (`grid-area: 1 / 1`) using opacity-only crossfade so swapping active volumes never changes document flow height below the hero.
- **Community Contribution Current (`CommunityContributionCurrent.module.css`)**
  - Currently renders `.inspectorPanel` without height reservation, shifting `.v10-community-values`, `.inspectorFooter`, and `.editorial-panel` by `~13–19 px` (`0.01736` CLS) each `AUTO_ROUTE_INTERVAL_MS` cycle.
  - Change: Keep `AUTO_ROUTE_INTERVAL_MS` cycling active and assign `.inspectorPanel` a responsive `min-height` sized to accommodate the tallest pathway's title, summary, and governance rule across desktop and mobile viewports so below-hero sections remain anchored (`0` CLS).

### 3. Docs Article SSR Code Bars, Compositor Motion & Constant ToC Geometry

- **SSR Code-Block Headers & Shared Clipboard**
  - Extract a single browser clipboard helper (`copyTextToClipboard(text: string): Promise<boolean>`) in `portal/src/core/ui/clipboard.ts` (re-exported from `@core/ui`) so `DocsSearch.tsx` and `DocEnhancements.tsx` share one tested implementation.
  - Update `renderMarkdownToHtml` (`portal/src/core/content/markdown.ts`) to accept optional `codeBlockLabels?: { copy: string; copied: string; copyAriaTemplate?: string; copiedAriaTemplate?: string }` (with defaults `'Copy'` / `'Copied ✓'`). Emit fenced code blocks wrapped in `<div class="docs-code-wrap" data-docs-code-block>` containing `<div class="docs-code-bar"><span class="docs-code-lang">...</span><button type="button" class="docs-code-copy" data-docs-copy-btn data-copy-label="..." data-copied-label="..." ...>...</button></div>` directly around `<pre class="code-block"><code>...</code></pre>`.
  - `DocArticlePage.tsx` passes localized labels from `getTranslations('documentation.enhancements')` (`copyCommand`, `copiedCommand`). Style `.docs-code-wrap`, `.docs-code-bar`, `.docs-code-lang`, `.docs-code-copy`, and `.docs-code-copy--copied` directly beside `.docs-prose pre.code-block` in `portal/src/core/design/globals.css`, and remove the obsolete post-hydration `.codeBlockWrap`/`.codeBlockBar` classes from `DocEnhancements.module.css`.
  - `DocEnhancements.tsx` drops the imperative `pre.code-block` DOM wrapper effect and handles `[data-docs-copy-btn]` clicks via delegation inside the article container, updating button label/state/`aria-label` cleanly on copy.
  - Note: Existing Playwright checks in `portal-architecture.spec.ts` validate TSX `<Button>` usage in React components; SSR HTML rendered by `markdown.ts` inside `.docs-prose` satisfies `@core/ui` boundaries while eliminating client DOM injection.
- **Localized Card Metadata (`DocsSearch.tsx`)**
  - Replace hardcoded `{activeDoc.readingMinutes} MIN READ` at line 488 with `{t('readMinutes', { count: String(activeDoc.readingMinutes) })}` (key already exists in `documentation.en.ts`).
- **Constant ToC Link Geometry (`DocEnhancements.module.css` & `globals.css`)**
  - Currently `.activeTocLink` switches `font-weight` to `700` and adds negative margin/left padding (`border-inline-start: 2px solid var(--signal); padding-inline-start: 10px; margin-inline-start: -12px`), causing near-edge ToC entries to wrap onto an extra line (`56.78 -> 79.17 px`) during scroll.
  - Change: Apply constant inset spacing (`border-inline-start: 2px solid transparent; padding-inline-start: 10px; margin-inline-start: -12px`) to base `.docs-toc a` rules, and style `.activeTocLink` using color, border color, and subtle tint/weight-neutral emphasis without altering text width so active switching triggers zero line wrapping (`0` ToC shift).
- **Compositor Reading Progress & Hero Transform Isolation**
  - `DocEnhancements.tsx` + `DocEnhancements.module.css`: Drive `.readingProgressBar` via a `ref` (`transform: scaleX(...)` with `transform-origin: inline start`) inside a `requestAnimationFrame`-guarded scroll listener instead of `setProgress(...)` updating CSS `width`. Expose `aria-valuenow` updates throttled only when integer percentage changes if needed for assistive technology without layout reflow.
  - `HeroChoreography.tsx` (`HeroStageEntrance`): Separate the 640 ms WAAPI entrance container (`outerRef`) from a child `scrubRef` element driven by GSAP `ScrollTrigger` (`y: 14, scrub: 0.5`), preventing WAAPI and GSAP from mutating `transform` on the same DOM node simultaneously.

### 4. Dependency Cleanup, Lint Config & Rule Sync

- **Remove unused `lenis`**: Run `npm uninstall lenis` in `portal/` to remove the unused runtime dependency from `portal/package.json` and `portal/package-lock.json`.
- **Lint & untracked artifacts**: Add `'artifacts/**'` to `globalIgnores` in `portal/eslint.config.mjs` so `npm run lint` (`eslint .`) completes cleanly without scanning capture artifacts, and delete untracked `portal/artifacts/` and `portal/debug.log`.
- **Update stale portal rule paths (`.agents/rules/portal-and-content.md` & `AGENTS.md`)**: Update remaining references to removed `portal/src/lib/{site-config,packages,guides,changelog}.ts` and `portal/src/content/ui-copy.ts` paths to point accurately to `portal/src/core/` and `portal/src/modules/` (e.g., `portal/src/core/config/site-config.ts`, `portal/src/modules/*/*.en.ts`, `portal/src/modules/*/data/`).

## Verification Plan

After implementation, run and observe all checks on the final code:
1. `cd portal && npm run typecheck` (`tsc --noEmit` -> exit `0`)
2. `cd portal && npm run lint` (`eslint . --max-warnings 0` -> exit `0` without path exclusions)
3. `cd portal && npm run build` (`next build --webpack` -> exit `0`)
4. `cd portal && npm run test:e2e` -> verify `120 passed, 0 failed` across desktop & mobile Chromium
5. Re-run headless Chromium 7-route scroll & CLS verification script (`behavior: "auto"`, `0` reverse jumps, `0` / near-`0` CLS on `/`, `/packages`, `/docs`, `/docs/getting-started`, `/guides`, `/changelog`, `/community`).
