# AstraFlow — v11 Final Execution Contract for Antigravity

> **Authoritative visual reference:** this folder's six HTML pages, `assets/vision.css`, `assets/final.css`, `assets/polish.css`, `assets/vision.js`, `assets/final.js`, `assets/polish.js`, and screenshots in `qa-v11/`. This is an HTML *design reference*, not the final Next.js implementation. Always compare against it in a real browser. **Do not reuse the older v7/v9/v10 output as a replacement.**
>
> **Goal:** build the actual Next.js site, not another concept. Preserve the exact AstraFlow visual vocabulary, page composition, copy unless factually outdated, logo paths, roles of colors, interactive outcomes, motion constraints and source-backed product boundaries. Next.js implementations may improve fidelity, functionality, usability and performance **without creative restyling**.

## 0. Work mode and handoff discipline

1. Read `README.md`, then this contract, then `VISUAL-DELTA-v11.md`, then existing `ANTIGRAVITY-FINAL-PROMPT.md`, `DESIGN-AND-MOTION-CONTRACT.md`, `CONTENT-AND-SEO-CONTRACT.md` and `QA-AND-ACCEPTANCE.md`.
2. Render `index.html`, `packages.html`, `docs.html`, `guides.html`, `changelog.html`, `community.html` at 1440 and 390. Record **baseline screenshots** before changing source. Open `qa-v11/index-full.png` and the other page images. The screenshots are review references but the HTML/CSS/JS state is primary.
3. Implement the selected stack in a clean application workspace. Work in **small route/component slices**: shared header/footer/brand; Home hero, flow and composition; Packages; Docs; Guides; Changelog; Community. Screenshot compare each slice immediately. Don't generate all pages before judging any.
4. After each slice run typecheck, lint, accessibility/keyboard checks and Playwright screenshot diff. Record exact deviations with reasoning; no hidden visual redesign.
5. No need to ask for more visual direction. Decisions are frozen. Ask only for real blocking account/domain/deployment specifics not in the repository.

## 1. Identity and implementation invariants

**Identity:** Warm Ivory for content (`#F7F3EB`), Deep Forest (`#082C26`) for structure and deep instrument surfaces, Vermilion Orange (`#EF6843`) for action/current focus, restrained Peach for secondary labels. 60 / 30 / 10 is a hierarchy/attention guideline **not an enforced screenshot histogram**. Avoid cyan, violet, glossy dashboards, excessive gradients/glows and generic floating cards.

**Exact logo:** All variants **share the same three path `d` values**. Use these source files directly; no synthetic recreation, emoji or font icon:

| Surface | File | Required use |
|---|---|---|
| Ivory/light | `assets/mark-on-light.svg` | Navbar, documentation light surfaces, light-background branch hubs |
| Forest/dark | `assets/mark-on-dark.svg` | Footer, dark code/instrument surfaces and dark social variants |
| Light monochrome | `assets/mark-mono-light.svg` | Strict white-only applications on dark ground |
| Dark monochrome | `assets/mark-mono-dark.svg` | One-ink print usage on light ground |
| Source vector gradients | `assets/mark.svg` and `assets/mark-reversed.svg` | Historical identity references; do not arbitrarily substitute them on wrong surfaces |

Preserve consistent icon optical size. Test on backgrounds at 16/24/32/48/96. **Do not apply `filter: brightness()` to fix a mischosen mark**; select the proper SVG. Footer wordmark must stay Mineral White, and footer tiny subtitle must have readable contrast.

**Page identity, not a template:** Homepage = stationary headline/A + one traveling signal + Flow Explorer + open assembly. Packages = Assembly Bench/composer, Docs = instant find-and-read, Guides = learning runway, Changelog = version folio, Community = four real participation routes. No repeating “heading left + dark rectangle right” across all pages.

**Visual proportions:** Use v11 rendered references as baseline. Spacing and typography should adapt fluidly; avoid absolute-positioning headings. On 320/360/390/768/1024/1440/1920 widths, no clipping or overlaps. RTL future readiness must not cause English layout regressions.

## 2. Direct HTML → React component mapping

| Existing region / selector | Suggested Next component | Logic and acceptance |
|---|---|---|
| `header.site-header`, `.nav`, `.mobile-menu`, `.brand` | `SiteHeader`, `Brand`, `MobileNavigation` | Logo variant always correct. Sticky position; mobile Escape/aria-expanded/focus; `/` active route; no scroll indicator over nav text. |
| `.v10-home-hero`, `.v10-logo-svg`, `#v10-motion-toggle` | `HomeHero`, `SignatureTrace`, `MotionPreferenceControl` | **Only the small signal along the integrated A route moves automatically.** Headline, entire A glyph and canvas stay stationary. Pause, reduced motion, hidden tab, offscreen stop. |
| `.v10-flow-instrument`, `.flow-node`, `#flow-code` | `FlowExplorer`, `FlowStageRail`, `CodePanel` | One state source: capability + stage => title, detail, code, progress. Next/Previous/Restart + keyboard/clear focus; no fake measured trace. Copy code with feedback. |
| `.v10-assembly-controls`, `.v10-assembly-figure` | `AssemblyInstrument` | Three opt-in layers, semantically selectable in DOM, precise overlapping geometry stays on light canvas; selection updates illustration **and** explanatory text. |
| `.overlap-scene`, package selector, `#install-commands` | `PackageAssembly`, `PackageComposer` | Responsive assembly; actual NuGet IDs, tested availability; install plan updates and copies; empty state. |
| `#docs-query`, `.docs-tile`, `.docs-reading` | `DocsSearch`, `DocsIndex`, `DocsLayout`, `DocsArticle` | Searchable source-backed Markdown, keyboard, full article reading, anchors, syntax copy, breadcrumbs, toc; do not leave thumbnail-only Docs. |
| `.timeline-step`, `.guide-detail` | `GuideRunway` | Stage activation changes the step title/explanation and the **correct documentation destination**. |
| `.release-art`, `.release-row`, `.release-toggle` | `ReleaseFolio`, `ReleaseItem` | Full changelog from repository; status labels from verified sources; semantic disclosure; never show unreleased work as published. |
| `.v10-community-branches`, `.v10-branch-item` | `ContributionNetwork` | Four actual links, route highlights on pointer/focus; keyboard and touch independent of illustration. |
| `.footer`, `.footer-in` | `SiteFooter` | `mark-on-dark.svg`, readable wordmark, source URLs and clear link groups. |

### Dependencies: choose selectively, not decoratively

**Baseline:** Next.js 16 App Router + TypeScript + modern CSS variables (Tailwind 4 optional, **not required**). React Server Components for static pages; small client islands only where interaction requires them.

**@lucasmarkes/hairline**: official docs currently show `v0.5.1`, 33 ESM figures, React import path `@lucasmarkes/hairline/react`, and 5 props `intensity`, `theme`, `label`, `onRead`, `play`. Verify latest docs and lockfile before coding. First experiment, on actual application source:

- **Homepage Assembly**: `Exploded` or `Stack` may be a base, but their generic figures **do not automatically match the selected 3-plate AstraFlow shape**. Compare to the SVG in v11; if fidelity suffers, keep the custom SVG or create a **custom Hairline figure** through `hairline-adopt`/`hairline-create` upstream skill. Do **not** just paste a default Exploded figure.
- **Packages**: `Rebuild` or `Stack` can demonstrate compositional dependencies; interactions must remain linked to real selected package IDs and accessible HTML buttons.
- **Community**: `Hub` or `Relay` is a possible structural reference, but keep exactly four real paths and branch focus semantics. Preserve the open canvas. No fake nodes.
- **Changelog**: use `Branches` only if mapping commits is genuinely accurate; **do not infer release dates/branch topology** from a pretty animation. The editorial version folio might need no Hairline at all.

Hairline theme on *light surfaces* (set on the component container, not globally and not via `theme="dark"` accidentally):

```css
.hairline-ivory {
  --hairline-plate: #F7F3EB; /* crucial: same as page surface */
  --hairline-hi: #082C26;
  --hairline-edge: #62766B;
  --hairline-mid: #92A69A;
  --hairline-lo: #D6D3C8;
  --hairline-stroke: 0.9;
}
```

Example (confirm API against installed package):

```tsx
import {Exploded} from '@lucasmarkes/hairline/react';

export function AssemblyFigure() {
  return (
    <div className="hairline-ivory" aria-label="Composition illustration">
      <Exploded intensity={0.22} play={false} label="Four architectural layers in an isometric stack" />
    </div>
  );
}
```

**Motion for React:** `motion` for **meaningful** state transitions, `layoutId` only when the same selected entity truly moves between two component states; `useReducedMotion`/`MotionConfig` and proper focus. Keep ambient hero SVG CSS/WAAPI path animation; no infinite React re-renders. For scroll, use native `scroll-behavior:smooth` on user-invoked anchors, `IntersectionObserver` / Motion `whileInView` for subtle one-shot reveals, `useScroll` only where it explains position. Avoid Lenis and scroll hijacking by default. **No GSAP/Three.js/Rive/React Bits/shader kit unless a demonstrated requirement cannot be met by CSS/SVG/Motion.**

**Accessible primitives:** Radix only for genuine dialog/tab/accordion patterns; native buttons, links and `<details>` when sufficient. Avoid installing a visual kit whose default style dilutes the brand. **Fumadocs** may power source/TOC/search if its internal customization allows exact visual fidelity; otherwise use a lean MDX build with the same UX.

## 3. Motion contract with budgets

| Event | Motion | Fallback and restriction |
|---|---|---|
| Hero idle | Single visible orange trace signal, deliberate 17s loop from baseline | Pause/resume, offscreen/hidden stop, reduced-motion static; no A/hero/parallax movement |
| Button hover/press | `translateY(-2px)` / return; subtle shade/focus | Keyboard focus at least equally visible; touch doesn't require hover |
| Lower section entrance | One-time opacity 0.92→1 and 11px→0, 480–580ms | Never hide content when JS is absent; no motion in screenshot LCP/hero |
| Flow stage change | Active step highlight and corresponding progress hairline, <=350ms | Text and code update together, keyboard/touch functional |
| Assembly selection | Isometric selected plate gets restrained elevation, <=500ms | No endless floating, layer meaning in text too |
| Community hover/focus | The targeted connection illuminates once, <=550ms | Four destinations always fully visible without animation |
| Navigation | Native anchor smooth scrolling only | Respect reduced-motion and sticky offset; no inertial scroll hijacker |

Scroll-progress line stays **2px below the header** and is never a primary graphic element. Respect `prefers-reduced-motion`, page visibility and mobile battery; don't attach global pointermove 60fps handlers.

## 4. Content, SEO and route contract

- Paths: `/`, `/packages`, `/docs`, `/docs/[...slug]`, `/guides`, `/changelog`, `/community`; `/packages/[slug]` only when genuinely sourced; 404/not-found.
- Source snapshot is in `source-materials/`; read the current upstream repository and pin a SHA before publishing. Every one of the **61 archived Markdown sources** must be imported or have a documented disposition; preserve existing old release history instead of showing only last 3 versions.
- Distinguish per-package **NuGet publication**, GitHub releases, code/source milestones, draft/unmerged work. Never label v2.3/v2.4 generally published without fresh per-package verification.
- `metadata` / `generateMetadata`, canonical URLs, Open Graph and Twitter, icon files, dynamic/static sitemap and robots, verified JSON-LD **only**. Real domain required for absolute canonical: do not invent one. Semantic H1 and named landmarks, consistent headings, docs MDX source of truth, URL stable links.
- Avoid unsupported performance claims, fabricated GitHub stars, invented testimonials/community or benchmark numbers.
- On real deployment measure **LCP <= 2.5s, INP <= 200ms, CLS <= 0.1** at the field 75th percentile where data exists; Lighthouse alone isn't field data. Don't guarantee search ranking.

## 5. Future infrastructure without UI switches (required)

- **Theme**: one theme `warm-forest` and semantic color/typography/focus tokens. Future theme registry/interface prepared, **no theme toggle**, no dark theme UI, no second palette in current release.
- **Localization**: **English only live**; prepare message dictionaries, typed keys and `html lang`, `dir`, CSS logical properties (`margin-inline-start`, `inset-inline-end`, `border-inline-start`) and tests. `next-intl` can use `localePrefix:'as-needed'`, one registered locale (`en`) and `localeDetection:false` while only English ships; don't create `/ar` or switcher before real translations. When Arabic is later enabled, ensure semantic RTL with code blocks `dir=ltr`, icon direction audits, flipped progression where meaningful and font metrics verified. No hidden mock Arabic public route.
- Keep primitives and APIs simple; no extra DB/microservice/cache service for a static-doc developer site.

## 6. Acceptance and stop conditions

**Implementation gates:** lockfile pinned, `npm ci`, TS typecheck, eslint, production Next build, run real production server on HTTP. **All six pages** plus 61 docs must render with JS enabled and disabled where appropriate. No broken internal links.

**Visual gates:** 320, 360, 390, 768, 1024, 1440, 1920 widths, browser zoom 200%, desktop and mobile; no horizontal overflow/cropped labels, no unexpected blank hero areas, legible wordmark on dark footer, pinned baseline screenshot comparisons **including the entire homepage**. Logo geometry/path hash must match approved SVG. Desktop hero heading and A positions don't move with animation; only the signal progresses.

**Interaction gates:** mouse, keyboard, touch; Esc/menu, selected packages/commands/copy, docs search and TOC, guide selection, changelog disclosures, community link focus route, flow stage/next-prev/code/progress, assembly layer and explanation; empty states and reduced motion.

**Accessibility:** axe + manual WCAG 2.2 AA audit; heading order, contrast, alt where needed, focus visible, `aria-current`, usable skip link, no click-only content. Run real RTL development fixtures and long-string stress test, but English is the only shipped language.

**SEO & real data:** deployed canonical/robots/sitemap/OG, Search Console verification when owner provides access, complete changelog backed by repo, NuGet each package release verified, rendered source docs and tested C# snippets. A prettier screenshot does not constitute a passed content gate.

**Report:** PR/commit, docs source SHA, screenshot before/after per page and full home, installed dependency rationale, test/axe/Lighthouse results, list of all source-vs-production deviations, remaining blockers. Do not claim "100%" or production-ready if a gate fails. No automatic deploy without user's explicit request.

## 7. Final copy-paste execution command

> Implement the attached `AstraFlow-Connected-Polish-v11` as a production-grade **Next.js 16** multi-route website according to `ANTIGRAVITY-FINAL-EXECUTION.md`, using v11 HTML/CSS/JS as the visual/behavioral contract. **Do not redesign**; first reproduce its identity, especially `mark-on-dark.svg` on every dark footer, the single moving signal inside the stationary A, the complete Home composition, and the six distinct page types. Use Hairline deliberately only for visually matched open-page figures or custom adopted figures; Motion for useful shared-state transitions, not ambient clutter. Prepare English-only i18n/RTL and one-theme tokens with no switches. Port all real docs and complete release history from pinned sources; distinguish NuGet-published versions from repo work. Pass build, accessibility, Playwright responsive/interaction, Lighthouse and SEO checks before reporting completion; include screenshots and a deviations ledger. No creative substitutions, fake feature claims, speculative packages or automated deployment.
