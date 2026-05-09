# Publishing

AstraFlow publishing is intentionally gated. Do not publish directly from a developer machine unless the release workflow is unavailable and the release owner approves the fallback.

## Repository Setup

Recommended flow:

1. Create a dedicated GitHub repository for AstraFlow.
2. Copy the contents of `packages/AstraFlow` into that repository root.
3. Initialize git there:

```powershell
git init
git add .
git commit -m "Initial AstraFlow v1 package family"
git branch -M main
git remote add origin https://github.com/astra-flow/astraflow.git
git push -u origin main
```

Do not run `git init` inside the monorepo folder as the long-term publishing shape. A nested repository inside NEXORA is easy to confuse with a submodule. Keep this monorepo folder as the development source until the dedicated repo is ready.

## Required Secrets

Configure this repository secret before publishing:

- `NUGET_API_KEY`

## NuGet API Key Setup

For the screen at `nuget.org/account/apikeys`:

- Key Name: `AstraFlow GitHub Actions Publish`
- Expires In: choose the shortest practical period. `365 days` is acceptable for a first release, but rotate it before expiry.
- Package Owner: your NuGet owner account or organization.
- Select Scopes: `Push`
- Push option: `Push new packages and package versions`
- Select Packages: use glob pattern `AstraFlow*` for the first publish so all three package IDs are covered:
  - `AstraFlow`
  - `AstraFlow.Mediator`
  - `AstraFlow.Mapper`

After the first publish, you can tighten the key to exact package IDs if NuGet offers them in the package list.

Copy the API key once and store it only in GitHub Actions secrets as `NUGET_API_KEY`. Do not paste it into source files, terminals you record, screenshots, chat, or documentation.

NuGet also offers Trusted Publishing for GitHub Actions in some accounts. If it is available for the final repository, prefer it because it avoids long-lived API keys.

## Release Flow

1. Update `Version`, `AssemblyVersion`, and `FileVersion` in `Directory.Build.props`.
2. Update `CHANGELOG.md`.
3. Run the release checklist.
4. Create a tag such as `v1.0.0`.
5. Run the NuGet publish workflow from GitHub Actions.
6. Verify all three packages are visible on NuGet:
   - `AstraFlow.Mediator`
   - `AstraFlow.Mapper`
   - `AstraFlow`

## Manual Pack Commands

```powershell
dotnet build AstraFlow.slnx -c Release /m:1 /p:UseSharedCompilation=false
dotnet test AstraFlow.slnx -c Release --no-build /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mediator/AstraFlow.Mediator.csproj -c Release --no-build /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mapper/AstraFlow.Mapper.csproj -c Release --no-build /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow/AstraFlow.csproj -c Release --no-build /m:1 /p:UseSharedCompilation=false
```

Or use:

```powershell
.\scripts\pack.ps1
```

## Manual Push Fallback

```powershell
.\scripts\publish-nuget.ps1 -ApiKey $env:NUGET_API_KEY -SkipPack
```
