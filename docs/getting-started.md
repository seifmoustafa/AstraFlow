# Getting Started

This guide takes a new consumer from package choice to the first working mediator and mapper setup.

For complete reference tables, see [API Reference](api-reference.md). For expected behavior in edge cases, see [Mediator Scenarios](mediator-scenarios.md), [Mapper Scenarios](mapper-scenarios.md), and [Troubleshooting](troubleshooting.md).

## 1. Choose A Package

Install the package that matches the surface you need:

- `AstraFlow.Contracts` for shared mediator contracts without the runtime.
- `AstraFlow.Mediator` for CQRS dispatch, void commands, stream requests, notifications, processors, and exception flow.
- `AstraFlow.Mapper` for explicit object mapping, projection registry, named projections, and projection validation.
- `AstraFlow.Mapper.Conventions` for opt-in convention mapping over exact source/destination pairs.
- `AstraFlow.Diagnostics` for registration and validation reports.
- `AstraFlow.Testing` for test helpers.
- `AstraFlow.Analyzers` for build-time analyzer diagnostics.
- `AstraFlow.Mapper.EntityFrameworkCore` for optional EF Core projection translation checks.
- `AstraFlow` for both.

Since `1.4.0`, `AstraFlow.Contracts`, the core packages, and `AstraFlow.Testing` support `netstandard2.0`, `net8.0`, `net9.0`, and `net10.0`. The optional EF Core projection validation package remains `net10.0` because it follows EF Core 10. `AstraFlow.Analyzers` ships compiler analyzer assets, not runtime libraries.

```powershell
dotnet add package AstraFlow.Contracts --version 1.8.0
dotnet add package AstraFlow.Mediator --version 1.8.0
dotnet add package AstraFlow.Mapper --version 1.8.0
dotnet add package AstraFlow.Mapper.Conventions --version 1.8.0
dotnet add package AstraFlow.Mapper.EntityFrameworkCore --version 1.8.0
dotnet add package AstraFlow.Diagnostics --version 1.8.0
dotnet add package AstraFlow.Testing --version 1.8.0
dotnet add package AstraFlow.Analyzers --version 1.8.0
dotnet add package AstraFlow --version 1.8.0
```

Use only the package you need. If a project only sends requests, install `AstraFlow.Mediator`. If a project only maps DTOs explicitly, install `AstraFlow.Mapper`. Add `AstraFlow.Mapper.Conventions` only when convention mapping is deliberately configured. Use the meta-package when mediator and explicit mapper are intentionally part of the same project.

## 2. Register Services

Register by marker assembly:

```csharp
services.AddAstraFlow(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(Program));
```

Marker types identify assemblies to scan. If handlers live in `Orders.Application`, pass a type from `Orders.Application`. If mapping rules live in `Orders.Contracts`, pass a type from that assembly too.

```csharp
services.AddAstraFlow(
    validateRequestCoverage: true,
    typeof(CreateOrderCommand),
    typeof(CustomerMappingRule));
```

Use `ISender` when a class only sends requests. Use `IPublisher` when a class only publishes notifications. Reserve `IMediator` for composition code that needs both.

## 3. Create A Request And Handler

```csharp
public sealed record CreateOrderCommand(string Number) : IRequest<CreateOrderResponse>;

public sealed record CreateOrderResponse(Guid Id, string Number);

public sealed class CreateOrderCommandHandler
    : IRequestHandler<CreateOrderCommand, CreateOrderResponse>
{
    public Task<CreateOrderResponse> Handle(
        CreateOrderCommand request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(new CreateOrderResponse(Guid.NewGuid(), request.Number));
    }
}
```

Expected behavior:

- `CreateOrderCommand` has exactly one response type.
- `CreateOrderCommandHandler` is the only handler for that request.
- Sending the request returns `CreateOrderResponse`.
- Missing or duplicate handlers fail clearly.

## 4. Send The Request

```csharp
public sealed class OrderEndpoint(ISender sender)
{
    public Task<CreateOrderResponse> Create(string number, CancellationToken cancellationToken)
    {
        return sender.Send(new CreateOrderCommand(number), cancellationToken);
    }
}
```

Inject `ISender` instead of `IMediator` when the class only sends requests. This keeps dependencies honest.

## 5. Publish A Notification

```csharp
public sealed record OrderCreated(Guid OrderId) : INotification;

public sealed class OrderCreatedEmailHandler
    : INotificationHandler<OrderCreated>
{
    public Task Handle(OrderCreated notification, CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
```

```csharp
await publisher.Publish(new OrderCreated(orderId), cancellationToken);
```

Expected behavior:

- All matching notification handlers run sequentially.
- Zero handlers is allowed.
- Failures follow `NotificationPublishOptions.FailurePolicy`.

## 6. Add Pipeline Behaviors When Needed

```csharp
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
```

Behaviors run in registration order. A behavior can short-circuit by returning without calling `next`.

## 7. Create A Mapping Rule

For mapping, create small `IDeclaredObjectMappingRule` classes and declare every supported pair with `ObjectMappingPair.Create<TSource, TDestination>()`. Startup validation catches duplicate pairs and undeclared rules before traffic reaches the app.

```csharp
public sealed record Customer(Guid Id, string Name, string InternalNote);

public sealed record CustomerResponse(string Id, string Name);

public sealed class CustomerMappingRule(SecureIdMapper ids)
    : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
    [
        ObjectMappingPair.Create<Customer, CustomerResponse>()
    ];

    public bool CanMap(Type sourceType, Type destinationType)
    {
        return sourceType == typeof(Customer)
            && destinationType == typeof(CustomerResponse);
    }

    public object? Map(object? source, Type destinationType, IMapper mapper)
    {
        var customer = (Customer)source!;
        return new CustomerResponse(ids.Encrypt(customer.Id), customer.Name);
    }
}
```

Expected behavior:

- Only `Id` and `Name` are mapped.
- `InternalNote` is not copied because you did not copy it.
- Mapping ownership is declared and validated.
- Secure ID conversion is delegated to your application codec.

## 8. Use Opt-In Convention Mapping When Appropriate

For simple read DTOs, install `AstraFlow.Mapper.Conventions` and register exact pairs:

```csharp
services.AddAstraFlowMapper(typeof(CustomerProfile));
services.AddAstraFlowConventionMapping(catalog =>
{
    catalog.AddProfile<CustomerProfile>();
});

public sealed class CustomerProfile : ConventionMappingProfile
{
    public CustomerProfile()
    {
        CreateMap<Customer, CustomerResponse>()
            .Ignore(nameof(CustomerResponse.InternalNote));
    }
}
```

Every convention-created member is visible through `IMappingPlanProvider` and diagnostics reports. Sensitive names such as passwords, secrets, tokens, and connection strings are blocked unless explicitly allowed.

## 9. Register Secure ID Codec When Needed

```csharp
services.AddScoped<ISecureIdCodec, MySecureIdCodec>();
```

AstraFlow does not provide encryption. It only provides `ISecureIdCodec` and `SecureIdMapper` so your mapping rules can depend on a stable abstraction.

## 9. Validate Before Publishing

Run the same checks the package release uses:

```powershell
dotnet build AstraFlow.slnx -c Release
dotnet test AstraFlow.slnx -c Release --no-build --no-restore
dotnet pack src/AstraFlow.Mediator/AstraFlow.Mediator.csproj -c Release --no-build --no-restore
dotnet pack src/AstraFlow.Mapper/AstraFlow.Mapper.csproj -c Release --no-build --no-restore
dotnet pack src/AstraFlow/AstraFlow.csproj -c Release --no-build --no-restore
```

For release details, see [Publishing](publishing.md).

## 10. Add Diagnostics For Development And CI

```csharp
services.AddAstraFlowDiagnostics(options =>
{
    options.AssemblyMarkerTypes.Add(typeof(CreateOrderCommand));
    options.AssemblyMarkerTypes.Add(typeof(CustomerMappingRule));
});
```

```csharp
var reporter = provider.GetRequiredService<IAstraFlowDiagnosticsReporter>();
Console.WriteLine(reporter.CreateMarkdownReport());
```

Diagnostics should be registered after mediator and mapper so it captures the final AstraFlow service snapshot. See [Diagnostics](diagnostics.md).


