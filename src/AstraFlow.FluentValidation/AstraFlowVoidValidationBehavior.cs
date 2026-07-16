using AstraFlow.Mediator;
using FluentValidation;
using Microsoft.Extensions.Options;

namespace AstraFlow.FluentValidation;

/// <summary>
/// Runs FluentValidation validators before void request handlers.
/// </summary>
public sealed class AstraFlowVoidValidationBehavior<TRequest> : IRequestPipelineBehavior<TRequest>
    where TRequest : IRequest
{
    private readonly IReadOnlyList<IValidator<TRequest>> validators;
    private readonly AstraFlowValidationOptions options;

    /// <summary>
    /// Initializes a new void validation behavior.
    /// </summary>
    public AstraFlowVoidValidationBehavior(
        IEnumerable<IValidator<TRequest>> validators,
        IOptions<AstraFlowValidationOptions> options)
    {
        this.validators = validators?.ToArray() ?? throw new ArgumentNullException(nameof(validators));
        this.options = options?.Value ?? throw new ArgumentNullException(nameof(options));
    }

    /// <inheritdoc />
    public async Task Handle(
        TRequest request,
        RequestHandlerDelegate next,
        CancellationToken cancellationToken)
    {
        if (next is null)
            throw new ArgumentNullException(nameof(next));

        var errors = await AstraFlowValidationBehavior<TRequest, object>.Validate(
            request,
            validators,
            options,
            cancellationToken);

        if (errors.Count != 0)
            throw new AstraFlowValidationException(errors);

        await next();
    }
}
