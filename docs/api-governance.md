# Public API Governance

AstraFlow treats package public APIs, analyzer diagnostics, generator contracts, CLI commands, and package identities as compatibility-sensitive. Every public API change must be visible in the pull request, have a SemVer classification, and have a migration path when consumers need one.

## CI gates

`scripts/verify-public-api-baselines.ps1` compares the XML documentation member IDs emitted by each library target against the checked-in files under `docs/api-baselines/<project>/<tfm>.txt`. CI runs it after the Release build. The baseline is target-specific, so a symbol disappearing from one target is reported even if it remains on another target.

To update the baseline for an intentional API change:

1. Build the Release solution so the XML documentation reflects the source being reviewed.
2. Run `./scripts/update-public-api-baselines.ps1`.
3. Review every added and removed member ID against the source diff and the SemVer rules below.
4. Include the baseline diff in the same pull request as the code and changelog entry.

Do not run the update script to make CI pass without reviewing the API change. An unreviewed source change fails the baseline gate. The update script is an explicit author action; CI never rewrites baselines.

The baseline covers documented member IDs. It catches changes to member identity and most parameter or generic type signature changes represented in XML IDs. It does **not** encode nullability annotations, parameter names, every CLR metadata detail, behavior, or undocumented members. Keep XML documentation complete, review source and package diffs, and run `scripts/verify-api-compatibility.ps1` against a verified prior published package when available. The package comparison is a second release check, not a replacement for the checked-in source baseline.

The CLI is a .NET tool and does not generate XML library API documentation. Its commands and machine-readable output are governed by CLI contract tests and documentation instead of a library XML-ID baseline.

## Pull request API review

Every pull request that changes `docs/api-baselines/`, public declarations, analyzer IDs or severities, generator contracts, CLI output, target frameworks, or package IDs must:

- identify the affected packages and consumer scenarios,
- classify the change as breaking, added, changed, fixed, deprecated, removed, or security-related in `CHANGELOG.md` (use `None.` for empty categories),
- explain source, binary, behavioral, and target-framework compatibility,
- include migration guidance for any consumer action,
- review XML documentation, nullable annotations, and optional package dependency boundaries,
- have a maintainer approve the API and baseline diff before merge.

CI enforces that all release changelog categories exist, all library target baselines exist, and no baseline drift remains. A baseline edit records author intent; the pull request review remains the approval.

## SemVer classification

- **Patch:** compatible bug fixes, security fixes, documentation corrections, and implementation changes that do not alter public contracts.
- **Minor:** additive APIs, packages, supported targets, diagnostics, and opt-in capabilities. Existing supported consumer code remains source and binary compatible.
- **Major:** removed or incompatible public APIs, package identity changes, dropped supported targets, or intentional incompatible behavior/default changes.

If a change appears breaking, preserve the old API where practical and release the replacement additively. Otherwise move it to a major version, document the consumer impact and migration, and keep the old API available as obsolete for a transition period when safe.

## Obsolete API policy

Every `[Obsolete]` attribute must state an actionable replacement by name, for example `[Obsolete("Use MapGenerated instead.")]`. Vague messages such as “deprecated” or “no longer supported” are insufficient. The CI check `scripts/verify-obsolete-guidance.ps1` rejects obsolete attributes without a `Use <replacement> instead` message. Include a migration example and a `Deprecated` changelog entry. Do not obsolete security-sensitive APIs without a reviewed replacement and documented behavior.

Remove an obsolete API only in a major release, except when legal or security obligations require earlier removal. Document the removal and migration in the changelog and release notes.

Package deprecation requires a published replacement package, a migration path, and an explicit consumer action. Keep the old package installable during its support window.

## Release branches

- `main` is the integration branch. Feature work lands through reviewed pull requests.
- Cut `release/<major>.<minor>` from `main` after scope freeze when a release needs stabilization. Only release-blocking fixes, release metadata, and documentation corrections go there.
- Make release-branch fixes through pull requests, then merge or cherry-pick the reviewed fix back to `main` so the branches do not diverge.
- Do not develop the next minor on a release branch. Delete the branch after the release is complete and its support window closes.
- Create version tags only for reviewed release commits after the repository release gates pass. A branch name alone does not imply that the branch or packages are released.

## Support window

AstraFlow actively validates and documents the latest stable minor line. When a new minor line becomes stable, the previous minor receives security and critical-fix consideration for 90 days; after that, fixes are released on the latest line. A major line remains supported only while it contains the latest stable minor. Backports are discretionary when the change is risky or the affected dependencies are no longer maintained.

The support statement is about maintainer validation and fixes. Old packages may remain downloadable from NuGet after support ends. Record verified package publication and tag status independently; source version metadata does not prove a release was published.

## Historical compatibility check

`scripts/verify-api-compatibility.ps1` compares XML member IDs from a prior NuGet package with locally packed output. It is useful when that package is verified as a stable baseline. Do not use `-AllowMissingPreviousPackages` as evidence that a comparison passed; a skipped package is unverified. The checked-in target-specific baselines remain the required pull request gate.
