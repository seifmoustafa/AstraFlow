# Engineering Evidence, Release Gates & Claims Policy

> **Proposed engineering policy, not certification or proof of existing releases.** This document establishes how AstraFlow earns a quality, performance, security or AOT claim.

## 1. Evidence ladder

| Level | What exists | Public wording permitted |
| --- | --- | --- |
| Research | Idea, competitor research, architecture sketch | “Researching” |
| Proposed | Approved direction with acceptance criteria | “Planned/proposed” |
| Implemented in source | Identified SHA + passing relevant tests | “Implemented on branch/SHA” |
| Consumer validated | Packed NuGet, clean install, executable consumer | “Validated in tested consumer” |
| Operationally validated | Failure/security/upgrade/AOT tests and documented limits | Qualified supported scenarios |
| Benchmark-verified | Reproducible equal-workload measurements | Scoped comparative numbers with environment |
| Adoption validated | Independent pilot users, repeat usage and issues | Carefully evidenced real-world usage |

A version number in repository source **does not** establish NuGet publication, tag availability or real-world production adoption.

## 2. Release gate matrix

| Gate | Evidence required | Blocker |
| --- | --- | --- |
| G0 Baseline | Source SHA, SDK, package/channel versions, current failures | Unmeasured baseline |
| G1 Correctness | Release build + appropriate complete tests and negative cases | Unexplained failures |
| G2 Packaging | `dotnet pack` + clean NuGet consumer installs by advertised TFM | Unverifiable package |
| G3 API | Public API diff, SemVer classification, obsolete/migration docs | Unapproved break |
| G4 Security | Threat analysis, secret/payload-negative tests, redaction | Silent exposure/bypass |
| G5 Generation | Deterministic snapshots, incremental edits, compiler diagnostics | Nonrepeatable or silent fallback |
| G6 Runtime behavior | Differential equivalence for supported generated/runtime semantics | Changed observable behavior |
| G7 DI lifetime | Scope, disposal, duplicate ownership, concurrent instances | Captive/disposed handler or silent override |
| G8 AOT, when promised | Clean publish **and execute**, warning review | Unresolved dynamic dependency |
| G9 Benchmark, when claimed | Equal workload, raw data, environment and build cost | Cherry-picked comparison |
| G10 Docs/migration | Compiling examples, migration/limitations and changelog | Unsupported instructions |
| G11 Supply chain | SourceLink/SBOM/provenance/signing where introduced | Unsupported enterprise claims |
| G12 Maintainer | Owner approval, change log, risks, release artifacts | Missing accountability |

Docs-only PRs apply link consistency, source-status accuracy, markdown structure and non-contradiction checks. They do not magically satisfy build, AOT, runtime or performance gates.

## 3. Required release evidence artifact

Use a versioned document (or release artifact) recording:
- repository SHA and changes since last release;
- NuGet/GitHub-release/source version *as three independent statuses*;
- SDK, OS, CPU, runtime, compiler, target frameworks and commands;
- build/test/pack/install/sample result table, failures and exclusions;
- API additions/deprecations and migration notes;
- diagnostics IDs and new security-sensitive scenarios;
- benchmark raw artifact links plus workload and setup reproducibility;
- AOT publish/run commands, warnings and actual execution result;
- reviewer sign-off and any narrowly-scoped waivers with expiration.

No “all tests passed” without recorded command output from a complete checkout.

## 4. Fair performance specification

**Mapper:** manual baseline; existing AstraFlow explicit; opted-in conventions; generated typed call; generated `IMapper` adapter only if implemented; AutoMapper, Mapster, Mapperly where semantics and versions are comparable.

**Mediator:** direct handler call; existing runtime AstraFlow; generated dispatch if implemented; established runtime/generated mediator variants. Keep registration/pipeline depth, exception behavior, DI scope and compiler/runtime identical where possible.

Report startup/cold vs warmed, median/mean and distribution where relevant, allocations, GC, throughput, build time (clean/incremental), binary size, AOT/trimming behavior, hardware, OS, SDK, package versions and confidence limitations. Reproduce runs; publish unfavorable cases. Avoid misleading comparisons between generated typed calls and interface-based runtime dispatch.

## 5. Security review checklist

- No secret, request payload, mapped DTO values, access token or connection string in diagnostic messages, telemetry, generated plans or benchmark artifacts by default.
- Classifiers based on member names are **heuristics**, not a complete security or authorization proof.
- Sensitive read DTO and sensitive domain write paths evaluated separately.
- Generated code must not bypass explicit allow policies, nor silently assume runtime policies are compile-time verified.
- Tenant isolation checked for caching/idempotency candidates, and replay/race behavior for transactional adapters.
- An explicit waiver must identify the risk, affected path, owner and review date.

## 6. Adoption proof template

Test with at least two independent consumer applications of different shapes (e.g. API and worker, not two trivial copies of the same sample). Capture:
- baseline library/approach and feature implemented;
- time to install and first correct mapping/dispatch;
- developer minutes spent on configuration, diagnostics and migration;
- tests/bugs prevented and error messages users found unclear;
- runtime/build cost where material;
- willingness to keep using, obstacles and prioritized missing APIs.

Do **not** equate package download totals or stars with production use.

## 7. Decision rule

A performance optimization is rejected or narrowed if it worsens supported semantics, makes builds unreasonably expensive, breaks AOT without mitigation, or creates a second fragmented API. A proposed integration is deferred if no owner or real usage. A claim remains qualified until its evidence is published.

See [North Star](north-star.md), [Validation Matrix](validation-matrix.md), [Release Plan](../plans/v2.1-generated-mapping.md).
