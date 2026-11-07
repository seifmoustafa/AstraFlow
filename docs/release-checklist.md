# Release Checklist

## Source

- Public APIs have XML documentation.
- Package projects build with warnings as errors.
- Samples compile.
- Tests pass in Release configuration.
- README, changelog, roadmap, security policy, and publishing docs are current.
- API reference, architecture guide, package selection guide, compatibility guide, migration cookbook, API governance guide, diagnostics guide, testing guide, mediator scenarios, mapper scenarios, projection guides, EF Core guide, troubleshooting docs, and community release guide are current.
- No competitor migration pages or retired package references exist in AstraFlow docs.
- Current target framework support is documented accurately.
- Candidate target framework support is not described as published support.

## Package

- `PackageId`, title, description, tags, license, repository URL, symbols, and README metadata are present.
- `.nupkg` and `.snupkg` files are produced for every package.
- Package contents include `README.md`, `CHANGELOG.md`, `LICENSE`, package icon, repository docs, `.nuspec`, library DLL, PDB, and XML docs.
- Package contents include `docs/compatibility.md`, `docs/package-selection.md`, and `docs/future-ideas.md`.
- Package dependency groups match the supported target frameworks.
- Analyzer packages include analyzer assets under `analyzers/dotnet/cs` and do not include unintended runtime `lib/` assets.
- No `bin/`, `obj/`, temporary logs, local SDK cache folders, `.nupkg`, or `.snupkg` files are committed.

## Compatibility

- Current supported target frameworks are listed in README and `docs/compatibility.md`.
- Any new target framework has a passing build.
- Any new target framework has relevant passing tests.
- Any new target framework has a clean install smoke test.
- EF Core package target support is verified separately from core mapper target support.
- No package advertises direct .NET Framework or `netstandard2.0` support until package assets exist for that target.
- `scripts/verify-package-install.ps1` passes for the release version.
- `scripts/verify-package-reproducibility.ps1` produces identical package and symbol package hashes from the same Release build outputs.
- `scripts/verify-package-sourcelink.ps1` validates packaged SourceLink metadata; for a release commit, run it with `-VerifyRemoteSources` to fetch and checksum commit-pinned files.
- `scripts/verify-nuget-signatures.ps1 -Version <version>` passes against every exact package version on NuGet.org after publication.
- `scripts/verify-api-compatibility.ps1` passes against the previous published version.
- `scripts/verify-upgrade-smoke.ps1` passes from the previous published version to the current packed version.
- Clean install verification compiles and runs a mediator consumer that sends a response request, a void request, a stream request, and a notification.

## Consumer Validation

- Representative consumer applications build against the package projects or packed packages.
- Representative consumer application tests pass.
- CLI templates generate AstraFlow namespaces.
- Docs portal has been synced for all supported languages.

## Repository

- Dedicated GitHub repository exists.
- CI passes on `main`.
- Branch protection is configured before public contribution begins.
- Dependency Review passes for the PR and its status check is configured as a required check in GitHub branch protection.
- GitHub's Dependency graph is enabled under repository **Settings → Code security and analysis** so Dependency Review can run.
- The GitHub Release includes an SPDX SBOM and OIDC attestations for packages and SBOM.
- The release workflow identity-verifies a Sigstore/gitsign signed annotated tag before creating the GitHub Release.
- Private vulnerability reporting is enabled in GitHub repository settings.
- `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and `LICENSE` are present.

## Publish

- Version is final.
- Changelog entry exists.
- `scripts/verify-changelog-entry.ps1` confirms the current package version has a non-empty changelog entry before CI produces release notes.
- Git tag exists.
- An active NuGet Trusted Publishing policy matches the repository owner, repository, workflow filename (`publish-nuget.yml`), and GitHub environment (`nuget`).
- Trusted Publishing is scoped to the AstraFlow package family (`AstraFlow*`) and push of new packages and package versions only.
- Publish workflow is run manually by a release owner.
- Packages are verified on NuGet after publishing.
- `scripts/verify-nuget-signatures.ps1 -Version <version>` passes against each exact version on NuGet.org.
- Any exposed key is revoked immediately.

## Post-Publish Consumer Verification

- A clean sample project can install `AstraFlow`, `AstraFlow.Mediator`, and `AstraFlow.Mapper`.
- A clean sample project can install `AstraFlow.Diagnostics`.
- A clean sample project can install `AstraFlow.Security`.
- A clean sample project can install `AstraFlow.Testing`.
- A clean sample project can install `AstraFlow.Mapper.EntityFrameworkCore`.
- A clean sample project can install `AstraFlow.AspNetCore`.
- A clean sample project can install `AstraFlow.FluentValidation`.
- A clean sample project can install `AstraFlow.OpenTelemetry`.
- A clean sample project can install `AstraFlow.Analyzers`.
- A clean sample project can install `AstraFlow.Generators`.
- A clean sample project can restore each package using the documented package versions.
- A clean sample project can build after installing the focused package set recommended in `docs/package-selection.md`.
- A clean sample consumer can migrate from local AstraFlow project references to NuGet package references.
- Sample consumer restore succeeds from NuGet.
- Sample consumer build succeeds.
- Sample consumer tests pass.
- Scans show no active local AstraFlow project references in sample consumers that should use NuGet packages.
