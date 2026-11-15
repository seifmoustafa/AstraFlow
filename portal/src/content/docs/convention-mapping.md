# Opt-In Convention Mapping

`AstraFlow.Mapper.Conventions` brings profile-based convention mapping to AstraFlow as a strictly opt-in package with built-in guards against silent unmapped members and accidental exposure of sensitive fields.

## Installation & Registration

Install `AstraFlow.Mapper.Conventions` alongside `AstraFlow.Mapper`:

```bash
dotnet add package AstraFlow.Mapper.Conventions
```

Register `AddAstraFlowConventionMapping` after `AddAstraFlowMapper`:

```csharp
using AstraFlow.Mapper;
using AstraFlow.Mapper.Conventions;

builder.Services
    .AddAstraFlowMapper(typeof(Program))
    .AddAstraFlowConventionMapping(
        catalog => catalog.AddProfile<CatalogMappingProfile>(),
        options =>
        {
            options.StrictMode = true;
            options.RequireExplicitSensitiveMemberAllow = true;
        });
```

Convention mapping is never active by default—only assemblies that call `AddAstraFlowConventionMapping` enable profile-based matching.

## Writing a `ConventionMappingProfile`

Define explicit `CreateMap<TSource, TDestination>()` pairs inside a `ConventionMappingProfile` subclass and configure allow-lists, ignores, hooks, or flattening explicitly:

```csharp
using AstraFlow.Mapper.Conventions;

public sealed class CatalogMappingProfile : ConventionMappingProfile
{
    public CatalogMappingProfile()
    {
        AddValueTransformer<string>(value => value?.Trim());

        CreateMap<ProductEntity, ProductDto>()
            .Ignore(nameof(ProductDto.InternalScore))
            .EnableFlattening();

        CreateMap<UpdateProductInput, ProductEntity>()
            .EnableUpdateMapping()
            .Ignore(nameof(ProductEntity.Id));
    }
}
```

## Built-In Safety Guards

`ConventionMappingOptions` (bound from `Mapping:Conventions`) protects application boundaries out of the box:

- **`StrictMode` (default `true`):** Startup validation (`ConventionMappingStartupValidator`) fails if mapping plans contain unmapped required members or ambiguous matches.
- **`RequireExplicitSensitiveMemberAllow` (default `true`):** Blocks mapping members matching sensitive patterns from `AstraFlow.Security` (`password`, `secret`, `token`, `apikey`, `credential`, `salt`, etc.) unless `.AllowSensitiveMember("...")` is explicitly declared.
- **`AllowCaseInsensitiveMemberMatching` (default `false`):** Keeps member matching exact unless opted into globally or per map via `.UseCaseInsensitiveMemberMatching()`.

## Update Mapping with `IConventionMapper`

Use `IConventionMapper.MapInto` to update an existing destination instance when `.EnableUpdateMapping()` is enabled on that pair:

```csharp
using AstraFlow.Mapper.Conventions;

public sealed class UpdateProductHandler(IConventionMapper conventionMapper, IProductRepo repo)
{
    public async Task HandleAsync(Guid id, UpdateProductInput input, CancellationToken ct)
    {
        var entity = await repo.FindAsync(id, ct);
        conventionMapper.MapInto(input, entity);
    }
}
```

## Advanced Profile Features

- **Constructor & immutable support:** Automatically resolves constructor parameters alongside writable members and tracks resolved plans for diagnostics.
- **Inheritance & polymorphism:** Chain `.IncludeBase<TBaseSource, TBaseDestination>()` and `.IncludeDerived<TDerivedSource, TDerivedDestination>()` cleanly.
- **Lifecycle hooks:** Attach `.BeforeMap((src, dest) => ...)` and `.AfterMap((src, dest) => ...)` callbacks per mapping pair.

## Related Guides

- Compare against handwritten rules in [Explicit Object Mapping](/docs/mapper).
- Review sensitive name classification in [Secure Identifiers & Sensitive Data Policies](/docs/secure-ids).
