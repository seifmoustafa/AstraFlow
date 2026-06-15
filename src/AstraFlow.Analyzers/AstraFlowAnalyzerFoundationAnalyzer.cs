using System.Collections.Immutable;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.Diagnostics;
using Microsoft.CodeAnalysis.Operations;

namespace AstraFlow.Analyzers;

/// <summary>
/// Analyzer entry point for AstraFlow compile-time diagnostics.
/// </summary>
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public sealed class AstraFlowAnalyzerFoundationAnalyzer : DiagnosticAnalyzer
{
    /// <inheritdoc />
    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics { get; } =
        AstraFlowAnalyzerRules.All.Select(rule => rule.Descriptor).ToImmutableArray();

    /// <inheritdoc />
    public override void Initialize(AnalysisContext context)
    {
        if (context is null)
        {
            throw new ArgumentNullException(nameof(context));
        }

        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterCompilationStartAction(StartAnalysis);
    }

    private static void StartAnalysis(CompilationStartAnalysisContext context)
    {
        var mediatorSymbols = MediatorSymbols.Create(context.Compilation);
        var mapperSymbols = MapperSymbols.Create(context.Compilation);
        if (!mediatorSymbols.HasRequiredSymbols && !mapperSymbols.HasCoreSymbols)
        {
            return;
        }

        var requests = new List<RequestCandidate>();
        var handlers = new List<HandlerCandidate>();

        context.RegisterSymbolAction(symbolContext =>
        {
            var type = (INamedTypeSymbol)symbolContext.Symbol;
            if (type.TypeKind is not (TypeKind.Class or TypeKind.Struct) ||
                type.IsAbstract ||
                type.IsGenericType)
            {
                return;
            }

            if (mediatorSymbols.HasRequiredSymbols)
            {
                var request = RequestCandidate.Create(type, mediatorSymbols);
                if (request is not null)
                {
                    lock (requests)
                    {
                        requests.Add(request);
                    }
                }

                foreach (var handler in HandlerCandidate.Create(type, mediatorSymbols))
                {
                    lock (handlers)
                    {
                        handlers.Add(handler);
                    }
                }
            }

            if (mapperSymbols.HasCoreSymbols)
            {
                ReportMapperSymbolDiagnostics(symbolContext, type, mapperSymbols);
            }
        }, SymbolKind.NamedType);

        context.RegisterOperationAction(operationContext =>
        {
            var invocation = (IInvocationOperation)operationContext.Operation;

            if (mediatorSymbols.HasRequiredSymbols)
            {
                ReportSingletonHandlerLifetime(operationContext, invocation, mediatorSymbols);
            }

            if (mapperSymbols.HasCoreSymbols)
            {
                ReportMapperInvocationDiagnostics(operationContext, invocation, mapperSymbols);
            }
        }, OperationKind.Invocation);

        context.RegisterOperationAction(operationContext =>
        {
            if (!mapperSymbols.HasCoreSymbols)
            {
                return;
            }

            var fieldReference = (IFieldReferenceOperation)operationContext.Operation;
            if (!IsInsideProjectionExpressionGetter(operationContext.ContainingSymbol, mapperSymbols) ||
                fieldReference.Instance is null ||
                IsSimpleValue(fieldReference.Field.Type))
            {
                return;
            }

            operationContext.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.ComplexProjectionCapture.Descriptor,
                fieldReference.Syntax.GetLocation(),
                fieldReference.Field.Name,
                GetDisplayName(fieldReference.Field.Type)));
        }, OperationKind.FieldReference);

        if (mediatorSymbols.HasRequiredSymbols)
        {
            context.RegisterCompilationEndAction(endContext =>
            {
                RequestCandidate[] requestSnapshot;
                HandlerCandidate[] handlerSnapshot;
                lock (requests)
                {
                    requestSnapshot = requests.ToArray();
                }

                lock (handlers)
                {
                    handlerSnapshot = handlers.ToArray();
                }

                ReportAmbiguousRequests(endContext, requestSnapshot);
                ReportDuplicateHandlers(endContext, handlerSnapshot);
                ReportMissingHandlers(endContext, requestSnapshot, handlerSnapshot);
            });
        }
    }

    private static void ReportMapperSymbolDiagnostics(
        SymbolAnalysisContext context,
        INamedTypeSymbol type,
        MapperSymbols symbols)
    {
        if (symbols.IsUndeclaredMappingRule(type))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.UndeclaredMappingRule.Descriptor,
                GetLocation(type),
                GetDisplayName(type)));
        }

        var rawPublicIdMembers = symbols.GetRawPublicIdProjectionMembers(type).ToArray();
        if (rawPublicIdMembers.Length > 0)
        {
            var destination = symbols.GetProjectionDestinationType(type);
            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.RawPublicIdProjection.Descriptor,
                GetLocation(type),
                GetDisplayName(type),
                destination is null ? "unknown destination" : GetDisplayName(destination),
                string.Join(", ", rawPublicIdMembers)));
        }
    }

    private static void ReportSingletonHandlerLifetime(
        OperationAnalysisContext context,
        IInvocationOperation invocation,
        MediatorSymbols symbols)
    {
        if (!string.Equals(invocation.TargetMethod.Name, "AddSingleton", StringComparison.Ordinal))
        {
            return;
        }

        var singletonHandler = FindSingletonHandlerType(invocation, symbols);
        if (singletonHandler is null)
        {
            return;
        }

        context.ReportDiagnostic(Diagnostic.Create(
            AstraFlowAnalyzerRules.SingletonHandlerLifetime.Descriptor,
            invocation.Syntax.GetLocation(),
            GetDisplayName(singletonHandler)));
    }

    private static void ReportMapperInvocationDiagnostics(
        OperationAnalysisContext context,
        IInvocationOperation invocation,
        MapperSymbols symbols)
    {
        if (symbols.IsReverseMapInvocation(invocation))
        {
            var destinationType = invocation.TargetMethod.ContainingType.TypeArguments.FirstOrDefault() as INamedTypeSymbol;
            var sensitiveMembers = destinationType is null
                ? Array.Empty<string>()
                : GetSensitiveMemberNames(destinationType).ToArray();

            if (destinationType is not null && sensitiveMembers.Length > 0)
            {
                context.ReportDiagnostic(Diagnostic.Create(
                    AstraFlowAnalyzerRules.ReverseMapSensitiveWrite.Descriptor,
                    invocation.Syntax.GetLocation(),
                    GetDisplayName(destinationType),
                    string.Join(", ", sensitiveMembers)));
            }
        }

        if (symbols.IsMapperMapInvocation(invocation) &&
            (IsInsideQueryableLambda(invocation) || IsInsideProjectionExpressionGetter(context.ContainingSymbol, symbols)))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.MapperCallInsideQuery.Descriptor,
                invocation.Syntax.GetLocation(),
                $"{GetDisplayName(invocation.TargetMethod.ContainingType)}.{invocation.TargetMethod.Name}"));
        }

        if (IsInsideProjectionExpressionGetter(context.ContainingSymbol, symbols) &&
            IsCustomProjectionMethod(invocation.TargetMethod, symbols))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.CustomMethodInProjection.Descriptor,
                invocation.Syntax.GetLocation(),
                $"{GetDisplayName(invocation.TargetMethod.ContainingType)}.{invocation.TargetMethod.Name}"));
        }
    }

    private static void ReportAmbiguousRequests(
        CompilationAnalysisContext context,
        IReadOnlyCollection<RequestCandidate> requests)
    {
        foreach (var request in requests.Where(request => request.Contracts.Count > 1))
        {
            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.AmbiguousRequestContract.Descriptor,
                GetLocation(request.Type),
                GetDisplayName(request.Type),
                string.Join(", ", request.Contracts.Select(GetDisplayName))));
        }
    }

    private static void ReportDuplicateHandlers(
        CompilationAnalysisContext context,
        IReadOnlyCollection<HandlerCandidate> handlers)
    {
        foreach (var duplicate in handlers
            .GroupBy(handler => handler.ServiceContract, SymbolEqualityComparer.Default)
            .Where(group => group.Select(handler => handler.Implementation).Distinct(SymbolEqualityComparer.Default).Skip(1).Any()))
        {
            var first = duplicate.First();
            var implementations = duplicate
                .Select(handler => handler.Implementation)
                .Distinct(SymbolEqualityComparer.Default)
                .Select(symbol => GetDisplayName(symbol!))
                .OrderBy(name => name, StringComparer.Ordinal)
                .ToArray();

            context.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.DuplicateRequestHandler.Descriptor,
                GetLocation(first.Implementation),
                GetDisplayName(first.ServiceContract),
                string.Join(", ", implementations)));
        }
    }

    private static void ReportMissingHandlers(
        CompilationAnalysisContext context,
        IReadOnlyCollection<RequestCandidate> requests,
        IReadOnlyCollection<HandlerCandidate> handlers)
    {
        var handlerContracts = handlers
            .Select(handler => handler.ServiceContract)
            .ToArray();

        foreach (var request in requests.Where(request => request.Contracts.Count == 1))
        {
            var expectedHandler = request.ExpectedHandlerContract;
            if (expectedHandler is null ||
                handlerContracts.Any(handler => SymbolEqualityComparer.Default.Equals(handler, expectedHandler)))
            {
                continue;
            }

            var descriptor = request.Kind == RequestCandidateKind.Stream
                ? AstraFlowAnalyzerRules.MissingStreamHandler.Descriptor
                : AstraFlowAnalyzerRules.MissingRequestHandler.Descriptor;

            context.ReportDiagnostic(Diagnostic.Create(
                descriptor,
                GetLocation(request.Type),
                GetDisplayName(request.Type)));
        }
    }

    private static INamedTypeSymbol? FindSingletonHandlerType(
        IInvocationOperation invocation,
        MediatorSymbols symbols)
    {
        foreach (var typeArgument in invocation.TargetMethod.TypeArguments.OfType<INamedTypeSymbol>())
        {
            if (symbols.IsHandlerImplementation(typeArgument))
            {
                return typeArgument;
            }
        }

        foreach (var argument in invocation.Arguments)
        {
            if (argument.Value is ITypeOfOperation { TypeOperand: INamedTypeSymbol typeOperand } &&
                symbols.IsHandlerImplementation(typeOperand))
            {
                return typeOperand;
            }
        }

        return null;
    }

    private static Location? GetLocation(INamedTypeSymbol symbol)
    {
        return symbol.Locations.FirstOrDefault(location => location.IsInSource);
    }

    private static string GetDisplayName(ISymbol symbol)
    {
        return symbol.ToDisplayString(SymbolDisplayFormat.FullyQualifiedFormat)
            .Replace("global::", string.Empty);
    }

    private static IEnumerable<string> GetSensitiveMemberNames(INamedTypeSymbol type)
    {
        return type.GetMembers()
            .Where(member => member is IPropertySymbol or IFieldSymbol)
            .Select(member => member.Name)
            .Where(IsSensitiveName)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .OrderBy(name => name, StringComparer.Ordinal);
    }

    private static bool IsSensitiveName(string name)
    {
        return name.IndexOf("password", StringComparison.OrdinalIgnoreCase) >= 0 ||
               name.IndexOf("token", StringComparison.OrdinalIgnoreCase) >= 0 ||
               name.IndexOf("secret", StringComparison.OrdinalIgnoreCase) >= 0 ||
               name.IndexOf("credential", StringComparison.OrdinalIgnoreCase) >= 0 ||
               name.IndexOf("apiKey", StringComparison.OrdinalIgnoreCase) >= 0 ||
               name.IndexOf("key", StringComparison.OrdinalIgnoreCase) >= 0;
    }

    private static bool IsInsideQueryableLambda(IInvocationOperation invocation)
    {
        var sawLambda = false;
        for (IOperation? current = invocation.Parent; current is not null; current = current.Parent)
        {
            if (current is IAnonymousFunctionOperation)
            {
                sawLambda = true;
                continue;
            }

            if (sawLambda &&
                current is IInvocationOperation parentInvocation &&
                string.Equals(parentInvocation.TargetMethod.ContainingType?.ToDisplayString(), "System.Linq.Queryable", StringComparison.Ordinal))
            {
                return true;
            }
        }

        return false;
    }

    private static bool IsInsideProjectionExpressionGetter(ISymbol? containingSymbol, MapperSymbols symbols)
    {
        var property = containingSymbol switch
        {
            IPropertySymbol directProperty => directProperty,
            IMethodSymbol { AssociatedSymbol: IPropertySymbol associatedProperty } => associatedProperty,
            _ => null
        };

        return property is { Name: "Expression", ContainingType: { } containingType } &&
               symbols.IsProjectionImplementation(containingType);
    }

    private static bool IsCustomProjectionMethod(IMethodSymbol method, MapperSymbols symbols)
    {
        var containingType = method.ContainingType;
        if (containingType is null ||
            symbols.IsMapperMapInvocation(method) ||
            method.MethodKind is MethodKind.PropertyGet or MethodKind.PropertySet)
        {
            return false;
        }

        var namespaceName = containingType.ContainingNamespace?.ToDisplayString();
        return namespaceName is null ||
               (!namespaceName.Equals("System", StringComparison.Ordinal) &&
                !namespaceName.StartsWith("System.", StringComparison.Ordinal) &&
                !namespaceName.Equals("Microsoft", StringComparison.Ordinal) &&
                !namespaceName.StartsWith("Microsoft.", StringComparison.Ordinal));
    }

    private static bool IsSimpleValue(ITypeSymbol type)
    {
        if (type is INamedTypeSymbol { OriginalDefinition.SpecialType: SpecialType.System_Nullable_T } nullableType)
        {
            type = nullableType.TypeArguments[0];
        }

        return type.SpecialType is
            SpecialType.System_Boolean or
            SpecialType.System_Byte or
            SpecialType.System_Char or
            SpecialType.System_DateTime or
            SpecialType.System_Decimal or
            SpecialType.System_Double or
            SpecialType.System_Int16 or
            SpecialType.System_Int32 or
            SpecialType.System_Int64 or
            SpecialType.System_SByte or
            SpecialType.System_Single or
            SpecialType.System_String or
            SpecialType.System_UInt16 or
            SpecialType.System_UInt32 or
            SpecialType.System_UInt64 ||
            type.TypeKind == TypeKind.Enum ||
            string.Equals(type.ToDisplayString(), "System.Guid", StringComparison.Ordinal);
    }

    private sealed class MediatorSymbols
    {
        private MediatorSymbols(
            INamedTypeSymbol? request,
            INamedTypeSymbol? responseRequest,
            INamedTypeSymbol? streamRequest,
            INamedTypeSymbol? voidRequestHandler,
            INamedTypeSymbol? responseRequestHandler,
            INamedTypeSymbol? streamRequestHandler)
        {
            Request = request;
            ResponseRequest = responseRequest;
            StreamRequest = streamRequest;
            VoidRequestHandler = voidRequestHandler;
            ResponseRequestHandler = responseRequestHandler;
            StreamRequestHandler = streamRequestHandler;
        }

        public INamedTypeSymbol? Request { get; }

        public INamedTypeSymbol? ResponseRequest { get; }

        public INamedTypeSymbol? StreamRequest { get; }

        public INamedTypeSymbol? VoidRequestHandler { get; }

        public INamedTypeSymbol? ResponseRequestHandler { get; }

        public INamedTypeSymbol? StreamRequestHandler { get; }

        public bool HasRequiredSymbols =>
            Request is not null &&
            ResponseRequest is not null &&
            StreamRequest is not null &&
            VoidRequestHandler is not null &&
            ResponseRequestHandler is not null &&
            StreamRequestHandler is not null;

        public static MediatorSymbols Create(Compilation compilation)
        {
            return new MediatorSymbols(
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IRequest"),
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IRequest`1"),
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IStreamRequest`1"),
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IRequestHandler`1"),
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IRequestHandler`2"),
                compilation.GetTypeByMetadataName("AstraFlow.Mediator.IStreamRequestHandler`2"));
        }

        public bool IsHandlerImplementation(INamedTypeSymbol type)
        {
            return type.AllInterfaces.Any(IsHandlerContract);
        }

        public bool IsHandlerContract(INamedTypeSymbol candidate)
        {
            var definition = candidate.OriginalDefinition;
            return SymbolEqualityComparer.Default.Equals(definition, VoidRequestHandler) ||
                   SymbolEqualityComparer.Default.Equals(definition, ResponseRequestHandler) ||
                   SymbolEqualityComparer.Default.Equals(definition, StreamRequestHandler);
        }
    }

    private sealed class MapperSymbols
    {
        private MapperSymbols(
            INamedTypeSymbol? objectMappingRule,
            INamedTypeSymbol? declaredObjectMappingRule,
            INamedTypeSymbol? mapper,
            INamedTypeSymbol? projection,
            INamedTypeSymbol? conventionMappingExpression)
        {
            ObjectMappingRule = objectMappingRule;
            DeclaredObjectMappingRule = declaredObjectMappingRule;
            Mapper = mapper;
            Projection = projection;
            ConventionMappingExpression = conventionMappingExpression;
        }

        public INamedTypeSymbol? ObjectMappingRule { get; }

        public INamedTypeSymbol? DeclaredObjectMappingRule { get; }

        public INamedTypeSymbol? Mapper { get; }

        public INamedTypeSymbol? Projection { get; }

        public INamedTypeSymbol? ConventionMappingExpression { get; }

        public bool HasCoreSymbols =>
            ObjectMappingRule is not null &&
            DeclaredObjectMappingRule is not null &&
            Mapper is not null &&
            Projection is not null;

        public static MapperSymbols Create(Compilation compilation)
        {
            return new MapperSymbols(
                compilation.GetTypeByMetadataName("AstraFlow.Mapper.IObjectMappingRule"),
                compilation.GetTypeByMetadataName("AstraFlow.Mapper.IDeclaredObjectMappingRule"),
                compilation.GetTypeByMetadataName("AstraFlow.Mapper.IMapper"),
                compilation.GetTypeByMetadataName("AstraFlow.Mapper.IProjection`2"),
                compilation.GetTypeByMetadataName("AstraFlow.Mapper.Conventions.ConventionMappingExpression`2"));
        }

        public bool IsUndeclaredMappingRule(INamedTypeSymbol type)
        {
            return ObjectMappingRule is not null &&
                   DeclaredObjectMappingRule is not null &&
                   type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate, ObjectMappingRule)) &&
                   !type.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate, DeclaredObjectMappingRule));
        }

        public INamedTypeSymbol? GetProjectionDestinationType(INamedTypeSymbol type)
        {
            return type.AllInterfaces
                .FirstOrDefault(IsProjectionContract)
                ?.TypeArguments[1] as INamedTypeSymbol;
        }

        public IEnumerable<string> GetRawPublicIdProjectionMembers(INamedTypeSymbol type)
        {
            var destinationType = GetProjectionDestinationType(type);
            if (destinationType is null)
            {
                return [];
            }

            return destinationType.GetMembers()
                .Where(member => member is IPropertySymbol or IFieldSymbol)
                .Where(member => member.Name.EndsWith("PublicId", StringComparison.OrdinalIgnoreCase))
                .Where(member => IsGuidLike(GetMemberType(member)))
                .Select(member => member.Name)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(name => name, StringComparer.Ordinal);
        }

        public bool IsProjectionImplementation(INamedTypeSymbol type)
        {
            return type.AllInterfaces.Any(IsProjectionContract);
        }

        public bool IsReverseMapInvocation(IInvocationOperation invocation)
        {
            return ConventionMappingExpression is not null &&
                   string.Equals(invocation.TargetMethod.Name, "ReverseMap", StringComparison.Ordinal) &&
                   (SymbolEqualityComparer.Default.Equals(
                        invocation.TargetMethod.ContainingType.OriginalDefinition,
                        ConventionMappingExpression) ||
                    invocation.TargetMethod.ContainingType.OriginalDefinition.ToDisplayString()
                        .StartsWith("AstraFlow.Mapper.Conventions.ConventionMappingExpression<", StringComparison.Ordinal));
        }

        public bool IsMapperMapInvocation(IInvocationOperation invocation)
        {
            return IsMapperMapInvocation(invocation.TargetMethod);
        }

        public bool IsMapperMapInvocation(IMethodSymbol method)
        {
            return Mapper is not null &&
                   string.Equals(method.Name, "Map", StringComparison.Ordinal) &&
                   (SymbolEqualityComparer.Default.Equals(method.ContainingType, Mapper) ||
                    string.Equals(method.ContainingType.ToDisplayString(), "AstraFlow.Mapper.IMapper", StringComparison.Ordinal) ||
                    method.ContainingType.AllInterfaces.Any(candidate => SymbolEqualityComparer.Default.Equals(candidate, Mapper)));
        }

        private bool IsProjectionContract(INamedTypeSymbol candidate)
        {
            return Projection is not null &&
                   (SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, Projection) ||
                    candidate.OriginalDefinition.ToDisplayString()
                        .StartsWith("AstraFlow.Mapper.IProjection<", StringComparison.Ordinal));
        }

        private static ITypeSymbol? GetMemberType(ISymbol member)
        {
            return member switch
            {
                IPropertySymbol property => property.Type,
                IFieldSymbol field => field.Type,
                _ => null
            };
        }

        private static bool IsGuidLike(ITypeSymbol? type)
        {
            if (type is INamedTypeSymbol { OriginalDefinition.SpecialType: SpecialType.System_Nullable_T } nullableType)
            {
                type = nullableType.TypeArguments[0];
            }

            return type is not null &&
                   (string.Equals(type.ToDisplayString(), "System.Guid", StringComparison.Ordinal) ||
                    string.Equals(type.Name, "Guid", StringComparison.Ordinal));
        }
    }

    private sealed record RequestCandidate(
        INamedTypeSymbol Type,
        RequestCandidateKind Kind,
        IReadOnlyList<INamedTypeSymbol> Contracts,
        INamedTypeSymbol? ExpectedHandlerContract)
    {
        public static RequestCandidate? Create(INamedTypeSymbol type, MediatorSymbols symbols)
        {
            var responseContracts = type.AllInterfaces
                .Where(candidate => SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, symbols.ResponseRequest))
                .ToArray();
            var streamContracts = type.AllInterfaces
                .Where(candidate => SymbolEqualityComparer.Default.Equals(candidate.OriginalDefinition, symbols.StreamRequest))
                .ToArray();
            var hasVoidRequest = type.AllInterfaces.Any(candidate =>
                SymbolEqualityComparer.Default.Equals(candidate, symbols.Request));

            var contracts = responseContracts
                .Concat(streamContracts)
                .Concat(hasVoidRequest && symbols.Request is not null ? new[] { symbols.Request } : Array.Empty<INamedTypeSymbol>())
                .ToArray();

            if (contracts.Length == 0)
            {
                return null;
            }

            if (contracts.Length != 1)
            {
                return new RequestCandidate(type, RequestCandidateKind.Ambiguous, contracts, null);
            }

            if (hasVoidRequest && symbols.VoidRequestHandler is not null)
            {
                return new RequestCandidate(
                    type,
                    RequestCandidateKind.Void,
                    contracts,
                    symbols.VoidRequestHandler.Construct(type));
            }

            if (responseContracts.Length == 1 && symbols.ResponseRequestHandler is not null)
            {
                return new RequestCandidate(
                    type,
                    RequestCandidateKind.Response,
                    contracts,
                    symbols.ResponseRequestHandler.Construct(type, responseContracts[0].TypeArguments[0]));
            }

            if (streamContracts.Length == 1 && symbols.StreamRequestHandler is not null)
            {
                return new RequestCandidate(
                    type,
                    RequestCandidateKind.Stream,
                    contracts,
                    symbols.StreamRequestHandler.Construct(type, streamContracts[0].TypeArguments[0]));
            }

            return null;
        }
    }

    private sealed record HandlerCandidate(INamedTypeSymbol Implementation, INamedTypeSymbol ServiceContract)
    {
        public static IEnumerable<HandlerCandidate> Create(INamedTypeSymbol type, MediatorSymbols symbols)
        {
            return type.AllInterfaces
                .Where(symbols.IsHandlerContract)
                .Select(handlerContract => new HandlerCandidate(type, handlerContract));
        }
    }

    private enum RequestCandidateKind
    {
        Void,
        Response,
        Stream,
        Ambiguous
    }
}
