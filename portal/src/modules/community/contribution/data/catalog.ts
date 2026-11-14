import { GITHUB_LINKS, LATEST_PUBLISHED_VERSION } from '@core/config/site-config';
import type { ContributionPathway } from './model';

export function getContributionPathways(): ContributionPathway[] {
  return [
    {
      id: 'source-repo',
      number: '01',
      title: 'Explore the Monorepo Source',
      summary:
        'Browse the .NET package suite, source generators, Roslyn analyzers, and verification harnesses directly on GitHub.',
      detail: `Current stable AstraFlow packages target version ${LATEST_PUBLISHED_VERSION} with modular project boundaries.`,
      href: GITHUB_LINKS.repo,
      ctaLabel: 'Open GitHub Repository',
      isExternal: true,
      tags: ['Repository', 'MIT License', 'Source'],
    },
    {
      id: 'issue-tracker',
      number: '02',
      title: 'Report Bugs & Reproduction Cases',
      summary:
        'Open a targeted GitHub Issue with your AstraFlow package version, target framework, and minimal reproduction.',
      detail:
        'Include exception messages, compiler warnings, or mapping expression snippets so maintainers can reproduce quickly.',
      href: GITHUB_LINKS.issues,
      ctaLabel: 'Browse or File Issues',
      isExternal: true,
      tags: ['Issues', 'Bug Reports', 'Repros'],
    },
    {
      id: 'pull-requests',
      number: '03',
      title: 'Submit Focused Pull Requests',
      summary:
        'Contribute handler optimizations, analyzer rules, EF Core projection fixes, or package documentation updates.',
      detail:
        'Keep each PR scoped to the owning package, update tests and docs, and confirm solution builds stay warning-clean.',
      href: GITHUB_LINKS.pulls,
      ctaLabel: 'View Pull Requests',
      isExternal: true,
      tags: ['Pull Requests', 'Review', 'CI'],
    },
    {
      id: 'contributing-guide',
      number: '04',
      title: 'Contribution & Verification Checklist',
      summary:
        'Follow CONTRIBUTING.md conventions: build AstraFlow.slnx, run package and generator test suites, and verify XML docs.',
      detail:
        'Respect package boundaries (AstraFlow.Contracts stays dependency-free; Analyzers & Generators require PrivateAssets="all").',
      href: GITHUB_LINKS.contributing,
      ctaLabel: 'Read CONTRIBUTING.md',
      isExternal: true,
      tags: ['CONTRIBUTING.md', 'Test Matrix', 'Quality'],
    },
    {
      id: 'security-policy',
      number: '05',
      title: 'Coordinated Security Disclosures',
      summary:
        'Report redaction, serialization, source-generation, or endpoint vulnerabilities privately via GitHub Security Advisories.',
      detail:
        'Do not open public issues for sensitive security bugs. Target initial maintainer triage acknowledgement within 72 hours.',
      href: GITHUB_LINKS.security,
      ctaLabel: 'Read SECURITY.md',
      isExternal: true,
      tags: ['SECURITY.md', '72h Target', 'Advisories'],
    },
    {
      id: 'documentation-hub',
      number: '06',
      title: 'Product Documentation & Guides',
      summary:
        'Consult the developer documentation, package selection matrix, pipeline patterns, and upgrade notes before proposing API changes.',
      detail:
        'Every public API surface and compatibility baseline is documented in the AstraFlow documentation hub.',
      href: '/docs/getting-started',
      ctaLabel: 'Open Documentation Hub',
      isExternal: false,
      tags: ['Docs', 'Quick Start', 'Migration'],
    },
  ];
}

