# Agent guidance ownership

`../AGENTS.md` and this directory are the sole source of truth for AstraFlow agent guidance.

- Put concise, repository-wide behavior and routing in `../AGENTS.md`.
- Put stable, detailed project rules in `rules/` and reusable task workflows in `skills/<skill-name>/SKILL.md`.
- Treat implementation, tests, package metadata, published releases, and user-facing docs as separate evidence. Follow each roadmap/strategy item's status label; future candidates and research are not approved commitments unless explicitly promoted.
- Keep `CODEX.md`, `CLAUDE.md`, `.codex/`, and `.claude/` as short pointers or platform configuration. Never maintain a competing copy of a rule or skill.
- When a rule changes, edit its canonical file first. Search the repository for stale copies and update only pointers/indexes that need to change.
- Add guidance only when it captures a durable AstraFlow constraint or a repeatable workflow. Prefer a focused update over adding overlapping rules.
- Keep guidance consistent with the code, tests, project files, and published package behavior. If documentation conflicts, investigate and correct the actual source rather than silently encoding both versions.

## Layout

- `rules/` contains detailed architecture, coding/API, and verification rules.
- `skills/` contains focused workflows for work that benefits from package-specific procedures. The root `AGENTS.md` is the routing index; each skill description should be narrow enough to select the right workflow.

