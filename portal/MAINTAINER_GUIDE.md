# AstraFlow Portal Maintainer Guide

This guide describes the portal's current source layout and release workflow. It is maintainer documentation kept outside the public `src/` and `public/` trees.

## Runtime and release model

The portal is a statically generated Next.js application. Build-time services read repository metadata, package projects, the changelog, and Markdown documentation from the AstraFlow checkout. It does not poll NuGet or GitHub at runtime. Rebuild and redeploy the portal after changing package metadata, public documentation, release notes, or published-version details.

The current English routes remain unprefixed. English is the active locale; the locale configuration defines Arabic as right-to-left for future activation. Do not add a locale switcher until translated copy and RTL behavior are ready to ship.

## Architecture map

### App and shared core

- `src/app/layout.tsx` owns global document metadata and locale messages.
- `src/app/(site)/layout.tsx` composes the shared site shell; route files in this group delegate to feature page components.
- `src/core/config/` owns site identity, canonical URLs, package links, and published-version values.
- `src/core/i18n/` owns locale configuration, routing, and request configuration. `src/core/locales/module-registry.ts` registers feature dictionaries.
- `src/core/shell/` owns shared navigation and footer; `src/core/ui/` owns shared controls.
- `src/core/design/`, `src/core/motion/`, and `src/core/hairline/` own the Warm Forest tokens, motion primitives, and reusable isometric geometry.
- `src/core/server/` and `src/core/content/` own repository-path and safe Markdown utilities.

### Feature ownership

Each feature owns its page composition, view components, data model, services, and locale dictionary. Import another feature through its public `index.ts`; keep shared primitives in `core/` rather than coupling features directly.

| Route | Feature owner | Main data sources |
| --- | --- | --- |
| `/` | `src/modules/site/home/` | `home.en.ts`, shared site config |
| `/packages` | `src/modules/catalog/packages/` | package catalog, release manifest, project metadata, presets, `packages.en.ts` |
| `/docs` and `/docs/[...slug]` | `src/modules/documentation/` | Markdown content, docs catalog/search, `documentation.en.ts` |
| `/guides` | `src/modules/learning/guides/` | technical guide catalog, `guides.en.ts` |
| `/changelog` | `src/modules/releases/changelog/` | `CHANGELOG.md`, release policy/presentation, `changelog.en.ts` |
| `/community` | `src/modules/community/contribution/` | repository source documents, contribution catalog, `community.en.ts` |

Feature copy belongs in its locale dictionary. Keep stable identifiers, URLs, code samples, package IDs, framework versions, and other technical metadata in feature data. Avoid placing display prose in client-side view models.

## Updating package metadata

When a package is added, renamed, deprecated, or changes target frameworks/dependencies:

1. Verify the actual package project and the published NuGet status.
2. Update `src/modules/catalog/packages/data/catalog.ts` for curated display metadata and `data/release-manifest.ts` for package-specific publication state/version/date.
3. Update presets or stack constraints in `data/presets.ts` and `data/stack.ts` only when the package belongs in those plans.
4. Add user-facing package-scene wording to `packages.en.ts` when needed.
5. Update the relevant developer guide and public docs when a shipped API or supported workflow changes.

Do not mark a package published based only on source presence or a planned release. The NuGet state must match actual publication. `PackagesModuleLoom`, `PackagesStackComposer`, and the directory should derive their package list and install output from the shared catalog and manifest.

## Updating published versions and release notes

The authoritative release facts are `Directory.Build.props`, `CHANGELOG.md`, and the package's actual NuGet publication. Keep these values synchronized:

- `src/core/config/site-config.ts`: latest/previous published versions and dates used by the site shell and metadata.
- `src/modules/catalog/packages/data/release-manifest.ts`: per-package publication status and versions.
- `src/modules/releases/changelog/data/`: parsed release model, status policy, and presentation derived from `CHANGELOG.md`.

The release deck uses a bounded featured set; the release folio retains the searchable archive. Add release data through the changelog and policy inputs instead of hardcoding a version into view components.

## Updating documentation and learning guides

- Public articles live in `src/content/docs/*.md`.
- `src/modules/documentation/data/catalog.ts` controls public document order, categories, and URL aliases. Aliases that point at internal terms must resolve to clean product documentation and must never expose those source terms in rendered pages or metadata.
- Search normalization and ranking live in `src/modules/documentation/data/search.ts`; keep server and interactive search behavior aligned.
- `src/modules/learning/guides/data/catalog.ts` stores technical route/code/package references. User-facing milestone, path, and accessibility copy belongs in `guides.en.ts`.

## Locale and RTL readiness

- Add a locale dictionary beside its owning feature, named `<feature>.{locale}.ts`.
- Register the dictionary in `src/core/locales/module-registry.ts` and verify its keys against English.
- UI labels, instructions, empty states, announcements, and ARIA labels must come from `useTranslations()` or `getTranslations()`; data-backed technical identifiers and code examples are not UI copy.
- Use logical CSS properties (`margin-inline`, `padding-block`, `inset-inline`, and logical text alignment) so future Arabic support does not depend on left/right patches.
- Preserve current English URLs and metadata. Arabic direction is preparatory and is not a claim that Arabic copy is ready.

## Product content and visual constraints

- Keep all public portal content focused on AstraFlow packages and their shipped .NET APIs. Do not expose internal planning, governance, or maintainer-only material.
- Preserve the approved Warm Forest palette, light color scheme, shared shell, responsive behavior, reduced-motion support, keyboard interaction, and existing public route set.
- New sections, layout changes, components, or interaction patterns require the repository's collaborative design workflow before implementation.
- Do not use raw HTML form controls where shared `@core/ui` components exist.

## Verification

Run from `portal/` after the final edit:

```powershell
npm run typecheck
npm run lint -- --max-warnings 0
npm run build
npm run test:e2e
```

The browser suite verifies both desktop and mobile routes, metadata and indexing, package provenance, Warm Forest constraints, content firewall, accessibility, keyboard/reduced-motion behavior, and responsive overflow. Report the exact commands and outcomes; a build alone does not prove browser interactions.

Package publishing, git pushes, and external deployments require explicit user authorization.
