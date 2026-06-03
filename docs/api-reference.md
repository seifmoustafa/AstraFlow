# API Reference

This reference describes the public AstraFlow v1.4.0 API surface. It is intentionally written from the consumer point of view: what to call, when to call it, what happens, and what fails.

## Package Map

| Package | Namespace | Main Responsibility |
| --- | --- | --- |
| `AstraFlow.Contracts` | `AstraFlow.Mediator` | Shared request, notification, stream, sender, publisher, processor, and exception-flow contracts. |
| `AstraFlow.Mediator` | `AstraFlow.Mediator` | Request dispatch, void requests, stream requests, notifications, pipeline behaviors, processors, exception flow, handler scanning, and mediator options. |
| `AstraFlow.Mapper` | `AstraFlow.Mapper` | Explicit object mapping, mapping validation, projection registry, projection validation, and secure ID abstractions. |
| `AstraFlow.Mapper.EntityFrameworkCore` | `AstraFlow.Mapper.EntityFrameworkCore` | Optional EF Core projection translation validation helpers. |
| `AstraFlow.Diagnostics` | `AstraFlow.Diagnostics` | Framework-neutral diagnostics reporting for AstraFlow registrations and validation findings. |
| `AstraFlow.Testing` | `AstraFlow.Testing` | Framework-neutral fake dispatchers, harnesses, assertions, and test secure ID helpers. |
| `AstraFlow` | `AstraFlow` | Convenience registration for mediator and mapper together. |

## Registration APIs

| API | Signature | What It Registers | Failure Cases |
| --- | --- | --- | --- |
| `AddAstraFlowMediator` | `IServiceCollection AddAstraFlowMediator(this IServiceCollection services, params Type[] assemblyMarkerTypes)` | Logging, notification options, scoped `IMediator`, scoped `ISender`, scoped `IStreamSender`, scoped `IPublisher`, closed request handlers, stream request handlers, and notification handlers from marker assemblies. | Throws `ArgumentNullException` when `services` is null. Throws for duplicate request handlers discovered during scanning. |
| `AddAstraFlowMediator` | `IServiceCollection AddAstraFlowMediator(this IServiceCollection services, bool validateRequestCoverage, params Type[] assemblyMarkerTypes)` | Same as above, with optional request and stream coverage validation. | When validation is true, throws if a concrete scanned request has no handler or implements multiple request contracts. |
| `AddAstraFlowMediator` | `IServiceCollection AddAstraFlowMediator(this IServiceCollection services, Action<AstraFlowMediatorBuilder> configure, params Type[] assemblyMarkerTypes)` | Same as above, then applies explicit builder registrations for behaviors, stream behaviors, processors, and exception flow. | Throws `ArgumentNullException` when `configure` is null. |
| `AddAstraFlowMapper` | `IServiceCollection AddAstraFlowMapper(this IServiceCollection services, params Type[] assemblyMarkerTypes)` | Mapper options, scoped `SecureIdMapper`, scoped `IMapper`, scoped `IObjectMappingValidator`, scoped `IProjectionRegistry`, scoped `IProjectionValidator`, startup validator hosted service, mapping rules, and projections from marker assemblies. | Throws `ArgumentNullException` when `services` is null. Startup validation may later throw mapping or strict projection catalog errors. |
| `AddAstraFlowMapper` | `IServiceCollection AddAstraFlowMapper(this IServiceCollection services, IEnumerable<Type> assemblyMarkerTypes, Action<MappingOptions>? configure = null)` | Same as above, with options configuration. | Throws `ArgumentNullException` when `services` or marker collection is null. |
| `AddAstraFlowDiagnostics` | `IServiceCollection AddAstraFlowDiagnostics(this IServiceCollection services, Action<AstraFlowDiagnosticsOptions>? configure = null)` | Diagnostics options, a captured service descriptor snapshot, and `IAstraFlowDiagnosticsReporter`. | Throws `ArgumentNullException` when `services` is null. Call after core AstraFlow registration for a complete report. |
| `AddAstraFlow` | `IServiceCollection AddAstraFlow(this IServiceCollection services, bool validateRequestCoverage = false, params Type[] assemblyMarkerTypes)` | Calls mediator and mapper registration using the same marker assemblies. | Same failure cases as mediator and mapper registration. |

Marker types are used only to find assemblies. Passing `typeof(Program)` scans the assembly containing `Program`. Passing `typeof(SomeHandler)` scans the assembly containing that handler. Null marker entries are ignored by mediator and mapper registration.

## Mediator Types

| Type | Kind | Purpose | Consumer Implements? |
| --- | --- | --- | --- |
| `IRequest` | Interface | Marks a command/query/request with no response value. | Yes, usually on records. |
| `IRequest<TResponse>` | Interface | Marks a command/query/request and declares its response type. | Yes, usually on records. |
| `IRequestHandler<TRequest>` | Interface | Handles exactly one void request shape. | Yes. |
| `IRequestHandler<TRequest, TResponse>` | Interface | Handles exactly one request shape and returns the response. | Yes. |
| `ISender` | Interface | Sends requests only. | No, inject it. |
| `IStreamSender` | Interface | Sends stream requests only. | No, inject it. |
| `IPublisher` | Interface | Publishes notifications only. | No, inject it. |
| `IMediator` | Interface | Combines `ISender`, `IStreamSender`, and `IPublisher`. | No, inject it only when multiple roles are needed. |
| `IStreamRequest<TResponse>` | Interface | Marks a request that returns an async stream. | Yes, usually on records. |
| `IStreamRequestHandler<TRequest, TResponse>` | Interface | Handles one stream request shape. | Yes. |
| `INotification` | Interface | Marks an in-process event/notification. | Yes, usually on records. |
| `INotificationHandler<TNotification>` | Interface | Handles a notification. Multiple handlers are allowed. | Yes. |
| `IPipelineBehavior<TRequest, TResponse>` | Interface | Wraps request handling with cross-cutting logic. | Yes, when needed. |
| `IRequestPipelineBehavior<TRequest>` | Interface | Wraps void request handling with cross-cutting logic. | Yes, when needed. |
| `IStreamPipelineBehavior<TRequest, TResponse>` | Interface | Wraps stream request handling with cross-cutting logic. | Yes, when needed. |
| `RequestHandlerDelegate<TResponse>` | Delegate | Represents the next request pipeline step. | Used by pipeline behaviors. |
| `NotificationPublishOptions` | Class | Configures notification failure handling. | Configure through options. |
| `NotificationFailurePolicy` | Enum | Selects fail-fast, continue, or aggregate failure behavior. | Use in options. |
| `NotificationPublishStrategy` | Enum | Selects sequential, parallel, or bounded-parallel notification scheduling. | Use in options. |
| `MediatorOptions` | Class | Application composition helper for mediator coverage preference. | Optional; v1 registration accepts the flag directly. |

## Mediator Methods

| API | Signature | What Happens | Important Notes |
| --- | --- | --- | --- |
| `ISender.Send` | `Task Send(IRequest request, CancellationToken cancellationToken = default)` | Resolves a cached runtime delegate, validates the request contract, resolves exactly one void handler, wraps it with void behaviors, and completes. | Throws for null request, missing handler, duplicate handlers, or ambiguous request contracts. |
| `ISender.Send<TResponse>` | `Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)` | Resolves a cached runtime delegate, validates the request contract, resolves exactly one handler, wraps it with behaviors, and returns the handler result. | Throws for null request, missing handler, duplicate handlers, or request types with multiple `IRequest<T>` contracts. |
| `ISender.Send` | `Task<object?> Send(object request, CancellationToken cancellationToken = default)` | Same dispatch path as typed send, but the request type is discovered at runtime. | The object must implement exactly one void or response request contract. Void requests return `null`. |
| `IRequestHandler.Handle` | `Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken)` | Runs the application request logic. | The handler is resolved from the active DI scope. |
| `IPipelineBehavior.Handle` | `Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)` | Runs before and/or after the next behavior or handler. | A behavior can short-circuit by returning without calling `next`. |
| `IStreamSender.CreateStream` | `IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)` | Resolves exactly one stream handler, wraps it with stream behaviors, and returns the stream. | Stream requests must be sent through stream APIs, not `Send`. |
| `IPublisher.Publish<TNotification>` | `Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default) where TNotification : INotification` | Resolves all handlers for the notification type and runs them sequentially. | Zero handlers is valid and completes successfully. |
| `IPublisher.Publish` | `Task Publish(object notification, CancellationToken cancellationToken = default)` | Validates the object implements `INotification`, then publishes through the typed path. | Throws when the object is not an `INotification`. |
| `INotificationHandler.Handle` | `Task Handle(TNotification notification, CancellationToken cancellationToken)` | Runs side-effect handling for a notification. | Exceptions are handled according to `NotificationFailurePolicy`. |

## Notification Failure Policies

| Policy | Value | Behavior | Use When |
| --- | --- | --- | --- |
| `FailFast` | `0` | Stops at the first failing handler and rethrows that exception. | The default. Use when later handlers should not run after a failure. |
| `Continue` | `1` | Logs handler exceptions and continues with remaining handlers. Does not throw after publish completes. | Use when notification handlers are best-effort side effects. |
| `Aggregate` | `2` | Runs all handlers, logs failures, then throws one `AggregateException` if any failed. | Use when every handler should be attempted but callers must know that failures occurred. |

## Notification Publish Strategies

| Strategy | Value | Behavior | Use When |
| --- | --- | --- | --- |
| `Sequential` | `0` | Runs handlers one at a time in DI registration order. | The default and safest strategy. |
| `Parallel` | `1` | Runs all handlers concurrently. | Use only when handlers do not rely on order or shared mutable scoped state. |
| `BoundedParallel` | `2` | Runs handlers concurrently behind `MaxDegreeOfParallelism`. | Use for many independent side effects when unbounded fan-out is too aggressive. |

## Mapper Types

| Type | Kind | Purpose | Consumer Implements? |
| --- | --- | --- | --- |
| `IMapper` | Interface | Maps objects through explicit rules. | No, inject it. |
| `IObjectMappingRule` | Interface | Owns source-to-destination mapping behavior. | Yes. |
| `IDeclaredObjectMappingRule` | Interface | Adds a declared mapping catalog to a rule. | Yes, recommended for production. |
| `ObjectMappingPair` | Record struct | Identifies one source/destination mapping pair. | Use in declared rules. |
| `IObjectMappingValidator` | Interface | Validates mapping catalog consistency. | No, inject or use in tests. |
| `MappingOptions` | Class | Controls mapper validation behavior. | Configure through options. |
| `IMappingPlanProvider` | Interface | Exposes deterministic mapping plans for diagnostics and tests. | Implemented by convention mapping providers. |
| `MappingPlan` | Record | Describes a source/destination mapping plan. | Returned by mapping plan providers. |
| `MappingPlanMember` | Record | Describes one convention member decision. | Returned inside mapping plans. |
| `MappingPlanFinding` | Record | Describes a mapping-plan warning or error. | Returned inside mapping plans and surfaced by diagnostics. |
| `MappingPlanFindingSeverity` | Enum | Describes mapping-plan finding severity. | Info, warning, or error. |
| `IProjection<TSource, TDestination>` | Interface | Provides an explicit LINQ expression projection. | Yes. |
| `INamedProjection<TSource, TDestination>` | Interface | Adds an explicit projection name. | Yes, when multiple projections share the same source/destination pair. |
| `IProjectionRegistry` | Interface | Resolves registered projections by pair and optional name. | No, inject it. |
| `IProjectionValidator` | Interface | Validates projection registrations and high-risk expression patterns. | No, inject or use in tests. |
| `ProjectionRegistration` | Record | Describes a registered projection. | Returned by the registry. |
| `ProjectionValidationReport` | Record | Contains projection validation findings. | Returned by the validator. |
| `ProjectionValidationFinding` | Record | One projection validation finding with stable code. | Returned by validation reports. |
| `ProjectionValidationMode` | Enum | Selects disabled, warning, or error projection validation. | Configure through `MappingOptions`. |
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
| `IMappingPlanProvider.GetMappingPlans` | `IReadOnlyCollection<MappingPlan> GetMappingPlans()` | Returns deterministic mapping plans. | Convention mapping uses this so every convention-created member can be reviewed. |
| `IProjection.Expression` | `Expression<Func<TSource, TDestination>> Expression { get; }` | Supplies the projection expression. | Keep it provider-translatable; do not call services or `IMapper` inside it. |
| `INamedProjection.Name` | `string Name { get; }` | Supplies the projection name. | Names are case-insensitive during lookup and must be unique per source/destination pair. |
| `IProjectionRegistry.Registrations` | `IReadOnlyList<ProjectionRegistration> Registrations { get; }` | Lists resolved projection registrations. | Useful for diagnostics, tests, and release checks. |
| `IProjectionRegistry.Get` | `IProjection<TSource, TDestination> Get<TSource, TDestination>()` | Resolves the only unnamed projection for a pair. | Throws if missing or ambiguous. |
| `IProjectionRegistry.Get` | `IProjection<TSource, TDestination> Get<TSource, TDestination>(string name)` | Resolves a named projection for a pair. | Throws if missing or duplicated. |
| `IProjectionRegistry.TryGet` | `bool TryGet<TSource, TDestination>(out IProjection<TSource, TDestination> projection)` | Attempts unnamed projection lookup. | Returns false for missing or ambiguous lookup. |
| `IProjectionRegistry.TryGet` | `bool TryGet<TSource, TDestination>(string name, out IProjection<TSource, TDestination> projection)` | Attempts named projection lookup. | Returns false for missing or ambiguous lookup. |
| `IProjectionValidator.Validate` | `ProjectionValidationReport Validate(MappingOptions options)` | Checks duplicates, invalid expressions, and high-risk expression patterns. | Does not print payload values. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, IProjection<TSource, TDestination> projection)` | Applies a projection object's expression to a query. | Throws for null query or projection. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, Expression<Func<TSource, TDestination>> projection)` | Applies an inline expression to a query. | Useful when a separate projection class is unnecessary. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, IProjectionRegistry registry)` | Resolves and applies the only unnamed registered projection. | Throws for missing or ambiguous projections. |
| `ProjectWith` | `IQueryable<TDestination> ProjectWith<TSource, TDestination>(this IQueryable<TSource> query, IProjectionRegistry registry, string name)` | Resolves and applies a named registered projection. | Throws for missing or duplicate names. |
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
| `ValidateProjectionCatalogOnStartup` | `true` | The hosted startup validator validates registered projections when the app starts. |
| `ProjectionValidationMode` | `Warning` | Projection findings are warnings by default. Use `Error` to fail strict startup validation. |

## Convention Mapping APIs

| API | Kind | What It Does | Notes |
| --- | --- | --- | --- |
| `AddAstraFlowConventionMapping` | Extension method | Registers opt-in convention mapping catalog, rule, plan provider, and startup validator. | Call after `AddAstraFlowMapper`. |
| `ConventionMappingCatalog` | Class | Holds profiles and exact pair registrations. | Use `AddProfile<TProfile>()` or `CreateMap<TSource, TDestination>()`. |
| `ConventionMappingProfile` | Abstract class | Groups convention mapping pairs. | Derive and call `CreateMap` in the constructor. |
| `AddValueTransformer` | Method | Adds an explicit convention value transformer for a value type. | Transformer usage is reported with `AFC014`. |
| `ConventionMappingExpression<TSource, TDestination>` | Class | Configures one pair. | Supports case-insensitive matching, include, ignore, sensitive-member allow rules, `ForMember`, `ForPath`, include-members, flattening, unflattening, inheritance, polymorphic derived mappings, before/after hooks, explicit reverse mapping, and update mapping opt-in. |
| `ForMember` | Method | Configures one destination member. | Supports explicit source members, custom source expressions, converters, resolvers, null substitution, conditions, and required destination rules. |
| `ForPath` | Method | Configures one nested destination path. | Supports custom destination paths for unflattening and path-specific member configuration. |
| `EnableFlattening` | Method | Enables nested source to flat destination matching for one pair. | Required before `Address.City` can map to `AddressCity`. |
| `EnableUnflattening` | Method | Enables flat source to nested destination path matching for one pair. | Required before `AddressCity` can map to `Address.City`. |
| `ReverseMap` | Method | Adds a reverse mapping pair explicitly. | Reverse mapping is never implicit. |
| `IncludeMembers` | Method | Includes child source members in destination matching. | Child members appear in mapping plans as included-member decisions. |
| `IncludeBase` | Method | Records an explicit base mapping relationship for a derived pair. | Inheritance usage is reported with `AFC017`. |
| `IncludeDerived` | Method | Registers a derived mapping pair for polymorphic convention dispatch. | Base plans report `AFC018`; derived plans report `AFC019`. |
| `BeforeMap` | Method | Registers a per-pair hook that runs before member assignment. | Hook usage is reported with `AFC015`; payload values are not reported. |
| `AfterMap` | Method | Registers a per-pair hook that runs after member assignment. | Hook usage is reported with `AFC016`; payload values are not reported. |
| `EnableUpdateMapping` | Method | Enables mapping into an existing destination instance for one pair. | Required before `IConventionMapper.MapInto` can update an existing object. |
| `ConventionMemberMappingExpression<TSource, TDestination, TDestinationMember>` | Class | Configures one destination member. | Use `MapFrom`, `ConvertUsing`, `ResolveUsing`, `NullSubstitute`, `Condition`, and `Required`. |
| `IConventionValueResolver<TSource, TDestinationMember>` | Interface | Resolves one destination member from a source object. | Resolver usage is reported in mapping plans and `AFC013` findings. |
| `IConventionMapper` | Interface | Provides convention-specific mapping operations. | Use `MapInto` for existing destination updates; read mapping can still use `IMapper`. |
| `ConventionMappingOptions` | Class | Controls convention matching, strict mode, and sensitive-field policy. | Strict mode and sensitive-field require-allow are enabled by default. |

## Convention Finding Codes

| Code | Meaning |
| --- | --- |
| `AFC001` | Destination member has no matched source member. |
| `AFC002` | Source member is not mapped to the destination. |
| `AFC003` | Case-insensitive matching found ambiguous source members. |
| `AFC004` | Sensitive member mapping requires an explicit allow rule. |
| `AFC005` | Source and destination member types are incompatible. |
| `AFC006` | Nullable source member may flow into a non-nullable destination member. |
| `AFC007` | Numeric member conversion requires an explicit converter. |
| `AFC008` | Source enum names do not exist on the destination enum. |
| `AFC009` | Required destination member has no source or is excluded from mapping. |
| `AFC010` | Constructor binding is ambiguous because multiple constructors are equally specific. |
| `AFC011` | Destination type has no usable constructor or no constructor whose parameters can all be mapped. |
| `AFC012` | Immutable destination member cannot be assigned and was not constructor-bound. |
| `AFC013` | Destination member is resolved by a configured value resolver. |
| `AFC014` | Destination member uses a configured value transformer. |
| `AFC015` | Convention mapping pair has before-map hooks. |
| `AFC016` | Convention mapping pair has after-map hooks. |
| `AFC017` | Convention mapping pair includes a base mapping pair. |
| `AFC018` | Convention mapping pair includes a derived mapping pair. |
| `AFC019` | Derived convention mapping can be selected by polymorphic dispatch. |

## Projection Finding Codes

| Code | Meaning |
| --- | --- |
| `AFP001` | Multiple unnamed projections share the same source/destination pair. |
| `AFP002` | Multiple named projections share the same source/destination pair and name, or a name is invalid. |
| `AFP004` | A projection returned a null expression. |
| `AFP101` | A projection calls `IMapper` inside the expression. |
| `AFP102` | A projection calls a custom method that a query provider may not translate. |
| `AFP103` | A projection uses non-deterministic values such as `DateTime.UtcNow` or `Guid.NewGuid()`. |
| `AFP104` | A projection captures a complex closure object. |
| `AFP105` | A projection contains an unsupported construction pattern. |

## Entity Framework Core Methods

| API | Signature | What Happens | Important Notes |
| --- | --- | --- | --- |
| `ValidateProjectionTranslation` | `string ValidateProjectionTranslation<TSource, TDestination>(this DbContext dbContext, IProjection<TSource, TDestination> projection) where TSource : class` | Builds a `DbSet<TSource>().Select(...)` query and asks EF Core for SQL. | Does not execute the query. Requires a relational provider. |
| `ValidateProjectionTranslations` | `EfCoreProjectionValidationReport ValidateProjectionTranslations(this DbContext dbContext, IProjectionRegistry registry)` | Validates every registered projection against the supplied DbContext. | Returns `AFPEF...` findings for EF Core model/provider failures. |

## Entity Framework Core Finding Codes

| Code | Meaning |
| --- | --- |
| `AFPEF001` | EF Core could not translate or prepare the projection against the current `DbContext`. |

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
| `IProjectionRegistry` | Scoped | Resolves projection instances that may depend on scoped services. |
| `IProjectionValidator` | Scoped | Validates scoped projection instances safely. |
| `SecureIdMapper` | Scoped | Depends on application-provided `ISecureIdCodec`. |
| Mapping startup validator | Hosted service | Runs once at host startup when enabled. |

## Diagnostics Types

| Type | Kind | Purpose |
| --- | --- | --- |
| `IAstraFlowDiagnosticsReporter` | Interface | Creates in-memory, JSON, and Markdown diagnostics reports. |
| `AstraFlowDiagnosticsOptions` | Class | Configures diagnostics scanning and validation behavior. |
| `AstraFlowDiagnosticReport` | Record | Complete deterministic diagnostics report. |
| `AstraFlowDiagnosticsSummary` | Record | Count summary suitable for health-check-style decisions. |
| `AstraFlowDiagnosticFinding` | Record | One severity-coded diagnostics finding. |
| `AstraFlowDiagnosticRegistration` | Record | One discovered AstraFlow service registration. |
| `DiagnosticSeverity` | Enum | Finding severity: `Info`, `Warning`, `Error`, or `Fatal`. |

## Diagnostics Methods And Properties

| API | Signature | What Happens | Important Notes |
| --- | --- | --- | --- |
| `CreateReport` | `AstraFlowDiagnosticReport CreateReport()` | Builds a deterministic report from the captured service descriptors and optional validation checks. | Does not include payload values or secrets. |
| `CreateJsonReport` | `string CreateJsonReport(JsonSerializerOptions? jsonOptions = null)` | Serializes the report as JSON. | Default output is indented camelCase JSON. |
| `CreateMarkdownReport` | `string CreateMarkdownReport()` | Renders summary, findings, and registration tables as Markdown. | Useful for local diagnostics, CI artifacts, and issue reports. |
| `AstraFlowDiagnosticsOptions.AssemblyMarkerTypes` | `IList<Type>` | Adds assemblies to scan for request coverage. | Use this when request contracts live outside handler implementation assemblies. |
| `ValidateRequestCoverage` | `bool` default `true` | Reports missing request handlers and ambiguous request contracts. | Diagnostics only; it does not change mediator registration behavior. |
| `ValidateMappingCatalog` | `bool` default `true` | Resolves mapper validator and reports catalog validation failures. | May instantiate mapping rules through DI, same as mapper startup validation. |
| `IncludeInfoFindings` | `bool` default `true` | Adds count-oriented informational findings. | Disable when reports should include warnings/errors only. |

## Diagnostics Finding Codes

| Code | Severity | Meaning |
| --- | --- | --- |
| `AFD000` | `Info` | Registration counts were discovered. |
| `AFD101` | `Error` | Multiple request handlers are registered for the same closed request handler service. |
| `AFD102` | `Error` | A request type implements multiple `IRequest<TResponse>` contracts. |
| `AFD103` | `Error` | A scanned request type has no registered handler. |
| `AFD201` | `Warning` | A handler, behavior, or mapping rule is registered as singleton. |
| `AFD301` | `Error` | Mapper catalog validation failed. |
| `AFD302` | `Error` | Projection validation failed unexpectedly while diagnostics were generated. |
| `AFP...` | `Warning` or `Error` | Projection validation finding surfaced through diagnostics. |

## Testing Types

| Type | Kind | Purpose |
| --- | --- | --- |
| `FakeSender` | Class | Records requests and returns configured fake responses. |
| `FakePublisher` | Class | Records notifications and optionally runs configured fake handlers. |
| `FakeMediator` | Class | Combines fake sender and fake publisher behavior for `IMediator`, `ISender`, and `IPublisher` tests. |
| `RecordedRequest` | Record | Captures request object, request type, response type, and cancellation token. |
| `RecordedNotification` | Record | Captures notification object, notification type, and cancellation token. |
| `HandlerTestHarness<TRequest, TResponse>` | Class | Executes one request handler directly. |
| `PipelineTestHarness<TRequest, TResponse>` | Class | Executes pipeline behaviors around a terminal delegate. |
| `NotificationHandlerTestHarness<TNotification>` | Class | Executes one notification handler directly. |
| `AstraFlowAssertionException` | Exception | Assertion failure type used by framework-neutral helpers. |
| `TestSecureIdCodec` | Class | Deterministic test-only secure ID codec. |

## Testing Assertion Helpers

| API | What It Checks |
| --- | --- |
| `SingleSent<TRequest>()` | Exactly one recorded request of the requested type exists. |
| `ShouldHaveSent<TRequest>()` | At least one recorded request of the requested type exists. |
| `ShouldNotHaveSent<TRequest>()` | No recorded request of the requested type exists. |
| `SinglePublished<TNotification>()` | Exactly one recorded notification of the requested type exists. |
| `ShouldHavePublished<TNotification>()` | At least one recorded notification of the requested type exists. |
| `ShouldNotHavePublished<TNotification>()` | No recorded notification of the requested type exists. |
| `ShouldMapTo<TDestination>()` | Mapper can map the supplied source to the requested destination. |
| `ShouldFailMappingTo<TDestination>()` | Mapper fails for the supplied source and destination. |
| `ShouldValidateMappings()` | Mapper catalog validation succeeds. |
| `ShouldDeclare<TSource, TDestination>()` | Mapping rule declares a source/destination pair. |
| `ShouldOwnMapping<TSource, TDestination>()` | Mapping rule owns a source/destination pair. |
| `ShouldResolveProjection<TSource, TDestination>()` | Projection registry can resolve an unnamed projection. |
| `ShouldResolveProjection<TSource, TDestination>(name)` | Projection registry can resolve a named projection. |
| `ShouldHaveNoProjectionFindings()` | Projection validator reports no findings. |
| `ShouldHaveProjectionFinding(code)` | Projection validation report contains a finding code. |
| `ShouldHaveNoDiagnosticErrors()` | Diagnostics report has no error or fatal findings. |
| `ShouldHaveDiagnosticFinding(code)` | Diagnostics report contains a finding code. |
| `ShouldThrowAsync<TException>()` | Async operation throws the expected exception type. |
| `ShouldRoundTripSecureId()` | Secure ID codec encodes and decodes the supplied `Guid`. |
