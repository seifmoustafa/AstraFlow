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
        context.RegisterCompilationStartAction(StartMediatorAnalysis);
    }

    private static void StartMediatorAnalysis(CompilationStartAnalysisContext context)
    {
        var symbols = MediatorSymbols.Create(context.Compilation);
        if (!symbols.HasRequiredSymbols)
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

            var request = RequestCandidate.Create(type, symbols);
            if (request is not null)
            {
                lock (requests)
                {
                    requests.Add(request);
                }
            }

            foreach (var handler in HandlerCandidate.Create(type, symbols))
            {
                lock (handlers)
                {
                    handlers.Add(handler);
                }
            }
        }, SymbolKind.NamedType);

        context.RegisterOperationAction(operationContext =>
        {
            var invocation = (IInvocationOperation)operationContext.Operation;
            if (!string.Equals(invocation.TargetMethod.Name, "AddSingleton", StringComparison.Ordinal))
            {
                return;
            }

            var singletonHandler = FindSingletonHandlerType(invocation, symbols);
            if (singletonHandler is null)
            {
                return;
            }

            operationContext.ReportDiagnostic(Diagnostic.Create(
                AstraFlowAnalyzerRules.SingletonHandlerLifetime.Descriptor,
                invocation.Syntax.GetLocation(),
                GetDisplayName(singletonHandler)));
        }, OperationKind.Invocation);

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
