# AstraFlow — verified libraries and adoption rationale (November 2026)

## Primary recommendation — small, focused stack

| Need | Use | What it specifically fixes | Cost/constraint |
|---|---|---|---|
| App, metadata, SSR | **Next.js 16 App Router + TypeScript** | Production routes and server-rendered indexability | Keep client islands limited |
| Theme and layout | **Tailwind CSS v4 + CSS custom properties**, only if preferred | Repeatable tokens, controlled responsive composition | Avoid turning everything into utilities if SVG/art direction gets illegible |
| Engineering figures | **`@lucasmarkes/hairline`** | Isometric pointer-reactive diagrams that integrate into open-page composition | Decorative figure API, not a generic component library; important text remains HTML; no dependency required by package itself |
| Microinteractions | **Motion for React (`motion`)** | Shared layout, selected tabs, modal/stack continuity; `layoutId` for connected components | Don't add it to every link and line; use `MotionConfig reducedMotion="user"` |
| Accessible control primitives | **Radix UI Primitives**, selectively | Dialog/search command palette, Tabs, Accordion, focus/keyboard cases | Skinnable, requires custom visual system; not a page-theme shortcut |
| Docs source and routing | **Fumadocs MDX/Core**, custom site styling | Searchable/indexed Markdown, TOC, code structures, article routing | Don't default to an unrelated full-page Fumadocs visual theme |
| i18n future | **next-intl** (`en` only now) | Future dictionaries, `<html lang/dir>`, adaptable route structure | No locale menu or Arabic content now |
| Visual/E2E QA | **Playwright + axe-core**, screenshot diffs | Rendered comparison, focus, interactions, mobile/RTL | Tests need a real HTTP preview; reports not promises |

## Hairline — verified actual upstream details

- 33 isometric SVG figures, React and DOM APIs; package `@lucasmarkes/hairline`; latest release seen in upstream docs is v0.5.1 (October 14, 2026).
- Install for Next: `npm i @lucasmarkes/hairline`; import names from `@lucasmarkes/hairline/react`, e.g. `Exploded`, `Stack`, `Branches`, `Hub`, `Riffle`, `Patch`, `Query`, `Sieve`, `Relay`, `Terrain`.
- `intensity` in 0..1 and `play` default `false`. Start with `intensity={0.25}` and `play={false}`. Most figures need no autoplay. Upstream supports reduced motion.
- The figure is SVG generated inside a `<div>` at approximately 5:4 ratio. Give the wrapper natural bounds; do not wrap it inside black 3D dashboard cards. Use CSS tokens: `--hairline-plate`, `--hairline-hi`, `--hairline-edge`, `--hairline-mid`, `--hairline-lo`, `--hairline-stroke`.
- `--hairline-plate` must equal background surface to properly occlude geometries. On paper: `#F7F3EB`; on elevated paper: `#FFFDF7`.
- **Adopt the actual skill** (verify available agent execution environment): `npx skills add lucasmarkes/hairline` and study upstream `/hairline-create`. Upstream v0.5.1 also has `hairline-adopt` to turn existing SVG into an upstream-style figure. Do not assume the skills are globally installed.
- Suggested controlled placements: Packages `Exploded`/`Stack`; Guides `Branches` or `Relay`; Changelog `Riffle`; Community `Hub`/`Branches`; one carefully selected Home architecture study. No figure on every tile.
- Inspect the upstream website/README when integrating and use the installed package's actual export names and TypeScript props rather than guessing.

## Motion choices

- **Motion** for stateful components, continuity, and reduced motion: use `layoutId`, `LayoutGroup` and `AnimatePresence` sparingly. Both Motion layout docs and `MotionConfig` are useful.
- **GSAP ScrollTrigger** is a conditional alternative for an intricate, single scroll-linked artwork after a demonstrated need. Do not stack GSAP + Motion + custom RAF + scroll hijacking as a default.
- **No Lenis initially.** Native wheel/touch semantics are preferable until real usability evidence warrants a smooth-scroll layer.
- **No React Three Fiber initially.** SVG, typography, real CSS depth and Hairline cover the actual design; WebGL increases bundle and testing cost.

## Reference links

- Hairline docs: https://hairline.lucasmarkes.com/docs
- Hairline repository & skill: https://github.com/lucasmarkes/hairline
- Motion shared layout: https://motion.dev/docs/react-layout-animations
- Motion reduced motion: https://motion.dev/docs/react-motion-config
- Radix accessible primitives: https://www.radix-ui.com/primitives/docs/overview/accessibility
- Fumadocs MDX: https://www.fumadocs.dev/docs/mdx/next
- Fumadocs Next.js setup: https://www.fumadocs.dev/docs/next/manual-installation
- Next.js internationalization: https://nextjs.org/docs/app/guides/internationalization
- next-intl routing: https://next-intl.dev/docs/routing/configuration
- GSAP ScrollTrigger: https://gsap.com/docs/v3/Plugins/ScrollTrigger/

## Additional references to inspect (not default dependencies)

- **Motion Primitives** — https://motion-primitives.com/docs : practical animated React UI patterns built around Motion/Tailwind. Borrow a *single* shared-element or transition pattern after checking its keyboard, focus and reduced-motion behavior; do not import a full animated kit or override the AstraFlow design.
- **React Bits** — https://reactbits.dev : source-installable visual/motion components. Inspiration or tightly scoped primitives only; generic text-scramble and background effects would damage the brand's calm engineering personality. Check licenses for chosen variants.
- **21st.dev** — https://21st.dev/community/components : a reference gallery/registry for unusual interface transitions and component composition. Use it to study construction and accessibility; avoid copying its generic template skins.
- **Rive** — https://rive.app and https://github.com/rive-app/rive-react : real state-machine-driven vector animation, potentially useful for *one original* sophisticated brand interaction. **Defer**: asset authoring, account/plan, bundle footprint, accessibility, performance and handoff complexity need a proven payoff. The free editor/export arrangements may add a splash screen depending on plan, so verify before public use.

**Engineering decision:** Start Hairline + Motion + headless accessible primitives. Don't ship all five inspiration libraries at once. One coherent visual system with three deliberately engineered moments will outperform a dozen mismatched hover effects.
