# Release Checklist

## Source

- Public APIs have XML documentation.
- Package projects build with warnings as errors.
- Samples compile.
- Tests pass in Release configuration.
- README, changelog, roadmap, security policy, and publishing docs are current.
- API reference, architecture guide, package selection guide, compatibility guide, diagnostics guide, testing guide, mediator scenarios, mapper scenarios, projection guides, EF Core guide, troubleshooting docs, and community release guide are current.
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
- `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, and `LICENSE` are present.

## Publish

- Version is final.
- Changelog entry exists.
- Git tag exists.
- Trusted Publishing is configured, or a scoped GitHub Actions secret named `NUGET_API_KEY` exists.
- NuGet key scope is limited to `AstraFlow*` for first publish or exact package IDs after first publish.
- Publish workflow is run manually by a release owner.
- Packages are verified on NuGet after publishing.
- Any exposed key is revoked immediately.

## Post-Publish Consumer Verification

- A clean sample project can install `AstraFlow`, `AstraFlow.Mediator`, and `AstraFlow.Mapper`.
- A clean sample project can install `AstraFlow.Diagnostics`.
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
