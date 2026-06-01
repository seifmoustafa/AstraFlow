using Microsoft.CodeAnalysis;

namespace AstraFlow.Analyzers;

/// <summary>
/// Central registry for AstraFlow analyzer descriptors.
/// </summary>
public static class AstraFlowAnalyzerRules
{
    private const string DocumentationBaseUrl = "https://github.com/seifmoustafa/AstraFlow/blob/main/docs/analyzers.md";

    /// <summary>
    /// Infrastructure marker rule used by tests and package verification.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule AnalyzerPackageLoaded = new(
        AstraFlowAnalyzerRuleIds.AnalyzerPackageLoaded,
        "AstraFlow analyzer package loaded",
        AstraFlowAnalyzerCategories.Infrastructure,
        AstraFlowAnalyzerRuleSeverity.Info,
        false,
        "afan0001",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.AnalyzerPackageLoaded,
            "AstraFlow analyzer package loaded",
            "AstraFlow analyzer package loaded",
            AstraFlowAnalyzerCategories.Infrastructure,
            DiagnosticSeverity.Info,
            isEnabledByDefault: false,
            description: "Infrastructure marker descriptor for verifying the analyzer package without reporting source diagnostics.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0001"));

    /// <summary>
    /// Request type has no matching response or void handler in the current compilation.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule MissingRequestHandler = new(
        AstraFlowAnalyzerRuleIds.MissingRequestHandler,
        "AstraFlow request is missing a handler",
        AstraFlowAnalyzerCategories.Mediator,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0101",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.MissingRequestHandler,
            "AstraFlow request is missing a handler",
            "AstraFlow request '{0}' has no matching handler in the current compilation",
            AstraFlowAnalyzerCategories.Mediator,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Every concrete AstraFlow request should have exactly one matching request handler in the compilation being analyzed.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0101"));

    /// <summary>
    /// More than one handler exists for the same request service contract.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule DuplicateRequestHandler = new(
        AstraFlowAnalyzerRuleIds.DuplicateRequestHandler,
        "AstraFlow request has duplicate handlers",
        AstraFlowAnalyzerCategories.Mediator,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0102",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.DuplicateRequestHandler,
            "AstraFlow request has duplicate handlers",
            "AstraFlow request handler service '{0}' has multiple implementations in the current compilation: {1}",
            AstraFlowAnalyzerCategories.Mediator,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "AstraFlow request and stream request handlers must be unique per closed handler service contract.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0102"));

    /// <summary>
    /// Request type implements conflicting request contracts.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule AmbiguousRequestContract = new(
        AstraFlowAnalyzerRuleIds.AmbiguousRequestContract,
        "AstraFlow request has ambiguous contracts",
        AstraFlowAnalyzerCategories.Mediator,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0103",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.AmbiguousRequestContract,
            "AstraFlow request has ambiguous contracts",
            "AstraFlow request '{0}' implements multiple request contracts: {1}",
            AstraFlowAnalyzerCategories.Mediator,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "A request should implement exactly one of IRequest, IRequest<TResponse>, or IStreamRequest<TResponse>.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0103"));

    /// <summary>
    /// Stream request type has no matching stream handler.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule MissingStreamHandler = new(
        AstraFlowAnalyzerRuleIds.MissingStreamHandler,
        "AstraFlow stream request is missing a handler",
        AstraFlowAnalyzerCategories.Mediator,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0104",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.MissingStreamHandler,
            "AstraFlow stream request is missing a handler",
            "AstraFlow stream request '{0}' has no matching stream handler in the current compilation",
            AstraFlowAnalyzerCategories.Mediator,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Every concrete AstraFlow stream request should have exactly one matching stream request handler in the compilation being analyzed.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0104"));

    /// <summary>
    /// Handler type is registered as a singleton service.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule SingletonHandlerLifetime = new(
        AstraFlowAnalyzerRuleIds.SingletonHandlerLifetime,
        "AstraFlow handler is registered as singleton",
        AstraFlowAnalyzerCategories.Mediator,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0105",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.SingletonHandlerLifetime,
            "AstraFlow handler is registered as singleton",
            "AstraFlow handler type '{0}' is registered with singleton lifetime",
            AstraFlowAnalyzerCategories.Mediator,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Handlers commonly depend on scoped application services. Prefer scoped or transient lifetimes unless singleton use is deliberate and reviewed.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0105"));

    /// <summary>
    /// All analyzer rules shipped by the package.
    /// </summary>
    public static IReadOnlyList<AstraFlowAnalyzerRule> All { get; } =
    [
        AnalyzerPackageLoaded,
        MissingRequestHandler,
        DuplicateRequestHandler,
        AmbiguousRequestContract,
        MissingStreamHandler,
        SingletonHandlerLifetime
    ];
}
