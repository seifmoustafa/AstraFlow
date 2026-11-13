import { highlightCode } from './markdown';
import { LATEST_PUBLISHED_VERSION } from './site-config';

export interface LearningMilestone {
  stepNumber: string;
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  packages: string[];
  keyConcepts: string[];
  codeLang: 'csharp' | 'xml' | 'bash';
  codeTitle: string;
  code: string;
  codeHtml: string;
  docHref: string;
  docLabel: string;
  secondaryLinks: { href: string; label: string }[];
  unreleasedNote?: string;
}

interface RawMilestone {
  stepNumber: string;
  id: string;
  title: string;
  shortTitle: string;
  subtitle: string;
  summary: string;
  packages: string[];
  keyConcepts: string[];
  codeLang: 'csharp' | 'xml' | 'bash';
  codeTitle: string;
  code: string;
  docHref: string;
  docLabel: string;
  secondaryLinks: { href: string; label: string }[];
  unreleasedNote?: string;
}

const RAW_MILESTONES: RawMilestone[] = [
  {
    stepNumber: '01',
    id: 'contracts',
    title: '01 Contracts',
    shortTitle: 'Contracts',
    subtitle: 'Dependency-free message and handler interfaces for your Domain & Application layers.',
    summary:
      'Keep your domain and application abstractions clean without pulling DI containers, ASP.NET Core, or Entity Framework into shared contract assemblies. Define requests, commands, notifications, and streaming queries once against AstraFlow.Contracts.',
    packages: ['AstraFlow.Contracts'],
    keyConcepts: [
      'IRequest<out TResponse> & IRequest markers for commands and queries',
      'INotification & IStreamRequest<out TResponse> abstractions',
      'Zero runtime or container coupling in shared domain projects',
    ],
    codeLang: 'csharp',
    codeTitle: 'Application/Orders/CreateOrder.cs',
    code: `using AstraFlow.Mediator;

namespace Shop.Application.Orders;

public sealed record CreateOrder(string Sku, int Quantity) : IRequest<OrderCreated>;

public sealed record OrderCreated(Guid OrderId, string Sku);`,
    docHref: '/docs/architecture',
    docLabel: 'Read Architecture Overview',
    secondaryLinks: [
      { href: '/docs/package-selection', label: 'Package Selection Guide' },
      { href: '/packages#AstraFlow.Contracts', label: 'AstraFlow.Contracts' },
    ],
  },
  {
    stepNumber: '02',
    id: 'mediator-pipelines',
    title: '02 Mediator & Pipelines',
    shortTitle: 'Mediator & Pipelines',
    subtitle: 'High-throughput request dispatch, validation behaviors, and HTTP endpoint helpers.',
    summary:
      'Register AstraFlow handlers once at startup and dispatch commands, queries, and domain events through ISender and IPublisher. Layer cross-cutting IPipelineBehavior<TRequest, TResponse> validation with FluentValidation and Minimal API / ProblemDetails integration via AstraFlow.AspNetCore.',
    packages: ['AstraFlow.Mediator', 'AstraFlow.AspNetCore', 'AstraFlow.FluentValidation'],
    keyConcepts: [
      'ISender.Send / IPublisher.Publish with cancellation-token propagation',
      'Ordered IPipelineBehavior<TRequest, TResponse> execution',
      'FluentValidation behavior + ASP.NET Core ProblemDetails endpoint mapping',
    ],
    codeLang: 'csharp',
    codeTitle: 'Api/Program.cs',
    code: `using AstraFlow;
using AstraFlow.Mediator;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAstraFlow(typeof(Program).Assembly);

var app = builder.Build();
app.MapPost("/orders", async (CreateOrder cmd, ISender sender, CancellationToken ct) =>
    Results.Created("/orders", await sender.Send(cmd, ct)));

app.Run();`,
    docHref: '/docs/mediator',
    docLabel: 'Read Mediator Guide',
    secondaryLinks: [
      { href: '/docs/getting-started', label: 'Getting Started' },
      { href: '/docs/generated-dispatch', label: 'Generated Dispatch' },
    ],
  },
  {
    stepNumber: '03',
    id: 'explicit-mapping',
    title: '03 Explicit Mapping',
    shortTitle: 'Explicit Mapping',
    subtitle: 'Compile-checked object mapping, naming conventions, and EF Core IQueryable projections.',
    summary:
      'Avoid opaque runtime reflection surprises. AstraFlow.Mapper provides explicit mapping registration and IMapper execution, while Mapper.Conventions handles predictable property conventions and Mapper.EntityFrameworkCore translates ProjectTo<TDestination>() expressions directly into SQL.',
    packages: [
      'AstraFlow.Mapper',
      'AstraFlow.Mapper.Conventions',
      'AstraFlow.Mapper.EntityFrameworkCore',
    ],
    keyConcepts: [
      'Explicit IMapper & mapping profiles without silent member skips',
      'Modular convention packs via AstraFlow.Mapper.Conventions',
      'Database-level Select translation with ProjectTo<OrderDto>()',
    ],
    codeLang: 'csharp',
    codeTitle: 'Infrastructure/Orders/OrderReadQueries.cs',
    code: `using AstraFlow.Mapper;
using AstraFlow.Mapper.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public sealed record OrderSummaryDto(Guid Id, string Sku, int Quantity);

public static Task<List<OrderSummaryDto>> GetRecentOrdersAsync(
    OrdersDbContext db,
    IMapper mapper,
    CancellationToken ct) =>
    db.Orders
        .AsNoTracking()
        .ProjectTo<OrderSummaryDto>(mapper)
        .ToListAsync(ct);`,
    docHref: '/docs/mapper',
    docLabel: 'Read Mapper & Projections Guide',
    secondaryLinks: [
      { href: '/docs/generated-mapping', label: 'Generated Mapping' },
      { href: '/docs/compatibility', label: 'Compatibility Matrix' },
    ],
  },
  {
    stepNumber: '04',
    id: 'source-generators',
    title: '04 Source Generators',
    shortTitle: 'Source Generators',
    subtitle: 'Zero-reflection handler and mapper emission with build-time Roslyn diagnostics.',
    summary:
      'Reference AstraFlow.Generators and AstraFlow.Analyzers with PrivateAssets="all" so compile-time code generation and analyzer diagnostics run during build without shipping compiler dependencies in your runtime output.',
    packages: ['AstraFlow.Generators', 'AstraFlow.Analyzers'],
    keyConcepts: [
      'PrivateAssets="all" keeps analyzer & generator DLLs out of runtime dependencies',
      'Incremental Roslyn generation for AOT-friendly handler dispatch & mapping',
      'Build-time diagnostics for unmapped members, missing handlers, and unsafe patterns',
    ],
    codeLang: 'xml',
    codeTitle: 'Application/Shop.Application.csproj',
    code: `<ItemGroup>
  <PackageReference Include="AstraFlow.Mediator" Version="${LATEST_PUBLISHED_VERSION}" />
  <PackageReference Include="AstraFlow.Generators" Version="${LATEST_PUBLISHED_VERSION}" PrivateAssets="all" />
  <PackageReference Include="AstraFlow.Analyzers" Version="${LATEST_PUBLISHED_VERSION}" PrivateAssets="all" />
</ItemGroup>`,
    docHref: '/docs/generated-dispatch',
    docLabel: 'Read Source Generators Guide',
    secondaryLinks: [
      { href: '/docs/getting-started', label: 'Getting Started' },
      { href: '/packages#AstraFlow.Generators', label: 'AstraFlow.Generators' },
    ],
  },
  {
    stepNumber: '05',
    id: 'diagnostics-cli',
    title: '05 Diagnostics & CLI',
    shortTitle: 'Diagnostics & CLI',
    subtitle: 'Safe telemetry, redaction guardrails, OpenTelemetry traces, and the global dotnet CLI tool.',
    summary:
      'Observe request execution without leaking sensitive fields. AstraFlow.Diagnostics and AstraFlow.OpenTelemetry export structured traces and ActivitySource spans while AstraFlow.Security enforces payload redaction defaults. Install AstraFlow.Cli as a dotnet global tool for local workspace diagnostics.',
    packages: [
      'AstraFlow.Diagnostics',
      'AstraFlow.Security',
      'AstraFlow.OpenTelemetry',
      'AstraFlow.Cli',
    ],
    keyConcepts: [
      'Safe-by-default diagnostics that never emit raw secrets or payload PII',
      'OpenTelemetry ActivitySource & metric integration for mediator dispatch',
      `AstraFlow.Cli installed via dotnet tool install --global (${LATEST_PUBLISHED_VERSION})`,
    ],
    codeLang: 'bash',
    codeTitle: 'Install AstraFlow.Cli & inspect your solution',
    code: `# Install the AstraFlow global CLI tool (${LATEST_PUBLISHED_VERSION})
dotnet tool install --global AstraFlow.Cli --version ${LATEST_PUBLISHED_VERSION}

# Add core packages + telemetry to an API project
dotnet add package AstraFlow --version ${LATEST_PUBLISHED_VERSION}
dotnet add package AstraFlow.OpenTelemetry --version ${LATEST_PUBLISHED_VERSION}
dotnet add package AstraFlow.Security --version ${LATEST_PUBLISHED_VERSION}`,
    docHref: '/docs/diagnostics',
    docLabel: 'Read Diagnostics Guide',
    secondaryLinks: [
      { href: '/docs/secure-ids', label: 'Security & Redaction' },
      { href: '/docs/cli', label: 'CLI Reference' },
    ],
  },
  {
    stepNumber: '06',
    id: 'testing-harnesses',
    title: '06 Testing & Assertions',
    shortTitle: 'Testing & Assertions',
    subtitle: 'Deterministic mediator harnesses paired with fluent Should() assertions.',
    summary:
      'Verify handlers, pipeline ordering, and notifications in isolation with AstraFlow.Testing and FakeMediator. Pair your test harness with AstraFlow.Assertions for crisp, readable Should() and NotThrowAsync() assertions with zero external runner coupling.',
    packages: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    keyConcepts: [
      'FakeMediator and HandlerTestHarness for isolated pipeline & notification verification',
      'Fluent Should(), Be(), NotBeEmpty(), and NotThrowAsync() assertion primitives',
      'Clean test-project isolation with zero production runtime overhead',
    ],
    codeLang: 'csharp',
    codeTitle: 'Tests/Orders/CreateOrderTests.cs',
    code: `using AstraFlow.Assertions;

var result = await sender.Send(new CreateOrder("SKU-42", 2), ct);

result.OrderId.Should().NotBeEmpty();
result.Sku.Should().Be("SKU-42");

Func<Task> act = () => sender.Send(new CreateOrder("SKU-42", 2), ct);
await act.Should().NotThrowAsync();`,
    docHref: '/docs/testing',
    docLabel: 'Read Testing Guide',
    secondaryLinks: [
      { href: '/docs/assertions', label: 'Assertions Reference' },
      { href: '/docs/package-selection', label: 'Package Selection' },
    ],
  },
];

let cachedMilestones: LearningMilestone[] | null = null;

export function getLearningMilestones(): LearningMilestone[] {
  if (!cachedMilestones) {
    cachedMilestones = RAW_MILESTONES.map((item) => ({
      ...item,
      codeHtml: highlightCode(item.code, item.codeLang),
    }));
  }
  return cachedMilestones;
}

export function getMilestoneById(id: string): LearningMilestone | null {
  return getLearningMilestones().find((milestone) => milestone.id === id) ?? null;
}
