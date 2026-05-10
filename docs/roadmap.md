# AstraFlow Product Roadmap

This file is the long-form planning artifact for AstraFlow after the v1 package extraction. It should be used as the starting context for future package work, public repository setup, and the later NEXORA migration from local project references to published NuGet packages.

## Product Positioning

AstraFlow is a MIT-licensed .NET package family for explicit application flow:

- request/response dispatch,
- notification publishing,
- pipeline behaviors,
- source-auditable object mapping,
- declared mapping validation,
- explicit projections,
- secure ID abstraction.

The product direction is not to become a clone of older runtime-magic libraries. AstraFlow should win by being safer, more explicit, easier to audit, easier to validate at startup and build time, and better suited for modular enterprise systems.

## Package Family

### `AstraFlow.Mediator`

Purpose:

- Dispatch one request to one handler.
- Publish one notification to many handlers.
- Run pipeline behaviors around request handlers.
- Provide clear startup and runtime diagnostics.
- Avoid any dependency on application-specific result types, tenants, permissions, validation frameworks, web frameworks, or database frameworks.

Current v1 public concepts:

- `IRequest<TResponse>`
- `IRequestHandler<TRequest, TResponse>`
- `INotification`
- `INotificationHandler<TNotification>`
- `ISender`
- `IPublisher`
- `IMediator`
- `IPipelineBehavior<TRequest, TResponse>`
- `RequestHandlerDelegate<TResponse>`
- `NotificationPublishOptions`
- `NotificationFailurePolicy`
- `MediatorOptions`
- `AddAstraFlowMediator(...)`

### `AstraFlow.Mapper`

Purpose:

- Map objects only through explicit rules.
- Validate declared mapping ownership at startup.
- Map common collection shapes without hidden conventions.
- Register explicit LINQ projections.
- Provide a secure ID abstraction without owning application cryptography.

Current v1 public concepts:

- `IMapper`
- `IObjectMappingRule`
- `IDeclaredObjectMappingRule`
- `ObjectMappingPair`
- `IObjectMappingValidator`
- `MappingOptions`
- `IProjection<TSource, TDestination>`
- `ProjectWith(...)`
- `ISecureIdCodec`
- `SecureIdMapper`
- `AddAstraFlowMapper(...)`

### `AstraFlow`

Purpose:

- Convenience package that references mediator and mapper.
- Provides `AddAstraFlow(...)`.
- Adds no hidden runtime behavior by default.

### `AstraFlow.Diagnostics`

Purpose:

- Report registered request handlers.
- Report registered notification handlers.
- Report registered pipeline behaviors.
- Report registered mapping rules.
- Report registered projections.
- Produce stable findings with severity and diagnostic codes.
- Render reports as in-memory objects, JSON, or Markdown.
- Provide a summary object that can be used by health-check-style code without depending on ASP.NET Core.

Current v1.1 public concepts:

- `IAstraFlowDiagnosticsReporter`
- `AstraFlowDiagnosticsOptions`
- `AstraFlowDiagnosticReport`
- `AstraFlowDiagnosticsSummary`
- `AstraFlowDiagnosticFinding`
- `AstraFlowDiagnosticRegistration`
- `DiagnosticSeverity`
- `AddAstraFlowDiagnostics(...)`

## v1 Status

v1 is the stable explicit core. The implementation is intentionally focused and production-oriented.

### v1 Mediator Features

- Request/response dispatch.
- Exactly one request handler per request type.
- Clear error for missing request handlers.
- Clear error for duplicate request handlers.
- Sequential notification publishing by default.
- Configurable notification failure policies:
  - `FailFast`
  - `Continue`
  - `Aggregate`
- Pipeline behaviors in registration order.
- Behavior short-circuiting.
- Assembly scanning from marker types.
- Optional request handler coverage validation.
- Scoped dispatcher registration by default.
- Package tests for dispatch, missing handlers, duplicate handlers, pipeline order, short-circuiting, and notification behavior.

### v1 Mapper Features

- Explicit rule-based mapping.
- Declared mapping pairs.
- Startup validation.
- Duplicate mapping pair detection.
- Undeclared rule detection in strict mode.
- Single object mapping.
- Null source mapping.
- Collection mapping for common collection shapes.
- Explicit projection registration and execution.
- Secure ID codec abstraction.
- Secure ID helper service.
- Clear errors for missing mappings and duplicate mappings.
- Package tests for mapping, validation, collection handling, projection handling, and secure ID behavior.

### v1 Package Quality

- MIT license.
- NuGet metadata.
- XML documentation for public APIs.
- Nullable reference types.
- Warnings treated seriously.
- README files included in packages.
- Symbol package generation.
- CI workflow.
- Gated publish workflow.
- Security policy.
- Contributing guide.
- Release checklist.
- Local pack script.
- Samples for mediator, mapper, and ASP.NET Core integration.
- Diagnostics reporting and diagnostics sample.

## v1 Non-Goals

These are deliberately excluded from v1:

- automatic convention mapping,
- automatic flattening,
- reverse-map generation,
- deep graph runtime magic,
- arbitrary runtime SQL projection generation,
- compatibility shims,
- source generators,
- Roslyn analyzers,
- benchmark leadership claims,
- web-framework-specific behavior,
- validation-framework-specific behavior,
- application-specific result types,
- application-specific ID encryption.

Reason:

v1 must first be stable, auditable, secure, and proven in NEXORA. Advanced behavior should be opt-in and separately testable.

## v1.0 Acceptance Gates

Before first public publish:

- `dotnet build packages/AstraFlow/AstraFlow.slnx -c Release` passes.
- `dotnet test packages/AstraFlow/AstraFlow.slnx -c Release` passes.
- `dotnet pack` works for all package projects.
- Generated packages contain DLL, PDB, XML docs, README, LICENSE, and `.nuspec`.
- GitHub Actions CI passes on the public repository.
- Publish workflow requires manual confirmation.
- Trusted Publishing is configured, or a scoped GitHub Actions secret named `NUGET_API_KEY` exists.
- No real secret values exist in source, markdown, workflow YAML, shell history committed to the repository, package artifacts, or screenshots.
- NEXORA builds against the package projects before switching to NuGet.
- NEXORA backend focused tests pass.
- CLI templates generate AstraFlow namespaces.
- Retired package guard remains active in NEXORA.

## v1.0 Publish Steps

1. Finish local verification with `scripts/pack.ps1`.
2. Commit the package repository.
3. Push to the dedicated public repository.
4. Confirm CI passes on `main`.
5. Create tag `v1.0.0`.
6. Run the gated publish workflow.
7. Type `PUBLISH` in the workflow input.
8. Verify all package projects appear on NuGet:
   - `AstraFlow`
   - `AstraFlow.Mediator`
   - `AstraFlow.Mapper`
   - `AstraFlow.Diagnostics`
9. Install each package into a clean sample project.
10. Only then migrate NEXORA from local project references to package references.

## NEXORA Migration After Publish

Do not delete `packages/AstraFlow` from the NEXORA monorepo until the published packages are verified and NEXORA builds against them.

### Step 1: Replace Project References

In NEXORA backend projects that currently reference local AstraFlow projects, replace project references with package references:

```xml
<PackageReference Include="AstraFlow.Mediator" Version="1.1.0" />
<PackageReference Include="AstraFlow.Mapper" Version="1.1.0" />
<PackageReference Include="AstraFlow.Diagnostics" Version="1.1.0" />
```

Use the meta-package only where both are intentionally needed:

```xml
<PackageReference Include="AstraFlow" Version="1.1.0" />
```

### Step 2: Restore And Build

Run:

```powershell
$env:DOTNET_CLI_HOME='C:\tmp\dotnet-cli-home'
dotnet restore NEXORA-Backend/NEXORA-Backend.sln
dotnet build NEXORA-Backend/NEXORA-Backend.sln --no-restore
```

### Step 3: Run Tests

Run focused backend tests first, then the full suite:

```powershell
dotnet test NEXORA-Backend/tests/Core.Application.Tests/Core.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/Identity.Application.Tests/Identity.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/Entitlements.Application.Tests/Entitlements.Application.Tests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/tests/API.IntegrationTests/API.IntegrationTests.csproj -c Release --no-restore
dotnet test NEXORA-Backend/NEXORA-Backend.sln -c Release --no-restore
```

### Step 4: Scan For Local Coupling

Verify NEXORA does not depend on package source folders:

```powershell
rg -n "packages/AstraFlow|AstraFlow.Mediator.csproj|AstraFlow.Mapper.csproj|AstraFlow.csproj" NEXORA-Backend
```

Verify retired package families are still blocked:

```powershell
rg -n "<retired-package-namespace>|<retired-package-reference>" NEXORA-Backend tools/nexora-cli -g "*.cs" -g "*.csproj" -g "*.ts" -g "*.hbs"
```

Any match must be either an intentional guard message, an architectural scanner warning, or release documentation.

### Step 5: Delete Local Package Folder

Only after restore, build, tests, and scans pass:

```powershell
Remove-Item -LiteralPath .\packages\AstraFlow -Recurse -Force
```

If `packages/` becomes empty, remove it too:

```powershell
Remove-Item -LiteralPath .\packages -Force
```

### Step 6: Commit NEXORA Package Migration

Commit NEXORA separately from the package repository:

```powershell
git add NEXORA-Backend tools NEXORA-Frontend
git commit -m "Use published AstraFlow packages"
```

## v1.0.1 Roadmap: Patch Hardening

Goal:

Ship a SemVer-safe patch release before new packages are added.

Features:

- reject request types that implement multiple `IRequest<TResponse>` contracts with a clear diagnostic,
- keep object-based and generic request dispatch behavior covered by tests,
- tolerate null mediator marker types during registration,
- throw `ArgumentNullException` for null mediator service collections,
- tolerate partially loadable assemblies during mediator scanning,
- clarify `MediatorOptions` documentation without adding a new options API,
- document the `net10.0` target and Microsoft support window.

Acceptance gates:

- no breaking public API changes,
- Release build passes,
- package tests pass,
- all three packages pack as version `1.0.1`,
- package artifacts contain README, LICENSE, icon, XML docs, DLL, PDB, `.nuspec`, `.nupkg`, and `.snupkg`.

## v1.1 Roadmap: Diagnostics And Production Ergonomics

Goal:

Make operational failures easier to understand before adding advanced mapping or generation.

Status:

Implemented in `AstraFlow.Diagnostics` v1.1.0.

Planned package:

- `AstraFlow.Diagnostics`

Features:

- startup report of request handlers,
- startup report of notification handlers,
- startup report of pipeline behaviors by closed request type,
- startup report of mapping rules,
- startup report of projections,
- duplicate registration report,
- missing handler report,
- missing mapping report,
- dependency lifetime report for known unsafe patterns,
- optional JSON diagnostics output,
- optional markdown diagnostics output,
- optional health-check-ready summary object,
- diagnostics severity model:
  - `Info`
  - `Warning`
  - `Error`
  - `Fatal`
- package extension:
  - `services.AddAstraFlowDiagnostics(...)`
- no hard dependency on ASP.NET Core.

Implemented finding codes:

- `AFD000`: registration counts discovered,
- `AFD101`: duplicate request handlers,
- `AFD102`: request type has multiple request contracts,
- `AFD103`: scanned request type has no handler,
- `AFD201`: singleton lifetime warning for handlers, behaviors, or mapping rules,
- `AFD301`: mapper catalog validation failure.

Acceptance gates:

- diagnostics work in console apps,
- diagnostics work in ASP.NET Core apps,
- diagnostics are deterministic for tests,
- diagnostics never print secret values,
- NEXORA can generate a startup flow report in development.

## v1.2 Roadmap: Safer Projection Layer

Goal:

Make query projection explicit, reusable, and provider-aware without converting object mappers into hidden SQL translators.

Planned package:

- `AstraFlow.Mapper.Projection`

Features:

- projection registry,
- named projections,
- composed projection expressions,
- provider-translatable validation hooks,
- EF Core integration tests,
- projection warnings for unsupported methods,
- projection warnings for client-side evaluation risks,
- projection profiles that declare:
  - source type,
  - destination type,
  - expression,
  - supported providers,
  - known non-translatable members,
- `IQueryable<TSource>.ProjectWith<TSource, TDestination>(...)`,
- `IEnumerable<TSource>.ProjectWith(...)` for in-memory fallback,
- diagnostics integration.

Acceptance gates:

- projection expressions remain explicit,
- unsupported expressions fail clearly when validation is enabled,
- NEXORA read models can use projections without leaking raw IDs,
- EF Core tests cover SQL Server, PostgreSQL, and provider-neutral behavior where possible.

## v1.3 Roadmap: Testing Support

Goal:

Make request handlers, notification handlers, pipeline behaviors, and mapping rules easier to test.

Planned package:

- `AstraFlow.Testing`

Features:

- fake sender,
- fake publisher,
- fake mediator,
- request recording,
- notification recording,
- handler test harness,
- pipeline test harness,
- mapper validation assertions,
- mapping snapshot helper,
- projection assertion helper,
- secure ID test codec,
- duplicate handler fixture helper,
- missing handler fixture helper.

Acceptance gates:

- no mocking framework dependency,
- easy integration with xUnit, NUnit, and MSTest,
- NEXORA handler tests can remove repetitive test setup.

## v1.4 Roadmap: Optional Convention Mapping

Goal:

Add productivity for low-risk DTOs while preserving secure defaults.

Planned package:

- `AstraFlow.Mapper.Conventions`

Features:

- convention mapping disabled by default,
- opt-in per rule/profile,
- exact property-name matching,
- case-insensitive option,
- explicit ignore rules,
- explicit include rules,
- sensitive-field deny list,
- sensitive-field require-allow option,
- ambiguity detection,
- nested object mapping only when explicitly enabled,
- collection property mapping only when explicitly enabled,
- flattening only when explicitly enabled,
- constructor parameter binding only when explicitly enabled,
- diagnostics for fields mapped by convention,
- strict mode that rejects undeclared convention output.

Security rules:

- never convention-map members named like password, secret, token, key, salt, hash, private, credential, recovery, seed, or raw identifier unless explicitly allowed,
- never convention-map from domain entity to public DTO if secure ID policy says IDs must be encoded,
- convention output must be inspectable through diagnostics.

Acceptance gates:

- explicit rules continue to be the recommended enterprise default,
- convention mapping is opt-in and auditable,
- NEXORA uses convention mapping only for internal non-sensitive DTOs if at all.

## v1.5 Roadmap: Observability Hooks

Goal:

Add production observability without forcing any one logging or telemetry stack.

Planned package:

- `AstraFlow.Observability`

Features:

- OpenTelemetry Activity support,
- request name tags,
- handler name tags,
- success/failure tags,
- duration metrics,
- notification fan-out metrics,
- notification handler failure metrics,
- mapping failure metrics,
- validation failure metrics from diagnostics,
- logging hooks without taking a hard dependency on a specific logger,
- opt-in redaction for request data,
- no payload logging by default.

Acceptance gates:

- no secret or DTO payload logging by default,
- telemetry can be disabled globally,
- NEXORA can trace request dispatch and notification fan-out in development.

## v2 Roadmap: Compile-Time Superiority

Goal:

Move high-value correctness checks and fast paths from runtime to compile time.

Planned packages:

- `AstraFlow.Mediator.Generators`
- `AstraFlow.Mapper.Generators`
- `AstraFlow.Analyzers`
- `AstraFlow.Mediator.Analyzers`
- `AstraFlow.Mapper.Analyzers`

### Source Generator Features

- generated handler registration,
- generated notification handler registration,
- generated mapping dispatch tables,
- generated collection mapping fast paths,
- generated projection registry metadata,
- trimming-friendly registration,
- AOT-friendly registration,
- compile-time request metadata,
- compile-time mapping metadata.

### Analyzer Rules

- request has no handler,
- request has multiple handlers,
- notification handler has suspicious blocking call,
- controller injects full mediator but only sends requests,
- pipeline behavior order violates configured policy,
- pipeline behavior registered with unsafe lifetime,
- mapping rule declares pair but does not implement it,
- mapping rule implements pair but does not declare it,
- mapping rule maps suspicious sensitive field,
- public DTO exposes raw `Guid` when secure ID policy is enabled,
- mapper call is used inside `IQueryable.Select` where expression projection is required,
- projection expression uses likely non-translatable members,
- rule catches broad `Exception` and hides mapping failure details,
- package consumer uses service locator inside mapping rules.

Acceptance gates:

- analyzers produce actionable messages and code locations,
- generators are deterministic,
- generated code is readable enough for debugging,
- NEXORA can enable analyzers in warning mode first, then error mode.

## v2.1 Roadmap: Performance And Benchmarks

Goal:

Measure real performance honestly and improve where it matters.

Planned project:

- `AstraFlow.Benchmarks`

Benchmark categories:

- cold start,
- service registration,
- first request dispatch,
- cached request dispatch,
- direct handler invocation baseline,
- pipeline depth 0, 1, 5, 10,
- notification fan-out 1, 5, 25, 100,
- single object mapping,
- collection mapping 100, 1,000, 100,000,
- projection expression lookup,
- allocations per dispatch,
- allocations per map,
- source-generated fast paths when v2 generators exist.

Rules:

- publish benchmark environment,
- do not claim leadership without repeatable numbers,
- keep manual baseline in every benchmark group,
- track performance regressions in CI once stable.

## v2.2 Roadmap: Enterprise Supply Chain

Goal:

Make the package family suitable for enterprise review.

Features:

- package signing,
- SourceLink verification,
- deterministic builds,
- SBOM generation,
- dependency review workflow,
- API compatibility checks,
- public security advisory workflow,
- release provenance,
- changelog automation,
- signed git tags,
- branch protection guidance,
- package deprecation process,
- version support policy.

Acceptance gates:

- public release artifacts are reproducible where practical,
- every release has a changelog entry,
- security reports have a documented private path,
- package signing does not block local development.

## v3 Roadmap: Ecosystem Packages

Goal:

Provide first-class integrations while keeping the core packages small.

Planned packages:

- `AstraFlow.AspNetCore`
- `AstraFlow.EntityFrameworkCore`
- `AstraFlow.FluentValidation`
- `AstraFlow.OpenTelemetry`
- `AstraFlow.Caching`
- `AstraFlow.Authorization`
- `AstraFlow.Webhooks`
- `AstraFlow.Cli`

### `AstraFlow.AspNetCore`

Features:

- endpoint helpers,
- request binding helpers,
- problem-details integration,
- minimal API examples,
- controller examples,
- health-check integration for diagnostics,
- development-only diagnostics endpoint.

### `AstraFlow.EntityFrameworkCore`

Features:

- EF Core projection validation,
- provider-specific test matrix,
- query tagging helpers,
- projection translation diagnostics,
- safe ID projection examples.

### `AstraFlow.FluentValidation`

Features:

- validation pipeline behavior,
- validation result adapter,
- fail-fast option,
- aggregate-errors option,
- localization hook.

### `AstraFlow.Cli`

Features:

- inspect handlers,
- inspect mappings,
- inspect projections,
- generate diagnostics report,
- check package references,
- validate public API docs,
- prepare release checklist.

## v4 Roadmap: Platform-Level Tooling

Goal:

Turn AstraFlow into a full application-flow platform for modular systems.

Features:

- visual request flow graph,
- visual pipeline graph,
- visual mapping graph,
- modular architecture scanner,
- package migration assistant,
- analyzer suppression management,
- secure DTO policy editor,
- benchmark dashboard,
- documentation website,
- recipe gallery,
- enterprise templates,
- sample modular monolith,
- sample microservice deployment,
- sample serverless worker deployment.

## Design Guardrails For Every Version

- Secure defaults stay secure.
- Magic remains opt-in.
- Explicit mapping stays first-class forever.
- No package may require NEXORA.
- No package may require a web framework unless its name says so.
- No package may log request payloads by default.
- No package may store secrets.
- Diagnostics must redact by default.
- Error messages must explain what failed and how to fix it.
- Breaking changes require a major version.
- New features require tests, docs, samples, and package metadata updates.

## Public Documentation Backlog

Add or expand these docs before broader public promotion:

- architecture overview,
- package design principles,
- mediator deep dive,
- mapper deep dive,
- pipeline behavior guide,
- notification failure policy guide,
- mapping validation guide,
- secure ID mapping guide,
- projection guide,
- ASP.NET Core sample guide,
- package release process,
- security model,
- versioning policy,
- compatibility policy,
- contribution guide with code style,
- analyzer rule catalog when analyzers exist,
- generator design notes when generators exist,
- benchmark methodology when benchmarks exist.

## Reference Feature Matrix

This matrix describes feature classes AstraFlow should cover over time. It avoids naming any competitor in package documentation and instead tracks product capability categories.

| Capability | v1 | v1.x | v2 | v3+ |
| --- | --- | --- | --- | --- |
| Request dispatch | Complete | Improve diagnostics | Generate registration | Visualize flows |
| Notification publish | Complete | Improve diagnostics | Analyze handler risks | Observability dashboards |
| Pipeline behaviors | Complete | Order diagnostics | Order analyzers | Visual pipeline graph |
| Explicit object mapping | Complete | More validation | Generate fast paths | Visual mapping graph |
| Collection mapping | Complete | Improve coverage | Generate fast paths | Benchmark dashboard |
| Secure ID abstraction | Complete | Policy diagnostics | DTO raw ID analyzer | Secure DTO policy tooling |
| Projections | Basic explicit | Provider-aware registry | Projection analyzers | EF helper package |
| Convention mapping | Not included | Opt-in package | Analyzer guarded | Visual diagnostics |
| Flattening | Not included | Opt-in package | Analyzer guarded | Visual diagnostics |
| Startup diagnostics | Basic validation | Dedicated package | Analyzer metadata | Health endpoints |
| Observability | Not included | Hooks package | Metrics tests | Dashboards |
| AOT/trimming | Basic-friendly design | Diagnostics | Generator support | Templates |
| Enterprise supply chain | Basic metadata | Release hardening | SBOM/signing | Compliance reports |

## Next Chat Bootstrap

Use this prompt to continue in a new chat:

```text
We are working on AstraFlow, a MIT-licensed .NET package family extracted from NEXORA. The package folder is packages/AstraFlow. Read packages/AstraFlow/docs/roadmap.md first. Current goal: finish publishing v1, verify NuGet packages, then migrate NEXORA from local AstraFlow project references to PackageReference entries. Do not delete packages/AstraFlow until NuGet packages are verified and NEXORA builds/tests against published packages. Keep package docs competitor-name-free and never commit secrets.
```
