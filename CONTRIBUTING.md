# Contributing

Thank you for improving AstraFlow.

## Principles

- Keep the core explicit, small, and stable.
- Prefer clear diagnostics over hidden behavior.
- Keep application-specific concepts outside AstraFlow packages.
- Add optional behavior through separate packages when it would make the core less predictable.
- Every public API needs XML documentation.
- Every behavior change needs tests.

## Local Validation

```powershell
$env:DOTNET_CLI_HOME='E:\Projects\NEXORA\.dotnet-cli-home'
dotnet restore packages/AstraFlow/AstraFlow.slnx --configfile packages/AstraFlow/NuGet.Config --disable-parallel
dotnet build packages/AstraFlow/AstraFlow.slnx -c Release --no-restore /m:1 /p:UseSharedCompilation=false
dotnet test packages/AstraFlow/AstraFlow.slnx -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack packages/AstraFlow/src/AstraFlow.Mediator/AstraFlow.Mediator.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack packages/AstraFlow/src/AstraFlow.Mapper/AstraFlow.Mapper.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack packages/AstraFlow/src/AstraFlow/AstraFlow.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
```

When the folder is split into its own repository, run the same commands from the repository root without the `packages/AstraFlow/` prefix.

## Pull Request Checklist

- Public API changes are documented.
- Tests cover success and failure paths.
- Error messages are actionable.
- Package build passes with warnings as errors.
- Samples still compile.
- No application-specific abstractions are introduced into package projects.
