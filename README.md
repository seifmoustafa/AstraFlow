# AstraFlow

<p align="center">
  <img src="assets/branding/astraflow-icon.png" alt="AstraFlow package icon" width="160" />
</p>

AstraFlow is a MIT-licensed .NET package family for explicit CQRS dispatch and source-auditable object mapping.

It was built to keep production applications free from runtime license checks, hidden mapping behavior, and framework lock-in. The v1 design is deliberately small: secure defaults, clear errors, explicit extension points, and package-quality diagnostics before optional convention layers are added.

## Packages

| Package | Purpose |
| --- | --- |
| `AstraFlow.Mediator` | Request/response dispatch, notification publishing, pipeline behaviors, handler scanning, duplicate handler detection, and optional handler coverage validation. |
| `AstraFlow.Mapper` | Explicit object mapping rules, declared mapping catalogs, startup validation, collection mapping, explicit LINQ projections, and secure ID mapping abstractions. |
| `AstraFlow` | Convenience package referencing both mediator and mapper with one registration method. |

## Documentation Map

| Document | Read When |
| --- | --- |
| [Getting Started](docs/getting-started.md) | You want the shortest path from install to working mediator and mapper usage. |
| [API Reference](docs/api-reference.md) | You need every public type, method, option, and expected behavior in one table-driven reference. |
| [Architecture](docs/architecture.md) | You want to understand the package design, runtime flow, dependency boundaries, and non-goals. |
| [Mediator Guide](docs/mediator.md) | You are using requests, handlers, notifications, or pipeline behaviors. |
| [Mediator Scenarios](docs/mediator-scenarios.md) | You want expected behavior for success cases, missing handlers, duplicate handlers, ambiguous requests, pipeline order, and notification failures. |
| [Mapper Guide](docs/mapper.md) | You are writing mapping rules, projections, validation, or secure ID mapping. |
| [Mapper Scenarios](docs/mapper-scenarios.md) | You want expected behavior for object mapping, nulls, collections, validation failures, projections, and secure IDs. |
| [Troubleshooting](docs/troubleshooting.md) | You hit an exception and want the likely cause and fix. |
| [Community Release Guide](docs/community-release-guide.md) | You are preparing the `v1.0.1` repo push, tag, package verification, and community-facing release notes. |
| [Roadmap](docs/roadmap.md) | You want the v1.0.1 patch scope and the future diagnostics/projection/testing roadmap. |
| [Publishing](docs/publishing.md) | You are preparing or verifying a NuGet release. |

## Target Framework

AstraFlow currently targets `net10.0`. Per Microsoft's .NET support policy, .NET 10 is an active LTS release supported until November 14, 2028; .NET 8 and .NET 9 are supported until November 10, 2026.

## Public API At A Glance

### Registration

| API | Package | Use It For | Expected Result |
| --- | --- | --- | --- |
| `services.AddAstraFlowMediator(params Type[] assemblyMarkerTypes)` | `AstraFlow.Mediator` | Register mediator services and scan marker assemblies without request coverage validation. | `IMediator`, `ISender`, `IPublisher`, request handlers, and notification handlers are available from DI. |
| `services.AddAstraFlowMediator(bool validateRequestCoverage, params Type[] assemblyMarkerTypes)` | `AstraFlow.Mediator` | Register mediator services and optionally fail startup when scanned requests have no handler or ambiguous contracts. | Same registration as above, with extra validation when enabled. |
| `services.AddAstraFlowMapper(params Type[] assemblyMarkerTypes)` | `AstraFlow.Mapper` | Register mapper services and scan marker assemblies for mapping rules. | `IMapper`, `IObjectMappingValidator`, `SecureIdMapper`, and startup validation are registered. |
| `services.AddAstraFlow(bool validateRequestCoverage = false, params Type[] assemblyMarkerTypes)` | `AstraFlow` | Register mediator and mapper together. | Combined setup for applications that intentionally use both packages. |

### Mediator

| API | Use It For | Expected Result |
| --- | --- | --- |
| `IRequest<TResponse>` | Mark a request/command/query and declare its response type. | The request can be sent through `ISender` if exactly one matching handler exists. |
| `IRequestHandler<TRequest, TResponse>.Handle(...)` | Implement request handling. | The handler produces the response for one request type. |
| `ISender.Send<TResponse>(IRequest<TResponse>, CancellationToken)` | Send a strongly typed request. | Pipeline behaviors run, then the single handler runs, then the response is returned. |
| `ISender.Send(object, CancellationToken)` | Send when the request type is known only at runtime. | Same behavior as typed send after AstraFlow verifies the object implements exactly one `IRequest<TResponse>`. |
| `IPipelineBehavior<TRequest, TResponse>.Handle(...)` | Wrap request handling with validation, logging, authorization, caching, or feature gates. | Behaviors run in DI registration order and may short-circuit. |
| `INotification` | Mark an in-process event. | The notification can be published to zero or more handlers. |
| `INotificationHandler<TNotification>.Handle(...)` | React to a notification. | All handlers for the notification type are invoked sequentially. |
| `IPublisher.Publish<TNotification>(...)` | Publish a strongly typed notification. | Handlers run according to `NotificationFailurePolicy`. |
| `IPublisher.Publish(object, CancellationToken)` | Publish when the notification type is known only at runtime. | AstraFlow verifies the object implements `INotification`, then publishes it. |

### Mapper

| API | Use It For | Expected Result |
| --- | --- | --- |
| `IMapper.Map<TDestination>(object? source)` | Map a source object to a destination type. | Returns the mapped value, default for null source, or throws when no single rule owns the pair. |
| `IMapper.Map(object? source, Type destinationType)` | Map when the destination type is known only at runtime. | Same rule lookup behavior as generic mapping. |
| `IObjectMappingRule.CanMap(Type, Type)` | Declare whether a rule owns a source/destination pair. | Exactly one rule should return `true` for any active pair. |
| `IObjectMappingRule.Map(object?, Type, IMapper)` | Implement the mapping code. | Returns the destination object and may use `mapper` for nested explicit mappings. |
| `IDeclaredObjectMappingRule.DeclaredMappings` | Make mapping ownership machine-checkable. | Startup validation can catch duplicates, undeclared rules, and declaration drift. |
| `ObjectMappingPair.Create<TSource, TDestination>()` | Declare an owned mapping pair without repeating `typeof(...)`. | Produces a pair used by validation and diagnostics. |
| `IObjectMappingValidator.Validate(MappingOptions)` | Validate registered mapping rules manually. | Throws clear errors for invalid mapping catalogs. |
| `IProjection<TSource, TDestination>.Expression` | Define provider-translatable query projection. | Used by `ProjectWith` to keep query DTO shape explicit. |
| `query.ProjectWith(...)` | Apply an explicit LINQ projection. | Returns `IQueryable<TDestination>` using the supplied expression. |
| `ISecureIdCodec` | Plug in application-owned ID encryption/decryption. | AstraFlow stays decoupled from secrets and algorithms. |
| `SecureIdMapper` | Use secure ID conversion inside mapping rules. | Converts required or optional `Guid` values to encrypted strings and attempts decryption. |

## Design Principles

- Explicit by default: mapping rules must be code you can review.
- Security first: sensitive fields are not mapped by naming convention unless a future optional package is explicitly enabled.
- Clear failure modes: missing handlers, duplicate handlers, missing mappings, duplicate mappings, and undeclared mappings fail with actionable messages.
- No application lock-in: AstraFlow does not depend on NEXORA, `Result`, ASP.NET Core MVC, FluentValidation, tenants, permissions, or a specific ID encryption implementation.
- Extension-ready: pipelines, notification failure policies, projections, and secure ID codecs are designed as narrow public contracts.

## Quick Start: Mediator

```csharp
using AstraFlow.Mediator;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMediator(typeof(CreateInvoiceCommand));

using var provider = services.BuildServiceProvider();
var sender = provider.GetRequiredService<ISender>();

var id = await sender.Send(new CreateInvoiceCommand("INV-1001"));

public sealed record CreateInvoiceCommand(string Number) : IRequest<Guid>;

public sealed class CreateInvoiceCommandHandler
    : IRequestHandler<CreateInvoiceCommand, Guid>
{
    public Task<Guid> Handle(CreateInvoiceCommand request, CancellationToken cancellationToken)
    {
        return Task.FromResult(Guid.NewGuid());
    }
}
```

## Quick Start: Pipeline Behavior

Pipeline behaviors run in registration order and may short-circuit by not calling `next`.

```csharp
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(FeatureGateBehavior<,>));
```

## Quick Start: Mapper

```csharp
using AstraFlow.Mapper;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();
services.AddAstraFlowMapper(typeof(UserMappingRule));

using var provider = services.BuildServiceProvider();
var mapper = provider.GetRequiredService<IMapper>();

var dto = mapper.Map<UserResponse>(new User(Guid.NewGuid(), "admin"));

public sealed record User(Guid Id, string UserName);
public sealed record UserResponse(Guid Id, string UserName);

public sealed class UserMappingRule : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<User, UserResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(User) && destinationType == typeof(UserResponse);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var user = (User)source!;
        return new UserResponse(user.Id, user.UserName);
    }
}
```

## Secure ID Mapping

`AstraFlow.Mapper` provides the abstraction, not the cryptography. Applications own the encryption implementation.

```csharp
services.AddScoped<ISecureIdCodec, MySecureIdCodec>();
services.AddScoped<SecureIdMapper>();
```

Mapping rules can then depend on `SecureIdMapper` and emit encrypted string IDs without coupling the package to application secrets.

## Notification Failure Policies

Notifications are sequential by default. Configure how failures are handled:

```csharp
services.Configure<NotificationPublishOptions>(options =>
{
    options.FailurePolicy = NotificationFailurePolicy.Aggregate;
});
```

Policies:

- `FailFast`: stop at the first failing handler.
- `Continue`: log failures and run remaining handlers.
- `Aggregate`: run all handlers, then throw one `AggregateException`.

## v1 Non-Goals

AstraFlow v1 intentionally does not include convention mapping, flattening, reverse-map generation, compatibility shims, source generators, or analyzers. Those belong in optional packages after the explicit core is stable in real production use.

## Roadmap

The long-term plan is to add optional convention mapping, projection validation, diagnostics, analyzers, source generators, OpenTelemetry hooks, benchmark projects, ASP.NET Core helpers, EF Core helpers, and transition tooling. These will remain opt-in so the secure explicit core stays predictable.

## Branding

The package icon is stored at `assets/branding/astraflow-icon.png` and is included in every NuGet package through `PackageIcon`.

Generator prompt:

```text
Create a square app/package icon for a .NET library named AstraFlow. Use an abstract orbital star and flowing path motif that suggests explicit application flow, mediator dispatch, and auditable mapping. Keep it as a clean vector-friendly modern tech logo with crisp edges, centered symbol only, no text, strong silhouette readable at 64x64, generous padding, deep navy background with cyan, teal, white, and a small warm amber star accent. Avoid words, letters, code snippets, watermarks, photorealism, and complex gradients.
```

## Repository Readiness

The package folder includes CI, a gated publish workflow, security policy, contributing guide, changelog, samples, and release checklist. Publishing should happen only after:

- package tests pass,
- NEXORA consumes the package projects successfully,
- package artifacts build with XML docs and symbols,
- the API surface is reviewed for v1 stability,
- NuGet Trusted Publishing is configured, or a scoped GitHub Actions publishing secret is configured in the release repository.

For first publish setup, create a dedicated GitHub repository, copy this folder into the repository root, configure Trusted Publishing or the documented GitHub secret, and run the gated publish workflow. See `docs/publishing.md`.

## License

MIT.
