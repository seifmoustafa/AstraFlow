import { LATEST_PUBLISHED_VERSION } from '@core/config/site-config';
import type { RawMilestone } from './model';

export const RAW_MILESTONES: RawMilestone[] = [
  {
    stepNumber: '01',
    id: 'contracts',
    packages: ['AstraFlow.Contracts'],
    codeLang: 'csharp',
    codeTitle: 'Application/Orders/CreateOrder.cs',
    code: `using AstraFlow.Mediator;

namespace Shop.Application.Orders;

public sealed record CreateOrder(string Sku, int Quantity) : IRequest<OrderCreated>;

public sealed record OrderCreated(Guid OrderId, string Sku);`,
    docHref: '/docs/architecture',
    secondaryLinkHrefs: ['/docs/package-selection', '/packages#AstraFlow.Contracts'],
  },
  {
    stepNumber: '02',
    id: 'mediator-pipelines',
    packages: ['AstraFlow.Mediator', 'AstraFlow.AspNetCore', 'AstraFlow.FluentValidation'],
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
    secondaryLinkHrefs: ['/docs/getting-started', '/docs/generated-dispatch'],
  },
  {
    stepNumber: '03',
    id: 'explicit-mapping',
    packages: [
      'AstraFlow.Mapper',
      'AstraFlow.Mapper.Conventions',
      'AstraFlow.Mapper.EntityFrameworkCore',
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
    secondaryLinkHrefs: ['/docs/generated-mapping', '/docs/compatibility'],
  },
  {
    stepNumber: '04',
    id: 'source-generators',
    packages: ['AstraFlow.Generators', 'AstraFlow.Analyzers'],
    codeLang: 'xml',
    codeTitle: 'Application/Shop.Application.csproj',
    code: `<ItemGroup>
  <PackageReference Include="AstraFlow.Mediator" Version="${LATEST_PUBLISHED_VERSION}" />
  <PackageReference Include="AstraFlow.Generators" Version="${LATEST_PUBLISHED_VERSION}" PrivateAssets="all" />
  <PackageReference Include="AstraFlow.Analyzers" Version="${LATEST_PUBLISHED_VERSION}" PrivateAssets="all" />
</ItemGroup>`,
    docHref: '/docs/generated-dispatch',
    secondaryLinkHrefs: ['/docs/getting-started', '/packages#AstraFlow.Generators'],
  },
  {
    stepNumber: '05',
    id: 'diagnostics-cli',
    packages: [
      'AstraFlow.Diagnostics',
      'AstraFlow.Security',
      'AstraFlow.OpenTelemetry',
      'AstraFlow.Cli',
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
    secondaryLinkHrefs: ['/docs/secure-ids', '/docs/cli'],
  },
  {
    stepNumber: '06',
    id: 'testing-harnesses',
    packages: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
    codeLang: 'csharp',
    codeTitle: 'Tests/Orders/CreateOrderTests.cs',
    code: `using AstraFlow.Assertions;

var result = await sender.Send(new CreateOrder("SKU-42", 2), ct);

result.OrderId.Should().NotBeEmpty();
result.Sku.Should().Be("SKU-42");

Func<Task> act = () => sender.Send(new CreateOrder("SKU-42", 2), ct);
await act.Should().NotThrowAsync();`,
    docHref: '/docs/testing',
    secondaryLinkHrefs: ['/docs/assertions', '/docs/package-selection'],
  },
];

