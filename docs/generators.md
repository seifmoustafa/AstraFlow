# AstraFlow Generators

AstraFlow `1.8.3` introduced the `AstraFlow.Generators` package foundation for generated mediator component registration. AstraFlow `1.8.4` adds generated mapper and projection metadata on top of that foundation.

The generator emits readable code for components discovered in the current compilation. Runtime assembly scanning remains available and should stay as the fallback path while apps validate generated output in their own build.

## Install

Use the generator package from application or library projects that reference `AstraFlow.Mediator`:

```powershell
dotnet add package AstraFlow.Generators --version 1.13.1
```

Generator packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Generators" Version="1.13.1" PrivateAssets="all" />
```

## Scope In 1.8.4

`1.8.4` includes the `1.8.3` generated mediator registration APIs and adds `AstraFlow.Mapper.AstraFlowGeneratedMapperMetadataRegistration` with:

- `AddAstraFlowGeneratedMapperMetadata(this IServiceCollection services)`,
- `GetAstraFlowGeneratedMapperMetadata()`,
- generated mapping rule implementation metadata,
- declared mapping rule flags,
- generated projection source/destination metadata,
- generated parameterized projection metadata,
- generated named projection flags,
- deterministic ordering by implementation and service type.

The `1.8.3` mediator generator still emits `AstraFlow.Mediator.AstraFlowGeneratedMediatorRegistration` with:

- `AddAstraFlowGeneratedMediatorRegistrations(this IServiceCollection services)`,
- closed `IRequestHandler<TRequest>` registrations,
- closed `IRequestHandler<TRequest, TResponse>` registrations,
- closed `INotificationHandler<TNotification>` registrations,
- closed `IStreamRequestHandler<TRequest, TResponse>` registrations,
- closed request pre-processor registrations,
- closed request post-processor registrations,
- closed request exception action registrations,
- closed request exception handler registrations,
- deterministic ordering by service type and implementation type,
- readable generated C# with fully qualified type names.

It does not include:

- generated runtime mapper dispatch tables,
- generated convention mapping plans,
- generated diagnostics metadata integration,
- open generic handler registration,
- a generator-only runtime mode,
- migration guidance that removes runtime scanning.

## Usage

Register AstraFlow mediator normally, then add the generated component registrations:

```csharp
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddAstraFlowMediator();
services.AddAstraFlowGeneratedMediatorRegistrations();
```

`AddAstraFlowMediator()` registers the mediator runtime services. `AddAstraFlowGeneratedMediatorRegistrations()` adds deterministic compile-time registrations for components found in the current project. If you pass marker assemblies to `AddAstraFlowMediator(...)`, runtime scanning remains the fallback path and may duplicate generated component registrations.

The repository also includes `samples/GeneratedMediatorRegistrationSample`, which builds the generated registration extension from a consumer-style app.

Generated mapper metadata can be registered and read through dependency injection:

```csharp
using AstraFlow.Mapper;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

services.AddAstraFlowMapper(typeof(Program));
services.AddAstraFlowGeneratedMapperMetadata();

using var provider = services.BuildServiceProvider();
var metadata = provider
    .GetRequiredService<IGeneratedMapperMetadataProvider>()
    .GetMetadata();
```

Or read directly without a service provider:

```csharp
var metadata = AstraFlowGeneratedMapperMetadataRegistration.GetAstraFlowGeneratedMapperMetadata();
```

## Generated Shape

The generated extension method is intentionally simple:

```csharp
namespace AstraFlow.Mediator
{
    public static class AstraFlowGeneratedMediatorRegistration
    {
        public static IServiceCollection AddAstraFlowGeneratedMediatorRegistrations(
            this IServiceCollection services)
        {
            services.AddScoped<IRequestHandler<Ping, string>, PingHandler>();
            return services;
        }
    }
}
```

The actual generated file uses fully qualified names to avoid relying on imports in user code.

## Safety Notes

- Keep runtime scanning available until your app has verified generated registrations in CI.
- Use `PrivateAssets="all"` for generator package references.
- Treat generated registration as an optimization and AOT/trimming foundation, not as a replacement for mediator runtime validation.
- Generated code is deterministic and source-auditable so package consumers can inspect it during builds.


## Roadmap clarification: metadata versus executable generated code

**Planning note (post-v2.0):** The APIs documented above describe the **released historical generator registration/metadata foundation**. The following are **proposals**, not current methods or package capabilities:

| Generator output | Documented current foundation | Future candidate |
| --- | --- | --- |
| Mediator closed component registration | Registration code emitted at compile time | Direct generated **dispatch execution** — [ADR-0002](adr/0002-generated-mediator.md) |
| Mapper/projection metadata | Declared mapping and projection metadata | Typed **object conversion method** — [ADR-0001](adr/0001-generated-mapper.md) |
| Analyzer warnings | Stable Roslyn rule catalog | Expanded static safety and generated-only unsupported-shape warnings |
| Explainable execution origin | Registration/mapping diagnostics as available | Versioned flow manifest with provenance — [ADR-0003](adr/0003-flow-manifest.md) |

### Requirements for a future generated mapping execution path

1. The declaration is explicitly present in consumer source; installing generators never creates a silent global mapper.
2. Emitted C# is readable, deterministic, fully qualified, compatible with the supported compiler and discoverable when debugging.
3. Only statically provable mapping forms are generated; dynamic runtime resolvers/profiles are not automatically transcribed into source.
4. Unsafe/nullability/required/sensitive fields and unsupported constructors produce stable diagnostics with source locations.
5. Strict/generated-only execution cannot silently fall back to runtime conventions.
6. Existing explicit mapper and opted-in convention paths remain usable without the generator package.
7. Generated-to-`IMapper` registration is optional pending actual rule-owner and lifetime verification.
8. Measure **build time, binary size, allocation and AOT**, not just fast-path throughput; compare typed calls separately from interface dispatch.

### Requirements for a future generated mediator execution path

A generated `Add...Registrations` helper only wires DI—it is not proof that sending a request bypasses runtime dispatch overhead. Closed-request execution generation must preserve scoped DI, behavior ordering, cancellation, exception contracts and short-circuit behavior; direct/runtime/generated modes must be compared under identical workloads. Any AOT claim requires a published **and actually executed** clean consumer.

See the [engineering blueprint](engineering-blueprint.md), [v2.1 one-release plan](plans/v2.1-generated-mapping.md), and [validation matrix](strategy/validation-matrix.md). Never use a proposed API from an ADR as if it already shipped.
## Experimental executable mapping (v2.1 work in progress)

Install both `AstraFlow.Mapper` and `AstraFlow.Generators`. Declare a direct mapping explicitly:

```csharp
using AstraFlow.Mapper;

public static partial class CustomerMaps
{
    [AstraGenerateMapping]
    public static partial CustomerDto ToDto(Customer source);
}
```

The generator emits a typed method that constructs a new destination and assigns matching properties. A null source throws `ArgumentNullException`. The method does not call `IMapper`, register a rule, execute profiles, or apply runtime configuration. Unlike the runtime facade, it always constructs a destination instead of returning an assignable source or applying collection-before-rule precedence.

The current experimental subset requires a top-level non-generic, non-file-local static partial class, a public or internal static partial method, non-nullable top-level non-generic classes without inheritance, and a non-record destination with a public parameterless constructor. Extension methods are supported. All destination instance data members must be public settable non-required properties, with exactly named public source getters and identical scalar types. Nullable reference values cannot flow to non-nullable properties. Nested objects, collections, fields, init-only properties, required properties and conversions are rejected with error `AFM001`. Duplicate source/destination pairs within the compilation are rejected. A sensitive name under the default `AstraFlow.Security` taxonomy is blocked; use explicit application code where authorized. Name classification is not proof that a mapping is safe, and runtime policies and authorization are not evaluated by the compiler.

This remains a draft feature: packaging, compatibility, AOT, incremental build cost and broader compiler edge cases require further verification before release.
