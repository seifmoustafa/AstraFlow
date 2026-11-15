using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading;
using AstraFlow.Security;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Microsoft.CodeAnalysis.Text;

namespace AstraFlow.Generators;

/// <summary>Generates explicitly declared direct mapping methods.</summary>
[Generator]
public sealed class AstraFlowExecutableMapperGenerator : IIncrementalGenerator
{
    private static readonly DiagnosticDescriptor Unsupported = new(
        "AFM001", "Unsupported generated mapping", "Cannot generate mapping: {0}",
        "AstraFlow.Mapping", DiagnosticSeverity.Error, isEnabledByDefault: true,
        description: "Change the declaration or map this shape explicitly by hand.");

    /// <inheritdoc />
    public void Initialize(IncrementalGeneratorInitializationContext context)
    {
        var methods = context.SyntaxProvider.ForAttributeWithMetadataName(
            "AstraFlow.Mapper.AstraGenerateMappingAttribute",
            static (node, _) => node is MethodDeclarationSyntax,
            static (ctx, _) => (IMethodSymbol)ctx.TargetSymbol);
        var candidates = methods.Combine(context.CompilationProvider)
            .Select(static (value, cancellationToken) => CreateCandidate(value.Left, value.Right, cancellationToken))
            .WithComparer(MappingCandidateComparer.Instance);
        var duplicatePairs = candidates.Collect()
            .Select(static (declarations, cancellationToken) => FindDuplicatePairs(declarations, cancellationToken))
            .WithComparer(DuplicatePairSetComparer.Instance);
        context.RegisterSourceOutput(candidates.Combine(duplicatePairs), static (output, mapping) =>
        {
            output.CancellationToken.ThrowIfCancellationRequested();
            var candidate = mapping.Left;
            var method = candidate.Method;
            if (candidate.PairKey is not null && mapping.Right.Contains(candidate.PairKey))
            {
                output.ReportDiagnostic(Diagnostic.Create(Unsupported, method.Locations.FirstOrDefault(), "declare each source and destination pair only once"));
                return;
            }

            Generate(output, method, candidate.Compilation);
        });
    }

    private static MappingCandidate CreateCandidate(IMethodSymbol method, Compilation compilation, CancellationToken cancellationToken)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return new MappingCandidate(method, compilation, GetFingerprint(method, cancellationToken), GetPairKey(method));
    }

    private static HashSet<string> FindDuplicatePairs(ImmutableArray<MappingCandidate> declarations, CancellationToken cancellationToken)
    {
        var pairCounts = new Dictionary<string, int>(StringComparer.Ordinal);
        foreach (var candidate in declarations)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (candidate.PairKey is null)
                continue;

            pairCounts.TryGetValue(candidate.PairKey, out var count);
            pairCounts[candidate.PairKey] = count + 1;
        }

        var duplicates = new HashSet<string>(StringComparer.Ordinal);
        foreach (var pair in pairCounts)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (pair.Value > 1)
                duplicates.Add(pair.Key);
        }

        return duplicates;
    }

    private static string? GetPairKey(IMethodSymbol method)
    {
        if (method.Parameters.Length != 1)
            return null;

        return GetTypeIdentity(method.Parameters[0].Type) + "->" + GetTypeIdentity(method.ReturnType);
    }

    private static string GetTypeIdentity(ITypeSymbol type) =>
        (type.ContainingAssembly?.Identity.ToString() ?? string.Empty) + "|" +
        type.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat.WithMiscellaneousOptions(
            SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers | SymbolDisplayMiscellaneousOptions.IncludeNullableReferenceTypeModifier));

    private static string GetFingerprint(IMethodSymbol method, CancellationToken cancellationToken)
    {
        var text = new StringBuilder();
        text.Append(method.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat)).Append('|')
            .Append(method.DeclaredAccessibility).Append('|').Append(method.IsStatic).Append('|')
            .Append(method.IsPartialDefinition).Append('|').Append(method.PartialImplementationPart is not null)
            .Append('|').Append(method.ReturnNullableAnnotation).Append('|').Append(method.ReturnsByRef).Append('|').Append(method.ReturnsByRefReadonly);
        var owner = method.ContainingType;
        text.Append("|OWNER|").Append(owner.DeclaredAccessibility).Append('|').Append(owner.IsStatic).Append('|')
            .Append(owner.IsGenericType).Append('|').Append(owner.IsFileLocal).Append('|')
            .Append(owner.ContainingType?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat));
        foreach (var declaration in owner.DeclaringSyntaxReferences)
        {
            cancellationToken.ThrowIfCancellationRequested();
            if (declaration.GetSyntax(cancellationToken) is TypeDeclarationSyntax typeDeclaration)
                text.Append("|OWNER-SYNTAX|").Append(typeDeclaration.Modifiers.ToFullString());
        }
        foreach (var declaration in method.DeclaringSyntaxReferences)
        {
            cancellationToken.ThrowIfCancellationRequested();
            text.Append('|').Append(declaration.GetSyntax(cancellationToken).ToFullString());
        }

        AppendTypeFingerprint(text, method.Parameters.Length == 1 ? method.Parameters[0].Type : null, cancellationToken);
        AppendTypeFingerprint(text, method.ReturnType, cancellationToken);
        return text.ToString();
    }

    private static void AppendTypeFingerprint(StringBuilder text, ITypeSymbol? type, CancellationToken cancellationToken)
    {
        if (type is null)
        {
            text.Append("|<missing>");
            return;
        }

        text.Append("|TYPE|").Append(GetTypeIdentity(type)).Append('|').Append(type.TypeKind).Append('|').Append(type.IsAbstract);
        if (type is not INamedTypeSymbol named)
            return;

        for (var current = named; current is not null && current.SpecialType != SpecialType.System_Object; current = current.BaseType)
        {
            cancellationToken.ThrowIfCancellationRequested();
            text.Append("|HIERARCHY|").Append(GetTypeIdentity(current)).Append('|').Append(current.IsRecord).Append('|')
                .Append(current.IsGenericType).Append('|').Append(current.IsFileLocal)
                .Append('|').Append(current.BaseType?.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat));
            foreach (var constructor in current.InstanceConstructors)
            {
                cancellationToken.ThrowIfCancellationRequested();
                text.Append("|CTOR|").Append(constructor.DeclaredAccessibility).Append('|').Append(constructor.Parameters.Length);
                foreach (var parameter in constructor.Parameters)
                {
                    text.Append("|PARAM|").Append(parameter.Name).Append('|').Append(GetTypeIdentity(parameter.Type)).Append('|')
                        .Append(parameter.NullableAnnotation).Append('|').Append(parameter.RefKind).Append('|')
                        .Append(parameter.IsOptional).Append('|').Append(parameter.IsParams);
                }
            }

            foreach (var member in current.GetMembers().OrderBy(static member => member.MetadataName, StringComparer.Ordinal))
            {
                cancellationToken.ThrowIfCancellationRequested();
                text.Append("|MEMBER|").Append(member.Kind).Append('|').Append(member.MetadataName).Append('|')
                    .Append(member.IsStatic).Append('|').Append(member.IsImplicitlyDeclared).Append('|').Append(member.DeclaredAccessibility);
                AppendAttributeFingerprint(text, member.GetAttributes());
                if (member is not IPropertySymbol property)
                    continue;

                text.Append('|').Append(GetTypeIdentity(property.Type)).Append('|').Append(property.NullableAnnotation)
                    .Append('|').Append(property.IsIndexer).Append('|').Append(property.IsRequired)
                    .Append('|').Append(property.GetMethod?.DeclaredAccessibility).Append('|')
                    .Append(property.SetMethod?.DeclaredAccessibility).Append('|').Append(property.SetMethod?.IsInitOnly);
                if (property.GetMethod is not null)
                    AppendAttributeFingerprint(text, property.GetMethod.GetReturnTypeAttributes());
                if (property.SetMethod?.Parameters.LastOrDefault() is { } setterValue)
                    AppendAttributeFingerprint(text, setterValue.GetAttributes());
            }
        }
    }

    private static void AppendAttributeFingerprint(StringBuilder text, IEnumerable<AttributeData> attributes)
    {
        foreach (var attribute in attributes.OrderBy(static attribute => attribute.AttributeClass?.ToDisplayString(), StringComparer.Ordinal))
            text.Append("|ATTR|").Append(attribute.AttributeClass?.ToDisplayString());
    }

    private static void Generate(SourceProductionContext context, IMethodSymbol method, Compilation compilation)
    {
        context.CancellationToken.ThrowIfCancellationRequested();
        var location = method.Locations.FirstOrDefault();
        void Fail(string reason) => context.ReportDiagnostic(Diagnostic.Create(Unsupported, location, reason));
        void FailMember(ISymbol member, string reason)
        {
            var memberLocation = member.Locations.FirstOrDefault(l => l.IsInSource);
            if (memberLocation is null || location is null || !location.IsInSource)
            {
                Fail(reason);
                return;
            }
            context.ReportDiagnostic(Diagnostic.Create(Unsupported, memberLocation, new[] { location }, reason));
        }
        var owner = method.ContainingType;
        var syntax = method.DeclaringSyntaxReferences.FirstOrDefault()?.GetSyntax(context.CancellationToken) as MethodDeclarationSyntax;
        if (syntax is null || syntax.Modifiers.Any(m => !m.IsKind(SyntaxKind.PublicKeyword) && !m.IsKind(SyntaxKind.InternalKeyword) && !m.IsKind(SyntaxKind.StaticKeyword) && !m.IsKind(SyntaxKind.PartialKeyword)) ||
            method.ReturnsByRef || method.ReturnsByRefReadonly || !method.IsStatic || !method.IsPartialDefinition || method.PartialImplementationPart is not null ||
            method.Parameters.Length != 1 || method.Parameters[0].RefKind != RefKind.None ||
            method.Parameters[0].IsOptional || method.Parameters[0].IsParams ||
            method.Parameters[0].ScopedKind != ScopedKind.None || method.IsGenericMethod ||
            owner.ContainingType is not null || owner.IsGenericType || owner.IsFileLocal || !owner.IsStatic ||
            !owner.DeclaringSyntaxReferences.All(r => r.GetSyntax(context.CancellationToken) is TypeDeclarationSyntax t && t.Modifiers.Any(SyntaxKind.PartialKeyword)) ||
            method.DeclaredAccessibility is not (Accessibility.Public or Accessibility.Internal))
        { Fail("use a public or internal static partial method with one value parameter that is required and not params in a top-level non-generic, non-file-local static partial class"); return; }
        if (method.Parameters[0].Type is not INamedTypeSymbol source || method.ReturnType is not INamedTypeSymbol destination ||
            source.TypeKind != TypeKind.Class || destination.TypeKind != TypeKind.Class || source.IsGenericType || destination.IsGenericType ||
            source.IsAbstract || destination.IsAbstract || source.IsFileLocal || destination.IsFileLocal || source.ContainingType is not null || destination.ContainingType is not null ||
            method.Parameters[0].NullableAnnotation == NullableAnnotation.Annotated || method.ReturnNullableAnnotation == NullableAnnotation.Annotated)
        { Fail("source and destination must be non-nullable, non-generic, top-level classes"); return; }
        if (!TrySelectConstructor(source, destination, method.Parameters[0].Name, method.ContainingAssembly,
                out var constructorArguments, out var constructorParameterNames, out var constructorReason))
        { Fail(constructorReason); return; }
        var assignments = new List<string>();
        var policy = new AstraFlowSensitiveDataPolicy();
        foreach (var member in destination.GetMembers().Where(m => !m.IsStatic && !m.IsImplicitlyDeclared))
        {
            context.CancellationToken.ThrowIfCancellationRequested();
            if (member is IFieldSymbol)
            { FailMember(member, "destination members must be properties; fields are unsupported"); return; }
        }
        var destinationProperties = GetInstanceProperties(destination).ToArray();
        var hiddenDestinationProperty = destinationProperties
            .GroupBy(property => property.Name, StringComparer.Ordinal)
            .FirstOrDefault(group => group.Count() > 1)?.FirstOrDefault();
        if (hiddenDestinationProperty is not null)
        { FailMember(hiddenDestinationProperty, "destination inheritance contains multiple properties with the same name"); return; }

        foreach (var target in destinationProperties)
        {
            context.CancellationToken.ThrowIfCancellationRequested();
            if (constructorParameterNames.Contains(target.Name) &&
                (destination.IsRecord || target.SetMethod is null || target.SetMethod.IsInitOnly))
                continue;
            if (target.IsIndexer || target.IsRequired || target.SetMethod is null ||
                target.SetMethod.DeclaredAccessibility != Accessibility.Public)
            { FailMember(target, "destination members must be non-required public settable properties; init-only properties are supported through the generated object initializer"); return; }
            if (policy.IsSensitiveName(target.Name)) { FailMember(target, "sensitive members cannot be copied by generated mappings; map them explicitly after authorization"); return; }
            if (!TryFindSourceProperty(source, target.Name, out var input, out var sourceReason))
            { FailMember(target, sourceReason); return; }
            var identifier = Escape(target.Name);
            if (TryGetValueConverter(target, out var converterAttribute))
            {
                if (!TryBuildValueConverter(input, target, method.Parameters[0].Name, method.ContainingAssembly, converterAttribute, out var conversion, out var converterReason))
                { FailMember(target, converterReason); return; }
                assignments.Add("            " + identifier + " = " + conversion + ",");
                continue;
            }
            if (IsCollection(input.Type, compilation, out var sourceElement) &&
                IsCollection(target.Type, compilation, out var targetElement))
            {
                if (!TryBuildCollectionProjection(input, target, sourceElement!, targetElement!, Escape(method.Parameters[0].Name), compilation, out var projection, out var reason))
                { FailMember(target, reason); return; }
                assignments.Add("            " + identifier + " = " + Escape(method.Parameters[0].Name) + "." + Escape(input.Name) + " is null ? " +
                    (target.NullableAnnotation == NullableAnnotation.Annotated ? "null" : "new global::System.Collections.Generic.List<" + targetElement!.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat) + ">()") +
                    " : " + projection + ",");
                continue;
            }
            if (!CanMapScalarTypes(input.Type, target.Type) ||
                ((input.NullableAnnotation != NullableAnnotation.NotAnnotated || HasMaybeNull(input)) &&
                 (target.NullableAnnotation == NullableAnnotation.NotAnnotated || HasDisallowNull(target)) && target.Type.IsReferenceType))
            { FailMember(target, "member types must be identical supported scalars or supported collections with safe nullability; nullable value flow is allowed only when the destination also accepts null, and nested objects/conversions are unsupported"); return; }
            assignments.Add("            " + identifier + " = " + Escape(method.Parameters[0].Name) + "." + Escape(input.Name) + ",");
        }
        if (assignments.Count == 0 && constructorArguments.Count == 0) { Fail("destination must have at least one supported property or constructor parameter"); return; }
        assignments.Sort(StringComparer.Ordinal);
        var ns = owner.ContainingNamespace.IsGlobalNamespace ? null : owner.ContainingNamespace.ToDisplayString();
        var typeFormat = SymbolDisplayFormat.FullyQualifiedFormat.WithMiscellaneousOptions(SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers | SymbolDisplayMiscellaneousOptions.IncludeNullableReferenceTypeModifier);
        var text = new StringBuilder("// <auto-generated />\n#nullable enable\n");
        if (ns is not null) text.Append("namespace ").Append(ns).Append("\n{\n");
        text.Append(owner.DeclaredAccessibility == Accessibility.Public ? "public" : "internal").Append(" static partial class ").Append(Escape(owner.Name)).Append("\n{\n    ")
            .Append(method.DeclaredAccessibility == Accessibility.Public ? "public" : "internal").Append(" static partial ")
            .Append(destination.ToDisplayString(typeFormat)).Append(' ').Append(Escape(method.Name)).Append('(')
            .Append(method.IsExtensionMethod ? "this " : "")
            .Append(source.ToDisplayString(typeFormat)).Append(' ').Append(Escape(method.Parameters[0].Name)).Append(")\n    {\n")
            .Append("        if (").Append(Escape(method.Parameters[0].Name)).Append(" is null) throw new global::System.ArgumentNullException(nameof(").Append(Escape(method.Parameters[0].Name)).Append("));\n")
            .Append("        return new ").Append(destination.ToDisplayString(typeFormat)).Append('(').Append(string.Join(", ", constructorArguments)).Append(')');
        if (assignments.Count > 0)
            text.Append("\n        {\n");
        foreach (var assignment in assignments) text.Append(assignment).Append('\n');
        if (assignments.Count > 0)
            text.Append("        }");
        text.Append(";\n    }\n}\n");
        if (ns is not null) text.Append("}\n");
        using var sha = SHA256.Create();
        var key = owner.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat) + "::" + method.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
        var hash = BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(key))).Replace("-", "");
        context.AddSource("AstraFlow.Mapping." + hash + ".g.cs", SourceText.From(text.ToString(), Encoding.UTF8));
    }

    private static bool TrySelectConstructor(
        INamedTypeSymbol source,
        INamedTypeSymbol destination,
        string sourceVariable,
        IAssemblySymbol mappingAssembly,
        out List<string> arguments,
        out HashSet<string> constructorParameterNames,
        out string reason)
    {
        arguments = new List<string>();
        constructorParameterNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        reason = "destination needs an accessible parameterless constructor or one unambiguous supported primary constructor";
        var accessible = destination.InstanceConstructors
            .Where(constructor => IsAccessibleConstructor(constructor, mappingAssembly)).ToArray();
        var primary = accessible.FirstOrDefault(constructor => IsPrimaryConstructor(destination, constructor));
        if (primary is not null)
        {
            if (!TryBuildConstructorArguments(source, primary, sourceVariable, out arguments, out reason))
                reason = "primary constructor parameters must each match a public readable source scalar property with compatible type and nullability: " + reason;
            if (arguments.Count == primary.Parameters.Length)
                constructorParameterNames.UnionWith(primary.Parameters.Select(parameter => parameter.Name));
            return arguments.Count == primary.Parameters.Length;
        }

        if (destination.IsRecord)
        {
            var candidates = new List<(IMethodSymbol Constructor, List<string> Arguments)>();
            foreach (var constructor in accessible.Where(candidate => candidate.Parameters.Length > 0))
            {
                if (TryBuildConstructorArguments(source, constructor, sourceVariable, out var candidateArguments, out _))
                    candidates.Add((constructor, candidateArguments));
            }

            if (candidates.Count > 0)
            {
                var largest = candidates.Max(candidate => candidate.Constructor.Parameters.Length);
                var best = candidates.Where(candidate => candidate.Constructor.Parameters.Length == largest).ToArray();
                if (best.Length != 1)
                {
                    reason = "record has multiple equally specific accessible constructors whose parameters match source properties; make the mapping unambiguous";
                    return false;
                }
                arguments = best[0].Arguments;
                constructorParameterNames.UnionWith(best[0].Constructor.Parameters.Select(parameter => parameter.Name));
                return true;
            }
        }

        if (accessible.Any(constructor => constructor.Parameters.Length == 0))
            return true;

        var matchingConstructors = new List<(IMethodSymbol Constructor, List<string> Arguments)>();
        foreach (var constructor in accessible.Where(candidate => candidate.Parameters.Length > 0))
        {
            if (TryBuildConstructorArguments(source, constructor, sourceVariable, out var candidateArguments, out _))
                matchingConstructors.Add((constructor, candidateArguments));
        }

        if (matchingConstructors.Count == 1)
        {
            arguments = matchingConstructors[0].Arguments;
            constructorParameterNames.UnionWith(matchingConstructors[0].Constructor.Parameters.Select(parameter => parameter.Name));
            return true;
        }
        if (matchingConstructors.Count > 1)
            reason = "destination has multiple accessible constructors whose parameters match source properties; declare a primary constructor or add an accessible parameterless constructor";
        return false;
    }

    private static bool TryBuildConstructorArguments(
        INamedTypeSymbol source,
        IMethodSymbol constructor,
        string sourceVariable,
        out List<string> arguments,
        out string reason)
    {
        arguments = new List<string>(constructor.Parameters.Length);
        reason = "constructor parameters need exact-name source properties with matching supported scalar types";
        var policy = new AstraFlowSensitiveDataPolicy();
        foreach (var parameter in constructor.Parameters)
        {
            if (parameter.IsOptional || parameter.IsParams || parameter.RefKind != RefKind.None || policy.IsSensitiveName(parameter.Name))
            {
                reason = "optional, params, by-reference, and sensitive constructor parameters are unsupported";
                return false;
            }
            if (!TryFindSourceProperty(source, parameter.Name, out var property, out reason, ignoreCase: true))
                return false;
            if (!CanMapScalarTypes(property.Type, parameter.Type) ||
                (property.Type.IsReferenceType &&
                 (property.NullableAnnotation != NullableAnnotation.NotAnnotated || HasMaybeNull(property)) &&
                 parameter.NullableAnnotation != NullableAnnotation.Annotated))
            {
                reason = "constructor parameter '" + parameter.Name + "' must have a matching supported scalar type and safe nullability";
                return false;
            }
            arguments.Add(Escape(sourceVariable) + "." + Escape(property.Name));
        }
        return true;
    }

    private static bool IsPrimaryConstructor(INamedTypeSymbol destination, IMethodSymbol constructor)
    {
        foreach (var declaration in destination.DeclaringSyntaxReferences)
        {
            var parameterList = declaration.GetSyntax() switch
            {
                RecordDeclarationSyntax record => record.ParameterList,
                ClassDeclarationSyntax @class => @class.ParameterList,
                _ => null
            };
            if (parameterList is null || parameterList.Parameters.Count != constructor.Parameters.Length)
                continue;
            if (parameterList.Parameters.Select(parameter => parameter.Identifier.ValueText)
                .SequenceEqual(constructor.Parameters.Select(parameter => parameter.Name), StringComparer.Ordinal))
                return true;
        }
        return false;
    }

    private static bool TryFindSourceProperty(
        INamedTypeSymbol source,
        string targetName,
        out IPropertySymbol property,
        out string reason,
        bool ignoreCase = false)
    {
        var candidates = new List<IPropertySymbol>();
        foreach (var candidate in GetSourceProperties(source))
        {
            var namesMatch = ignoreCase
                ? StringComparer.OrdinalIgnoreCase.Equals(candidate.Name, targetName)
                : StringComparer.Ordinal.Equals(candidate.Name, targetName);
            if (!namesMatch || candidate.IsIndexer ||
                candidate.GetMethod?.DeclaredAccessibility != Accessibility.Public)
                continue;

            if (candidates.Any(existing => Overrides(existing, candidate)))
                continue;
            candidates.Add(candidate);
        }

        if (candidates.Count == 1)
        {
            property = candidates[0];
            reason = string.Empty;
            return true;
        }

        property = null!;
        reason = candidates.Count == 0
            ? "each destination member needs a public readable source property with the same name, including inherited source properties"
            : "source inheritance contains multiple distinct readable properties matching the destination name";
        return false;
    }

    private static bool Overrides(IPropertySymbol derived, IPropertySymbol possibleBase)
    {
        for (var current = derived.OverriddenProperty; current is not null; current = current.OverriddenProperty)
        {
            if (SymbolEqualityComparer.Default.Equals(current, possibleBase))
                return true;
        }
        return false;
    }

    private static IEnumerable<IPropertySymbol> GetSourceProperties(INamedTypeSymbol type)
    {
        foreach (var property in GetInstanceProperties(type))
            yield return property;

        for (var current = type; current is not null && current.SpecialType != SpecialType.System_Object; current = current.BaseType)
        {
            if (!current.IsRecord)
                continue;
            foreach (var property in current.GetMembers().OfType<IPropertySymbol>()
                .Where(property => !property.IsStatic && property.IsImplicitlyDeclared))
                yield return property;
        }
    }

    private static bool CanMapScalarTypes(ITypeSymbol source, ITypeSymbol destination)
    {
        if (!IsSupportedScalarOrNullable(source, out var sourceUnderlying, out var sourceNullable) ||
            !IsSupportedScalarOrNullable(destination, out var destinationUnderlying, out var destinationNullable) ||
            !SymbolEqualityComparer.Default.Equals(sourceUnderlying, destinationUnderlying))
            return false;
        return !sourceNullable || destinationNullable;
    }

    private static bool IsSupportedScalarOrNullable(ITypeSymbol type, out ITypeSymbol underlyingType, out bool isNullable)
    {
        if (type is INamedTypeSymbol named && named.OriginalDefinition.SpecialType == SpecialType.System_Nullable_T)
        {
            underlyingType = named.TypeArguments[0];
            isNullable = true;
        }
        else
        {
            underlyingType = type;
            isNullable = false;
        }
        return IsScalar(underlyingType);
    }

    private static bool IsScalar(ITypeSymbol type) => type.TypeKind == TypeKind.Enum || type.SpecialType is
        SpecialType.System_Boolean or SpecialType.System_Byte or SpecialType.System_SByte or SpecialType.System_Int16 or SpecialType.System_UInt16 or
        SpecialType.System_Int32 or SpecialType.System_UInt32 or SpecialType.System_Int64 or SpecialType.System_UInt64 or SpecialType.System_Char or
        SpecialType.System_Single or SpecialType.System_Double or SpecialType.System_Decimal or SpecialType.System_String ||
        type.ToDisplayString() is "System.DateTime" or "System.DateTimeOffset" or "System.Guid";

    private static bool IsCollection(ITypeSymbol type, Compilation compilation, out ITypeSymbol? elementType)
    {
        if (type.SpecialType == SpecialType.System_String)
        {
            elementType = null;
            return false;
        }

        if (type is IArrayTypeSymbol array)
        {
            elementType = array.ElementType;
            return true;
        }

        if (type is INamedTypeSymbol named)
        {
            var enumerable = compilation.GetTypeByMetadataName("System.Collections.Generic.IEnumerable`1");
            var contract = enumerable is null ? null : named.AllInterfaces.Concat([named])
                .FirstOrDefault(candidate => SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, enumerable));
            if (contract is not null)
            {
                elementType = contract.TypeArguments[0];
                return true;
            }
        }

        elementType = null;
        return false;
    }

    private static bool TryBuildCollectionProjection(
        IPropertySymbol source,
        IPropertySymbol destination,
        ITypeSymbol sourceElement,
        ITypeSymbol destinationElement,
        string sourceVariable,
        Compilation compilation,
        out string projection,
        out string reason)
    {
        projection = string.Empty;
        reason = "collections must expose compatible enumerable element types and map to a list-compatible destination";
        if (sourceElement.NullableAnnotation == NullableAnnotation.Annotated && destinationElement.NullableAnnotation != NullableAnnotation.Annotated)
        {
            reason = "nullable collection elements cannot flow to non-nullable destination elements";
            return false;
        }
        var listDefinition = compilation.GetTypeByMetadataName("System.Collections.Generic.List`1");
        if (listDefinition is null)
            return false;
        var listType = listDefinition.Construct(destinationElement);
        if (!compilation.ClassifyConversion(listType, destination.Type).IsImplicit)
            return false;

        string selector;
        var derivedMappings = destination.GetAttributes().Where(attribute =>
            attribute.AttributeClass?.ToDisplayString() == "AstraFlow.Mapper.AstraDerivedMappingAttribute").ToArray();
        if (derivedMappings.Length > 0)
        {
            if (!TryBuildDerivedCollectionProjection(derivedMappings, sourceElement, destinationElement, source.ContainingAssembly,
                    compilation, out selector, out reason))
                return false;
        }
        else if (CanMapScalarTypes(sourceElement, destinationElement))
        {
            selector = SymbolEqualityComparer.Default.Equals(sourceElement, destinationElement)
                ? "item => item"
                : "item => (" + destinationElement.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat) + ")item";
        }
        else if (sourceElement is INamedTypeSymbol sourceModel && destinationElement is INamedTypeSymbol destinationModel &&
                 sourceModel.TypeKind == TypeKind.Class && destinationModel.TypeKind == TypeKind.Class &&
                 !sourceModel.IsAbstract && !destinationModel.IsAbstract && !destinationModel.IsGenericType &&
                 destinationModel.InstanceConstructors.Any(constructor => constructor.Parameters.Length == 0 &&
                     IsAccessibleConstructor(constructor, source.ContainingAssembly)))
        {
            var members = new List<string>();
            foreach (var targetMember in destinationModel.GetMembers().OfType<IPropertySymbol>().Where(property => !property.IsStatic && !property.IsImplicitlyDeclared))
            {
                if (targetMember.IsIndexer || targetMember.IsRequired || targetMember.SetMethod?.DeclaredAccessibility != Accessibility.Public ||
                    new AstraFlowSensitiveDataPolicy().IsSensitiveName(targetMember.Name))
                {
                    reason = "collection element destinations need public settable non-sensitive properties";
                    return false;
                }
                if (!TryFindSourceProperty(sourceModel, targetMember.Name, out var sourceMember, out _))
                {
                    reason = "collection element properties need exactly one exact-name readable source property";
                    return false;
                }
                if (TryGetValueConverter(targetMember, out var elementConverter))
                {
                    if (!TryBuildValueConverter(sourceMember, targetMember, "item", source.ContainingAssembly, elementConverter, out var conversion, out reason))
                        return false;
                    members.Add(Escape(targetMember.Name) + " = " + conversion);
                    continue;
                }
                if (!CanMapScalarTypes(sourceMember.Type, targetMember.Type) ||
                    ((sourceMember.NullableAnnotation != NullableAnnotation.NotAnnotated || HasMaybeNull(sourceMember)) &&
                     (targetMember.NullableAnnotation == NullableAnnotation.NotAnnotated || HasDisallowNull(targetMember)) && targetMember.Type.IsReferenceType))
                {
                    reason = "collection element properties need exact-name scalar source properties with identical types and safe nullability";
                    return false;
                }
                members.Add(Escape(targetMember.Name) + " = item." + Escape(sourceMember.Name));
            }
            if (members.Count == 0)
            {
                reason = "collection element destinations need at least one supported scalar property";
                return false;
            }
            members.Sort(StringComparer.Ordinal);
            selector = "item => new " + destinationElement.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat) + " { " + string.Join(", ", members) + " }";
        }
        else
        {
            reason = "collection elements must have the same scalar type or compatible class properties";
            return false;
        }

        projection = "global::System.Linq.Enumerable.ToList(global::System.Linq.Enumerable.Select(" + sourceVariable + "." + Escape(source.Name) + ", " + selector + "))";
        return true;
    }

    private static bool TryBuildDerivedCollectionProjection(
        AttributeData[] mappings,
        ITypeSymbol sourceElement,
        ITypeSymbol destinationElement,
        IAssemblySymbol mappingAssembly,
        Compilation compilation,
        out string selector,
        out string reason)
    {
        selector = string.Empty;
        reason = "derived collection mappings must name concrete source and destination subtypes with supported public scalar properties";
        var sourceTypes = new HashSet<ITypeSymbol>(SymbolEqualityComparer.Default);
        var cases = new List<string>();
        var typeFormat = SymbolDisplayFormat.FullyQualifiedFormat.WithMiscellaneousOptions(
            SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers | SymbolDisplayMiscellaneousOptions.IncludeNullableReferenceTypeModifier);
        var index = 0;
        foreach (var mapping in mappings)
        {
            if (mapping.ConstructorArguments.Length != 2 ||
                mapping.ConstructorArguments[0].Value is not INamedTypeSymbol sourceType ||
                mapping.ConstructorArguments[1].Value is not INamedTypeSymbol destinationType ||
                sourceType.TypeKind != TypeKind.Class || destinationType.TypeKind != TypeKind.Class ||
                sourceType.IsAbstract || destinationType.IsAbstract || sourceType.IsGenericType || destinationType.IsGenericType ||
                !compilation.ClassifyConversion(sourceType, sourceElement).IsImplicit ||
                !compilation.ClassifyConversion(destinationType, destinationElement).IsImplicit ||
                !sourceTypes.Add(sourceType))
                return false;
            if (!destinationType.InstanceConstructors.Any(constructor => constructor.Parameters.Length == 0 &&
                IsAccessibleConstructor(constructor, mappingAssembly)))
            {
                reason = "each derived collection destination needs an accessible parameterless constructor";
                return false;
            }

            var assignments = new List<string>();
            foreach (var targetMember in GetInstanceProperties(destinationType))
            {
                if (targetMember.IsIndexer || targetMember.IsRequired || targetMember.SetMethod?.DeclaredAccessibility != Accessibility.Public ||
                    new AstraFlowSensitiveDataPolicy().IsSensitiveName(targetMember.Name))
                {
                    reason = "derived collection destinations need public settable non-sensitive properties";
                    return false;
                }
                var sourceMembers = GetInstanceProperties(sourceType).Where(property =>
                    StringComparer.Ordinal.Equals(property.Name, targetMember.Name) && !property.IsIndexer &&
                    property.GetMethod?.DeclaredAccessibility == Accessibility.Public).ToArray();
                if (sourceMembers.Length != 1)
                {
                    reason = "each derived destination property needs exactly one readable source property with the same name";
                    return false;
                }
                var sourceMember = sourceMembers[0];
                if (TryGetValueConverter(targetMember, out var converter))
                {
                    if (!TryBuildValueConverter(sourceMember, targetMember, "item" + index, mappingAssembly, converter, out var conversion, out reason))
                        return false;
                    assignments.Add(Escape(targetMember.Name) + " = " + conversion);
                }
                else
                {
                    if (!CanMapScalarTypes(sourceMember.Type, targetMember.Type) ||
                        ((sourceMember.NullableAnnotation != NullableAnnotation.NotAnnotated || HasMaybeNull(sourceMember)) &&
                         (targetMember.NullableAnnotation == NullableAnnotation.NotAnnotated || HasDisallowNull(targetMember)) && targetMember.Type.IsReferenceType))
                    {
                        reason = "derived collection properties need exact-name scalar values with identical types and safe nullability or a converter";
                        return false;
                    }
                    assignments.Add(Escape(targetMember.Name) + " = item" + index + "." + Escape(sourceMember.Name));
                }
            }
            if (assignments.Count == 0)
            {
                reason = "derived collection destinations need at least one supported property";
                return false;
            }
            assignments.Sort(StringComparer.Ordinal);
            cases.Add(sourceType.ToDisplayString(typeFormat) + " item" + index + " => (" + destinationElement.ToDisplayString(typeFormat) + ")new " +
                destinationType.ToDisplayString(typeFormat) + " { " + string.Join(", ", assignments) + " }");
            index++;
        }
        var nullableSource = sourceElement.NullableAnnotation == NullableAnnotation.Annotated;
        var nullableTarget = destinationElement.NullableAnnotation == NullableAnnotation.Annotated;
        selector = nullableSource && nullableTarget ? "item => item is null ? null : item switch { " : "item => item switch { ";
        selector += string.Join(", ", cases) + ", _ => throw new global::System.InvalidOperationException(\"No generated mapping is declared for this collection element subtype.\") }";
        return true;
    }

    private static IEnumerable<IPropertySymbol> GetInstanceProperties(INamedTypeSymbol type)
    {
        var yielded = new List<IPropertySymbol>();
        for (var current = type; current is not null && current.SpecialType != SpecialType.System_Object; current = current.BaseType)
        {
            foreach (var property in current.GetMembers().OfType<IPropertySymbol>().Where(property => !property.IsStatic && !property.IsImplicitlyDeclared))
            {
                if (yielded.Any(existing => Overrides(existing, property)))
                    continue;
                yielded.Add(property);
                yield return property;
            }
        }
    }

    private static bool TryGetValueConverter(IPropertySymbol property, out AttributeData attribute)
    {
        attribute = property.GetAttributes().FirstOrDefault(candidate =>
            candidate.AttributeClass?.ToDisplayString() == "AstraFlow.Mapper.AstraValueConverterAttribute")!;
        return attribute is not null;
    }

    private static bool TryBuildValueConverter(
        IPropertySymbol source,
        IPropertySymbol destination,
        string sourceVariable,
        IAssemblySymbol mappingAssembly,
        AttributeData attribute,
        out string expression,
        out string reason)
    {
        expression = string.Empty;
        reason = "value converter must name one accessible static method with an exact source parameter and destination return type";
        if (attribute.ConstructorArguments.Length != 2 ||
            attribute.ConstructorArguments[0].Value is not INamedTypeSymbol converterType ||
            attribute.ConstructorArguments[1].Value is not string methodName)
            return false;

        var methods = converterType.GetMembers(methodName).OfType<IMethodSymbol>()
            .Where(candidate => candidate.IsStatic && !candidate.IsGenericMethod && candidate.Parameters.Length == 1 &&
                candidate.Parameters[0].RefKind == RefKind.None &&
                candidate.DeclaredAccessibility is Accessibility.Public or Accessibility.Internal or Accessibility.ProtectedOrInternal &&
                (candidate.DeclaredAccessibility == Accessibility.Public || SymbolEqualityComparer.Default.Equals(candidate.ContainingAssembly, mappingAssembly)) &&
                SymbolEqualityComparer.Default.Equals(candidate.Parameters[0].Type, source.Type) &&
                candidate.Parameters[0].NullableAnnotation == source.NullableAnnotation &&
                SymbolEqualityComparer.Default.Equals(candidate.ReturnType, destination.Type) &&
                candidate.ReturnNullableAnnotation == destination.NullableAnnotation)
            .ToArray();
        if (methods.Length != 1)
            return false;

        var typeFormat = SymbolDisplayFormat.FullyQualifiedFormat.WithMiscellaneousOptions(
            SymbolDisplayMiscellaneousOptions.EscapeKeywordIdentifiers | SymbolDisplayMiscellaneousOptions.IncludeNullableReferenceTypeModifier);
        expression = converterType.ToDisplayString(typeFormat) + "." + Escape(methodName) + "(" + Escape(sourceVariable) + "." + Escape(source.Name) + ")";
        return true;
    }
    private static bool IsAccessibleConstructor(IMethodSymbol constructor, IAssemblySymbol mappingAssembly) =>
        constructor.DeclaredAccessibility == Accessibility.Public ||
        (SymbolEqualityComparer.Default.Equals(constructor.ContainingAssembly, mappingAssembly) &&
         constructor.DeclaredAccessibility is Accessibility.Internal or Accessibility.ProtectedOrInternal);
    private static bool HasMaybeNull(IPropertySymbol property) =>
        property.GetAttributes().Any(IsMaybeNull) ||
        (property.GetMethod?.GetReturnTypeAttributes().Any(IsMaybeNull) ?? false);
    private static bool IsMaybeNull(AttributeData attribute) =>
        attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.MaybeNullAttribute";
    private static bool HasDisallowNull(IPropertySymbol property) =>
        property.GetAttributes().Any(attribute => attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.DisallowNullAttribute") ||
        (property.SetMethod?.Parameters.LastOrDefault()?.GetAttributes().Any(attribute => attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.DisallowNullAttribute") ?? false);
    private static string Escape(string value) => SyntaxFacts.GetKeywordKind(value) != SyntaxKind.None || SyntaxFacts.GetContextualKeywordKind(value) != SyntaxKind.None ? "@" + value : value;

    private sealed class MappingCandidate
    {
        public MappingCandidate(IMethodSymbol method, Compilation compilation, string fingerprint, string? pairKey)
        {
            Method = method;
            Compilation = compilation;
            Fingerprint = fingerprint;
            PairKey = pairKey;
        }

        public IMethodSymbol Method { get; }
        public Compilation Compilation { get; }
        public string Fingerprint { get; }
        public string? PairKey { get; }
    }

    private sealed class MappingCandidateComparer : IEqualityComparer<MappingCandidate>
    {
        public static MappingCandidateComparer Instance { get; } = new();

        public bool Equals(MappingCandidate? left, MappingCandidate? right) =>
            ReferenceEquals(left, right) || (left is not null && right is not null && StringComparer.Ordinal.Equals(left.Fingerprint, right.Fingerprint));

        public int GetHashCode(MappingCandidate candidate) => StringComparer.Ordinal.GetHashCode(candidate.Fingerprint);
    }

    private sealed class DuplicatePairSetComparer : IEqualityComparer<HashSet<string>>
    {
        public static DuplicatePairSetComparer Instance { get; } = new();

        public bool Equals(HashSet<string>? left, HashSet<string>? right) =>
            ReferenceEquals(left, right) || (left is not null && right is not null && left.SetEquals(right));

        public int GetHashCode(HashSet<string> pairs)
        {
            var hash = pairs.Count;
            foreach (var pair in pairs)
                hash ^= StringComparer.Ordinal.GetHashCode(pair);
            return hash;
        }
    }
}
