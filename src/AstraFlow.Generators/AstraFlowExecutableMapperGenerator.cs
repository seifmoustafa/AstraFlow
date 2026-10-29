using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
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
        context.RegisterSourceOutput(methods.Collect(), static (output, declarations) =>
        {
            foreach (var method in declarations)
            {
                output.CancellationToken.ThrowIfCancellationRequested();
                if (method.Parameters.Length == 1 && declarations.Count(other =>
                    other.Parameters.Length == 1 &&
                    SymbolEqualityComparer.Default.Equals(other.Parameters[0].Type, method.Parameters[0].Type) &&
                    SymbolEqualityComparer.Default.Equals(other.ReturnType, method.ReturnType)) > 1)
                {
                    output.ReportDiagnostic(Diagnostic.Create(Unsupported, method.Locations.FirstOrDefault(), "declare each source and destination pair only once"));
                    continue;
                }
                Generate(output, method);
            }
        });
    }

    private static void Generate(SourceProductionContext context, IMethodSymbol method)
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
            method.Parameters.Length != 1 || method.Parameters[0].RefKind != RefKind.None || method.IsGenericMethod ||
            owner.ContainingType is not null || owner.IsGenericType || owner.IsFileLocal || !owner.IsStatic ||
            !owner.DeclaringSyntaxReferences.All(r => r.GetSyntax(context.CancellationToken) is TypeDeclarationSyntax t && t.Modifiers.Any(SyntaxKind.PartialKeyword)) ||
            method.DeclaredAccessibility is not (Accessibility.Public or Accessibility.Internal))
        { Fail("use a public or internal static partial method with one value parameter in a top-level non-generic, non-file-local static partial class"); return; }
        if (method.Parameters[0].Type is not INamedTypeSymbol source || method.ReturnType is not INamedTypeSymbol destination ||
            source.TypeKind != TypeKind.Class || destination.TypeKind != TypeKind.Class || source.IsGenericType || destination.IsGenericType ||
            source.IsAbstract || destination.IsAbstract || source.IsFileLocal || destination.IsFileLocal || source.ContainingType is not null || destination.ContainingType is not null ||
            method.Parameters[0].NullableAnnotation == NullableAnnotation.Annotated || method.ReturnNullableAnnotation == NullableAnnotation.Annotated ||
            destination.IsRecord || source.BaseType?.SpecialType != SpecialType.System_Object || destination.BaseType?.SpecialType != SpecialType.System_Object)
        { Fail("source and destination must be non-nullable, non-generic, top-level classes without inheritance; records are unsupported"); return; }
        if (!destination.InstanceConstructors.Any(c => c.Parameters.Length == 0 && c.DeclaredAccessibility == Accessibility.Public))
        { Fail("destination needs a public parameterless constructor"); return; }
        var assignments = new List<string>();
        var policy = new AstraFlowSensitiveDataPolicy();
        foreach (var member in destination.GetMembers().Where(m => !m.IsStatic && !m.IsImplicitlyDeclared))
        {
            context.CancellationToken.ThrowIfCancellationRequested();
            if (member is IMethodSymbol or INamedTypeSymbol or IEventSymbol) continue;
            if (member is not IPropertySymbol target || target.IsIndexer || target.IsRequired || target.SetMethod is null ||
                target.SetMethod.IsInitOnly || target.SetMethod.DeclaredAccessibility != Accessibility.Public)
            { FailMember(member, "destination members must be non-required public settable properties; fields and init-only properties are unsupported"); return; }
            if (policy.IsSensitiveName(target.Name)) { FailMember(target, "sensitive members cannot be copied by generated mappings; map them explicitly after authorization"); return; }
            var matches = source.GetMembers(target.Name).OfType<IPropertySymbol>().Where(p => !p.IsStatic && !p.IsIndexer && p.GetMethod?.DeclaredAccessibility == Accessibility.Public).ToArray();
            if (matches.Length != 1) { FailMember(target, "each destination property needs exactly one public readable source property with the same name"); return; }
            var input = matches[0];
            if (!SymbolEqualityComparer.Default.Equals(input.Type, target.Type) || !IsScalar(target.Type) ||
                ((input.NullableAnnotation != NullableAnnotation.NotAnnotated || HasMaybeNull(input)) &&
                 (target.NullableAnnotation == NullableAnnotation.NotAnnotated || HasDisallowNull(target)) && target.Type.IsReferenceType))
            { FailMember(target, "member types must be identical supported scalars with compatible nullability; nested objects, collections and conversions are unsupported"); return; }
            var identifier = Escape(target.Name);
            assignments.Add("            " + identifier + " = " + Escape(method.Parameters[0].Name) + "." + Escape(input.Name) + ",");
        }
        if (assignments.Count == 0) { Fail("destination must have at least one supported property"); return; }
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
            .Append("        return new ").Append(destination.ToDisplayString(typeFormat)).Append("\n        {\n");
        foreach (var assignment in assignments) text.Append(assignment).Append('\n');
        text.Append("        };\n    }\n}\n");
        if (ns is not null) text.Append("}\n");
        using var sha = SHA256.Create();
        var key = owner.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat) + "::" + method.ToDisplayString(SymbolDisplayFormat.CSharpErrorMessageFormat);
        var hash = BitConverter.ToString(sha.ComputeHash(Encoding.UTF8.GetBytes(key))).Replace("-", "");
        context.AddSource("AstraFlow.Mapping." + hash + ".g.cs", SourceText.From(text.ToString(), Encoding.UTF8));
    }

    private static bool IsScalar(ITypeSymbol type) => type.TypeKind == TypeKind.Enum || type.SpecialType is
        SpecialType.System_Boolean or SpecialType.System_Byte or SpecialType.System_SByte or SpecialType.System_Int16 or SpecialType.System_UInt16 or
        SpecialType.System_Int32 or SpecialType.System_UInt32 or SpecialType.System_Int64 or SpecialType.System_UInt64 or SpecialType.System_Char or
        SpecialType.System_Single or SpecialType.System_Double or SpecialType.System_Decimal or SpecialType.System_String;
    private static bool HasMaybeNull(IPropertySymbol property) =>
        property.GetAttributes().Any(IsMaybeNull) ||
        (property.GetMethod?.GetReturnTypeAttributes().Any(IsMaybeNull) ?? false);
    private static bool IsMaybeNull(AttributeData attribute) =>
        attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.MaybeNullAttribute";
    private static bool HasDisallowNull(IPropertySymbol property) =>
        property.GetAttributes().Any(attribute => attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.DisallowNullAttribute") ||
        (property.SetMethod?.Parameters.LastOrDefault()?.GetAttributes().Any(attribute => attribute.AttributeClass?.ToDisplayString() == "System.Diagnostics.CodeAnalysis.DisallowNullAttribute") ?? false);
    private static string Escape(string value) => SyntaxFacts.GetKeywordKind(value) != SyntaxKind.None || SyntaxFacts.GetContextualKeywordKind(value) != SyntaxKind.None ? "@" + value : value;
}
