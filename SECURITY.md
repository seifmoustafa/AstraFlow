# Security Policy

AstraFlow is designed for explicit behavior, predictable failure modes, and safe defaults.

## Reporting

Use GitHub's **Security → Advisories → Report a vulnerability** private reporting flow when enabled. A repository owner must enable private vulnerability reporting in repository settings. If it is not enabled, contact the maintainer privately through the repository owner's contact channel and ask for a secure reporting method before sharing sensitive details. See [security and supply-chain guidance](docs/security-and-supply-chain.md).

Do not create a public issue for sensitive security details.

## Supported Versions

| Version | Availability and security status |
| --- | --- |
| 2.0.0 | Verified NuGet baseline; security fixes are assessed for this line |
| 2.1.0 | Source and GitHub Release exist; NuGet publication is unverified |
| 2.2.0 | In development; not released |

## Security Design

- Mapping is explicit by default.
- Secure ID cryptography is application-owned through `ISecureIdCodec`.
- Pipeline behaviors are registered by the application, so security-sensitive order can be enforced by the consuming system.
- Notifications have configurable failure policies so production systems can choose fail-fast, continue, or aggregate behavior intentionally.
- Package publishing is gated through GitHub Actions.
- Release artifacts are intended to include SBOMs, OIDC attestations, and verifiable SourceLink data; these controls are not considered active until their release workflow gates pass.
- NuGet API keys, when used, must be scoped, rotated, and stored only as repository secrets.

## Secret Handling

- Never commit API keys, tokens, certificates, passwords, or signing keys.
- Never paste secrets into documentation, issue comments, pull requests, screenshots, or chat.
- Revoke any exposed secret immediately.
- Prefer Trusted Publishing over long-lived package API keys whenever available.

## Disclosure Target

The maintainer aims to acknowledge vulnerability reports within 72 hours of receipt.
