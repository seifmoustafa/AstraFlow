# Troubleshooting

This guide maps common exceptions and confusing behaviors to likely causes and fixes.

## Mediator Errors

| Message Contains | Likely Cause | Fix |
| --- | --- | --- |
| `No request handler registered` | The request type has no matching `IRequestHandler<TRequest, TResponse>` in DI. | Add a handler, include the handler assembly marker, or register the handler manually. |
| `No void request handler registered` | The request type implements `IRequest` but has no matching `IRequestHandler<TRequest>` in DI. | Add a void handler, include the handler assembly marker, or register the handler manually. |
| `No stream request handler registered` | The request type implements `IStreamRequest<TResponse>` but has no matching `IStreamRequestHandler<TRequest, TResponse>` in DI. | Add a stream handler, include the handler assembly marker, or register the handler manually. |
| `Multiple request handlers registered` | More than one handler is registered for the same request/response pair. | Keep exactly one handler for that request type. |
| `must implement AstraFlow.Mediator.IRequest` | `Send(object)` received an object that is not a request. | Make the type implement `IRequest`, `IRequest<TResponse>`, or `IStreamRequest<TResponse>`, then call the matching send API. |
| `Stream request ... must be dispatched with CreateStream` | A stream request was sent through `Send`. | Inject `IStreamSender` or `IMediator` and call `CreateStream(...)`. |
| `implements multiple ... request contracts` | One request type implements more than one void, response, or stream contract. | Split it into separate request types. |
| `Ambiguous request contracts` | Coverage validation found a scanned request with multiple request contracts. | Split the request type before enabling validation. |
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

### Post-Processor Is Not Called

Post-processors run only after the handler pipeline completes successfully. If a handler or behavior throws, use an exception action for observation or an exception handler for explicit recovery.

### Exception Handler Does Not Suppress The Failure

Exception handlers must call `state.SetHandled(...)`. Observing the exception is not enough; if no handler marks the state handled, AstraFlow rethrows the original exception.

Exception actions always rethrow after they complete. Use actions for logging or metrics, not recovery.

### Stream Stops Or Cancels Unexpectedly

The cancellation token passed to `CreateStream(...)` is forwarded to the stream handler and stream behaviors. Also pass the same token during enumeration with `.WithCancellation(cancellationToken)` so cancellation is observed consistently by the async enumerator.

If the caller stops enumeration early, async-iterator `finally` blocks in handlers and stream behaviors still run during enumerator disposal.

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

### Bounded Parallel Publish Throws AggregateException

With `NotificationFailurePolicy.Aggregate`, AstraFlow attempts every handler and then throws one `AggregateException` if any handler failed. With `BoundedParallel`, handler scheduling is concurrent, but aggregate inner exceptions are reported in registration order.

## Projection Problems

### Query Provider Cannot Translate Projection

AstraFlow `1.7.1` validates projection registrations and high-risk expression patterns. If EF Core or another provider cannot translate a projection:

- remove service calls from the expression,
- avoid runtime mapper calls inside `Select`,
- use simple member access and object construction,
- run `IProjectionValidator` and fix `AFP...` findings,
- test projections against the real provider,
- use `AstraFlow.Mapper.EntityFrameworkCore` for EF Core relational translation checks.

EF Core can allow some client-side work in the final projection while still generating SQL. Static AstraFlow validation remains the main guard for custom method calls and runtime mapper calls.

### Projection Registry Is Ambiguous

If `IProjectionRegistry.Get<TSource, TDestination>()` throws because multiple unnamed projections exist, convert each projection to `INamedProjection<TSource, TDestination>` and resolve by name.

### Convention Mapping Fails With AFC001 Or AFC002

Strict convention mapping treats unmapped destination and source members as failures. Add an exact member, configure `Ignore(...)`, use `Include(...)` as an allow list, or temporarily set `StrictMode = false` while migrating.

### Convention Mapping Fails With AFC003

Case-insensitive matching found more than one possible source member. Rename the source members or keep exact matching for that pair.

### Convention Mapping Fails With AFC004

A source or destination member matched a sensitive-field fragment such as password, secret, token, API key, or connection string. Remove the member from the DTO, ignore it, or explicitly call `AllowSensitiveMember(...)` when the mapping is intentional.

### Convention Mapping Fails With AFC006 Or AFC007

`AFC006` means a nullable value-type source may flow into a non-nullable destination. Configure `NullSubstitute(...)`, use `ConvertUsing(...)`, or make the destination nullable.

`AFC007` means a numeric type conversion would be implicit. Configure `ConvertUsing(...)` so the conversion is explicit and visible in the mapping plan.

### Convention Mapping Fails With AFC008

Enum-to-enum mapping only succeeds when every source enum name exists on the destination enum. Add the missing destination enum names or configure a converter.

### Convention Mapping Fails With AFC009

A destination member was marked `Required()` but has no matched source member, is ignored, or is outside the include list. Add `MapFrom(...)`, remove the required rule, or include the destination member.

### Convention Mapping Fails With AFC010 Or AFC011

`AFC010` means more than one public constructor can be mapped with the same specificity. Remove the ambiguity by changing the destination constructors or using a DTO shape with one mappable constructor.

`AFC011` means the destination cannot be created because there is no usable parameterless constructor and no public constructor whose parameters can all be mapped. Add a mappable constructor, add `ForMember(...).MapFrom(...)` rules, or use a mutable DTO.

### Convention Mapping Fails With AFC012

An immutable destination member was visible in the destination type but was not assigned through a constructor. Add a matching constructor parameter, configure `MapFrom(...)`, or make the member writable.

### Existing Destination Mapping Fails

`IConventionMapper.MapInto(...)` requires `EnableUpdateMapping()` on the exact source/destination pair. This keeps read DTO mapping separate from write/update behavior.

If an update mapping fails with `AFC004`, the destination member is sensitive. Do not update secrets by convention; call `AllowSensitiveMember(...)` only when the write is intentional and reviewed.

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
| Changelog does not show as a NuGet tab | NuGet shows package history as `Release Notes`, not `Changelog`. Confirm `PackageReleaseNotes` is set, and link the full `CHANGELOG.md` from both release notes and the README. If the package version is already published, release a new patch version because NuGet package metadata is immutable. |
| GitHub does not show every Markdown file as a repository tab | GitHub only surfaces selected well-known files such as `README.md`, `CONTRIBUTING.md`, `LICENSE`, `SECURITY.md`, and `CODE_OF_CONDUCT.md`. Link other docs from `README.md`. |
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

In `1.5.0`, the diagnostics behavior table also includes existing mediator pre-processors, post-processors, exception actions, and exception handlers. Order-sensitive mediator registration tables preserve DI registration order so runtime ordering can be reviewed. Diagnostics report type names and lifetimes, not request, response, notification, or DTO payload values.

