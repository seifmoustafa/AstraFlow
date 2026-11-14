# AstraFlow — Brand & Design System

> **Design-system specification · Version 1.0 (Warm Forest) · 2026-11-14**  
> **Direction:** Warm Forest / **Engineered Clarity**  
> **Status:** Locked Production Baseline. Synchronized with [`portal/src/core/design/tokens.css`](portal/src/core/design/tokens.css), canonical vector mark [`logo-mark-color.svg`](logo-mark-color.svg), [`assets/astraflow-icon.png`](assets/astraflow-icon.png), and the modular Next.js 16 Portal (`portal/`).  
> **Applies to:** AstraFlow's public identity, Next.js 16 Portal (`portal/`), GitHub/NuGet assets, README, and documentation.

---

## 0. Purpose & Source Hierarchy

This specification defines AstraFlow's single **Warm Forest** identity so documentation, package icons, repository banners, and portal surfaces stay coherent without ad-hoc rebranding.

1. **Product truth & release state:** [`README.md`](README.md), [`CHANGELOG.md`](CHANGELOG.md), and [`Directory.Build.props`](Directory.Build.props) are authoritative for versions, target frameworks, and shipped APIs. If any design specimen conflicts with technical documentation, technical documentation wins.
2. **Design tokens & mark:** [`portal/src/core/design/tokens.css`](portal/src/core/design/tokens.css) owns the semantic palette, typography stacks, layout metrics, and motion curves; [`logo-mark-color.svg`](logo-mark-color.svg) and [`portal/public/brand/`](portal/public/brand/) own the geometric symbol.
3. **Portal governance:** [`.agents/rules/portal-and-content.md`](.agents/rules/portal-and-content.md) enforces single-theme Warm Forest preservation, route stability, and the product-only content firewall.
4. **Exploration collages:** Files under [`assets/brand-sheets/`](assets/brand-sheets/) are visual exploration boards only and never override [`logo-mark-color.svg`](logo-mark-color.svg), portal tokens, or product facts.

---

## 1. Brand Positioning & Voice

- **Core idea:** AstraFlow makes .NET application flow explicit, predictable, and inspectable across mediator dispatch, mapping, projections, analyzers, generators, diagnostics, and assertions.
- **Tagline:** `ENGINEERED CLARITY` (`"Control the flow. Make intent explicit."`) — a factual engineering posture, not a benchmark guarantee.
- **Voice:** Calm authority, explicit scope, concrete behavior. Prefer *explicit, typed, inspectable, composable, opt-in, deterministic, safe by default*. Avoid unsupported superlatives such as *magic, zero-cost, fastest, enterprise-grade, AI-powered, 100% AOT compatible* unless scoped benchmark evidence backs the claim.
- **Product-only content firewall:** Never expose internal ADRs, governance logs, roadmap debates, internal diagnostic rule IDs (`AFAN*`/`AFD*` governance shorthand), or diary artifacts inside public portal views (`portal/`).

---

## 2. Canonical Symbol (`logo-mark-color.svg`)

The symbol combines a structural geometric **A** with a single traversing **flow trace** across a subtle three-part silhouette:

- **Dimensions & `viewBox`:** `width="270" height="215" viewBox="0 0 270 215"` (synchronized between [`logo-mark-color.svg`](logo-mark-color.svg) and [`portal/public/brand/mark.svg`](portal/public/brand/mark.svg)).
- **Path 1 — Forest Apex (`url(#forest)` `#19463d -> #092c27 -> #041e1b`):**  
  `M129 7 H173 L222 87 H181 L152 40 L98 129 C92 139 87 143 77 143 H44 Z`
- **Path 2 — Signal Trace (`url(#orange)` `#ffb28d -> #fa7047 -> #ff4927 -> #d93e1d`):**  
  `M30 166 H91 C104 166 111 160 119 148 L137 116 C147 102 157 98 169 98 H230 L249 128 H177 C165 128 160 134 154 144 L132 180 C119 196 107 200 89 200 H10 Z`
- **Path 3 — Terminal Foot (`#0b302a`):**  
  `M199 145 H237 L259 182 H220 Z`

### Context Variants (`portal/public/brand/`)

| File | Surface context | Treatment |
| --- | --- | --- |
| `mark.svg` / `logo-mark-color.svg` | Master full-color gradient mark | Forest gradient + signal orange trace |
| `mark-on-light.svg` | Light paper (`#f7f3eb`, `#fffdf7`) | Flat `#092c27` / `#0b302a` + `#ef6843` |
| `mark-on-dark.svg` | Deep Forest slabs (`#0a342b`, `#051e19`) | Warm Ivory `#fff8ef` / `#f4f0e8` + `#ff865a` |
| `mark-reversed.svg` | Highlighted dark showcases | Paper-to-sage gradient + warm coral gradient |
| `mark-mono-dark.svg` / `mark-mono-light.svg` | Single-color badges & print | Pure `#082c26` / `#fff8ef` silhouette |

Wordmark spelling is always `AstraFlow` (never `ASTRA FLOW`, `ASTRAFLOW`, or `Astra flow`).

---

## 3. Warm Forest Color System (`portal/src/core/design/tokens.css`)

AstraFlow enforces a **single Warm Forest theme** (`html[data-theme="warm-forest"]`, `color-scheme: light`). Deep Forest (`#0a342b`, `#051e19`) is used deliberately inside showcase cards, terminal blocks, and deck panels — never as a toggleable dark mode, and never with cyan (`#72D5DE`) or electric blue accents.

### 3.1 Canonical Tokens

| Token | Hex | Role |
| --- | --- | --- |
| `--paper` | `#f7f3eb` | Primary Warm Ivory page canvas |
| `--paper-raised` (`--paper2`) | `#fffdf7` | Elevated cards, code panels, circular icon backing |
| `--sand` | `#ece5d9` | Secondary bands, tinted table rows |
| `--sand-warm` | `#e9e3d7` | Warm subtle inset backgrounds |
| `--border` / `--line` / `--hairline` | `#d8d0c2` / `#d6d3c8` | Structural dividers and grid rules |
| `--ink` | `#082c26` | Primary headings, ink text, strong borders |
| `--ink-secondary` (`--ink2`) | `#2f5b4e` | Secondary forest labels and accents |
| `--ink-body` | `#465f53` | Standard body prose on Warm Ivory paper |
| `--muted` | `#617267` | Technical metadata, kickers, subtle captions |
| `--forest` | `#0a342b` | Deep Forest surface for cards and stacked plates |
| `--forest-deep` (`--forest0`) | `#051e19` | Deepest showcase backdrop & high-contrast container |
| `--forest-surface` | `#05221c` | Inner panel chrome on dark showcase surfaces |
| `--signal` | `#f25e3b` | Signal Orange hairline traces & graphic indicators |
| `--signal-bright` | `#ef6843` | Bright trace highlight in geometric icons |
| `--action` | `#b73921` | Terracotta Action for text links & solid primary CTA buttons |
| `--peach` / `--peach-soft` | `#ffd2bd` / `#ffc4aa` | Warm editorial highlight on Deep Forest backgrounds |

### 3.2 Verified WCAG 2.2 Contrast Ratios (Solid Colors)

Computed via standard sRGB relative luminance against the exact tokens above:

| Foreground / Background | Ratio | Usage rule |
| --- | ---: | --- |
| `--ink` `#082c26` / `--paper` `#f7f3eb` | **13.57:1** | Primary body/headings (AAA) |
| `--ink` `#082c26` / `--paper-raised` `#fffdf7` | **14.76:1** | Card headings & body copy (AAA) |
| `--ink` `#082c26` / `--sand` `#ece5d9` | **12.00:1** | Secondary band text (AAA) |
| `--ink-secondary` `#2f5b4e` / `--paper` `#f7f3eb` | **6.96:1** | Subheadings & labels (AA/AAA) |
| `--ink-body` `#465f53` / `--paper` `#f7f3eb` | **6.28:1** | Long-form documentation prose (AA) |
| `--muted` `#617267` / `--paper` `#f7f3eb` | **4.62:1** | Metadata & overlines (passes AA `>= 4.5:1`) |
| `--action` `#b73921` / `--paper` `#f7f3eb` | **5.24:1** | Inline links & text actions on paper (AA) |
| `--paper-raised` `#fffdf7` / `--action` `#b73921` | **5.70:1** | Primary CTA button label (AA) |
| `--paper-raised` `#fffdf7` / `--forest` `#0a342b` | **13.41:1** | Text inside Deep Forest cards (AAA) |
| `--paper-raised` `#fffdf7` / `--forest-deep` `#051e19` | **17.12:1** | Headline text on Deep Forest surfaces (AAA) |
| `--peach` `#ffd2bd` / `--forest-deep` `#051e19` | **12.61:1** | Editorial italic emphasis inside dark showcase cards (AAA) |
| `--signal` `#f25e3b` / `--paper` `#f7f3eb` | **2.95:1** | **Fails small text contrast:** restrict `--signal` to isometric paths, rules, dots, and graphic fills — use `--action` `#b73921` for text/links/CTAs. |

---

## 4. Typography, Metrics & Motion

- **Font families (`tokens.css`):**
  - `--font-sans`: `"Inter", "Arial", "Liberation Sans", sans-serif` (`font-synthesis: none`)
  - `--font-serif`: `Georgia, "Times New Roman", serif` (italic accent words in hero headlines, e.g. *clarity.*, *explicit.*)
  - `--font-mono`: `"Courier New", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (versions, commands, TFMs, eyebrow indexes)
- **Layout frame (`tokens.css`):** `--max: 1376px`, `--gutter: clamp(20px, 4.6vw, 78px)` (`22px` below `770px`, `18px` below `450px`), `--header-height: 84px` (`74px` mobile).
- **Motion discipline:** `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`, `--ease-polish: cubic-bezier(0.22, 0.75, 0.19, 1)`, viewport-gated isometric rendering, and strict `@media (prefers-reduced-motion: reduce)` fallbacks.

---

## 5. Portal Architecture & Localization (`portal/`)

The Next.js 16 App Router portal lives in `portal/` with modular feature ownership (`src/core/` + `src/modules/`):

| Route | Module Owner | Purpose |
| --- | --- | --- |
| `/` | `modules/site/home` | Signal architecture hero, flow atlas, exploded stack, details craft |
| `/packages` | `modules/catalog/packages` | 16-package interactive stack composer, loom & directory |
| `/docs` | `modules/documentation/index` | Categorized docs search and entry index |
| `/docs/[...slug]` | `modules/documentation/article` | Static Markdown guide reader & TOC (`portal/src/content/docs/*.md`) |
| `/guides` | `modules/learning/guides` | Step-by-step adoption milestones & kinetic runway |
| `/changelog` | `modules/releases/changelog` | Live `CHANGELOG.md` parser, 6-card `VersionDeck`, filterable `ReleaseFolio` |
| `/community` | `modules/community/contribution` | Contribution workflow, governance links & study guide |

- **Localization readiness (`portal/src/core/i18n/config.ts`):** `en` (`ltr`) is active with unprefixed public URLs (`localePrefix: 'as-needed'`); `ar` (`rtl`) direction utilities are prepared without exposing incomplete Arabic routes or a language switcher.

---

## 6. Repository Asset Layout (`assets/` & `portal/public/`)

```text
logo-mark-color.svg                    # Root Warm Forest canonical vector mark (viewBox 0 0 270 215)
assets/
  astraflow-icon.png                   # 512x512 Warm Forest circular PackageIcon for NuGet / Directory.Build.props
  astraflow-readme.png                 # 2172x724 (3:1) Warm Forest README banner
  astraflow-hero-social.png            # 1672x941 (16:9) GitHub Social Preview banner
  astraflow-hero-plinth.png            # 1774x887 (2:1) Architectural plinth campaign banner
  brand-sheets/                        # 14 composite concept exploration boards (reference only)
portal/public/
  brand/                               # mark.svg, mark-on-light.svg, mark-on-dark.svg, mark-reversed.svg, mono variants
  favicon.svg, favicon.ico, favicon-96x96.png, apple-touch-icon.png, web-app-manifest-192x192.png, web-app-manifest-512x512.png
```

### Channel & Sheet Quality Rules

- **NuGet `PackageIcon` (`assets/astraflow-icon.png`):** Circular `#fffdf7`/`#f7f3eb` medallion with hairline forest ring and centered mark so the icon stays distinct and legible on both light and dark nuget.org / IDE themes.
- **NuGet `README.md` banner (`assets/astraflow-readme.png`):** GitHub renders relative paths (`assets/astraflow-readme.png`); when preparing a NuGet release pack, verify README image URL rules in [`docs/community-release-guide.md`](docs/community-release-guide.md) (NuGet feeds require absolute raw GitHub URLs committed on the target tag/branch).
- **Known exploration caveats in `assets/brand-sheets/`:** Do not publish the composite boards directly: `brand-sheet-toolkit-badges.png` has a `"toolikt"` typo, `brand-sheet-visual-motifs.png` labels `"MediatR"` instead of `"Mediator"`, and `brand-sheet-ui-elements.png` / `brand-sheet-github-and-social-kit.png` show dark-mode toggles outside the single Warm Forest theme policy.

---

## 7. References

- [`Directory.Build.props`](Directory.Build.props) — `<PackageIcon>assets/astraflow-icon.png</PackageIcon>` and `<PackageReadmeFile>README.md</PackageReadmeFile>`
- [`docs/branding.md`](docs/branding.md) — Quick brand tokens & asset links
- [`.agents/rules/portal-and-content.md`](.agents/rules/portal-and-content.md) — Warm Forest design lock & content firewall
- [`portal/MAINTAINER_GUIDE.md`](portal/MAINTAINER_GUIDE.md) — Release & deprecation workflow
- [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) — Contrast & accessibility requirements
