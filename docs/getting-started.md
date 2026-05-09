# Getting Started

Install the package that matches the surface you need:

- `AstraFlow.Mediator` for CQRS dispatch and notifications.
- `AstraFlow.Mapper` for explicit object mapping and projections.
- `AstraFlow` for both.

Register by marker assembly:

```csharp
services.AddAstraFlow(
    validateRequestCoverage: true,
    assemblyMarkerTypes: typeof(Program));
```

Use `ISender` when a class only sends requests. Use `IPublisher` when a class only publishes notifications. Reserve `IMediator` for composition code that needs both.

For mapping, create small `IDeclaredObjectMappingRule` classes and declare every supported pair with `ObjectMappingPair.Create<TSource, TDestination>()`. Startup validation catches duplicate pairs and undeclared rules before traffic reaches the app.
