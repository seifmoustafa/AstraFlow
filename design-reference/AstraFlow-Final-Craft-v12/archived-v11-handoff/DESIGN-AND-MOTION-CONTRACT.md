# AstraFlow v10 — Design + Motion Contract

**Authority:** attached actual HTML and screenshots, not auto-generated mockups. This locks **Warm Ivory / Deep Forest / Vermilion**, not a new brand exploration.

## Visual identity

| Semantic token | Value | Use |
| --- | --- | --- |
| `canvas` | `#F7F3EB` | ~60% visual ground, reading, negative space |
| `surface` | `#FFFDF7` | cards, elevated surfaces, inline code/light panes |
| `subtle` | `#ECE5D9` | quiet join/separation |
| `line` | `#D8D0C2` | hairlines and structural borders |
| `forest` | `#082C26` | ~30% structural contrast, primary typography |
| `forest-deep` | `#051E19` | Flow Lab, footer, console surfaces |
| `signal` | `#F25E3B` | <=~10% emphasis; route signal, selected states, large punctuation |
| `action` | `#B73921` | accessible primary action background with white text |
| `muted` | `#617267` | metadata on paper only when measured contrast passes |

**60/30/10 is a directional balance, not a pixel quota.** Documentation pages can be almost entirely paper; the Flow Lab can be mostly forest. A paragraph is never signal orange simply to fill a percentage. Use color by semantic role.

Logo mark is frozen: three geometric pieces, dark forest / moving Vermilion / light negative space. Do not invent a new logo. Wordmark is AstraFlow. No purple gradients, background planets, glows or monoliths.

## Typography/spacing

- High-quality humanist geometric display sans with strong weights; readable sans for body; professional mono for short technical labels/code. Prefer **self-hosted licensed fonts** with `next/font/local` after verifying licenses. The local HTML uses system fallback and is **not** font approval for production.
- Desktop h1 on Home approx 100–132 CSS px depending on available width; **never let the heading overlap the SVG or cause horizontal scroll**. Interior pages use varied scales depending on task, not one global 90px h1.
- Body 15–18px, line-height ~1.65–1.8; articles 65–75ch max; code independent 12–14px, horizontal scroll within code only.
- 8px spacing base; large rhythm 64/96/128px as composition demands. Do not add huge gaps below an interior page's core action.
- Hairlines are 1 CSS px, used to align or connect, not to outline everything. Borders > shadows. No default card-hover float on every element.
- At a minimum verify 320, 360, 390, 768, 1024, 1440, 1920 CSS px and 200% zoom; allow i18n string growth. Use CSS logical properties for edges and margins. Technical graph and code are **directionally LTR** irrespective of future locale.

## Hero signal: restore and lock

Visual target: `index.html .v10-logo-svg` from v7 SVG and `screenshots/home-hero.png`.

- Geometric **A, wordmark/heading, callouts and page layout are immobile**. User explicitly wants the *signal* to move, not a floating hero.
- The traveling orange/copper **path travels through the A** and toward `RESULT`; one small bright dot plus narrow white/dashed trace conveys progress. No extra continuous ticker.
- Current local version uses native SVG SMIL `animateMotion` plus CSS `stroke-dashoffset` for matching stationary path. In Next, preserve final visual/behavior; Motion can substitute if SMIL compatibility or lifecycle control requires it. Do not introduce full-page parallax.
- Auto loop ~7s; no CLS, no shaking, no moving text or text shadows. Pause on offscreen (IntersectionObserver), hidden tab, explicit Pause button, or `prefers-reduced-motion`. Honor user control when returning onscreen. Screenshot states/keyboard actions must remain legible if JS fails.
- Reference verified `svg.animationsPaused()` changes from `false` to `true` after Pause; paused screenshot frames became pixel-identical after fixing CSS/SMIL coordination.

## Motion budget

| Interaction | Intent | Recommended cadence |
| --- | --- | --- |
| Signal path | Only ambient motion in hero | 7s loop; pause visibility/reduce |
| Navigation underline | Explain focus/current location | 150–180ms opacity/transform |
| Selection in Flow Lab | Confirm active stage and sync code | 180–280ms, no layout jumping |
| Home composition layer | Distinguish selected layer without shifting whole composition | 280–420ms transform + opacity, no idle loop |
| Community branches | Reveal actual Github destination on hover/focus | 180ms stroke emphasis, zero autoplay |
| Docs article heading anchor | Direct link, no flourish | immediate |
| Release disclosure | Reveal full factual entry | 160–250ms height/opacity if accessible |
| Native scroll to anchor | Support orientation | `scroll-behavior:smooth` only for anchor clicks; reduce-motion opt-out |

Avoid scroll hijacking, springy hover on each card, inertia plugins and more than one ambient visual sequence visible at once. Native browser wheel/touch behavior wins. `MotionConfig reducedMotion="user"` for Motion client islands.

## Home after Hero

1. 3 proof strips (no fake metrics), then **one** dark, information-dense Flow Explorer. Scenario buttons actually update stages/copy/code, keyboard and pointer both work. Show explicitly **"guided, not a live runtime trace"**.
2. Open paper **interlocking layer composition** adjacent to semantic layer controls. Do NOT wrap the illustration in a dark box. Current selector changes figure emphasis, explanation and `aria-pressed` state. Port to a real Hairline-inspired figure using `Exploded` or `Stack`, or a custom adapted figure if and only if fidelity cannot be achieved by existing figures.
3. Editorial modular capability section, clear choices and direct packages/quickstart links. No fake install simulator or new package category.

## Hairline actual upstream

Current docs: <https://hairline.lucasmarkes.com/docs> and <https://github.com/lucasmarkes/hairline>.

- `npm i @lucasmarkes/hairline`; named React exports from `@lucasmarkes/hairline/react`, e.g. `Exploded`, `Stack`, `Branches`, `Hub`, `Riffle` (verify installed API before coding).
- `intensity={0.2}` or `0.3`, `play={false}`, `theme="light"`, `label="..."` for desktop paper figures. Upstream v0.5.1 docs specify a 5:4 aspect ratio and CSS custom properties.
- Root theme tokens for paper figure: `--hairline-plate:#F7F3EB`, `--hairline-hi:#082C26`, `--hairline-edge:#6A8879`, `--hairline-mid:#AFC4B4`, `--hairline-lo:#D7DFD3`, `--hairline-stroke:0.9`. Ensure `plate` matches exact actual background surface.
- Provide semantic HTML buttons and `<a>` separately from the decorative figure; selected state must update content even with SVG removed. For pointer-only figure movement, always have focus/click equivalent for essential interactions.
- Do not install/create 33 figures on every route. Home open composition, Packages layered selection and one Community connection diagram are candidates; Docs need not use Hairline at all.
- `npx skills add lucasmarkes/hairline` is optional if supported by the agent environment; the agent should review upstream skill requirements before using `/hairline-create` or `/hairline-adopt`. A skill is not itself an NPM runtime dependency.

## Shared primitives

- **Motion for React (`motion`)** only for stateful selections and structural continuity; use `layoutId` sparingly. Docs: <https://motion.dev/docs/react-layout-animations>.
- **Radix Primitives** for accessible dialog/tabs/accordion when needed; custom styling always.
- Avoid Lenis, GSAP and Three.js initially. Their complexity is not warranted by the actual UI contracts.
- `prefers-reduced-motion`, visible `:focus-visible`, Escape-to-close dialogs, 44px-ish touch targets where practical, truthful aria state, no unlabelled icon controls.

## Fixed theme now; infrastructure for later

**Ship exactly one theme**: `warm-forest`, with semantic CSS tokens scoped under `[data-theme="warm-forest"]`. Prepare token slots for future themes but **do not ship switches**, save preferences, or auto-switch on OS dark mode.

**Ship English only**: one dictionary, Next `lang="en" dir="ltr"`, internal labels extracted to keys, code snippets `dir="ltr"`. Prepare route/direction abstraction for future Arabic and RTL but **do not create `/ar` routes, Arabic content, locale menu or hreflang targets** before translations exist.
