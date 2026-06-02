# AstraFlow Analyzers

AstraFlow `1.8.0` introduced the `AstraFlow.Analyzers` package foundation. AstraFlow `1.8.1` added mediator analyzer rules. AstraFlow `1.8.2` added mapper and projection analyzer rules on top of that foundation.

The analyzer package remains source-only and code-fix-free. Source generator work lives in the separate `AstraFlow.Generators` package starting in `1.8.3`.

## Install

Use the analyzer package from application, library, or test projects where you want build-time AstraFlow guidance:

```powershell
dotnet add package AstraFlow.Analyzers --version 1.9.0
```

Analyzer packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="1.9.0" PrivateAssets="all" />
```

## Scope In 1.8.2

`1.8.2` includes:

- the analyzer package foundation from `1.8.0`,
- mediator request handler coverage warnings,
- duplicate request handler warnings,
- ambiguous request contract warnings,
- stream request handler coverage warnings,
- singleton handler lifetime warnings,
- undeclared mapping rule warnings,
- reverse mapping sensitive-write warnings,
- raw public ID projection warnings,
- mapper-call-inside-query warnings,
- custom projection method warnings,
- complex projection capture warnings,
- suppression guidance.

It does not include:

- source generators,
- code fixes,
- automatic rewrites.

## Rule ID Policy

AstraFlow analyzer diagnostics use the `AFAN` prefix.

Rules are stable once published. A rule ID should not be reused for a different meaning, category, or severity policy.

| Range | Intended Use |
| --- | --- |
| `AFAN0001-AFAN0099` | Analyzer infrastructure and package-level rules. |
| `AFAN0100-AFAN0199` | Mediator and request-flow rules. |
| `AFAN0200-AFAN0299` | Mapper and convention-mapping rules. |
| `AFAN0300-AFAN0399` | Projection and query-expression rules. |
| `AFAN0400-AFAN0499` | Security, sensitive data, and raw public ID rules. |

## Severity Policy

Analyzer rules use the same conservative posture as runtime diagnostics:

| Severity | Use For |
| --- | --- |
| `Info` | Guidance, discovery, or package infrastructure checks. |
| `Warning` | Likely correctness, maintainability, or security risks. |
| `Error` | High-confidence invalid AstraFlow usage that should fail builds. |

Security-sensitive analyzer rules may start as warnings when false-positive risk is still being measured. They should not become errors until the behavior is precise and documented.

## Suppression Guidance

Prefer fixing the source issue before suppressing an analyzer diagnostic.

When suppression is necessary:

- suppress the smallest possible scope,
- include a reason in code review or repository documentation,
- avoid suppressing security-sensitive rules globally,
- revisit suppressions during version upgrades.

Example:

```csharp
#pragma warning disable AFAN0001 // Infrastructure marker only; no source diagnostic is expected.
#pragma warning restore AFAN0001
```

Project-level suppression is acceptable only when a team has reviewed the rule and documented why it does not apply:

```xml
<NoWarn>$(NoWarn);AFAN0001</NoWarn>
```

## Rule Documentation Template

Each future rule should include:

- rule ID,
- title,
- category,
- default severity,
- whether it is enabled by default,
- why the diagnostic exists,
- examples that trigger it,
- examples that do not trigger it,
- recommended fix,
- suppression guidance,
- known static-analysis limits.

## Current Rules

### AFAN0001

| Field | Value |
| --- | --- |
| Title | AstraFlow analyzer package loaded |
| Category | `AstraFlow.Infrastructure` |
| Default severity | `Info` |
| Enabled by default | No |

`AFAN0001` is an infrastructure marker descriptor. It exists so the package can prove analyzer descriptor loading, rule catalog stability, documentation links, and test infrastructure before feature rules are added.

It is not reported for user source code.

### AFAN0101

| Field | Value |
| --- | --- |
| Title | Request has no handler |
| Category | `AstraFlow.Mediator` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0101` reports a concrete `IRequest` or `IRequest<TResponse>` implementation when the current compilation does not contain a matching `IRequestHandler<TRequest>` or `IRequestHandler<TRequest, TResponse>` implementation.

Recommended fix: add the missing handler, move the handler into the project being compiled, or suppress the diagnostic if the handler is intentionally supplied by another assembly.

### AFAN0102

| Field | Value |
| --- | --- |
| Title | Request has duplicate handlers |
| Category | `AstraFlow.Mediator` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0102` reports when the current compilation contains more than one concrete handler implementation for the same closed request handler contract.

Recommended fix: keep one handler for the request contract or split the request contracts so each handler owns a distinct request type.

### AFAN0103

| Field | Value |
| --- | --- |
| Title | Request has ambiguous contracts |
| Category | `AstraFlow.Mediator` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0103` reports a concrete request type that implements more than one request contract, such as multiple `IRequest<TResponse>` contracts or a mix of void and response request contracts.

Recommended fix: model one request type per response shape.

### AFAN0104

| Field | Value |
| --- | --- |
| Title | Stream request has no handler |
| Category | `AstraFlow.Mediator` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0104` reports a concrete `IStreamRequest<TResponse>` implementation when the current compilation does not contain a matching `IStreamRequestHandler<TRequest, TResponse>` implementation.

Recommended fix: add the missing stream handler, move it into the project being compiled, or suppress the diagnostic if the handler is intentionally supplied by another assembly.

### AFAN0105

| Field | Value |
| --- | --- |
| Title | Handler registered as singleton |
| Category | `AstraFlow.Mediator` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0105` reports `AddSingleton` registrations that include a concrete AstraFlow request or stream handler implementation.

Recommended fix: prefer scoped or transient handler registration unless the handler has been reviewed as stateless and singleton-safe.

### AFAN0201

| Field | Value |
| --- | --- |
| Title | Mapping rule is undeclared |
| Category | `AstraFlow.Mapper` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0201` reports a concrete `IObjectMappingRule` implementation that does not also implement `IDeclaredObjectMappingRule`.

Recommended fix: implement `IDeclaredObjectMappingRule` and expose the owned `ObjectMappingPair` values so startup validation, diagnostics, tests, and future tooling can compare declared and implemented mapping behavior.

### AFAN0202

| Field | Value |
| --- | --- |
| Title | Reverse mapping may write sensitive members |
| Category | `AstraFlow.Mapper` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0202` reports convention `ReverseMap` calls when the reverse destination type contains password, token, key, credential, or secret-style members.

Recommended fix: avoid reverse mapping into sensitive domain or persistence types, ignore sensitive members explicitly, or replace the reverse map with a reviewed update mapping path.

### AFAN0301

| Field | Value |
| --- | --- |
| Title | Projection exposes raw public ID |
| Category | `AstraFlow.Projection` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0301` reports an `IProjection<TSource, TDestination>` whose destination type exposes `Guid` members ending with `PublicId`.

Recommended fix: project safe DTO identifiers, encode public IDs after materialization, or document why raw public IDs are acceptable for that DTO.

### AFAN0302

| Field | Value |
| --- | --- |
| Title | Mapper call is inside query expression |
| Category | `AstraFlow.Projection` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0302` reports `IMapper.Map` calls inside `IQueryable` lambdas or projection expressions.

Recommended fix: use explicit provider-visible projection expressions instead of runtime object mapping inside the query.

### AFAN0303

| Field | Value |
| --- | --- |
| Title | Projection calls custom method |
| Category | `AstraFlow.Projection` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0303` reports custom user methods called inside projection expressions.

Recommended fix: keep the projection expression provider-translatable, validate with the target EF provider, or move custom transformation after materialization.

### AFAN0304

| Field | Value |
| --- | --- |
| Title | Projection captures complex value |
| Category | `AstraFlow.Projection` |
| Default severity | `Warning` |
| Enabled by default | Yes |

`AFAN0304` reports non-scalar instance fields captured inside projection expressions.

Recommended fix: capture scalar values only, pass explicit projection parameter objects, or perform complex logic after materialization.

## Static Analysis Limits

`AFAN0301-AFAN0304` are early build-time warnings. They do not replace runtime projection validation, EF Core provider validation, provider matrix tests, or application-specific security review.

Treat these rules as fast feedback for common risky shapes:

- they do not prove an expression is provider-translatable,
- they do not inspect every possible runtime mapping path,
- they intentionally prefer documented warnings over automatic rewrites.

## Roadmap

After `1.9.0`, the roadmap continues with:

- `1.10.0`: CLI, migration acceleration, diagnostics diffing, and graph output.
- `1.11.0`: ASP.NET Core and FluentValidation integrations.
