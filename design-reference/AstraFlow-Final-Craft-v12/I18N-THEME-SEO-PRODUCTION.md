# Production architecture, i18n/RTL, themes, SEO, content & QA

## The public release truth contract

* Source of truth: pin a SHA of the actual current `seifmoustafa/AstraFlow` default/release branch and ingest README, docs, CHANGELOG, NuGet metadata. Website snapshot is a visual reference, **not current release proof**.
* Exact published version: validate separately on NuGet for the umbrella `AstraFlow` and each named satellite package. Distinguish source in PR, merged source, GitHub Release, and NuGet publication. In existing source snapshots, 2.3.0 is reported as in-progress; it must not be sold as a generally published package absent verified evidence.
* Complete chronology: read every recorded release from upstream `CHANGELOG.md`, preserving original order and categories; label undated entries accurately instead of generating invented dates. Build-page should fail or alert if release source has changed without regenerated changelog/site updates.
* Docs: all **61 archived Markdown documents** are source candidates. Track file paths, migration status and slug mapping; pages need canonical headings, images/code rendering and search index. Do not leave 61 static files orphaned behind a Docs landing page.
* Content truth: any benchmark/performance metric must have measured methodology and scope. No fake usage/stars/community/social stats, no invented source capabilities such as live runtime tracing.

## i18n and RTL foundations without UI changes

Current production: `en` and `dir=ltr`, **no language selection UI**. Prepare `messages/en.json`, typed keys or validated dictionary shape, locale-aware `Link` routing and `generateStaticParams` only as needed; a `next-intl` setup can use `localePrefix:'as-needed'` and `localeDetection:false` while English is the only locale. Do **not** launch `/ar` before complete, reviewed Arabic content.

Check semantic CSS logical properties (`margin-inline-start`, `padding-inline-end`, `inset-inline-start`, `border-inline-start`, `text-align:start`) instead of hard-coded left/right except for deliberate geometry/technical illustration coordinates. Keep code blocks, C# syntax and command lines `dir=ltr` and isolate bidi tokens. In developer test fixtures (not public routes), switch `<html dir=rtl lang=ar>` and long strings to catch overflow/icon ordering; RTL figures can remain technical direction LTR where semantics demand it.

## Theme foundations without controls

Public theme: one `warm-forest` palette, no theme toggle and no alternate dark mode. Define tokens for paper, forest, orange, neutrals, focus, selected, borders, typography and figure states with role names. Allow future theme registry behind code, with only the existing theme selected. Explicit logo variants: `mark-on-light.svg` on ivory; `mark-on-dark.svg` on forest footer; never CSS invert the brand.

## SEO, metadata and deployment hygiene

* Use server-rendered static routes and articles. Each path gets unique description, single H1, canonical and correct Open Graph/Twitter metadata. Generate OG from approved logo/copy or use verified static asset, no fake screenshots of unfinished capabilities.
* `app/sitemap.ts` and `app/robots.ts` should include canonical domain only when the owner chooses it. When production host is known, verify absolute URLs, trailing slash policy, redirects from old routes, sitemap availability and crawlable docs content.
* Code sample, SEO and docs URLs should be stable and tested under Next production runtime; route 404 and redirects are intentional.
* Structured data only for objectively supported entities; don't invent reviews, testimonials or FAQ claims.
* Pin fonts, eliminate external blocking resources, use sane caching and avoid turning entire Docs into one client component.
* Client-side search must return an accessible empty state, be keyboard friendly and ideally support Cmd/Ctrl+K when it does not interfere with browser shortcuts.

## Definition of done / checkable gates

| Gate | Evidence required |
|---|---|
| Correct SSR content | `.next` production build and HTTP response show important headings and docs content before hydration |
| Type/build/lint | lockfile install; `tsc --noEmit`; ESLint; Next production `build`, not only `next dev` |
| Visual | screenshot baseline diffs for **each page** at 320, 360, 390, 768, 1024, 1440, 1920 and at 200% zoom; full-page Home; no clip/overflow/hidden text |
| Accessible operation | axe automated + manual keyboard/touch audit WCAG 2.2 AA, focus/labels/live regions, skip links, contrast, error and empty states |
| Motion | paused, reduced motion, hidden tab, offscreen, slow machine; no CLS/LCP delays; active state and code always synchronized |
| i18n/RTL prep | test-only RTL and long-string fixture, logical CSS, Bidi isolation in code blocks, *no switchers* in public UI |
| Docs | actual source SHA, path-by-path inventory, all documents rendered/redirected with reason, article TOC/heading anchors, working search |
| Version truth | each claim mapped to source, full changelog and source-vs-published labels, live per-package publication verification |
| SEO | production canonical/OG/robots/sitemap validators, indexable articles, no duplicate titles, Search Console after owner access |
| Performance | production Lighthouse + real Core Web Vitals when traffic exists: LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75; no unfounded Lighthouse guarantee |
| Security/privacy | no untrusted raw HTML from Markdown; trusted MDX pipeline, external links safe, CSP appropriate, no surprise tracking |
| Delivery | PR, commit, dependency explanation, screenshot gallery, test outputs, known deviations, source SHA, launch blockers; **NO automatic deployment** |

*HTML v12 QA does not satisfy the Next.js production gates.*
