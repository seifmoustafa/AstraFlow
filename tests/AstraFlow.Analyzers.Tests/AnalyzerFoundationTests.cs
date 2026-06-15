using System.Collections.Immutable;
using AstraFlow.Analyzers;
using AstraFlow.Mapper;
using AstraFlow.Mapper.Conventions;
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
        AstraFlowAnalyzerRules.All.Should().HaveCount(12);

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
                AstraFlowAnalyzerRuleIds.SingletonHandlerLifetime,
                AstraFlowAnalyzerRuleIds.UndeclaredMappingRule,
                AstraFlowAnalyzerRuleIds.ReverseMapSensitiveWrite,
                AstraFlowAnalyzerRuleIds.RawPublicIdProjection,
                AstraFlowAnalyzerRuleIds.MapperCallInsideQuery,
                AstraFlowAnalyzerRuleIds.CustomMethodInProjection,
                AstraFlowAnalyzerRuleIds.ComplexProjectionCapture);
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

    [Fact]
    public async Task Analyzer_reports_undeclared_mapping_rule()
    {
        const string source = """
            using AstraFlow.Mapper;

            namespace Sample;

            public sealed class MappingRule : IObjectMappingRule
            {
                public bool CanMap(Type sourceType, Type destinationType) => true;

                public object? Map(object? source, Type destinationType, IMapper mapper) => source;
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.UndeclaredMappingRule);
    }

    [Fact]
    public async Task Analyzer_reports_reverse_map_sensitive_write()
    {
        const string source = """
            using AstraFlow.Mapper.Conventions;

            namespace Sample;

            public sealed class UserDto
            {
                public string? Email { get; set; }
            }

            public sealed class User
            {
                public string? Email { get; set; }

                public string? PasswordHash { get; set; }
            }

            public sealed class UserProfile : ConventionMappingProfile
            {
                public UserProfile()
                {
                    CreateMap<User, UserDto>().ReverseMap();
                }
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.ReverseMapSensitiveWrite);
    }

    [Fact]
    public async Task Analyzer_reports_raw_public_id_projection_shape()
    {
        const string source = """
            using System.Linq.Expressions;
            using AstraFlow.Mapper;

            namespace Sample;

            public sealed class User
            {
                public Guid PublicId { get; set; }
            }

            public sealed class UserDto
            {
                public Guid PublicId { get; set; }
            }

            public sealed class UserProjection : IProjection<User, UserDto>
            {
                public Expression<Func<User, UserDto>> Expression => user => new UserDto
                {
                    PublicId = user.PublicId
                };
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.RawPublicIdProjection);
    }

    [Fact]
    public async Task Analyzer_reports_mapper_call_inside_queryable_lambda()
    {
        const string source = """
            using System.Linq;
            using AstraFlow.Mapper;

            namespace Sample;

            public sealed class User;

            public sealed class UserDto;

            public static class Queries
            {
                public static IQueryable<UserDto> SelectDtos(IQueryable<User> users, IMapper mapper)
                {
                    return users.Select(user => mapper.Map<UserDto>(user));
                }
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.MapperCallInsideQuery);
    }

    [Fact]
    public async Task Analyzer_reports_custom_method_inside_projection_expression()
    {
        const string source = """
            using System.Linq.Expressions;
            using AstraFlow.Mapper;

            namespace Sample;

            public sealed class User
            {
                public string Name { get; set; } = "";
            }

            public sealed class UserDto
            {
                public string Name { get; set; } = "";
            }

            public sealed class UserProjection : IProjection<User, UserDto>
            {
                public Expression<Func<User, UserDto>> Expression => user => new UserDto
                {
                    Name = Normalize(user.Name)
                };

                private static string Normalize(string name) => name.Trim();
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.CustomMethodInProjection);
    }

    [Fact]
    public async Task Analyzer_reports_complex_projection_capture()
    {
        const string source = """
            using System.Linq.Expressions;
            using AstraFlow.Mapper;

            namespace Sample;

            public sealed class ProjectionOptions
            {
                public string Prefix { get; set; } = "";
            }

            public sealed class User
            {
                public string Name { get; set; } = "";
            }

            public sealed class UserDto
            {
                public string Name { get; set; } = "";
            }

            public sealed class UserProjection : IProjection<User, UserDto>
            {
                private readonly ProjectionOptions _options = new();

                public Expression<Func<User, UserDto>> Expression => user => new UserDto
                {
                    Name = _options.Prefix + user.Name
                };
            }
            """;

        var diagnostics = await RunAnalyzerAsync(source);

        diagnostics.Should().ContainSingle(diagnostic =>
            diagnostic.Id == AstraFlowAnalyzerRuleIds.ComplexProjectionCapture);
    }

    private static async Task<ImmutableArray<Diagnostic>> RunAnalyzerAsync(string source)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText($"""
            using System;
            using System.Collections.Generic;
            using System.Linq;
            using System.Threading;
            using System.Threading.Tasks;

            {source}
            """);
        var compilation = CSharpCompilation.Create(
            "AnalyzerFoundationSample",
            [syntaxTree],
            GetMetadataReferences(),
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var analyzers = ImmutableArray.Create<DiagnosticAnalyzer>(new AstraFlowAnalyzerFoundationAnalyzer());
        var analyzerCompilation = compilation.WithAnalyzers(analyzers);

        compilation.GetDiagnostics()
            .Where(diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
            .Should()
            .BeEmpty();

        return await analyzerCompilation.GetAnalyzerDiagnosticsAsync();
    }

    private static IReadOnlyCollection<MetadataReference> GetMetadataReferences()
    {
        var trustedPlatformAssemblies = ((string?)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES"))
            ?.Split(Path.PathSeparator)
            ?? [];

        var projectAssemblies = new[]
        {
            typeof(IRequest).Assembly.Location,
            typeof(IMapper).Assembly.Location,
            typeof(ConventionMappingProfile).Assembly.Location,
            typeof(IServiceCollection).Assembly.Location,
            typeof(ServiceCollectionServiceExtensions).Assembly.Location
        };

        return trustedPlatformAssemblies
            .Concat(projectAssemblies)
            .Where(path => !string.IsNullOrWhiteSpace(path))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(path => MetadataReference.CreateFromFile(path))
            .ToArray();
    }
}
