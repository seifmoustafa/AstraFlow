# AstraFlow — content, release truth & SEO contract

## Source material in this handoff

- `source-materials/README-snapshot.md`: user-supplied project README snapshot, says **2.3.0 maintainer-reported current** and **2.4.0 in progress**.
- `source-materials/astra-docs-snapshot-2026-11-10.zip`: **61 original Markdown docs**, plus supporting files. Preserve paths and headings where possible, handle all cross-links and code fences. Do not replace them with generated marketing prose.
- Connected/current repository: `seifmoustafa/AstraFlow` — must be read during the real Next implementation. `CHANGELOG.md`, `Directory.Build.props`, `Directory.Packages.props` (when present), NuGet package metadata and official release tags override guesses.

**Conflicting release status needs explicit verification:** the README snapshot reports 2.3.0 published, but repository `CHANGELOG.md` has been observed to label 2.3.0 in progress. NuGet publication must be verified **per package ID**. Do not show a single claim like “AstraFlow v2.3.0 is available for all packages” without evidence. A GitHub Release, source milestone and NuGet release are distinct.

## Documentation completeness

- Preserve all 61 Markdown source pages, including ADRs, technical articles, version guides, security/readiness docs; don't confuse API baseline `.txt` files with 61 public docs.
- Use Fumadocs MDX/Core **as a source/content pipeline** if it simplifies indexing, TOC and route fidelity; customize UI to AstraFlow's design. Source docs are not automatically polished MDX, so handle Markdown extensions/admonitions carefully.
- Route docs with stable semantic paths `/docs/[...slug]`; generate page metadata, nav, breadcrumbs, TOC and internal headings; search index from actual content.
- Every article has: provenance link to a pinned commit/branch, `Last Updated` only when known, primary heading, readable body, high-contrast code, accessible copy, footnote/alert conventions, previous/next where structurally meaningful.
- Validate C# snippets by compiling at least the quick start and key examples against the **verified** package versions; label illustrative code if it is not a valid drop-in snippet.
- Do not invent a live request tracer, unsupported mapper behavior, unverified analyzer rules, runtime performance figures or sponsored community metrics.

## Changelog pipeline

- Parse **full** `CHANGELOG.md`; make every historical entry accessible by anchor and route. Don't truncate to 2.2, 2.3, 2.4 concept.
- Maintain hard distinctions: **source in development** / **GitHub release** / **verified installable NuGet package**.
- Parse versions/dates from source; do not fabricate release dates or “latest” tags.
- Add a CI step: source changes requiring release notes must update `CHANGELOG.md`. Build warns/fails if version and changelog diverge; keep entire prior history intact. Check links and no empty or duplicate version headings.
- Do not invent a remote API without need; fetch/pin the release data at build time where feasible. A static repo-driven content build is enough unless product requirements change.

## SEO and discoverability (Next.js App Router)

- Production domain must be selected before publishing canonical URLs. In the prototype use relative links and a nonindexable preview; in production generate `metadataBase`, canonical per route, `openGraph` and Twitter summary images, meaningful descriptions, consistent title templates.
- Render headline, packages, docs and changelog content as real server HTML. **Do not put essential content into Canvas/WebGL or client-only animations**.
- `app/sitemap.ts` includes actual public URLs: `/`, `/packages`, published package pages, `/docs`, article slugs, `/guides`, `/changelog`, `/community`; exclude internal previews, obsolete HTML `.html` artifacts and unpublished drafts.
- `app/robots.ts` allows normal public pages and blocks drafts/internal search where needed; run link health, redirects, 404 handling, duplicate canonicals and broken slug checks.
- Use JSON-LD `SoftwareSourceCode` or `SoftwareApplication` only with **verified** name/repository/license/versions; `BreadcrumbList` for docs deep pages and `TechArticle` where facts are available. Do not fabricate aggregate ratings, review counts, star counts or benchmark results.
- Semantic headings: exactly one h1 per route, meaningful h2/h3 hierarchy; accessible links; no empty SSR shell.
- Avoid duplicate page titles, boilerplate metadata and indexable `/en` duplicates. Default locale English URLs remain unprefixed. **No `hreflang` to nonexistent Arabic or other language.**
- Optimize LCP/CLS/INP: avoid large hydrated hero as a client island, use SVG responsive art, limit fonts, subset and self-host, lazy load optional Hairline below fold, reserve dimensions. Verify via Lighthouse/CrUX after deployment; do not claim numeric score now.

## Library references reviewed

- Next 16 `proxy.ts`: <https://nextjs.org/docs/app/getting-started/proxy>
- Next metadata: <https://nextjs.org/docs/app/api-reference/file-conventions/metadata>
- Fumadocs MDX: <https://www.fumadocs.dev/docs/mdx/next>
- next-intl routing: <https://next-intl.dev/docs/routing/configuration> (`localePrefix: 'as-needed'` for future locales, and default URLs stay unprefixed)
