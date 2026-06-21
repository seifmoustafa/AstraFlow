using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;

namespace AstraFlow.Generators;

/// <summary>
/// Generates deterministic mapper and projection metadata for diagnostics, CLI, and future AOT paths.
/// </summary>
[Generator]
public sealed class AstraFlowMapperMetadataGenerator : IIncrementalGenerator
{
    private const string ServiceCollectionMetadataName = "Microsoft.Extensions.DependencyInjection.IServiceCollection";
    private const string ObjectMappingRuleMetadataName = "AstraFlow.Mapper.IObjectMappingRule";
    private const string DeclaredObjectMappingRuleMetadataName = "AstraFlow.Mapper.IDeclaredObjectMappingRule";
    private const string ProjectionMetadataName = "AstraFlow.Mapper.IProjection`2";
    private const string NamedProjectionMetadataName = "AstraFlow.Mapper.INamedProjection`2";
    private const string ParameterizedProjectionMetadataName = "AstraFlow.Mapper.IParameterizedProjection`3";
    private const string NamedParameterizedProjectionMetadataName = "AstraFlow.Mapper.INamedParameterizedProjection`3";

    private static readonly SymbolDisplayFormat TypeDisplayFormat = new(
        globalNamespaceStyle: SymbolDisplayGlobalNamespaceStyle.Included,
        typeQualificationStyle: SymbolDisplayTypeQualificationStyle.NameAndContainingTypesAndNamespaces,
        genericsOptions: SymbolDisplayGenericsOptions.IncludeTypeParameters,
        miscellaneousOptions:
            SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers |
            SymbolDisplayMiscellaneousOptions.UseSpecialTypes);

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
                    sourceProductionContext.AddSource("AstraFlow.GeneratedMapperMetadata.g.cs", source!);
                }
            });
    }

    private static string? CreateSource(Compilation compilation)
    {
        if (compilation.GetTypeByMetadataName(ServiceCollectionMetadataName) is null)
        {
            return null;
        }

        var symbols = MapperSymbols.Create(compilation);
        if (!symbols.IsAvailable)
        {
            return null;
        }

        var mappingRules = ImmutableArray.CreateBuilder<MappingRuleMetadata>();
        var projections = ImmutableArray.CreateBuilder<ProjectionMetadata>();
        var seenProjectionKeys = new HashSet<string>(StringComparer.Ordinal);

        foreach (var type in EnumerateTypes(compilation.GlobalNamespace))
        {
            if (!CanRegister(type))
            {
                continue;
            }

            if (symbols.IsMappingRule(type))
            {
                mappingRules.Add(new MappingRuleMetadata(
                    type.ToDisplayString(TypeDisplayFormat),
                    symbols.IsDeclaredMappingRule(type)));
            }

            foreach (var projection in symbols.GetProjectionMetadata(type))
            {
                var key = projection.ServiceType + "=>" + projection.ImplementationType;
                if (seenProjectionKeys.Add(key))
                {
                    projections.Add(projection);
                }
            }
        }

        return Render(
            mappingRules
                .OrderBy(static rule => rule.ImplementationType, StringComparer.Ordinal)
                .ToImmutableArray(),
            projections
                .OrderBy(static projection => projection.ServiceType, StringComparer.Ordinal)
                .ThenBy(static projection => projection.ImplementationType, StringComparer.Ordinal)
                .ToImmutableArray());
    }

    private static bool CanRegister(INamedTypeSymbol type)
    {
        if (!type.Locations.Any(static location => location.IsInSource))
        {
            return false;
        }

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

    private static string Render(
        ImmutableArray<MappingRuleMetadata> mappingRules,
        ImmutableArray<ProjectionMetadata> projections)
    {
        var builder = new StringBuilder();

        builder.AppendLine("// <auto-generated />");
        builder.AppendLine("#nullable enable");
        builder.AppendLine();
        builder.AppendLine("namespace AstraFlow.Mapper");
        builder.AppendLine("{");
        builder.AppendLine("    /// <summary>");
        builder.AppendLine("    /// Generated AstraFlow mapper and projection metadata for this assembly.");
        builder.AppendLine("    /// </summary>");
        builder.AppendLine("    public static class AstraFlowGeneratedMapperMetadataRegistration");
        builder.AppendLine("    {");
        builder.AppendLine("        /// <summary>");
        builder.AppendLine("        /// Adds generated mapper metadata discovered at compile time.");
        builder.AppendLine("        /// </summary>");
        builder.AppendLine("        public static global::Microsoft.Extensions.DependencyInjection.IServiceCollection AddAstraFlowGeneratedMapperMetadata(");
        builder.AppendLine("            this global::Microsoft.Extensions.DependencyInjection.IServiceCollection services)");
        builder.AppendLine("        {");
        builder.AppendLine("            if (services is null)");
        builder.AppendLine("            {");
        builder.AppendLine("                throw new global::System.ArgumentNullException(nameof(services));");
        builder.AppendLine("            }");
        builder.AppendLine();
        builder.AppendLine("            global::Microsoft.Extensions.DependencyInjection.ServiceCollectionServiceExtensions.AddSingleton<global::AstraFlow.Mapper.IGeneratedMapperMetadataProvider, AstraFlowGeneratedMapperMetadataProvider>(services);");
        builder.AppendLine("            return services;");
        builder.AppendLine("        }");
        builder.AppendLine();
        builder.AppendLine("        /// <summary>");
        builder.AppendLine("        /// Gets generated mapper metadata without using dependency injection.");
        builder.AppendLine("        /// </summary>");
        builder.AppendLine("        public static global::AstraFlow.Mapper.GeneratedMapperMetadata GetAstraFlowGeneratedMapperMetadata()");
        builder.AppendLine("        {");
        builder.AppendLine("            return AstraFlowGeneratedMapperMetadataProvider.Metadata;");
        builder.AppendLine("        }");
        builder.AppendLine("    }");
        builder.AppendLine();
        builder.AppendLine("    internal sealed class AstraFlowGeneratedMapperMetadataProvider : global::AstraFlow.Mapper.IGeneratedMapperMetadataProvider");
        builder.AppendLine("    {");
        builder.AppendLine("        internal static readonly global::AstraFlow.Mapper.GeneratedMapperMetadata Metadata = new(");
        builder.AppendLine("            new global::AstraFlow.Mapper.GeneratedMappingRuleMetadata[]");
        builder.AppendLine("            {");

        foreach (var mappingRule in mappingRules)
        {
            builder.Append("                new(typeof(");
            builder.Append(mappingRule.ImplementationType);
            builder.Append("), ");
            builder.Append(mappingRule.IsDeclared ? "true" : "false");
            builder.AppendLine("),");
        }

        builder.AppendLine("            },");
        builder.AppendLine("            new global::AstraFlow.Mapper.GeneratedProjectionMetadata[]");
        builder.AppendLine("            {");

        foreach (var projection in projections)
        {
            builder.Append("                new(typeof(");
            builder.Append(projection.SourceType);
            builder.Append("), typeof(");
            builder.Append(projection.DestinationType);
            builder.Append("), ");

            if (projection.ParameterType is null)
            {
                builder.Append("null");
            }
            else
            {
                builder.Append("typeof(");
                builder.Append(projection.ParameterType);
                builder.Append(")");
            }

            builder.Append(", typeof(");
            builder.Append(projection.ServiceType);
            builder.Append("), typeof(");
            builder.Append(projection.ImplementationType);
            builder.Append("), global::Microsoft.Extensions.DependencyInjection.ServiceLifetime.Scoped, ");
            builder.Append(projection.IsNamed ? "true" : "false");
            builder.AppendLine("),");
        }

        builder.AppendLine("            });");
        builder.AppendLine();
        builder.AppendLine("        public global::AstraFlow.Mapper.GeneratedMapperMetadata GetMetadata()");
        builder.AppendLine("        {");
        builder.AppendLine("            return Metadata;");
        builder.AppendLine("        }");
        builder.AppendLine("    }");
        builder.AppendLine("}");

        return builder.ToString();
    }

    private readonly record struct MappingRuleMetadata(string ImplementationType, bool IsDeclared);

    private readonly record struct ProjectionMetadata(
        string SourceType,
        string DestinationType,
        string? ParameterType,
        string ServiceType,
        string ImplementationType,
        bool IsNamed);

    private sealed class MapperSymbols
    {
        private readonly INamedTypeSymbol? objectMappingRule;
        private readonly INamedTypeSymbol? declaredObjectMappingRule;
        private readonly INamedTypeSymbol? projection;
        private readonly INamedTypeSymbol? namedProjection;
        private readonly INamedTypeSymbol? parameterizedProjection;
        private readonly INamedTypeSymbol? namedParameterizedProjection;

        private MapperSymbols(
            INamedTypeSymbol? objectMappingRule,
            INamedTypeSymbol? declaredObjectMappingRule,
            INamedTypeSymbol? projection,
            INamedTypeSymbol? namedProjection,
            INamedTypeSymbol? parameterizedProjection,
            INamedTypeSymbol? namedParameterizedProjection)
        {
            this.objectMappingRule = objectMappingRule;
            this.declaredObjectMappingRule = declaredObjectMappingRule;
            this.projection = projection;
            this.namedProjection = namedProjection;
            this.parameterizedProjection = parameterizedProjection;
            this.namedParameterizedProjection = namedParameterizedProjection;
        }

        public bool IsAvailable =>
            objectMappingRule is not null &&
            declaredObjectMappingRule is not null &&
            projection is not null &&
            namedProjection is not null &&
            parameterizedProjection is not null &&
            namedParameterizedProjection is not null;

        public static MapperSymbols Create(Compilation compilation)
        {
            return new MapperSymbols(
                compilation.GetTypeByMetadataName(ObjectMappingRuleMetadataName),
                compilation.GetTypeByMetadataName(DeclaredObjectMappingRuleMetadataName),
                compilation.GetTypeByMetadataName(ProjectionMetadataName),
                compilation.GetTypeByMetadataName(NamedProjectionMetadataName),
                compilation.GetTypeByMetadataName(ParameterizedProjectionMetadataName),
                compilation.GetTypeByMetadataName(NamedParameterizedProjectionMetadataName));
        }

        public bool IsMappingRule(INamedTypeSymbol type)
        {
            return objectMappingRule is not null &&
                   type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate, objectMappingRule));
        }

        public bool IsDeclaredMappingRule(INamedTypeSymbol type)
        {
            return declaredObjectMappingRule is not null &&
                   type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate, declaredObjectMappingRule));
        }

        public IEnumerable<ProjectionMetadata> GetProjectionMetadata(INamedTypeSymbol type)
        {
            foreach (var candidateInterface in type.AllInterfaces)
            {
                if (projection is not null &&
                    SymbolEqualityComparer.Default.Equals(candidateInterface.OriginalDefinition, projection))
                {
                    yield return CreateProjectionMetadata(type, candidateInterface, parameterType: null, IsNamedProjection(type));
                }

                if (parameterizedProjection is not null &&
                    SymbolEqualityComparer.Default.Equals(candidateInterface.OriginalDefinition, parameterizedProjection))
                {
                    yield return CreateProjectionMetadata(type, candidateInterface, candidateInterface.TypeArguments[2], IsNamedParameterizedProjection(type));
                }
            }
        }

        private bool IsNamedProjection(INamedTypeSymbol type)
        {
            return namedProjection is not null &&
                   type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, namedProjection));
        }

        private bool IsNamedParameterizedProjection(INamedTypeSymbol type)
        {
            return namedParameterizedProjection is not null &&
                   type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, namedParameterizedProjection));
        }

        private static ProjectionMetadata CreateProjectionMetadata(
            INamedTypeSymbol implementationType,
            INamedTypeSymbol serviceType,
            ITypeSymbol? parameterType,
            bool isNamed)
        {
            return new ProjectionMetadata(
                serviceType.TypeArguments[0].ToDisplayString(TypeDisplayFormat),
                serviceType.TypeArguments[1].ToDisplayString(TypeDisplayFormat),
                parameterType?.ToDisplayString(TypeDisplayFormat),
                serviceType.ToDisplayString(TypeDisplayFormat),
                implementationType.ToDisplayString(TypeDisplayFormat),
                isNamed);
        }
    }
}
