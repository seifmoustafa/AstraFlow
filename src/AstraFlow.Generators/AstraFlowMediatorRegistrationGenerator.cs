using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;

namespace AstraFlow.Generators;

/// <summary>
/// Generates deterministic dependency-injection registrations for closed AstraFlow mediator components.
/// </summary>
[Generator]
public sealed class AstraFlowMediatorRegistrationGenerator : IIncrementalGenerator
{
    private const string ServiceCollectionMetadataName = "Microsoft.Extensions.DependencyInjection.IServiceCollection";

    private static readonly SymbolDisplayFormat TypeDisplayFormat = new(
        globalNamespaceStyle: SymbolDisplayGlobalNamespaceStyle.Included,
        typeQualificationStyle: SymbolDisplayTypeQualificationStyle.NameAndContainingTypesAndNamespaces,
        genericsOptions: SymbolDisplayGenericsOptions.IncludeTypeParameters,
        miscellaneousOptions:
            SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers |
            SymbolDisplayMiscellaneousOptions.UseSpecialTypes);

    private static readonly string[] MediatorComponentMetadataNames =
    {
        "AstraFlow.Mediator.IRequestHandler`1",
        "AstraFlow.Mediator.IRequestHandler`2",
        "AstraFlow.Mediator.INotificationHandler`1",
        "AstraFlow.Mediator.IStreamRequestHandler`2",
        "AstraFlow.Mediator.IRequestPreProcessor`1",
        "AstraFlow.Mediator.IRequestPostProcessor`1",
        "AstraFlow.Mediator.IRequestPostProcessor`2",
        "AstraFlow.Mediator.IRequestExceptionAction`2",
        "AstraFlow.Mediator.IRequestExceptionAction`3",
        "AstraFlow.Mediator.IRequestExceptionHandler`2",
        "AstraFlow.Mediator.IRequestExceptionHandler`3",
    };

    /// <inheritdoc />
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var generatedSource = context.CompilationProvider.Select(static (compilation, _) => CreateSource(compilation));

        context.RegisterSourceOutput(
            generatedSource,
            static (sourceProductionContext, source) =>
            {
                if (!string.IsNullOrWhiteSpace(source))
                {
                    sourceProductionContext.AddSource("AstraFlow.GeneratedMediatorRegistrations.g.cs", source!);
                }
            });
    }

    private static string? CreateSource(Compilation compilation)
    {
        if (compilation.GetTypeByMetadataName(ServiceCollectionMetadataName) is null)
        {
            return null;
        }

        var componentInterfaces = MediatorComponentMetadataNames
            .Select(compilation.GetTypeByMetadataName)
            .Where(static symbol => symbol is not null)
            .Cast<INamedTypeSymbol>()
            .ToImmutableArray();

        if (componentInterfaces.IsDefaultOrEmpty)
        {
            return null;
        }

        var registrations = DiscoverRegistrations(compilation, componentInterfaces);
        return Render(registrations);
    }

    private static ImmutableArray<Registration> DiscoverRegistrations(
        Compilation compilation,
        ImmutableArray<INamedTypeSymbol> componentInterfaces)
    {
        var registrations = ImmutableArray.CreateBuilder<Registration>();
        var seen = new HashSet<string>(StringComparer.Ordinal);

        foreach (var type in EnumerateTypes(compilation.GlobalNamespace))
        {
            if (!CanRegister(type))
            {
                continue;
            }

            foreach (var candidateInterface in type.AllInterfaces)
            {
                if (!IsMediatorComponent(candidateInterface, componentInterfaces))
                {
                    continue;
                }

                var serviceType = candidateInterface.ToDisplayString(TypeDisplayFormat);
                var implementationType = type.ToDisplayString(TypeDisplayFormat);
                var key = serviceType + "=>" + implementationType;

                if (seen.Add(key))
                {
                    registrations.Add(new Registration(serviceType, implementationType));
                }
            }
        }

        return registrations
            .OrderBy(static registration => registration.ServiceType, StringComparer.Ordinal)
            .ThenBy(static registration => registration.ImplementationType, StringComparer.Ordinal)
            .ToImmutableArray();
    }

    private static bool IsMediatorComponent(
        INamedTypeSymbol candidateInterface,
        ImmutableArray<INamedTypeSymbol> componentInterfaces)
    {
        foreach (var componentInterface in componentInterfaces)
        {
            if (SymbolEqualityComparer.Default.Equals(candidateInterface.OriginalDefinition, componentInterface))
            {
                return true;
            }
        }

        return false;
    }

    private static bool CanRegister(INamedTypeSymbol type)
    {
        if (type.IsAbstract || type.IsUnboundGenericType || type.TypeParameters.Length > 0)
        {
            return false;
        }

        if (type.TypeKind is not TypeKind.Class)
        {
            return false;
        }

        for (var current = type; current is not null; current = current.ContainingType)
        {
            if (current.DeclaredAccessibility is Accessibility.Private or Accessibility.Protected)
            {
                return false;
            }
        }

        return true;
    }

    private static IEnumerable<INamedTypeSymbol> EnumerateTypes(INamespaceSymbol namespaceSymbol)
    {
        foreach (var type in namespaceSymbol.GetTypeMembers())
        {
            foreach (var nestedType in EnumerateTypes(type))
            {
                yield return nestedType;
            }
        }

        foreach (var childNamespace in namespaceSymbol.GetNamespaceMembers())
        {
            foreach (var type in EnumerateTypes(childNamespace))
            {
                yield return type;
            }
        }
    }

    private static IEnumerable<INamedTypeSymbol> EnumerateTypes(INamedTypeSymbol type)
    {
        yield return type;

        foreach (var nestedType in type.GetTypeMembers())
        {
            foreach (var childType in EnumerateTypes(nestedType))
            {
                yield return childType;
            }
        }
    }

    private static string Render(ImmutableArray<Registration> registrations)
    {
        var builder = new StringBuilder();

        builder.AppendLine("// <auto-generated />");
        builder.AppendLine("#nullable enable");
        builder.AppendLine();
        builder.AppendLine("namespace AstraFlow.Mediator");
        builder.AppendLine("{");
        builder.AppendLine("    /// <summary>");
        builder.AppendLine("    /// Generated AstraFlow mediator component registrations for this assembly.");
        builder.AppendLine("    /// </summary>");
        builder.AppendLine("    public static class AstraFlowGeneratedMediatorRegistration");
        builder.AppendLine("    {");
        builder.AppendLine("        /// <summary>");
        builder.AppendLine("        /// Adds generated mediator component registrations discovered at compile time.");
        builder.AppendLine("        /// </summary>");
        builder.AppendLine("        public static global::Microsoft.Extensions.DependencyInjection.IServiceCollection AddAstraFlowGeneratedMediatorRegistrations(");
        builder.AppendLine("            this global::Microsoft.Extensions.DependencyInjection.IServiceCollection services)");
        builder.AppendLine("        {");
        builder.AppendLine("            if (services is null)");
        builder.AppendLine("            {");
        builder.AppendLine("                throw new global::System.ArgumentNullException(nameof(services));");
        builder.AppendLine("            }");
        builder.AppendLine();

        foreach (var registration in registrations)
        {
            builder.Append("            global::Microsoft.Extensions.DependencyInjection.ServiceCollectionServiceExtensions.AddScoped<");
            builder.Append(registration.ServiceType);
            builder.Append(", ");
            builder.Append(registration.ImplementationType);
            builder.AppendLine(">(services);");
        }

        if (registrations.Length > 0)
        {
            builder.AppendLine();
        }

        builder.AppendLine("            return services;");
        builder.AppendLine("        }");
        builder.AppendLine("    }");
        builder.AppendLine("}");

        return builder.ToString();
    }

    private readonly record struct Registration(string ServiceType, string ImplementationType);
}
