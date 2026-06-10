namespace AstraFlow.Analyzers;

/// <summary>
/// AstraFlow analyzer severity policy used by rule documentation and tests.
/// </summary>
public enum AstraFlowAnalyzerRuleSeverity
{
    /// <summary>
    /// Informational guidance that should not block builds by default.
    /// </summary>
    Info,

    /// <summary>
    /// A likely correctness, maintainability, or security risk.
    /// </summary>
    Warning,

    /// <summary>
    /// A high-confidence compile-time failure for unsafe or invalid AstraFlow usage.
    /// </summary>
    Error
}
