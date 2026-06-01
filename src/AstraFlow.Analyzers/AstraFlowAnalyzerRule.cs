using Microsoft.CodeAnalysis;

namespace AstraFlow.Analyzers;

/// <summary>
/// Describes an AstraFlow analyzer rule and its public documentation metadata.
/// </summary>
public sealed record AstraFlowAnalyzerRule(
    string Id,
    string Title,
    string Category,
    AstraFlowAnalyzerRuleSeverity Severity,
    bool IsEnabledByDefault,
    string DocumentationAnchor,
    DiagnosticDescriptor Descriptor);
