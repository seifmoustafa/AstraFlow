namespace AstraFlow.Analyzers;

/// <summary>
/// Stable diagnostic identifiers for AstraFlow analyzers.
/// </summary>
public static class AstraFlowAnalyzerRuleIds
{
    /// <summary>
    /// Infrastructure marker rule used to verify analyzer package loading and documentation shape.
    /// </summary>
    public const string AnalyzerPackageLoaded = "AFAN0001";

    /// <summary>
    /// Request type has no matching response or void request handler in the current compilation.
    /// </summary>
    public const string MissingRequestHandler = "AFAN0101";

    /// <summary>
    /// More than one handler exists for the same request service contract in the current compilation.
    /// </summary>
    public const string DuplicateRequestHandler = "AFAN0102";

    /// <summary>
    /// Request type implements more than one AstraFlow request contract.
    /// </summary>
    public const string AmbiguousRequestContract = "AFAN0103";

    /// <summary>
    /// Stream request type has no matching stream request handler in the current compilation.
    /// </summary>
    public const string MissingStreamHandler = "AFAN0104";

    /// <summary>
    /// Handler type is registered as a singleton service.
    /// </summary>
    public const string SingletonHandlerLifetime = "AFAN0105";
}
