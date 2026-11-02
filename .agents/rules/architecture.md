# Architecture and package boundaries

- Each distributable package is an independent project under `src/`. Keep implementation in the package that owns the behavior and add cross-package references only when the public dependency graph justifies them.
- `AstraFlow.Contracts` owns shared abstractions and contracts. Core runtime packages should not acquire optional integration dependencies such as EF Core, ASP.NET Core, FluentValidation, or OpenTelemetry just for convenience.
- Keep optional integrations isolated in their corresponding packages, including `AstraFlow.AspNetCore`, `AstraFlow.Mapper.EntityFrameworkCore`, `AstraFlow.FluentValidation`, and `AstraFlow.OpenTelemetry`.
- Keep analyzers and source generators in their compiler-facing projects and preserve their analyzer asset packaging conventions.
- Add or change tests in the matching `tests/` project. Add sample changes only when they demonstrate or validate a user-facing integration.
- Before changing references or package ownership, inspect the affected project files, `Directory.Build.props`, and the dependency graph. Preserve the existing target-framework matrix and explain any intentional change.
- Do not collapse package boundaries or introduce an application-specific architecture into this reusable library suite.
- Use `docs/package-selection.md` for package responsibilities and dependency choices, then confirm ownership in the current `.csproj` references and source. Documentation and project names can lag implementation.
- Keep explicit mapping and mediator runtime behavior as the baseline. Conventions and framework/provider integrations stay opt-in and in their owning packages.
- Distinguish current source, tested behavior, packed consumer behavior, published versions, roadmap proposals, and research ideas. A branch implementation is not automatically a released or supported capability; a roadmap entry is not an implementation.
- Treat `docs/strategy/north-star.md`, `docs/engineering-blueprint.md`, `docs/roadmap.md`, `docs/future-ideas.md`, ADRs, plans, and evidence records as different decision stages. Follow the status and evidence recorded there; do not promote an idea or ambition into a product promise.
- For architectural or roadmap decisions, record durable choices and reopen conditions in `docs/strategy/decision-log.md` or an appropriately scoped `docs/adr/` document, and update the roadmap only when the decision changes its status.

