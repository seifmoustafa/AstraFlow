# Testing

`AstraFlow.Testing` is an optional test-helper package for projects that use AstraFlow mediator, mapper, projections, diagnostics, or secure ID flows.

It has no dependency on xUnit, NUnit, MSTest, FluentAssertions, or a mocking framework. Helpers throw `AstraFlowAssertionException`, so they can be used with any test runner.

Install:

```powershell
dotnet add package AstraFlow.Testing --version 1.12.0
```

## Fake Mediator

Use `FakeMediator` when a unit under test depends on `ISender`, `IPublisher`, or `IMediator` and you want to record what was sent or published.

```csharp
var mediator = new FakeMediator()
    .RespondWith<CreateUser, Guid>(Guid.Parse("11111111-1111-1111-1111-111111111111"))
    .OnPublish<UserCreated>((notification, cancellationToken) => Task.CompletedTask);

var id = await mediator.Send(new CreateUser("admin"));
await mediator.Publish(new UserCreated("admin"));

mediator.Requests.SingleSent<CreateUser>();
mediator.Notifications.SinglePublished<UserCreated>();
```

If a request is sent without a configured fake response, the fake throws a clear `InvalidOperationException`. This prevents tests from silently passing when a collaborator was not configured.

## Separate Fakes

Use `FakeSender` when a unit only sends requests.

```csharp
var sender = new FakeSender()
    .RespondWith<CreateUser, Guid>(Guid.NewGuid());

await sender.Send(new CreateUser("admin"));
sender.Requests.ShouldHaveSent<CreateUser>();
```

Use `FakePublisher` when a unit only publishes notifications.

```csharp
var publisher = new FakePublisher();

await publisher.Publish(new UserCreated("admin"));
publisher.Notifications.ShouldHavePublished<UserCreated>();
```

## Handler Harness

Use `HandlerTestHarness<TRequest, TResponse>` to execute a handler directly without building a service provider.

```csharp
var harness = new HandlerTestHarness<CreateUser, Guid>(handler);

var id = await harness.Handle(new CreateUser("admin"));
```

## Pipeline Harness

Use `PipelineTestHarness<TRequest, TResponse>` to verify behavior order, short-circuiting, and exception flow.

```csharp
var harness = new PipelineTestHarness<CreateUser, Guid>(
    new IPipelineBehavior<CreateUser, Guid>[] { behavior },
    (request, cancellationToken) => Task.FromResult(Guid.NewGuid()));

var id = await harness.Execute(new CreateUser("admin"));
```

For full mediator integration behavior, keep at least one DI-backed test that exercises the real mediator. This is especially useful for stream cancellation/disposal, processor ordering, exception handled-state behavior, and notification failure policy checks.

## Notification Handler Harness

Use `NotificationHandlerTestHarness<TNotification>` to execute one notification handler directly.

```csharp
var harness = new NotificationHandlerTestHarness<UserCreated>(handler);

await harness.Handle(new UserCreated("admin"));
```

## Mapper Assertions

Use mapper assertions to keep mapping tests concise.

```csharp
var dto = mapper.ShouldMapTo<UserResponse>(user);
mapper.ShouldFailMappingTo<PrivateUserResponse>(user);
validator.ShouldValidateMappings();
```

Use mapping-rule assertions when testing explicit rule ownership.

```csharp
rule.ShouldDeclare<User, UserResponse>();
rule.ShouldOwnMapping<User, UserResponse>();
```

## Projection Assertions

Use projection assertions to verify registry lookup and validation findings.

```csharp
registry.ShouldResolveProjection<User, UserListItem>("list");

var report = validator.Validate(new MappingOptions());
report.ShouldHaveProjectionFinding("AFP101");
```

Use projection plan assertions when tests export deterministic plans through `IProjectionPlanProvider`.

```csharp
var plans = planProvider.GetProjectionPlans();
var plan = plans.ShouldHaveParameterizedProjectionPlan<User, UserListItem, UserProjectionParameters>("list");

plan.ShouldHaveProjectionParameter("TenantId", typeof(Guid).FullName!);
plan.ShouldHaveNonSensitiveProjectionParameter("TenantId");
plan.ShouldHaveSensitiveProjectionParameter("AccessToken");
plan.ShouldHaveProjectionMember("Name", "Constructed");
plan.ShouldHaveNoProjectionPlanFindings();
```

## Diagnostics Assertions

Use diagnostics assertions when a test creates an `AstraFlowDiagnosticReport`.

```csharp
var report = diagnostics.CreateReport();

report.ShouldHaveNoDiagnosticErrors();
report.ShouldHaveDiagnosticFinding("AFD000");
```

## Secure ID Tests

`TestSecureIdCodec` is deterministic and test-only. It is not encryption and must not be used in production.

```csharp
var codec = new TestSecureIdCodec();
var encoded = codec.ShouldRoundTripSecureId(Guid.NewGuid());
```

## Design Rules

- Testing helpers do not log request payloads or DTO payloads.
- Fakes record object references and types so tests can make their own assertions.
- No helper depends on a specific test framework.
- No helper replaces integration tests for DI registration, EF Core translation, or application startup.


