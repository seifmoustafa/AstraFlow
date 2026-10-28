# AstraFlow Engineering Validation Matrix

**Status: Proposed reusable gate template.** A green square is earned by recorded evidence, not by document approval.

## Verification dimensions

| Concern | Mapper generator v2.1 | Mediator candidate v2.4 | Flow manifest candidate v2.5 | Optional integrations v3+ |
| --- | --- | --- | --- | --- |
| Deterministic output | Rebuild snapshots + incremental edits | Invoker order/IDs snapshots | Canonical sort and versioned schema | Configuration/documentation snapshots |
| Correct behavior | Same semantics as supported explicit maps | Equal pipeline/exception behavior | Accurate known vs unknown edges | Clear state/consistency semantics |
| Negative cases | Required/null/constructor/unsafe/sensitive | Missing/duplicate/scopes/cancel/dispose | Partial scans/unknown refs/secret exclusion | Concurrency/crash/tenant isolation |
| Public API | Source-level proposal + API baseline | Minimal additive invoker selection | Schema version and compatibility | Provider abstraction ownership |
| Packaging | Analyzer assets + clean consumer | Clean request consumer | CLI/report clean consumer | Package-specific clean consumer |
| AOT | Publish **and run** supported sample | Publish **and run** generated route | No AOT claim unless separately tested | Only when advertised |
| Performance | Runtime + build + binary benchmarks | Direct/runtime/generated parity | Export/diff overhead with large manifests | End-to-end material overhead |
| Diagnostics | Source locations/stable IDs | Dispatch provenance/order | Edge evidence/confidence | Failures without payload values |
| Security | Sensitive writes, no secret logs | No request payload logs | Secret-free manifest; type name exposure documented | Threat model per integration |
| Upgrade | Existing mapping unchanged | Existing mediator unchanged | Schema migrations | Non-leaking optional refs |
| Documentation | Working consumer + limits | Typed vs object dispatch contract | Human interpretation guide | Install/enable/disable examples |

## TFM and host coverage

Use the **currently declared** TFM assets in package projects; do not assume all packages support every TFM. Test with console, ASP.NET Core API, worker, reusable class library, and a shared-contract client where relevant. Validate that a generator packaged as compiler assets works in the consuming build, not only inside the generator test project. Review `netstandard2.0` limitations and supported runtime lifecycle separately.

## Record template for every release gate

```text
Version / source SHA:
Reviewed package artifacts / versions:
SDK and C# language version:
OS / CPU / runtime:
Test command and result:
Consumer sample and result:
AOT publish command, warnings, execute result:
Benchmark reproducibility and raw artifact path:
Public API change classification:
Security/failure cases:
Unresolved limitations / waiver owner:
Reviewer / sign-off:
```

**Gate states:** Not started → In progress → Pass → Blocked → Explicitly waived with owner/expiry (only for non-critical items). A failing sensitive-write or hidden fallback test cannot be waived for a release making secure-generated claims.

See [evidence policy](evidence-and-gates.md) and [v2.1 plan](../plans/v2.1-generated-mapping.md).
