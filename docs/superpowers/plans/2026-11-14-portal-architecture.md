# AstraFlow Portal Architecture Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the portal to a feature-owned, localization-ready architecture while preserving every current route, product fact, interaction, design detail, accessibility behavior, and static output.

**Architecture:** Keep App Router pages as thin adapters; move page views, application services, repository ports/adapters, and English messages into feature modules. Put shared UI, design tokens, locale configuration, shell, motion, and SEO in `src/core`; keep Markdown product documentation in `src/content/docs`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `next-intl`, CSS Modules/global CSS, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-14-portal-architecture-design.md`

## Global Constraints

- Preserve all existing URLs, route content, anchors, interactions, release semantics, and static build behavior.
- English remains the only active locale and keeps current unprefixed URLs; Arabic is the first planned additional locale, uses RTL, and has no switcher or public route until translated.
- Every user-visible UI string is resolved through a module-owned translation key using `t(...)`; long product documentation stays Markdown.
- Preserve Warm Forest design, responsive layout, keyboard access, focus visibility, reduced motion, smooth scrolling, and content firewall.
- Package release status remains explicit, validated data; do not add runtime NuGet calls.
- No publishing, deployment, pushing, or merging.

## Review Focus

- Client and server component boundaries must keep translation functions on their side of the boundary; test representative pages and interactive scenes.
- Empty or unavailable data must preserve current useful empty/error states; test package/docs search and changelog.
- Arabic RTL readiness must not mirror directional code/icons incorrectly or disturb English; test computed direction and representative logical layout rules without exposing Arabic routes.
- Package manifest drift must fail clearly; test missing and unknown package IDs.
- SEO canonical and sitemap output must not introduce duplicate `/en` pages or claim facts absent from visible content; inspect production HTML and generated metadata.

---

## File Structure

- `portal/src/app/**`: thin route/layout/error/metadata adapters only.
- `portal/src/modules/site/home`, `catalog/packages`, `documentation/index`, `documentation/article`, `learning/guides`, `releases/changelog`, and `community/contribution`: feature views, services, ports, current source adapters, presentation models, and `*.en.ts` messages.
- `portal/src/core/api`, `design`, `i18n`, `locales`, `seo`, `shell`, `ui`, `motion`, and `hairline`: shared platform facilities with no feature-specific copy.
- `portal/src/content/docs/**`: long-form Markdown documentation.
- `portal/tests/**`: route, locale/message, module-boundary, SEO, provenance, accessibility, and interaction coverage.

## Tasks

### Task 1: Record the current behavior and protect release facts

**Files:** Modify `portal/tests/content-seo-a11y.spec.ts`, `portal/tests/scenes-interaction.spec.ts`, and relevant domain specs; inspect `portal/src/lib/packages/release-manifest.ts` and all current route adapters.

- [ ] Capture a route inventory and current page title, description, canonical, primary landmarks, and important interactive controls for `/`, `/packages`, `/docs`, `/docs/<slug>`, `/guides`, `/changelog`, and `/community`.
- [ ] Add or refine route assertions so later file moves preserve URLs, route content, package release provenance, and key interactions.
- [ ] Run the focused Playwright baseline and record the result before moving modules.

### Task 2: Establish the shared core and English localization runtime

**Files:** Create `portal/src/core/i18n/request.ts`, `portal/src/core/i18n/config.ts`, `portal/src/core/i18n/types.ts`, `portal/src/core/locales/module-registry.ts`, `portal/src/core/locales/en.ts`, and feature `*.en.ts` message modules; modify `portal/package.json`, lockfile, `portal/next.config.ts`, `portal/tsconfig.json`, and `portal/src/app/layout.tsx`.

- [ ] Add `next-intl` and configure the App Router request/provider integration with English as the only active locale, stable unprefixed paths, and locale negotiation disabled.
- [ ] Define a typed message registry and server/client translator access that resolves to a local `t` in each component; never pass translators across server/client boundaries.
- [ ] Add `@core/*` and `@modules/*` aliases and verify client bundles do not import filesystem/server-only modules.
- [ ] Test English `lang="en"`, `dir="ltr"`, unknown locale fallback, message-key typing, and absence of a language switcher.

### Task 3: Move shared visual foundations without changing the design

**Files:** Move `portal/src/styles/tokens.css`, `globals.css`, `portal/src/components/shell/**`, `portal/src/components/motion/**`, and `portal/src/components/hairline/**` to their corresponding `portal/src/core/**` owners; create `portal/src/core/ui/**` and module-boundary tests.

- [ ] Preserve existing rendered markup, CSS values, animation timing, and behavior while changing imports.
- [ ] Implement accessible shared button/input/select/textarea primitives and use them at feature form-control sites; raw native controls remain encapsulated in `core/ui`.
- [ ] Convert shared directional layout declarations to CSS logical properties only where visual comparison confirms identical English rendering.
- [ ] Add checks that feature modules import shared controls through `@core/ui/*` and do not import another module’s private files.

### Task 4: Move package catalog and composer into its feature module

**Files:** Move `portal/src/lib/packages/**` and `portal/src/components/scenes/packages/**` into `portal/src/modules/catalog/packages/**`; modify `portal/src/app/packages/page.tsx` and package provenance tests.

- [ ] Expose one public package-module entry point for normalized package view models, presets, and workspace rendering.
- [ ] Consolidate identity, curated display keys, and explicit release facts into a typed registry validated against discovered projects.
- [ ] Extract all package-page/composer UI labels, helper text, accessible names, and errors into `packages.en.ts`; keep package facts and long content in typed product data.
- [ ] Verify every package, version, framework, NuGet link, preset, filter, copy action, and install-plan interaction matches the baseline.

### Task 5: Move documentation index/article/search into documentation modules

**Files:** Move `portal/src/lib/docs/**`, `portal/src/lib/markdown.ts`, `portal/src/components/scenes/docs/**`, and applicable docs route view code into `portal/src/modules/documentation/{index,article}/**`; modify `portal/src/app/docs/**`, `portal/src/content/docs/**`, and `portal/tests/docs-domain.spec.ts`.

- [ ] Keep Markdown as the source of long-form documentation and preserve every slug, heading anchor, code sample, and search result.
- [ ] Extract documentation UI strings and metadata to feature messages; preserve keyboard search, copy actions, category filters, and accessible names.
- [ ] Verify every Markdown file remains static-build compatible and its search index is generated from the same content repository.

### Task 6: Move guides, changelog, community, and home into feature modules

**Files:** Move `portal/src/lib/{guides,changelog,community}.ts`, their domain folders, and `portal/src/components/scenes/{home,guides,changelog,community}/**` plus `portal/src/components/home/**` into matching `portal/src/modules/**`; modify corresponding `portal/src/app/**` adapters and tests.

- [ ] Expose one public entry point per feature and keep App Router files limited to route parameters, metadata delegation, and feature rendering.
- [ ] Extract interface copy and accessible labels into owning English message modules while keeping product facts and governance data in feature-owned structured content.
- [ ] Preserve home scenes, guide milestones, changelog release ordering and parsing, governance links, commands, animations, responsive behavior, and all existing links.
- [ ] Verify the changelog still derives release entries from the root changelog and does not create duplicate release sources.

### Task 7: Centralize technical SEO and make RTL foundations deliberate

**Files:** Create `portal/src/core/seo/**`; modify route metadata adapters, `portal/src/app/sitemap.ts`, `portal/src/app/robots.ts`, `portal/src/app/layout.tsx`, global tokens/styles, and `portal/tests/content-seo-a11y.spec.ts`.

- [ ] Generate title, description, canonical, Open Graph, and structured data from route metadata and English messages; validate structured data against visible page content.
- [ ] Preserve robots, sitemap, aliases, and current canonical URLs; assert no duplicate `/en` entries and no unsupported structured claims.
- [ ] Define locale direction and logical-property rules for future `ar` RTL rendering; test a non-public RTL fixture or isolated layout story without enabling Arabic routes or a switcher.
- [ ] Verify the built HTML contains crawlable package/documentation facts, semantic headings, descriptive internal links, and correct metadata.

### Task 8: Enforce copy, boundaries, and complete portal verification

**Files:** Create `portal/scripts/check-localization.mjs` and `portal/scripts/check-module-boundaries.mjs`; modify `portal/package.json`, `portal/tests/**`, and `portal/MAINTAINER_GUIDE.md`.

- [ ] Add automated checks for missing translation keys, English dictionary coverage, hardcoded visible JSX copy/accessible labels, forbidden cross-module private imports, and stale package-release entries.
- [ ] Document where route features, shared UI, messages, content, repositories, and future HTTP adapters belong.
- [ ] Run `npm run typecheck`, `npx eslint . --max-warnings 0`, `npm run build`, and `npm run test:e2e` from `portal/`; record exact command outcomes.
- [ ] Inspect representative desktop, mobile, keyboard, reduced-motion, search, package-composer, and RTL-direction states. Fix regressions before declaring completion.
