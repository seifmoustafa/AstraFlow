# AstraFlow Generators

AstraFlow `1.8.3` introduces the `AstraFlow.Generators` package foundation for generated mediator component registration.

The generator emits readable dependency-injection code for mediator components discovered in the current compilation. It is intentionally a foundation release: runtime assembly scanning remains available and should stay as the fallback path while apps validate generated registration in their own build.

## Install

Use the generator package from application or library projects that reference `AstraFlow.Mediator`:

```powershell
dotnet add package AstraFlow.Generators --version 1.8.3
```

Generator packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Generators" Version="1.8.3" PrivateAssets="all" />
```

## Scope In 1.8.3

`1.8.3` generates `AstraFlow.Mediator.AstraFlowGeneratedMediatorRegistration` with:

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

- generated mapper dispatch tables,
- generated projection registry metadata,
- generated diagnostics metadata,
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
