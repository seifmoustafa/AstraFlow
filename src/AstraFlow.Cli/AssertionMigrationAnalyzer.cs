using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AstraFlow.Cli;

internal static class AssertionMigrationAnalyzer
{
    private static readonly HashSet<string> IgnoredDirectories = new(StringComparer.OrdinalIgnoreCase)
    {
        ".artifacts", ".git", "bin", "node_modules", "obj"
    };

    public static AssertionMigrationReport Analyze(string target)
    {
        var (root, files) = GetSourceFiles(target);
        var trees = new List<SyntaxTree>(files.Count);

        foreach (var file in files.OrderBy(path => path, StringComparer.Ordinal))
        {
            var source = File.ReadAllText(file);
            trees.Add(CSharpSyntaxTree.ParseText(
                source,
                new CSharpParseOptions(LanguageVersion.Latest),
                file));
        }

        var compilation = CSharpCompilation.Create(
            assemblyName: "AstraFlow.AssertionsMigration.Analysis",
            syntaxTrees: trees,
            references: GetFrameworkReferences(),
            options: new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary));

        var findings = new List<AssertionMigrationFinding>();
        var localEntryPoints = new Dictionary<ISymbol, InvocationExpressionSyntax>(SymbolEqualityComparer.Default);

        foreach (var tree in trees)
        {
            var semanticModel = compilation.GetSemanticModel(tree, ignoreAccessibility: true);
            var syntaxRoot = tree.GetRoot();
            var path = Path.GetRelativePath(root, tree.FilePath).Replace('\\', '/');

            foreach (var declarator in syntaxRoot.DescendantNodes().OfType<VariableDeclaratorSyntax>())
            {
                if (declarator.Initializer is null)
                {
                    continue;
                }

                var shouldInvocation = FindShouldInvocation(declarator.Initializer.Value);
                var declaredSymbol = semanticModel.GetDeclaredSymbol(declarator);
                if (shouldInvocation is not null && declaredSymbol is not null)
                {
                    localEntryPoints[declaredSymbol] = shouldInvocation;
                }
            }

            foreach (var invocation in syntaxRoot.DescendantNodes().OfType<InvocationExpressionSyntax>())
            {
                if (GetMethodName(invocation.Expression).Equals("Should", StringComparison.Ordinal))
                {
                    continue;
                }

                var shouldInvocation = FindShouldInvocation(invocation.Expression)
                    ?? FindShouldInvocationThroughLocal(invocation.Expression, semanticModel, localEntryPoints);
                if (shouldInvocation is null)
                {
                    continue;
                }

                var shouldInfo = semanticModel.GetSymbolInfo(shouldInvocation);
                var shouldMethod = shouldInfo.Symbol as IMethodSymbol;
                if (shouldMethod is not null && IsAstraFlowAssertionsMethod(shouldMethod))
                {
                    continue;
                }

                if (shouldMethod is not null && !LooksLikeAssertionType(shouldMethod.ReturnType))
                {
                    continue;
                }

                var terminalInfo = semanticModel.GetSymbolInfo(invocation);
                var terminalMethod = terminalInfo.Symbol as IMethodSymbol;
                var classification = terminalMethod is null
                    ? "unknown"
                    : "manual";
                var code = terminalMethod is null ? "AFCLI2404" : "AFCLI2405";
                var suggestion = terminalMethod is null
                    ? "The assertion call could not be bound in the available source context. Review the call and its references manually."
                    : "Review this assertion's behavior and translate it manually; no equivalent is verified in this analysis catalog.";

                AddFinding(
                    findings,
                    code,
                    path,
                    GetTerminalLocation(invocation),
                    classification,
                    suggestion,
                    GetMethodName(invocation.Expression));
            }

            foreach (var diagnostic in tree.GetDiagnostics().Where(item => item.Severity == DiagnosticSeverity.Error))
            {
                AddFinding(
                    findings,
                    "AFCLI2401",
                    path,
                    diagnostic.Location,
                    "unknown",
                    "This source file contains syntax errors, so assertion analysis may be incomplete.");
            }

            foreach (var directive in syntaxRoot.DescendantTrivia(descendIntoTrivia: true)
                .Select(trivia => trivia.GetStructure())
                .OfType<DirectiveTriviaSyntax>()
                .Where(directive => directive is IfDirectiveTriviaSyntax or ElifDirectiveTriviaSyntax or ElseDirectiveTriviaSyntax or EndIfDirectiveTriviaSyntax))
            {
                AddFinding(
                    findings,
                    "AFCLI2402",
                    path,
                    directive.GetLocation(),
                    "unknown",
                    "Conditional-compilation branches are not evaluated with project symbols and may be missing from this report.");
            }
        }

        if (files.Count == 0)
        {
            findings.Add(new AssertionMigrationFinding(
                "AFCLI2406",
                null,
                null,
                null,
                null,
                "unknown",
                "No C# source files were found under the selected input."));
        }

        findings.Add(new AssertionMigrationFinding(
            "AFCLI2403",
            null,
            null,
            null,
            null,
            "unknown",
            "Project settings, package references, imports, and target-framework symbols are not evaluated. Only source files and the CLI host's framework metadata are used; unresolved calls remain unknown."));

        var ordered = findings
            .OrderBy(finding => finding.Source ?? string.Empty, StringComparer.Ordinal)
            .ThenBy(finding => finding.Line ?? 0)
            .ThenBy(finding => finding.Column ?? 0)
            .ThenBy(finding => finding.Code, StringComparer.Ordinal)
            .ToArray();

        return new AssertionMigrationReport(
            SchemaVersion: 1,
            Status: "partial",
            ResolutionContext: "host-framework-only",
            FilesAnalyzed: files.Count,
            Findings: ordered);
    }

    private static IEnumerable<MetadataReference> GetFrameworkReferences()
    {
        var trustedAssemblies = AppContext.GetData("TRUSTED_PLATFORM_ASSEMBLIES") as string;
        if (string.IsNullOrWhiteSpace(trustedAssemblies))
        {
            throw new InvalidOperationException("Framework metadata references are unavailable.");
        }

        return trustedAssemblies
            .Split(Path.PathSeparator, StringSplitOptions.RemoveEmptyEntries)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(path => MetadataReference.CreateFromFile(path));
    }

    private static (string Root, IReadOnlyList<string> Files) GetSourceFiles(string target)
    {
        var fullTarget = Path.GetFullPath(target);
        if (File.Exists(fullTarget))
        {
            EnsureNotReparsePoint(fullTarget);
            var extension = Path.GetExtension(fullTarget);
            if (extension.Equals(".cs", StringComparison.OrdinalIgnoreCase))
            {
                return (Path.GetDirectoryName(fullTarget)!, [fullTarget]);
            }

            if (extension.Equals(".csproj", StringComparison.OrdinalIgnoreCase)
                || extension.Equals(".sln", StringComparison.OrdinalIgnoreCase)
                || extension.Equals(".slnx", StringComparison.OrdinalIgnoreCase))
            {
                fullTarget = Path.GetDirectoryName(fullTarget)!;
            }
            else
            {
                throw new InvalidOperationException("The assertions analyze command accepts a C# file, project, solution, or directory.");
            }
        }

        if (!Directory.Exists(fullTarget))
        {
            throw new FileNotFoundException("The assertions analysis target does not exist.");
        }

        EnsureNotReparsePoint(fullTarget);

        var files = new List<string>();
        var pendingDirectories = new Stack<string>();
        pendingDirectories.Push(fullTarget);
        while (pendingDirectories.Count > 0)
        {
            var directory = pendingDirectories.Pop();
            foreach (var file in Directory.EnumerateFiles(directory)
                .Where(file => Path.GetExtension(file).Equals(".cs", StringComparison.OrdinalIgnoreCase)))
            {
                if ((File.GetAttributes(file) & FileAttributes.ReparsePoint) == 0)
                {
                    files.Add(file);
                }
            }

            foreach (var childDirectory in Directory.EnumerateDirectories(directory))
            {
                if (IgnoredDirectories.Contains(Path.GetFileName(childDirectory))
                    || (File.GetAttributes(childDirectory) & FileAttributes.ReparsePoint) != 0)
                {
                    continue;
                }

                pendingDirectories.Push(childDirectory);
            }
        }

        return (fullTarget, files);
    }

    private static void EnsureNotReparsePoint(string path)
    {
        if ((File.GetAttributes(path) & FileAttributes.ReparsePoint) != 0)
        {
            throw new InvalidOperationException("Assertion analysis does not follow symbolic links or reparse points.");
        }
    }

    private static InvocationExpressionSyntax? FindShouldInvocation(ExpressionSyntax expression)
    {
        SyntaxNode? current = expression;
        while (current is not null)
        {
            switch (current)
            {
                case MemberAccessExpressionSyntax memberAccess:
                    current = memberAccess.Expression;
                    break;
                case InvocationExpressionSyntax invocation:
                    if (GetMethodName(invocation.Expression).Equals("Should", StringComparison.Ordinal))
                    {
                        return invocation;
                    }

                    current = invocation.Expression;
                    break;
                case ParenthesizedExpressionSyntax parenthesized:
                    current = parenthesized.Expression;
                    break;
                case CastExpressionSyntax cast:
                    current = cast.Expression;
                    break;
                default:
                    return null;
            }
        }

        return null;
    }

    private static InvocationExpressionSyntax? FindShouldInvocationThroughLocal(
        ExpressionSyntax expression,
        SemanticModel semanticModel,
        IReadOnlyDictionary<ISymbol, InvocationExpressionSyntax> localEntryPoints)
    {
        SyntaxNode? current = expression;
        while (current is not null)
        {
            if (current is IdentifierNameSyntax identifier
                && semanticModel.GetSymbolInfo(identifier).Symbol is { } symbol
                && localEntryPoints.TryGetValue(symbol, out var shouldInvocation))
            {
                return shouldInvocation;
            }

            current = current switch
            {
                MemberAccessExpressionSyntax memberAccess => memberAccess.Expression,
                InvocationExpressionSyntax invocation => invocation.Expression,
                ParenthesizedExpressionSyntax parenthesized => parenthesized.Expression,
                _ => null
            };
        }

        return null;
    }

    private static bool LooksLikeAssertionType(ITypeSymbol type)
    {
        if (type is not INamedTypeSymbol namedType)
        {
            return false;
        }

        for (var current = namedType; current is not null; current = current.BaseType)
        {
            if (current.Name.Contains("Assertion", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        for (var current = namedType.ContainingNamespace; current is not null && !current.IsGlobalNamespace; current = current.ContainingNamespace)
        {
            if (current.Name.Equals("Assertions", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsAstraFlowAssertionsMethod(IMethodSymbol method)
    {
        var containingNamespace = method.ContainingNamespace.ToDisplayString();
        return containingNamespace.Equals("AstraFlow.Assertions", StringComparison.Ordinal)
            || containingNamespace.StartsWith("AstraFlow.Assertions.", StringComparison.Ordinal)
            || method.ContainingAssembly.Name.Equals("AstraFlow.Assertions", StringComparison.OrdinalIgnoreCase);
    }

    private static void AddFinding(
        ICollection<AssertionMigrationFinding> findings,
        string code,
        string source,
        Location location,
        string classification,
        string suggestion,
        string? method = null)
    {
        var lineSpan = location.GetLineSpan();
        findings.Add(new AssertionMigrationFinding(
            code,
            source,
            lineSpan.StartLinePosition.Line + 1,
            lineSpan.StartLinePosition.Character + 1,
            method,
            classification,
            suggestion));
    }

    private static Location GetTerminalLocation(InvocationExpressionSyntax invocation) => invocation.Expression switch
    {
        MemberAccessExpressionSyntax memberAccess => memberAccess.Name.GetLocation(),
        SimpleNameSyntax simpleName => simpleName.GetLocation(),
        _ => invocation.GetLocation()
    };

    private static string GetMethodName(ExpressionSyntax expression) => expression switch
    {
        MemberAccessExpressionSyntax memberAccess => GetSimpleName(memberAccess.Name),
        SimpleNameSyntax simpleName => GetSimpleName(simpleName),
        ParenthesizedExpressionSyntax parenthesized => GetMethodName(parenthesized.Expression),
        _ => string.Empty
    };

    private static string GetSimpleName(SimpleNameSyntax simpleName) => simpleName.Identifier.ValueText;
}

internal sealed record AssertionMigrationReport(
    int SchemaVersion,
    string Status,
    string ResolutionContext,
    int FilesAnalyzed,
    IReadOnlyList<AssertionMigrationFinding> Findings);

internal sealed record AssertionMigrationFinding(
    string Code,
    string? Source,
    int? Line,
    int? Column,
    string? Method,
    string Classification,
    string Suggestion);
