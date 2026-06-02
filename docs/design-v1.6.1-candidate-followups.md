# v1.6.1 Candidate Follow-ups Design Note

Status: `Implemented candidate`.

This note promotes the first `v1.6.x` candidate follow-ups from the roadmap:

- Value transformers if global behavior can be made diagnosable.
- Before-map hooks if diagnostics-visible.
- After-map hooks if diagnostics-visible.

## Scope

`v1.6.1` adds explicit convention-mapping extension points only:

- value transformers registered by type,
- before-map hooks registered per source/destination pair,
- after-map hooks registered per source/destination pair.

No feature is enabled by default. Explicit mapping in `AstraFlow.Mapper` is unchanged.

## Diagnostics

The implementation must report extension-point usage without payload values:

- `AFC014`: a mapped destination member uses a configured value transformer.
- `AFC015`: a mapping pair has a before-map hook.
- `AFC016`: a mapping pair has an after-map hook.

Mapping plans must also expose transformed member decisions as `Transformed` when no higher-priority decision, such as resolver or converter, already describes the member.

## Safety Rules

- Transformers are registered explicitly and apply only to convention mapping.
- Hooks are registered per mapping pair, not globally.
- Diagnostics report resolver, transformer, and hook types or hook presence only; source and destination payload values are never reported.
- Hooks must not run for unregistered mapping pairs.
- Before hooks run after destination construction and before member assignment.
- After hooks run after member assignment.
- Existing destination updates run the same before/after hooks around `MapInto`.

## Tests

`v1.6.1` requires tests for:

- transformed member value and `AFC014`,
- before-map hook order and `AFC015`,
- after-map hook order and `AFC016`,
- hooks around existing-destination update mapping.
