# AstraFlow v11 local QA — scoped evidence

Browser: **Chromium headless via Playwright**, rendering local HTML/CSS/SVG/JS through inline document assembly because this environment blocks direct `file://` and localhost navigation. It validates the layout and JS behavior, but is **not equivalent to HTTP-hosted Next.js E2E, real mobile hardware or production Lighthouse**.

### Completed checks

- Visual: 6 routes × 7 viewport widths (**320**, **360**, **390**, **768**, **1024**, **1440**, **1920**) = **42 viewport/page checks** with no horizontal overflow and no JavaScript page errors in the tested cases.
- Footer/header logo: source attributes checked on all six; consistent `mark-on-dark.svg` on dark footer and `mark-on-light.svg` in header. All share exactly identical path geometry.
- Home: Pause/Resume changes actual stage `data-signal-paused` true/false; selecting stage 3/4 changes the code snippet and yields `--v11-stage-progress:66.67%`; selecting assembly layer 3 sets layer state to 2.
- Docs: searching for `diagnostics` leaves one matching tile; Guides: selected verify step changes title; Changelog: release disclosure expands; Community: hover reveals the corresponding route state.
- Reduced-motion: browser test confirms animated signal pauses and the toggle is disabled when the OS setting requests reduced motion. No-JavaScript: Homepage H1 remains visible.
- Syntax: standalone `polish.js` passed `node --check`.

### Known limitations and gates

- Browsers other than Chromium, reduced-motion real animation evaluation, 200% zoom, screen readers, axe, WCAG contrast calculation, verified C# compilation and production Core Web Vitals remain Next.js port gates.
- CDN/fetched fonts are intentionally not required for the offline prototype; Next should use a pinned, loaded font with visual comparison.
- The local HTML preview only illustrates high-level docs and selected version history; sources must be imported/verified for production.

See `qa-v11/qa.json` for exact browser observations.
