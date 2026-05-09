# Release Checklist

## Source

- Public APIs have XML documentation.
- Package projects build with warnings as errors.
- Samples compile.
- Tests pass in Debug and Release where practical.
- README, changelog, roadmap, security policy, and publishing docs are current.

## Package

- `PackageId`, title, description, tags, license, repository URL, symbols, and README metadata are present.
- `.nupkg` and `.snupkg` files are produced for every package.
- Package contents include `README.md` and `LICENSE`.
- No `bin/`, `obj/`, temporary logs, or local SDK cache folders are committed.

## Consumer Validation

- NEXORA builds against the package projects.
- NEXORA focused backend tests pass.
- CLI templates generate AstraFlow namespaces.
- Docs portal has been synced for all supported languages.

## Publish

- Version is final.
- Changelog entry exists.
- Git tag exists.
- Dedicated GitHub repository exists and CI passes on `main`.
- `NUGET_API_KEY` exists in repository secrets.
- NuGet API key is scoped to `AstraFlow*` or exact package IDs.
- Publish workflow is run manually by a release owner.
- Packages are verified on NuGet after publishing.
