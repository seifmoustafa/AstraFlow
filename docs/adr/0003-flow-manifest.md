# ADR-0003 — Explainable flow manifest (candidate)

**Status: candidate, not implemented.**

Reuse existing CLI/diagnostics/generator information to emit a deterministic versioned flow manifest (JSON and diff first, not a hosted dashboard). Describe known request-handler registration, behavior order, mapping pair and projection declarations. Each relationship must record provenance and whether it is declared, generated, runtime-observed, potential or unknown.

Do not claim whole-program call-graph precision: runtime conditions, reflection and dependency injection can create links not statically knowable. A missing edge is not proof that an action cannot occur.

Schema rules: stable identifiers; deterministic sort; explicit schema version; no payloads/secrets; clear partial/incomplete marker; snapshot/diff tests and migration rules for schema changes. Investigate using existing `astraflow report`, `diff`, `graph` commands before introducing new CLI commands.

Promotion gate: a useful PR review diff in at least one real consumer and bounded false-positive rate.
