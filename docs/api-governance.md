# API Governance

This guide documents the AstraFlow public API review rules introduced in `1.13.0` and tightened for `1.13.1`.

## Goal

`1.13.1` treats API compatibility as a release gate. The package family should not accidentally remove public types, members, XML-documented APIs, target assets, or package identities during a minor or patch release.

## Release Gate

Before publishing, run:

```powershell
.\scripts\verify-api-compatibility.ps1 -PreviousVersion 1.13.0 -CurrentVersion 1.13.1
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

## Package Deprecation Process

Package deprecation is allowed only when a package has a documented replacement, the replacement is already published, and the changelog explains the consumer action required.

Before marking a package deprecated:

- document the package being deprecated and the replacement package or migration path,
- add migration cookbook examples when code changes are required,
- keep the package installable while the supported minor line remains active,
- add `ObsoleteAttribute` guidance to public APIs when API-level deprecation is more precise than package-level deprecation,
- avoid removing package identities before a major version.

Deprecation entries should use changelog sections named `Deprecated`, `Changed`, and `Migration Notes` where applicable.

## Versioned Documentation Strategy

The `main` branch documentation describes the current release candidate or latest stable line. Release tags preserve the exact documentation shipped with each package version.

For each release:

- tag the repository with `v<version>` after the package metadata and docs match the release,
- keep package install snippets aligned with `Directory.Build.props`,
- keep historical release facts in `CHANGELOG.md` instead of rewriting old entries,
- link NuGet and GitHub release notes back to the matching tag,
- use patch releases for documentation corrections that affect current consumers.

If a hosted docs site is added later, it should publish versioned docs from tags and keep `/latest` pointed at the newest stable release.

## Baseline Policy

`1.13.1` uses the previously published `1.13.0` packages as the compatibility baseline.

Future releases should compare against the latest stable published version unless a release owner explicitly chooses a different baseline and records the reason in the release notes.
