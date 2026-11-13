# Query Projections & Parameter Binding

Define reusable, provider-translatable LINQ expressions with `IProjection<TSource, TDestination>` and `IParameterizedProjection<TSource, TDestination, TParameters>` so database queries fetch only the columns required by each DTO.

## Installation & Quick Example

Projections ship directly inside `AstraFlow.Mapper`:

```bash
dotnet add package AstraFlow.Mapper
```

Implement `IProjection<TSource, TDestination>` and project any `IQueryable<TSource>` with `ProjectWith`:

```csharp
using System.Linq.Expressions;
using AstraFlow.Mapper;

public sealed class InvoiceSummaryProjection : IProjection<InvoiceEntity, InvoiceSummaryDto>
{
    public Expression<Func<InvoiceEntity, InvoiceSummaryDto>> Expression =>
        invoice => new InvoiceSummaryDto(
            invoice.PublicReference,
            invoice.Customer.DisplayName,
            invoice.TotalAmount,
            invoice.IssuedAtUtc);
}

// Inside a query handler:
var summaries = await dbContext.Invoices
    .Where(i => i.IsPaid)
    .ProjectWith(projection)
    .ToListAsync(cancellationToken);
```

All non-abstract `IProjection<,>` and `IParameterizedProjection<,,>` implementations discovered in your `AddAstraFlowMapper` marker assemblies are registered automatically in `IProjectionRegistry`.

## Parameterized Projections

When a query shape depends on request-scoped values—such as the caller's locale, tenant tier, or reference timestamp—implement `IParameterizedProjection<TSource, TDestination, TParameters>` instead of capturing closures dynamically:

```csharp
using System.Linq.Expressions;
using AstraFlow.Mapper;

public sealed record PricingContext(decimal DiscountRate, DateTimeOffset AsOfUtc);

public sealed class ActiveOfferProjection
    : IParameterizedProjection<OfferEntity, OfferDto, PricingContext>
{
    public Expression<Func<OfferEntity, PricingContext, OfferDto>> Expression =>
        (offer, ctx) => new OfferDto(
            offer.Title,
            offer.BasePrice * (1m - ctx.DiscountRate),
            offer.ExpiresAtUtc > ctx.AsOfUtc);
}

var offers = await dbContext.Offers
    .ProjectWith(activeOfferProjection, new PricingContext(0.10m, DateTimeOffset.UtcNow))
    .ToListAsync(cancellationToken);
```

`ProjectWith` binds parameter values cleanly into the expression tree before passing it to your LINQ provider without triggering premature client evaluation.

## Named Projections for Multiple DTO Shapes

If multiple read-model shapes map between the same entity and DTO pair, implement `INamedProjection<TSource, TDestination>` (or `INamedParameterizedProjection<,,>`) and expose a unique `Name`:

```csharp
public sealed class CompactOrderProjection : INamedProjection<OrderEntity, OrderDto>
{
    public string Name => "Compact";
    public Expression<Func<OrderEntity, OrderDto>> Expression =>
        order => new OrderDto(order.Number, order.Total);
}

// Resolve via IProjectionRegistry or extension method:
var results = query.ProjectWith<OrderEntity, OrderDto>(projectionRegistry, "Compact");
```

## Startup Validation & `ProjectionValidationMode`

`AstraFlowProjectionValidator` checks every registered projection when `ValidateProjectionCatalogOnStartup` is enabled (the default):

- Detects duplicate unnamed projections or duplicate projection names for the same source/destination tuple.
- Flags null expressions, custom non-translatable method calls inside projection lambdas, runtime `IMapper` invocations inside queries, and complex captured objects.
- Configure `options.ProjectionValidationMode` (`Disabled`, `Warning`, or `Error`) inside `AddAstraFlowMapper` to promote projection warnings into hard startup checks in CI/staging.

## Related Guides

- Verify SQL translation against your real `DbContext` in [Entity Framework Core Projections](/docs/entity-framework-core).
- Prevent raw primary keys from leaking in DTOs via [Secure Identifiers & Sensitive Data Policies](/docs/secure-ids).
- See compile-time expression checks in [Build-Time Roslyn Analyzers](/docs/analyzers).
