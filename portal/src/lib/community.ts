import { readRepoText } from './repo-paths';
import {
  GITHUB_LINKS,
  LATEST_PUBLISHED_VERSION,
  UNRELEASED_SOURCE_VERSION,
} from './site-config';

export interface ContributionPathway {
  id: string;
  number: string;
  title: string;
  summary: string;
  detail: string;
  href: string;
  ctaLabel: string;
  isExternal: boolean;
  tags: string[];
}

export interface CommunityGovernance {
  repoScope: string;
  buildTestCommands: string[];
  prChecklist: string[];
  securityDisclosureEmail: string | null;
  securitySlaHours: string;
  securityScopes: string[];
  supportChannels: { title: string; detail: string; href: string; isExternal: boolean }[];
  codeOfConductSummary: string;
  buyMeACoffeeUrl: string;
  pathways: ContributionPathway[];
}

function extractBulletsUnderHeading(markdown: string, headingText: string): string[] {
  const lines = markdown.split('\n');
  const escaped = headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const startRegex = new RegExp(`^##+\\s+${escaped}\\s*$`, 'i');

  let inside = false;
  const bullets: string[] = [];

  for (const line of lines) {
    if (startRegex.test(line.trim())) {
      inside = true;
      continue;
    }
    if (inside && /^##+\s+/.test(line.trim())) {
      break;
    }
    if (inside) {
      const match = line.match(/^\s*(?:-\s+\[[ xX]\]\s+|-|\d+\.)\s+(.*)$/);
      if (match) {
        bullets.push(
          match[1]
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .trim()
        );
      }
    }
  }

  return bullets;
}

function extractCodeBlockCommands(markdown: string): string[] {
  const match = markdown.match(/```(?:powershell|bash|sh)?\n([\s\S]*?)```/);
  if (!match) {
    return [];
  }
  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

let cachedGovernance: CommunityGovernance | null = null;

export function getContributionPathways(): ContributionPathway[] {
  return [
    {
      id: 'source-repo',
      number: '01',
      title: 'Explore the Monorepo & Roadmap',
      summary:
        'Browse all 16 .NET packages, source generators, analyzers, and the 2.4.0 development branch directly on GitHub.',
      detail: `Stable NuGet releases target ${LATEST_PUBLISHED_VERSION}; active source development tracks ${UNRELEASED_SOURCE_VERSION}.`,
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
        'Include exception messages, analyzer diagnostic codes, or mapping expression snippets so maintainers can reproduce fast.',
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
      title: 'Architecture Docs, ADRs & Upgrade Guides',
      summary:
        'Consult the repository docs archive, architecture decision records, benchmarks, and 2.3.0 upgrade notes before proposing API changes.',
      detail:
        'Every public API surface and compatibility decision is documented alongside the source in docs/.',
      href: '/docs/getting-started',
      ctaLabel: 'Open Documentation Hub',
      isExternal: false,
      tags: ['Docs', 'ADRs', 'Upgrade Guide'],
    },
  ];
}

export function getCommunityGovernance(): CommunityGovernance {
  if (cachedGovernance) {
    return cachedGovernance;
  }

  const contributing = readRepoText('CONTRIBUTING.md');
  const security = readRepoText('SECURITY.md');
  const support = readRepoText('SUPPORT.md');
  const codeOfConduct = readRepoText('CODE_OF_CONDUCT.md');

  const commands = extractCodeBlockCommands(contributing);
  const prChecklist = extractBulletsUnderHeading(contributing, 'Pull Request Checklist');

  const slaMatch = security.match(/(\d+\s*hours)/i);
  const securityScopes = extractBulletsUnderHeading(security, 'Scope');
  const emailMatch = security.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

  const conductParagraph = codeOfConduct
    .split('\n')
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .slice(0, 3)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  const coffeeMatch = support.match(/https:\/\/buymeacoffee\.com\/[a-zA-Z0-9_-]+/);

  cachedGovernance = {
    repoScope:
      'AstraFlow welcomes focused issues, reproduction cases, benchmarks, and pull requests verified against AstraFlow.slnx.',
    buildTestCommands:
      commands.length > 0
        ? commands
        : [
            'dotnet restore AstraFlow.slnx',
            'dotnet build AstraFlow.slnx -c Release --no-restore',
            'dotnet test AstraFlow.slnx -c Release --no-build',
          ],
    prChecklist:
      prChecklist.length > 0
        ? prChecklist
        : [
            'Changes are scoped cleanly to a bug fix, feature, or documentation update',
            'Tests cover new or changed behavior',
            'Relevant docs and XML comments are updated',
            'Solution builds cleanly with no unintended warnings or breaking API changes',
          ],
    securityDisclosureEmail: emailMatch ? emailMatch[0] : null,
    securitySlaHours: slaMatch ? slaMatch[1] : '72 hours',
    securityScopes:
      securityScopes.length > 0
        ? securityScopes
        : [
            'Mediator dispatch and DI registration behavior',
            'Mapper expression compilation and EF Core query translation',
            'Roslyn source generators and analyzers',
            'Security redaction, encryption helpers, diagnostics logging, and ASP.NET Core ProblemDetails output',
          ],
    supportChannels: [
      {
        title: 'Repository Documentation',
        detail: 'Getting started, compatibility matrix, upgrade guide, and ADRs in docs/.',
        href: '/docs/overview',
        isExternal: false,
      },
      {
        title: 'GitHub Issues',
        detail: 'Bug reports, feature proposals, and reproducible usage questions.',
        href: GITHUB_LINKS.issues,
        isExternal: true,
      },
      {
        title: 'GitHub Security Advisories',
        detail: 'Private reporting path for security-sensitive vulnerabilities.',
        href: GITHUB_LINKS.advisories,
        isExternal: true,
      },
      {
        title: 'Support Policy (SUPPORT.md)',
        detail: 'Guidance on bug reports, documentation paths, and optional sponsorship.',
        href: GITHUB_LINKS.support,
        isExternal: true,
      },
    ],
    codeOfConductSummary:
      conductParagraph ||
      'Be respectful, constructive, and welcoming across issues, pull requests, and reviews.',
    buyMeACoffeeUrl: coffeeMatch ? coffeeMatch[0] : GITHUB_LINKS.buyMeACoffee,
    pathways: getContributionPathways(),
  };

  return cachedGovernance;
}
