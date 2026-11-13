# Testing Handlers, Pipelines, and Mappings

`AstraFlow.Testing` equips unit and integration test suites with runner-neutral fakes, direct harnesses, deterministic codecs, and expressive domain assertions without requiring a full ASP.NET Core host.

## Installation & Quick Test

Add `AstraFlow.Testing` to your xUnit, NUnit, MSTest, or TUnit test project:

```bash
dotnet add package AstraFlow.Testing
```

Use `FakeMediator` to record outbound requests and notifications with zero DI setup:

```csharp
using AstraFlow.Testing;

var mediator = new FakeMediator()
    .RespondWith<LookupCustomerQuery, CustomerDto>(new CustomerDto("c_123", "Ada Lovelace"))
    .CompleteWith<AuditCommand>((_, _) => Task.CompletedTask);

var dto = await mediator.Send(new LookupCustomerQuery("c_123"));

mediator.Requests.SingleSent<LookupCustomerQuery>();
mediator.Requests.ShouldNotHaveSent<DeleteCustomerCommand>();
```

## Fakes: `FakeMediator`, `FakeSender`, and `FakePublisher`

Configure deterministic behavior for commands, queries, async streams, and notifications:

- **`RespondWith<TRequest, TResponse>(value)` / `RespondWith(handler)`:** Stubs `IRequest<TResponse>` results.
- **`CompleteWith<TRequest>(handler)`:** Stubs void `IRequest` commands.
- **`StreamWith<TRequest, TResponse>(handler)`:** Stubs `IStreamRequest<TResponse>` async streams.
- **`OnPublish<TNotification>(handler)`:** Captures or reacts to `IPublisher.Publish` calls.

Verify recorded invocations via `MediatorAssertions`:

```csharp
mediator.Requests.ShouldHaveSent<LookupCustomerQuery>();
var recordedNotification = mediator.Notifications.SinglePublished<CustomerUpdatedNotification>();
```

## Direct Harnesses (`HandlerTestHarness` & `PipelineTestHarness`)

Exercise individual handlers or multi-stage behavior chains without configuring an entire application container:

```csharp
var handlerHarness = new HandlerTestHarness<CreateOrderCommand, Guid>(new CreateOrderHandler(store));
var orderId = await handlerHarness.Handle(new CreateOrderCommand("dev@example.com", 49.00m));

var pipelineHarness = new PipelineTestHarness<CreateOrderCommand, Guid>(
    [new TimingBehavior<CreateOrderCommand, Guid>(logger)],
    (req, ct) => handlerHarness.Handle(req, ct));

var result = await pipelineHarness.Execute(new CreateOrderCommand("dev@example.com", 49.00m));
```

## Mapping, Projection, Diagnostics, and Security Assertions

| Helper Class | Key Assertions & Utilities |
| --- | --- |
| `MappingRuleAssertions` | `rule.ShouldDeclare<TSource, TDestination>()`, `rule.ShouldOwnMapping<TSource, TDestination>()` |
| `MapperAssertions` | `mapper.ShouldMapTo<TDestination>(src)`, `mapper.ShouldFailMappingTo<TDestination>(src)`, `validator.ShouldValidateMappings()` |
| `ProjectionAssertions` | `registry.ShouldResolveProjection<TSrc, TDest>()`, `validator.ShouldHaveNoProjectionFindings()` |
| `DiagnosticsAssertions` | `report.ShouldHaveNoDiagnosticErrors()` |
| `ValidationAssertions` | `errors.ShouldContainValidationErrorFor("Email")`, `errors.ShouldNotContainValidationErrorFor("Notes")` |
| `SecureIdAssertions` & `TestSecureIdCodec` | `codec.ShouldRoundTripSecureId(id)` and deterministic `"test:<guid>"` codecs for unit tests |

## Related Guides

- Pair with general-purpose fluent checks in [Standalone Fluent Assertions](/docs/assertions).
- Validate EF Core SQL translation in [Entity Framework Core Projections](/docs/entity-framework-core).
