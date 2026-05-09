# Publishing

AstraFlow releases are gated and should be published from GitHub Actions, not from a developer workstation.

## Release Repository Setup

Recommended flow:

1. Create a dedicated public GitHub repository for AstraFlow.
2. Copy the contents of `packages/AstraFlow` into that repository root.
3. Initialize and push the release repository:

```powershell
git init
git add .
git commit -m "Initial AstraFlow v1 package family"
git branch -M main
git remote add origin https://github.com/astra-flow/astraflow.git
git push -u origin main
```

Do not keep the release repository as a nested Git repository inside the NEXORA monorepo. A nested repository is easy to confuse with a submodule and can hide source changes from the parent repository.

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
- `AstraFlow.Mediator`
- `AstraFlow.Mapper`

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
4. Create and push a release tag such as `v1.0.0`.
5. Open GitHub Actions.
6. Run `Publish AstraFlow Packages`.
7. Type `PUBLISH` when prompted.
8. Verify all packages on NuGet.

## Local Package Verification

Use local packing only to verify artifacts before release:

```powershell
.\scripts\pack.ps1
```

Expected package artifacts:

- `src/AstraFlow.Mediator/bin/Release/AstraFlow.Mediator.1.0.0.nupkg`
- `src/AstraFlow.Mapper/bin/Release/AstraFlow.Mapper.1.0.0.nupkg`
- `src/AstraFlow/bin/Release/AstraFlow.1.0.0.nupkg`

Do not commit `bin/`, `obj/`, `.nupkg`, or `.snupkg` files.

## Emergency Manual Publish

Manual workstation publishing is an emergency fallback only. Prefer GitHub Actions.

If manual publishing is approved, use `scripts/publish-nuget.ps1` from a private terminal session and remove the temporary environment variable immediately after publishing.

Do not save the key in shell profiles, `.env` files, source files, or documentation.
