# AstraFlow v10 — QA record and final Next acceptance gates

## Test scope actually executed on this local HTML

**Chromium locally via headless Playwright**, resources inlined into the browser document because this sandbox blocks navigation to `file://` and localhost. The user can unzip and run the actual `*.html` files locally; this verifies the same HTML/CSS/JS, not an HTTP deployment.

- Routes: `/index.html`, `/packages.html`, `/docs.html`, `/guides.html`, `/changelog.html`, `/community.html`.
- Viewports: **320×780**, **360×800**, **390×844**, **768×1024**, **1024×768**, **1440×900**, **1920×1080** — **42 page/viewport renders**, zero `pageerror` exceptions and zero document horizontal overflow in those cases.
- Functional spot checks: Home scenario switch to Mapping; Next stage update; Home architecture layer selection; hero pause/resume state; Packages selection updates installation text; Docs local filter; Changelog disclosure; Mobile nav; Community 4 destination links.
- Hero animation: local test `svg.animationsPaused()` yielded `false` playing and `true` paused; **two paused screenshots separated by 750ms were pixel-identical** after coordinating CSS dash and SVG SMIL pauses; produced `screenshots/HERO-SIGNAL-MOTION.gif` from timed Chromium snapshots.
- `prefers-reduced-motion:reduce`: Pause control disabled and SVG paused; no simulated performance/timing claims.
- The four inner concept HTML routes from v9 were deliberately preserved (not redesigned) to avoid introducing a fresh set of user-rejected patterns.

**Not tested / not yet complete:** actual Next.js, upstream Hairline runtime components, full 61 Markdown article render, production SEO, installed NuGet version verification, compiled C# samples, real Lighthouse/CWV, complete a11y audit, real Arabic translations, cross-browser iOS/safari touch checks. Do **not** call this production-ready.

## Acceptance matrix for Antigravity

| Gate | Passing result | Blocker if not met |
| --- | --- | --- |
| Visual source | Home complete full-page screenshot + 5 inner pages match the supplied composition at 1440 & 390 | One generic hero layout reused, arbitrary redesigned art |
| Hero route | Real SVG signal follows inside A; logo/text stationary; pauses on control/offscreen/reduced motion | Whole hero bobs; signal replaced with flat horizontal squiggle |
| Flow Lab | Scenario and stage update nodes, code, description and ARIA synchronously | Only decorative animation, invented tracer claim |
| Interlocking art | Actual Hairline or approved adapted figure integrated *on paper* + semantic layer buttons | Three generic dark cards inside a dark rectangle |
| Community map | Four real destinations, focus/hover branch highlight, no fake links | Logo in one black/green box or fake community metrics |
| Docs & release | 61 source Markdown docs plus full real changelog; NuGet claims verified | Placeholder docs, lost history, unverifiable published badge |
| SEO | Metadata, canonical, OG, sitemap, robots, verified JSON-LD, crawlable SSR, no duplicate default locale | SEO only in client JS or empty metadata |
| Themes & i18n | `warm-forest` + English only; future message keys/dir readiness; no toggles | Premature menu, wrong RTL mirror of code/logo |
| Responsive | 320–1920, touch, zoom 200%, no clipping | Broken 320 screen or sticky header hides heading |
| Accessibility | Headings, keyboard focus, contrast, reduced motion, controls and semantics tested | Focus traps, moving essential text, false aria states |
| Deployment | Verified Next production build on real HTTP with Playwright and Lighthouse | Screenshot-only and unsupported “production ready” declaration |

## Proof screenshots

- `screenshots/home-full.png`: entire homepage with all sections
- `screenshots/home-hero.png`, `home-flow.png`, `home-assembly.png`, `home-modules.png`: isolated compositions
- `screenshots/community-hero.png`: new community first fold
- `screenshots/index-390.png`, `community-390.png`: mobile
- `screenshots/FINAL-REVIEW.jpg`: key-stage review collage
- `screenshots/HERO-SIGNAL-MOTION.gif`: **actual screenshot frames over time**
- `screenshots/qa.json`: per-route basic checks

## Reproducibility

`python qa_run.py` requires Playwright + Chromium (`/usr/bin/chromium`) and Pillow and generates screenshot QA; browser resources are inlined solely because sandbox Chrome blocks local file navigation. `python motion_check.py` reproduces the signal pause validation/GIF.

Run **real HTTP-hosted Playwright** against the Next app during conversion; don't reuse these HTML-only pass claims as Next pass claims.
