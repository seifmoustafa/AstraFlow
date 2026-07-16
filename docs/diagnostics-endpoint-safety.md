# Diagnostics Endpoint Safety

AstraFlow diagnostics are designed to be useful without exposing payloads. `AstraFlow.AspNetCore` keeps the HTTP diagnostics endpoint redacted and development-only by default.

## Defaults

- `MapAstraFlowDiagnostics()` is available only in `Development`.
- Production returns `404 Not Found` unless explicitly enabled.
- The HTTP response includes aggregate counts by default.
- Finding details are omitted unless `IncludeDiagnosticsFindings` is enabled.
- Request payloads, DTO payloads, secrets, tokens, and connection strings are never logged by default.

## Production Opt-In

Only enable production diagnostics behind your normal operational controls:

```csharp
builder.Services.AddAstraFlowAspNetCore(options =>
{
    options.EnableDiagnosticsOutsideDevelopment = true;
    options.IncludeDiagnosticsFindings = true;
});

app.MapAstraFlowDiagnostics();
```

Use authentication, authorization, network restrictions, and audit logging around the route when it is exposed outside development.

## Health Summary

`MapAstraFlowHealthSummary()` exposes aggregate health only. It is safer than the full diagnostics endpoint for routine probes because it does not include registration or finding details.

```csharp
app.MapAstraFlowHealthSummary();
```

The status is `Healthy` when diagnostics contain no error or fatal findings, otherwise `Unhealthy`.

