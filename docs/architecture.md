# Architecture

AstraFlow is a small explicit application-flow package family. The core idea is simple: application behavior should be visible in source code, startup failures should be clear, and optional productivity layers should not weaken secure defaults.

## Design Goals

| Goal | What It Means In v1.3.0 |
| --- | --- |
| Explicit flow | Requests declare response types. Handlers are concrete classes. Mapping rules are code, not naming magic. |
| Clear failure modes | Missing handlers, duplicate handlers, ambiguous request contracts, missing mappings, duplicate mappings, and invalid mapping catalogs throw actionable exceptions. |
| Narrow contracts | Interfaces are small enough to implement, test, and reason about. |
| Framework independence | Core packages do not require ASP.NET Core MVC, EF Core, FluentValidation, OpenTelemetry, tenant frameworks, or custom result types. |
| Secure defaults | No convention mapping, no payload logging, no built-in cryptography, and no automatic raw-ID exposure policy. |
| Package quality | XML docs, README, license, symbols, package icon, CI, publishing docs, and samples ship with the package family. |

## Package Boundaries

`AstraFlow.Mediator` owns in-process dispatch. It knows about requests, handlers, notifications, notification handlers, pipeline behaviors, DI registration, and notification failure policy. It does not know about validation frameworks, web endpoints, database transactions, authorization policies, or result wrappers.

`AstraFlow.Mapper` owns explicit runtime mapping, projection registration, named projection lookup, projection validation, and query projection helpers. It knows about mapping rules, declared mapping catalogs, collection mapping, startup validation, query projection expressions, and secure ID abstraction. It does not know about application encryption keys, EF Core, convention mapping, or DTO security policies.

`AstraFlow.Mapper.EntityFrameworkCore` owns optional EF Core relational projection translation checks. It references EF Core so the core mapper package does not have to.

`AstraFlow.Diagnostics` owns framework-neutral reporting. It inspects service registrations, reports findings with stable severity codes, and renders in-memory, JSON, or Markdown reports. It does not own web health endpoints, telemetry export, payload logging, or remediation.

`AstraFlow` is only a convenience package. It references mediator and mapper and provides `AddAstraFlow(...)`. It should not grow hidden runtime behavior.

## Mediator Runtime Flow

1. A caller injects `ISender`, `IPublisher`, or `IMediator`.
2. A request is sent through `Send`.
3. AstraFlow validates that the runtime request type implements exactly one `IRequest<TResponse>`.
4. AstraFlow resolves exactly one `IRequestHandler<TRequest, TResponse>` from the current DI scope.
5. AstraFlow resolves all matching `IPipelineBehavior<TRequest, TResponse>` instances.
6. Behaviors are wrapped so execution follows DI registration order.
7. The final handler runs if no behavior short-circuits.
8. The response is returned to the caller.

The dispatch delegate is cached per runtime request type after the first successful delegate creation. Handler and behavior instances are still resolved from the active DI scope on each send.

## Notification Runtime Flow

1. A caller publishes an `INotification`.
2. AstraFlow resolves all matching `INotificationHandler<TNotification>` instances from the current scope.
3. Handlers run sequentially.
4. Exceptions are handled according to `NotificationPublishOptions.FailurePolicy`.

Publishing a notification with zero handlers is valid. It completes successfully because notifications are side-effect fan-out, not request/response contracts.

## Mapper Runtime Flow

1. A caller injects `IMapper`.
2. `Map<TDestination>(source)` delegates to the runtime `Map(source, destinationType)` path.
3. Null source returns null/default.
4. If the source is already assignable to the destination type, the source is returned directly.
5. Supported collection destinations are mapped item-by-item.
6. For normal object mapping, AstraFlow asks each registered rule whether it can map the runtime source type to the requested destination type.
7. Exactly one rule must match.
8. The owning rule performs the mapping.

This keeps the package honest: if no rule exists, mapping fails instead of guessing.

## Mapper Startup Validation Flow

1. `AddAstraFlowMapper(...)` registers mapping rules from marker assemblies.
2. The hosted startup validator runs when `MappingOptions.ValidateRuleCatalogOnStartup` is true.
3. The validator checks that rules implement `IDeclaredObjectMappingRule` when required.
4. It rejects declared rules with no mappings.
5. It rejects duplicate declared mapping pairs.
6. It verifies every declared pair is accepted by exactly one rule.
7. It verifies the accepting rule is the same rule that declared the pair.

This catches drift such as declaring `Order -> OrderDto` but accidentally implementing `CanMap` for `Invoice -> InvoiceDto`.

## Diagnostics Reporting Flow

1. The application registers mediator and/or mapper services.
2. The application calls `AddAstraFlowDiagnostics(...)`.
3. Diagnostics captures a deterministic snapshot of the current service descriptors.
4. A caller resolves `IAstraFlowDiagnosticsReporter`.
5. The reporter creates an in-memory report, JSON report, or Markdown report.
6. The report lists registrations, findings, and a health-check-ready summary.

Diagnostics should be registered after AstraFlow services. If more services are added later, call diagnostics registration after those additions so the snapshot is complete.

## Dependency Injection Model

AstraFlow uses Microsoft.Extensions.DependencyInjection. Services are registered as scoped by default because handlers, mapping rules, and codecs frequently depend on scoped application services. This is the conservative default for web applications, background workers, and modular monoliths.

If an application needs singleton behavior for a dependency used inside handlers or mapping rules, that dependency can be singleton. AstraFlow itself does not force application services to be scoped.

## Threading And Async Model

Request handlers, notification handlers, and pipeline behaviors return `Task`. AstraFlow does not create background work, queues, or parallel fan-out in v1. Notifications are sequential by design so ordering and failure behavior remain predictable.

## Security Model

AstraFlow does not map by convention in v1. Sensitive fields are copied only if a developer writes mapping code that copies them. Secure ID support is an abstraction only: applications own encryption, key storage, rotation, validation, and audit policy.

The package also avoids request payload logging. Future diagnostics and observability packages must redact by default.

Diagnostics reports include type names, service categories, lifetimes, counts, and exception messages from validation. They do not inspect request payloads, DTO payloads, encrypted ID values, connection strings, tokens, or secret configuration values.

## Non-Goals In v1.3.0

- No automatic convention mapping.
- No automatic flattening.
- No reverse-map generation.
- No source generators.
- No analyzers.
- No ASP.NET Core-specific runtime behavior.
- No EF Core dependency in `AstraFlow.Mapper`.
- No built-in ID encryption.
- No result type, tenant, permission, or validation framework coupling.

These are intentional boundaries, not missing implementation.
