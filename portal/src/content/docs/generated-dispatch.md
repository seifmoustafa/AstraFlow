# Compile-Time Mediator Registration

Use `AstraFlow.Generators` to discover request handlers, notification handlers, stream handlers, processors, and exception handlers at compile time and emit deterministic DI registrations without reflection assembly scanning.

## Installation

Add `AstraFlow.Generators` as a build-time dependency alongside `AstraFlow.Mediator`:

```xml
<ItemGroup>
  <PackageReference Include="AstraFlow.Mediator" Version="2.4.0" />
  <PackageReference Include="AstraFlow.Generators" Version="2.4.0" PrivateAssets="all" />
</ItemGroup>
```

Keep `PrivateAssets="all"` on `AstraFlow.Generators` so compiler tooling runs during your project build without flowing transitively into downstream library consumers.

## Generated Service Registration

During compilation, the mediator registration generator emits `AstraFlow.Mediator.AstraFlowGeneratedMediatorRegistration` containing `AddAstraFlowGeneratedMediatorRegistrations(this IServiceCollection services)`. Call `AddAstraFlowMediator()` for the core mediator infrastructure (`IMediator`, `ISender`, `IStreamSender`, `IPublisher`, logging, and options), then chain the generated registrations:

```csharp
using AstraFlow.Mediator;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddAstraFlowMediator()
    .AddAstraFlowGeneratedMediatorRegistrations();
```

## Discovered Component Interfaces

For non-abstract classes accessible in your project compilation, the generator emits `AddScoped<TService, TImplementation>()` calls for closed implementations of:

| Category | Scanned Interfaces |
| --- | --- |
| **Request Handlers** | `IRequestHandler<TRequest>`, `IRequestHandler<TRequest, TResponse>` |
| **Notification Handlers** | `INotificationHandler<TNotification>` |
| **Stream Handlers** | `IStreamRequestHandler<TRequest, TResponse>` |
| **Processors** | `IRequestPreProcessor<TRequest>`, `IRequestPostProcessor<TRequest>`, `IRequestPostProcessor<TRequest, TResponse>` |
| **Exception Hooks** | `IRequestExceptionAction<TRequest, TException>`, `IRequestExceptionAction<TRequest, TResponse, TException>`, `IRequestExceptionHandler<TRequest, TException>`, `IRequestExceptionHandler<TRequest, TResponse, TException>` |

## When to Prefer Generated Registration

- **Faster cold start:** Eliminates `Assembly.GetTypes()` scanning across large module assemblies on startup.
- **Native AOT & trimming friendliness:** Emits direct closed generic `AddScoped<,>(services)` calls visible to static analysis and trimming tools.
- **Deterministic diffs:** Registered types follow a sorted, reproducible compile-time order across every build.

Open generic pipeline behaviors (`typeof(IPipelineBehavior<,>)` or `typeof(IRequestPipelineBehavior<>)`) and `NotificationPublishOptions` continue to compose cleanly on `IServiceCollection` after `AddAstraFlowGeneratedMediatorRegistrations()`.

## Related Guides

- Configure request and notification behavior in [Requests, Handlers, and Dispatch](/docs/mediator).
- Generate zero-reflection DTO mappings in [Source-Generated Object Mapping](/docs/generated-mapping).
- Inspect startup coverage with [Startup Diagnostics](/docs/diagnostics).
