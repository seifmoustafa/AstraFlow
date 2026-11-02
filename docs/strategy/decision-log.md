# AstraFlow Decision Log — Explicit Choices and Reopen Conditions

> **Status:** Mixed. Existing invariants and approved implementation decisions are called out explicitly; a table entry is not itself a shipped feature.

| ID | Direction | State | Reason | Reopen condition |
| --- | --- | --- | --- | --- |
| DEC-01 | Aim for an inspectable, performant .NET application-flow ecosystem | Proposed | Clear differentiation from feature-count bundles | Adoption evidence reveals a narrower product |
| DEC-02 | Preserve explicit mapper core and separate opt-in conventions | Existing invariant | Predictable mapping and security review | Major-version compatibility review |
| DEC-03 | Prioritize real executable generated mapping in v2.1 | Proposed | Generated metadata already exists; conversion is a concrete gap | Compiler/DI feasibility or negative performance/build economics |
| DEC-04 | Keep v2.1 first slice statically assignable scalar mappings | Proposed | Proves full vertical slice without runtime semantics ambiguity | Successful first slice and clear user need |
| DEC-05 | Keep v2.2 supply chain and v2.3 API governance commitments | Approved for v2.2 implementation | Preserve roadmap sequencing; v2.2 uses NuGet repository signing, reproducible packages and verifiable GitHub provenance without introducing a long-lived signing key | New evidence shows the maintained workflow cannot verify these controls or imposes disproportionate release risk |
| DEC-06 | Investigate generated mediator dispatch only after baseline audit | Candidate | Registration generation does not imply fast dispatch | Evidence shows runtime optimization sufficient |
| DEC-07 | Flow Intelligence begins with versioned metadata/diffs | Candidate | Useful developer workflow before any dashboard | Consumer trials show diff isn't useful |
| DEC-08 | No claim of universally fastest/fully AOT/enterprise ready without proof | Policy | Protect credibility | Published reproducible evidence scoped to claim |
| DEC-09 | Keep authentication as separate prospective project | Research | Independent threat model, security response and ecosystem | Product viability and ownership demonstrated |
| DEC-10 | Require optional ecosystem package admission gate | Proposed | Prevent dependency leakage and maintenance sprawl | Clear independent adoption demand and owner |
| DEC-11 | Runtime fallback must be explicit in generated-only mode | Proposed | Accurate performance and behavior expectations | New ADR with fully diagnosable mode policy |
| DEC-12 | Existing runtime mediator/mapper stay supported | Existing invariant | Protect migration and dynamic applications | Explicit major release proposal |
| DEC-13 | Use least-privilege, verifiable supply-chain controls for v2.2 | Approved for v2.2 implementation | Use SourceLink and repeat-pack checks; SPDX SBOM and OIDC attestations; NuGet.org repository signatures; keyless signed Git tags; dependency review; and explicit security/release procedures. Do not claim author signing or GitHub Verified GPG status for Sigstore signatures. | A control cannot be reproduced in CI or verification adds secrets or weakens the trust boundary |

## Open decisions requiring actual source review

| Question | Owner | Evidence expected | Must resolve before |
| --- | --- | --- | --- |
| Method attribute vs mapping-pair declaration? | Maintainer | Working prototype, existing-rule fit, public API diff | v2.1 production API |
| Generated-to-`IMapper` adapter? | Mapper maintainer | DI duplicate policy and overhead proof | v2.1 inclusion |
| Sensitive-write compile-visible override model? | Security/mapper | Threat model and negative tests | generated writable member support |
| Analyzer vs generator diagnostic ID ownership? | Tooling | Existing AFAN catalog and package asset audit | diagnostics release |
| Baseline dispatch cost? | Mediator | Profiling and source inspection | mediator candidate promotion |
| Manifest identity/provenance schema? | CLI/diagnostics | Deterministic snapshots and consumer CI diff | flow candidate promotion |
| Package support/TFM lifecycle? | Release owner | Current SDK support policy + consumer matrix | future releases |
| Separate auth feasibility? | Research lead | OpenIddict/ASP.NET Identity comparison, threat model | new repository decision |

## Governance process

1. Record a decision's **problem**, alternatives, measurable gate, compatibility/security impact, and package owner.
2. Keep proposed dates and release slots distinct from implemented/released facts.
3. If evidence invalidates a decision, mark it **Superseded** and link a new ADR; do not erase prior rationale.
4. When promoted, name the exact release, source SHA, tests and public API change.
5. Future package ideas live in the [ecosystem portfolio](ecosystem-portfolio.md) until admitted.

Read with [the blueprint](../engineering-blueprint.md), [roadmap](../roadmap.md) and [evidence policy](evidence-and-gates.md).
