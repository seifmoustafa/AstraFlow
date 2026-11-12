# 01 — BRAND / LAYOUT LOCK (HIGHEST DESIGN AUTHORITY)

## A. LOCKED BRAND TOKENS

Read `reference-v12/assets/vision.css` and its subsequent layering files (`final.css`, `polish.css`, `craft-v12.css`) to recover the **computed** original design. Consolidate into a sane single token system; do not copy cascading override bloat.

Baseline semantic palette as actually present in the approved reference:

```css
:root {
  color-scheme: light;
  --paper: #f7f3eb;
  --paper-raised: #fffdf7;
  --sand: #ece5d9;
  --border: #d8d0c2;
  --ink: #082c26;
  --ink-secondary: #2f5b4e;
  --forest: #0a342b;
  --forest-deep: #051e19;
  --signal: #f25e3b;
  --action: #b73921;
  --peach: #ffd2bd;
  --muted: #617267;
}
```

Color distribution 60/30/10 is an **attention/role heuristic**, not a mandate to fill 30% of every page with dark forest.

**The app exposes ONE AND ONLY ONE theme: `warm-forest`.** The baseline is an IVORY/LIGHT website. Dark Forest is only a section-level surface where the v12 reference intentionally used one (e.g. Flow Explorer, footer, small engineering instruments). Do not convert page backgrounds or internal page heroes to dark. Do not create `dark`, `light`, `ivory`, `theme` toggle UI or demo controls. Set `html` to `lang="en" dir="ltr" data-theme="warm-forest"`, force `color-scheme: light`, and do not respond to system dark-mode by restyling pages. CSS theme TOKENS may be structured for the future, but only one set of values exists now.

**NO NEW CYAN / ELECTRIC BLUE ACCENTS**, including navigation active, focus rings, selected cards, borders, LEDs, or motion particles. The approved signal is orange and the brand text is forest.

## B. LOCKED GEOMETRY, TYPOGRAPHY AND SHELL

- Original AstraFlow A mark SVG paths preserved. Use `mark-on-light.svg` on ivory, `mark-on-dark.svg` on Forest surfaces. Correct wordmark contrast on both surfaces. NEVER apply invert()/brightness() filters to produce a logo variant.
- The visual language is editorial heavy sans for headings, restrained serif italic for emphasis, technical mono for short labels and snippets. Use the reference typography metrics as the visual calibration baseline; no surprise site-wide font swaps or serif/sans inversions.
- Existing approved header/navbar, nav order and wording, content container width, footer, six route identities, major heading hierarchy, page-grid proportions, spacing rhythm and button shapes are baseline locked. Per-scene internals can change, not global shell.
- The Home hero retains left narrative + right authentic A logo on ivory with an orange flowing signal. Preserve its composition, positioning and scale. `A` and headline stationary; only the signal/annotations animate. Never replace the Home hero with a dark section or an AI hero image.
- The other five page heroes retain the approved IVORY backgrounds and overall hero shell. Enhancements can be placed within an isolated hero visual canvas; section-specific internal designs may evolve, not the globally shared page background or heading brand hierarchy.
- Use only surface-appropriate logo variants, orange/nav active styling, accessible text, correct z-index and mobile sizes. Do not obscure the logo or make the wordmark white on ivory.

## C. LOCKED PRODUCT / ROUTING / FUTURE FEATURES

- Existing routes and factual .NET package content must be verified against current repo. No fabricated metrics, releases, code APIs or claims. The old v12 snapshot is not current-release truth.
- One visible language: English. No language switch, `ar` route, placeholder translation, automatic browser-language redirect or RTL production layout yet. Use CSS logical properties and a small English dictionary/text boundary, and keep `lang/dir` explicit for future work.
- One visible theme: warm-forest. No theme switch, media-driven dark mode or extra theme palette. Prepare semantic CSS tokens as minimal extensibility only.
- No marketing claims about a live execution debugger unless the repo proves it exists. Guided demos must be labeled illustrative.
- Preserve documentation readability, accessible navigation, metadata and source mapping.

## D. FORBIDDEN REGRESSIONS / IMMEDIATE STOP

A change is a **FAILURE / MUST FIX BEFORE PROCEEDING** if any of these occur:

1. A route whose baseline Hero was ivory becomes dark/black/navy or newly full-bleed black.
2. Navigation/footer/logo colors change without an approved bug fix. Wordmark disappears into its background.
3. Any language/theme switch appears or `IVORY`/`DARK` control appears.
4. Cyan/blue becomes the primary accent or appears as focus/active treatment.
5. Hero text is clipped, illegible, misaligned, overlaps navigation, or is too large for the viewport.
6. A figure overflows or collides with prose on mobile, text/image breaks during transitions, or entire page width scrolls horizontally.
7. The generated-image artwork is used as a screenshot/background to simulate interactive UI.
8. Placeholder geometric cards are preserved as final when a replacement is required.
9. The user has no way to pause nonessential looping animation or sees motion despite reduced-motion.
10. Decorative interaction obscures real UI content or damages documentation discoverability.

For acceptance, compare actual rendered images to the v12 reference with identical viewport sizes. If the protected shell is visually different, fix it immediately before any additional animation work. Being "more creative" never excuses a locked-zone regression.
