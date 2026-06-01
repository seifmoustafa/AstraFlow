# Changelog

All notable AstraFlow changes are tracked here.

## 1.8.4

### Added

- Added generated mapper and projection metadata through `AstraFlow.Generators`.
- Added `IGeneratedMapperMetadataProvider`, `GeneratedMapperMetadata`, `GeneratedMappingRuleMetadata`, and `GeneratedProjectionMetadata`.
- Added generated `AddAstraFlowGeneratedMapperMetadata()` and `GetAstraFlowGeneratedMapperMetadata()` helpers.
- Added generator tests for mapping rule metadata, declared-rule flags, projection metadata, named projection flags, parameterized projections, empty projects, and unsupported mapper shapes.

### Changed

- Updated release-facing documentation, package metadata, and roadmap status for `1.8.4`.
- Kept runtime mapper/projection scanning as the fallback path while adding compile-time metadata for diagnostics, CLI, AOT, and future optimization.

### Fixed

- None.

## 1.8.3

### Added

- Added the new `AstraFlow.Generators` compiler package.
- Added deterministic generated mediator component registration through `AddAstraFlowGeneratedMediatorRegistrations`.
- Generated registrations cover closed request handlers, notification handlers, stream handlers, request processors, post-processors, exception actions, and exception handlers.
- Added generator tests for deterministic output, empty projects, open generic skipping, and inaccessible nested component skipping.

### Changed

- Kept runtime mediator scanning available as the fallback path while adding the generated registration foundation.
- Updated clean install verification, packaging scripts, CI asset checks, and release documentation for ten packages.

### Fixed

- None.

## 1.8.2

### Added

- Added mapper and projection analyzer warnings `AFAN0201`, `AFAN0202`, and `AFAN0301` through `AFAN0304`.
- Added undeclared mapping rule diagnostics for concrete `IObjectMappingRule` implementations that do not expose `IDeclaredObjectMappingRule` mapping pairs.
- Added reverse convention mapping sensitive-write diagnostics for `ReverseMap` calls that target destination types with password, token, key, credential, or secret-style members.
- Added raw public ID projection diagnostics for `IProjection<TSource, TDestination>` destination types that expose `Guid` `PublicId` members.
- Added mapper-call-inside-query diagnostics for `IMapper.Map` calls inside `IQueryable` or projection expressions.
- Added custom projection method diagnostics for user methods called inside projection expressions.
- Added complex projection capture diagnostics for non-scalar instance fields captured inside projection expressions.

### Changed

- Release-facing documentation now points current package install examples at `1.8.2`.
- Marked `v1.8.2` mapper and projection analyzer work as complete in the roadmap and future ideas bank.
- Analyzer documentation now lists the mapper and projection rule catalog, recommended fixes, and static-analysis limits.

### Fixed

- None.

### Docs

- Expanded analyzer, package selection, API reference, roadmap, future ideas, and release guidance for mapper and projection analyzers.

### Tests

- Added analyzer tests for undeclared mapping rules, reverse sensitive writes, raw public ID projection shapes, mapper calls inside queryable lambdas, custom projection methods, and complex projection captures.

### Packaging

- Updated package metadata and release notes for `1.8.2`.

### Breaking changes

- None.

## 1.8.1

### Added

- Added mediator analyzer warnings `AFAN0101` through `AFAN0105`.
- Added missing request handler diagnostics for concrete `IRequest` and `IRequest<TResponse>` types without matching handlers in the current compilation.
- Added duplicate request handler diagnostics for multiple concrete handlers of the same closed handler contract.
- Added ambiguous request contract diagnostics for requests that implement multiple AstraFlow request contracts.
- Added missing stream handler diagnostics for concrete `IStreamRequest<TResponse>` types without matching stream handlers.
- Added singleton handler lifetime diagnostics for `AddSingleton` registrations that include concrete AstraFlow request or stream handlers.

### Changed

- Release-facing documentation now points current package install examples at `1.8.1`.
- Marked `v1.8.1` mediator analyzer work as complete in the roadmap and future ideas bank.
- Analyzer documentation now lists the mediator rule catalog and recommended fixes.

### Fixed

- None.

### Docs

- Expanded analyzer, package selection, API reference, roadmap, future ideas, and release guidance for the first mediator analyzer rule set.

### Tests

- Added analyzer tests for handled requests, missing handlers, duplicate handlers, ambiguous request contracts, missing stream handlers, and singleton handler registrations.

### Packaging

- Updated package metadata and release notes for `1.8.1`.

### Breaking changes

- None.

## 1.8.0

### Added

- Added `AstraFlow.Analyzers` package foundation.
- Added stable analyzer rule ID constants, categories, severity metadata, and descriptor catalog.
- Added `AFAN0001` as a disabled-by-default infrastructure marker descriptor for analyzer package verification.
- Added analyzer test infrastructure using Roslyn compilation and analyzer execution APIs.
- Added analyzer documentation with rule ID policy, severity policy, suppression guidance, and a rule documentation template.

### Changed

- Release-facing documentation now points current package install examples at `1.8.0`.
- Marked the roadmap's next lane as `v1.8.0` analyzer foundation work.
- Clean package install verification now includes `AstraFlow.Analyzers`.

### Fixed

- None.

### Docs

- Added `docs/analyzers.md`.
- Updated package selection, compatibility, release, and publishing guidance for the analyzer package.

### Tests

- Added analyzer foundation tests for rule catalog stability, supported descriptors, and no-op source analysis.

### Packaging

- Added analyzer package packing and CI/publish package asset verification.

### Breaking changes

- None.

## 1.7.2

### Added

- Added projection plan parameter type assertions in `AstraFlow.Testing`.
- Added sensitive and non-sensitive projection parameter assertions for deterministic projection plan tests.

### Changed

- Release-facing documentation now points current package install examples at `1.7.2`.
- Marked the `v1.7.x` stabilization lane with the `1.7.2` projection parameter assertion patch.

### Fixed

- Fixed clean package install verification so target-framework smoke projects are retargeted directly instead of depending on SDK template framework options.
- Fixed clean package install verification temp project names to avoid Windows path-length-sensitive build failures.

### Docs

- Expanded testing, projections, API reference, and release documentation for projection parameter assertions.

### Tests

- Added `AstraFlow.Testing` coverage for projection plan parameter type and sensitivity assertion paths.

### Packaging

- Updated package metadata and release-facing version references for `1.7.2`.

### Breaking changes

- None.

## 1.7.1

### Added

- Added `ProjectionPlanAssertions` in `AstraFlow.Testing` for deterministic projection plan tests.
- Added helpers for locating projection plans, parameterized projection plans, projection parameters, projection member decisions, projection plan findings, and clean projection plans.

### Changed

- Release-facing documentation now points current package install examples at `1.7.1`.
- Marked the `v1.7.x` stabilization lane with the `1.7.1` projection testing helper patch.

### Fixed

- None.

### Docs

- Expanded testing and API reference documentation for projection plan assertions.

### Tests

- Added `AstraFlow.Testing` coverage for projection plan assertion success and failure paths.

### Packaging

- Updated package metadata and release-facing version references for `1.7.1`.

### Breaking changes

- None.

## 1.7.0

### Added

- Added explicit `IParameterizedProjection<TSource, TDestination, TParameters>` support for tenant, user, culture, current-time, and other parameterized read-model scenarios.
- Added `INamedParameterizedProjection<TSource, TDestination, TParameters>` and `IParameterizedProjectionRegistry` for named and unnamed parameterized projection lookup.
- Added `ProjectWith` overloads that bind parameter objects into provider-visible projection expressions without executing queries.
- Added deterministic projection plan export through `IProjectionPlanProvider` and `ProjectionPlan`.
- Added parameter metadata to projection registrations and plans.
- Added `AFP106` diagnostics for raw public ID projection risks.
- Added `AFP107` diagnostics for secure ID infrastructure calls inside query projection expressions.
- Added EF Core parameterized projection translation validation.
- Added EF Core provider metadata through `EfCoreProjectionValidationReport.ProviderName` and `ValidatedProjectionCount`.
- Added `AFPEF002` for unmapped EF entity sources and `AFPEF003` for missing parameter samples during EF provider validation.

### Changed

- Projection duplicate validation now includes parameter object type when grouping parameterized projections.
- EF Core projection validation can accept sample parameter objects for provider translation checks.
- Release-facing documentation now points current package install examples at `1.7.0`.

### Fixed

- None.

### Docs

- Expanded projection, EF Core, API reference, package selection, compatibility, and release documentation for `1.7.0`.
- Added `v1.7.x` stabilization lane to the roadmap.

### Tests

- Added projection tests for parameterized projection application, registry lookup, projection plan export, raw public ID diagnostics, and secure ID projection diagnostics.
- Added EF Core tests for provider metadata, unmapped entity findings, parameterized projection translation, missing parameter samples, and supplied parameter samples.

### Packaging

- Updated package metadata and release-facing version references for `1.7.0`.

### Breaking changes

- None.

## 1.6.2

### Added

- Added explicit `IncludeBase<TBaseSource, TBaseDestination>()` support for convention inheritance mapping.
- Added explicit `IncludeDerived<TDerivedSource, TDerivedDestination>()` support for polymorphic convention dispatch.
- Added `AFC017` diagnostics for included base mapping pairs.
- Added `AFC018` diagnostics for included derived mapping pairs.
- Added `AFC019` diagnostics for derived mappings that can be selected through polymorphic dispatch.
- Added a `v1.6.2` inheritance and polymorphism design note.

### Changed

- Convention mapping resolution can now select an explicitly included derived mapping when mapping a derived source instance into an assignable base destination type.

### Fixed

- None.

### Docs

- Expanded convention mapping and API reference documentation for inheritance and polymorphic mapping.

### Tests

- Added tests for `IncludeBase`, `IncludeDerived`, polymorphic dispatch, and non-polymorphic behavior when derived mappings are not explicitly included.

### Packaging

- Updated package metadata and release-facing version references for `1.6.2`.

### Breaking changes

- None.

## 1.6.1

### Added

- Added explicit convention value transformers through `AddValueTransformer`.
- Added per-pair `BeforeMap` hooks for convention mapping.
- Added per-pair `AfterMap` hooks for convention mapping.
- Added `AFC014` diagnostics for value transformer usage.
- Added `AFC015` diagnostics for before-map hook usage.
- Added `AFC016` diagnostics for after-map hook usage.
- Added a `v1.6.1` candidate follow-up design note.

### Changed

- Convention mapping plans now report transformed member decisions as `Transformed` when no higher-priority decision already describes the member.

### Fixed

- None.

### Docs

- Expanded convention mapping and API reference documentation for value transformers and map hooks.

### Tests

- Added tests for value transformer output and diagnostics, before/after hook order, and hooks around existing-destination updates.

### Packaging

- Updated package metadata and release-facing version references for `1.6.1`.

### Breaking changes

- None.

## 1.6.0

### Added

- Added opt-in flattening for nested source members mapped into flat destination members.
- Added opt-in unflattening for flat source members mapped into nested destination paths.
- Added explicit `ReverseMap` registration; reverse mapping is never implicit.
- Added `IncludeMembers` for composing destination members from selected child source members.
- Added custom source expression support through `MapFrom`.
- Added custom destination path support through `ForPath`.
- Added value resolver support through `IConventionValueResolver`.
- Added mapping plan decisions for `Flattened`, `Unflattened`, `IncludedMember`, and `Resolved`.
- Added resolver diagnostics with `AFC013`.

### Changed

- Convention mapping plans now report nested destination paths and advanced mapping decisions.

### Fixed

- None.

### Docs

- Expanded convention mapping documentation for advanced mapping scenarios.

### Tests

- Added tests for flattening, unflattening, explicit reverse mapping, include members, custom source expressions, custom destination paths, and value resolvers.

### Packaging

- Updated package metadata and release-facing version references for `1.6.0`.

### Breaking changes

- None.

## 1.5.2

### Added

- Added constructor and record binding for opt-in convention mapping, including immutable destination support when constructor parameters can be mapped.
- Added `IConventionMapper` for convention-specific mapping operations.
- Added explicit existing-destination update mapping with `EnableUpdateMapping` and `MapInto`.
- Added constructor ambiguity, constructor availability, and immutable destination diagnostics.
- Added safe same-element collection shape mapping for convention members.

### Changed

- Convention mapping plans now show constructor-bound members so record and immutable destination mappings are inspectable.
- Update mapping is documented separately from read DTO mapping and must be enabled per source/destination pair.

### Fixed

- None.

### Docs

- Expanded convention mapping, API reference, diagnostics, and troubleshooting documentation for constructor binding, record binding, immutable destinations, and safe update mapping.

### Tests

- Added tests for record mapping, immutable constructor mapping, ambiguous constructor diagnostics, explicit update mapping, conditional patch behavior, sensitive destination write protection, and safe collection shape mapping.

### Packaging

- Updated package metadata and release-facing version references for `1.5.2`.

### Breaking changes

- None.

## 1.5.1

### Added

- Added fluent convention member configuration with `ForMember`, `MapFrom`, `Required`, `NullSubstitute`, `ConvertUsing`, and `Condition`.
- Added enum-to-enum validation, enum-to-string convention mapping, nullable compatibility diagnostics, numeric conversion diagnostics, and required-member diagnostics.
- Added mapping plan decisions for converted, conditional, null-substituted, enum-to-enum, and enum-to-string member mappings.

### Changed

- Convention mapping plans now include member-level configuration reasons so automatic and configured decisions are reviewable in diagnostics.

### Fixed

- None.

### Docs

- Expanded convention mapping, API reference, and troubleshooting documentation for member configuration, converters, conditionals, null substitution, and new finding codes.

### Tests

- Added convention mapping tests for explicit member sources, required destinations, null substitution, converters, conditional mapping, enum mapping, nullable diagnostics, numeric diagnostics, and mapping plan visibility.

### Packaging

- Updated package metadata and release-facing version references for `1.5.1`.

### Breaking changes

- None.

## 1.5.0

### Added

- Added optional `AstraFlow.Mapper.Conventions` for opt-in convention mapping.
- Added convention mapping profiles, catalogs, exact source/destination pair registration, exact member matching, and opt-in case-insensitive member matching.
- Added include rules, ignore rules, sensitive-member allow rules, strict mode, and deterministic mapping plan export.
- Added mapper-level `IMappingPlanProvider` and `MappingPlan` diagnostics contracts.

### Changed

- Diagnostics reports now include mapping plan output when a package provides mapping plans.

### Fixed

- None.

### Docs

- Added convention mapping guidance covering registration, profiles, strict mode, sensitive fields, plan export, and troubleshooting.

### Tests

- Added convention mapping tests for opt-in behavior, exact matching, case-insensitive matching, include/ignore rules, unmapped diagnostics, ambiguity, sensitive fields, strict mode, plan export, and diagnostics output.

### Packaging

- Added `AstraFlow.Mapper.Conventions` to solution, CI, pack scripts, package asset verification, and clean install verification.

### Breaking changes

- None.

## 1.4.2

### Added

- Added diagnostics regression coverage for order-sensitive mediator registrations.

### Changed

- Diagnostics registration tables now preserve dependency-injection registration order instead of sorting registrations alphabetically.

### Fixed

- Fixed diagnostics output so notification handlers, pipeline behaviors, processors, stream behaviors, exception actions, and exception handlers reflect runtime registration order.

### Docs

- Clarified that diagnostics registration table order mirrors captured DI registration order for mediator components.

### Tests

- Added report and Markdown assertions that non-alphabetical mediator registrations remain in DI order.

### Packaging

- Updated package metadata and release-facing version references for `1.4.2`.

### Breaking changes

- None.

## 1.4.1

### Added

- Expanded diagnostics registration reporting for existing mediator cross-cutting components: request pre-processors, post-processors, exception actions, and exception handlers.
- Expanded clean package install verification with a runnable consumer smoke test for response requests, void requests, stream requests, and notifications.

### Changed

- Updated package release notes for the `v1.4.x` stabilization scope.

### Fixed

- Added regression coverage for stream cancellation propagation, early stream enumeration disposal, exception action ordering, explicit exception handled-state behavior, and bounded-parallel aggregate notification failures.

### Docs

- Clarified mediator stream cancellation/disposal behavior, processor and exception-flow ordering, notification failure policies, and diagnostics payload safety.
- Added troubleshooting guidance for stream enumeration, post-processor, notification, and exception-handler failure modes.

### Tests

- Added mediator and diagnostics tests for the `v1.4.x` stabilization acceptance gates.

### Packaging

- Clean package install verification now compiles and runs a generated `net10.0` mediator consumer against packed packages.
- CI and publish package verification now resolve the package version from `Directory.Build.props` instead of hard-coding `1.4.0` package names.

### Breaking changes

- None.

## 1.4.0

- Added `AstraFlow.Contracts` as a shared contracts package for request, notification, stream, sender, publisher, and mediator abstractions.
- Moved mediator contracts into `AstraFlow.Contracts` while keeping the `AstraFlow.Mediator` namespace for source compatibility.
- Added void request support through `IRequest`, `IRequestHandler<TRequest>`, `ISender.Send(IRequest, ...)`, and runtime `Send(object)` returning `null` for void requests.
- Added stream request support through `IStreamRequest<TResponse>`, `IStreamRequestHandler<TRequest, TResponse>`, `IStreamSender`, and `IMediator.CreateStream(...)`.
- Added stream pipeline behaviors through `IStreamPipelineBehavior<TRequest, TResponse>`.
- Added void request pipeline behaviors through `IRequestPipelineBehavior<TRequest>`.
- Added request pre-processors and post-processors for response and void request flows.
- Added request exception actions that run side effects and rethrow, plus request exception handlers that must explicitly mark failures as handled.
- Added opt-in `Parallel` and `BoundedParallel` notification publish strategies while keeping sequential publishing as the default.
- Added `AstraFlowMediatorBuilder` registration helpers for explicit behavior, processor, stream behavior, and exception-flow registration.
- Updated pack, publish, CI, and clean-install verification scripts to include `AstraFlow.Contracts`.

## 1.3.0

- Added `AstraFlow.Testing` as a framework-neutral testing package.
- Added fake sender, fake publisher, and fake mediator helpers with request and notification recording.
- Added handler, notification handler, and pipeline test harnesses.
- Added mediator, mapper, projection, diagnostics, exception, mapping-rule, and secure ID assertion helpers.
- Added deterministic `TestSecureIdCodec` for test-only secure ID round trips.
- Kept the testing package free from xUnit, NUnit, MSTest, FluentAssertions, and mocking-framework dependencies.
- Shipped `AstraFlow.Testing` assets for `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`.
- Updated CI, publish, pack, and clean-install verification to include `AstraFlow.Testing`.

## 1.2.3

- Added `scripts/verify-package-install.ps1` to install packed packages into clean external consumer projects.
- Verified core packages in `netstandard2.0`, `net8.0`, and `net9.0` consumer projects.
- Verified all packages, including `AstraFlow.Mapper.EntityFrameworkCore`, in a `net10.0` consumer project.
- Wired clean package install verification into local packing, CI, and the publish workflow.
- Updated release documentation so target-framework support must be proven by automated package install checks.

## 1.2.2

- Added real multi-target support for `AstraFlow`, `AstraFlow.Mediator`, `AstraFlow.Mapper`, and `AstraFlow.Diagnostics`.
- Core packages now ship `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` assets.
- Kept `AstraFlow.Mapper.EntityFrameworkCore` on `net10.0` because it follows the EF Core 10 package line.
- Replaced newer runtime helper APIs in core source with compatibility-safe equivalents where needed.
- Added the `System.Text.Json` package dependency for the `netstandard2.0` diagnostics asset.
- Updated compatibility, release, publishing, and package-selection docs for the actual published target frameworks.

## 1.2.1

- Added compatibility guidance for current `net10.0` support and future multi-target expansion.
- Added package selection guidance for choosing the meta package or focused packages.
- Added release checklist gates for target framework verification, package dependency review, and clean install smoke tests.
- Documented compatibility audit findings for future `netstandard2.0`, `net8.0`, `net9.0`, and direct legacy framework support.
- Updated package release notes for the compatibility and adoption hardening release.
- No runtime behavior changes.

## 1.2.0

- Added projection registry support with deterministic unnamed and named projection lookup.
- Added `INamedProjection<TSource, TDestination>` for explicit multiple projection shapes per source/destination pair.
- Added projection validation with warning-by-default findings for duplicate projections, null expressions, mapper calls, custom method calls, non-deterministic values, complex closure captures, and unsupported construction risks.
- Added diagnostics integration for projection names and projection validation findings.
- Added optional `AstraFlow.Mapper.EntityFrameworkCore` package with EF Core relational translation validation helpers.
- Added SQLite EF Core integration tests and expanded projection registry tests.

## 1.1.0

- Added `AstraFlow.Diagnostics` with framework-neutral registration reports for request handlers, notification handlers, pipeline behaviors, mapping rules, and projections.
- Added severity-coded findings, including duplicate request handlers, ambiguous request contracts, missing request handlers, singleton lifetime warnings, and mapper catalog validation failures.
- Added in-memory diagnostics reports, camelCase JSON output, Markdown output, and a health-check-ready summary object.
- Added diagnostics tests, a diagnostics sample, CI packing, publishing workflow support, and documentation.

## 1.0.1

- Hardened mediator dispatch so request types that implement multiple `IRequest<TResponse>` contracts fail with a clear diagnostic instead of choosing an arbitrary response type.
- Hardened mediator registration with null service checks, null marker-type tolerance, and partial assembly-load tolerance during scanning.
- Clarified mediator registration options documentation and fixed small XML documentation polish issues.
- Documented the `net10.0` target and current .NET support window.
- Expanded and packaged public documentation with API reference tables, architecture notes, mediator scenarios, mapper scenarios, troubleshooting, and publishing guidance for community consumption.

## 1.0.0

- Added `AstraFlow.Mediator` with request dispatch, notification publishing, pipeline behaviors, assembly scanning, duplicate handler detection, missing handler diagnostics, and optional handler coverage validation.
- Added `AstraFlow.Mapper` with explicit mapping rules, declared mapping validation, collection mapping, explicit query projection helpers, and secure ID abstractions.
- Added `AstraFlow` convenience registration package.
- Added package tests, integration tests, samples, NuGet metadata, XML documentation, symbols, SourceLink-ready metadata, and MIT license.
