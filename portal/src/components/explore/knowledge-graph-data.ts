export interface GraphNode {
  id: string;
  name: string;
  layer: 'contracts' | 'dispatch' | 'mapping' | 'roslyn' | 'observability' | 'testing';
  layerName: string;
  kind: 'package' | 'interface' | 'generator' | 'behavior';
  summary: string;
  filePath: string;
  publicApis: string[];
  dependencies: string[];
  status: 'published' | 'preview' | 'core';
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: 'dependsOn' | 'implements' | 'generates' | 'validates';
  label?: string;
}

export interface GuidedTourStep {
  step: number;
  title: string;
  subtitle: string;
  targetNodeIds: string[];
  description: string;
  csharpExcerpt: string;
  highlights: string[];
}

export interface ArchitectureTour {
  id: string;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  steps: GuidedTourStep[];
}

export const GRAPH_NODES: GraphNode[] = [
  // --- LAYER 1: CONTRACTS (x ~ 100-300, y: 100) ---
  {
    id: 'AstraFlow.Contracts',
    name: 'AstraFlow.Contracts',
    layer: 'contracts',
    layerName: '1. Shared Contracts',
    kind: 'package',
    summary: 'Zero-dependency core abstractions defining request, notification, mapping, and projection contracts.',
    filePath: 'src/AstraFlow.Contracts/AstraFlow.Contracts.csproj',
    publicApis: ['IMediator', 'IRequest<TResponse>', 'IRequestHandler<TRequest, TResponse>', 'IObjectMapper', 'IProjectionProvider'],
    dependencies: [],
    status: 'published',
    x: 220,
    y: 110
  },
  {
    id: 'IMediator',
    name: 'IMediator',
    layer: 'contracts',
    layerName: '1. Shared Contracts',
    kind: 'interface',
    summary: 'Central mediator contract for dispatching commands, queries, and stream sequences.',
    filePath: 'src/AstraFlow.Contracts/IMediator.cs',
    publicApis: ['Task<TResponse> SendAsync<TResponse>(IRequest<TResponse> request, CancellationToken ct)', 'IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken ct)'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'core',
    x: 100,
    y: 200
  },
  {
    id: 'IRequestHandler',
    name: 'IRequestHandler<T, R>',
    layer: 'contracts',
    layerName: '1. Shared Contracts',
    kind: 'interface',
    summary: 'Handler abstraction for processing requests of type T and returning response R.',
    filePath: 'src/AstraFlow.Contracts/IRequestHandler.cs',
    publicApis: ['Task<TResponse> HandleAsync(TRequest request, CancellationToken ct)'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'core',
    x: 230,
    y: 200
  },
  {
    id: 'IObjectMapper',
    name: 'IObjectMapper',
    layer: 'contracts',
    layerName: '1. Shared Contracts',
    kind: 'interface',
    summary: 'High-performance object-to-object transformation contract supporting compile-time generated execution.',
    filePath: 'src/AstraFlow.Contracts/IObjectMapper.cs',
    publicApis: ['TDestination Map<TSource, TDestination>(TSource source)', 'TDestination Map<TDestination>(object source)'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'core',
    x: 360,
    y: 200
  },

  // --- LAYER 2: CORE DISPATCH & PIPELINES (x: 480-680, y: 100-240) ---
  {
    id: 'AstraFlow.Mediator',
    name: 'AstraFlow.Mediator',
    layer: 'dispatch',
    layerName: '2. Core Dispatch',
    kind: 'package',
    summary: 'High-throughput async mediator engine with pipeline behavior chains and publisher dispatch.',
    filePath: 'src/AstraFlow.Mediator/AstraFlow.Mediator.csproj',
    publicApis: ['Mediator', 'IPipelineBehavior<TRequest, TResponse>', 'PublishStrategy', 'ServiceCollectionExtensions'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 520,
    y: 110
  },
  {
    id: 'AstraFlow.AspNetCore',
    name: 'AstraFlow.AspNetCore',
    layer: 'dispatch',
    layerName: '2. Core Dispatch',
    kind: 'package',
    summary: 'ASP.NET Core Minimal API endpoint route mappers and HTTP mediator binding extensions.',
    filePath: 'src/AstraFlow.AspNetCore/AstraFlow.AspNetCore.csproj',
    publicApis: ['MapMediatorPost<TRequest>', 'MapMediatorGet<TRequest>', 'AddAstraFlowEndpoints'],
    dependencies: ['AstraFlow.Mediator', 'AstraFlow.Contracts'],
    status: 'published',
    x: 680,
    y: 110
  },
  {
    id: 'AstraFlow.FluentValidation',
    name: 'AstraFlow.FluentValidation',
    layer: 'dispatch',
    layerName: '2. Core Dispatch',
    kind: 'package',
    summary: 'Automatic request pre-validation pipeline behavior integrating FluentValidation rules.',
    filePath: 'src/AstraFlow.FluentValidation/AstraFlow.FluentValidation.csproj',
    publicApis: ['ValidationPipelineBehavior<TRequest, TResponse>', 'AddAstraFlowValidation'],
    dependencies: ['AstraFlow.Mediator', 'AstraFlow.Contracts'],
    status: 'published',
    x: 600,
    y: 220
  },

  // --- LAYER 3: MAPPING & EF CORE (x: 100-360, y: 340-450) ---
  {
    id: 'AstraFlow.Mapper',
    name: 'AstraFlow.Mapper',
    layer: 'mapping',
    layerName: '3. Mapping & Projections',
    kind: 'package',
    summary: 'High-speed object mapper supporting generated methods, expression tree compilation, and profile conventions.',
    filePath: 'src/AstraFlow.Mapper/AstraFlow.Mapper.csproj',
    publicApis: ['ObjectMapper', 'MappingProfile', 'MappingConfiguration', 'IProjectionProvider'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 140,
    y: 350
  },
  {
    id: 'AstraFlow.Mapper.EntityFrameworkCore',
    name: 'AstraFlow.Mapper.EntityFrameworkCore',
    layer: 'mapping',
    layerName: '3. Mapping & Projections',
    kind: 'package',
    summary: 'EF Core IQueryable projection extensions translating mapped DTO trees into optimal SQL SELECT queries.',
    filePath: 'src/AstraFlow.Mapper.EntityFrameworkCore/AstraFlow.Mapper.EntityFrameworkCore.csproj',
    publicApis: ['ProjectTo<TDestination>(this IQueryable source)', 'QueryableProjectionExtensions'],
    dependencies: ['AstraFlow.Mapper', 'AstraFlow.Contracts'],
    status: 'published',
    x: 320,
    y: 350
  },
  {
    id: 'AstraFlow.Mapper.Conventions',
    name: 'AstraFlow.Mapper.Conventions',
    layer: 'mapping',
    layerName: '3. Mapping & Projections',
    kind: 'package',
    summary: 'Configurable naming and casing conventions for automated unmapped property resolution.',
    filePath: 'src/AstraFlow.Mapper.Conventions/AstraFlow.Mapper.Conventions.csproj',
    publicApis: ['SnakeCaseConvention', 'ExactMatchConvention', 'FlatteningConvention'],
    dependencies: ['AstraFlow.Mapper', 'AstraFlow.Contracts'],
    status: 'published',
    x: 230,
    y: 450
  },

  // --- LAYER 4: ROSLYN COMPILER TOOLING & GENERATORS (x: 480-720, y: 350-460) ---
  {
    id: 'AstraFlow.Analyzers',
    name: 'AstraFlow.Analyzers',
    layer: 'roslyn',
    layerName: '4. Roslyn Tooling',
    kind: 'package',
    summary: 'Roslyn code analyzers providing build-time diagnostics (AFAN0101-AFAN0304, AFM001, AFC013-AFC019) for handlers and mapper profiles.',
    filePath: 'src/AstraFlow.Analyzers/AstraFlow.Analyzers.csproj',
    publicApis: ['AFAN0101MissingHandlerAnalyzer', 'AFAN0201UndeclaredMappingAnalyzer', 'AFAN0302MapperCallInQueryableAnalyzer'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 520,
    y: 350
  },
  {
    id: 'AstraFlow.Generators',
    name: 'AstraFlow.Generators',
    layer: 'roslyn',
    layerName: '4. Roslyn Tooling',
    kind: 'generator',
    summary: 'Incremental source generators producing static C# execution mapping code at compile-time with zero reflection.',
    filePath: 'src/AstraFlow.Generators/AstraFlow.Generators.csproj',
    publicApis: ['AstraFlowExecutableMapperGenerator', 'MapGeneratorAttribute'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 700,
    y: 350
  },
  {
    id: 'AstraFlow.Cli',
    name: 'AstraFlow.Cli',
    layer: 'roslyn',
    layerName: '4. Roslyn Tooling',
    kind: 'package',
    summary: 'Global CLI command-line tool for scaffolding features, analyzing pipelines, and validating mappings.',
    filePath: 'src/AstraFlow.Cli/AstraFlow.Cli.csproj',
    publicApis: ['astraflow analyze', 'astraflow scaffold handler', 'astraflow verify-mappings'],
    dependencies: ['AstraFlow.Contracts', 'AstraFlow.Mediator'],
    status: 'published',
    x: 610,
    y: 460
  },

  // --- LAYER 5: OBSERVABILITY, SECURITY & RESILIENCE (x: 100-360, y: 570-680) ---
  {
    id: 'AstraFlow.Diagnostics',
    name: 'AstraFlow.Diagnostics',
    layer: 'observability',
    layerName: '5. Observability & Security',
    kind: 'package',
    summary: 'ActivitySource and Meter telemetry instrumentation following W3C TraceContext standards.',
    filePath: 'src/AstraFlow.Diagnostics/AstraFlow.Diagnostics.csproj',
    publicApis: ['AstraFlowActivitySource', 'MediatorMetrics', 'ActivityTagsCollection'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 120,
    y: 570
  },
  {
    id: 'AstraFlow.Security',
    name: 'AstraFlow.Security',
    layer: 'observability',
    layerName: '5. Observability & Security',
    kind: 'package',
    summary: 'PII, credential, and sensitive identifier redactor preventing data leakage in telemetry tags.',
    filePath: 'src/AstraFlow.Security/AstraFlow.Security.csproj',
    publicApis: ['ITelemetryRedactor', 'MaskSensitiveData', 'RedactionOptions'],
    dependencies: ['AstraFlow.Contracts'],
    status: 'published',
    x: 270,
    y: 570
  },
  {
    id: 'AstraFlow.OpenTelemetry',
    name: 'AstraFlow.OpenTelemetry',
    layer: 'observability',
    layerName: '5. Observability & Security',
    kind: 'package',
    summary: 'Direct OpenTelemetry tracer and meter provider extensions for seamless Aspire & Prometheus export.',
    filePath: 'src/AstraFlow.OpenTelemetry/AstraFlow.OpenTelemetry.csproj',
    publicApis: ['AddAstraFlowInstrumentation', 'TracerProviderBuilderExtensions'],
    dependencies: ['AstraFlow.Diagnostics', 'AstraFlow.Security', 'AstraFlow.Contracts'],
    status: 'published',
    x: 200,
    y: 670
  },

  // --- LAYER 6: TESTING & RUNNER-NEUTRAL ASSERTIONS (x: 480-720, y: 570-680) ---
  {
    id: 'AstraFlow.Testing',
    name: 'AstraFlow.Testing',
    layer: 'testing',
    layerName: '6. Testing & Assertions',
    kind: 'package',
    summary: 'Mediator test harness and pipeline test doubles with in-memory spy recording.',
    filePath: 'src/AstraFlow.Testing/AstraFlow.Testing.csproj',
    publicApis: ['TestMediator', 'RecordedInvocation', 'AssertHandled<TRequest>'],
    dependencies: ['AstraFlow.Contracts', 'AstraFlow.Mediator'],
    status: 'published',
    x: 520,
    y: 570
  },
  {
    id: 'AstraFlow.Assertions',
    name: 'AstraFlow.Assertions',
    layer: 'testing',
    layerName: '6. Testing & Assertions',
    kind: 'package',
    summary: 'Runner-neutral fluent assertion engine (v2.4 preview) with zero package dependencies and privacy-safe failure redaction.',
    filePath: 'src/AstraFlow.Assertions/AstraFlow.Assertions.csproj',
    publicApis: ['AssertionScope', 'Should().Be()', 'RedactedFailureFormatter'],
    dependencies: [],
    status: 'preview',
    x: 700,
    y: 570
  },
  {
    id: 'AstraFlow',
    name: 'AstraFlow (Metapackage)',
    layer: 'dispatch',
    layerName: '2. Core Dispatch',
    kind: 'package',
    summary: 'Convenience metapackage referencing Contracts, Mediator, and Mapper with one single install.',
    filePath: 'src/AstraFlow/AstraFlow.csproj',
    publicApis: ['AddAstraFlow(this IServiceCollection services)'],
    dependencies: ['AstraFlow.Contracts', 'AstraFlow.Mediator', 'AstraFlow.Mapper'],
    status: 'published',
    x: 610,
    y: 670
  }
];

export const GRAPH_EDGES: GraphEdge[] = [
  // Contracts Implementations
  { from: 'IMediator', to: 'AstraFlow.Contracts', type: 'implements' },
  { from: 'IRequestHandler', to: 'AstraFlow.Contracts', type: 'implements' },
  { from: 'IObjectMapper', to: 'AstraFlow.Contracts', type: 'implements' },

  // Dispatch Dependencies
  { from: 'AstraFlow.Mediator', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow.AspNetCore', to: 'AstraFlow.Mediator', type: 'dependsOn' },
  { from: 'AstraFlow.AspNetCore', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow.FluentValidation', to: 'AstraFlow.Mediator', type: 'dependsOn' },

  // Mapping Dependencies
  { from: 'AstraFlow.Mapper', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow.Mapper.EntityFrameworkCore', to: 'AstraFlow.Mapper', type: 'dependsOn' },
  { from: 'AstraFlow.Mapper.Conventions', to: 'AstraFlow.Mapper', type: 'dependsOn' },

  // Roslyn Dependencies
  { from: 'AstraFlow.Analyzers', to: 'AstraFlow.Contracts', type: 'validates' },
  { from: 'AstraFlow.Generators', to: 'AstraFlow.Contracts', type: 'generates' },
  { from: 'AstraFlow.Generators', to: 'AstraFlow.Mapper', type: 'generates' },
  { from: 'AstraFlow.Cli', to: 'AstraFlow.Mediator', type: 'dependsOn' },

  // Observability & Security
  { from: 'AstraFlow.Diagnostics', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow.Security', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow.OpenTelemetry', to: 'AstraFlow.Diagnostics', type: 'dependsOn' },
  { from: 'AstraFlow.OpenTelemetry', to: 'AstraFlow.Security', type: 'dependsOn' },

  // Testing & Assertions
  { from: 'AstraFlow.Testing', to: 'AstraFlow.Mediator', type: 'dependsOn' },
  { from: 'AstraFlow.Testing', to: 'AstraFlow.Contracts', type: 'dependsOn' },

  // Metapackage
  { from: 'AstraFlow', to: 'AstraFlow.Contracts', type: 'dependsOn' },
  { from: 'AstraFlow', to: 'AstraFlow.Mediator', type: 'dependsOn' },
  { from: 'AstraFlow', to: 'AstraFlow.Mapper', type: 'dependsOn' }
];

export const ARCHITECTURE_TOURS: ArchitectureTour[] = [
  {
    id: 'tour-dispatch',
    title: 'Tour 1: Predictable Request Dispatch',
    tagline: 'From HTTP Minimal API to Handler via Pipeline Behaviors',
    badge: 'Core Mediator',
    description: 'Learn how AstraFlow handles inbound commands and queries with clean cancellation propagation and extensible pipeline behaviors.',
    steps: [
      {
        step: 1,
        title: 'Minimal API Route Binding',
        subtitle: 'AstraFlow.AspNetCore',
        targetNodeIds: ['AstraFlow.AspNetCore', 'IMediator'],
        description: 'Endpoints bind HTTP requests directly to typed IRequest commands with zero reflection overhead.',
        csharpExcerpt: `app.MapMediatorPost<CreateOrderCommand, OrderDto>("/api/orders");
// Maps incoming JSON directly to SendAsync(command, ct)`,
        highlights: [
          'Automatic model binding from JSON payload',
          'Passes HttpContext.RequestAborted CancellationToken',
          'Maps 400 Bad Request if validation short-circuits'
        ]
      },
      {
        step: 2,
        title: 'Pipeline Delegation Chain',
        subtitle: 'AstraFlow.Mediator',
        targetNodeIds: ['AstraFlow.Mediator', 'AstraFlow.FluentValidation'],
        description: 'Pre-processors, validators, and transactions wrap handler execution in a predictable middleware pipeline.',
        csharpExcerpt: `public class ValidationBehavior<TRequest, TResponse> 
    : IPipelineBehavior<TRequest, TResponse>
{
    public async Task<TResponse> HandleAsync(
        TRequest request, 
        RequestHandlerDelegate<TResponse> next, 
        CancellationToken ct)
    {
        await _validator.ValidateAndThrowAsync(request, ct);
        return await next();
    }
}`,
        highlights: [
          'Ordered execution matching dependency injection setup',
          'Supports async short-circuiting on business invariant breaches',
          'Zero hidden global thread-local state'
        ]
      },
      {
        step: 3,
        title: 'Application Handler Execution',
        subtitle: 'AstraFlow.Contracts',
        targetNodeIds: ['IRequestHandler', 'IMediator'],
        description: 'The pure handler executes domain business logic and returns the response.',
        csharpExcerpt: `public class CreateOrderHandler 
    : IRequestHandler<CreateOrderCommand, OrderDto>
{
    public async Task<OrderDto> HandleAsync(
        CreateOrderCommand cmd, 
        CancellationToken ct)
    {
        var order = new Order(cmd.CustomerId, cmd.Items);
        await _repository.SaveAsync(order, ct);
        return _mapper.Map<Order, OrderDto>(order);
    }
}`,
        highlights: [
          'Pure testable application boundary',
          'Strict typed output contract',
          'Easily mocked via AstraFlow.Testing'
        ]
      }
    ]
  },
  {
    id: 'tour-mapping',
    title: 'Tour 2: Compile-Time Executable Mapping',
    tagline: 'Zero Reflection with Incremental Roslyn Source Generation',
    badge: 'Executable Mapper',
    description: 'Explore how AstraFlow.Mapper generates static C# mapping methods at build-time and projects SQL expression trees via EF Core.',
    steps: [
      {
        step: 1,
        title: 'Contract Declaration',
        subtitle: 'AstraFlow.Contracts',
        targetNodeIds: ['IObjectMapper', 'AstraFlow.Mapper'],
        description: 'Declare destination mapping expectations without heavy profile boilerplate.',
        csharpExcerpt: `public interface IObjectMapper
{
    TDestination Map<TSource, TDestination>(TSource source);
    TDestination Map<TDestination>(object source);
}`,
        highlights: [
          'Clean generic API',
          'Compatible with dependency injection',
          'Supports custom value resolvers'
        ]
      },
      {
        step: 2,
        title: 'Roslyn Incremental Code Generator',
        subtitle: 'AstraFlow.Generators',
        targetNodeIds: ['AstraFlow.Generators', 'AstraFlow.Mapper'],
        description: 'At compile-time, the source generator emits direct IL/C# property assignment methods.',
        csharpExcerpt: `// AUTO-GENERATED BY AstraFlowExecutableMapperGenerator
public static class OrderToDtoGeneratedMapper
{
    public static OrderDto Map(Order source) => new OrderDto
    {
        Id = source.Id,
        TotalAmount = source.TotalAmount,
        CreatedAt = source.CreatedAt
    };
}`,
        highlights: [
          'Zero runtime reflection or unboxing overhead',
          'Trimmable and AOT-safe for native compilation',
          'Roslyn diagnostics detect type mismatches before build completes'
        ]
      },
      {
        step: 3,
        title: 'EF Core Expression Projection',
        subtitle: 'AstraFlow.Mapper.EntityFrameworkCore',
        targetNodeIds: ['AstraFlow.Mapper.EntityFrameworkCore', 'AstraFlow.Mapper'],
        description: 'Projects IQueryable directly into database SELECT statements to eliminate over-fetching.',
        csharpExcerpt: `var activeOrders = await dbContext.Orders
    .Where(o => o.IsActive)
    .ProjectTo<OrderSummaryDto>(_mapper)
    .ToListAsync(cancellationToken);
// Generates: SELECT o.Id, o.TotalAmount FROM Orders o WHERE o.IsActive = 1`,
        highlights: [
          'Expression tree translation directly to SQL',
          'Circular relationship guards with max depth protection',
          'Works seamlessly with EF Core 8, 9, and 10'
        ]
      }
    ]
  },
  {
    id: 'tour-assertions',
    title: 'Tour 3: Runner-Neutral Assertions (v2.4 Preview)',
    tagline: 'Privacy-Safe Diagnostic Failure Messages Across Any Test Runner',
    badge: 'v2.4 In-Development',
    description: 'Inspect the upcoming AstraFlow.Assertions package designed for runner independence and automatic credential redaction in CI logs.',
    steps: [
      {
        step: 1,
        title: 'Runner Independence',
        subtitle: 'AstraFlow.Assertions',
        targetNodeIds: ['AstraFlow.Assertions'],
        description: 'Execute identical assertion suites whether tests run in xUnit, NUnit, or MSTest with zero package dependencies.',
        csharpExcerpt: `[Fact]
public void Order_Should_HaveValidTotal()
{
    var order = new Order(100.0m);
    order.Total.Should().Be(100.0m)
         .And.BePositive();
}`,
        highlights: [
          'Zero package dependencies (standalone lightweight engine)',
          'No dependency on xunit.runner or nunit.framework in assertion engine',
          'AssertionScope collects multiple failures in a single run'
        ]
      },
      {
        step: 2,
        title: 'Privacy-Safe Redaction in Failures',
        subtitle: 'AstraFlow.Assertions',
        targetNodeIds: ['AstraFlow.Assertions', 'AstraFlow.Security'],
        description: 'Token, secret, and PII values are masked automatically. By default, failures avoid rendering arbitrary object/string/GUID/exception values in failure messages (CHANGELOG line 38).',
        csharpExcerpt: `// When an authorization header assertion fails:
// Expected: "Bearer eyJhbGciOi..."
// Actual:   "Bearer [REDACTED_JWT_TOKEN]"
// Result: CI logs never leak production secrets or customer emails!`,
        highlights: [
          'Safe failure formatting avoids dumping arbitrary payload values',
          'Automatic detection of JWT, connection strings, and bearer tokens',
          'Prevents CI log contamination and compliance breaches'
        ]
      }
    ]
  },
  {
    id: 'tour-diagnostics',
    title: 'Tour 4: Defense-in-Depth Observability & Redaction',
    tagline: 'W3C OpenTelemetry Traces with Strict PII Masking Gates',
    badge: 'Observability & Sec',
    description: 'See how AstraFlow.Diagnostics instruments distributed traces while AstraFlow.Security enforces strict data privacy.',
    steps: [
      {
        step: 1,
        title: 'OpenTelemetry ActivitySource',
        subtitle: 'AstraFlow.Diagnostics',
        targetNodeIds: ['AstraFlow.Diagnostics', 'AstraFlow.OpenTelemetry'],
        description: 'Every SendAsync and PublishAsync call produces a typed OpenTelemetry trace span.',
        csharpExcerpt: `using var activity = AstraFlowDiagnostics.ActivitySource
    .StartActivity("AstraFlow.Mediator.Send", ActivityKind.Internal);

activity?.SetTag("astraflow.request_type", typeof(TRequest).Name);
activity?.SetTag("astraflow.handler_type", handlerType.Name);`,
        highlights: [
          'Zero allocation when trace listeners are inactive',
          'Captures execution duration and pipeline short-circuits',
          'Native integration with .NET Aspire dashboard'
        ]
      },
      {
        step: 2,
        title: 'Security Redaction Gate',
        subtitle: 'AstraFlow.Security',
        targetNodeIds: ['AstraFlow.Security', 'AstraFlow.Diagnostics'],
        description: 'Repository rule: Never expose payload values, secrets, or sensitive IDs in telemetry tags.',
        csharpExcerpt: `public class SafeTelemetryRedactor : ITelemetryRedactor
{
    public string SanitizeTag(string key, object? value)
    {
        if (IsSensitiveKey(key) || IsTokenValue(value))
            return "[REDACTED]";
        return value?.ToString() ?? string.Empty;
    }
}`,
        highlights: [
          'Enforces security baseline across all diagnostic exporters',
          'Configurable redaction patterns via appsettings.json',
          'Validated by Roslyn analyzer AF0007 at compile time'
        ]
      }
    ]
  }
];
