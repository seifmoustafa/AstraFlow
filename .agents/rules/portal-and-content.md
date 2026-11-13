# Portal Synchronization, Design Preservation, and Content Firewall

These rules govern the Next.js 16 developer web portal under `portal/` and its synchronization with the AstraFlow `.NET` library suite.

## 1. Mandatory Version & Feature Lockstep

- Every AstraFlow version bump, new package, public API change, CLI/analyzer capability addition, or release update **MUST** synchronize `portal/` in the same task.
- Keep these portal source-of-truth modules and product guides aligned with `Directory.Build.props`, `src/*/*.csproj`, shipped C# contracts, and `CHANGELOG.md`:
  - `portal/src/lib/site-config.ts`
  - `portal/src/lib/packages.ts`
  - `portal/src/content/docs/*.md`
  - `portal/src/lib/guides.ts`
  - `portal/src/lib/changelog.ts`
  - `portal/src/content/ui-copy.ts`
- Follow `.agents/skills/portal-maintenance/SKILL.md` whenever synchronizing portal data or documentation, and run the portal verification suite (`npm run typecheck`, `npx eslint . --max-warnings 0`, `npm run build`, `npm run test:e2e`) before completion.

## 2. Warm Forest Design & Structure Preservation

- Preserve the locked single **Warm Forest** (`warm-forest`) design system across all portal routes (`/`, `/packages`, `/docs`, `/docs/[...slug]`, `/guides`, `/changelog`, `/community`):
  - Warm Ivory paper (`#f7f3eb`, raised `#fffdf7`, sand `#ece5d9`, border `#d8d0c2`)
  - Deep Forest ink and surfaces (`#082c26`, `#2f5b4e`, `#0a342b`, `#051e19`)
  - Signal Orange (`#f25e3b`), Terracotta Action (`#b73921`), Peach (`#ffd2bd`), Muted (`#617267`)
- Keep `html[lang="en"][dir="ltr"][data-theme="warm-forest"]` and `color-scheme: light`. Never convert ivory page backgrounds or route heroes to dark surfaces, never add theme/dark-light or language toggles, and never introduce cyan or electric-blue accents.
- Preserve the existing shell (`SiteHeader`, `SiteFooter`, canonical `/brand/mark-on-light.svg` and `/brand/mark-on-dark.svg` logos), heading hierarchy, responsive grids, WCAG 2.2 AA color contrast, and `prefers-reduced-motion` behavior.

## 3. Mandatory Collaborative Brainstorming Gate

- Whenever a task requires adding a **new portal component**, adding a **new section**, changing a **route layout**, or introducing a **UX enhancement** in `portal/`, you **MUST** first invoke `/using-superpowers` and `/brainstorming` with the user to align on design intent, structure, and trade-offs before editing or creating UI components.
- Routine factual synchronization of versions, package entries, markdown guide text, guide milestones, changelog items, or UI counts within the existing portal design does not bypass existing layout rules and still requires full portal verification.

## 4. Product-Only Content Firewall

- The `portal/` application strictly documents AstraFlow's clean `.NET` developer experience, package suite, and shipped public APIs.
- **NEVER** expose internal repository governance, planning, or maintainer-process artifacts anywhere inside `portal/` (data loaders, markdown guides, UI copy, changelog views, or rendered HTML):
  - Never expose `docs/adr/`, `ADR-0001..0003`, `Architecture Decision Record`, `Decision Log`, or `decisions`.
  - Never expose `roadmap`, `future-ideas`, `engineering-blueprint`, `api-governance`, `North Star`, `security-and-supply-chain`, `branch-protection-rollout`, `nuget-publishing`, or `release-verification`.
  - Never expose raw internal diagnostic/analyzer rule IDs (`AFAN*` or `AFD*`, including `AFAN0001..0499`, `AFAN0101`, `AFD*`). Document build-time analyzer and startup diagnostic checks cleanly by developer capability.
  - Never expose historical diary headings or prose artifacts such as `1.8.x` (`1.8.0`–`1.8.3`, `Scope In 1.8.2`) or `1.13.1` (`What It Means In 1.13.1`).
  - Never display internal policing banners or labels such as `"unreleased source"`, `"NOT published on NuGet"`, or `"GitHub unverified"`, and never include internal CI environment scripts such as `$env:DOTNET_CLI_HOME`.
