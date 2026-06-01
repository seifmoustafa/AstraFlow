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
    /// Mapping rule does not expose declared mapping pairs.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule UndeclaredMappingRule = new(
        AstraFlowAnalyzerRuleIds.UndeclaredMappingRule,
        "AstraFlow mapping rule is undeclared",
        AstraFlowAnalyzerCategories.Mapper,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0201",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.UndeclaredMappingRule,
            "AstraFlow mapping rule is undeclared",
            "AstraFlow mapping rule '{0}' implements IObjectMappingRule but not IDeclaredObjectMappingRule",
            AstraFlowAnalyzerCategories.Mapper,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Mapping rules should expose declared source/destination pairs so startup validation, diagnostics, tests, and future tooling can compare declarations with implementation behavior.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0201"));

    /// <summary>
    /// Reverse convention mapping may write into sensitive destination members.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule ReverseMapSensitiveWrite = new(
        AstraFlowAnalyzerRuleIds.ReverseMapSensitiveWrite,
        "AstraFlow reverse mapping may write sensitive members",
        AstraFlowAnalyzerCategories.Mapper,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0202",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.ReverseMapSensitiveWrite,
            "AstraFlow reverse mapping may write sensitive members",
            "AstraFlow ReverseMap writes into destination type '{0}', which has sensitive member(s): {1}",
            AstraFlowAnalyzerCategories.Mapper,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Reverse mapping from public DTO shapes back into domain or persistence types can accidentally write password, token, key, or secret members.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0202"));

    /// <summary>
    /// Projection destination exposes a raw public identifier member.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule RawPublicIdProjection = new(
        AstraFlowAnalyzerRuleIds.RawPublicIdProjection,
        "AstraFlow projection exposes raw public ID",
        AstraFlowAnalyzerCategories.Projection,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0301",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.RawPublicIdProjection,
            "AstraFlow projection exposes raw public ID",
            "AstraFlow projection '{0}' targets '{1}', which exposes raw Guid public ID member(s): {2}",
            AstraFlowAnalyzerCategories.Projection,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Projection DTOs with Guid PublicId-style members can leak raw public identifiers when secure DTO policy expects encoded identifiers.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0301"));

    /// <summary>
    /// Mapper call appears inside a query projection expression.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule MapperCallInsideQuery = new(
        AstraFlowAnalyzerRuleIds.MapperCallInsideQuery,
        "AstraFlow mapper call is inside query expression",
        AstraFlowAnalyzerCategories.Projection,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0302",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.MapperCallInsideQuery,
            "AstraFlow mapper call is inside query expression",
            "AstraFlow mapper call '{0}' is inside a query projection expression",
            AstraFlowAnalyzerCategories.Projection,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Runtime mapper calls inside IQueryable or projection expressions are usually not provider-translatable. Prefer explicit projection expressions.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0302"));

    /// <summary>
    /// Projection expression calls a custom method.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule CustomMethodInProjection = new(
        AstraFlowAnalyzerRuleIds.CustomMethodInProjection,
        "AstraFlow projection calls custom method",
        AstraFlowAnalyzerCategories.Projection,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0303",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.CustomMethodInProjection,
            "AstraFlow projection calls custom method",
            "AstraFlow projection expression calls custom method '{0}'",
            AstraFlowAnalyzerCategories.Projection,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Custom methods inside query projection expressions may not translate across LINQ providers. Validate with the target provider or replace with provider-translatable expressions.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0303"));

    /// <summary>
    /// Projection expression captures a complex instance value.
    /// </summary>
    public static readonly AstraFlowAnalyzerRule ComplexProjectionCapture = new(
        AstraFlowAnalyzerRuleIds.ComplexProjectionCapture,
        "AstraFlow projection captures complex value",
        AstraFlowAnalyzerCategories.Projection,
        AstraFlowAnalyzerRuleSeverity.Warning,
        true,
        "afan0304",
        new DiagnosticDescriptor(
            AstraFlowAnalyzerRuleIds.ComplexProjectionCapture,
            "AstraFlow projection captures complex value",
            "AstraFlow projection expression captures complex member '{0}' of type '{1}'",
            AstraFlowAnalyzerCategories.Projection,
            DiagnosticSeverity.Warning,
            isEnabledByDefault: true,
            description: "Projection expressions should capture scalar values only. Complex captures can become provider-specific constants and fail translation.",
            helpLinkUri: $"{DocumentationBaseUrl}#afan0304"));

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
        SingletonHandlerLifetime,
        UndeclaredMappingRule,
        ReverseMapSensitiveWrite,
        RawPublicIdProjection,
        MapperCallInsideQuery,
        CustomMethodInProjection,
        ComplexProjectionCapture
    ];
}
