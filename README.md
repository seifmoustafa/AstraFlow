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
