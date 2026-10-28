# Evidence, acceptance gates and claims policy

**Status: proposed policy for roadmap review.**

## Evidence hierarchy
- **Implemented:** complete source and automated tests at an identified SHA.
- **Consumer validated:** clean package install and executable sample outside the repository's internals.
- **Operationally validated:** documented failure/upgrade/security/AOT checks.
- **Competitive claim:** reproducible controlled comparison with public versions, hardware and methodology.
- **Adoption proven:** independent consumer feedback and repeat usage, not download counts alone.

Record **source SHA**, NuGet versions, SDK/runtime/OS/CPU, configuration, raw BenchmarkDotNet artifacts, command results, limits, and known failures. Distinguish source-tree version from published NuGet and GitHub Releases.

## Release gates (each release)
1. Pin main SHA and confirm published package state.
2. Run restore/build/test/pack and clean NuGet consumer verification. Build all documented sample hosts.
3. Review public API baseline and SemVer; document migrations and obsoletions if relevant.
4. Test negative paths: cancellation, nullability, duplicate registrations, concurrency where relevant, security-sensitive writes and diagnostics redaction.
5. Keep integration dependencies out of core; validate supported TFMs and consumer environments.
6. Update docs, examples, changelog, rule catalog/generator snapshots, package metadata and support matrix when applicable.
7. For generator releases: repeat-build deterministic output, incremental edits, diagnosable unsupported shapes, clean consumer and package analyzer assets.
8. For AOT claims: publish **and run** a clean supported AOT consumer; record warnings.
9. For performance claims: manual and previous-runtime baselines, allocation numbers and build overhead; report unfavourable results too.
10. Completion report lists pass/fail, environment, remaining risks and maintainer sign-off. **One primary goal per release.**

## Comparison rules
Compare like-for-like APIs and semantics. Report typed generated calls separately from interface/object dispatch, cold start separately from steady state, and default security/validation overhead. Benchmark mapping: manual, existing AstraFlow, generated AstraFlow, Mapster, Mapperly, AutoMapper. Dispatch: direct handler, existing/generated AstraFlow, and established generated/runtime mediators where comparable. Do not infer a speed win from generated code existing.

## Forbidden public claims without evidence
“fastest”, “production-proven”, “complete replacement”, “enterprise-ready”, “fully AOT-compatible”, “100% secure”, or “drop-in replacement”. Qualified claims must link to their reproducible evidence.
