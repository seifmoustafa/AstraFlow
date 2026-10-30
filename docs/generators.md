# AstraFlow Generators

AstraFlow `1.8.3` introduced the `AstraFlow.Generators` package foundation for generated mediator component registration. AstraFlow `1.8.4` adds generated mapper and projection metadata on top of that foundation.

The generator emits readable code for components discovered in the current compilation. Runtime assembly scanning remains available and should stay as the fallback path while apps validate generated output in their own build.

## Install

Use the generator package from application or library projects that reference `AstraFlow.Mediator`:

```powershell
dotnet add package AstraFlow.Generators --version 2.1.0
```

Generator packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Generators" Version="2.1.0" PrivateAssets="all" />
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


## v2.1 generated mapping execution (draft)

This feature is implemented on the v2.1.0 branch and reviewed in [PR #34](https://github.com/seifmoustafa/AstraFlow/pull/34), which remains Draft. The source version and local packages are 2.1.0; NuGet 2.1.0 is not published. The older generator APIs above are the released mediator-registration and mapper/projection-metadata foundation.

Reference `AstraFlow.Mapper` and `AstraFlow.Generators` (as a private analyzer) and explicitly declare a mapping method:

```csharp
using AstraFlow.Mapper;

public static partial class CustomerMaps
{
    [AstraGenerateMapping]
    public static partial CustomerDto ToDto(Customer source);
}
```

The generator emits a deterministic, readable implementation with a direct null guard and typed assignments. It neither invokes `IMapper` nor registers a runtime rule. The API is intentionally separate: this generated method always constructs a new destination, unlike runtime facade identity/collection precedence.

### Supported in the v2.1 branch

- A public or internal top-level static partial class, and a public or internal static partial method with one required value parameter. Extension methods are supported.
- Non-nullable top-level, non-generic classes without inheritance; the source and destination must be available to the consuming compilation. The destination must be a concrete class with a parameterless constructor accessible from the generated mapping's assembly (public, or internal when the destination is declared in the consuming compilation).
- At least one destination instance property. Every destination instance data member must be a public settable non-required property.
- Each destination property must have exactly one public, readable, exact-name source property. The property types must be identical supported scalars: enums, Boolean, integral/floating-point/decimal numeric primitives, `char`, or `string`. No implicit numeric, enum, or other conversions occur.
- Nullable reference members where the source-to-destination flow is safe. `[MaybeNull]` on a source property/getter and `[DisallowNull]` on a destination property/setter are also considered.
- Deterministic generated output, per-declaration source hints, and one source-located `AFM001` error for unsupported declarations. Member errors point at the destination member when it is in source, with the mapping declaration as a related location; referenced destination members fall back to the declaration location.

### Unsupported by the v2.1 branch

The generator reports `AFM001` and emits no method for optional, `params`, `scoped`, `ref`, `in`, or `out` parameters; generic/nested/file-local mapping classes or model types; inherited or record models; abstract models; inaccessible or parameterized-only destination construction; missing/multiple source matches; fields, indexers or other unsupported destination data-member shapes; required/init-only/non-public setters; nullable value types; nested objects, collections, delegates, and unsupported scalar types; incompatible types or unsafe nullability; and duplicate source/destination pairs. Event members are ignored because they are not mapping properties. There is no silent runtime or convention-mapping fallback.

The shared sensitive-name policy blocks default-classified destination names. It is compile-time defense in depth only: the generator cannot evaluate arbitrary runtime policy configuration, and name-based classification is not authorization or a guarantee that a DTO is safe. Diagnostics and generated source contain member metadata, never mapped runtime values.

### AOT and runtime boundaries

The direct generated mapping path was published and executed as Native AOT from a clean package consumer. That result covers the generated method path; it does not imply that runtime mapper assembly scanning or mediator scanning is AOT-safe. Mediator closed-component registration still only wires DI and does not generate request dispatch. See [release evidence](decisions/v2.1-draft-evidence.md) for exact commands, results, and the separate mediator scanning limitation.

### Future candidates

Generated-to-`IMapper` registration, deep/nested conversion, collection conversion, record/constructor mapping, broader scalar conversions, update/reverse domain writes, direct mediator dispatch, and runtime-configured policy evaluation remain future candidates. Any expansion needs separate semantic, security, compatibility, AOT, and performance evidence.

### Requirements for a future generated mediator execution path

A generated `Add...Registrations` helper only wires DI—it is not proof that sending a request bypasses runtime dispatch overhead. Closed-request execution generation must preserve scoped DI, behavior ordering, cancellation, exception contracts and short-circuit behavior; direct/runtime/generated modes must be compared under identical workloads. Any AOT claim requires a published **and actually executed** clean consumer.

See the [engineering blueprint](engineering-blueprint.md), [v2.1 one-release plan](plans/v2.1-generated-mapping.md), and [validation matrix](strategy/validation-matrix.md). Never use a proposed API from an ADR as if it already shipped.
## v2.1 executable mapping API reference

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

The supported v2.1 subset requires a top-level non-generic, non-file-local static partial class, a public or internal static partial method, non-nullable top-level non-generic classes without inheritance, and a non-record destination with an accessible parameterless constructor. A public constructor is usable from any consumer; an internal constructor is usable only when the destination is in the consuming compilation. Extension methods are supported. All destination instance data members must be public settable non-required properties, with exactly named public source getters and identical scalar types. Nullable reference values cannot flow to non-nullable properties. Nested objects, collections, fields, init-only properties, required properties and conversions are rejected with error `AFM001`. Duplicate source/destination pairs within the compilation are rejected. A sensitive name under the default `AstraFlow.Security` taxonomy is blocked; use explicit application code where authorized. Name classification is not proof that a mapping is safe, and runtime policies and authorization are not evaluated by the compiler.

For a member-specific error, `AFM001` points to the destination member when its source is part of the compilation, with the mapping method as a related location. If the destination comes from a referenced assembly, the diagnostic points to the mapping method instead. Declaration and construction errors also point to the mapping method.

The method has exactly one required parameter passed by value; optional, `params`, `scoped`, `ref`, `in`, and `out` parameters are rejected. Nullable value-type properties such as `int?` are rejected, including when both sides have the same nullable type. Nullable reference-type properties are supported when source-to-destination nullability is compatible.

For reference properties, the generator treats `[MaybeNull]` on a source property or getter return as potentially null, and `[DisallowNull]` on a destination property or setter value as non-nullable. Unsafe flows produce `AFM001` even when the declared property types alone would permit them.

This remains a draft release. Package and mapper-only AOT checks pass. The incremental edit experiment is recorded in the evidence report and shows end-to-end generator build overhead; it does not isolate generator cost. Broader API/compiler compatibility and mediator assembly-scanning AOT behavior remain limited as recorded there.
