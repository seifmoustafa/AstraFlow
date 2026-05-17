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
$env:DOTNET_CLI_HOME='.dotnet-cli-home'
dotnet restore AstraFlow.slnx --configfile NuGet.Config --disable-parallel
dotnet build AstraFlow.slnx -c Release --no-restore /m:1 /p:UseSharedCompilation=false
dotnet test AstraFlow.slnx -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mediator/AstraFlow.Mediator.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow.Mapper/AstraFlow.Mapper.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
dotnet pack src/AstraFlow/AstraFlow.csproj -c Release --no-build --no-restore /m:1 /p:UseSharedCompilation=false
```

Run these commands from the AstraFlow repository root.

## Pull Request Checklist

- Public API changes are documented.
- Tests cover success and failure paths.
- Error messages are actionable.
- Package build passes with warnings as errors.
- Samples still compile.
- No application-specific abstractions are introduced into package projects.
