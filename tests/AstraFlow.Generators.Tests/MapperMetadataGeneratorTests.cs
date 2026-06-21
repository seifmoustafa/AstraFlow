using System.Collections.Immutable;
using AstraFlow.Generators;
using AstraFlow.Mapper;
using FluentAssertions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Generators.Tests;

public sealed class MapperMetadataGeneratorTests
{
    [Fact]
    public void Generator_emits_mapping_and_projection_metadata_provider()
    {
        const string source = """
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using AstraFlow.Mapper;

namespace SampleApp;

public sealed class Customer;
public sealed record CustomerDto(string Name);
public sealed record CustomerParameters(string Culture);

public sealed class CustomerRule : IDeclaredObjectMappingRule
{
    public IReadOnlyCollection<ObjectMappingPair> DeclaredMappings { get; } =
        new[] { ObjectMappingPair.Create<Customer, CustomerDto>() };

    public bool CanMap(Type sourceType, Type destinationType) => false;
    public object? Map(object? source, Type destinationType, IMapper mapper) => null;
}

public sealed class LegacyRule : IObjectMappingRule
{
    public bool CanMap(Type sourceType, Type destinationType) => false;
    public object? Map(object? source, Type destinationType, IMapper mapper) => null;
}

public sealed class CustomerProjection : INamedProjection<Customer, CustomerDto>
{
    public string Name => "list";
    public Expression<Func<Customer, CustomerDto>> Expression => customer => new CustomerDto("name");
}

public sealed class ParameterizedCustomerProjection
    : INamedParameterizedProjection<Customer, CustomerDto, CustomerParameters>
{
    public string Name => "localized";
    public Expression<Func<Customer, CustomerParameters, CustomerDto>> Expression =>
        (customer, parameters) => new CustomerDto(parameters.Culture);
}
""";

        var (outputCompilation, generatedText) = RunGenerator(source);

        outputCompilation.GetDiagnostics()
            .Where(static diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
            .Should()
            .BeEmpty();

        generatedText.Should().Contain("public static class AstraFlowGeneratedMapperMetadataRegistration");
        generatedText.Should().Contain("AddAstraFlowGeneratedMapperMetadata");
        generatedText.Should().Contain("GetAstraFlowGeneratedMapperMetadata");
        generatedText.Should().Contain("new(typeof(global::SampleApp.CustomerRule), true)");
        generatedText.Should().Contain("new(typeof(global::SampleApp.LegacyRule), false)");
        generatedText.Should().Contain("typeof(global::AstraFlow.Mapper.IProjection<global::SampleApp.Customer, global::SampleApp.CustomerDto>)");
        generatedText.Should().Contain("typeof(global::AstraFlow.Mapper.IParameterizedProjection<global::SampleApp.Customer, global::SampleApp.CustomerDto, global::SampleApp.CustomerParameters>)");
        generatedText.Should().Contain("typeof(global::SampleApp.ParameterizedCustomerProjection), global::Microsoft.Extensions.DependencyInjection.ServiceLifetime.Scoped, true");
    }

    [Fact]
    public void Generator_skips_open_generic_private_nested_and_struct_mapper_shapes()
    {
        const string source = """
using System;
using System.Linq.Expressions;
using AstraFlow.Mapper;

namespace SampleApp;

public sealed class Customer;
public sealed record CustomerDto(string Name);

public sealed class OpenRule<T> : IObjectMappingRule
{
    public bool CanMap(Type sourceType, Type destinationType) => false;
    public object? Map(object? source, Type destinationType, IMapper mapper) => null;
}

public readonly struct StructRule : IObjectMappingRule
{
    public bool CanMap(Type sourceType, Type destinationType) => false;
    public object? Map(object? source, Type destinationType, IMapper mapper) => null;
}

public sealed class Container
{
    private sealed class PrivateProjection : IProjection<Customer, CustomerDto>
    {
        public Expression<Func<Customer, CustomerDto>> Expression => customer => new CustomerDto("name");
    }
}
""";

        var (_, generatedText) = RunGenerator(source);

        generatedText.Should().NotContain("OpenRule");
        generatedText.Should().NotContain("StructRule");
        generatedText.Should().NotContain("PrivateProjection");
    }

    [Fact]
    public void Generator_emits_empty_metadata_when_mapper_contracts_are_available_without_components()
    {
        const string source = """
namespace SampleApp;

public sealed class Marker;
""";

        var (outputCompilation, generatedText) = RunGenerator(source);

        outputCompilation.GetDiagnostics()
            .Where(static diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
            .Should()
            .BeEmpty();

        generatedText.Should().Contain("AddAstraFlowGeneratedMapperMetadata");
        generatedText.Should().Contain("new global::AstraFlow.Mapper.GeneratedMappingRuleMetadata[]");
        generatedText.Should().Contain("new global::AstraFlow.Mapper.GeneratedProjectionMetadata[]");
    }

    private static (Compilation OutputCompilation, string GeneratedText) RunGenerator(string source)
    {
        var parseOptions = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Preview);
        var syntaxTree = CSharpSyntaxTree.ParseText(source, parseOptions);

        var compilation = CSharpCompilation.Create(
            "MapperMetadataGeneratorTests",
            new[] { syntaxTree },
            GetReferences(),
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var generator = new AstraFlowMapperMetadataGenerator();
        var driver = CSharpGeneratorDriver.Create(
            new[] { generator.AsSourceGenerator() },
            parseOptions: parseOptions);

        driver.RunGeneratorsAndUpdateCompilation(compilation, out var outputCompilation, out var generatorDiagnostics);

        generatorDiagnostics.Should().BeEmpty();

        var generatedText = outputCompilation.SyntaxTrees
            .Single(tree => tree.FilePath.EndsWith("AstraFlow.GeneratedMapperMetadata.g.cs", StringComparison.Ordinal))
            .ToString();

        return (outputCompilation, generatedText);
    }

    private static ImmutableArray<MetadataReference> GetReferences()
    {
        var references = ((string?)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES"))!
            .Split(Path.PathSeparator)
            .Select(static path => MetadataReference.CreateFromFile(path))
            .Cast<MetadataReference>()
            .ToList();

        references.Add(MetadataReference.CreateFromFile(typeof(IObjectMappingRule).Assembly.Location));
        references.Add(MetadataReference.CreateFromFile(typeof(IServiceCollection).Assembly.Location));
        references.Add(MetadataReference.CreateFromFile(typeof(ServiceCollectionServiceExtensions).Assembly.Location));

        return references.ToImmutableArray();
    }
}
