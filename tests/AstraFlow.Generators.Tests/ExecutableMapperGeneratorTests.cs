using System.Reflection;
using AstraFlow.Generators;
using AstraFlow.Mapper;
using FluentAssertions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Xunit;

namespace AstraFlow.Generators.Tests;

public sealed class ExecutableMapperGeneratorTests
{
    private const string Declaration = """
using AstraFlow.Mapper;
namespace Example;
public class Input { public int Count { get; set; } public string Name { get; set; } = ""; }
public class Output { public int Count { get; set; } public string Name { get; set; } = ""; }
public static partial class Maps { [AstraGenerateMapping] public static partial Output Convert(Input source); }
""";

    [Fact]
    public void Generated_method_compiles_and_executes_and_guards_null()
    {
        var (compilation, result) = Generate(Declaration);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
        using var stream = new MemoryStream();
        compilation.Emit(stream).Success.Should().BeTrue();
        var assembly = Assembly.Load(stream.ToArray());
        var input = Activator.CreateInstance(assembly.GetType("Example.Input")!)!;
        input.GetType().GetProperty("Count")!.SetValue(input, 42);
        input.GetType().GetProperty("Name")!.SetValue(input, "Ada");
        var method = assembly.GetType("Example.Maps")!.GetMethod("Convert")!;
        var output = method.Invoke(null, [input])!;
        output.GetType().GetProperty("Count")!.GetValue(output).Should().Be(42);
        output.GetType().GetProperty("Name")!.GetValue(output).Should().Be("Ada");
        var error = Assert.Throws<TargetInvocationException>(() => method.Invoke(null, [null]));
        error.InnerException.Should().BeOfType<ArgumentNullException>();
    }

    [Theory]
    [InlineData("public string Password { get; set; } = \"\";", "sensitive")]
    [InlineData("public required string Name { get; set; }", "non-required")]
    [InlineData("public string Name { get; init; } = \"\";", "init-only")]
    [InlineData("public long Count { get; set; }", "identical")]
    [InlineData("public object Count { get; set; } = new();", "identical")]
    [InlineData("public int Missing { get; set; }", "same name")]
    public void Unsafe_shapes_report_located_errors_and_emit_no_mapping(string property, string message)
    {
        var source = Declaration.Replace("public int Count { get; set; } public string Name { get; set; } = \"\"; }\npublic static", property + " }\npublic static");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource && d.GetMessage().Contains(message));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Keyword_namespace_type_method_parameter_and_member_compile()
    {
        const string source = """
using AstraFlow.Mapper;
namespace @namespace;
public class @class { public int @event { get; set; } }
public class @struct { public int @event { get; set; } }
public static partial class @return { [AstraGenerateMapping] public static partial @struct @new(@class @params); }
""";
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Extension_method_declaration_never_emits_invalid_implementation()
    {
        var source = Declaration.Replace("Convert(Input source)", "Convert(this Input source)");
        var (compilation, result) = Generate(source);
        var generatedErrors = compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error && d.Location.SourceTree?.FilePath.EndsWith(".g.cs", StringComparison.Ordinal) == true);
        generatedErrors.Should().BeEmpty();
        if (result.Diagnostics.IsEmpty)
        {
            compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
        }
        else
        {
            result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource);
            result.Results.Single().GeneratedSources.Should().BeEmpty();
        }
    }

    [Fact]
    public void File_local_mapping_class_reports_error_instead_of_emitting_an_inaccessible_partial()
    {
        var source = Declaration.Replace("public static partial class Maps", "file static partial class Maps");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource);
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Repeated_compilation_is_deterministic()
    {
        var first = Generate(Declaration).Result.Results.Single().GeneratedSources.Single();
        var second = Generate(Declaration).Result.Results.Single().GeneratedSources.Single();
        first.HintName.Should().Be(second.HintName);
        first.SourceText.ToString().Should().Be(second.SourceText.ToString());
        first.SourceText.ToString().Should().Contain("Count = source.Count").And.Contain("Name = source.Name");
    }

    [Fact]
    public void Duplicate_pairs_are_rejected_without_emission()
    {
        var source = Declaration.Replace("public static partial Output Convert(Input source);", "public static partial Output Convert(Input source); [AstraGenerateMapping] public static partial Output Other(Input source);");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().HaveCount(2).And.OnlyContain(d => d.Id == "AFM001" && d.GetMessage().Contains("only once"));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Nullable_source_member_cannot_flow_to_nonnullable_destination()
    {
        var source = Declaration.Replace("public string Name { get; set; } = \"\"; }\npublic class Output", "public string? Name { get; set; } }\npublic class Output");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("nullability"));
    }

    [Fact]
    public void Nullable_source_can_map_to_nullable_destination()
    {
        var source = Declaration.Replace("public string Name", "public string? Name");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Distinct_pairs_generate_independent_compilable_methods()
    {
        var source = Declaration + """

public class SecondInput { public int Value { get; set; } }
public class SecondOutput { public int Value { get; set; } }
public static partial class OtherMaps { [AstraGenerateMapping] public static partial SecondOutput Convert(SecondInput source); }
""";
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        result.Results.Single().GeneratedSources.Should().HaveCount(2);
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Broken_types_do_not_crash_the_generator()
    {
        var source = Declaration.Replace("Output Convert(Input source)", "Missing Convert(Input source)");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().Contain(d => d.Id == "AFM001");
        result.Diagnostics.Should().NotContain(d => d.Id == "CS8785");
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Editing_a_source_property_updates_diagnostics_on_the_same_driver()
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Preview);
        var tree = CSharpSyntaxTree.ParseText(Declaration, options);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var compilation = CSharpCompilation.Create("IncrementalTest", [tree], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Enable));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        driver = driver.RunGenerators(compilation);
        driver.GetRunResult().Results.Single().GeneratedSources.Should().ContainSingle();
        var changed = CSharpSyntaxTree.ParseText(Declaration.Replace("public class Input { public int Count", "public class Input { public long Count"), options);
        driver = driver.RunGenerators(compilation.ReplaceSyntaxTree(tree, changed));
        driver.GetRunResult().Diagnostics.Should().Contain(d => d.Id == "AFM001");
        driver.GetRunResult().Results.Single().GeneratedSources.Should().BeEmpty();
    }

    private static (Compilation Compilation, GeneratorDriverRunResult Result) Generate(string source)
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Preview);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var compilation = CSharpCompilation.Create("GeneratedMappingTest", [CSharpSyntaxTree.ParseText(source, options)], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Enable));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        driver = driver.RunGeneratorsAndUpdateCompilation(compilation, out var output, out _);
        return (output, driver.GetRunResult());
    }
}
