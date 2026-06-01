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

    /// <summary>
    /// Mapping rule does not expose declared mapping pairs for startup validation and diagnostics.
    /// </summary>
    public const string UndeclaredMappingRule = "AFAN0201";

    /// <summary>
    /// Reverse convention mapping may write into sensitive destination members.
    /// </summary>
    public const string ReverseMapSensitiveWrite = "AFAN0202";

    /// <summary>
    /// Projection destination exposes a raw public identifier shape.
    /// </summary>
    public const string RawPublicIdProjection = "AFAN0301";

    /// <summary>
    /// Mapper call is used inside a query projection expression.
    /// </summary>
    public const string MapperCallInsideQuery = "AFAN0302";

    /// <summary>
    /// Projection expression calls a custom method that query providers may not translate.
    /// </summary>
    public const string CustomMethodInProjection = "AFAN0303";

    /// <summary>
    /// Projection expression captures a complex instance value.
    /// </summary>
    public const string ComplexProjectionCapture = "AFAN0304";
}
