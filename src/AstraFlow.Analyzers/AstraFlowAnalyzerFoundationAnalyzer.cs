using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;

namespace AstraFlow.Analyzers;

/// <summary>
/// Analyzer foundation entry point. v1.8.0 intentionally exposes descriptors before feature rules expand.
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class AstraFlowAnalyzerFoundationAnalyzer : DiagnosticAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        AstraFlowAnalyzerRules.All.Select(rule => rule.Descriptor).ToImmutableArray();

    /// <inheritdoc />
    public override void Initialize(AnalysisContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
    }
}
