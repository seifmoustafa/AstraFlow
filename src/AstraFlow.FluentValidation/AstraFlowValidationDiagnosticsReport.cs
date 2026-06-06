namespace AstraFlow.FluentValidation;

/// <summary>
/// Aggregate validation diagnostics for failed AstraFlow requests.
/// </summary>
/// <param name="ErrorCount">Total validation error count.</param>
/// <param name="Properties">Per-property validation diagnostics.</param>
public sealed record AstraFlowValidationDiagnosticsReport(
    int ErrorCount,
    IReadOnlyList<AstraFlowValidationPropertyDiagnostics> Properties);

/// <summary>
/// Per-property validation diagnostics.
/// </summary>
/// <param name="PropertyName">Property name.</param>
/// <param name="ErrorCount">Number of errors for the property.</param>
/// <param name="ErrorCodes">Distinct non-empty error codes.</param>
public sealed record AstraFlowValidationPropertyDiagnostics(
    string PropertyName,
    int ErrorCount,
    IReadOnlyList<string> ErrorCodes);
