import type { Metadata } from 'next';
import Link from 'next/link';
import { ContributionNetwork } from '@/components/community/ContributionNetwork';

export const metadata: Metadata = {
  title: 'Community & Ecosystem Governance — AstraFlow',
  description:
    'Contribute to AstraFlow through public source, reproducible issues, verified pull requests, and living documentation.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Community & Ecosystem Governance — AstraFlow',
    description:
      'Contribute to AstraFlow through public source, reproducible issues, verified pull requests, and living documentation.',
    url: '/community',
  },
};

const CONTRIBUTION_PROTOCOLS = [
  {
    step: '01',
    code: 'INTENT-01',
    title: 'Declare Intent & Read the Contract',
    summary: 'Read before proposing. Ground every issue or change in verifiable behavior.',
    details:
      'Inspect existing Architectural Decision Records (ADRs), API reference baselines, and test harnesses before opening a proposal. Clarity begins with understanding the existing contract.',
  },
  {
    step: '02',
    code: 'IMPACT-02',
    title: 'Explain Trade-offs & Allocations',
    summary: 'Every change comes with a cost. Quantify runtime allocations and framework reach.',
    details:
      'Document memory allocations, target framework compatibility (netstandard2.0, .NET 8, .NET 9, .NET 10), and design trade-offs. Never hide architectural compromises.',
  },
  {
    step: '03',
    code: 'VERIFY-03',
    title: 'Verify Baselines with Automated Tests',
    summary: 'Prove correctness using solution suites and API diff verification scripts.',
    details:
      'Execute `dotnet test` and run `scripts/verify-api-compatibility.ps1`. Zero breaking changes, binary drift, or security regressions are accepted without an RFC.',
  },
] as const;

const TRANSPARENCY_PILLARS = [
  {
    tag: 'SUPPLY CHAIN',
    code: 'SIGSTORE // SBOM',
    title: 'Reproducible Builds & Provenance',
    description:
      'Every package build generates an SPDX Software Bill of Materials and signs release artifacts via GitHub OIDC keyless Sigstore provenance.',
    linkText: 'Publishing & Verification Guide',
    href: '/docs/publishing',
    external: false,
  },
  {
    tag: 'DECISION LOGS',
    code: 'ADR-0001..DEC-14',
    title: 'Architectural Decision Records',
    description:
      'All architectural decisions—from compile-time Roslyn mappers to permanent API baseline drift verification—are published and archived in source.',
    linkText: 'Read Architectural Decisions',
    href: '/docs/architecture',
    external: false,
  },
  {
    tag: 'SECURITY POLICY',
    code: 'REDACTION // AUDIT',
    title: 'Private Vulnerability Disclosure',
    description:
      'Security-sensitive mapping, credential masking, and zero-leak diagnostics are governed by AstraFlow.Security with a dedicated disclosure policy.',
    linkText: 'Security Disclosure Policy',
    href: '/docs/security',
    external: false,
  },
] as const;

const PINNED_COMMIT_SHA = 'b163535864199bfb05cef62807d89509ac2239f8';

export default function CommunityPage() {
  return (
    <div data-page="community" className="community-page-wrapper">
      {/* Hero Section */}
      <section aria-labelledby="community-hero-title" className="hero community-hero-section">
        <div className="site-wrap">
          <div className="community-hero-header">
            <div className="eyebrow-container">
              <span className="eyebrow">OPEN ENGINEERING // ZERO PRIVATE GATES</span>
              <span className="provenance-pill mono-code">
                PINNED COMMIT: {PINNED_COMMIT_SHA.slice(0, 10)}
              </span>
            </div>

            <h1 id="community-hero-title" className="community-main-title">
              The work is public<span className="period-accent">.</span>
              <span className="italic-subtitle">So is the architecture.</span>
            </h1>

            <p className="community-lead-copy">
              AstraFlow is developed with deliberate transparency. Every architectural decision,
              benchmark result, and API baseline is tracked in source. Choose a technical channel to
              inspect, discuss, propose changes, or learn the internal mechanics.
            </p>

            <div className="community-hero-actions">
              <a
                className="button button-primary"
                href="https://github.com/seifmoustafa/AstraFlow"
                target="_blank"
                rel="noopener noreferrer"
              >
                Explore GitHub Repository <span aria-hidden="true">↗</span>
              </a>
              <a
                className="button button-outline"
                href="https://github.com/seifmoustafa/AstraFlow/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Open Issues & Discussions <span aria-hidden="true">↗</span>
              </a>
            </div>

            <p className="community-notice-note mono-code">
              NO DISCORD PAYWALL. NO FABRICATED COMMUNITY STATS. THE SOURCE IS THE TRUTH.
            </p>
          </div>

          {/* Bespoke Interactive Contribution Circuit */}
          <ContributionNetwork />
        </div>
      </section>

      {/* Contribution Protocols Section */}
      <section aria-labelledby="protocols-heading" className="editorial-panel protocols-section">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">ENGINEERING GOVERNANCE PROTOCOLS</p>
              <h2 id="protocols-heading">
                Good ideas
                <br />
                <span className="ital signal">leave a verifiable trail.</span>
              </h2>
            </div>
            <p className="section-caption">
              Contributions are evaluated by architectural evidence, backward compatibility, and test
              proof—never seniority or persuasion.
            </p>
          </div>

          <div className="protocols-grid">
            {CONTRIBUTION_PROTOCOLS.map((proto) => (
              <div key={proto.step} className="protocol-card">
                <div className="protocol-card-head">
                  <span className="protocol-step-num mono-code">{proto.step}</span>
                  <span className="protocol-step-code mono-code">{proto.code}</span>
                </div>
                <h3 className="protocol-title">{proto.title}</h3>
                <p className="protocol-summary">{proto.summary}</p>
                <div className="protocol-details-box">
                  <p className="protocol-details-text">{proto.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Public Provenance & Transparency Section */}
      <section aria-labelledby="provenance-heading" className="editorial-panel provenance-section">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">PUBLIC INTEGRITY & PROVENANCE</p>
              <h2 id="provenance-heading">
                Engineering truth<span className="period-accent">.</span>
                <br />
                <span className="ital signal">Zero synthetic claims.</span>
              </h2>
            </div>
            <p className="section-caption">
              No simulated stars, invented Discord members, or automated marketing testimonials. Every claim links to committed repository evidence.
            </p>
          </div>

          <div className="transparency-grid">
            {TRANSPARENCY_PILLARS.map((pillar) => (
              <div key={pillar.tag} className="transparency-card">
                <div className="transparency-header">
                  <span className="transparency-tag mono-code">{pillar.tag}</span>
                  <span className="transparency-code mono-code">{pillar.code}</span>
                </div>
                <h3 className="transparency-title">{pillar.title}</h3>
                <p className="transparency-desc">{pillar.description}</p>
                <div className="transparency-footer">
                  {pillar.external ? (
                    <a
                      href={pillar.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="transparency-link"
                    >
                      {pillar.linkText} <span aria-hidden="true">↗</span>
                    </a>
                  ) : (
                    <Link href={pillar.href} className="transparency-link">
                      {pillar.linkText} <span aria-hidden="true">↗</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Solution Metadata Proof Bar */}
          <div className="provenance-proof-bar">
            <div className="proof-bar-left">
              <span className="proof-indicator" aria-hidden="true" />
              <span className="mono-code text-xs">
                VERIFIED COMMIT SHA: <code className="sha-text">{PINNED_COMMIT_SHA}</code>
              </span>
            </div>
            <div className="proof-bar-right mono-code text-xs">
              <span>TARGET FRAMEWORKS: netstandard2.0 · .NET 8 · .NET 9 · .NET 10</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
