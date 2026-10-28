# Contributing

Thank you for improving AstraFlow.

## Principles

- Keep the core explicit, small, and stable.
- Prefer clear diagnostics over hidden behavior.
- Keep application-specific concepts outside AstraFlow packages.
- Add optional behavior through separate packages when it would make the core less predictable.
- Every public API needs XML documentation.
- Every behavior change needs tests.

## Local Validation

```powershell
$env:DOTNET_CLI_HOME='.dotnet-cli-home'
dotnet restore AstraFlow.slnx --configfile NuGet.Config --disable-parallel
dotnet build AstraFlow.slnx -c Release --no-restore /m:1 /p:UseSharedCompilation=false
dotnet test AstraFlow.slnx -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mediator/AstraFlow.Mediator.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mapper/AstraFlow.Mapper.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow/AstraFlow.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
```

Run these commands from the AstraFlow repository root.

## Pull Request Checklist

- Public API changes are documented.
- Tests cover success and failure paths.
- Error messages are actionable.
- Package build passes with warnings as errors.
- Samples still compile.
- No application-specific abstractions are introduced into package projects.


## Contributing to post-v2 strategy and generated execution

**Proposal status matters:** `Planned`, `Candidate` and `Research` documents do not describe shipped APIs. The [roadmap](docs/roadmap.md) is the canonical release map; the [engineering blueprint](docs/engineering-blueprint.md) and [North Star](docs/strategy/north-star.md) explain why we prioritize certain changes.

For a new generator, analyzer or integration PR, explain:
- Which concrete developer failure or repeated work it removes.
- Why a smaller change to existing runtime packages is insufficient.
- Which public APIs change; supported and unsupported shapes.
- What generated C# or diagnostics will look like in a **clean consumer**.
- Security, DI lifetime, cancellation, compatibility and AOT implications.
- Build-time, runtime, package-size and support/maintenance costs.
- Tests for failure cases and behavior parity, not just happy-path demos.
- Out-of-scope items and the evidence required to extend the feature later.

Read the [generated mapper ADR](docs/adr/0001-generated-mapper.md) and [v2.1 plan](docs/plans/v2.1-generated-mapping.md) before implementing mapper generator behavior. The mediator and flow-manifest ADRs are candidates; they are not permission to implement multiple roadmap versions in one PR.

### Release discipline

Attach exact commands and results for tests/pack/install/API compatibility and source SHA; record benchmark and AOT artifacts if making those claims. Don't assert validation passed without running it. Prefer one primary release outcome, and stop after maintainer review before commencing another version. Optional packages must satisfy the [ecosystem admission policy](docs/strategy/ecosystem-portfolio.md).
