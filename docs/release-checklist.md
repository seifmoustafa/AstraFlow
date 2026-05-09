# Release Checklist

## Source

- Public APIs have XML documentation.
- Package projects build with warnings as errors.
- Samples compile.
- Tests pass in Release configuration.
- README, changelog, roadmap, security policy, and publishing docs are current.
- No competitor migration pages or retired package references exist in AstraFlow docs.

## Package

- `PackageId`, title, description, tags, license, repository URL, symbols, and README metadata are present.
- `.nupkg` and `.snupkg` files are produced for every package.
- Package contents include `README.md`, `LICENSE`, `.nuspec`, library DLL, PDB, and XML docs.
- No `bin/`, `obj/`, temporary logs, local SDK cache folders, `.nupkg`, or `.snupkg` files are committed.

## Consumer Validation

- NEXORA builds against the package projects.
- NEXORA focused backend tests pass.
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
