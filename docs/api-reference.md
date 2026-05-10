# API Reference

This reference describes the public AstraFlow v1.0.1 API surface. It is intentionally written from the consumer point of view: what to call, when to call it, what happens, and what fails.

## Package Map

| Package | Namespace | Main Responsibility |
| --- | --- | --- |
| `AstraFlow.Mediator` | `AstraFlow.Mediator` | Request dispatch, notifications, pipeline behaviors, handler scanning, and mediator options. |
| `AstraFlow.Mapper` | `AstraFlow.Mapper` | Explicit object mapping, mapping validation, projections, and secure ID abstractions. |
| `AstraFlow` | `AstraFlow` | Convenience registration for mediator and mapper together. |

## Registration APIs

| API | Signature | What It Registers | Failure Cases |
| --- | --- | --- | --- |
| `AddAstraFlowMediator` | `IServiceCollection AddAstraFlowMediator(this IServiceCollection services, params Type[] assemblyMarkerTypes)` | Logging, notification options, scoped `IMediator`, scoped `ISender`, scoped `IPublisher`, closed request handlers, and notification handlers from marker assemblies. | Throws `ArgumentNullException` when `services` is null. Throws for duplicate request handlers discovered during scanning. |
| `AddAstraFlowMediator` | `IServiceCollection AddAstraFlowMediator(this IServiceCollection services, bool validateRequestCoverage, params Type[] assemblyMarkerTypes)` | Same as above, with optional request coverage validation. | When validation is true, throws if a concrete scanned request has no handler or implements multiple request contracts. |
| `AddAstraFlowMapper` | `IServiceCollection AddAstraFlowMapper(this IServiceCollection services, params Type[] assemblyMarkerTypes)` | Mapper options, scoped `SecureIdMapper`, scoped `IMapper`, scoped `IObjectMappingValidator`, startup validator hosted service, and mapping rules from marker assemblies. | Throws `ArgumentNullException` when `services` is null. Startup validation may later throw mapping catalog errors. |
| `AddAstraFlow` | `IServiceCollection AddAstraFlow(this IServiceCollection services, bool validateRequestCoverage = false, params Type[] assemblyMarkerTypes)` | Calls mediator and mapper registration using the same marker assemblies. | Same failure cases as mediator and mapper registration. |

Marker types are used only to find assemblies. Passing `typeof(Program)` scans the assembly containing `Program`. Passing `typeof(SomeHandler)` scans the assembly containing that handler. Null marker entries are ignored by mediator and mapper registration.

## Mediator Types

| Type | Kind | Purpose | Consumer Implements? |
| --- | --- | --- | --- |
| `IRequest<TResponse>` | Interface | Marks a command/query/request and declares its response type. | Yes, usually on records. |
| `IRequestHandler<TRequest, TResponse>` | Interface | Handles exactly one request shape and returns the response. | Yes. |
| `ISender` | Interface | Sends requests only. | No, inject it. |
| `IPublisher` | Interface | Publishes notifications only. | No, inject it. |
| `IMediator` | Interface | Combines `ISender` and `IPublisher`. | No, inject it only when both roles are needed. |
| `INotification` | Interface | Marks an in-process event/notification. | Yes, usually on records. |
| `INotificationHandler<TNotification>` | Interface | Handles a notification. Multiple handlers are allowed. | Yes. |
| `IPipelineBehavior<TRequest, TResponse>` | Interface | Wraps request handling with cross-cutting logic. | Yes, when needed. |
| `RequestHandlerDelegate<TResponse>` | Delegate | Represents the next request pipeline step. | Used by pipeline behaviors. |
| `NotificationPublishOptions` | Class | Configures notification failure handling. | Configure through options. |
| `NotificationFailurePolicy` | Enum | Selects fail-fast, continue, or aggregate failure behavior. | Use in options. |
| `MediatorOptions` | Class | Application composition helper for mediator coverage preference. | Optional; v1 registration accepts the flag directly. |

## Mediator Methods

| API | Signature | What Happens | Important Notes |
| --- | --- | --- | --- |
| `ISender.Send<TResponse>` | `Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)` | Resolves a cached runtime delegate, validates the request contract, resolves exactly one handler, wraps it with behaviors, and returns the handler result. | Throws for null request, missing handler, duplicate handlers, or request types with multiple `IRequest<T>` contracts. |
| `ISender.Send` | `Task<object?> Send(object request, CancellationToken cancellationToken = default)` | Same dispatch path as generic send, but the request type is discovered at runtime. | The object must implement exactly one `IRequest<TResponse>`. |
| `IRequestHandler.Handle` | `Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken)` | Runs the application request logic. | The handler is resolved from the active DI scope. |
| `IPipelineBehavior.Handle` | `Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)` | Runs before and/or after the next behavior or handler. | A behavior can short-circuit by returning without calling `next`. |
| `IPublisher.Publish<TNotification>` | `Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default) where TNotification : INotification` | Resolves all handlers for the notification type and runs them sequentially. | Zero handlers is valid and completes successfully. |
| `IPublisher.Publish` | `Task Publish(object notification, CancellationToken cancellationToken = default)` | Validates the object implements `INotification`, then publishes through the typed path. | Throws when the object is not an `INotification`. |
| `INotificationHandler.Handle` | `Task Handle(TNotification notification, CancellationToken cancellationToken)` | Runs side-effect handling for a notification. | Exceptions are handled according to `NotificationFailurePolicy`. |

## Notification Failure Policies

| Policy | Value | Behavior | Use When |
| --- | --- | --- | --- |
| `FailFast` | `0` | Stops at the first failing handler and rethrows that exception. | The default. Use when later handlers should not run after a failure. |
| `Continue` | `1` | Logs handler exceptions and continues with remaining handlers. Does not throw after publish completes. | Use when notification handlers are best-effort side effects. |
| `Aggregate` | `2` | Runs all handlers, logs failures, then throws one `AggregateException` if any failed. | Use when every handler should be attempted but callers must know that failures occurred. |

## Mapper Types

| Type | Kind | Purpose | Consumer Implements? |
| --- | --- | --- | --- |
| `IMapper` | Interface | Maps objects through explicit rules. | No, inject it. |
| `IObjectMappingRule` | Interface | Owns source-to-destination mapping behavior. | Yes. |
| `IDeclaredObjectMappingRule` | Interface | Adds a declared mapping catalog to a rule. | Yes, recommended for production. |
| `ObjectMappingPair` | Record struct | Identifies one source/destination mapping pair. | Use in declared rules. |
| `IObjectMappingValidator` | Interface | Validates mapping catalog consistency. | No, inject or use in tests. |
| `MappingOptions` | Class | Controls mapper validation behavior. | Configure through options. |
| `IProjection<TSource, TDestination>` | Interface | Provides an explicit LINQ expression projection. | Yes. |
| `QueryableProjectionExtensions` | Static class | Adds `ProjectWith` helpers to `IQueryable<T>`. | Use extension methods. |
| `ISecureIdCodec` | Interface | Application-owned secure ID codec. | Yes, if using secure ID mapping. |
| `SecureIdMapper` | Class | Mapper-friendly helper around `ISecureIdCodec`. | No, inject it into mapping rules. |

## Mapper Methods And Properties

| API | Signature | What Happens | Important Notes |
| --- | --- | --- | --- |
| `IMapper.Map<TDestination>` | `TDestination Map<TDestination>(object? source)` | Returns default for null source, returns source if assignable to destination, maps supported collections, or finds exactly one explicit rule. | Throws when no rule or multiple rules match. |
| `IMapper.Map` | `object? Map(object? source, Type destinationType)` | Runtime destination equivalent of generic mapping. | Throws `ArgumentNullException` when destination type is null. |
| `IObjectMappingRule.CanMap` | `bool CanMap(Type sourceType, Type destinationType)` | Tells AstraFlow whether this rule owns a mapping pair. | Exactly one active rule should return true for a pair. |
| `IObjectMappingRule.Map` | `object? Map(object? source, Type destinationType, IMapper mapper)` | Performs the mapping. | Implementations should cast to the expected source type and return the requested destination. |
| `IDeclaredObjectMappingRule.DeclaredMappings` | `IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; }` | Lists the mapping pairs owned by the rule. | Required by default because `MappingOptions.RequireDeclaredMappingRules` is true. |
| `ObjectMappingPair.Create` | `static ObjectMappingPair Create<TSource, TDestination>()` | Creates a pair using generic source/destination types. | Prefer this over manual `typeof(...)` repetition. |
| `ObjectMappingPair.ToString` | `string ToString()` | Returns `SourceType.FullName -> DestinationType.FullName`. | Used in diagnostics. |
| `IObjectMappingValidator.Validate` | `void Validate(MappingOptions options)` | Validates declared rule ownership, duplicate pairs, missing rule acceptance, and declaration drift. | Throws `InvalidOperationException` for catalog problems. |
| `IProjection.Expression` | `Expression<Func<TSource, TDestination>> Expression { get; }` | Supplies the projection expression. | Keep it provider-translatable; do not call services or `IMapper` inside it. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, IProjection<TSource, TDestination> projection)` | Applies a projection object's expression to a query. | Throws for null query or projection. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, Expression<Func<TSource, TDestination>> projection)` | Applies an inline expression to a query. | Useful when a separate projection class is unnecessary. |
| `ISecureIdCodec.Encrypt` | `string Encrypt(Guid id)` | Converts a raw `Guid` into an encrypted/public string. | AstraFlow does not provide cryptography. |
| `ISecureIdCodec.TryDecrypt` | `Guid? TryDecrypt(string? encryptedId)` | Converts an encrypted/public string back to a `Guid` when valid. | Return null for invalid input. |
| `SecureIdMapper.Encrypt` | `string Encrypt(Guid id)` | Encrypts a required ID through the codec. | Throws only if the codec throws. |
| `SecureIdMapper.Encrypt` | `string? Encrypt(Guid? id)` | Encrypts optional IDs and returns null for null input. | Useful for nullable foreign keys. |
| `SecureIdMapper.TryDecrypt` | `Guid? TryDecrypt(string? encryptedId)` | Attempts to decrypt through the codec. | Returns whatever the codec returns. |

## Mapping Options

| Option | Default | Meaning |
| --- | --- | --- |
| `MappingOptions.SectionName` | `"Mapping"` | Suggested configuration section name for application hosts. |
| `ValidateRuleCatalogOnStartup` | `true` | The hosted startup validator validates registered mapping rules when the app starts. |
| `RequireDeclaredMappingRules` | `true` | Every mapping rule must implement `IDeclaredObjectMappingRule`. |

## Supported Collection Mapping Shapes

| Source | Destination | Result |
| --- | --- | --- |
| Any non-string `IEnumerable` | `List<TDestination>` | Returns `List<TDestination>`. |
| Any non-string `IEnumerable` | `TDestination[]` | Returns array. |
| Any non-string `IEnumerable` | `IEnumerable<TDestination>` | Returns `List<TDestination>` assignable to the interface. |
| Any non-string `IEnumerable` | `IReadOnlyList<TDestination>` | Returns `List<TDestination>` assignable to the interface. |

Each item is mapped through the same explicit rule lookup. Collection mapping does not create convention mappings for item types.

## Runtime Lifetimes

| Service | Lifetime | Why |
| --- | --- | --- |
| `IMediator`, `ISender`, `IPublisher` | Scoped | Handlers and behaviors often depend on scoped application services. |
| Request handlers | Scoped | Registered from scanned assemblies. |
| Notification handlers | Scoped | Registered from scanned assemblies. |
| `IMapper` | Scoped | Mapping rules may depend on scoped services such as `SecureIdMapper`. |
| `IObjectMappingValidator` | Scoped | Validates scoped rule instances safely. |
| `SecureIdMapper` | Scoped | Depends on application-provided `ISecureIdCodec`. |
| Mapping startup validator | Hosted service | Runs once at host startup when enabled. |

