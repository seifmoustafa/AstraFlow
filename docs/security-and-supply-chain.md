# Security and Supply Chain

This guide describes the repository controls AstraFlow can verify and the settings a repository owner must enable.

## Vulnerability reporting

Use GitHub's **Security → Advisories → Report a vulnerability** private reporting flow when it is enabled. The repository owner must enable private vulnerability reporting in the repository's **Settings → Security → Private vulnerability reporting** page. Until that setting is enabled, do not put sensitive vulnerability details in a public issue; contact the maintainer privately through the repository's owner contact channel.

The maintainer should acknowledge a report within 72 hours, assess impact against supported package versions, coordinate a fix and disclosure date with the reporter, and publish a GitHub Security Advisory after affected consumers have a remediation path. Do not promise a fixed remediation deadline before impact and release constraints are understood.

## Pull request dependency review

`.github/workflows/dependency-review.yml` checks dependency changes in pull requests and fails when a newly introduced dependency has a high or critical vulnerability. The workflow uses a reviewed, commit-pinned action and read-only repository permissions. Dependabot checks both NuGet dependencies and GitHub Actions weekly, including updates to commit-pinned actions. Review updates for compatibility and security before merging them.

GitHub requires the repository's **Dependency graph** to be enabled for Dependency Review. Enable it under **Settings → Code security and analysis → Dependency graph**. If it is disabled, the action fails before it can assess the pull request; this is a repository setting and cannot be enabled by the workflow.

## Release artifact verification

The release workflow verifies the following evidence:

- Repeat packing from the same Release build produces byte-identical `.nupkg` and `.snupkg` files.
- Symbol packages contain SourceLink data; on a release build, the SourceLink tool retrieves the commit-pinned source files and validates their checksums.
- SPDX SBOMs describe the packaged release artifacts.
- GitHub OIDC/Sigstore attestations bind package and SBOM digests to the workflow run. Consumers can verify them with `gh attestation verify`.
- Release tags are signed with keyless Sigstore/gitsign identity and checked against the expected GitHub Actions workflow identity and OIDC issuer before the GitHub Release is created.
- After NuGet publishing, the workflow downloads each exact package version from NuGet.org and runs `dotnet nuget verify --all`.

NuGet.org repository-signs accepted package uploads. AstraFlow does not author-sign packages and does not hold a package-signing private key. NuGet signatures and GitHub artifact attestations establish different claims and must be checked independently. Gitsign signatures are verifiable through Sigstore/Rekor; GitHub may not show them as its own **Verified** GPG badge.

## Recommended branch protection

In **Settings → Branches → Branch protection rules** (or repository rulesets), protect `main` with:

- Require pull requests and at least one maintainer approval.
- Require the `build-test-pack` and `dependency-review` checks.
- Require all conversations to be resolved before merge.
- Require branches to be up to date before merging, if the repository's PR volume permits it.
- Block force pushes and branch deletion.
- Do not allow bypass by default; keep narrowly scoped emergency bypasses documented.

These settings are external to the repository and must be configured by a maintainer. The release workflow does not mutate repository settings. Confirm the actual required-check names in GitHub after the workflows have completed at least once.

## Trusted publishing setup

NuGet Trusted Publishing must match the workflow's exact claims:

- Workflow file: `publish-nuget.yml` (filename only).
- GitHub environment: `nuget`.
- Repository owner and name: `seifmoustafa` / `AstraFlow`.
- Package glob: `AstraFlow*`, with push of new packages and versions enabled.

The publish workflow remains manually dispatched and requires the exact `PUBLISH` confirmation. It never stores a long-lived NuGet API key in the repository.

## Consumer commands

Verify a GitHub Release's artifacts and provenance:

```powershell
gh attestation verify .\AstraFlow.2.2.0.nupkg --repo seifmoustafa/AstraFlow
```

Inspect the included SPDX document and compare the NuGet package signature:

```powershell
dotnet nuget verify --all .\AstraFlow.2.2.0.nupkg
```

The repository stores release SBOMs and attestations as GitHub Release assets and GitHub's attestation service. Consumers should verify the artifact digest they downloaded, not rely on a filename alone.
