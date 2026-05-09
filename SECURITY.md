# Security Policy

AstraFlow is designed for explicit behavior, predictable failure modes, and safe defaults.

## Reporting

Report suspected vulnerabilities privately through the repository security advisory flow after the package is moved to its public repository. Until then, report privately to the repository owner.

Do not create a public issue for sensitive security details.

## Supported Versions

| Version | Support |
| --- | --- |
| 1.x | Supported after first public release |

## Security Design

- Mapping is explicit by default.
- Secure ID cryptography is application-owned through `ISecureIdCodec`.
- Pipeline behaviors are registered by the application, so security-sensitive order can be enforced by the consuming system.
- Notifications have configurable failure policies so production systems can choose fail-fast, continue, or aggregate behavior intentionally.
- Package publishing is gated through GitHub Actions.
- NuGet API keys, when used, must be scoped, rotated, and stored only as repository secrets.

## Secret Handling

- Never commit API keys, tokens, certificates, passwords, or signing keys.
- Never paste secrets into documentation, issue comments, pull requests, screenshots, or chat.
- Revoke any exposed secret immediately.
- Prefer Trusted Publishing over long-lived package API keys whenever available.

## Disclosure Target

The target response time for confirmed reports is 72 hours after the public repository is active.
