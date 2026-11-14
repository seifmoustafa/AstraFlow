# Branding & Visual Identity

The canonical design specification for AstraFlow is [`design.md`](../design.md) (**Warm Forest / Engineered Clarity v1.0**).

## Package Icon & Master Mark

- **Canonical Vector Mark:** [`logo-mark-color.svg`](../logo-mark-color.svg) (`width="270" height="215" viewBox="0 0 270 215"`, Warm Forest gradient apex `#19463d -> #092c27 -> #041e1b`, signal orange trace `#ffb28d -> #fa7047 -> #ff4927 -> #d93e1d`, and `#0b302a` terminal accent; synchronized with [`portal/public/brand/mark.svg`](../portal/public/brand/mark.svg)).
- **Context Mark Variants:** [`portal/public/brand/`](../portal/public/brand/) also ships `mark-on-light.svg`, `mark-on-dark.svg`, `mark-reversed.svg`, `mark-mono-dark.svg`, and `mark-mono-light.svg`.
- **NuGet & Solution Package Icon:** [`assets/astraflow-icon.png`](../assets/astraflow-icon.png) (`512x512` PNG circular Warm Forest medallion, matching [`portal/public/web-app-manifest-512x512.png`](../portal/public/web-app-manifest-512x512.png) so the mark stays crisp on both light and dark NuGet/IDE themes).

## Repository Banners & Concept Archive

- **README Banner:** [`assets/astraflow-readme.png`](../assets/astraflow-readme.png) (`2172x724`, `3:1`) — Primary [`README.md`](../README.md) header banner on warm paper.
- **GitHub Social Preview:** [`assets/astraflow-hero-social.png`](../assets/astraflow-hero-social.png) (`1672x941`, `16:9`) — Headline `"Control the flow. Make intent explicit."` for social sharing and release posts.
- **Architectural Plinth Hero:** [`assets/astraflow-hero-plinth.png`](../assets/astraflow-hero-plinth.png) (`1774x887`, `2:1`) — Wide presentation/slide visual.
- **Exploration Boards Archive:** [`assets/brand-sheets/`](../assets/brand-sheets/) — 14 composite concept collages kept for visual exploration reference only (see [`design.md`](../design.md) for known copy/theme notes before exporting derivatives).

## Warm Forest Palette & Brand Principles

1. **Direction:** *Warm Forest / Engineered Clarity* — Crisp editorial paper warmth paired with deep forest structure and a disciplined terracotta-orange signal trace. Single-theme light-paper system (`color-scheme: light`); do not introduce cyan (`#72D5DE`) accents or dark-mode toggles.
2. **Core Tokens** (canonical CSS custom properties in [`portal/src/core/design/tokens.css`](../portal/src/core/design/tokens.css)):
   - `--paper: #f7f3eb` / `--paper-raised: #fffdf7` / `--sand: #ece5d9` — Warm Ivory paper surfaces and secondary bands.
   - `--border: #d8d0c2` — Hairline borders and structural rules.
   - `--ink: #082c26` / `--ink-secondary: #2f5b4e` / `--ink-body: #465f53` / `--muted: #617267` — Deep Forest inks and metadata hierarchy.
   - `--forest: #0a342b` / `--forest-deep: #051e19` — Deep Forest anchor panels and showcase cards.
   - `--signal: #f25e3b` — Signal Orange for isometric flow lines and graphic emphasis only (never small body text on paper).
   - `--action: #b73921` — Accessible Terracotta Action for text links and primary CTA buttons (`>= 5.2:1` WCAG 2.2 AA contrast).
   - `--peach: #ffd2bd` — Soft warm highlight on deep-forest surfaces.
3. **Typography:**
   - Primary UI & Headings: `Inter`, Arial, sans-serif (`.NET` / editorial italic words accented in `Georgia`, serif).
   - Technical Metadata & Code: Monospace tabular numerals and aligned code specimens (`Courier New`, `ui-monospace`, `Consolas`, monospace).
4. **Motion Discipline:**
   - Purposeful, understated easing (`cubic-bezier(0.2, 0.8, 0.2, 1)`), viewport-aware animation hooks, and strict `prefers-reduced-motion` support.
