# AstraFlow Analyzers

AstraFlow `1.8.0` introduced the `AstraFlow.Analyzers` package foundation. AstraFlow `1.8.1` adds the first mediator analyzer rules on top of that foundation.

This release intentionally keeps the analyzer package source-only, generator-free, and code-fix-free while adding build-time warnings for common mediator wiring risks.

## Install

Use the analyzer package from application, library, or test projects where you want build-time AstraFlow guidance:

```powershell
dotnet add package AstraFlow.Analyzers --version 1.8.1
```

Analyzer packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="1.8.1" PrivateAssets="all" />
```

## Scope In 1.8.1

`1.8.1` includes:

- the analyzer package foundation from `1.8.0`,
- mediator request handler coverage warnings,
- duplicate request handler warnings,
- ambiguous request contract warnings,
- stream request handler coverage warnings,
- singleton handler lifetime warnings,
- suppression guidance.

It does not include:

- mapper or projection rules,
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

## Roadmap

After `1.8.1`, the roadmap continues with:

- `1.8.2`: mapper and projection analyzers,
- `1.8.3`: generated registration foundation,
- `1.8.4`: generated mapping and projection metadata.
