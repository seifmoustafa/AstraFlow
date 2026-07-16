namespace AstraFlow.FluentValidation;

/// <summary>
/// Exception thrown when AstraFlow validation behaviors find request validation errors.
/// </summary>
public sealed class AstraFlowValidationException : Exception
{
    /// <summary>
    /// Initializes a new validation exception.
    /// </summary>
    public AstraFlowValidationException(IReadOnlyList<AstraFlowValidationError> errors)
        : base(CreateMessage(errors))
    {
        Errors = errors ?? throw new ArgumentNullException(nameof(errors));
    }

    /// <summary>
    /// Gets validation errors grouped from all executed validators.
    /// </summary>
    public IReadOnlyList<AstraFlowValidationError> Errors { get; }

    /// <summary>
    /// Gets errors grouped by property for ASP.NET Core validation problem responses.
    /// </summary>
    public IReadOnlyDictionary<string, string[]> ToProblemDetailsErrors()
    {
        return Errors
            .GroupBy(error => error.PropertyName, StringComparer.Ordinal)
            .ToDictionary(
                group => group.Key,
                group => group.Select(error => error.Message).ToArray(),
                StringComparer.Ordinal);
    }

    private static string CreateMessage(IReadOnlyCollection<AstraFlowValidationError>? errors)
    {
        var count = errors?.Count ?? 0;
        return count == 1
            ? "AstraFlow validation failed with 1 error."
            : $"AstraFlow validation failed with {count} errors.";
    }
}
