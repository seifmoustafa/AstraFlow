# Migration Cookbook

This cookbook documents consumer-confidence checks introduced in `1.13.0` and expanded in `1.13.1`.

## Goal

Consumers should be able to upgrade from the previous stable AstraFlow package version to the current version without hidden source changes unless a breaking change is explicitly documented.

## Previous-Version Upgrade Smoke

After packing current packages, run:

```powershell
.\scripts\verify-upgrade-smoke.ps1 -PreviousVersion 1.13.0 -CurrentVersion 1.13.1
```

The script:

- creates a clean `net10.0` console consumer,
- installs the previous stable AstraFlow packages from NuGet,
- restores, builds, and runs a mediator smoke flow,
- upgrades the same consumer to the locally packed current packages,
- restores, builds, and runs the same smoke flow again.

The publish workflow runs this check after package asset verification and public API compatibility verification.

## Compile-Checked Cookbook Sample

`samples/MigrationCookbookSample` is the compile-checked companion for this guide. It exercises:

- mediator request/handler usage through `ISender`,
- explicit mapper registration through `AddAstraFlowMapper`,
- a declared mapping rule with secure ID conversion.

Build it directly when editing this guide:

```powershell
dotnet build .\samples\MigrationCookbookSample\MigrationCookbookSample.csproj -c Release
```

## Local Project References To Package References

When validating a consumer migration from source references to NuGet packages:

1. Remove local `ProjectReference` entries to AstraFlow projects.
2. Add focused `PackageReference` entries from `docs/package-selection.md`.
3. Restore from NuGet or a local package source.
4. Build the consumer.
5. Run its tests.
6. Confirm no local AstraFlow project references remain unless the consumer intentionally tests source projects.

## Minimal Mediator Upgrade Check

Use this flow for application projects that only depend on mediator behavior:

```powershell
dotnet add package AstraFlow.Contracts --version 1.13.1
dotnet add package AstraFlow.Mediator --version 1.13.1
dotnet build
dotnet test
```

Verify that response requests, void requests, stream requests, and notifications still compile and run.

## Mapper Upgrade Check

Use this flow for mapping-heavy consumers:

```powershell
dotnet add package AstraFlow.Mapper --version 1.13.1
dotnet add package AstraFlow.Mapper.Conventions --version 1.13.1
dotnet build
dotnet test
```

Verify explicit mapping rules, convention profiles, projection registrations, and startup validation.

## Integration Upgrade Check

Install only the integration packages a consumer actually uses:

```powershell
dotnet add package AstraFlow.AspNetCore --version 1.13.1
dotnet add package AstraFlow.FluentValidation --version 1.13.1
dotnet add package AstraFlow.OpenTelemetry --version 1.13.1
```

Then verify application startup, diagnostics endpoint safety, validation behavior, and telemetry configuration.

## Migration Failure Triage

If an upgrade fails:

- check target framework compatibility first,
- check package selection and optional integration boundaries,
- check analyzer diagnostics for newly visible compile-time issues,
- compare the failing public API against `docs/api-reference.md`,
- run `.\scripts\verify-api-compatibility.ps1` to detect accidental API removal,
- run `.\scripts\verify-package-install.ps1 -Version 1.13.1` to isolate package install issues.
