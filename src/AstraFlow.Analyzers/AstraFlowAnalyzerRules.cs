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
    /// All analyzer rules shipped by the package.
    /// </summary>
    public static IReadOnlyList<AstraFlowAnalyzerRule> All { get; } =
    [
        AnalyzerPackageLoaded
    ];
}
