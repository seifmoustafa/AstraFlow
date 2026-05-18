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
- `AstraFlow.Testing`

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
4. Create and push a release tag such as `v1.4.1`.
5. Open GitHub Actions.
6. Run `Publish AstraFlow Packages`.
7. Type `PUBLISH` when prompted.
8. Verify all packages on NuGet.
9. Install the packages into a clean sample project.
10. Verify a clean sample consumer can migrate from local AstraFlow project references to NuGet `PackageReference` entries after package verification succeeds.

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
   - `AstraFlow.Mapper.EntityFrameworkCore`
   - `AstraFlow.Diagnostics`
   - `AstraFlow.Testing`

NuGet indexing can take a few minutes after relisting. During that time, the packages may install by exact ID before they appear in search.

## Local Package Verification

Use local packing only to verify artifacts before release:

```powershell
.\scripts\pack.ps1
```

Expected package artifacts:

- `src/AstraFlow.Contracts/bin/Release/AstraFlow.Contracts.1.4.1.nupkg`
- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.4.1.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.4.1.nupkg`
- `src/AstraFlow.Mapper.EntityFrameworkCore/bin/Release/AstraFlow.Mapper.EntityFrameworkCore.1.4.1.nupkg`
- `src/AstraFlow.Diagnostics/bin/Release/AstraFlow.Diagnostics.1.4.1.nupkg`
- `src/AstraFlow.Testing/bin/Release/AstraFlow.Testing.1.4.1.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.4.1.nupkg`

For `1.4.1`, inspect the packages before publishing:

- each package should include `README.md`, `CHANGELOG.md`, `LICENSE`, the package icon, XML docs, DLLs, and `.nuspec`,
- `AstraFlow.Contracts`, core packages, and `AstraFlow.Testing` must include `lib/netstandard2.0/`, `lib/net8.0/`, `lib/net9.0/`, and `lib/net10.0/`,
- `AstraFlow.Mapper.EntityFrameworkCore` must include `lib/net10.0/` only.

Do not commit `bin/`, `obj/`, `.nupkg`, or `.snupkg` files.

## Emergency Manual Publish

Manual workstation publishing is an emergency fallback only. Prefer GitHub Actions.

If manual publishing is approved, use `scripts/publish-nuget.ps1` from a private terminal session and remove the temporary environment variable immediately after publishing.

Do not save the key in shell profiles, `.env` files, source files, or documentation.

## After Publish: Consumer Verification

After NuGet shows all seven packages, verify clean consumer projects can consume the published runtime packages:

```xml
<PackageReference Include="AstraFlow.Mediator" Version="1.4.1" />
<PackageReference Include="AstraFlow.Mapper" Version="1.4.1" />
<PackageReference Include="AstraFlow.Mapper.EntityFrameworkCore" Version="1.4.1" />
<PackageReference Include="AstraFlow.Diagnostics" Version="1.4.1" />
```

Use `AstraFlow.Contracts` in shared contract projects that should not reference the mediator runtime:

```xml
<PackageReference Include="AstraFlow.Contracts" Version="1.4.1" />
```

Use `AstraFlow.Testing` only in test projects:

```xml
<PackageReference Include="AstraFlow.Testing" Version="1.4.1" />
```

Use the meta-package only where both mediator and mapper are intentionally needed:

```xml
<PackageReference Include="AstraFlow" Version="1.4.1" />
```

Then run:

```powershell
dotnet restore samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln
dotnet build samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln --no-restore
dotnet test samples/AstraFlow.SampleConsumer/AstraFlow.SampleConsumer.sln --no-build --no-restore
```

Sample consumers that are meant to validate NuGet consumption should not keep local AstraFlow project references after package-reference migration is verified.
