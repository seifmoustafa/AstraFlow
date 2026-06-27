# AstraFlow Generators

AstraFlow `1.8.3` introduced the `AstraFlow.Generators` package foundation for generated mediator component registration. AstraFlow `1.8.4` adds generated mapper and projection metadata on top of that foundation.

The generator emits readable code for components discovered in the current compilation. Runtime assembly scanning remains available and should stay as the fallback path while apps validate generated output in their own build.

## Install

Use the generator package from application or library projects that reference `AstraFlow.Mediator`:

```powershell
dotnet add package AstraFlow.Generators --version 1.10.0
```

Generator packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Generators" Version="1.10.0" PrivateAssets="all" />
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
