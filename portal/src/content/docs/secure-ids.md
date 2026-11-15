# Secure Identifiers & Sensitive Data Policies

Protect internal primary keys and sensitive members across API boundaries using `ISecureIdCodec`, `SecureIdMapper`, and `AstraFlow.Security` redaction policies.

## Installation

`ISecureIdCodec` and `SecureIdMapper` ship in `AstraFlow.Mapper`; sensitive-name classification and redaction policies live in zero-dependency `AstraFlow.Security`:

```bash
dotnet add package AstraFlow.Mapper
dotnet add package AstraFlow.Security
```

## Opaque Transit IDs with `ISecureIdCodec`

Implement `ISecureIdCodec` in your infrastructure layer (using ASP.NET Core Data Protection, HMAC-authenticated tokens, or symmetric encryption) so `Guid` primary keys never appear verbatim in public URLs or API responses:

```csharp
using AstraFlow.Mapper;
using Microsoft.AspNetCore.DataProtection;

public sealed class DataProtectionSecureIdCodec(IDataProtectionProvider provider) : ISecureIdCodec
{
    private readonly IDataProtector _protector = provider.CreateProtector("AstraFlow.SecureIds.v1");

    public string Encrypt(Guid id) => _protector.Protect(id.ToString("N"));

    public Guid? TryDecrypt(string? encryptedId)
    {
        if (string.IsNullOrWhiteSpace(encryptedId))
            return null;

        try
        {
            var raw = _protector.Unprotect(encryptedId);
            return Guid.TryParseExact(raw, "N", out var id) ? id : null;
        }
        catch
        {
            return null;
        }
    }
}
```

Register your `ISecureIdCodec` implementation in DI and inject `SecureIdMapper` (registered automatically by `AddAstraFlowMapper`) inside mapping rules:

```csharp
builder.Services.AddSingleton<ISecureIdCodec, DataProtectionSecureIdCodec>();

// Inside an IDeclaredObjectMappingRule:
string publicId = secureIdMapper.Encrypt(entity.Id);
string? optionalParentId = secureIdMapper.Encrypt(entity.ParentId);
Guid? resolvedId = secureIdMapper.TryDecrypt(request.PublicId);
```

For fast deterministic unit tests without Data Protection setup, use `TestSecureIdCodec` from [AstraFlow.Testing](/docs/testing).

## Sensitive Member Classification (`AstraFlow.Security`)

`AstraFlowSensitiveDataPolicy` defines canonical name fragments (`password`, `secret`, `token`, `apikey`, `accesskey`, `privatekey`, `secretkey`, `credential`, `connectionstring`, `hash`, `salt`, `recoverycode`) normalized across underscores, hyphens, dots, and whitespace:

```csharp
using AstraFlow.Security;

var policy = new AstraFlowSensitiveDataPolicy();
bool sensitive = policy.IsSensitiveName("Stripe_ApiKey"); // true

var redactor = new AstraFlowRedactionPolicy(policy);
string safeValue = redactor.RedactValue("ClientSecret", rawSecret); // "[redacted]"
```

## Built-In Protection Across the Suite

- **Analyzers:** Warn whenever `IProjection<,>` destinations expose raw `Guid` `PublicId`-style properties or convention `ReverseMap` writes to sensitive members.
- **Convention Mapping:** Blocks sensitive fields unless explicitly authorized via `.AllowSensitiveMember(...)`.
- **OpenTelemetry:** Uses `AstraFlow.Security` in `AstraFlowDefaultTelemetryRedactor` to redact sensitive attribute/tag values cleanly.

## Related Guides

- Configure convention guardrails in [Opt-In Convention Mapping](/docs/convention-mapping).
- Enable compile-time raw ID projection checks in [Build-Time Roslyn Analyzers](/docs/analyzers).
- Redact telemetry spans in [OpenTelemetry Observability](/docs/opentelemetry).
