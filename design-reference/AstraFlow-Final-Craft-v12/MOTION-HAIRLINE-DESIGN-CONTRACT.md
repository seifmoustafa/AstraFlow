# Motion, Hairline and interaction specification

## The principle

High-end motion is **feedback about state and relationships**, not constant movement. The user's approved identity is the warm editorial site with a stationary engineering symbol and an orange traveling signal. Keep 60/30/10 as a *guideline for attention allocation*: warm ivory surfaces, deep forest structure, selective orange for action/active flow.

## Motion matrix — target contracts, not empty adjectives

| Interaction | Mobile/desktop behavior | Timing and direction | Reduced motion |
|---|---|---|---|
| Home SVG signal | one small tracer traverses a fixed orange/white routing path, pauses offscreen/hidden or on command | gentle continuous ~7 s SVG path follower (current signal); line dash 17s; static A/headline | tracer and dash stopped, complete path remains legible |
| Hero stage rail | no whole-hero scroll/parallax/scale | fixed geometry | n/a |
| Flow step | active node + thin linked signal track move to actual node; matching C# code, explanation and counter update **synchronously** | 350–550ms ease-out spatial indication; text 100–160ms fade only if no readability issue | instantaneous state update |
| Flow capability | reset stage to 0 or explicit retained policy; semantic selection | 220–350ms active underline or highlight | instant |
| Assembly layer | user-selected physical layer rises, others recede slightly; label changes | 260–450ms spring at low amplitude | instant |
| Package composer | selected module attaches/updates install commands; no invented dependency edges | 220–400ms purposeful shared layout only | instant |
| Guides rail | active step marker transitions to next step and result content | 240–380ms | instant |
| Changelog | details open/reveal; source links stable; optional tiny hover lift | 200–320ms | instant |
| Community | matching Hairline route lights on focus/hover, no idle network motion | 220–450ms | instant |
| Scroll | native anchor smooth; subtle one-shot section enters well below first fold | 10–14px maximum, 350–600ms, alpha .92→1, never hides LCP | instant and native scroll |
| Navigation/controls | consistent hover, focus, pressed | 150–250ms, <=2px lift | instant |

### Hairline v0.5.1 reality check (verify at install)

Official docs: `npm i @lucasmarkes/hairline`, import from `@lucasmarkes/hairline/react`. Current documented figures include `Exploded`, `Stack`, `Rebuild`, `Hub`, `Relay`, `Branches`, `Riffle`. A React figure accepts `intensity`, `theme`, `label`, `onRead`, `play` and `div` attributes. These figures **are not semantically AstraFlow's actual A logo, dependency graph or runtime tracer**. They are visual primitives. Do not auto-replace an authored SVG with a generic figure if that breaks fidelity.

```tsx
import {Exploded} from '@lucasmarkes/hairline/react';

export function HairlineStudy() {
  return <div className="hairline-ivory">
    <Exploded intensity={0.20} play={false}
      label="Interactive exploded composition study" />
  </div>;
}
```

```css
.hairline-ivory {
  --hairline-plate: #F7F3EB;
  --hairline-hi: #082C26;
  --hairline-edge: #62766B;
  --hairline-mid: #92A69A;
  --hairline-lo: #D6D3C8;
  --hairline-stroke: 0.9;
}
```

### Where to use Hairline (and where **not**)

1. **Home Assembly**: preferably **custom adopted Hairline figure** reproducing selected 3-plate visual and selected state. Trial `Exploded`/`Stack` only as a coding reference; they do not preserve the three-layer visual contract out of the box. Keep current custom SVG if needed. Sync accessible real HTML button and figure; figure itself is *not* the only interaction.
2. **Packages Assembly**: `Rebuild` can be an optional supporting figure **only if selection state can map meaningfully**. It should not imply package dependencies absent from the repository. Maintain keyboard-selectable package list and install code outside SVG.
3. **Community**: `Relay`/`Hub` concepts can inform the open branching line, but the actual current four links and layout are approved. A custom Hairline figure is justified only if a verified accessible connection highlighting interaction is easier to maintain than SVG.
4. **Guides**: the journey rail is already simpler and clearer as CSS+HTML. No Hairline by default.
5. **Docs**: do not apply decorative figures to article pages. Optimize reading, TOC and search.
6. **Changelog**: editorial records, not a graph. Do not use `Branches` to imply commit topology unless data is authentic.
7. **Home Hero**: preserve original `v10-logo-svg`, do **not** use an imported Hairline symbol. SVG `<animateMotion>` or Motion path attributes can drive one signal; guard reduced motion/visibility.

Hairline's `--hairline-plate` must match the actual canvas surface because it masks lines behind foreground plates. Verify light vs dark per surface. `intensity` around 0.15–0.30 recommended starting point, not a fixed law; do not turn autoplay on for every figure.

### Motion for React: use only for state-based changes

Preferred package `motion`. Import from `motion/react`. Use `layoutId` when one **same selected entity** moves from component A to B; `AnimatePresence` for mounted/unmounted explanatory content (no persistent flash). Do not use `layout` on SVG geometry; animate SVG path properties directly. Motion's official docs distinguish these behaviors. Keep the number of client islands bounded.

### Avoid by default

Lenis/scroll hijackers, automatic GSAP ScrollTrigger timelines, Rive blobs, Three.js WebGL scenes, 3D globe, custom mouse follower, auto-advancing code tabs, 120fps JS loops, global scroll-driven opacity, oversized shadow blur, multiple indefinite animations, unreadable hover-only content. Add a library only after identifying the **specific** unsolved interaction and documenting why CSS/SVG/Motion is insufficient.

### Quality gates

The hero A/headline bounding boxes remain pixel-stable before/after 10 s. User pause stops the traveling signal. Hidden tab stops it. Prefers-reduced-motion is respected. Focus and pointer produce equivalent selection. Every stage in the Flow Explorer produces a different combination of text+code and active node. No layout thrash due to global `getBoundingClientRect` in scroll handlers. Avoid expensive SVG filters on mobile.
