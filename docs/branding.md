# Branding & Visual Identity

The canonical design specification for AstraFlow is located at [`design.md`](../design.md) (**The Trace / Engineered Clarity v0.2**).

## Package Icon & Master Mark

- **Approved Vector Mark:** [`logo-mark-color.svg`](../logo-mark-color.svg) (`viewBox="0 0 270 215"`, 3 deliberate geometric paths: mineral white apex, signature ion cyan flow path, and warm copper terminal accent).
- **NuGet & Solution Package Icon:** [`assets/branding/astraflow-icon.png`](../assets/branding/astraflow-icon.png) (512×512 PNG, centered mark on `#0C1420` Midnight Ink canvas with generous breathing margins).
- **Master Export:** [`assets/branding/exports/astraflow-avatar-512.png`](../assets/branding/exports/astraflow-avatar-512.png).
- **Legacy Icon Archive:** [`assets/branding/astraflow-icon-legacy.png`](../assets/branding/astraflow-icon-legacy.png).

## Design System Tokens & Brand Principles

1. **Direction:** *The Trace / Engineered Clarity* — Geometric, deliberate, strongly typographic; no gratuitous sci-fi or arbitrary neon blooms.
2. **Palette Foundation:**
   - `ink.950` (`#0C1420`) — Signature dark canvas and primary ink.
   - `slate.900` (`#172231`) — Raised surface for cards and navigation bars.
   - `mineral.50` (`#F2F1EC`) — Mineral white text and primary shapes.
   - `ion.400` (`#72D5DE`) — Brand signal, line emphasis, and dark-mode interactive focus.
   - `copper.400` (`#D9A477`) — Warm copper editorial accent (< 5% visible area).
   - `light.accent.text` (`#0F6875`) — Accessible teal for light-mode links and focus outlines (WCAG 2.2 AA compliant).
3. **Typography:**
   - Primary UI & Headings: **Instrument Sans** (600–700 weight).
   - Technical Metadata & Code: **IBM Plex Mono**.
   - Arabic Regional Typography: **IBM Plex Sans Arabic** with complete RTL layout support.
4. **Motion Discipline:**
   - Restraint-first transitions (120–220ms ease-out).
   - Strict `prefers-reduced-motion` compliance. Endless pulsing and attention-seeking loops are prohibited by default.
