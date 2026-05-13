# Troubleshooting

This guide maps common exceptions and confusing behaviors to likely causes and fixes.

## Mediator Errors

| Message Contains | Likely Cause | Fix |
| --- | --- | --- |
| `No request handler registered` | The request type has no matching `IRequestHandler<TRequest, TResponse>` in DI. | Add a handler, include the handler assembly marker, or register the handler manually. |
| `Multiple request handlers registered` | More than one handler is registered for the same request/response pair. | Keep exactly one handler for that request type. |
| `must implement AstraFlow.Mediator.IRequest` | `Send(object)` received an object that is not a request. | Make the type implement `IRequest<TResponse>` or do not send it through mediator. |
| `implements multiple ... IRequest ... contracts` | One request type implements more than one `IRequest<TResponse>`. | Split it into separate request types. |
| `Ambiguous request contracts` | Coverage validation found a scanned request with multiple response contracts. | Split the request type before enabling validation. |
| `Notification ... must implement INotification` | `Publish(object)` received a non-notification object. | Make the type implement `INotification` or do not publish it. |

## Mapper Errors

| Message Contains | Likely Cause | Fix |
| --- | --- | --- |
| `No mapping rule registered` | No rule accepts the runtime source type and requested destination type. | Add an `IDeclaredObjectMappingRule`, fix `CanMap`, or include the rule assembly marker. |
| `Multiple mapping rules registered` | More than one rule accepts the same pair at runtime. | Make ownership exact and keep one rule per pair. |
| `must implement IDeclaredObjectMappingRule` | `RequireDeclaredMappingRules` is true and a rule only implements `IObjectMappingRule`. | Implement `IDeclaredObjectMappingRule` or disable the requirement deliberately. |
| `declares no mappings` | A declared rule has an empty `DeclaredMappings` collection. | Add at least one `ObjectMappingPair`. |
| `declared by multiple rules` | Two rules claim the same mapping pair. | Remove duplicate ownership. |
| `declared but no rule accepts it` | `DeclaredMappings` lists a pair but `CanMap` returns false. | Align `DeclaredMappings` and `CanMap`. |
| `accepted by multiple rules` | Runtime ownership is ambiguous for a declared pair. | Narrow `CanMap` logic. |
| `declared by ... but accepted by ...` | One rule declares the pair but another rule accepts it. | Move declaration to the owning rule or fix `CanMap`. |

## Registration Problems

### Handler Or Rule Is Not Found

Check the marker type:

```csharp
services.AddAstraFlowMediator(typeof(MyHandler));
services.AddAstraFlowMapper(typeof(MyMappingRule));
```

Marker types identify assemblies. If the marker lives in a different assembly than the handler or rule, AstraFlow will not scan the intended code.

### Handler Is Registered Twice

This can happen when:

- two handler classes implement the same closed request handler interface,
- the same handler assembly is scanned and also manually registered,
- test setup adds an extra duplicate handler.

Request handlers must be single-owner. Notification handlers may be many-owner.

### Startup Validation Fails In Tests

Mapper startup validation is a hosted service. In unit tests that only construct `ServiceProvider`, hosted services may not run unless a host is built and started. For direct validation, resolve `IObjectMappingValidator` and call `Validate(new MappingOptions())`.

## Pipeline Problems

### Behavior Runs In Unexpected Order

Pipeline behaviors run in DI registration order. The first registered behavior is the outermost behavior.

```csharp
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(FirstBehavior<,>));
services.AddScoped(typeof(IPipelineBehavior<,>), typeof(SecondBehavior<,>));
```

Expected execution:

```text
First before
Second before
Handler
Second after
First after
```

### Handler Is Not Called

One behavior probably short-circuited by returning without calling `next`.

This is valid for caching, feature gates, and authorization failures. If it is accidental, inspect each behavior for missing `await next()`.

## Notification Problems

### One Handler Failure Stops Everything

The default policy is `FailFast`.

Use `Continue` or `Aggregate` when all handlers should be attempted:

```csharp
services.Configure<NotificationPublishOptions>(options =>
{
    options.FailurePolicy = NotificationFailurePolicy.Aggregate;
});
```

### Publish Does Nothing

Publishing with zero handlers is valid. Confirm:

- the notification handler assembly is scanned,
- the handler implements `INotificationHandler<TNotification>` for the exact notification type,
- the handler class is concrete and not abstract.

## Projection Problems

### Query Provider Cannot Translate Projection

AstraFlow v1.3.0 validates projection registrations and high-risk expression patterns. If EF Core or another provider cannot translate a projection:

- remove service calls from the expression,
- avoid runtime mapper calls inside `Select`,
- use simple member access and object construction,
- run `IProjectionValidator` and fix `AFP...` findings,
- test projections against the real provider,
- use `AstraFlow.Mapper.EntityFrameworkCore` for EF Core relational translation checks.

EF Core can allow some client-side work in the final projection while still generating SQL. Static AstraFlow validation remains the main guard for custom method calls and runtime mapper calls.

### Projection Registry Is Ambiguous

If `IProjectionRegistry.Get<TSource, TDestination>()` throws because multiple unnamed projections exist, convert each projection to `INamedProjection<TSource, TDestination>` and resolve by name.

## Secure ID Problems

### `SecureIdMapper` Cannot Resolve

Register an `ISecureIdCodec`:

```csharp
services.AddScoped<ISecureIdCodec, MySecureIdCodec>();
```

`SecureIdMapper` depends on the codec. AstraFlow does not register a default codec because applications own encryption.

### Decryption Returns Null

That is expected for invalid input when your codec returns null. Treat null as "invalid or missing ID" in application code.

## Package And Build Problems

| Problem | Fix |
| --- | --- |
| Package does not show README on NuGet | Confirm `PackageReadmeFile` is set and `README.md` is packed at package root. |
| Package icon missing | Confirm `PackageIcon` points to `assets/branding/astraflow-icon.png` and the file is packed. |
| Symbols missing | Confirm `.snupkg` exists and contains PDB files. |
| XML docs missing | Confirm `GenerateDocumentationFile` is true and the `.nupkg` contains `lib/net10.0/*.xml`. |
| Restore fails due external config permissions | Use an explicit `NuGet.Config` and set `DOTNET_CLI_HOME` to a writable folder. |

## Diagnostics Findings

| Code | Meaning | Fix |
| --- | --- | --- |
| `AFD101` | Multiple request handlers are registered for the same closed request handler service. | Keep one request handler per request/response pair. |
| `AFD102` | A request implements multiple `IRequest<TResponse>` contracts. | Split it into separate request types. |
| `AFD103` | A scanned request has no registered handler. | Add the handler or include the handler assembly marker. |
| `AFD201` | Handler, behavior, or mapping rule is singleton. | Prefer scoped lifetime unless singleton is deliberate. |
| `AFD301` | Mapper catalog validation failed. | Fix declared mappings, duplicate pairs, undeclared rules, or `CanMap` drift. |
