# Scene replacement map — what to DELETE and what to DESIGN

The screenshots in the user's latest message are **targets for replacement, not references for pixel-perfect copying**. Validate existing Next.js component paths in the actual working tree; names in this document are conceptual.

| # | Route/surface (from screenshots) | Remove/replace old metaphor | New experience | Meaningful interaction, input + visual result | Technology candidate |
|---|---|---|---|---|---|
| 1 | `/` Home hero A + orange trace | Static 2D poster with one moving dot; do **not** discard logo | **Signal Architecture**: preserved A silhouette, ink-engraved background rules and optical route markers | Signal reaches meaningful nodes on its path, subtle connecting lines acknowledge stage; pause button; no moving title/whole logo | Authored SVG + WAAPI/Motion; canonical SVG kept |
| 2 | `/` `FOLLOW THE ENGINE` | Boxed dark 3-column app panel and tiny stage buttons | **Living Flow Atlas**: an open path, dramatic connected nodes, context/code inspection sheet anchored to selected node | Stage/capability modifies route, selected physical node, code highlights, counter, explanation; interruptible | React state machine + Motion + SVG; no generic Hairline demo |
| 3 | `/` Home `Every piece has a purpose` | Existing three overlapping flat rhombi and selection list | **Exploded Architecture**: one tactile, connected precision assembly that can be disassembled | Pointer/focus selects plate; plate rises, adjoining constraints flex, material depth and annotation change, settles | `/hairline-create` original study -> custom React SVG/Motion scene |
| 4 | `/packages` first-fold hero | Three static rotated plates labeled CONTRACTS / MEDIATOR / MAPPER | **Module Loom**: sophisticated asymmetric tool-like modules slide along rails and interlock with one device | Hover previews adoption; click selects module/focus; motion follows real geometry; not misleading dependency graph | Hairline design grammar + authored scene |
| 5 | `/packages` composer | Static checklist beside dark console | **Stack Assembly Workbench**: chosen modules form a single inspectable object | Add/remove creates/withdraws structural piece; install command updates in the same update; rapid click safe | Motion `layoutId`/`AnimatePresence`, true React state, CSS/SVG |
| 6 | `/docs` home hero | Giant generic heading plus six plain link cards | **Reference Desk**: interactive search index with contextual topic summaries, direct reading entry | Keyboard shortcut opens search, arrow navigation highlights entries, active preview flows into article link | Accessible dialog/search + CSS/Motion |
| 7 | `/guides` hero learning steps | Four square nodes on a straight horizontal line | **Kinetic Learning Rail**: articulated track, tactile junctions, current lesson grown from track | Selecting stage moves marker, active junction exposes details; deep links and keyboard | SVG path + Motion; custom Hairline when useful |
| 8 | `/guides` lower cards | Six inert bordered rectangles | **Journey Chapters**: changing paper-like panels nested into runway | Focus/selection expands exactly relevant learning example with source link | Motion layout + semantic HTML |
| 9 | `/changelog` hero/history | Rotated cards marked 2.2 / 2.3 / in-progress 2.4 | **Living Edition**: editorial folio with release spine and modular document leaves | Select release; sheet unfurls with dates/status/changes, indicators travel along record | Motion + semantic disclosure; custom Hairline figure only if justified |
| 10 | `/community` hero | Center logo surrounded by four small boxed links and thin stems | **Contribution Current**: open branching transport, editorial paths | Move pointer/focus/tap: one path activates, next-action/readout appears, real links usable; no idle chaos | `/hairline-create` original study + SVG/React semantic overlay |
| 11 | `/community` lower section | Three generic equal-height cards | **Open Source Pathways**: integrated stepwise branches anchored to hero | Specific cause/action chain, inline expansion from chosen branch | Motion + semantic HTML/CSS |

## Fidelity boundaries

- **Preserve exactly:** AstraFlow canonical mark geometry, verified product claims, accurate code/release details, site information architecture unless usability evidence warrants a route refinement, semantic HTML and accessible control intent.
- **Change aggressively:** current scene geometry, placeholder cards, list/canvas composition, state transitions, relative placement of diagrams, optical density, illustration material, hover/focus behavior, section transitions, bespoke figure architecture.
- **Improve carefully:** headline typography / hierarchy without changing brand voice, contrast, spacing, Orange visual emphasis, font rendering, responsive composition.
- **Do not fake:** observed execution timelines, live tracer, package dependency edges, release publication, social metrics.

## Per-component design reviews: six yes/no questions

1. Would someone unfamiliar with the screenshots immediately see a DIFFERENT composition, not a recolored screenshot?
2. Can users cause a meaningful spatial change, beyond hover zoom/glow?
3. Does the physical response teach one product concept or answer a useful question?
4. Can a keyboard-only or touch user access the same result, and is reduced motion usable?
5. Does it have its own identity instead of the same three-card/three-column composition?
6. Does it run smoothly under realistic production conditions with semantic fallback?

If any answer is no, keep refining, not polishing borders.
