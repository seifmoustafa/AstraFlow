# Publishing

AstraFlow releases are gated and should be published from GitHub Actions, not from a developer workstation.

## Release Repository Setup

Recommended flow:

1. Create a dedicated public GitHub repository for AstraFlow.
2. Place the AstraFlow package family at the repository root.
3. Initialize and push the release repository:

```powershell
git init
git add .
git commit -m "Initial AstraFlow v1 package family"
git branch -M main
git remote add origin https://github.com/seifmoustafa/AstraFlow.git
git push -u origin main
```

Do not keep the release repository as a nested Git repository inside another product repository. A nested repository is easy to confuse with a submodule and can hide source changes from the parent repository.

## Preferred Publish Method

Use NuGet Trusted Publishing when it is available for the final GitHub repository. Trusted Publishing is preferred because it avoids long-lived API keys.

If Trusted Publishing is not available, use a scoped NuGet API key stored only as a GitHub Actions repository secret.

## GitHub Secret Name

The workflow expects a repository secret named:

```text
NUGET_API_KEY
```

This is the secret name only. It is not a key value. Never commit the real value to source control or documentation.

## NuGet API Key Setup

Create the key at `nuget.org/account/apikeys` with the narrowest practical scope:

- Key Name: `AstraFlow GitHub Actions Publish`
- Expires In: shortest practical period; rotate before expiry.
- Package Owner: the NuGet owner account or organization.
- Scope: `Push`.
- Push option: `Push new packages and package versions`.
- Package selection for first publish: glob pattern `AstraFlow*`.

The first publish needs to cover:

- `AstraFlow`
- `AstraFlow.Contracts`
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Mapper.EntityFrameworkCore`
- `AstraFlow.Diagnostics`
- `AstraFlow.AspNetCore`
- `AstraFlow.FluentValidation`
- `AstraFlow.OpenTelemetry`
- `AstraFlow.Testing`
- `AstraFlow.Analyzers`
- `AstraFlow.Generators`
- `AstraFlow.Cli`

After the first publish, tighten the key to exact package IDs if NuGet offers them in the package list.

Store the copied key value only in:

`GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret`

Use the exact secret name `NUGET_API_KEY`.

## Secret Handling Rules

- Do not paste the key value into markdown files.
- Do not paste the key value into workflow YAML.
- Do not paste the key value into terminal commands as part of normal release work.
- Do not send the key value in chat, screenshots, email, issue comments, or pull requests.
- If the key is exposed, revoke it immediately and create a new one.

## Release Flow

1. Update `Version`, `AssemblyVersion`, and `FileVersion` in `Directory.Build.props`.
2. Update `CHANGELOG.md`.
3. Run `docs/release-checklist.md`.
4. Push to `main` or a `release/**` branch and let `AstraFlow CI` complete successfully.
5. Open GitHub Actions.
6. Run `Publish AstraFlow Packages`.
7. Type `PUBLISH` when prompted.
8. Verify all packages on NuGet.
9. Install the packages into a clean sample project.
10. Verify a clean sample consumer can migrate from local AstraFlow project references to NuGet `PackageReference` entries after package verification succeeds.

`AstraFlow CI` reads the package version from `Directory.Build.props`, creates the `v{Version}` GitHub Release/tag after tests, package checks, and clean install verification pass, and skips release creation when that version already has a release. This keeps one GitHub Release per package version.

Published NuGet package versions are immutable. If a package is already visible on NuGet and its README, release notes, icon, tags, or repository metadata need to change, publish a new patch version with the corrected metadata instead of trying to replace the existing version.

## Listing Packages On NuGet

After the first push, NuGet may show the packages under `Unlisted Packages`. Unlisted packages are published and installable by exact package ID and version, but they are hidden from search results.

To list them publicly:

1. Open `nuget.org/account/Packages`.
2. Expand `Unlisted Packages`.
3. For each package, click the edit button.
4. Open the package version management page.
5. Choose the listing/relist option for the version being published.
6. Save the change.
7. Repeat for:
   - `AstraFlow`
   - `AstraFlow.Contracts`
   - `AstraFlow.Mediator`
- `AstraFlow.Mapper`
- `AstraFlow.Security`
- `AstraFlow.Mapper.Conventions`
   - `AstraFlow.Mapper.EntityFrameworkCore`
   - `AstraFlow.Diagnostics`
   - `AstraFlow.AspNetCore`
   - `AstraFlow.FluentValidation`
   - `AstraFlow.OpenTelemetry`
   - `AstraFlow.Testing`
   - `AstraFlow.Analyzers`
   - `AstraFlow.Generators`
   - `AstraFlow.Cli`

NuGet indexing can take a few minutes after relisting. During that time, the packages may install by exact ID before they appear in search.

## Local Package Verification

Use local packing only to verify artifacts before release:

```powershell
.\scripts\pack.ps1
.\scripts\verify-api-compatibility.ps1 -PreviousVersion 1.13.1 -CurrentVersion 2.0.0 -AllowMissingPreviousPackages
.\scripts\verify-upgrade-smoke.ps1 -PreviousVersion 1.13.1 -CurrentVersion 2.0.0 -AllowMissingPreviousPackages
.\scripts\verify-sample-builds.ps1 -Configuration Release
```

For the first public NuGet publish, previous AstraFlow package versions may not exist on NuGet yet. The `-AllowMissingPreviousPackages` flag makes that explicit: current package install and sample verification still run, while previous-version API and upgrade comparison become warnings until a published baseline exists.

Expected package artifacts:

- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.2.0.0.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.2.0.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.2.0.0.nupkg`
- `src/AstraFlow.Security/bin/Release/AstraFlow.Security.2.0.0.nupkg`
- `src/AstraFlow.Mapper.Conventions/bin/Release/AstraFlow.Mapper.Conventions.2.0.0.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.2.0.0.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.2.0.0.nupkg`
- `src/AstraFlow.AspNetCore/bin/Release/AstraFlow.AspNetCore.2.0.0.nupkg`
- `src/AstraFlow.FluentValidation/bin/Release/AstraFlow.FluentValidation.2.0.0.nupkg`
- `src/AstraFlow.OpenTelemetry/bin/Release/AstraFlow.OpenTelemetry.2.0.0.nupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.2.0.0.nupkg`
- `src/AstraFlow.Analyzers/bin/Release/AstraFlow.Analyzers.2.0.0.nupkg`
- `src/AstraFlow.Generators/bin/Release/AstraFlow.Generators.2.0.0.nupkg`
- `src/AstraFlow.Cli/bin/Release/AstraFlow.Cli.2.0.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.2.0.0.nupkg`

For `2.0.0`, inspect the packages before publishing:

- each package should include `README.md`, `CHANGELOG.md`, `LICENSE`, the package icon, XML docs, DLLs, and `.nuspec`,
- `AstraFlow.Contracts`, core packages, `AstraFlow.Mapper.Conventions`, `AstraFlow.Security`, and `AstraFlow.Testing` must include `lib/netstandard2.0/`, `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`,
- `AstraFlow.Mapper.EntityFrameworkCore` must include `lib/net10.0/` only,
- `AstraFlow.AspNetCore` must include `lib/net10.0/` only,
- `AstraFlow.FluentValidation` must include `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`,
- `AstraFlow.OpenTelemetry` must include `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`,
- `AstraFlow.Analyzers` must include `analyzers/dotnet/cs/AstraFlow.Analyzers.dll` and no runtime `lib/` assets,
- `AstraFlow.Generators` must include `analyzers/dotnet/cs/AstraFlow.Generators.dll` and no runtime `lib/` assets,
- `AstraFlow.Cli` must install as the `astraflow` .NET tool.

Do not commit `bin/`, `obj/`, `.nupkg`, or `.snupkg` files.

## Emergency Manual Publish

Manual workstation publishing is an emergency fallback only. Prefer GitHub Actions.

If manual publishing is approved, use `scripts/publish-nuget.ps1` from a private terminal session and remove the temporary environment variable immediately after publishing.

Do not save the key in shell profiles, `.env` files, source files, or documentation.

## After Publish: Consumer Verification

After NuGet shows all fourteen packages, verify clean consumer projects can consume the published runtime packages and install the CLI tool:

```xml
<PackageReference Include="AstraFlow.Mediator" Version="2.0.0" />
<PackageReference Include="AstraFlow.Mapper" Version="2.0.0" />
<PackageReference Include="AstraFlow.Security" Version="2.0.0" />
<PackageReference Include="AstraFlow.Mapper.Conventions" Version="2.0.0" />
<PackageReference Include="AstraFlow.Mapper.EntityFrameworkCore" Version="2.0.0" />
<PackageReference Include="AstraFlow.Diagnostics" Version="2.0.0" />
<PackageReference Include="AstraFlow.AspNetCore" Version="2.0.0" />
<PackageReference Include="AstraFlow.FluentValidation" Version="2.0.0" />
<PackageReference Include="AstraFlow.OpenTelemetry" Version="2.0.0" />
```

Use `AstraFlow.Contracts` in shared contract projects that should not reference the mediator runtime:

```xml
<PackageReference Include="AstraFlow.Contracts" Version="2.0.0" />
```

Use `AstraFlow.Testing` only in test projects:

```xml
<PackageReference Include="AstraFlow.Testing" Version="2.0.0" />
```

Use `AstraFlow.Analyzers` as a private analyzer reference:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="2.0.0" PrivateAssets="all" />
```

Use `AstraFlow.Generators` as a private generator reference:

```xml
<PackageReference Include="AstraFlow.Generators" Version="2.0.0" PrivateAssets="all" />
```

Install and smoke-test the CLI package:

```powershell
dotnet tool install --global AstraFlow.Cli --version 2.0.0
astraflow inspect .
```

Use the meta-package only where both mediator and mapper are intentionally needed:

```xml
<PackageReference Include="AstraFlow" Version="2.0.0" />
```

Then run:

```powershell
dotnet restore samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln
dotnet build samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln --no-restore
dotnet test samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln --no-build --no-restore
```

Sample consumers that are meant to validate NuGet consumption should not keep local AstraFlow project references after package-reference migration is verified.


