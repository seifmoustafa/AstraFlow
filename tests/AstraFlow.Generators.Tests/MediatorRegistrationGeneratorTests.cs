using System.Collections.Immutable;
using System.Reflection;
using AstraFlow.Generators;
using AstraFlow.Mediator;
using FluentAssertions;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace AstraFlow.Generators.Tests;

public sealed class MediatorRegistrationGeneratorTests
{
    [Fact]
    public void Generator_emits_deterministic_registration_method_for_mediator_components()
    {
        const string source = """
using System;
using System.Collections.Generic;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Threading.Tasks;
using AstraFlow.Mediator;

namespace SampleApp;

public sealed record Ping(string Value) : IRequest<string>;
public sealed record VoidPing(string Value) : IRequest;
public sealed record Events(string Value) : INotification;
public sealed record StreamPing(int Count) : IStreamRequest<int>;

public sealed class PingHandler : IRequestHandler<Ping, string>
{
    public Task<string> Handle(Ping request, CancellationToken cancellationToken) => Task.FromResult(request.Value);
}

internal sealed class VoidPingHandler : IRequestHandler<VoidPing>
{
    public Task Handle(VoidPing request, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class EventsHandler : INotificationHandler<Events>
{
    public Task Handle(Events notification, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class StreamPingHandler : IStreamRequestHandler<StreamPing, int>
{
    public async IAsyncEnumerable<int> Handle(StreamPing request, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await Task.Yield();
        yield return request.Count;
    }
}

public sealed class PingPreProcessor : IRequestPreProcessor<Ping>
{
    public Task Process(Ping request, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class PingPostProcessor : IRequestPostProcessor<Ping, string>
{
    public Task Process(Ping request, string response, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class VoidPostProcessor : IRequestPostProcessor<VoidPing>
{
    public Task Process(VoidPing request, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class PingExceptionAction : IRequestExceptionAction<Ping, string, InvalidOperationException>
{
    public Task Execute(Ping request, InvalidOperationException exception, CancellationToken cancellationToken) => Task.CompletedTask;
}

public sealed class VoidExceptionHandler : IRequestExceptionHandler<VoidPing, InvalidOperationException>
{
    public Task Handle(VoidPing request, InvalidOperationException exception, RequestExceptionHandlerState state, CancellationToken cancellationToken) => Task.CompletedTask;
}
""";

        var (outputCompilation, generatedText) = RunGenerator(source);

        outputCompilation.GetDiagnostics()
            .Where(static diagnostic => diagnostic.Severity == DiagnosticSeverity.Error)
            .Should()
            .BeEmpty();

        generatedText.Should().Contain("public static class AstraFlowGeneratedMediatorRegistration");
        generatedText.Should().Contain("AddAstraFlowGeneratedMediatorRegistrations");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.INotificationHandler<global::SampleApp.Events>, global::SampleApp.EventsHandler>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestHandler<global::SampleApp.Ping, string>, global::SampleApp.PingHandler>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestHandler<global::SampleApp.VoidPing>, global::SampleApp.VoidPingHandler>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IStreamRequestHandler<global::SampleApp.StreamPing, int>, global::SampleApp.StreamPingHandler>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestPreProcessor<global::SampleApp.Ping>, global::SampleApp.PingPreProcessor>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestPostProcessor<global::SampleApp.Ping, string>, global::SampleApp.PingPostProcessor>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestPostProcessor<global::SampleApp.VoidPing>, global::SampleApp.VoidPostProcessor>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestExceptionAction<global::SampleApp.Ping, string, global::System.InvalidOperationException>, global::SampleApp.PingExceptionAction>(services);");
        generatedText.Should().Contain("AddScoped<global::AstraFlow.Mediator.IRequestExceptionHandler<global::SampleApp.VoidPing, global::System.InvalidOperationException>, global::SampleApp.VoidExceptionHandler>(services);");
    }

    [Fact]
    public void Generator_skips_open_generic_and_private_nested_components()
    {
        const string source = """
using System.Threading;
using System.Threading.Tasks;
using AstraFlow.Mediator;

namespace SampleApp;

public sealed record Ping(string Value) : IRequest<string>;

public sealed class OpenHandler<TRequest, TResponse> : IRequestHandler<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken) => throw new System.NotImplementedException();
}

public sealed class Container
{
    private sealed class PrivateHandler : IRequestHandler<Ping, string>
    {
        public Task<string> Handle(Ping request, CancellationToken cancellationToken) => Task.FromResult(request.Value);
    }
}

public readonly struct StructHandler : IRequestHandler<Ping, string>
{
    public Task<string> Handle(Ping request, CancellationToken cancellationToken) => Task.FromResult(request.Value);
}
""";

        var (_, generatedText) = RunGenerator(source);

        generatedText.Should().NotContain("OpenHandler");
        generatedText.Should().NotContain("PrivateHandler");
        generatedText.Should().NotContain("StructHandler");
    }

    [Fact]
    public void Generator_emits_empty_extension_when_di_and_contracts_are_available_without_components()
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

        generatedText.Should().Contain("AddAstraFlowGeneratedMediatorRegistrations");
        generatedText.Should().Contain("return services;");
        generatedText.Should().NotContain("AddScoped<");
    }

    private static (Compilation OutputCompilation, string GeneratedText) RunGenerator(string source)
    {
        var syntaxTree = CSharpSyntaxTree.ParseText(
            source,
            CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Preview));

        var compilation = CSharpCompilation.Create(
            "GeneratorTests",
            new[] { syntaxTree },
            GetReferences(),
            new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var generator = new AstraFlowMediatorRegistrationGenerator();
        var driver = CSharpGeneratorDriver.Create(
            new[] { generator.AsSourceGenerator() },
            parseOptions: CSharpParseOptions.Default.WithLanguageVersion(LanguageVersion.Preview));
        driver.RunGeneratorsAndUpdateCompilation(compilation, out var outputCompilation, out var generatorDiagnostics);

        generatorDiagnostics.Should().BeEmpty();

        var generatedText = outputCompilation.SyntaxTrees
            .Single(tree => tree.FilePath.EndsWith("AstraFlow.GeneratedMediatorRegistrations.g.cs", StringComparison.Ordinal))
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

        references.Add(MetadataReference.CreateFromFile(typeof(IRequest).Assembly.Location));
        references.Add(MetadataReference.CreateFromFile(typeof(IServiceCollection).Assembly.Location));
        references.Add(MetadataReference.CreateFromFile(typeof(ServiceCollectionServiceExtensions).Assembly.Location));

        return references.ToImmutableArray();
    }
}
