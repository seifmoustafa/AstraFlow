using System.Collections.Immutable;
using AstraFlow.Analyzers;
using FluentAssertions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Diagnostics;
using Xunit;

namespace AstraFlow.Analyzers.Tests;

public sealed class AnalyzerFoundationTests
{
    [Fact]
    public void Rule_catalog_exposes_stable_foundation_rule()
    {
        AstraFlowAnalyzerRules.All.Should().ContainSingle();

        var rule = AstraFlowAnalyzerRules.AnalyzerPackageLoaded;

        rule.Id.Should().Be("AFAN0001");
        rule.Category.Should().Be(AstraFlowAnalyzerCategories.Infrastructure);
        rule.Severity.Should().Be(AstraFlowAnalyzerRuleSeverity.Info);
        rule.IsEnabledByDefault.Should().BeFalse();
        rule.DocumentationAnchor.Should().Be("afan0001");
        rule.Descriptor.Id.Should().Be(rule.Id);
        rule.Descriptor.DefaultSeverity.Should().Be(DiagnosticSeverity.Info);
        rule.Descriptor.IsEnabledByDefault.Should().BeFalse();
        rule.Descriptor.HelpLinkUri.Should().EndWith("#afan0001");
    }

    [Fact]
    public void Analyzer_exposes_catalog_descriptors()
    {
        var analyzer = new AstraFlowAnalyzerFoundationAnalyzer();

        analyzer.SupportedDiagnostics.Select(descriptor => descriptor.Id)
            .Should()
            .Equal(AstraFlowAnalyzerRuleIds.AnalyzerPackageLoaded);
    }

    [Fact]
    public async Task Analyzer_foundation_reports_no_diagnostics_for_source_code()
    {
        const string source = """
            namespace Sample;

            public sealed class Request
            {
                public string Name { get; } = "demo";
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().BeEmpty();
    }

    private static async Task<ImmutableArray<Diagnostic>> RunAnalyzerAsync(string source)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText(source);
        var compilation = CSharpCompilation.Create(
            "AnalyzerFoundationSample",
            [syntaxTree],
            [
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Enumerable).Assembly.Location)
            ],
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var analyzers = ImmutableArray.Create<DiagnosticAnalyzer>(new AstraFlowAnalyzerFoundationAnalyzer());
        var analyzerCompilation = compilation.WithAnalyzers(analyzers);

        return await analyzerCompilation.GetAnalyzerDiagnosticsAsync();
    }
}
