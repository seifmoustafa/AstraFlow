# AstraFlow Version and Upgrade Guide

This guide explains the difference between the published `2.2.0` package shown on the [NuGet Gallery](https://www.nuget.org/packages/AstraFlow), the `2.3.0` work in PR #57, and the cumulative changes for applications still using `1.13.0`.

## Read the version numbers correctly

| Label | What it means | Can a consumer install it from NuGet? |
| --- | --- | --- |
| `2.2.0` | The current version displayed on the top-level `AstraFlow` NuGet page in the maintainer-provided screenshot dated 2026-11-10. | Yes for the `AstraFlow` package shown there. Check each separately named `AstraFlow.*` package before assuming the whole package family has the same published version. |
| `2.3.0` | The version in this repository's `Directory.Build.props` and the target of PR #57. It includes the PR's unreleased work. | Not until that exact package version is published. A source version, branch, tag, or successful local pack is not itself a NuGet release. |
| `2.2.1` | Text retained in the PR branch name `codex/astra-flow-2.2.1-graph-generator`. | It does not set a package version and does not mean this PR will publish `2.2.1`. |

**For this PR, the intended package version is `2.3.0`.** The version is determined by package metadata, not by the branch name. The PR is not a NuGet publication; publishing requires the separate release process.

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

## Impact on an application currently using `2.2.0`

### If you only want to stay current

Before `2.3.0` is published, keep the existing `2.2.0` references. After publication, update every AstraFlow package used by the application to a compatible, published `2.3.0` version, restore, build, and run its tests. If you use Central Package Management, make the change in `Directory.Packages.props`; otherwise update the relevant project `PackageReference` entries. Keep optional integrations and tools opt-in.

For the umbrella package, the version change is one package reference:

```xml
<PackageReference Include="AstraFlow" Version="2.3.0" />
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
| `2.2.0` | Adds release supply-chain controls: reproducibility, SourceLink verification, SBOM/provenance, signed-tag and repository-signature workflow, dependency review, and security/release guidance. | The supplied Gallery screenshot shows the top-level `AstraFlow` at `2.2.0`; this checkout does not contain a live per-package audit. | Primarily maintainer/release-pipeline impact. It does not require application database migrations or rewrites of mediator handlers. |
| `2.3.0` in [PR #57](https://github.com/seifmoustafa/AstraFlow/pull/57) | Adds public API governance gates and the CLI graph/export and generated collection/converter/polymorphism capabilities described above. | Source and local package artifacts only; NuGet publication is not established by this PR. | Version update is intended to remain source-compatible. New feature code is opt-in. |

### What was already available by `1.13.0`

The exact starting package set varies by application. The release history shows that `1.13.0` is downstream of these capabilities:

| Capability already in the `1.13.0` line | Added earlier | Does a `1.13.0` consumer need it again during upgrade? |
| --- | --- | --- |
| CLI inspect, validate, report, diff, graph, scan, and output formats | `1.10.0` | No. The 2.3 CLI work extends graph styles/data and fixes output formatting. |
| ASP.NET Core helpers and FluentValidation behaviors | `1.11.0` | No. Keep or update the optional integrations the app already uses. |
| OpenTelemetry activities, metrics, and redaction defaults | `1.12.0` | No. `2.0.0` adds shared security-policy plumbing; it does not make telemetry mandatory. |
| Mapper/analyzer/generator foundations and convention mapping | Earlier `1.x` releases, including `1.8.x` | No. Generated executable mapping is an additional opt-in path, not an automatic conversion. |
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
