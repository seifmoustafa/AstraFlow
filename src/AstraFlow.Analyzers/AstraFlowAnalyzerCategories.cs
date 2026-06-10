namespace AstraFlow.Analyzers;

/// <summary>
/// Stable diagnostic categories used by AstraFlow analyzers.
/// </summary>
public static class AstraFlowAnalyzerCategories
{
    /// <summary>
    /// Diagnostics for request, notification, stream, pipeline, and handler registration flows.
    /// </summary>
    public const string Mediator = "AstraFlow.Mediator";

    /// <summary>
    /// Diagnostics for explicit object mapping, convention mapping, and mapping declarations.
    /// </summary>
    public const string Mapper = "AstraFlow.Mapper";

    /// <summary>
    /// Diagnostics for query projection expression risks and provider-visible projection metadata.
    /// </summary>
    public const string Projection = "AstraFlow.Projection";

    /// <summary>
    /// Diagnostics for analyzer package infrastructure and rule availability.
    /// </summary>
    public const string Infrastructure = "AstraFlow.Infrastructure";
}
