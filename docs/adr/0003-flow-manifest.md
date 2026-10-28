# ADR-0003 — Explainable Application-Flow Manifest

**Status: Candidate, not a shipped tool or committed API.** Potential future milestone v2.5.

## Opportunity

AstraFlow has diagnostics, CLI reports/diff/graph output and generator metadata, yet developers may still struggle to answer: *Which handler owns this request? In which order do behaviors run? Why was this DTO member mapped? What changed in this PR?*

The ambitious product is **explainable, reviewable application flow**, not an attractive but misleading full-program call graph.

## Proposed data model

```json
{
  "schemaVersion": "proposal-1",
  "completeness": "partial",
  "producer": {"name": "AstraFlow", "sourceRevision": "<sha>"},
  "nodes": [
    {"id": "request:CreateOrder", "kind": "request"},
    {"id": "handler:CreateOrderHandler", "kind": "handler"}
  ],
  "edges": [
    {
      "from": "request:CreateOrder",
      "to": "handler:CreateOrderHandler",
      "kind": "handledBy",
      "provenance": "declared",
      "confidence": "known"
    }
  ],
  "findings": []
}
```

**Illustration only: no current schema or CLI contract implied.** Exact type identity, canonical IDs and metadata versioning must be specified before implementation. Avoid sensitive user identifiers in node IDs.

### Relationship evidence

| Marker | Meaning | What it does NOT prove |
| --- | --- | --- |
| Declared | Explicit registration or source declaration | That every runtime configuration includes it |
| Generated | Compiler-generated metadata/route | That the route executes on every request |
| Runtime observed | Explicit test/run observation | That all executions take the same path |
| Potential | Static call/reference might participate | That the call is inevitable |
| Unknown / incomplete | Analysis can't verify a relationship | That no relationship exists |

Every edge carries provenance and an explanation. Uncertain and missing data must be visible. A missing edge **never** proves absence of runtime behavior.

## Implementation architecture

1. Reuse existing diagnostics models and CLI `report`/`diff`/`graph` commands where they suffice.
2. Define a stable schema with explicit version, deterministic sort and canonical IDs.
3. Export **known** request/handler registrations, behavior order, mapping pair and projection declarations.
4. Add comparison rules classifying added/removed/changed relationships while suppressing noisy reorder-only changes.
5. Produce machine-readable output and human CI review summaries; SARIF for actionable findings where appropriate.
6. Add mapping-plan member provenance only where the available data actually records it.
7. Consider richer graph views or IDE extensions **after** a useful diff exists for real consumers.

## Security and governance

- No request, DTO, identity token, header, user-specific ID or credentials in the manifest.
- Registration/type names themselves may be sensitive in some environments: publishing artifacts is an explicit user/CI decision.
- CI snapshot reports distinguish analyzer revisions from code changes.
- Schema evolution has explicit backwards-compatibility and diff migration tests.
- A failure to scan part of an app marks the report `partial` rather than giving false confidence.
- The manifest is an **architecture aid**, not proof of authorization or complete runtime coverage.

## Evidence gates

Deterministic output from two identical inputs; stable IDs across innocuous source location changes; safe partial-assembly case; unknown-edge fixture; duplicate-registration finding; redaction negative tests; useful before/after PR diff in one real consumer; bounded false-positive/noise report; no mandatory new hosted dependency.

**Out of scope:** whole-program control-flow certainty, automatic security compliance certification, hosted dashboards, tracing all production payloads, visual design tools before users request them. See [candidate implementation plan](../plans/v2.5-flow-intelligence.md).
