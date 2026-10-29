# C# and public API rules

- Match the nearest established implementation and test style. Keep changes small and make control flow, validation, and failure behavior explicit.
- Preserve nullable reference type annotations and cancellation-token propagation. Do not swallow exceptions or change exception behavior without a documented contract and tests.
- Consider all target frameworks declared by the affected package. Avoid APIs unavailable on a supported target unless guarded or otherwise handled consistently with existing patterns.
- Treat shipped APIs, analyzer diagnostic IDs, generated metadata contracts, CLI output, and serialized report shapes as compatibility-sensitive.
- Prefer additive public API changes. Update XML documentation and relevant user-facing docs, and use `scripts/verify-api-compatibility.ps1` when public API compatibility is in scope.
- Keep diagnostics and telemetry free of request/notification payload values and sensitive data by default. Preserve redaction and opt-in boundaries documented in `docs/security.md`, `docs/observability.md`, and endpoint safety guidance.
- Do not copy implementation into an integration package when a small public contract or existing extension point is the intended boundary.

