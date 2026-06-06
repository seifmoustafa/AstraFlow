# API Governance

This guide documents the AstraFlow public API review rules introduced in `1.13.0`.

## Goal

`1.13.0` treats API compatibility as a release gate. The package family should not accidentally remove public types, members, XML-documented APIs, target assets, or package identities during a minor or patch release.

## Release Gate

Before publishing, run:

```powershell
.\scripts\verify-api-compatibility.ps1 -PreviousVersion 1.12.0 -CurrentVersion 1.13.0
```

The script compares XML documentation member IDs from the previous published NuGet packages with the currently packed packages. Missing member IDs are treated as potential breaking changes.

The publish workflow runs the same check after packing and before publishing.

## What The Check Catches

- Removed public types.
- Removed public methods, properties, fields, events, and constructors.
- Renamed public APIs.
- Signature changes that produce a different XML documentation member ID.
- Missing XML documentation assets in packed packages.

## What Still Needs Human Review

The script is a compatibility guard, not a complete design review. Maintainers must still review:

- changed behavior behind the same API,
- changed default option values,
- changed exception behavior,
- changed target frameworks,
- changed package dependencies,
- changed analyzer severities,
- obsolete APIs and replacement guidance,
- package dependency flow between optional integrations and core packages.

## SemVer Rules

Patch releases may fix bugs and documentation without broad new public surface.

Minor releases may add packages, APIs, diagnostics, tests, and release gates without breaking existing consumers.

Major releases are required for intentional breaking API removals, incompatible behavior changes, target framework removals, or package identity changes.

## Reviewing Intentional Breaks

If a breaking change is unavoidable:

- move the release to the next major version,
- document the old API and replacement API,
- add a migration example,
- add a changelog entry under breaking changes,
- update the version support policy,
- keep old APIs obsolete with replacement guidance when practical.

## Baseline Policy

`1.13.0` uses the previously published `1.12.0` packages as the compatibility baseline.

Future releases should compare against the latest stable published version unless a release owner explicitly chooses a different baseline and records the reason in the release notes.
