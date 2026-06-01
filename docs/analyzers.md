# AstraFlow Analyzers

AstraFlow `1.8.0` introduces the `AstraFlow.Analyzers` package foundation.

This release intentionally ships the analyzer package structure, rule ID model, severity policy, documentation pattern, and test infrastructure before mediator, mapper, and projection rules expand in later `1.8.x` releases.

## Install

Use the analyzer package from application, library, or test projects where you want build-time AstraFlow guidance:

```powershell
dotnet add package AstraFlow.Analyzers --version 1.8.0
```

Analyzer packages should be referenced privately so they do not flow transitively to consumers:

```xml
<PackageReference Include="AstraFlow.Analyzers" Version="1.8.0" PrivateAssets="all" />
```

## Scope In 1.8.0

`1.8.0` is the foundation release. It includes:

- analyzer package structure,
- stable rule ID catalog,
- severity metadata,
- analyzer documentation pattern,
- analyzer test infrastructure,
- suppression guidance.

It does not include:

- mediator wiring rules,
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

## Roadmap

After `1.8.0`, the roadmap continues with:

- `1.8.1`: mediator analyzers,
- `1.8.2`: mapper and projection analyzers,
- `1.8.3`: generated registration foundation,
- `1.8.4`: generated mapping and projection metadata.
