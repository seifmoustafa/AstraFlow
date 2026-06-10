# Security Governance

`AstraFlow.Security` is the v2 foundation package for shared secure DTO governance and redaction policy.

Install:

```powershell
dotnet add package AstraFlow.Security --version 2.0.0
```

## What It Owns

`AstraFlow.Security` owns shared, framework-neutral policy primitives:

- `AstraFlowSensitiveDataPolicy` classifies member, parameter, diagnostic field, and telemetry tag names.
- `AstraFlowRedactionPolicy` redacts values when the associated name is sensitive.
- Default sensitive fragments include password, secret, token, API key, access key, private key, secret key, credential, connection string, hash, salt, and recovery code shapes.

The package does not own encryption, key management, authentication, authorization, or secret storage. Applications still own those decisions.

## Redaction

```csharp
using AstraFlow.Security;

var policy = new AstraFlowRedactionPolicy();

var safe = policy.RedactValue("DisplayName", "Admin");
var hidden = policy.RedactValue("AccessToken", "secret-value");
```

`safe` remains `Admin`. `hidden` becomes `[redacted]`.

Custom taxonomies are supported when an application has stricter naming rules:

```csharp
var policy = new AstraFlowRedactionPolicy(
    new AstraFlowSensitiveDataPolicy(["internal", "tenantsecret"]),
    "<hidden>");
```

## Current Integrations

`AstraFlow.OpenTelemetry` uses the shared redaction policy in `AstraFlowDefaultTelemetryRedactor`.

`AstraFlow.Mapper.Conventions` uses the shared sensitive-name taxonomy for convention mapping's default sensitive-member safeguards.

## Threat Model

Primary risks this package is designed to reduce:

- accidental emission of secrets through telemetry tags,
- accidental convention mapping of secret-shaped members,
- inconsistent sensitive-name rules across diagnostics, CLI, observability, analyzers, and integrations,
- future analyzer/generator drift where each package invents a different security taxonomy.

Non-goals:

- no payload logging is introduced,
- no runtime license checks are introduced,
- no application cryptography is provided,
- no secret values are stored,
- no convention mapping is enabled by default.

## v2 Roadmap Fit

This package is the first v2 foundation slice. Future v2 work can build analyzer rules, suppression policy, secure DTO enforcement, diagnostics reports, CLI reports, and generated metadata on the same shared taxonomy.
