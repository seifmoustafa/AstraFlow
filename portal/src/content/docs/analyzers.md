# Build-Time Roslyn Analyzers

`AstraFlow.Analyzers` runs incremental Roslyn analysis inside your IDE and `dotnet build` step so missing handlers, duplicate registrations, singleton lifetime mistakes, sensitive reverse mappings, and risky LINQ projections are caught before code ever compiles cleanly into production.

## Installation

Add `AstraFlow.Analyzers` with `PrivateAssets="all"` so analyzer DLLs inspect your build without propagating as a runtime package dependency:

```bash
dotnet add package AstraFlow.Analyzers
```

```xml
<ItemGroup>
  <PackageReference Include="AstraFlow.Analyzers" Version="2.4.0" PrivateAssets="all" />
</ItemGroup>
```

## Mediator Build-Time Checks

Across `IRequest`, `IRequest<TResponse>`, and `IStreamRequest<TResponse>` contracts in your compilation, the analyzer catches:

- **Missing request handlers:** Flags concrete `IRequest` and `IRequest<TResponse>` types with no matching `IRequestHandler` implementation in the analyzed compilation.
- **Missing stream handlers:** Flags concrete `IStreamRequest<TResponse>` types lacking an `IStreamRequestHandler<,>`.
- **Duplicate single-handler contracts:** Reports when multiple non-abstract classes implement the same closed `IRequestHandler` or `IStreamRequestHandler` service contract.
- **Ambiguous request contracts:** Warns when a single request class implements multiple request contracts simultaneously (for example both `IRequest` and `IRequest<TResponse>`).
- **Singleton handler lifetime warnings:** Detects DI calls registering AstraFlow handlers via `AddSingleton(...)`, reminding teams to keep handlers scoped or transient unless deliberate.

## Mapping & Security Checks

Across explicit mapping rules and opt-in convention profiles:

- **Undeclared mapping rules:** Flags implementations of `IObjectMappingRule` that do not implement `IDeclaredObjectMappingRule`, ensuring mapping ownership stays machine-checkable at startup.
- **Reverse-map sensitive writes:** Warns when convention `.ReverseMap()` targets destination types containing sensitive properties (`password`, `token`, `key`, `secret`) without explicit review.

## Projection & Query Translation Checks

Across `IProjection<TSource, TDestination>` and LINQ projection lambdas:

- **Raw public `Guid` ID projection warnings:** Flags projection DTOs exposing raw `Guid` `PublicId`-style properties when encoded opaque identifiers should be used across API boundaries.
- **Runtime mapper calls inside queries:** Warns when `IMapper.Map(...)` appears inside an `IQueryable` or projection expression where LINQ providers cannot translate it to SQL.
- **Custom methods inside projections:** Flags calls to custom methods inside projection expressions that may fail SQL provider translation.
- **Complex captures inside projections:** Warns when a projection expression closes over complex non-scalar instances instead of explicit `IParameterizedProjection<,,>` scalar bindings.

## Customizing Severity in `.editorconfig`

Promote any AstraFlow warning category to `error` in CI or suppress intentional exceptions locally via standard `.editorconfig` severity rules or `#pragma warning disable` directives where deliberately reviewed.

## Related Guides

- Pair with compile-time code emission in [Compile-Time Mediator Registration](/docs/generated-dispatch) and [Source-Generated Object Mapping](/docs/generated-mapping).
- Validate runtime SQL generation in [Entity Framework Core Projections](/docs/entity-framework-core).
