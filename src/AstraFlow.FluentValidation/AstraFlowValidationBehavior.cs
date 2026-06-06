using AstraFlow.Mediator;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.Extensions.Options;

namespace AstraFlow.FluentValidation;

/// <summary>
/// Runs FluentValidation validators before response request handlers.
/// </summary>
public sealed class AstraFlowValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IReadOnlyList<IValidator<TRequest>> validators;
    private readonly AstraFlowValidationOptions options;

    /// <summary>
    /// Initializes a new response validation behavior.
    /// </summary>
    public AstraFlowValidationBehavior(
        IEnumerable<IValidator<TRequest>> validators,
        IOptions<AstraFlowValidationOptions> options)
    {
        this.validators = validators?.ToArray() ?? throw new ArgumentNullException(nameof(validators));
        this.options = options?.Value ?? throw new ArgumentNullException(nameof(options));
    }

    /// <inheritdoc />
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (next is null)
            throw new ArgumentNullException(nameof(next));

        var errors = await Validate(request, validators, options, cancellationToken);
        if (errors.Count != 0)
            throw new AstraFlowValidationException(errors);

        return await next();
    }

    internal static async Task<IReadOnlyList<AstraFlowValidationError>> Validate(
        TRequest request,
        IReadOnlyList<IValidator<TRequest>> validators,
        AstraFlowValidationOptions options,
        CancellationToken cancellationToken)
    {
        if (validators.Count == 0)
            return Array.Empty<AstraFlowValidationError>();

        var errors = new List<AstraFlowValidationError>();

        foreach (var validator in validators)
        {
            var context = new ValidationContext<TRequest>(request);
            var result = await validator.ValidateAsync(context, cancellationToken);
            AddFailures(errors, result.Errors, options);

            if (options.FailFast && errors.Count != 0)
                break;
        }

        return errors;
    }

    private static void AddFailures(
        ICollection<AstraFlowValidationError> errors,
        IEnumerable<ValidationFailure> failures,
        AstraFlowValidationOptions options)
    {
        foreach (var failure in failures.Where(failure => failure is not null))
        {
            errors.Add(new AstraFlowValidationError(
                failure.PropertyName,
                options.LocalizeMessage?.Invoke(failure) ?? failure.ErrorMessage,
                failure.ErrorCode,
                failure.Severity.ToString()));
        }
    }
}
