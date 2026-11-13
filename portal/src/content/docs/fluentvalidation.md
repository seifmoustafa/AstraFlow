# FluentValidation Pipeline Integration

`AstraFlow.FluentValidation` automatically runs registered `IValidator<TRequest>` instances ahead of every response and void request handler, throwing `AstraFlowValidationException` with clean property groupings before business logic executes.

## Installation & Setup

Install `AstraFlow.FluentValidation` alongside FluentValidation and `AstraFlow.Mediator`:

```bash
dotnet add package AstraFlow.FluentValidation
```

Register `AddAstraFlowFluentValidation` together with your FluentValidation validators and mediator:

```csharp
using AstraFlow.FluentValidation;
using AstraFlow.Mediator;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services
    .AddAstraFlowMediator(validateRequestCoverage: true, typeof(Program))
    .AddAstraFlowFluentValidation(options =>
    {
        options.FailFast = false;
        options.LocalizeMessage = null;
    });
```

## Defining Validators

Write standard FluentValidation `AbstractValidator<T>` classes for any `IRequest` or `IRequest<TResponse>` command:

```csharp
using AstraFlow.Mediator;
using FluentValidation;

public sealed record CreateCustomerCommand(string Email, string DisplayName) : IRequest<Guid>;

public sealed class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
{
    public CreateCustomerValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(120);
    }
}
```

When `sender.Send(new CreateCustomerCommand(...))` runs, `AstraFlowValidationBehavior<TRequest, TResponse>` (or `AstraFlowVoidValidationBehavior<TRequest>` for void commands) resolves every registered `IValidator<TRequest>`, runs `ValidateAsync`, and stops the pipeline with `AstraFlowValidationException` if any failures occur.

## Configuration Options (`AstraFlowValidationOptions`)

| Property | Default | Behavior |
| --- | --- | --- |
| `FailFast` | `false` | Stops after the first validator reporting failures instead of collecting errors across all validators |
| `LocalizeMessage` | `null` | Optional `Func<ValidationFailure, string?>` delegate to localize or map error text; returning `null` preserves the original message |

## Handling Validation Errors & ProblemDetails

Inspect grouped errors via `AstraFlowValidationException.ToProblemDetailsErrors()`, summarize validation metrics with `AstraFlowValidationDiagnostics.CreateReport(ex.Errors)`, or let `AstraFlowValidationProblemEndpointFilter` convert exceptions directly into HTTP `400 ValidationProblem` responses:

```csharp
using AstraFlow.AspNetCore;

app.MapGroup("/api/customers")
    .AddEndpointFilter<AstraFlowValidationProblemEndpointFilter>()
    .MapAstraFlowSend<CreateCustomerCommand, Guid>("/");
```

Or map exceptions explicitly using `AstraFlowProblemDetailsMapper.ToValidationProblemDetails(exception.ToProblemDetailsErrors())`.

## Related Guides

- Wire HTTP endpoints in [ASP.NET Core Integration](/docs/aspnetcore).
- Understand behavior execution order in [Pipeline Behaviors & Exception Handling](/docs/pipelines).
- Assert grouped validation payloads in [Testing Harnesses](/docs/testing).
