import fs from 'fs';
import path from 'path';
import { PINNED_COMMIT_SHA, type ProvenanceNotice } from './provenance';
import type { DocItem, DocCategory, DocPageData } from './docs-types';

export { PINNED_COMMIT_SHA, type ProvenanceNotice };
export type { DocItem, DocCategory, DocPageData };

// Complete 61-document canonical repository registry
export const DOC_CATEGORIES: {
  title: string;
  slug: string;
  files: {
    filename: string;
    title: string;
    slug: string;
    versionNotice?: ProvenanceNotice;
  }[];
}[] = [
  {
    title: 'Getting Started & Strategy',
    slug: 'getting-started',
    files: [
      { filename: 'getting-started.md', title: 'Getting Started', slug: 'getting-started', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'package-selection.md', title: 'Package Selection Guide', slug: 'package-selection', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'architecture.md', title: 'Architectural Philosophy', slug: 'architecture', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'engineering-blueprint.md', title: 'Engineering Blueprint', slug: 'engineering-blueprint', versionNotice: 'Governance / Policy' },
      { filename: 'roadmap.md', title: 'Roadmap & Trajectory', slug: 'roadmap', versionNotice: 'Unreleased · 2.4 Work in progress' },
      { filename: 'compatibility.md', title: 'Compatibility Matrix', slug: 'compatibility', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'troubleshooting.md', title: 'Troubleshooting & FAQ', slug: 'troubleshooting', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'branding.md', title: 'Brand & Visual System', slug: 'branding', versionNotice: 'Governance / Policy' },
    ],
  },
  {
    title: 'Core Packages',
    slug: 'core-packages',
    files: [
      { filename: 'mediator.md', title: 'Mediator Core', slug: 'mediator', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'mediator-scenarios.md', title: 'Mediator Scenarios & Patterns', slug: 'mediator-scenarios', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'mapper.md', title: 'Mapper Core', slug: 'mapper', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'mapper-scenarios.md', title: 'Mapper Scenarios & Value Converters', slug: 'mapper-scenarios', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'convention-mapping.md', title: 'Convention-Based Mapping', slug: 'convention-mapping', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'projections.md', title: 'Projections & Queryable Extensions', slug: 'projections', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'projection-scenarios.md', title: 'Projection Scenarios', slug: 'projection-scenarios', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'entity-framework-core.md', title: 'Entity Framework Core Integration', slug: 'entity-framework-core', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'assertions.md', title: 'Runner-Neutral Assertions (2.4 WIP)', slug: 'assertions', versionNotice: 'Unreleased · 2.4 Work in progress' },
    ],
  },
  {
    title: 'Compiler & Tooling',
    slug: 'compiler-tooling',
    files: [
      { filename: 'generators.md', title: 'Roslyn Source Generators', slug: 'generators', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'analyzers.md', title: 'Diagnostic Analyzers (AFM & AFD)', slug: 'analyzers', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'cli.md', title: 'AstraFlow CLI & Visual Graph Export', slug: 'cli', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'testing.md', title: 'Testing Harness & Pipeline Mocks', slug: 'testing', versionNotice: 'Source milestone · Verify per package' },
    ],
  },
  {
    title: 'Enterprise & Operations',
    slug: 'enterprise-ops',
    files: [
      { filename: 'aspnetcore.md', title: 'ASP.NET Core Endpoint Dispatch', slug: 'aspnetcore', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'fluentvalidation.md', title: 'FluentValidation Pipeline Integration', slug: 'fluentvalidation', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'diagnostics.md', title: 'Diagnostics & Metrics Telemetry', slug: 'diagnostics', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'diagnostics-endpoint-safety.md', title: 'Endpoint Diagnostics Safety', slug: 'diagnostics-endpoint-safety', versionNotice: 'Governance / Policy' },
      { filename: 'observability.md', title: 'OpenTelemetry Distributed Tracing', slug: 'observability', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'security.md', title: 'Security Redaction & Secret Taxonomy', slug: 'security', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'security-and-supply-chain.md', title: 'Security & Supply Chain Hardening', slug: 'security-and-supply-chain', versionNotice: 'Umbrella verified in supplied evidence' },
    ],
  },
  {
    title: 'Governance & Releases',
    slug: 'governance-releases',
    files: [
      { filename: 'api-reference.md', title: 'Public API Baseline Reference', slug: 'api-reference', versionNotice: 'Governance / Policy' },
      { filename: 'api-governance.md', title: 'Public API Governance & Drift Guard', slug: 'api-governance', versionNotice: 'Governance / Policy' },
      { filename: 'migration-cookbook.md', title: 'Migration Cookbook (MediatR & AutoMapper)', slug: 'migration-cookbook', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'version-upgrade-guide.md', title: 'Version Upgrade Guide (v1.13 -> v2.2 -> v2.3)', slug: 'version-upgrade-guide', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'benchmarks.md', title: 'Performance Benchmarks & Allocations', slug: 'benchmarks', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'publishing.md', title: 'Package Publishing & Verification', slug: 'publishing', versionNotice: 'Governance / Policy' },
      { filename: 'release-checklist.md', title: 'Release Verification Checklist', slug: 'release-checklist', versionNotice: 'Governance / Policy' },
      { filename: 'community-release-guide.md', title: 'Community Release Guide', slug: 'community-release-guide', versionNotice: 'Governance / Policy' },
    ],
  },
  {
    title: 'ADRs, Plans & Strategy Archive',
    slug: 'adr-strategy-archive',
    files: [
      { filename: 'adr/0001-generated-mapper.md', title: 'ADR 0001: Generated Mapper', slug: 'adr/0001-generated-mapper', versionNotice: 'Architecture Decision Record' },
      { filename: 'adr/0002-generated-mediator.md', title: 'ADR 0002: Generated Mediator', slug: 'adr/0002-generated-mediator', versionNotice: 'Architecture Decision Record' },
      { filename: 'adr/0003-flow-manifest.md', title: 'ADR 0003: Flow Manifest', slug: 'adr/0003-flow-manifest', versionNotice: 'Architecture Decision Record' },
      { filename: 'strategy/north-star.md', title: 'Strategy: North Star', slug: 'strategy/north-star', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'strategy/ecosystem-portfolio.md', title: 'Strategy: Ecosystem Portfolio', slug: 'strategy/ecosystem-portfolio', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'strategy/decision-log.md', title: 'Strategy: Decision Log', slug: 'strategy/decision-log', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'strategy/evidence-and-gates.md', title: 'Strategy: Evidence & Gates', slug: 'strategy/evidence-and-gates', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'strategy/research-ledger.md', title: 'Strategy: Research Ledger', slug: 'strategy/research-ledger', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'strategy/validation-matrix.md', title: 'Strategy: Validation Matrix', slug: 'strategy/validation-matrix', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'decisions/v2.1-draft-evidence.md', title: 'Decisions: v2.1 Draft Evidence', slug: 'decisions/v2.1-draft-evidence', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'decisions/v2.1-source-audit.md', title: 'Decisions: v2.1 Source Audit', slug: 'decisions/v2.1-source-audit', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'decisions/v2.2-draft-evidence.md', title: 'Decisions: v2.2 Draft Evidence', slug: 'decisions/v2.2-draft-evidence', versionNotice: 'Umbrella verified in supplied evidence' },
      { filename: 'plans/v2.1-generated-mapping.md', title: 'Plan: v2.1 Generated Mapping', slug: 'plans/v2.1-generated-mapping', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'plans/v2.2-enterprise-supply-chain.md', title: 'Plan: v2.2 Enterprise Supply Chain', slug: 'plans/v2.2-enterprise-supply-chain', versionNotice: 'Umbrella verified in supplied evidence' },
      { filename: 'plans/v2.3-public-api-governance.md', title: 'Plan: v2.3 Public API Governance', slug: 'plans/v2.3-public-api-governance', versionNotice: 'Source milestone · Verify per package' },
      { filename: 'plans/v2.4-assertions.md', title: 'Plan: v2.4 Assertions (WIP)', slug: 'plans/v2.4-assertions', versionNotice: 'Unreleased · 2.4 Work in progress' },
      { filename: 'plans/v2.4-generated-mediator.md', title: 'Plan: v2.4 Generated Mediator (WIP)', slug: 'plans/v2.4-generated-mediator', versionNotice: 'Unreleased · 2.4 Work in progress' },
      { filename: 'plans/v2.4-release.md', title: 'Plan: v2.4 Release Scope (WIP)', slug: 'plans/v2.4-release', versionNotice: 'Unreleased · 2.4 Work in progress' },
      { filename: 'plans/v2.5-flow-intelligence.md', title: 'Plan: v2.5 Flow Intelligence', slug: 'plans/v2.5-flow-intelligence', versionNotice: 'Unreleased · 2.4 Work in progress' },
      { filename: 'benchmark-results/v2.1-draft/generated-mapping-bdn-short.md', title: 'Benchmark: Generated Mapping BDN Short', slug: 'benchmark-results/v2.1-draft/generated-mapping-bdn-short', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'benchmark-results/v2.1-draft/generated-mapping-bdn-mapperly-short.md', title: 'Benchmark: Generated Mapping vs Mapperly', slug: 'benchmark-results/v2.1-draft/generated-mapping-bdn-mapperly-short', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'benchmark-results/v2.1-draft/generated-mapping-first-call-cold.md', title: 'Benchmark: First-Call Cold Path', slug: 'benchmark-results/v2.1-draft/generated-mapping-first-call-cold', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'design-v1.6.1-candidate-followups.md', title: 'Archive: v1.6.1 Candidate Followups', slug: 'design-v1.6.1-candidate-followups', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'design-v1.6.2-inheritance-polymorphism.md', title: 'Archive: v1.6.2 Inheritance & Polymorphism', slug: 'design-v1.6.2-inheritance-polymorphism', versionNotice: 'Strategy & Evidence Ledger' },
      { filename: 'future-ideas.md', title: 'Future Exploration Ideas', slug: 'future-ideas', versionNotice: 'Unreleased · 2.4 Work in progress' },
    ],
  },
];

function getDocsDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), '../docs'),
    path.resolve(process.cwd(), 'docs'),
    path.resolve(__dirname, '../../../../docs'),
    path.resolve(__dirname, '../../../docs'),
    'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow\\docs',
  ];

  for (const dir of candidates) {
    if (fs.existsSync(dir)) {
      return dir;
    }
  }

  return 'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow\\docs';
}

function getRepoRootDirectory(): string {
  const candidates = [
    path.resolve(process.cwd(), '..'),
    path.resolve(process.cwd()),
    'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow',
  ];
  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, 'README.md'))) {
      return dir;
    }
  }
  return 'D:\\02_PACKAGES\\asp.net_packages\\AstraFlow';
}

export function getAllCategories(): DocCategory[] {
  return DOC_CATEGORIES.map((category, catIndex) => ({
    title: category.title,
    slug: category.slug,
    order: catIndex,
    items: category.files.map((file, fileIndex) => ({
      slug: file.slug,
      title: file.title,
      category: category.title,
      categorySlug: category.slug,
      versionNotice: file.versionNotice,
      filename: file.filename,
      order: fileIndex,
    })),
  }));
}

export function getAllDocSlugs(): string[][] {
  const slugs: string[][] = [];
  for (const cat of DOC_CATEGORIES) {
    for (const file of cat.files) {
      const parts = file.slug.split('/');
      slugs.push(parts);
      if (parts.length === 1) {
        slugs.push([cat.slug, file.slug]);
      }
    }
  }
  return slugs;
}

export function getDocBySlug(slugParam: string | string[]): DocPageData | null {
  const slugs = Array.isArray(slugParam) ? slugParam : [slugParam];
  const joinedSlug = slugs.join('/');
  const lastSlug = slugs[slugs.length - 1];

  const docsDir = getDocsDirectory();

  let foundCategory: (typeof DOC_CATEGORIES)[0] | undefined;
  let foundFile: (typeof DOC_CATEGORIES)[0]['files'][0] | undefined;

  for (const cat of DOC_CATEGORIES) {
    const f = cat.files.find(
      (item) =>
        item.slug === joinedSlug ||
        item.slug === lastSlug ||
        item.filename === `${joinedSlug}.md` ||
        item.filename === `${lastSlug}.md`
    );
    if (f) {
      foundCategory = cat;
      foundFile = f;
      break;
    }
  }

  let filePath = '';
  let title = '';
  let categoryTitle = 'Documentation';
  let versionNotice: string | undefined;
  let resolvedSlug = joinedSlug;

  if (foundFile && foundCategory) {
    filePath = path.join(docsDir, foundFile.filename);
    title = foundFile.title;
    categoryTitle = foundCategory.title;
    versionNotice = foundFile.versionNotice;
    resolvedSlug = foundFile.slug;
  } else {
    const directJoined = path.join(docsDir, `${joinedSlug}.md`);
    const directLast = path.join(docsDir, `${lastSlug}.md`);
    if (fs.existsSync(directJoined)) {
      filePath = directJoined;
      title = lastSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      resolvedSlug = joinedSlug;
    } else if (fs.existsSync(directLast)) {
      filePath = directLast;
      title = lastSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      resolvedSlug = lastSlug;
    } else if (lastSlug === 'overview' || lastSlug === 'readme') {
      filePath = path.join(getRepoRootDirectory(), 'README.md');
      title = 'AstraFlow Architecture & Ecosystem Overview';
      categoryTitle = 'Getting Started & Strategy';
      versionNotice = 'Source milestone · Verify per package';
      resolvedSlug = 'overview';
    } else {
      return null;
    }
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');

  const headings: { id: string; text: string; level: number }[] = [];
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(rawContent)) !== null) {
    const level = match[1].length;
    const text = match[2].trim().replace(/[*_`]/g, '');
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');
    headings.push({ id, text, level });
  }

  const allItems: { title: string; href: string; slug: string }[] = [];
  for (const cat of DOC_CATEGORIES) {
    for (const item of cat.files) {
      allItems.push({
        title: item.title,
        href: `/docs/${item.slug}`,
        slug: item.slug,
      });
    }
  }

  const currentIndex = allItems.findIndex((i) => i.slug === resolvedSlug);
  const prev = currentIndex > 0 ? { title: allItems[currentIndex - 1].title, href: allItems[currentIndex - 1].href } : undefined;
  const next =
    currentIndex >= 0 && currentIndex < allItems.length - 1
      ? { title: allItems[currentIndex + 1].title, href: allItems[currentIndex + 1].href }
      : undefined;

  return {
    slug: resolvedSlug,
    title,
    category: categoryTitle,
    versionNotice,
    content: rawContent,
    headings,
    prev,
    next,
  };
}
