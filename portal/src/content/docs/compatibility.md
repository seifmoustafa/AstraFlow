# Target Frameworks & Compatibility

AstraFlow multi-targets modern .NET releases and `netstandard2.0` across its core packages so shared class libraries, background workers, and ASP.NET Core hosts can adopt the suite consistently.

## Framework Support Check

Verify compatibility across your solution projects before referencing host-specific adapters:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <!-- Core packages support netstandard2.0, net8.0, net9.0, and net10.0 -->
    <TargetFramework>net10.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
</Project>
```

## Target Framework Matrix

| Target Group | Supported TFMs | Packages |
| --- | --- | --- |
| **Core & Testing** | `netstandard2.0`, `net8.0`, `net9.0`, `net10.0` | `AstraFlow`, `AstraFlow.Contracts`, `AstraFlow.Mediator`, `AstraFlow.Mapper`, `AstraFlow.Mapper.Conventions`, `AstraFlow.Diagnostics`, `AstraFlow.Security`, `AstraFlow.Testing`, `AstraFlow.Assertions` |
| **Cross-LTS Integrations** | `net8.0`, `net9.0`, `net10.0` | `AstraFlow.FluentValidation`, `AstraFlow.OpenTelemetry` |
| **Modern Runtime Hosts & Tools** | `net10.0` | `AstraFlow.AspNetCore`, `AstraFlow.Mapper.EntityFrameworkCore`, `AstraFlow.Cli` |
| **Roslyn Build-Time Tooling** | `netstandard2.0` | `AstraFlow.Analyzers`, `AstraFlow.Generators` |

## C# Language & Nullable Support

- **Nullable reference types (`#nullable enable`):** Every public interface, option type, attribute, and extension method carries accurate nullable annotations (`IMapper.Map<TDestination>(object? source)`, `ISecureIdCodec.TryDecrypt(string? encryptedId)`).
- **`netstandard2.0` compatibility:** Shared polyfills such as `IsExternalInit` are included internally where needed so `netstandard2.0` consumers work cleanly with modern C# compilers.
- **Cancellation tokens everywhere:** `ISender`, `IStreamSender`, `IPublisher`, handlers, behaviors, pre/post processors, and exception handlers propagate `CancellationToken` consistently across async boundaries.

## Trimming, Startup Determinism, and AOT Readiness

- **Source-generated DI and mapping:** Pair `AstraFlow.Generators` (`AddAstraFlowGeneratedMediatorRegistrations()` and `[AstraGenerateMapping]`) to replace assembly scanning and runtime reflection for known handler and DTO types.
- **Explicit mapping catalogs:** `IDeclaredObjectMappingRule` and `IProjection<,>` avoid runtime dynamic proxy generation and expose deterministic metadata at compile time and startup.
- **Safe `netstandard2.0` analyzer hosting:** Because `AstraFlow.Analyzers` and `AstraFlow.Generators` target `netstandard2.0`, they load inside both Visual Studio / IDE design-time builds and modern .NET SDK builds.

## Related Guides

- Choose the right module footprint in [Package Selection Guide](/docs/package-selection).
- Enable compile-time registration in [Compile-Time Mediator Registration](/docs/generated-dispatch).
- Enable zero-reflection DTO mapping in [Source-Generated Object Mapping](/docs/generated-mapping).
