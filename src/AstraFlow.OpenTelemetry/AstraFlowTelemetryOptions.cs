namespace AstraFlow.OpenTelemetry;

/// <summary>
/// Options for AstraFlow observability instrumentation.
/// </summary>
public sealed class AstraFlowTelemetryOptions
{
    /// <summary>
    /// Gets or sets whether AstraFlow telemetry is emitted.
    /// </summary>
    public bool Enabled { get; set; } = true;

    /// <summary>
    /// Gets or sets whether request, notification, and projection type names are attached as tags.
    /// Defaults to false to avoid high-cardinality tags.
    /// </summary>
    public bool IncludeOperationTypeNames { get; set; }

    /// <summary>
    /// Gets or sets whether exception type names are attached as tags.
    /// </summary>
    public bool IncludeExceptionTypeNames { get; set; } = true;

    /// <summary>
    /// Gets or sets a sampling hook. Return false to skip activity creation for an operation name.
    /// Metrics remain controlled by <see cref="Enabled" />.
    /// </summary>
    public Func<string, bool>? ShouldTraceOperation { get; set; }
}
