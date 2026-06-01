using System.Collections.Immutable;
using AstraFlow.Analyzers;
using AstraFlow.Mediator;
using FluentAssertions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Analyzers.Tests;

public sealed class AnalyzerFoundationTests
{
    [Fact]
    public void Rule_catalog_exposes_stable_foundation_rule()
    {
        AstraFlowAnalyzerRules.All.Should().HaveCount(6);

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
            .Equal(
                AstraFlowAnalyzerRuleIds.AnalyzerPackageLoaded,
                AstraFlowAnalyzerRuleIds.MissingRequestHandler,
                AstraFlowAnalyzerRuleIds.DuplicateRequestHandler,
                AstraFlowAnalyzerRuleIds.AmbiguousRequestContract,
                AstraFlowAnalyzerRuleIds.MissingStreamHandler,
                AstraFlowAnalyzerRuleIds.SingletonHandlerLifetime);
    }

    [Fact]
    public async Task Analyzer_reports_no_diagnostics_for_handled_request()
    {
        const string source = """
            using AstraFlow.Mediator;

            namespace Sample;

            public sealed record Query(string Name) : IRequest<string>;

            public sealed class QueryHandler : IRequestHandler<Query, string>
            {
                public Task<string> Handle(Query request, CancellationToken cancellationToken)
                {
                    return Task.FromResult(request.Name);
                }
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().BeEmpty();
    }

    [Fact]
    public async Task Analyzer_reports_missing_request_handler()
    {
        const string source = """
            using AstraFlow.Mediator;

            namespace Sample;

            public sealed record Query(string Name) : IRequest<string>;
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.MissingRequestHandler);
    }

    [Fact]
    public async Task Analyzer_reports_duplicate_request_handlers()
    {
        const string source = """
            using AstraFlow.Mediator;

            namespace Sample;

            public sealed record Query(string Name) : IRequest<string>;

            public sealed class FirstHandler : IRequestHandler<Query, string>
            {
                public Task<string> Handle(Query request, CancellationToken cancellationToken)
                {
                    return Task.FromResult(request.Name);
                }
            }

            public sealed class SecondHandler : IRequestHandler<Query, string>
            {
                public Task<string> Handle(Query request, CancellationToken cancellationToken)
                {
                    return Task.FromResult(request.Name);
                }
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.DuplicateRequestHandler);
        diagnostics.Should().NotContain(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.MissingRequestHandler);
    }

    [Fact]
    public async Task Analyzer_reports_ambiguous_request_contract()
    {
        const string source = """
            using AstraFlow.Mediator;

            namespace Sample;

            public sealed record Query(string Name) : IRequest<string>, IRequest<int>;
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.AmbiguousRequestContract);
    }

    [Fact]
    public async Task Analyzer_reports_missing_stream_handler()
    {
        const string source = """
            using AstraFlow.Mediator;

            namespace Sample;

            public sealed record QueryStream(int Count) : IStreamRequest<int>;
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.MissingStreamHandler);
    }

    [Fact]
    public async Task Analyzer_reports_singleton_handler_registration()
    {
        const string source = """
            using AstraFlow.Mediator;
            using Microsoft.Extensions.DependencyInjection;

            namespace Sample;

            public sealed record Query(string Name) : IRequest<string>;

            public sealed class QueryHandler : IRequestHandler<Query, string>
            {
                public Task<string> Handle(Query request, CancellationToken cancellationToken)
                {
                    return Task.FromResult(request.Name);
                }
            }

            public static class Registration
            {
                public static IServiceCollection AddSample(IServiceCollection services)
                {
                    services.AddSingleton<IRequestHandler<Query, string>, QueryHandler>();
                    return services;
                }
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.SingletonHandlerLifetime);
    }

    private static async Task<ImmutableArray<Diagnostic>> RunAnalyzerAsync(string source)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText(source);
        var compilation = CSharpCompilation.Create(
            "AnalyzerFoundationSample",
            [syntaxTree],
            [
                MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Enumerable).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(Task).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(IRequest).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(IServiceCollection).Assembly.Location),
                MetadataReference.CreateFromFile(typeof(ServiceCollectionServiceExtensions).Assembly.Location)
            ],
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var analyzers = ImmutableArray.Create<DiagnosticAnalyzer>(new AstraFlowAnalyzerFoundationAnalyzer());
        var analyzerCompilation = compilation.WithAnalyzers(analyzers);

        return await analyzerCompilation.GetAnalyzerDiagnosticsAsync();
    }
}
