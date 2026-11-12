# ANTIGRAVITY / ASTRAFLOW — EXECUTION MASTER PROMPT

You are implementing the **AstraFlow** .NET open-source package ecosystem website in Next.js App Router. You have the entire attached `AstraFlow-Final-Craft-v12` directory. This is an **implementation and product-correctness task, NOT a creative redesign**.

## Absolute priorities

1. Treat `index.html`, `packages.html`, `docs.html`, `guides.html`, `changelog.html`, `community.html` plus their CSS/SVG assets as the **visual reference**. Preserve visual geometry, typography hierarchy, color ratios/roles, contrast, white space, page-specific hero composition, and all semantic content unless corrected by a verified source or accessibility need. Do not replace UI with generic gradients, cards, animated glows or a template.
2. The Home Hero **A artwork, position, headline and layout DO NOT MOVE**. Only the **orange signal follows its fixed path** (pause/resume; stops offscreen/hidden/reduced-motion). Preserve the original logo geometry and correct light/dark variants.
3. The Home `02 / FOLLOW THE ENGINE` is the highest-priority interactive slice. Replicate the existing state transitions faithfully, then implement a single React source of truth for `capability`, `stage`, code, decision, stage indicator and progress trace. No faux real-time telemetry: the current walkthrough is conceptual.
4. The other five pages retain **distinct** UX: Packages = selectable assembly/package install planner; Docs = genuine searchable reading portal; Guides = learning journey; Changelog = complete evidence-qualified release chronology; Community = 4 real open-source routes. Do not reuse the same giant hero + dark illustration box everywhere.
5. Use `@lucasmarkes/hairline/react` **only when it can faithfully communicate a real interaction**; do not swap the AstraFlow A with a generic Hairline figure. For special shapes, create/adopt a custom figure *after* verifying visual fidelity and maintainability. Use Motion for React for real shared-state transitions, not ambient decoration.
6. The current public site ships **English (LTR) only**, with `warm-forest` theme only. Prepare dictionaries, locale routing, `lang`/`dir`, CSS logical properties and semantic theme tokens. **NO locale or theme switcher** and **NO public Arabic stub page** until content/translations exist.
7. Use repo-backed Docs and full Changelog; pin source commit SHA. Confirm exact package/version status per NuGet package ID. Distinguish source, draft PR, GitHub release and published package; don't fabricate features, timings, GitHub stars, benchmarks or API snippets.
8. Deliver Next.js production build plus TS/eslint/Playwright/axe checks, SSR/SEO metadata and real deployment-based performance audit, before claiming production readiness. Report deviations. Do not silently choose a domain and do not deploy without explicit permission.

## Implementation order (do not skip visual checkpoints)

**Gate A**: create Next.js 16 + TypeScript app, install only needed core dependencies, lockfile. Extract design tokens/logo variants. Implement site chrome + Home Hero + dark Flow Explorer + a single Docs article using the existing HTML as reference. Produce 1440px and 390px screenshot diffs. STOP and fix if hierarchy/geometry diverge.

**Gate B**: packages interactive builder and real package catalog; then Guides, Changelog and Community; complete Docs imported from pinned source. Each page gets its own screenshot and interaction QA, not a generic copied page header.

**Gate C**: replace only agreed conceptual figures with actual Hairline (or custom figure), enable small Motion transitions tied to state, test on mouse/touch/keyboard/reduced motion. Avoid introducing extra dependencies unless they demonstrably solve a blocked requirement.

**Gate D**: metadata/OG/sitemap/robots, source and release verification, responsive/RTL structural fixtures, accessibility/performance budgets, final deploy review. Do not publish automatically.

## Mandatory deliverables

- Next source and lockfile; stable URL structure `/`, `/packages`, `/docs`, `/docs/[...slug]`, `/guides`, `/changelog`, `/community`.
- Full rendered source docs with navigation, search, permalinked headings, code copy, previous/next where applicable, good keyboard support.
- Full repository-backed changelog, correct release labels, source links, and no false publication claims.
- Baseline-to-Next screenshot grid (320/390/768/1024/1440/1920), the complete Home screenshot, actual reduced-motion test, axe and build reports, metadata/SEO check, remaining deviations log.
- Exact component replacement ledger identifying where Hairline and Motion were used, with the problem each dependency solves and any visual differences.

**START NOW with Gate A. Do not brainstorm a new visual direction or regenerate images.** For component and acceptance specifics, read all three accompanying v12 contracts before editing.
