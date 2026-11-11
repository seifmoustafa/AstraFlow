import fs from 'fs';
import path from 'path';

export interface DocItem {
  slug: string;
  title: string;
  description?: string;
  category: string;
  categorySlug: string;
  versionNotice?: 'v2.3.0 Published' | 'v2.4.0 Preview' | 'Governance / Policy';
  filename: string;
  order: number;
}

export interface DocCategory {
  title: string;
  slug: string;
  order: number;
  items: DocItem[];
}

export interface DocPageData {
  slug: string;
  title: string;
  category: string;
  versionNotice?: string;
  content: string;
  headings: { id: string; text: string; level: number }[];
  prev?: { title: string; href: string };
  next?: { title: string; href: string };
}

// Canonical category definitions mapped to specific markdown files
export const DOC_CATEGORIES: {
  title: string;
  slug: string;
  files: { filename: string; title: string; slug: string; versionNotice?: 'v2.3.0 Published' | 'v2.4.0 Preview' | 'Governance / Policy' }[];
}[] = [
  {
    title: 'Getting Started & Strategy',
    slug: 'getting-started',
    files: [
      { filename: 'getting-started.md', title: 'Getting Started', slug: 'getting-started', versionNotice: 'v2.3.0 Published' },
      { filename: 'package-selection.md', title: 'Package Selection Guide', slug: 'package-selection', versionNotice: 'v2.3.0 Published' },
      { filename: 'architecture.md', title: 'Architectural Philosophy', slug: 'architecture', versionNotice: 'v2.3.0 Published' },
      { filename: 'roadmap.md', title: 'Roadmap & Trajectory', slug: 'roadmap', versionNotice: 'v2.4.0 Preview' },
      { filename: 'compatibility.md', title: 'Compatibility Matrix', slug: 'compatibility', versionNotice: 'v2.3.0 Published' },
    ],
  },
  {
    title: 'Core Packages',
    slug: 'core-packages',
    files: [
      { filename: 'mediator.md', title: 'Mediator Core', slug: 'mediator', versionNotice: 'v2.3.0 Published' },
      { filename: 'mediator-scenarios.md', title: 'Mediator Scenarios & Patterns', slug: 'mediator-scenarios', versionNotice: 'v2.3.0 Published' },
      { filename: 'mapper.md', title: 'Mapper Core', slug: 'mapper', versionNotice: 'v2.3.0 Published' },
      { filename: 'mapper-scenarios.md', title: 'Mapper Scenarios & Custom Value Converters', slug: 'mapper-scenarios', versionNotice: 'v2.3.0 Published' },
      { filename: 'convention-mapping.md', title: 'Convention-Based Mapping', slug: 'convention-mapping', versionNotice: 'v2.3.0 Published' },
      { filename: 'projections.md', title: 'Projections & Queryable Extensions', slug: 'projections', versionNotice: 'v2.3.0 Published' },
      { filename: 'projection-scenarios.md', title: 'Projection Scenarios', slug: 'projection-scenarios', versionNotice: 'v2.3.0 Published' },
      { filename: 'entity-framework-core.md', title: 'Entity Framework Core Integration', slug: 'entity-framework-core', versionNotice: 'v2.3.0 Published' },
      { filename: 'assertions.md', title: 'Runner-Neutral Assertions', slug: 'assertions', versionNotice: 'v2.4.0 Preview' },
    ],
  },
  {
    title: 'Compiler & Tooling',
    slug: 'compiler-tooling',
    files: [
      { filename: 'generators.md', title: 'Roslyn Source Generators', slug: 'generators', versionNotice: 'v2.3.0 Published' },
      { filename: 'analyzers.md', title: 'Diagnostic Analyzers (AFM & AFD)', slug: 'analyzers', versionNotice: 'v2.3.0 Published' },
      { filename: 'cli.md', title: 'AstraFlow CLI & Visual Graph Export', slug: 'cli', versionNotice: 'v2.3.0 Published' },
      { filename: 'testing.md', title: 'Testing Harness & Pipeline Mocks', slug: 'testing', versionNotice: 'v2.3.0 Published' },
    ],
  },
  {
    title: 'Enterprise & Operations',
    slug: 'enterprise-ops',
    files: [
      { filename: 'aspnetcore.md', title: 'ASP.NET Core Endpoint Dispatch', slug: 'aspnetcore', versionNotice: 'v2.3.0 Published' },
      { filename: 'fluentvalidation.md', title: 'FluentValidation Pipeline Integration', slug: 'fluentvalidation', versionNotice: 'v2.3.0 Published' },
      { filename: 'diagnostics.md', title: 'Diagnostics & Metrics Telemetry', slug: 'diagnostics', versionNotice: 'v2.3.0 Published' },
      { filename: 'diagnostics-endpoint-safety.md', title: 'Endpoint Diagnostics Safety', slug: 'diagnostics-endpoint-safety', versionNotice: 'Governance / Policy' },
      { filename: 'observability.md', title: 'OpenTelemetry Distributed Tracing', slug: 'observability', versionNotice: 'v2.3.0 Published' },
      { filename: 'security.md', title: 'Security Redaction & Secret Taxonomy', slug: 'security', versionNotice: 'v2.3.0 Published' },
    ],
  },
  {
    title: 'Governance & Releases',
    slug: 'governance-releases',
    files: [
      { filename: 'api-reference.md', title: 'Public API Baseline Reference', slug: 'api-reference', versionNotice: 'Governance / Policy' },
      { filename: 'api-governance.md', title: 'Public API Governance & Drift Guard', slug: 'api-governance', versionNotice: 'Governance / Policy' },
      { filename: 'migration-cookbook.md', title: 'Migration Cookbook (MediatR & AutoMapper)', slug: 'migration-cookbook', versionNotice: 'v2.3.0 Published' },
      { filename: 'version-upgrade-guide.md', title: 'Version Upgrade Guide (v1.13 -> v2.2 -> v2.3)', slug: 'version-upgrade-guide', versionNotice: 'v2.3.0 Published' },
      { filename: 'benchmarks.md', title: 'Performance Benchmarks & Allocations', slug: 'benchmarks', versionNotice: 'v2.3.0 Published' },
      { filename: 'publishing.md', title: 'Package Publishing & Verification', slug: 'publishing', versionNotice: 'Governance / Policy' },
      { filename: 'release-checklist.md', title: 'Release Verification Checklist', slug: 'release-checklist', versionNotice: 'Governance / Policy' },
      { filename: 'community-release-guide.md', title: 'Community Release Guide', slug: 'community-release-guide', versionNotice: 'Governance / Policy' },
    ],
  },
];

function getDocsDirectory(): string {
  // When executing from Next.js server, resolve relative to project root or cwd
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

  // Fallback to absolute workspace root
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
      slugs.push([file.slug]);
      slugs.push([cat.slug, file.slug]);
    }
  }
  return slugs;
}

export function getDocBySlug(slugParam: string | string[]): DocPageData | null {
  const slugs = Array.isArray(slugParam) ? slugParam : [slugParam];
  const targetSlug = slugs[slugs.length - 1];

  const docsDir = getDocsDirectory();

  // Find in registry
  let foundCategory: (typeof DOC_CATEGORIES)[0] | undefined;
  let foundFile: (typeof DOC_CATEGORIES)[0]['files'][0] | undefined;

  for (const cat of DOC_CATEGORIES) {
    const f = cat.files.find((item) => item.slug === targetSlug || item.filename === `${targetSlug}.md`);
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

  if (foundFile && foundCategory) {
    filePath = path.join(docsDir, foundFile.filename);
    title = foundFile.title;
    categoryTitle = foundCategory.title;
    versionNotice = foundFile.versionNotice;
  } else {
    // Check if filename exists directly in docs directory
    const directFile = path.join(docsDir, `${targetSlug}.md`);
    if (fs.existsSync(directFile)) {
      filePath = directFile;
      title = targetSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    } else {
      // Check if it's the root README
      if (targetSlug === 'overview' || targetSlug === 'readme') {
        filePath = path.join(getRepoRootDirectory(), 'README.md');
        title = 'AstraFlow Architecture & Ecosystem Overview';
        categoryTitle = 'Getting Started & Strategy';
        versionNotice = 'v2.3.0 Published';
      } else {
        return null;
      }
    }
  }

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const rawContent = fs.readFileSync(filePath, 'utf-8');

  // Extract headings for Table of Contents
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

  // Calculate prev and next navigation
  const allItems: { title: string; href: string }[] = [];
  for (const cat of DOC_CATEGORIES) {
    for (const item of cat.files) {
      allItems.push({
        title: item.title,
        href: `/docs/${item.slug}`,
      });
    }
  }

  const currentIndex = allItems.findIndex((i) => i.href === `/docs/${targetSlug}`);
  const prev = currentIndex > 0 ? allItems[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : undefined;

  return {
    slug: targetSlug,
    title,
    category: categoryTitle,
    versionNotice,
    content: rawContent,
    headings,
    prev,
    next,
  };
}
