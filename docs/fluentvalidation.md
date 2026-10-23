# FluentValidation Integration

`AstraFlow.FluentValidation` adds request validation through AstraFlow mediator pipeline behaviors. It keeps FluentValidation out of `AstraFlow.Contracts` and `AstraFlow.Mediator`.

## Install

```powershell
dotnet add package AstraFlow.FluentValidation --version 1.13.0
```

Register AstraFlow and the validation behaviors:

```csharp
using AstraFlow.FluentValidation;
using FluentValidation;

builder.Services.AddAstraFlowMediator(typeof(CreateOrderCommand));
builder.Services.AddAstraFlowFluentValidation();
builder.Services.AddScoped<IValidator<CreateOrderCommand>, CreateOrderValidator>();
```

## Validation Behavior Example

```csharp
public sealed record CreateOrderCommand(string Number, int Quantity)
    : IRequest<CreateOrderResponse>;

public sealed class CreateOrderValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderValidator()
    {
        RuleFor(request => request.Number).NotEmpty();
        RuleFor(request => request.Quantity).GreaterThan(0);
    }
}
```

When validation fails, the behavior throws `AstraFlowValidationException`. The exception exposes:

- `Errors`: ordered validation errors with property name, message, error code, and severity.
- `ToProblemDetailsErrors()`: grouped `Dictionary<string, string[]>` for ASP.NET Core validation problem responses.

## Aggregate Errors

Aggregate validation is the default. All registered validators for the request run, and all failures are included:

```csharp
builder.Services.AddAstraFlowFluentValidation();
```

This is the most useful mode for APIs because clients receive the full validation shape in one response.

## Fail-Fast Validation

Enable fail-fast when later validators should not run after the first validator reports failures:

```csharp
builder.Services.AddAstraFlowFluentValidation(options =>
{
    options.FailFast = true;
});
```

Fail-fast stops after the first failing validator. It does not disable multiple rules inside that validator.

## Localization Hook

Use `LocalizeMessage` to replace FluentValidation messages before AstraFlow stores them:

```csharp
builder.Services.AddAstraFlowFluentValidation(options =>
{
    options.LocalizeMessage = failure =>
        localizer[failure.PropertyName];
});
```

Return `null` from the hook to keep FluentValidation's original message.

## Validation Diagnostics

Create deterministic validation diagnostics from failed errors:

```csharp
catch (AstraFlowValidationException ex)
{
    var diagnostics = AstraFlowValidationDiagnostics.CreateReport(ex.Errors);
}
```

The report includes a total error count and per-property counts with distinct error codes.

## Validation Troubleshooting

If validation does not run, check:

- `AddAstraFlowFluentValidation()` is registered in the same DI container as `AddAstraFlowMediator(...)`.
- Validators are registered as `IValidator<TRequest>`.
- The request type sent through `ISender` exactly matches the validator type.
- Pipeline behavior order is intentional. AstraFlow behaviors run in DI registration order.
