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

    [Theory]
    [InlineData("public long Count { get; set; }", "Count")]
    [InlineData("public int Missing { get; set; }", "Missing")]
    [InlineData("public string Password { get; set; } = \"\";", "Password")]
    [InlineData("public int Count;", "Count")]
    public void Member_errors_identify_the_destination_member_and_mapping(string property, string memberName)
    {
        var source = Declaration.Replace("public int Count { get; set; } public string Name { get; set; } = \"\"; }\npublic static", property + " }\npublic static");
        var (_, result) = Generate(source);
        var diagnostic = result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001").Subject;
        diagnostic.Location.SourceTree!.GetText().ToString(diagnostic.Location.SourceSpan).Should().Be(memberName);
        diagnostic.AdditionalLocations.Should().ContainSingle();
        var declaration = diagnostic.AdditionalLocations.Single();
        declaration.SourceTree!.GetText().ToString(declaration.SourceSpan).Should().Be("Convert");
    }

    [Fact]
    public void Referenced_destination_member_error_falls_back_to_mapping_declaration()
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.CSharp12);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        var models = CSharpCompilation.Create("ReferencedModels", [CSharpSyntaxTree.ParseText("public class Input { public int Value { get; set; } } public class Output { public long Value { get; set; } }", options)], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        using var stream = new MemoryStream();
        models.Emit(stream).Success.Should().BeTrue();
        references.Add(MetadataReference.CreateFromImage(stream.ToArray()));
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var tree = CSharpSyntaxTree.ParseText("using AstraFlow.Mapper; public static partial class Maps { [AstraGenerateMapping] public static partial Output Convert(Input source); }", options);
        var compilation = CSharpCompilation.Create("Consumer", [tree], references, new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        var result = driver.RunGenerators(compilation).GetRunResult();
        var diagnostic = result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001").Subject;
        diagnostic.Location.SourceTree!.GetText().ToString(diagnostic.Location.SourceSpan).Should().Be("Convert");
        diagnostic.AdditionalLocations.Should().BeEmpty();
    }

    [Theory]
    [InlineData("public Output(int value) { }", "parameterless constructor")]
    [InlineData("private Output() { }", "parameterless constructor")]
    public void Unsupported_constructors_are_reported(string constructor, string message)
    {
        var source = Declaration.Replace("public class Output {", "public class Output { " + constructor);
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource && d.GetMessage().Contains(message));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Theory]
    [InlineData("public int Count;", "fields")]
    [InlineData("public int this[int index] { get => 0; set { } }", "properties")]
    [InlineData("public int Count { get; private set; }", "public settable")]
    [InlineData("public System.Collections.Generic.List<int> Count { get; set; } = new();", "nested objects")]
    public void Unsupported_destination_members_are_reported(string property, string message)
    {
        var source = Declaration.Replace("public int Count { get; set; } public string Name { get; set; } = \"\"; }\npublic static", property + " }\npublic static");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains(message));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Sensitive_values_do_not_appear_in_generated_sources_or_diagnostics()
    {
        const string secret = "value-not-to-be-emitted-7b31";
        var source = Declaration.Replace("public int Count { get; set; } public string Name { get; set; } = \"\"; }\npublic static", "public string Password { get; set; } = \"" + secret + "\"; }\npublic static");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("sensitive"));
        result.Diagnostics.Select(d => d.ToString()).Should().NotContain(text => text.Contains(secret));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Identical_enum_properties_compile()
    {
        var source = Declaration.Replace("public class Input", "public enum Status { Active }\npublic class Input")
            .Replace("int Count", "Status Count");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Different_enum_types_are_rejected()
    {
        var source = Declaration.Replace("public class Input", "public enum Status { Active }\npublic enum OtherStatus { Active }\npublic class Input")
            .Replace("public class Input { public int Count", "public class Input { public Status Count")
            .Replace("public class Output { public int Count", "public class Output { public OtherStatus Count");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource);
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Cancellation_is_propagated_by_the_generator_driver()
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.CSharp12);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var compilation = CSharpCompilation.Create("CancelledMapping", [CSharpSyntaxTree.ParseText(Declaration, options)], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        using var cancellation = new CancellationTokenSource();
        cancellation.Cancel();
        Assert.ThrowsAny<OperationCanceledException>(() => driver.RunGenerators(compilation, cancellation.Token));
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
    public void Generated_mapping_compiles_with_CSharp9()
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.CSharp9);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var source = Declaration.Replace("namespace Example;", "namespace Example {") + "\n}";
        var compilation = CSharpCompilation.Create("CSharp9Mapping", [CSharpSyntaxTree.ParseText(source, options)], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Enable));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        driver = driver.RunGeneratorsAndUpdateCompilation(compilation, out var output, out var diagnostics);

        diagnostics.Should().BeEmpty();
        output.GetDiagnostics().Where(d => d.Severity is DiagnosticSeverity.Warning or DiagnosticSeverity.Error).Should().BeEmpty();
        using var stream = new MemoryStream();
        output.Emit(stream).Success.Should().BeTrue();
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
    public void Duplicate_pairs_do_not_prevent_other_pairs_from_compiling()
    {
        const string source = """
using AstraFlow.Mapper;
public class Input { public int Value { get; set; } }
public class Output { public int Value { get; set; } }
public class OtherInput { public int Value { get; set; } }
public class OtherOutput { public int Value { get; set; } }
public static partial class Maps
{
    [AstraGenerateMapping] public static partial Output Map(Input source);
    [AstraGenerateMapping] public static partial Output Again(Input source);
    [AstraGenerateMapping] public static partial OtherOutput Map(OtherInput source);
}
""";
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().HaveCount(2).And.OnlyContain(d => d.Id == "AFM001" && d.GetMessage().Contains("only once"));
        var generated = result.Results.Single().GeneratedSources.Should().ContainSingle().Subject;
        generated.SourceText.ToString().Should().Contain("global::OtherOutput Map(global::OtherInput source)");
        compilation.GetDiagnostics().Should().NotContain(d => d.Id == "CS8785" || (d.Severity == DiagnosticSeverity.Error && d.Location.SourceTree != null && d.Location.SourceTree.FilePath.EndsWith(".g.cs", StringComparison.Ordinal)));
    }

    [Fact]
    public void Nullable_source_member_cannot_flow_to_nonnullable_destination()
    {
        var source = Declaration.Replace("public string Name { get; set; } = \"\"; }\npublic class Output", "public string? Name { get; set; } }\npublic class Output");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("nullability"));
    }

    [Theory]
    [InlineData("[System.Diagnostics.CodeAnalysis.MaybeNull] public string Name { get; set; } = \"\";")]
    [InlineData("public string Name { [return: System.Diagnostics.CodeAnalysis.MaybeNull] get; set; } = \"\";")]
    public void MaybeNull_source_getter_cannot_flow_to_nonnullable_destination(string property)
    {
        var source = Declaration.Replace("public string Name { get; set; } = \"\"; }\npublic class Output", property + " }\npublic class Output");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("nullability"));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
        compilation.GetDiagnostics().Should().NotContain(d => d.Id == "CS8785");
    }

    [Fact]
    public void Nullable_source_cannot_flow_to_disallow_null_destination()
    {
        var source = Declaration.Replace("public string Name", "public string? Name")
            .Replace("public class Output { public int Count { get; set; } public string? Name", "public class Output { public int Count { get; set; } [System.Diagnostics.CodeAnalysis.DisallowNull] public string? Name");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("nullability"));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void MaybeNull_source_can_flow_to_nullable_destination()
    {
        var source = Declaration.Replace("public string Name { get; set; } = \"\"; }\npublic class Output", "[System.Diagnostics.CodeAnalysis.MaybeNull] public string Name { get; set; } = \"\"; }\npublic class Output")
            .Replace("public class Output { public int Count { get; set; } public string Name", "public class Output { public int Count { get; set; } public string? Name");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity is DiagnosticSeverity.Warning or DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Nonnullable_source_can_flow_to_disallow_null_destination()
    {
        var source = Declaration.Replace("public class Output { public int Count { get; set; } public string Name", "public class Output { public int Count { get; set; } [System.Diagnostics.CodeAnalysis.DisallowNull] public string? Name");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity is DiagnosticSeverity.Warning or DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Fact]
    public void Nullable_source_can_map_to_nullable_destination()
    {
        var source = Declaration.Replace("public string Name", "public string? Name");
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().BeEmpty();
        compilation.GetDiagnostics().Where(d => d.Severity == DiagnosticSeverity.Error).Should().BeEmpty();
    }

    [Theory]
    [InlineData("ref Input source")]
    [InlineData("in Input source")]
    [InlineData("out Input source")]
    public void By_reference_parameters_are_rejected_without_generated_implementation(string parameter)
    {
        var source = Declaration.Replace("Input source", parameter);
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource && d.GetMessage().Contains("one value parameter"));
        result.Diagnostics.Should().NotContain(d => d.Id == "CS8785");
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Theory]
    [InlineData("params Input[] source")]
    [InlineData("Input source = default")]
    [InlineData("scoped Input source")]
    public void Parameter_shapes_the_generator_cannot_reproduce_are_diagnosed(string parameter)
    {
        var source = Declaration.Replace("Input source", parameter);
        var (compilation, result) = Generate(source);

        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource && d.GetMessage().Contains("one value parameter"));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
        compilation.GetDiagnostics().Should().NotContain(d => d.Id == "CS8826" || d.Id == "CS8785");
    }

    [Fact]
    public void Nullable_value_members_are_explicitly_rejected()
    {
        var source = Declaration.Replace("int Count", "int? Count");
        var (_, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.Location.IsInSource && d.GetMessage().Contains("supported scalars"));
        result.Results.Single().GeneratedSources.Should().BeEmpty();
    }

    [Fact]
    public void Nullable_disabled_consumer_compiles_without_generated_nullability_warnings()
    {
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.CSharp12);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var compilation = CSharpCompilation.Create("NullableDisabled", [CSharpSyntaxTree.ParseText(Declaration, options)], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Disable));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options);
        driver = driver.RunGeneratorsAndUpdateCompilation(compilation, out var output, out var diagnostics);
        diagnostics.Should().BeEmpty();
        output.GetDiagnostics().Where(d => d.Severity is DiagnosticSeverity.Warning or DiagnosticSeverity.Error).Should().BeEmpty();
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
    public void Invalid_mapping_does_not_prevent_a_valid_mapping_from_being_generated()
    {
        var source = Declaration + """

public class BadInput { public int Value { get; set; } }
public class BadOutput { public long Value { get; set; } }
public static partial class BadMaps { [AstraGenerateMapping] public static partial BadOutput Convert(BadInput source); }
""";
        var (compilation, result) = Generate(source);
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001" && d.GetMessage().Contains("identical"));
        var generated = result.Results.Single().GeneratedSources.Should().ContainSingle().Subject;
        generated.SourceText.ToString().Should().Contain("partial class Maps").And.Contain("Count = source.Count");
        compilation.GetDiagnostics().Should().NotContain(d => d.Id == "CS8785");
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

    [Fact]
    public void Editing_one_pair_preserves_the_other_generated_method()
    {
        const string second = """
using AstraFlow.Mapper;
namespace Other;
public class Source { public int Value { get; set; } }
public class Destination { public int Value { get; set; } }
public static partial class Maps { [AstraGenerateMapping] public static partial Destination Convert(Source source); }
""";
        var options = CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.CSharp12);
        var firstTree = CSharpSyntaxTree.ParseText(Declaration, options);
        var secondTree = CSharpSyntaxTree.ParseText(second, options);
        var references = ((string)AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES")!).Split(Path.PathSeparator)
            .Select(path => MetadataReference.CreateFromFile(path)).ToList();
        references.Add(MetadataReference.CreateFromFile(typeof(AstraGenerateMappingAttribute).Assembly.Location));
        var compilation = CSharpCompilation.Create("IncrementalPairs", [firstTree, secondTree], references,
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary, nullableContextOptions: NullableContextOptions.Enable));
        GeneratorDriver driver = CSharpGeneratorDriver.Create([new AstraFlowExecutableMapperGenerator().AsSourceGenerator()], parseOptions: options,
            driverOptions: new GeneratorDriverOptions(IncrementalGeneratorOutputKind.None, trackIncrementalGeneratorSteps: true));
        driver = driver.RunGenerators(compilation);
        var before = driver.GetRunResult().Results.Single().GeneratedSources.Single(s => s.SourceText.ToString().Contains("namespace Other"));
        driver = driver.RunGenerators(compilation);
        var incrementalOutputs = driver.GetRunResult().Results.Single().TrackedOutputSteps.Values.SelectMany(steps => steps).SelectMany(step => step.Outputs).ToArray();
        incrementalOutputs.Count(output => output.Reason == IncrementalStepRunReason.Cached).Should().BeGreaterThanOrEqualTo(2);
        var changed = CSharpSyntaxTree.ParseText(Declaration.Replace("public class Input { public int Count", "public class Input { public long Count"), options);
        driver = driver.RunGenerators(compilation.ReplaceSyntaxTree(firstTree, changed));
        var result = driver.GetRunResult();
        result.Diagnostics.Should().ContainSingle(d => d.Id == "AFM001");
        var after = result.Results.Single().GeneratedSources.Should().ContainSingle().Subject;
        after.HintName.Should().Be(before.HintName);
        after.SourceText.ToString().Should().Be(before.SourceText.ToString());
        var trackedOutputs = result.Results.Single().TrackedOutputSteps.Values.SelectMany(steps => steps).SelectMany(step => step.Outputs).ToArray();
        trackedOutputs.Should().ContainSingle(output => output.Reason == IncrementalStepRunReason.Modified);
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
