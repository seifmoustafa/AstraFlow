---
name: portal-maintenance
description: Use when updating AstraFlow versions, packages, public APIs, or releases to synchronize portal/ metadata, product docs, guides, changelog, and copy cleanly.
---

# AstraFlow portal maintenance

1. Read `AGENTS.md` and `.agents/rules/portal-and-content.md` before modifying any file under `portal/`.
2. Check whether the change needs new portal UI:
   - If a **new portal component, new section, layout change, or UX enhancement** is needed, STOP and run `/using-superpowers` and `/brainstorming` with the user before writing UI code.
   - If the task is factual synchronization within existing Warm Forest routes and components, proceed directly with the steps below while preserving all design tokens, shell components, and route layouts.
3. Inspect the `.NET` source of truth (`Directory.Build.props`, affected `src/*/*.csproj`, shipped public types/APIs, and `CHANGELOG.md`) to confirm exact package IDs, target frameworks, versions, dependencies, and code examples.
4. Synchronize `portal/` files in lockstep while strictly enforcing the **Product-Only Content Firewall**:
   - `portal/src/lib/site-config.ts`: update `LATEST_PUBLISHED_VERSION`, `LATEST_PUBLISHED_DATE`, `PREVIOUS_PUBLISHED_VERSION`, and canonical links as needed to match `Directory.Build.props` + `CHANGELOG.md`.
   - `portal/src/lib/packages.ts`: add/update package entries, categories, target frameworks, dependencies, composer presets, and install snippets (including `dotnet tool install` for `AstraFlow.Cli` and `PrivateAssets="all"` for `AstraFlow.Analyzers` / `AstraFlow.Generators`), without `"unreleased source"`, `"NOT published on NuGet"`, or `"GitHub unverified"` policing banners. Interactive scenes (`PackagesModuleLoom`, `PackagesStackComposer`, `stack-resolver.ts`) scale automatically from `packages.ts`.
   - `portal/src/content/docs/*.md`: update or add pure `.NET` developer documentation matching shipped C# APIs. Never expose `docs/adr/`, `ADR-0001..0003`, `decisions`, `roadmap`, `engineering-blueprint`, `api-governance`, `security-and-supply-chain`, raw `AFAN*`/`AFD*` rule IDs, `1.8.x`/`1.13.1` historical diary headings, or `$env:DOTNET_CLI_HOME` CI scripts.
   - `portal/src/lib/guides.ts`: align learning milestones, descriptions, and guide links with `portal/src/content/docs/*.md`.
   - `portal/src/lib/changelog.ts`: update release history with clean product-facing release notes and statuses (`published`, `unreleased`, `deprecated`, and substantive `### Deprecated` notes); `VersionDeck` maintains a bounded 6-card sliding window automatically while `ReleaseFolio` indexes every edition and deprecation filter.
   - `portal/src/content/ui-copy.ts`: update any package counts, guide counts, version badges, or shared English copy without adding theme toggles, language switches, or cyan accents.
5. Verify the Warm Forest palette, light `color-scheme`, WCAG 2.2 AA contrast, reduced-motion behavior, and keyboard accessibility remain intact.
6. Run the full portal verification suite from `portal/` after the final edit:
   ```bash
   cd portal && npm run typecheck
   npx eslint . --max-warnings 0
   npm run build
   npm run test:e2e
   ```
7. Report the exact synchronized files, confirmation that the Product-Only Content Firewall holds, and the observed command results.
