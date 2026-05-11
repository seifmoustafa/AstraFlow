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

## Status Legend

This roadmap uses these labels:

- `Done`: implemented, tested, documented, and intended for release or already released.
- `Patch`: SemVer-safe hardening for a released feature.
- `Planned`: approved direction, not implemented yet.
- `Candidate`: worth considering, but must still pass design review.
- `Rejected`: deliberately not planned because it conflicts with AstraFlow's design.

## Competitive Parity Strategy

AstraFlow should cover the practical capabilities developers expect from established mediator and object-mapping libraries, but it should not inherit their risk profile blindly.

The strategy is:

- cover the common mediator surface first,
- cover the common object-mapping surface next,
- make convention behavior opt-in and inspectable,
- make sensitive-field handling safer than default convention mapping,
- make diagnostics, analyzers, and generators part of the product rather than afterthoughts,
- keep the explicit core first-class forever.

Parity does not mean copying API names. It means a user should be able to solve the same application problems with AstraFlow, with clearer failures and safer defaults.

## Release Notes Policy

NuGet's `PackageReleaseNotes` field is usually short plain text. It is normal for the NuGet tab to look minimal because it renders package metadata, not the full changelog.

For every release:

- `PackageReleaseNotes` should contain a concise public summary,
- `CHANGELOG.md` should contain the detailed release notes,
- `docs/community-release-guide.md` should contain the announcement copy,
- README should link users to the detailed docs for new features,
- release tags should point to the changelog section.

For major feature releases, the package release notes should still be more useful than one vague sentence. Prefer a compact list of the main feature groups.

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
- `INamedProjection<TSource, TDestination>`
- `IProjectionRegistry`
- `IProjectionValidator`
- `ProjectionRegistration`
- `ProjectionValidationReport`
- `ProjectionValidationFinding`
- `ProjectionValidationMode`
- `ProjectWith(...)`
- `ISecureIdCodec`
- `SecureIdMapper`
- `AddAstraFlowMapper(...)`

### `AstraFlow.Mapper.EntityFrameworkCore`

Purpose:

- Validate registered AstraFlow projections against EF Core relational query translation.
- Keep EF Core dependencies out of `AstraFlow.Mapper`.
- Report provider/model translation failures without executing application queries.

Current v1.2 public concepts:

- `ValidateProjectionTranslation(...)`
- `ValidateProjectionTranslations(...)`
- `EfCoreProjectionValidationReport`
- `EfCoreProjectionValidationFinding`

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

v1 is the stable explicit core. The implementation is intentionally focused and production-oriented. The current active roadmap baseline is `v1.2.0`.

### v1 Mediator Features

- Status: `Done` for the current explicit mediator core.
- Request/response dispatch.
- Exactly one request handler per request type.
- Clear error for missing request handlers.
- Clear error for duplicate request handlers.
- Clear error for request types that implement multiple response contracts.
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

- Status: `Done` for explicit object mapping and `Done` for v1.2 projection safety.
- Explicit rule-based mapping.
- Declared mapping pairs.
- Startup validation.
- Duplicate mapping pair detection.
- Undeclared rule detection in strict mode.
- Single object mapping.
- Null source mapping.
- Collection mapping for common collection shapes.
- Explicit projection registration and execution.
- Named projection registration and lookup.
- Projection validation with warning and error modes.
- EF Core relational projection validation through the optional EF Core package.
- Secure ID codec abstraction.
- Secure ID helper service.
- Clear errors for missing mappings and duplicate mappings.
- Package tests for mapping, validation, collection handling, projection handling, and secure ID behavior.

### v1 Package Quality

- Status: `Done` for the published package baseline; continue improving in patch releases.
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

These are not rejected forever. They move into later roadmap phases only after the explicit core, diagnostics, projection safety, and testing support are proven.

## Competitive Parity Inventory

This inventory tracks capabilities common in mature mediator and mapper libraries. It is deliberately capability-based so public docs do not become competitor marketing.

### Mediator Capability Inventory

| Capability | Status | AstraFlow Direction |
| --- | --- | --- |
| Request/response dispatch | Done | Keep core API small and clear. |
| Command/query modeling through request contracts | Done | Continue documenting CQRS and non-CQRS usage. |
| Single handler per request | Done | Keep duplicate-handler failures explicit. |
| Runtime object send | Done | Keep ambiguous request-contract detection. |
| Notifications/events | Done | Keep zero-handler publish behavior valid. |
| Multiple notification handlers | Done | Keep failure policy configurable. |
| Pipeline behaviors | Done | Add richer registration and order diagnostics later. |
| Pipeline short-circuiting | Done | Keep behavior contract simple. |
| Assembly scanning | Done | Improve AOT/trimming through generators later. |
| Handler coverage validation | Done | Add analyzer version later. |
| Diagnostics report | Done | Expand findings as features grow. |
| Void requests | Planned | Add non-response request contracts without forcing `Unit` into user code unless the user wants it. |
| Stream requests | Planned | Add `IAsyncEnumerable<T>` request handling with cancellation-safe streaming. |
| Stream pipeline behaviors | Planned | Add stream-specific pipeline behaviors around stream execution. |
| Request pre-processors | Planned | Add explicit pre-processor contracts and registration helpers. |
| Request post-processors | Planned | Add explicit post-processor contracts and registration helpers. |
| Request exception handlers | Planned | Add typed exception handlers that can mark exceptions handled. |
| Request exception actions | Planned | Add typed exception actions for logging/metrics side effects that rethrow. |
| Contracts-only package | Planned | Add `AstraFlow.Contracts` for shared request/notification/projection contracts without runtime packages. |
| Fluent registration builder | Planned | Add `AddBehavior`, `AddOpenBehavior`, `AddStreamBehavior`, pre/post processor helpers, and explicit assembly registration. |
| Parallel notification publishing | Planned | Add opt-in publish strategies with deterministic error aggregation. |
| Notification ordering policy | Candidate | Consider explicit ordering metadata only if it does not hide coupling. |
| Retry/circuit-breaker pipeline helpers | Candidate | Likely belongs in integration packages rather than core. |
| License-key runtime behavior | Rejected | Keep MIT package behavior free from runtime license checks. |

### Mapper Capability Inventory

| Capability | Status | AstraFlow Direction |
| --- | --- | --- |
| Explicit object mapping | Done | Keep as the recommended enterprise default. |
| Declared mapping ownership | Done | Keep startup validation strict and actionable. |
| Runtime mapping by destination type | Done | Keep clear missing/duplicate rule errors. |
| Collection mapping | Done | Expand shape coverage and benchmark later. |
| Null source behavior | Done | Keep documented and predictable. |
| Nested mapping | Done | Supported only when rules explicitly call the mapper. |
| Secure ID abstraction | Done | Expand into policy diagnostics and analyzers later. |
| Explicit query projections | Done | Keep projection expressions separate from runtime object mapping. |
| Named projections | Done | Keep multiple read models deterministic. |
| Projection registry | Done | Expand with generated metadata later. |
| Projection validation | Done | Add more expression-risk rules over time. |
| EF Core projection validation | Done | Add provider matrix later. |
| Convention mapping | Planned | Add optional package, disabled by default. |
| Exact property-name matching | Planned | First convention mode; safest productivity layer. |
| Case-insensitive matching | Planned | Opt-in only. |
| Include/ignore member rules | Planned | Required before convention mapping is useful. |
| Sensitive-field deny list | Planned | Mandatory for convention mapping. |
| Convention diagnostics | Planned | Every convention-mapped member must be inspectable. |
| Mapping profiles/catalogs | Planned | Organize large apps without hiding behavior. |
| Fluent member configuration | Planned | Add explicit member options without making reflection magic the default. |
| Flattening | Planned | Opt-in with diagnostics and sensitive-field checks. |
| Reverse mapping | Planned | Opt-in; never assume public DTO-to-domain updates are safe. |
| Unflattening | Planned | Opt-in and validation-heavy. |
| Constructor parameter binding | Planned | Opt-in with ambiguity diagnostics. |
| Null substitution | Planned | Add per-member rules and diagnostics. |
| Value converters | Planned | Prefer explicit converter objects registered through DI. |
| Value resolvers | Planned | Add only with clear lifetime and payload-safety rules. |
| Value transformers | Candidate | Useful but can hide global behavior; design later. |
| Conditional member mapping | Planned | Useful for patch/update flows. |
| Existing destination mapping | Planned | Required for update commands and tracked entities. |
| Polymorphic mapping | Candidate | Add after convention mapping is stable. |
| Inheritance mapping | Candidate | Add after profiles/catalogs exist. |
| Max-depth/circular-reference controls | Candidate | Only if deep graph mapping becomes a supported scenario. |
| Projection parameterization | Planned | Support tenant/user/request parameters without unsafe closure captures. |
| Query-provider-specific projection warnings | Planned | Expand beyond the initial EF Core relational checks. |
| Source-generated fast paths | Planned | v2 generator work. |
| Analyzer rule catalog | Planned | v2 analyzer work. |

### Capability Gaps That Must Be Added To The Roadmap

These were not explicit enough before and are now promoted into planned roadmap items:

- void requests,
- stream requests,
- stream pipeline behaviors,
- request pre-processors,
- request post-processors,
- request exception handlers,
- request exception actions,
- contracts-only package,
- fluent mediator registration builder,
- parallel notification publishing strategy,
- mapping profiles/catalogs,
- fluent member mapping configuration,
- reverse mapping,
- unflattening,
- null substitution,
- value converters,
- value resolvers,
- conditional member mapping,
- existing destination mapping,
- projection parameterization,
- provider-specific projection validation matrix.

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
<PackageReference Include="AstraFlow.Mediator" Version="1.2.0" />
<PackageReference Include="AstraFlow.Mapper" Version="1.2.0" />
<PackageReference Include="AstraFlow.Mapper.EntityFrameworkCore" Version="1.2.0" />
<PackageReference Include="AstraFlow.Diagnostics" Version="1.2.0" />
```

Use the meta-package only where both are intentionally needed:

```xml
<PackageReference Include="AstraFlow" Version="1.2.0" />
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

Status: `Done`.

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

Status: `Done`.

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

Status: `Done`.

Implemented in `AstraFlow.Mapper` and `AstraFlow.Mapper.EntityFrameworkCore` v1.2.0.

Goal:

Make query projection explicit, reusable, and provider-aware without converting object mappers into hidden SQL translators.

Packages:

- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`

Features:

- projection registry,
- named projections,
- warning-by-default projection validation,
- EF Core relational validation helpers,
- SQLite EF Core integration tests,
- projection warnings for unsupported methods,
- projection warnings for non-deterministic expression values,
- `IQueryable<TSource>.ProjectWith<TSource, TDestination>(...)`,
- diagnostics integration.

Acceptance gates:

- projection expressions remain explicit,
- unsupported expressions fail clearly when validation is enabled,
- NEXORA read models can use projections without leaking raw IDs,
- SQLite EF Core tests cover provider translation behavior without Docker or external database services.

## v1.3 Roadmap: Testing Support

Status: `Planned`.

Goal:

Make request handlers, notification handlers, pipeline behaviors, mapping rules, projections, diagnostics, and secure-ID flows easy to test without a full application host.

Planned package:

- `AstraFlow.Testing`

Features:

- fake sender,
- fake publisher,
- fake mediator,
- request recording,
- notification recording,
- request assertion helpers,
- notification assertion helpers,
- handler test harness,
- pipeline test harness,
- notification handler harness,
- behavior order assertion helper,
- behavior short-circuit assertion helper,
- exception-flow assertion helper for current mediator behavior,
- mapper validation assertions,
- mapper rule assertion helper,
- mapping snapshot helper,
- collection mapping assertion helper,
- projection assertion helper,
- projection validation assertion helper,
- EF Core projection validation test helpers,
- secure ID test codec,
- secure ID round-trip assertion helper,
- duplicate handler fixture helper,
- missing handler fixture helper.

Acceptance gates:

- no mocking framework dependency,
- easy integration with xUnit, NUnit, and MSTest,
- deterministic assertion messages,
- no test helper logs request or DTO payload values by default,
- tests cover mediator, mapper, projection, diagnostics, and secure ID helpers,
- docs show CQRS, non-CQRS, mapping, projection, and pipeline testing patterns,
- NEXORA handler tests can remove repetitive test setup.

## v1.4 Roadmap: Mediator Parity And Ergonomics

Status: `Planned`.

Goal:

Cover the common mediator features users expect while preserving AstraFlow's clearer errors, explicit registration, and no-license-check positioning.

Planned packages:

- `AstraFlow.Mediator`
- `AstraFlow.Contracts`

Features:

- contracts-only package with request, notification, stream request, sender/publisher abstractions where appropriate,
- void request contract for commands that do not return a value,
- void request handler contract,
- stream request contract based on `IAsyncEnumerable<TResponse>`,
- stream request handler contract,
- stream sender API,
- stream pipeline behavior contract,
- request pre-processor contract,
- request post-processor contract,
- request exception handler contract,
- request exception action contract,
- explicit registration builder for:
  - request handlers,
  - notification handlers,
  - stream handlers,
  - pipeline behaviors,
  - stream pipeline behaviors,
  - pre-processors,
  - post-processors,
  - exception handlers,
  - exception actions,
- open-generic behavior registration helpers,
- closed behavior registration helpers,
- deterministic behavior order diagnostics,
- object-based send support for void requests,
- object-based stream send support where type discovery is unambiguous,
- startup validation for stream handlers,
- diagnostics for missing stream handlers,
- diagnostics for duplicate stream handlers,
- diagnostics for ambiguous void/response/stream request contracts.

Notification publishing enhancements:

- sequential publish remains default,
- opt-in parallel publish strategy,
- opt-in bounded-parallel publish strategy,
- deterministic aggregate exception behavior,
- diagnostics show configured publish strategy,
- docs explain when parallel publish is unsafe because handlers depend on ordering or shared scoped state.

Design rules:

- void requests must not force users to reference an application-specific `Unit` type,
- streams must preserve cancellation and disposal behavior,
- exception handlers must not hide failures unless the handler explicitly marks the exception handled,
- exception actions must always rethrow,
- registration order must be deterministic and inspectable,
- contracts-only package must not depend on Microsoft.Extensions.DependencyInjection.

Acceptance gates:

- full test coverage for void request success, missing handler, duplicate handler, object send, and pipeline behavior,
- full test coverage for stream request success, cancellation, duplicate handlers, missing handlers, and stream behaviors,
- full test coverage for pre/post processors and order,
- full test coverage for exception handlers and exception actions,
- diagnostics report all new mediator registrations and findings,
- docs include migration notes for users coming from established mediator libraries,
- no runtime license checks.

Patch candidates after v1.4:

- `v1.4.1`: registration builder polish and docs fixes,
- `v1.4.2`: stream cancellation edge-case hardening,
- `v1.4.3`: diagnostics finding expansion for processor and exception-handler ordering.

## v1.5 Roadmap: Safe Convention Mapping And Profiles

Status: `Planned`.

Goal:

Add productivity for low-risk DTOs while preserving secure defaults.

Planned package:

- `AstraFlow.Mapper.Conventions`

Features:

- convention mapping disabled by default,
- opt-in per mapping profile/catalog,
- exact source/destination type-pair registration,
- mapping profile abstraction,
- mapping catalog abstraction,
- exact property-name matching,
- case-insensitive option,
- explicit ignore rules,
- explicit include rules,
- explicit required destination member rules,
- unmapped destination member diagnostics,
- unmapped source member diagnostics,
- sensitive-field deny list,
- sensitive-field require-allow option,
- ambiguity detection,
- nullable member compatibility checks,
- numeric conversion checks,
- enum conversion checks,
- nested object mapping only when explicitly enabled,
- collection property mapping only when explicitly enabled,
- constructor parameter binding only when explicitly enabled,
- null substitution per destination member,
- value converter hook per member,
- conditional member mapping per member,
- existing destination mapping for update scenarios,
- diagnostics for fields mapped by convention,
- generated preview report for convention output,
- strict mode that rejects undeclared convention output.

Security rules:

- never convention-map members named like password, secret, token, key, salt, hash, private, credential, recovery, seed, or raw identifier unless explicitly allowed,
- never convention-map from domain entity to public DTO if secure ID policy says IDs must be encoded,
- convention output must be inspectable through diagnostics.

Acceptance gates:

- explicit rules continue to be the recommended enterprise default,
- convention mapping is opt-in and auditable,
- every convention-created member mapping appears in diagnostics,
- strict mode can fail startup when convention output changes,
- docs show safe internal DTO conventions and unsafe public DTO examples,
- tests cover exact names, case-insensitive names, ignored members, included members, sensitive fields, null substitution, converters, conditions, constructor binding, and existing destination mapping,
- NEXORA uses convention mapping only for internal non-sensitive DTOs if at all.

Patch candidates after v1.5:

- `v1.5.1`: convention diagnostics polish,
- `v1.5.2`: additional safe conversion coverage,
- `v1.5.3`: profile organization helpers.

## v1.6 Roadmap: Advanced Mapping Parity

Status: `Planned`.

Goal:

Cover advanced mapper productivity features without compromising explicit auditability.

Planned package:

- `AstraFlow.Mapper.Conventions`

Features:

- flattening with explicit enablement,
- include-member mapping from nested source objects,
- reverse mapping with explicit enablement,
- unflattening with explicit enablement,
- reverse-map diagnostics that show every reversed member path,
- reverse-map deny rules for domain-owned or security-sensitive members,
- per-member custom source expressions,
- per-member custom destination path configuration,
- value resolver objects with DI lifetime diagnostics,
- value transformer pipeline with opt-in scope,
- conditional mapping for patch/update DTOs,
- before-map and after-map hooks only when explicitly enabled,
- polymorphic mapping candidate support,
- inheritance mapping candidate support,
- collection element polymorphism candidate support,
- max-depth and circular-reference candidate support for deep graph scenarios.

Design rules:

- reverse mapping must never be generated implicitly,
- unflattening into domain entities must be opt-in and diagnostics-heavy,
- public DTO input should not update sensitive domain members without explicit allow rules,
- hooks and resolvers must be visible in diagnostics,
- convention and advanced mapping must not change explicit rule behavior.

Acceptance gates:

- tests cover flattening, reverse mapping, unflattening, include members, custom member source, custom destination path, value resolvers, value transformers, and conditional mapping,
- strict diagnostics identify every advanced mapping decision,
- docs separate safe read DTO mapping from risky write DTO/domain update mapping,
- analyzers have planned rules for suspicious reverse-map and sensitive-field output.

Patch candidates after v1.6:

- `v1.6.1`: reverse-map edge cases,
- `v1.6.2`: inheritance/polymorphism hardening if accepted,
- `v1.6.3`: deep graph safety controls if accepted.

## v1.7 Roadmap: Projection Provider Matrix

Status: `Planned`.

Goal:

Make projection safety stronger across real query providers while keeping expression projections explicit.

Planned packages:

- `AstraFlow.Mapper.EntityFrameworkCore`
- provider-specific test packages if needed

Features:

- projection parameterization without unsafe closure capture,
- tenant/user/current-time parameter examples,
- provider matrix tests for SQLite, SQL Server, PostgreSQL, and MySQL where practical,
- query tagging helper candidate,
- provider-specific warning codes,
- stricter expression analyzer for non-translatable calls,
- projection registry metadata export,
- CI-friendly projection report command candidate.

Acceptance gates:

- projection parameters do not leak secrets in diagnostics,
- validation does not execute queries,
- provider test matrix is documented and repeatable,
- docs explain static validation versus provider translation validation.

## v1.8 Roadmap: Observability Hooks

Status: `Planned`.

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
- generated void request registration,
- generated stream request registration,
- generated mapping dispatch tables,
- generated convention mapping plans,
- generated collection mapping fast paths,
- generated projection registry metadata,
- trimming-friendly registration,
- AOT-friendly registration,
- compile-time request metadata,
- compile-time mapping metadata.

### Analyzer Rules

- request has no handler,
- request has multiple handlers,
- request implements ambiguous void/response/stream contracts,
- stream request has no stream handler,
- stream handler performs suspicious blocking work,
- notification handler has suspicious blocking call,
- controller injects full mediator but only sends requests,
- pipeline behavior order violates configured policy,
- pipeline behavior registered with unsafe lifetime,
- request pre/post processor order is ambiguous,
- exception handler swallows failures without explicit handled state,
- mapping rule declares pair but does not implement it,
- mapping rule implements pair but does not declare it,
- mapping rule maps suspicious sensitive field,
- convention profile maps a sensitive field without explicit allow,
- reverse map writes into a sensitive destination member,
- unflattening writes into a domain-owned nested object without explicit allow,
- public DTO exposes raw `Guid` when secure ID policy is enabled,
- mapper call is used inside `IQueryable.Select` where expression projection is required,
- projection expression uses likely non-translatable members,
- projection captures complex runtime state instead of explicit parameters,
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

| Capability | Now `v1.2` | Planned `v1.3-v1.8` | Planned `v2` | Planned `v3+` |
| --- | --- | --- | --- | --- |
| Request dispatch | Done | Void requests, richer registration | Generated registration, analyzer checks | Visual request graph |
| Stream requests | Not included | Stream request and stream behavior support | Stream analyzers | Streaming templates |
| Notification publish | Done | Parallel and bounded parallel strategies | Handler-risk analyzers | Observability dashboards |
| Pipeline behaviors | Done | Pre/post processors, exception handlers/actions | Order analyzers | Visual pipeline graph |
| Contracts-only package | Not included | `AstraFlow.Contracts` | API compatibility checks | Shared contract templates |
| Explicit object mapping | Done | More assertions and diagnostics | Generated fast paths | Visual mapping graph |
| Collection mapping | Done | More shape coverage | Generated collection fast paths | Benchmark dashboard |
| Secure ID abstraction | Done | Test codec and policy diagnostics | DTO raw ID analyzer | Secure DTO policy tooling |
| Projections | Done | Parameters and provider matrix | Projection analyzers, generated metadata | Query diagnostics tooling |
| EF Core projection validation | Done | Provider matrix expansion | Provider-specific analyzer hints | EF helper ecosystem package |
| Convention mapping | Not included | Opt-in package | Analyzer guarded | Visual diagnostics |
| Mapping profiles/catalogs | Not included | Opt-in profile/catalog package | Compile-time metadata | Mapping design tools |
| Flattening | Not included | Opt-in advanced mapping | Analyzer guarded | Visual diagnostics |
| Reverse mapping | Not included | Opt-in advanced mapping | Sensitive-write analyzers | DTO policy tooling |
| Unflattening | Not included | Opt-in advanced mapping | Domain-write analyzers | Visual mapping graph |
| Existing destination mapping | Not included | Update/patch mapping support | Analyzer guarded | Entity update recipes |
| Startup diagnostics | Done | Expanded finding coverage | Analyzer metadata | Health endpoints |
| Testing support | Not included | `AstraFlow.Testing` | Analyzer-friendly test helpers | Test templates |
| Observability | Not included | OpenTelemetry/logging hooks | Metrics tests | Dashboards |
| AOT/trimming | Basic-friendly design | Registration diagnostics | Generator support | Templates |
| Enterprise supply chain | Basic metadata | Release hardening | SBOM/signing | Compliance reports |

## Detailed Parity Backlog

### Mediator Backlog

| Item | Priority | Target | Notes |
| --- | --- | --- | --- |
| Void request contract | High | `v1.4` | Needed for command handlers with no response. |
| Void request object dispatch | High | `v1.4` | Must preserve clear ambiguous-contract errors. |
| Stream request contract | High | `v1.4` | Use `IAsyncEnumerable<T>` and cancellation-safe execution. |
| Stream pipeline behavior | High | `v1.4` | Separate contract from normal request pipeline. |
| Pre-processors | Medium | `v1.4` | Useful for validation/logging setup; behavior remains more powerful. |
| Post-processors | Medium | `v1.4` | Useful for auditing/cleanup after handlers. |
| Exception handlers | High | `v1.4` | Must require explicit handled state. |
| Exception actions | High | `v1.4` | Must always rethrow after side effects. |
| Contracts-only package | High | `v1.4` | Important for shared API contracts, Blazor, clients, and modular boundaries. |
| Fluent registration builder | High | `v1.4` | Needed for predictable behavior registration and discoverability. |
| Parallel notification strategy | Medium | `v1.4` | Opt-in because ordering and scoped state can be risky. |
| Notification ordering metadata | Low | Candidate | Avoid unless real apps need it. |

### Mapper Backlog

| Item | Priority | Target | Notes |
| --- | --- | --- | --- |
| Mapping profiles/catalogs | High | `v1.5` | Organizes convention and explicit config for large apps. |
| Exact convention mapping | High | `v1.5` | First convention feature because it is easiest to audit. |
| Ignore/include rules | High | `v1.5` | Required for safe convention mapping. |
| Sensitive-field deny list | High | `v1.5` | Non-negotiable security gate. |
| Unmapped member validation | High | `v1.5` | Equivalent practical value to configuration validation. |
| Null substitution | Medium | `v1.5` | Common DTO cleanup feature. |
| Value converters | Medium | `v1.5` | Prefer explicit converter classes. |
| Conditional member mapping | Medium | `v1.5` | Useful for update/patch flows. |
| Existing destination mapping | Medium | `v1.5` | Useful for tracked entities and command updates. |
| Flattening | High | `v1.6` | Must be opt-in and diagnostic-heavy. |
| Reverse mapping | High | `v1.6` | Must never be implicit. |
| Unflattening | High | `v1.6` | Must protect domain-owned nested objects. |
| Include members | Medium | `v1.6` | Needed for controlled composition mapping. |
| Value resolvers | Medium | `v1.6` | Add lifetime diagnostics. |
| Value transformers | Low | Candidate | Can hide global behavior, needs careful design. |
| Polymorphic mapping | Low | Candidate | Add only after core conventions stabilize. |
| Inheritance mapping | Low | Candidate | Add only after profile/catalog model is stable. |
| Circular reference controls | Low | Candidate | Only if deep graph mapping becomes a supported scenario. |

### AstraFlow-Only Advantage Backlog

| Item | Priority | Target | Why It Makes AstraFlow Stronger |
| --- | --- | --- | --- |
| Diagnostics-first registration report | Done | `v1.1` | Makes app wiring inspectable. |
| Projection validation findings | Done | `v1.2` | Catches query risks before production. |
| EF Core translation checks | Done | `v1.2` | Validates provider/model translation without executing queries. |
| Secure ID abstraction | Done | `v1.0` | Keeps raw IDs and encryption policy explicit. |
| Safe convention diagnostics | High | `v1.5` | Makes automatic mapping auditable. |
| Sensitive DTO policy analyzers | High | `v2` | Prevents accidental public raw IDs and secret-field leaks. |
| Visual request/mapping graph | Medium | `v4` | Helps large teams understand flow without reading all source. |

## Next Chat Bootstrap

Use this prompt to continue in a new chat:

```text
We are working on AstraFlow, a MIT-licensed .NET package family extracted from NEXORA. The package folder is packages/AstraFlow. Read packages/AstraFlow/docs/roadmap.md first. Current goal: finish publishing v1, verify NuGet packages, then migrate NEXORA from local AstraFlow project references to PackageReference entries. Do not delete packages/AstraFlow until NuGet packages are verified and NEXORA builds/tests against published packages. Keep package docs competitor-name-free and never commit secrets.
```
