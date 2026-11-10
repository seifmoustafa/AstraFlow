# AstraFlow Version Comparison and Upgrade Guide

This guide is the maintainer-facing, evidence-qualified comparison of AstraFlow `1.13.0`, `2.2.0`, and the unreleased `2.3.0` work in [PR #57](https://github.com/seifmoustafa/AstraFlow/pull/57). It separates released package evidence from repository source, and separates a version-only upgrade from adopting optional features.

## Read the version numbers correctly

| Label | What it means | Can a consumer install it from NuGet? |
| --- | --- | --- |
| `2.2.0` | The current version displayed on the top-level `AstraFlow` NuGet page in the maintainer-provided screenshot dated 2026-11-10. | Yes for the `AstraFlow` package shown there. Check each separately named `AstraFlow.*` package before assuming the whole package family has the same published version. |
| `2.3.0` | The version in this repository's `Directory.Build.props` and the target of PR #57. It includes the PR's unreleased work. | Not until that exact package version is published. A source version, branch, tag, or successful local pack is not itself a NuGet release. |
| `2.2.1` | Text retained in the PR branch name `codex/astra-flow-2.2.1-graph-generator`. | It does not set a package version and does not mean this PR will publish `2.2.1`. |

**For this PR, the intended package version is `2.3.0`.** `Directory.Build.props` and the PR package artifacts set `2.3.0`; the branch name's `2.2.1` text is stale naming only. The PR is not a NuGet publication; publishing requires the separate release process.

## Executive comparison

| Question | Clear answer |
| --- | --- |
| What is `1.13.0`? | A published AstraFlow baseline. Its NuGet version page is [AstraFlow 1.13.0](https://www.nuget.org/packages/AstraFlow/1.13.0). It already contains the accumulated v1 mediator, mapper, projection, diagnostics, testing, convention mapping, analyzer/generator foundations, CLI, integrations, and observability capabilities listed below. |
| What is `2.2.0`? | The supplied [NuGet Gallery package page](https://www.nuget.org/packages/AstraFlow/2.2.0) screenshot shows the top-level `AstraFlow` package at `2.2.0`. This is the user's current published baseline. The screenshot confirms that package page, not the publication and asset status of every separately named package. |
| What is `2.3.0`? | The version currently set in the repository and intended for PR #57. It adds the work described below, but it is not installable from NuGet until the corresponding package IDs are actually published. |
| What should a current `2.2.0` application do now? | Keep using `2.2.0` until the exact `2.3.0` package IDs it needs are published. No immediate application source rewrite is required by the PR's `Breaking Changes: None` classification. |
| How much code changes to “use everything”? | There is no single switch and no good reason to install every package. A version-only update is usually package-version edits plus verification. Adopting optional capabilities is incremental: a tool command or CI edit for CLI exports, and per-mapping declarations for generated mapping. Migrating every mapping is a separate project sized by the application's mapping inventory and unsupported shapes. |

## Capability matrix: what each version line gives you

This is a **cumulative** comparison: later rows include prior capabilities unless the row calls out a new addition. “Available by `1.13.0`” means the capability was in the `1.13.0` source/release line, not that every application had installed its optional package. For `2.2.0`, the Gallery screenshot establishes the umbrella package version; exact publication for all satellite packages must be checked package by package.

| Capability area | `1.13.0` baseline | `2.2.0` line | `2.3.0` in PR #57 | Typical application impact |
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
| Release and API governance | v1.13 introduces previous-package API comparison, clean-consumer upgrade smoke, release gates, and migration docs. | The repository's v2.2 change record adds reproducibility/SourceLink checks, SBOM/provenance and signed-tag workflow, dependency review, and release security guidance. The package screenshot alone does not prove that every release-only hosted attestation/signature gate ran. | Adds target-specific checked-in public API baselines, API drift CI, changelog category enforcement, and PR compatibility/upgrade-smoke gates. | Mostly maintainer/CI impact; application source normally does not change. |
| Target framework and package shape | Multi-target support and package separation already exist. | Later source expands to current package-specific target matrix; integrations remain target-limited. | PR does not require retargeting an application as a version bump. | Check each package's exact assets; never infer whole-family support from the umbrella package. |

### Package-by-package inventory

At the `v1.13.0` Git tag, the repository contains the fourteen packages below. `AstraFlow.Security` is the additional fifteenth package introduced in `2.0.0`. Availability in a release line is separate from whether a given application uses the package.

| Package | Role | Present by `1.13.0`? | `2.2.0` / `2.3.0` note |
| --- | --- | --- | --- |
| `AstraFlow` | Convenience package for mediator + mapper. | Yes. | Source package version is `2.2.0`/`2.3.0` by line; it does not pull every optional package. |
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

The exact `2.2.0` publication status of every satellite package is not established by the umbrella package screenshot alone. Before switching a consumer, verify every package ID it uses and its target-framework assets on NuGet.

### Why repository pages may look inconsistent

The supplied NuGet screenshot shows `AstraFlow` at `2.2.0`. Some checked-in release-status text still says that `2.2.0` publication or the post-publication package-family checks are unverified. Those statements describe repository verification records, not the branch's version number. The screenshot establishes the displayed version for the umbrella package; it does not prove that every separate package, such as `AstraFlow.Mediator`, `AstraFlow.Mapper`, or `AstraFlow.Generators`, is present at that same version. Verify each package and its target-framework assets before treating it as a consumer baseline.

The current local environment could not resolve `api.nuget.org` while preparing this guide. Therefore this document uses the supplied Gallery screenshot for the umbrella package and does not claim a live, per-package NuGet audit. See [compatibility](compatibility.md) and [release evidence](decisions/v2.2-draft-evidence.md) for the repository's recorded verification scope.

## What changes from `2.2.0` to the PR's `2.3.0`

| Area | `2.2.0` | `2.3.0` in PR #57 | What a consumer must change |
| --- | --- | --- | --- |
| Existing mediator and mapper use | Existing runtime APIs and explicit mapping remain available. | The PR declares no breaking changes; existing runtime paths remain the baseline. | Normally update the package versions and run the application's build and tests. No handler or mapping rewrite is required just to take the version update. |
| Public API governance | Release API evidence and workflow controls exist. | Adds checked-in, target-specific API baselines and CI checks for API drift, changelog categories, compatibility, and upgrade smoke. | Usually no application source edits. Contributors may see stricter CI if they change a public AstraFlow API. |
| CLI graphs | Existing graph/report commands are available. | Adds relational request → handler → response Mermaid graphs, pipeline/event views, module/feature grouping, Canvas JSON, and graph-file output. | No runtime application changes. Adopt by updating the CLI tool and the graph command/configuration that produces the desired artifact. |
| CLI formatting fixes | Existing JSON and Markdown exports. | Fixes Mermaid cluster-ID collisions, readable generic signatures, and escaped Markdown cells; adds `-f` and `-o` aliases. | Usually no code edits. If a script compares raw text or snapshots, refresh it and prefer structural JSON comparisons. |
| Generated mapping | The generator supports opt-in typed scalar-property mapping and metadata/registration features in the earlier release line. | Adds supported array/enumerable-to-list mapping, flat scalar element mapping, declared scalar converters, and declared polymorphic collection dispatch. | Nothing changes unless the application opts in. Add a generated partial mapping declaration only for mappings that should use these features. |
| NuGet/release status | The supplied page shows `2.2.0`. | Source is prepared as `2.3.0`; publication is separate and has not happened as part of this PR. | Do not change consumers to `2.3.0` until the exact package IDs they use are published and verified. |

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

## Impact on an application currently using `2.2.0`

### If you only want to stay current

Before `2.3.0` is published, keep the existing `2.2.0` references. After publication, update every AstraFlow package used by the application to a compatible, published `2.3.0` version, restore, build, and run its tests. If you use Central Package Management, make the change in `Directory.Packages.props`; otherwise update the relevant project `PackageReference` entries. Keep optional integrations and tools opt-in.

For the umbrella package, the version change is one package reference:

```xml
<PackageReference Include="AstraFlow" Version="2.3.0" />
```

With Central Package Management, change the central version and keep project references unversioned:

```xml
<!-- Directory.Packages.props: do this only after the package is published -->
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
| `2.2.0` | The repository's v2.2 change record adds supply-chain controls: reproducibility, SourceLink verification, SBOM/provenance, signed-tag and repository-signature workflow, dependency review, and security/release guidance. | The supplied Gallery screenshot shows the top-level `AstraFlow` at `2.2.0`; this checkout does not contain a live per-package audit or proof that all release-only hosted gates ran. | Primarily maintainer/release-pipeline impact. It does not require application database migrations or rewrites of mediator handlers. |
| `2.3.0` in [PR #57](https://github.com/seifmoustafa/AstraFlow/pull/57) | Adds public API governance gates and the CLI graph/export and generated collection/converter/polymorphism capabilities described above. | Source and local package artifacts only; NuGet publication is not established by this PR. | Version update is intended to remain source-compatible. New feature code is opt-in. |

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
| PR #57 release build/tests/API baselines/pack | The PR source builds, its recorded tests and API baseline checks pass, and packages can be packed as `2.3.0`. | A clean package install from NuGet is not verified; restore was blocked by DNS/network resolution for `api.nuget.org`. No `2.3.0` publication is established. |

The upgrade path from `1.13.0` to `2.3.0` is therefore supported by staged history and an additive-change intent, but must not be described as one complete tested upgrade. For a production application, upgrade in a branch, keep package versions aligned, build and run the app's test suite, and exercise the mediator/mapping/integration paths it uses. If the application depends on subtle behavior, add a consumer-specific regression test before rollout.

## Safe upgrade checklist

1. Record the exact AstraFlow package IDs and versions currently referenced. Include central package files and tool manifests.
2. Check each desired `2.3.0` package is published and its assets support the consuming target framework. Until then, keep consuming published `2.2.0` packages or use an explicitly configured local package feed for validation.
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

