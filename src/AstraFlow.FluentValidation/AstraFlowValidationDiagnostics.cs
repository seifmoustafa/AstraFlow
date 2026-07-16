namespace AstraFlow.FluentValidation;

/// <summary>
/// Creates validation diagnostics summaries from AstraFlow validation errors.
/// </summary>
public static class AstraFlowValidationDiagnostics
{
    /// <summary>
    /// Creates a deterministic diagnostics report from validation errors.
    /// </summary>
    public static AstraFlowValidationDiagnosticsReport CreateReport(
        IEnumerable<AstraFlowValidationError> errors)
    {
        if (errors is null)
            throw new ArgumentNullException(nameof(errors));

        var ordered = errors
            .OrderBy(error => error.PropertyName, StringComparer.Ordinal)
            .ThenBy(error => error.ErrorCode, StringComparer.Ordinal)
            .ThenBy(error => error.Message, StringComparer.Ordinal)
            .ToArray();

        return new AstraFlowValidationDiagnosticsReport(
            ordered.Length,
            ordered
                .GroupBy(error => error.PropertyName, StringComparer.Ordinal)
                .Select(group => new AstraFlowValidationPropertyDiagnostics(
                    group.Key,
                    group.Count(),
                    group.Select(error => error.ErrorCode).Where(code => !string.IsNullOrWhiteSpace(code)).Distinct().ToArray()!))
                .ToArray());
    }
}
