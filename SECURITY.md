# Security Policy

AstraFlow is designed for explicit behavior and predictable failure modes.

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

## Disclosure Target

The target response time for confirmed reports is 72 hours after the public repository is active.
