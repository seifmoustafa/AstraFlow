namespace AstraFlow.Diagnostics;

/// <summary>
/// Severity assigned to one AstraFlow diagnostics finding.
/// </summary>
public enum DiagnosticSeverity
{
    /// <summary>
    /// Informational finding that describes discovered registrations or configuration.
    /// </summary>
    Info = 0,

    /// <summary>
    /// Potential issue that may be valid but deserves review.
    /// </summary>
    Warning = 1,

    /// <summary>
    /// Invalid application flow or mapping setup that should be fixed.
    /// </summary>
    Error = 2,

    /// <summary>
    /// Severe diagnostics failure that prevents the report from being trusted.
    /// </summary>
    Fatal = 3
}
