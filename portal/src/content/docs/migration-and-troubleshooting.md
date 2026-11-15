# Migration & Troubleshooting

Move smoothly from reflection-heavy mediator or convention-first mapper setups onto AstraFlow's explicit contracts, and resolve common startup validation and build-time diagnostic issues quickly.

## Step-by-Step Adoption Path

You can migrate incrementally module by module without rewriting an entire solution at once:

```bash
# 1. Start with AstraFlow contracts and mediator dispatch
dotnet add package AstraFlow.Contracts
dotnet add package AstraFlow.Mediator
```

1. **Swap core interfaces first:** Replace reflection-oriented request and notification markers with `IRequest`, `IRequest<TResponse>`, `IStreamRequest<TResponse>`, and `INotification` from `AstraFlow.Contracts`.
2. **Enable startup request coverage:** Pass `validateRequestCoverage: true` to `AddAstraFlowMediator` (and switch critical modules to `AddAstraFlowGeneratedMediatorRegistrations()` when ready for zero-scanning startup).
3. **Adopt explicit mapping gradually:** Keep profile compatibility temporarily with `AstraFlow.Mapper.Conventions` (`AddAstraFlowConventionMapping`), migrate hot or complex paths to `[AstraGenerateMapping]` or `IDeclaredObjectMappingRule`, and replace in-query `Map` calls with `IProjection<,>` + `ProjectWith`.
4. **Verify SQL translation in tests:** Add `ValidateProjectionTranslations(registry)` from `AstraFlow.Mapper.EntityFrameworkCore` to catch client evaluation regressions early.

## Resolving Common Startup & Build Errors

| Symptom | Root Cause | Resolution |
| --- | --- | --- |
| Startup fails mentioning an unmapped type pair | No `IObjectMappingRule` accepted `(TSource, TDestination)` | Add an `IDeclaredObjectMappingRule`, annotate a `[AstraGenerateMapping]` partial method, or add a pair in `ConventionMappingProfile` |
| Startup error requiring `IDeclaredObjectMappingRule` | A registered `IObjectMappingRule` lacks `DeclaredMappings` while `RequireDeclaredMappingRules = true` | Implement `IDeclaredObjectMappingRule` and list every owned pair via `ObjectMappingPair.Create<TSrc, TDest>()` |
| Missing request handler error at startup | A concrete `IRequest` / `IRequest<TResponse>` exists in scanned assemblies without a handler | Implement `IRequestHandler<,>` in a non-abstract class or remove obsolete dead request types |
| Duplicate handler registration exception | Two classes implement `IRequestHandler<TRequest, TResponse>` for the same request | Keep strictly one handler per request contract; use `INotification` when fan-out to multiple subscribers is desired |
| Ambiguous projection error | Two unnamed `IProjection<TSource, TDestination>` classes exist for the same pair | Implement `INamedProjection<TSource, TDestination>` with distinct `Name` values |
| Sensitive member blocked by convention mapper | Destination or source property matches `password`, `token`, `secret`, `apikey`, etc. | Rename/omit the field or call `.AllowSensitiveMember(nameof(...))` explicitly inside `ConventionMappingProfile` |
| `MapAstraFlowDiagnostics` returns `404 Not Found` | Default safety policy blocks diagnostics outside `Development` | Test in `Development` or opt into `options.EnableDiagnosticsOutsideDevelopment = true` behind auth/network controls |

## Verifying Pipeline Behavior Ordering

If FluentValidation runs after a handler or telemetry misses publisher spans:

- Ensure `AddAstraFlowMediator(...)` runs before `AddAstraFlowFluentValidation()` and `AddAstraFlowOpenTelemetry()`.
- Verify `AddAstraFlowDiagnostics()` is registered last so its snapshot observes all prior service descriptors.
- Run `astraflow validate ./src` in CI to check static module consistency across projects.

## Related Guides

- Review architectural boundaries in [Modular Architecture](/docs/architecture).
- Check package compatibility in [Target Frameworks & Compatibility](/docs/compatibility).
- Inspect startup reports via [Startup Diagnostics](/docs/diagnostics).
