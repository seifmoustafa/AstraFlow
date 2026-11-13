# AstraFlow Version Comparison and Upgrade Guide

This guide compares the `1.13.0`, `2.2.0`, and published `2.3.0` lines, then explains the implemented but unreleased `2.4.0` source and its consumer impact. It separates a package-version update from opting into new features and labels maintainer-confirmed release facts separately from independently verified package evidence.

## Read the version numbers correctly

| Label | What it means | Can a consumer install it from NuGet? |
| --- | --- | --- |
| `2.2.0` | The previously published baseline shown in the maintainer-provided NuGet screenshot dated 2026-11-10. | Yes; it remains installable as a pinned older version. The screenshot is historical and has been superseded by the reported `2.3.0` publication. |
| `2.3.0` | The new release, reported published by the package maintainer on 2026-11-10; it contains the feature set represented by PR #57. | Yes, per maintainer confirmation. The NuGet API could not be queried from this environment because `api.nuget.org` did not resolve, so the publication timestamp and every satellite package's assets were not independently audited here. |
| `2.4.0` | The current unreleased source candidate; adds standalone Assertions and enterprise generated mapping for inherited properties and immutable DTOs. Generated mediator dispatch remains a separate, unimplemented roadmap candidate. | No. Local packages and successful smoke checks do not make a NuGet release. |

**For published packages, use `2.3.0` where that exact package ID is available. `2.4.0` is not published.** A branch name, source version, successful build, or local package artifact does not mean a package is available from NuGet.

## Executive comparison

| Question | Clear answer |
| --- | --- |
| What is `1.13.0`? | A published AstraFlow baseline. Its NuGet version page is [AstraFlow 1.13.0](https://www.nuget.org/packages/AstraFlow/1.13.0). It already contains the accumulated v1 mediator, mapper, projection, diagnostics, testing, convention mapping, analyzer/generator foundations, CLI, integrations, and observability capabilities listed below. |
| What is `2.2.0`? | The previous published release shown in the supplied [NuGet package screenshot](https://www.nuget.org/packages/AstraFlow/2.2.0). It remains available for consumers who pin it. |
| What is `2.3.0`? | The newly published release, per maintainer confirmation. See [AstraFlow 2.3.0 on NuGet](https://www.nuget.org/packages/AstraFlow/2.3.0) and the feature set described below and in PR #57. The page could not be independently fetched from this environment. |
| What is `2.4.0`? | The unreleased source for the general-purpose assertions package and enterprise generated mapping. Generated mediator dispatch remains behind feasibility and behavior-parity gates. |
| What should a current `2.2.0` application do now? | Update only the AstraFlow package IDs it already uses to `2.3.0`, restore, build, and test. The 2.3.0 changelog classifies the release as having no breaking changes; adopting its optional new features requires extra, targeted edits. |
| What should a `2.3.0` application change for `2.4.0`? | No source change is planned for applications that keep using their existing mediator, mapper, and integration paths. Update only package IDs you choose to upgrade, then restore, build, and test. Add the new assertions package to a test project only if you want to use it. |
| How much code changes to “use everything”? | There is no single switch and no good reason to install every package. A version-only update is usually package-version edits plus verification. Adopting optional capabilities is incremental: a tool command or CI edit for CLI exports, and per-mapping declarations for generated mapping. Migrating every mapping is a separate project sized by the application's mapping inventory and unsupported shapes. |

### What the version number means for an application

| Upgrade | Version relationship | What that means for your project |
| --- | --- | --- |
| `1.13.0` → `2.2.0` | Crosses from major version `1` to major version `2`. | Review the intervening release notes and package/TFM requirements. The documented release changes do not require rewriting existing mediator or mapper usage, but this is the larger historical jump and should be tested in the consuming app. |
| `2.2.0` → `2.3.0` | Same major version; minor version advances from `2.2` to `2.3`. | The 2.3.0 changelog classifies breaking changes as none. Existing code generally needs only package-version updates and normal restore/build/tests. New features remain opt-in. |
| `2.3.0` → `2.4.0` | Same major version; minor version advances from `2.3` to `2.4`. | Local API checks pass for 14 existing package APIs and one representative consumer upgrade. Existing application source is not expected to change for existing APIs; new assertions and expanded mapping shapes are opt-in. |
| Pin stays at `2.2.0` | No package reference changes. | The project continues using its current resolved package graph. Nothing in `2.3.0` is activated automatically. |

NuGet does not edit a consuming project when a new version is published. Projects stay on `2.2.0` until someone changes `PackageReference`, `Directory.Packages.props`, a lock file, or the relevant tool manifest and restores again. Updating one AstraFlow package also does not install every sibling package in the AstraFlow family.

## Capability matrix: what each version line gives you

This is a **cumulative** comparison: later rows include prior capabilities unless the row calls out a new addition. “Available by `1.13.0`” means the capability was in that release line, not that every application had installed its optional package. The maintainer reports `2.3.0` published; check each exact package ID and target-framework asset before changing that reference. `2.4.0` entries below describe the current source candidate, not published package claims.

| Capability area | `1.13.0` baseline | `2.2.0` line | `2.3.0` published | Typical application impact |
| --- | --- | --- | --- | --- |
| Mediator contracts and dispatch | Requests, response and void commands, streams, notifications, sender/publisher, pipelines, processors, exception flow, scanning, and handler diagnostics are already present. | Continues the v1 mediator model; no forced handler rewrite is identified in the changelog. | No mediator runtime behavior change is claimed by this PR. | Version-only update: align the package version and run tests. |
| Mapping and query projections | Explicit mapping rules, mapping validation, collections, secure-ID abstraction, named/unnamed projections and projection validation are already present. | Continues the mapper and projection APIs. | Adds new generated mapping behavior; it does not replace or change the runtime `IMapper`/projection path. | Existing mapping code can stay as-is. New generated methods are opt-in. |
| Convention mapping | Optional `AstraFlow.Mapper.Conventions` with profiles, member rules, plans, safe update mapping, constructors/records, converters, and sensitive-write safeguards is available. | Continues the optional package. v2.0 moves shared sensitive-name classification/redaction policy into `AstraFlow.Security`. | No automatic activation or bulk migration of convention profiles. | Keep conventions opt-in; do not install it unless the app deliberately uses it. |
| Testing helpers | Framework-neutral `AstraFlow.Testing` fakes, harnesses, and assertions are available. | Continues the test package. | No test framework dependency or forced test rewrite is added. | Existing tests remain; add app-level cases for any newly adopted generated mapping shapes. |
| Analyzers and generator foundation | Build analyzers, generated mediator registrations, and generated mapper/projection metadata are available. | Also includes the v2.1 source milestone's opt-in executable scalar mapping in the source line; standalone v2.1 NuGet publication was not verified. | Extends generated mapping with supported collections, scalar converters, and explicit polymorphic item mappings. | Only projects that reference the private generator and declare mappings are affected. |
| CLI inspection and reports | `AstraFlow.Cli` already inspects, validates, reports, diffs, scans migrations, and exports JSON/Markdown/SARIF/Mermaid/DOT. | Existing CLI functionality continues. | Adds relational request → handler → response graphs, pipeline/event styles, grouping, Canvas JSON, file output, aliases, and formatting fixes. | Developer/CI tooling only. Snapshot consumers may need to update expected output. |
| Diagnostics and health summaries | Framework-neutral registration reports, findings, JSON/Markdown output, and health-ready summaries are available. | Continues; diagnostics remains a separate package. | Canvas export consumes graph data; does not make diagnostics mandatory. | No runtime change unless the app opts into CLI/diagnostic workflows. |
| ASP.NET Core integration | Optional helpers for minimal APIs/controllers, endpoint filters, problem details, diagnostics endpoints, and health summaries are available. | Continues as an optional package. | No new web-host requirement. | Do not add it to projects that do not use ASP.NET Core integration. |
| FluentValidation integration | Optional request validation pipeline, fail-fast/aggregate behavior, localization hook, and diagnostics are available. | Continues as an optional package. | No change to validator registration or behavior is claimed. | No change unless that integration is used. |
| OpenTelemetry | Optional `ActivitySource`/`Meter` instrumentation, sampling, disable switches, and payload-safe redaction defaults are available. | v2.0 aligns default redaction with shared `AstraFlow.Security` policy. | No telemetry contract change is claimed. | Review custom redaction policy only if the app uses conventions or telemetry. |
| Shared security policy | Not a separate package yet; v1.12 telemetry has its own safe defaults and conventions have their own sensitive-member protections. | v2.0 adds `AstraFlow.Security` with sensitive-name classification and redaction primitives; integrations consume the shared policy. | No additional security package or automatic DTO policy activation is claimed. | Add/use the package only when shared policy primitives are wanted; it is not required for mediator or mapper basics. |
| Release and API governance | v1.13 introduces previous-package API comparison, clean-consumer upgrade smoke, release gates, and migration docs. | The v2.2 release work adds reproducibility/SourceLink checks, SBOM/provenance and signed-tag workflow, dependency review, and release security guidance. | Adds target-specific checked-in public API baselines, API drift CI, changelog category enforcement, and PR compatibility/upgrade-smoke gates. These are maintainer/CI improvements. | Mostly maintainer/CI impact; application source normally does not change. |
| Target framework and package shape | Multi-target support and package separation already exist. | Later source expands to current package-specific target matrix; integrations remain target-limited. | PR does not require retargeting an application as a version bump. | Check each package's exact assets; never infer whole-family support from the umbrella package. |

### Package-by-package inventory

At the `v1.13.0` Git tag, the repository contains the fourteen packages below. `AstraFlow.Security` is the additional fifteenth package introduced in `2.0.0`. Availability in a release line is separate from whether a given application uses the package.

| Package | Role | Present by `1.13.0`? | `2.2.0` / `2.3.0` note |
| --- | --- | --- | --- |
| `AstraFlow` | Convenience package for mediator + mapper. | Yes. | Version `2.3.0` is reported published; the meta package does not pull every optional package. |
| `AstraFlow.Contracts` | Shared mediator abstractions. | Yes. | Use separately for contracts-only boundaries. |
| `AstraFlow.Mediator` | Request/notification/stream dispatch and pipelines. | Yes. | No runtime mediator rewrite is part of PR #57. |
| `AstraFlow.Mapper` | Explicit mappings, collections, projections, secure-ID abstraction. | Yes. | PR #57 adds converter and derived-mapping attributes for generated methods. |
| `AstraFlow.Mapper.Conventions` | Opt-in convention mapping and plan validation. | Yes. | Shared sensitive-name policy is integrated from v2.0. |
| `AstraFlow.Mapper.EntityFrameworkCore` | EF Core projection translation checks. | Yes. | Optional integration; current source is `net10.0`-only. |
| `AstraFlow.Diagnostics` | Registration reports and findings. | Yes. | Separate from the CLI; it can be paired with packages being inspected. |
| `AstraFlow.Testing` | Framework-neutral testing fakes/harnesses. | Yes. | No forced test-framework dependency. |
| `AstraFlow.Analyzers` | Build-time diagnostics. | Yes. | Compiler assets, not runtime library assets. |
| `AstraFlow.Generators` | Generated registration/metadata; later executable mappings. | Yes, foundation only. | PR #57 extends the generated method's supported mapping shapes. |
| `AstraFlow.Cli` | .NET tool for inspect/validate/report/diff/graph/scan. | Yes. | PR #57 extends graph styles and export formats. |
| `AstraFlow.AspNetCore` | ASP.NET Core endpoint/controller helpers. | Yes. | Optional integration; current source is `net10.0`-only. |
| `AstraFlow.FluentValidation` | Validation pipeline integration. | Yes. | Optional integration. |
| `AstraFlow.OpenTelemetry` | Tracing, metrics, sampling, redaction. | Yes. | Uses shared security policy in the v2 line. |
| `AstraFlow.Security` | Shared sensitive-name and redaction policy. | No; added in `2.0.0`. | New in v2; optional for applications that do not need shared policy primitives. |
| `AstraFlow.Assertions` | General-purpose assertions for any .NET test project. | No; implemented for the unreleased `2.4.0` source. | New standalone test package; source is available on this branch, but it is not published and is not included by the `AstraFlow` convenience package. |

The historical screenshot showed the umbrella package at `2.2.0`; the maintainer has since reported `2.3.0` published. A top-level package page does not prove every satellite package's availability or target-framework assets. Check each package ID used by a consumer on NuGet before changing it.

### Why repository pages may look inconsistent

The screenshot supplied earlier in this thread is a historical view showing `AstraFlow` at `2.2.0`; it predates the maintainer's later report that `2.3.0` has been published. Some repository evidence documents an earlier verification snapshot. Such records explain what was tested at that time, but they do not override a later publication. Verify exact satellite package IDs and target-framework assets before updating them.

This environment could not resolve `api.nuget.org` while preparing this guide, so publication is recorded as maintainer-confirmed rather than independently re-queried here. The earlier screenshot verifies the previous `2.2.0` display only. See [compatibility](compatibility.md) and [release evidence](decisions/v2.2-draft-evidence.md) for the scope of repository-recorded verification.

## What changes from `2.2.0` to published `2.3.0`

| Area | `2.2.0` | `2.3.0` published (feature set in PR #57) | What a consumer must change |
| --- | --- | --- | --- |
| Existing mediator and mapper use | Existing runtime APIs and explicit mapping remain available. | The PR declares no breaking changes; existing runtime paths remain the baseline. | Normally update the package versions and run the application's build and tests. No handler or mapping rewrite is required just to take the version update. |
| Public API governance | Release API evidence and workflow controls exist. | Adds checked-in, target-specific API baselines and CI checks for API drift, changelog categories, compatibility, and upgrade smoke. | Usually no application source edits. Contributors may see stricter CI if they change a public AstraFlow API. |
| CLI graphs | Existing graph/report commands are available. | Adds relational request → handler → response Mermaid graphs, pipeline/event views, module/feature grouping, Canvas JSON, and graph-file output. | No runtime application changes. Adopt by updating the CLI tool and the graph command/configuration that produces the desired artifact. |
| CLI formatting fixes | Existing JSON and Markdown exports. | Fixes Mermaid cluster-ID collisions, readable generic signatures, and escaped Markdown cells; adds `-f` and `-o` aliases. | Usually no code edits. If a script compares raw text or snapshots, refresh it and prefer structural JSON comparisons. |
| Generated mapping | The generator supports opt-in typed scalar-property mapping and metadata/registration features in the earlier release line. | Adds supported array/enumerable-to-list mapping, flat scalar element mapping, declared scalar converters, and declared polymorphic collection dispatch. | Nothing changes unless the application opts in. Add a generated partial mapping declaration only for mappings that should use these features. |
| NuGet/release status | Previously published baseline. | The maintainer reports `AstraFlow` `2.3.0` published. This session could not query the NuGet endpoint. | Upgrade package IDs already used after checking those exact IDs and assets; then restore, build, and test. |

The package's 2.3.0 changelog says **Breaking Changes: None**. That is the intended SemVer classification. It is not a promise that every application has zero work: applications may need to update exact package versions, refresh snapshots for output bug fixes, or make code changes when they choose to adopt new opt-in features.

### Exactly what PR #57 adds

| Change | Previous limitation/behavior | `2.3.0` behavior | Consumer consequence |
| --- | --- | --- | --- |
| Relational Mermaid graph | A flat handler-focused graph could place many handlers at one rank and did not express the request/response contract. | When the CLI can read a closed `IRequestHandler<TRequest, TResponse>` declaration, it can render request → handler → response. `Result<T>` wrappers are unwrapped for the response label. | Existing command still works; use `--style relational` or the default where supported. Other handler forms are omitted from this relational view. |
| Pipeline and event views | Graph output did not provide the new conceptual pipeline or focused notification relationships. | `--style pipeline` shows five conceptual stages and discovered behaviors/handlers/notifications/projections; `--style events` shows notification handler relationships. | Tooling-only. Review whether the source scanner can discover the declarations in the consumer's code layout. |
| Grouping and Canvas JSON | No module/feature clusters or structured Canvas graph export. | `--group-by module|feature` controls grouping; `--format canvas-json` emits structured nodes, typed ports, available edges, source locations, clusters, and counts for handlers, notifications, mappings, and projections. | Tooling/visualization integration only. Consumers should treat JSON as a documented output contract and parse structurally. |
| Graph file output and aliases | Output required the prior option spelling/flow. | `-f` aliases `--format`; `-o` / `--output-file` writes graph output to a file. | Update scripts only if convenient; old long options remain. |
| Mermaid cluster IDs | A subgraph and a contained node could share an identifier, confusing Mermaid layout/rendering. | Cluster identifiers are emitted in their own `cluster_` namespace. | Existing Mermaid snapshots may change; graph semantics are clearer. |
| JSON and Markdown readability | Generic type brackets could be JSON Unicode-escaped; signatures containing `|` could break Markdown table columns. | CLI JSON keeps generic signatures readable, and Markdown signature/table content is escaped. | Scripts comparing exact text/snapshots may need expectation updates. HTML consumers must still HTML-encode data; relaxed JSON escaping is not HTML encoding. |
| Collection generation | Executable generated methods covered only the conservative scalar-member subset. | Supported array/enumerable sources can map into list-compatible destinations. Scalar elements and one-level flat element classes with matching public scalar properties are supported. Null source collections become empty lists for non-nullable destinations and remain null for nullable destinations. | Opt in per generated method. This is not arbitrary nested object/collection mapping. |
| Scalar conversion | The generated mapping subset rejected conversion between different scalar property types. | A destination property can declare a validated static converter via `[AstraValueConverter(typeof(Converter), nameof(Converter.Method))]`. It must accept exactly the source property type and return exactly the destination property type; it must be public or same-assembly internal, static, and non-generic. | Add converter declaration/code only for properties that need it; invalid converter shapes are generator errors. |
| Polymorphic collections | The generator had no declared subtype dispatch for collection items. | Repeatable `[AstraDerivedMapping(typeof(SourceChild), typeof(DestinationChild))]` declarations generate runtime subtype dispatch. | Declare every intended subtype. An unknown subtype throws `InvalidOperationException`; it is not silently skipped or guessed. |

For full supported and unsupported generated shapes, see [the generator guide](generators.md). For command syntax, graph limitations, and JSON encoding notes, see [the CLI guide](cli.md). The generator does not automatically replace `IMapper`, convention mapping, or application mapping rules.

## What changes from published `2.3.0` to unreleased `2.4.0`

`2.4.0` is an unreleased additive source candidate. Its local package, test, API, clean-consumer, upgrade, and reproducibility gates pass. It adds the standalone general-purpose assertion package and expands explicitly declared generated mapping for inherited entity properties, safe nullable scalar flows, and immutable record/primary-constructor DTOs. A separate generated mediator execution path remains a candidate governed by its ADR; it is not part of the committed 2.4.0 scope. Existing application paths do not change unless a consumer opts into the new package or generator method shapes.

| Area | `2.3.0` baseline | `2.4.0` target | What a consumer must change |
| --- | --- | --- | --- |
| Existing mediator and mapper use | Published APIs for request dispatch, mapping, projections, integrations, and diagnostics. | Keep existing paths and package boundaries. Local compatibility checks pass for 14 existing package APIs; hosted CI remains. | Normally change package versions only for the package IDs already used, then restore, build, and test. No handler, mapper, database, or application-architecture rewrite is planned. |
| General-purpose assertions | No dedicated package for arbitrary consumer tests. `AstraFlow.Testing` provides AstraFlow-specific fakes, harnesses, and specialized assertions. | Add the standalone `AstraFlow.Assertions` package with value, type, string, collection, dictionary, enum, GUID, range, and sync/async exception assertions. | Optional. Add it to the test project only when adopting it. Existing application projects do not need this package. |
| Enterprise generated mapping | Direct generated mapping supports a narrower mutable-class/scalar and collection subset. | Resolve inherited public source properties; support `Guid`, date scalars and safe nullable value flow; construct positional records and primary-constructor DTOs; allow public init-only members in object initializers. | Opt-in per `[AstraGenerateMapping]` method. Existing mappings keep their current behavior; no intermediate string conversion or wrapper type is needed for supported shapes. Unsupported/ambiguous shapes still produce `AFM001`. |
| Assertion dependencies | The AstraFlow production packages do not need a consumer test runner. AstraFlow's own test projects have their own assertion dependency. | The shipping assertion library has no external package dependencies and does not select a test runner. | Your test runner remains unchanged. Migration from another assertion API is explicit and may require source edits; matching `Should()` syntax does not establish drop-in compatibility. |
| Generated mediator execution | Generated DI registrations and cached runtime dispatch exist; generated execution is not part of the 2.3.0 release claim. | A narrow generated request route is a roadmap target only if it preserves DI scope, pipeline, cancellation, and exception behavior and proves a consumer benefit. | No changes unless that feature passes its gates and you opt into its documented route. Do not infer an AOT or performance guarantee from roadmap status. |
| Package targets | Package target support is package-specific. | `AstraFlow.Assertions` targets `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0` in source. Other packages retain their existing target policy unless documented otherwise. | No whole-solution retargeting is planned. Check the target assets of each package you use. |

### What an existing `2.3.0` project needs to do

| Your intent | Project edits | Expected impact |
| --- | --- | --- |
| Keep using the existing `2.3.0` package graph | None. | The project stays on `2.3.0`; publishing `2.4.0` does not update it automatically. |
| Upgrade existing AstraFlow packages to `2.4.0` | Change only the package versions already listed in project references, central package management, lock files, or tool manifests. | Restore, build, and run the application's tests. Local API checks cover 14 existing package APIs, and one representative net10.0 consumer upgrade passes; no source rewrite is expected for existing APIs. |
| Use general assertions in tests | Add `AstraFlow.Assertions` to the test project after `2.4.0` is published; import `AstraFlow.Assertions` and use the documented API. | Test files change only where assertions are adopted. The test framework and production project references stay as they are. |
| Replace an existing assertion package in tests | Remove its test-project reference only after converting the test code and successfully building/running the suite. | This is a deliberate test-code migration. The first 2.4 release does not promise full source or behavioral compatibility. |
| Adopt generated mediator execution | Only if a supported feature is released; follow its opt-in migration guide. | No change to existing dispatch unless the application opts in. This feature remains evidence-gated. |

The `AstraFlow` convenience package continues to cover mediator and mapper. It does not implicitly install `AstraFlow.Assertions`; add that package directly to the test project if you choose to use it.

For example, a Central Package Management consumer would update the version of a package it already uses:

```xml
<PackageVersion Include="AstraFlow" Version="2.4.0" />
```

The assertion dependency is a separate test-project entry, added only after publication:

```xml
<PackageReference Include="AstraFlow.Assertions" Version="2.4.0" />
```

The planned release does not require a database migration, a new test runner, or a framework retarget solely to keep using existing `2.3.0` APIs. See [Assertions](assertions.md), [Package Selection](package-selection.md), [Generators](generators.md), and the [v2.4 release work plan](plans/v2.4-release.md) for the current scope and limits.

## Impact on an application currently using `2.2.0`

### If you only want to stay current

To move an application from `2.2.0` to the now-published `2.3.0`, update the AstraFlow package IDs it already uses, restore, build, and run its tests. If you use Central Package Management, change `Directory.Packages.props`; otherwise update the relevant project `PackageReference` entries. Keep optional integrations and tools opt-in, and confirm each separately published package ID before changing its version.

For the umbrella package, the version change is one package reference:

```xml
<PackageReference Include="AstraFlow" Version="2.3.0" />
```

With Central Package Management, change the central version and keep project references unversioned:

```xml
<!-- Directory.Packages.props: central version for the package you consume -->
<PackageVersion Include="AstraFlow" Version="2.3.0" />

<!-- Application.csproj -->
<PackageReference Include="AstraFlow" />
```

If the application references individual packages, update those package IDs individually and keep them aligned. Do not add packages just because they are part of the AstraFlow family.

### If you want the new features

| Goal | Likely consumer changes | Scope and limits |
| --- | --- | --- |
| Export relational, pipeline, event, or Canvas graphs | Update/install `AstraFlow.Cli`; add or adjust the CLI invocation in a developer command or CI job. | Tooling-only. The CLI package targets `net10.0` in the current source; check package assets and runtime requirements before installing it. |
| Generate a direct mapper method | Reference `AstraFlow.Mapper` and `AstraFlow.Generators` in the consuming project; add a partial method declaration with `[AstraGenerateMapping]`. | Opt-in per mapping; the generated method is a direct typed method, not an `IMapper` rule and not a wholesale replacement for runtime mapping. |
| Map collection properties to list-compatible destinations | Declare the generated mapping and use one of the supported array/enumerable and element shapes. | Element classes are mapped one level deep from matching public scalar properties; nested object/collection graphs are not implied. |
| Convert a scalar property | Add `[AstraValueConverter(typeof(Converter), nameof(Converter.Method))]` to the destination property. | The converter must satisfy the documented static method and exact source/return type requirements. |
| Map polymorphic collection items | Declare each supported pair with `[AstraDerivedMapping(typeof(SourceChild), typeof(DestinationChild))]`. | Unknown runtime subtypes fail explicitly; they are not silently ignored or guessed. |

Example of an opt-in generated mapping shape:

```csharp
using AstraFlow.Mapper;

public static partial class CustomerMaps
{
    [AstraGenerateMapping]
    public static partial CustomerDto ToDto(Customer source);
}
```

Add only the declarations you want generated. Existing mediator handlers, runtime mapping rules, convention profiles, and projections do not have to be converted to this generator.

## Deep dive: projects on `1.13.0`

`1.13.0` already contains the library features delivered in earlier `1.x` releases. It is not a minimal mediator-only starting point. In particular, the package family already includes mediator, explicit and convention mapping, projections, diagnostics, testing helpers, analyzers/generator foundations, ASP.NET Core and FluentValidation integrations, OpenTelemetry, and the CLI. The `1.13.0` release itself focuses on upgrade confidence: public API comparison, clean consumer upgrade smoke checks, migration guidance, and release workflow gates.

### Release-by-release changes after `1.13.0`

This table distinguishes a source/release milestone from independent NuGet publication evidence. A later package can include code from a milestone even when that milestone's own package page is not verified.

| Release or source milestone | Main change after `1.13.0` | NuGet evidence in this checkout | Likely application impact |
| --- | --- | --- |
| `1.13.1` | Adds compile-checked host/migration samples and sample-build verification; clarifies package deprecation/versioned docs guidance. | The repo treats this as the `1.13.0` follow-up baseline for later API and upgrade checks. | Mostly maintenance and confidence. Existing application code normally stays the same. |
| `2.0.0` | Adds `AstraFlow.Security`, shared sensitive-name classification and redaction policy primitives; integrates those defaults into OpenTelemetry and convention mapping. | The repository records `2.0.0` as a verified comparison baseline. | No forced migration. Add/use the package if the application wants shared policy primitives or custom redaction; review custom convention/telemetry policy behavior if those packages are used. |
| `2.1.0` source/GitHub Release | Adds opt-in executable typed mapping methods through `[AstraGenerateMapping]` and `AstraFlow.Generators`, beyond the earlier generator registration/metadata foundation. | The repository says standalone `2.1.0` NuGet publication was not verified. The feature code is present in the later `2.2.0` source/package line. | No forced migration. Add a generator package reference and declarations only for mappings you want generated. The generated path has a deliberately limited supported shape. |
| `2.2.0` | Adds supply-chain controls: reproducibility, SourceLink verification, SBOM/provenance, signed-tag and repository-signature workflow, dependency review, and security/release guidance. | The supplied Gallery screenshot showed `AstraFlow` `2.2.0`; it is now the previous published release. The screenshot is not proof that every hosted attestation gate ran. | Primarily maintainer/release-pipeline impact. It does not require application database migrations or rewrites of mediator handlers. |
| `2.3.0` published; scope represented by [PR #57](https://github.com/seifmoustafa/AstraFlow/pull/57) | Adds public API governance gates and the CLI graph/export and generated collection/converter/polymorphism capabilities described above. | The maintainer reports `2.3.0` published on 2026-11-10. NuGet was unreachable from this session, so individual satellite assets and fresh consumer-install results were not independently checked. | Version update is classified with no breaking changes. New feature code is opt-in. |

### How the `1.13.0` baseline was built

The later comparison makes more sense when the first published baseline is understood as the endpoint of a long v1 build-out. The release notes show this capability progression:

| Earlier release | Capability added before `1.13.0` | How to think about it when upgrading |
| --- | --- | --- |
| `1.0.0` | Core mediator request dispatch, notifications, pipelines, handler scanning/diagnostics; explicit mapper rules, collections, projections, and secure-ID abstractions; convenience package and initial package-quality assets. | The foundational runtime APIs are already part of the `1.13.0` baseline. |
| `1.1.0` | `AstraFlow.Diagnostics`: registration reports, severity findings, JSON/Markdown exports, and health-ready summary. | Diagnostics is an optional package, not required to dispatch requests. |
| `1.2.0` | Named projection registry and validation, plus optional `AstraFlow.Mapper.EntityFrameworkCore` translation checks. | Existing projections need not be rewritten to upgrade; the EF package remains optional and framework-limited. |
| `1.2.2`–`1.2.3` | Multi-target package assets, compatibility fixes, and clean consumer install verification. | Framework support is package-specific; do not infer it from a single core package. |
| `1.3.0` | `AstraFlow.Testing` fakes, harnesses, and assertion helpers without a test-framework dependency. | Test helpers are additive and belong in test projects. |
| `1.4.0` | Shared `AstraFlow.Contracts`; mediator void requests, streams, stream pipelines, processors, exception actions/handlers, notification strategies, and registration builder. | This mediator surface is already available in `1.13.0`; it is not a v2 migration. |
| `1.5.0`–`1.6.x` | Optional convention mapping; profiles, mapping plans, member configuration, constructors/records, update mapping, diagnostics, and advanced mapping scenarios. | Convention mapping stays opt-in and governed by its profiles; do not assume every mapping is automatically convention-based. |
| `1.8.2`–`1.8.4` | Mapper/projection analyzers; generated mediator registration; generated mapper/projection metadata. | `1.13.0` already has analyzer and generator foundations, but executable typed object mapping arrives later. |
| `1.9.0` | Non-packable benchmark project and benchmark workflow/methodology. | Maintainer evidence, not a runtime dependency or an application feature. |
| `1.10.0` | .NET CLI for inspect, validate, report, diff, graph, migration scan, and common output formats. | The `2.3.0` CLI change extends an existing tool; it does not introduce the CLI. |
| `1.11.0` | Optional ASP.NET Core helpers and FluentValidation mediator behaviors. | Integrations were already available before `1.13.0`; preserve their optional boundaries. |
| `1.12.0` | Optional OpenTelemetry spans/metrics, sampling/disable switches, and redaction defaults. | Observability was already available; shared security policy is a later v2 change. |
| `1.13.0` | Public API compatibility comparison and clean-consumer upgrade smoke checks integrated into release gates. | This is primarily release confidence/governance, not a new runtime API release. |

Together, these releases explain why `1.13.0` is already a mature package-family baseline. An upgrade does not mean re-implementing all of these features; the app only needs the packages and features it actually uses.

### What was already available by `1.13.0`

The exact starting package set varies by application. The package-by-package matrix above shows package presence. The table below calls out useful feature boundaries that can otherwise be mistaken for new v2 features:

| Capability already in the `1.13.0` line | Added earlier | Does a `1.13.0` consumer need it again during upgrade? |
| --- | --- | --- |
| CLI inspect, validate, report, diff, graph, scan, and output formats | `1.10.0` | No. The `2.3.0` CLI work extends graph styles/data and fixes output formatting. |
| ASP.NET Core helpers and FluentValidation behaviors | `1.11.0` | No. Keep or update the optional integrations the app already uses. |
| OpenTelemetry activities, metrics, sampling, and redaction defaults | `1.12.0` | No. `2.0.0` adds shared security-policy plumbing; it does not make telemetry mandatory. |
| Mapper/analyzer/generator foundations and convention mapping | Earlier `1.x` releases, including `1.5.x` and `1.8.x` | No. Generated executable mapping is an additional opt-in path, not an automatic conversion. |
| Upgrade API comparison and clean-consumer smoke workflow | `1.13.0` | No. Those are maintainer verification tools, not new runtime features. |

### How much code must change from `1.13.0`?

| Upgrade intention | Typical change size | Expected edits |
| --- | --- | --- |
| Continue using the same packages and APIs | Small | Update the version on each package reference (or each central version entry), restore, build, and run tests. Existing application source is expected to need no change under the `2.3.0` no-breaking-change classification. |
| Add `AstraFlow.Security` policy to an existing app | Small and localized | Add the package reference and explicitly register/use policy abstractions where desired. Review integration behavior; do not add it merely to use mediator or mapper. |
| Adopt generated mapper methods | Moderate and incremental | Add a private generator reference, add partial mapping declarations, resolve generator diagnostics for unsupported shapes, and test generated output. The existing mapper path can remain for other mappings. |
| Adopt new collection/converter/polymorphic mapping | Per mapping | Add/adjust declarations and attributes for only the relevant properties and subtype pairs. Add coverage for null collections, element property mapping, converter failures, and unknown subtypes in the application. |
| Adopt 2.3 CLI graph output | Tooling-only to moderate | Update/install the tool and add command invocations or CI artifact handling. No application runtime code is needed. |
| Migrate every application mapping to generated methods | Potentially large; optional | Inventory mapping rules and shapes, split supported from unsupported cases, migrate incrementally, compare behavior, and keep unsupported mappings on the existing path. The PR does not automate a full migration. |

There is no honest fixed line-count estimate without the consumer repository. For a version-only update, think **package-reference edits, not a codebase rewrite**. For adopting generated mapping everywhere, the work scales with the number and shape of mapping pairs; unsupported shapes remain manual/runtime mappings until separately supported.

## Framework and dependency checks

The current source target matrix is package-specific. Core packages and `AstraFlow.Mapper` support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`; `AstraFlow.FluentValidation` and `AstraFlow.OpenTelemetry` support `net8.0`, `net9.0`, and `net10.0`; `AstraFlow.AspNetCore` and `AstraFlow.Mapper.EntityFrameworkCore` target `net10.0`; analyzers and generators are compiler assets. Check [compatibility](compatibility.md) and actual NuGet assets for the exact package version before changing a target framework. A package version update does not require retargeting the whole application to `net10.0`; a project using a net10-only optional integration does.

The checked-in project files at tags `v1.13.0` and `v2.2.0` show the same target-framework matrix for packages that existed at both tags. `AstraFlow.Security` is new in the 2.x line and targets the same four frameworks as the core libraries. The 2.3 source does not declare a target-framework expansion. The 2.3 NuGet assets were not retrievable from this session, so this is a source/tag comparison, not a fresh package-asset audit.

| Package group | `1.13.0` | `2.2.0` | `2.3.0` source line | Practical effect |
| --- | --- | --- | --- | --- |
| Core, contracts, mapper, conventions, diagnostics, testing, meta package | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Same | Same | No application retargeting just for the version bump. |
| `AstraFlow.Security` | Not present | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | Same | Optional package introduced in v2.0; only add it when you use the shared policy APIs. |
| ASP.NET Core and EF Core integration | `net10.0` | `net10.0` | `net10.0` | These optional integrations still require a compatible `net10.0` host/project. |
| FluentValidation and OpenTelemetry integrations | `net8.0`, `net9.0`, `net10.0` | Same | Same | Keep only if the application uses these integrations. |
| CLI | `net10.0` tool | `net10.0` tool | `net10.0` tool | Install as a .NET tool; it is not an application runtime library. |
| Analyzer and generator | Analyzer/generator assets, compiler-consumed | Same | Same | Add as private build tooling; do not treat them as runtime dependencies. |

Keep AstraFlow package boundaries intact:

- `AstraFlow` is a convenience package for mediator and mapper; it does not mean every optional integration, analyzer, generator, or CLI tool is installed.
- Add `AstraFlow.Generators` only to projects whose compilation should run the generator, normally with `PrivateAssets="all"`.
- Install `AstraFlow.Cli` as a .NET tool, not as a runtime dependency of the application.
- Keep ASP.NET Core, EF Core, FluentValidation, OpenTelemetry, conventions, analyzers, and security packages limited to projects that use them.

## Compatibility evidence and limits

Do not read “the APIs are intended to be compatible” as “every upgrade route was tested.” The repository records:

| Evidence | What it demonstrates | What it does not demonstrate |
| --- | --- | --- |
| `1.13.0` release workflow | Introduced public XML-member comparison and clean previous-version consumer upgrade smoke. | Does not alone prove compatibility to every later version. |
| `1.13.1` → `2.0.0` recorded smoke | A clean consumer restored, built, and ran against those two package sets. | Does not test every application shape or every old version. |
| `2.0.0` → `2.2.0` recorded smoke | A clean mediator smoke consumer ran against the previous packages and locally packed `2.2.0`; the evidence also records package install/build checks for the listed target frameworks. | It is not a `1.13.0` → `2.3.0` end-to-end test, nor proof for all APIs/behaviors. |
| PR #57 release build/tests/API baselines/pack | The PR source builds, its recorded tests and API baseline checks pass, and packages were packed as `2.3.0`. | The pre-publication clean install attempt was blocked by DNS/network resolution for `api.nuget.org`. The maintainer later reported publication; a fresh post-publication consumer restore/install was not run in this session. |
| Current `2.4.0` source Release build and full test run | All solution projects and samples build with zero warnings/errors; 313 tests pass with zero failures/skips, including 80 generator tests and 24 Assertions tests. | Local verification only; hosted pull-request CI has not run on this branch. |
| Current `2.4.0` package/install smoke | Local packages build consumers on `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`; the Assertions-only consumer references no other AstraFlow package or test runner. | Does not prove publication, signing, remote SourceLink retrieval, or every consumer's target/configuration. |
| Current `2.3.0` → `2.4.0` API check | 14 documented existing package APIs were compared against cached 2.3.0 package artifacts; public API baselines pass for 46 package/target combinations. | The new `AstraFlow.Assertions` package has no 2.3.0 baseline. The CLI tool is outside this library API comparison. |
| Current `2.3.0` → `2.4.0` upgrade smoke | A clean consumer restored, built, and ran with 2.3.0 package references, then repeated after upgrading those references to 2.4.0 and adding Assertions. | One representative net10.0 consumer, not every application's package mix or every target framework. |
| Current `2.0.0` → `2.4.0` CI compatibility and upgrade smoke | The CI-equivalent local checks compare 14 package APIs where 2.0.0 artifacts exist, then build and run one clean net10.0 consumer before and after upgrading to 2.4.0. | This does not prove a direct `1.13.0` → `2.4.0` upgrade or guarantee every application's package mix and behavior. |
| Current `2.4.0` package reproducibility | All 16 package `.nupkg` and `.snupkg` artifacts reproduced with matching SHA-256 hashes. | Local deterministic repack check; does not prove signing, provenance, or publication. |

The upgrade path from `1.13.0` to `2.3.0` is supported by staged history and an additive-change intent, but must not be described as one complete tested upgrade. The local 2.3.0-to-2.4.0 smoke adds useful representative evidence, not a guarantee for every application. For production, upgrade in a branch, keep package versions aligned, build and run the app's test suite, and exercise the mediator/mapping/integration paths it uses. If the application depends on subtle behavior, add a consumer-specific regression test before rollout.

## Safe upgrade checklist

1. Record the exact AstraFlow package IDs and versions currently referenced. Include central package files and tool manifests.
2. Confirm each desired `2.3.0` package ID is available and its assets support the consuming target framework; the maintainer reports the `AstraFlow` package published. If a package ID is not yet available to your feed, keep its `2.2.0` reference until it is.
3. Update only packages the application uses; keep their versions aligned.
4. Restore and build all target frameworks. Inspect newly visible compiler/analyzer diagnostics.
5. Run application tests for response requests, void requests, streams, notifications, mappings, projections, and integrations actually in use.
6. If adopting generators, verify generated source and diagnostics in a clean consumer build; keep runtime mappings for unsupported shapes.
7. If adopting CLI output, validate JSON structurally and refresh intentional Markdown/Mermaid snapshots after the escaping fixes.
8. Deploy using the application's normal release process; the AstraFlow package upgrade itself does not run application database migrations.

## Sources in this repository

- [Changelog](../CHANGELOG.md) — release-by-release feature statements and breaking-change classification.
- [Compatibility guide](compatibility.md) — target frameworks and release-status cautions.
- [Migration cookbook](migration-cookbook.md) — consumer upgrade and package-reference workflows.
- [Package selection](package-selection.md) — package ownership and optional dependencies.
- [Generator guide](generators.md) and [CLI guide](cli.md) — feature scopes and limitations.
- [2.2.0 verification evidence](decisions/v2.2-draft-evidence.md) — exact recorded package and upgrade checks.
