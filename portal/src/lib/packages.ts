import * as fs from 'node:fs';
import * as path from 'node:path';
import { readRepoText, resolveRepoPath } from './repo-paths';
import {
  GITHUB_URL,
  LATEST_PUBLISHED_VERSION,
  UNRELEASED_SOURCE_VERSION,
  getGitHubTreeUrl,
  getNuGetPackageUrl,
} from './site-config';

export type PackageCategory =
  | 'convenience'
  | 'mediator'
  | 'mapping'
  | 'diagnostics-security'
  | 'tooling'
  | 'integrations'
  | 'testing';

export type PackageInstallKind =
  | 'nuget'
  | 'analyzer-private'
  | 'dotnet-tool'
  | 'unreleased-source';

export type PackageStatus = 'published' | 'unreleased-source';

export type PackageAssetType =
  | 'runtime-library'
  | 'compiler-analyzer'
  | 'dotnet-tool';

export interface ExternalPackageDependency {
  id: string;
  version: string;
  privateAssets: boolean;
  condition: string | null;
}

export interface DirectoryBuildInfo {
  sourceVersion: string;
  license: string;
  repositoryUrl: string;
  authors: string;
}

export interface AstraFlowPackage {
  id: string;
  shortName: string;
  title: string;
  category: PackageCategory;
  categoryLabel: string;
  description: string;
  roleSummary: string;
  capabilities: string[];
  tags: string[];
  targetFrameworks: string[];
  targetSummary: string;
  assetType: PackageAssetType;
  installKind: PackageInstallKind;
  status: PackageStatus;
  statusLabel: string;
  isPublished: boolean;
  publishedVersion: string | null;
  sourceVersion: string;
  requiresPrivateAssets: boolean;
  isTool: boolean;
  toolCommandName: string | null;
  isConvenienceMetaPackage: boolean;
  isTestOnly: boolean;
  projectReferences: string[];
  externalDependencies: ExternalPackageDependency[];
  frameworkReferences: string[];
  installCommand: string;
  packageReferenceXml: string;
  installWarning: string | null;
  csprojPath: string;
  docHref: string;
  nugetUrl: string | null;
  githubUrl: string;
}

export interface ComposerPreset {
  id: string;
  label: string;
  summary: string;
  targetNote: string;
  packageIds: string[];
  recommendedDocHref: string;
}

export interface StackWarning {
  code:
    | 'OVERLAP_META_PACKAGE'
    | 'UNRELEASED_ASSERTIONS'
    | 'PRIVATE_ASSETS_REQUIRED'
    | 'GENERATOR_PAIRING'
    | 'TOOL_INSTALL_SEPARATE'
    | 'TEST_PROJECT_BOUNDARY'
    | 'TFM_NET10_ONLY'
    | 'CONVENTIONS_OPT_IN';
  severity: 'warning' | 'info';
  title: string;
  message: string;
}

export interface ResolvedPackageStack {
  selectedIds: string[];
  selectedPackages: AstraFlowPackage[];
  impliedDependencies: string[];
  effectivePackages: AstraFlowPackage[];
  effectiveTargetFrameworks: string[];
  warnings: StackWarning[];
  overlapNotes: string[];
  cliBlock: string;
  toolBlock: string;
  unreleasedBlock: string;
  xmlBlock: string;
  combinedBlock: string;
  packageCount: number;
  publishedCount: number;
  unreleasedCount: number;
}

interface PackageCuratedMeta {
  shortName: string;
  category: PackageCategory;
  categoryLabel: string;
  roleSummary: string;
  capabilities: string[];
  docHref: string;
  statusOverride?: PackageStatus;
  installWarning?: string;
  bundledPackages?: string[];
}

const PACKAGE_ORDER: readonly string[] = [
  'AstraFlow',
  'AstraFlow.Contracts',
  'AstraFlow.Mediator',
  'AstraFlow.Mapper',
  'AstraFlow.Mapper.Conventions',
  'AstraFlow.Mapper.EntityFrameworkCore',
  'AstraFlow.Diagnostics',
  'AstraFlow.Security',
  'AstraFlow.Testing',
  'AstraFlow.Assertions',
  'AstraFlow.Analyzers',
  'AstraFlow.Generators',
  'AstraFlow.Cli',
  'AstraFlow.AspNetCore',
  'AstraFlow.FluentValidation',
  'AstraFlow.OpenTelemetry',
];

const CURATED_METADATA: Record<string, PackageCuratedMeta> = {
  AstraFlow: {
    shortName: 'Convenience',
    category: 'convenience',
    categoryLabel: 'Meta-package',
    roleSummary:
      'Convenience umbrella entry combining AstraFlow.Contracts, AstraFlow.Mediator, and AstraFlow.Mapper via AddAstraFlow(...).',
    capabilities: [
      'Single PackageReference for apps using both mediator and explicit mapper',
      'Registers mediator and mapper via AddAstraFlow(...) without enabling conventions',
      'Keeps optional EF Core, ASP.NET Core, FluentValidation, and OpenTelemetry separate',
    ],
    docHref: '/docs/package-selection#astraflow',
    bundledPackages: [
      'AstraFlow.Contracts',
      'AstraFlow.Mediator',
      'AstraFlow.Mapper',
    ],
  },
  'AstraFlow.Contracts': {
    shortName: 'Contracts',
    category: 'mediator',
    categoryLabel: 'Mediator Core',
    roleSummary:
      'Framework-neutral mediator contracts (IRequest, IStreamRequest, INotification, ISender, IPublisher, pipelines) for shared assemblies.',
    capabilities: [
      'Zero runtime mediator implementation coupling in domain/contract assemblies',
      'Keeps AstraFlow.Mediator namespace for seamless source compatibility',
      'Supports netstandard2.0, net8.0, net9.0, and net10.0',
    ],
    docHref: '/docs/package-selection#astraflowcontracts',
  },
  'AstraFlow.Mediator': {
    shortName: 'Mediator',
    category: 'mediator',
    categoryLabel: 'Mediator Core',
    roleSummary:
      'Explicit request, void command, async stream, notification, pipeline behavior, pre/post processor, and exception-flow dispatch.',
    capabilities: [
      'Resolves exactly one handler per request; fails explicitly on missing or duplicate handlers',
      'Sequential, Parallel, and BoundedParallel notification strategies',
      'Request pre/post processors and explicit exception actions/handlers',
    ],
    docHref: '/docs/mediator',
  },
  'AstraFlow.Mapper': {
    shortName: 'Mapper',
    category: 'mapping',
    categoryLabel: 'Mapping Core',
    roleSummary:
      'Explicit object mapping rules (IDeclaredObjectMappingRule), startup catalog validation, named/parameterized projections, and secure ID abstractions.',
    capabilities: [
      'Explicit declared mapping pairs validated at startup',
      'Named and parameterized IProjection expressions with AFP diagnostics',
      'ISecureIdCodec and SecureIdMapper without coupling encryption keys',
    ],
    docHref: '/docs/mapper',
  },
  'AstraFlow.Mapper.Conventions': {
    shortName: 'Conventions',
    category: 'mapping',
    categoryLabel: 'Mapping Extension',
    roleSummary:
      'Opt-in pair-by-pair convention mapping with deterministic mapping plans, constructor/record binding, and deny-by-default sensitive-member blocks.',
    capabilities: [
      'Never enabled implicitly; requires explicit pair/profile registration',
      'Produces deterministic IMappingPlanProvider inspection records',
      'Uses AstraFlow.Security sensitive-name taxonomy to block secret fields',
    ],
    docHref: '/docs/convention-mapping',
  },
  'AstraFlow.Mapper.EntityFrameworkCore': {
    shortName: 'EF Core',
    category: 'mapping',
    categoryLabel: 'Mapping Integration',
    roleSummary:
      'Optional EF Core relational projection translation checks and parameterized validation targeting net10.0.',
    capabilities: [
      'Validates registered IProjection queries against EF Core relational model translation',
      'Reports AFPEF002 unmapped entity sources and AFPEF003 missing parameter samples',
      'Keeps EF Core dependencies strictly out of AstraFlow.Mapper',
    ],
    docHref: '/docs/entity-framework-core',
  },
  'AstraFlow.Diagnostics': {
    shortName: 'Diagnostics',
    category: 'diagnostics-security',
    categoryLabel: 'Inspection',
    roleSummary:
      'Framework-neutral registration snapshots, severity-coded findings (AFD*), JSON/Markdown reports, and health summaries.',
    capabilities: [
      'Preserves DI registration order for behaviors, processors, and exception handlers',
      'Generates deterministic JSON and Markdown reports without inspecting payload values',
      'Provides HasErrors summary state without an ASP.NET Core dependency',
    ],
    docHref: '/docs/diagnostics',
  },
  'AstraFlow.Security': {
    shortName: 'Security',
    category: 'diagnostics-security',
    categoryLabel: 'Governance',
    roleSummary:
      'Shared sensitive-name classification and redaction policy primitives consumed by OpenTelemetry, conventions, diagnostics, and generators.',
    capabilities: [
      'Default sensitive-name taxonomy for passwords, tokens, keys, credentials, salts, hashes',
      'AstraFlowRedactionPolicy with customizable replacement and taxonomies',
      'Zero external package dependencies; supports netstandard2.0 through net10.0',
    ],
    docHref: '/docs/security',
  },
  'AstraFlow.Testing': {
    shortName: 'Testing',
    category: 'testing',
    categoryLabel: 'Test Support',
    roleSummary:
      'Test-runner-neutral fakes (FakeMediator, FakeSender, FakePublisher), handler/pipeline harnesses, and AstraFlow mapping/diagnostics assertions.',
    capabilities: [
      'No dependency on xUnit, NUnit, MSTest, or mocking frameworks',
      'HandlerTestHarness, PipelineTestHarness, and NotificationHandlerTestHarness',
      'Deterministic TestSecureIdCodec and projection plan assertions',
    ],
    docHref: '/docs/testing',
  },
  'AstraFlow.Assertions': {
    shortName: 'Assertions',
    category: 'testing',
    categoryLabel: 'Test Support',
    roleSummary:
      'Framework-neutral fluent assertions (Should()) for values, strings, collections, dictionaries, enums, GUIDs, ranges, and sync/async exceptions.',
    capabilities: [
      'Zero AstraFlow runtime or test-runner package dependencies',
      'Safe failure messages avoid rendering arbitrary object values, strings, or GUIDs by default',
      'Implemented in 2.4.0 source tree — not yet published on NuGet',
    ],
    docHref: '/docs/assertions',
    statusOverride: 'unreleased-source',
    installWarning:
      'UNRELEASED SOURCE ONLY (2.4.0): AstraFlow.Assertions is implemented in the 2.4.0 branch and is NOT published on NuGet yet.',
  },
  'AstraFlow.Analyzers': {
    shortName: 'Analyzers',
    category: 'tooling',
    categoryLabel: 'Build Tooling',
    roleSummary:
      'Compile-time Roslyn diagnostics for mediator contracts, handler coverage, singleton lifetimes (AFAN0101–0105), and mapper/projection hazards (AFAN0201–0304).',
    capabilities: [
      'Ships Roslyn compiler assets under analyzers/dotnet/cs without runtime lib/ bloat',
      'Catches missing/duplicate/ambiguous requests and unsafe reverse maps at compile time',
      'Reference with PrivateAssets="all" in consuming projects',
    ],
    docHref: '/docs/analyzers',
  },
  'AstraFlow.Generators': {
    shortName: 'Generators',
    category: 'tooling',
    categoryLabel: 'Build Tooling',
    roleSummary:
      'Incremental Roslyn source generator for closed mediator DI registrations, mapper/projection metadata, and opt-in [AstraGenerateMapping] methods.',
    capabilities: [
      'Generates deterministic AddAstraFlowGeneratedMediatorRegistrations() and mapper metadata',
      'Opt-in [AstraGenerateMapping] with collections, [AstraValueConverter], and [AstraDerivedMapping] in 2.3.0',
      'Reference with PrivateAssets="all" alongside AstraFlow.Mediator or AstraFlow.Mapper',
    ],
    docHref: '/docs/generators',
  },
  'AstraFlow.Cli': {
    shortName: 'CLI',
    category: 'tooling',
    categoryLabel: '.NET Tool',
    roleSummary:
      'Global/local .NET tool (`astraflow`) for inspecting handlers/mappings, validating, diffing, scanning migrations, and exporting Mermaid/DOT/Canvas JSON graphs.',
    capabilities: [
      'Relational request -> handler -> response Mermaid, pipeline, and event views',
      'Structured Canvas JSON, SARIF 2.1.0, Markdown, and JSON report exports',
      'Install as a .NET tool targeting net10.0, never as an app runtime dependency',
    ],
    docHref: '/docs/cli',
  },
  'AstraFlow.AspNetCore': {
    shortName: 'ASP.NET Core',
    category: 'integrations',
    categoryLabel: 'Boundary Integration',
    roleSummary:
      'Minimal API and controller helpers, endpoint filters, validation problem-details mapping, redacted diagnostics endpoints, and health summaries.',
    capabilities: [
      'Redacted diagnostics and health endpoints for ASP.NET Core net10.0 hosts',
      'ProblemDetails mapping for mediator/validation failures',
      'Stays strictly at the web boundary; domain assemblies never reference it',
    ],
    docHref: '/docs/aspnetcore',
  },
  'AstraFlow.FluentValidation': {
    shortName: 'FluentValidation',
    category: 'integrations',
    categoryLabel: 'Boundary Integration',
    roleSummary:
      'Pipeline validation behaviors running registered IValidator<TRequest> instances with fail-fast, aggregate, localization, and diagnostics support.',
    capabilities: [
      'Fresh ValidationContext per validator prevents failure leakage across requests',
      'Supports fail-fast and aggregate validation error modes',
      'Targets net8.0, net9.0, and net10.0',
    ],
    docHref: '/docs/fluentvalidation',
  },
  'AstraFlow.OpenTelemetry': {
    shortName: 'OpenTelemetry',
    category: 'integrations',
    categoryLabel: 'Observability',
    roleSummary:
      'Payload-free ActivitySource spans and Meter metrics for mediator dispatch, notifications, and mapper/projection validation with shared redaction.',
    capabilities: [
      'Zero request/DTO payload capture; opt-in type-name tags and operation sampling',
      'Delegates redaction defaults to AstraFlow.Security policy',
      'Targets net8.0, net9.0, and net10.0',
    ],
    docHref: '/docs/observability',
  },
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function readXmlTag(xml: string, tagName: string): string | null {
  const match = xml.match(
    new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, 'i'),
  );
  if (!match) {
    return null;
  }
  return decodeXmlEntities(match[1].trim());
}

function readAttr(attrs: string, attrName: string): string | null {
  const match = attrs.match(
    new RegExp(`\\b${attrName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'),
  );
  if (!match) {
    return null;
  }
  return decodeXmlEntities((match[1] ?? match[2] ?? '').trim());
}

function parseProjectReferences(xml: string): string[] {
  const refs: string[] = [];
  const regex = /<ProjectReference\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null = regex.exec(xml);
  while (match) {
    const include = readAttr(match[1], 'Include');
    if (include) {
      const normalized = include.replace(/\\/g, '/');
      const base = path.posix.basename(normalized, '.csproj');
      if (base && !refs.includes(base)) {
        refs.push(base);
      }
    }
    match = regex.exec(xml);
  }
  return refs;
}

function parsePackageReferences(xml: string): ExternalPackageDependency[] {
  const deps: ExternalPackageDependency[] = [];
  const itemGroupRegex = /<ItemGroup(?:\s+([^>]*))?>([\s\S]*?)<\/ItemGroup>/gi;
  let groupMatch: RegExpExecArray | null = itemGroupRegex.exec(xml);

  while (groupMatch) {
    const groupAttrs = groupMatch[1] ?? '';
    const condition = readAttr(groupAttrs, 'Condition');
    const body = groupMatch[2];
    const pkgRegex = /<PackageReference\b([^>]*)\/?>/gi;
    let pkgMatch: RegExpExecArray | null = pkgRegex.exec(body);

    while (pkgMatch) {
      const attrs = pkgMatch[1];
      const id = readAttr(attrs, 'Include');
      const version = readAttr(attrs, 'Version') ?? '';
      const privateAssets =
        (readAttr(attrs, 'PrivateAssets') ?? '').toLowerCase() === 'all';
      if (id) {
        deps.push({
          id,
          version,
          privateAssets,
          condition,
        });
      }
      pkgMatch = pkgRegex.exec(body);
    }

    groupMatch = itemGroupRegex.exec(xml);
  }

  return deps;
}

function parseFrameworkReferences(xml: string): string[] {
  const refs: string[] = [];
  const regex = /<FrameworkReference\b([^>]*)\/?>/gi;
  let match: RegExpExecArray | null = regex.exec(xml);
  while (match) {
    const id = readAttr(match[1], 'Include');
    if (id && !refs.includes(id)) {
      refs.push(id);
    }
    match = regex.exec(xml);
  }
  return refs;
}

let cachedDirectoryBuildInfo: DirectoryBuildInfo | null = null;
let cachedPackages: AstraFlowPackage[] | null = null;

/**
 * Reads shared build metadata from `Directory.Build.props`.
 */
export function getDirectoryBuildInfo(): DirectoryBuildInfo {
  if (cachedDirectoryBuildInfo) {
    return cachedDirectoryBuildInfo;
  }

  const propsXml = readRepoText('Directory.Build.props');
  cachedDirectoryBuildInfo = {
    sourceVersion: readXmlTag(propsXml, 'Version') ?? UNRELEASED_SOURCE_VERSION,
    license: readXmlTag(propsXml, 'PackageLicenseExpression') ?? 'MIT',
    repositoryUrl: readXmlTag(propsXml, 'RepositoryUrl') ?? GITHUB_URL,
    authors: readXmlTag(propsXml, 'Authors') ?? 'AstraFlow Contributors',
  };
  return cachedDirectoryBuildInfo;
}

function discoverCsprojPaths(): string[] {
  const srcDir = resolveRepoPath('src');
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }
    const candidate = path.join(srcDir, entry.name, `${entry.name}.csproj`);
    if (fs.existsSync(candidate)) {
      results.push(candidate);
    }
  }
  return results;
}

function buildPackageRecord(
  csprojAbsolutePath: string,
  buildInfo: DirectoryBuildInfo,
): AstraFlowPackage {
  const xml = fs.readFileSync(csprojAbsolutePath, 'utf8').replace(/^\uFEFF/, '');
  const dirName = path.basename(path.dirname(csprojAbsolutePath));
  const id = readXmlTag(xml, 'PackageId') ?? dirName;
  const meta = CURATED_METADATA[id];

  if (!meta) {
    throw new Error(
      `Unexpected package "${id}" found in ${csprojAbsolutePath} without curated metadata mapping.`,
    );
  }

  const title = readXmlTag(xml, 'Title') ?? id;
  const description = readXmlTag(xml, 'Description') ?? meta.roleSummary;
  const tagsRaw = readXmlTag(xml, 'PackageTags') ?? '';
  const tags = tagsRaw
    .split(';')
    .map((t) => t.trim())
    .filter(Boolean);

  const tfmsRaw =
    readXmlTag(xml, 'TargetFrameworks') ??
    readXmlTag(xml, 'TargetFramework') ??
    '';
  const targetFrameworks = tfmsRaw
    .split(';')
    .map((tfm) => tfm.trim())
    .filter(Boolean);

  const packAsTool =
    (readXmlTag(xml, 'PackAsTool') ?? '').toLowerCase() === 'true';
  const toolCommandName = readXmlTag(xml, 'ToolCommandName');
  const includeBuildOutput =
    (readXmlTag(xml, 'IncludeBuildOutput') ?? 'true').toLowerCase() !== 'false';

  const projectReferences = parseProjectReferences(xml);
  const externalDependencies = parsePackageReferences(xml);
  const frameworkReferences = parseFrameworkReferences(xml);

  const status: PackageStatus = meta.statusOverride ?? 'published';
  const isPublished = status === 'published';
  const publishedVersion = isPublished ? LATEST_PUBLISHED_VERSION : null;
  const sourceVersion = buildInfo.sourceVersion;

  let assetType: PackageAssetType = 'runtime-library';
  if (packAsTool) {
    assetType = 'dotnet-tool';
  } else if (!includeBuildOutput) {
    assetType = 'compiler-analyzer';
  }

  const requiresPrivateAssets =
    id === 'AstraFlow.Analyzers' || id === 'AstraFlow.Generators';

  let installKind: PackageInstallKind = 'nuget';
  if (!isPublished) {
    installKind = 'unreleased-source';
  } else if (packAsTool) {
    installKind = 'dotnet-tool';
  } else if (requiresPrivateAssets) {
    installKind = 'analyzer-private';
  }

  let targetSummary = targetFrameworks.join(' · ');
  if (assetType === 'compiler-analyzer') {
    targetSummary = `${targetFrameworks.join(' · ')} (analyzers/dotnet/cs compiler asset)`;
  } else if (assetType === 'dotnet-tool') {
    targetSummary = `${targetFrameworks.join(' · ')} (.NET global/local tool)`;
  }

  const statusLabel = isPublished
    ? `Published · ${LATEST_PUBLISHED_VERSION}`
    : `Unreleased source · ${sourceVersion} (Not on NuGet)`;

  let installCommand: string;
  let packageReferenceXml: string;

  if (!isPublished) {
    installCommand = `# UNRELEASED (${sourceVersion} source only — not yet published on NuGet)`;
    packageReferenceXml = `<!-- UNRELEASED ${sourceVersion} SOURCE ONLY (not published on NuGet yet) -->`;
  } else if (packAsTool) {
    installCommand = `dotnet tool install --global ${id} --version ${LATEST_PUBLISHED_VERSION}`;
    packageReferenceXml = `<!-- Install ${id} as a .NET tool, not a PackageReference: ${installCommand} -->`;
  } else if (requiresPrivateAssets) {
    installCommand = `dotnet add package ${id} --version ${LATEST_PUBLISHED_VERSION}`;
    packageReferenceXml = `<PackageReference Include="${id}" Version="${LATEST_PUBLISHED_VERSION}" PrivateAssets="all" />`;
  } else {
    installCommand = `dotnet add package ${id} --version ${LATEST_PUBLISHED_VERSION}`;
    packageReferenceXml = `<PackageReference Include="${id}" Version="${LATEST_PUBLISHED_VERSION}" />`;
  }

  const csprojPath = `src/${dirName}/${path.basename(csprojAbsolutePath)}`;

  return {
    id,
    shortName: meta.shortName,
    title,
    category: meta.category,
    categoryLabel: meta.categoryLabel,
    description,
    roleSummary: meta.roleSummary,
    capabilities: meta.capabilities,
    tags,
    targetFrameworks,
    targetSummary,
    assetType,
    installKind,
    status,
    statusLabel,
    isPublished,
    publishedVersion,
    sourceVersion,
    requiresPrivateAssets,
    isTool: packAsTool,
    toolCommandName,
    isConvenienceMetaPackage: id === 'AstraFlow',
    isTestOnly: id === 'AstraFlow.Testing' || id === 'AstraFlow.Assertions',
    projectReferences,
    externalDependencies,
    frameworkReferences,
    installCommand,
    packageReferenceXml,
    installWarning: meta.installWarning ?? null,
    csprojPath,
    docHref: meta.docHref,
    nugetUrl: isPublished
      ? getNuGetPackageUrl(id, LATEST_PUBLISHED_VERSION)
      : null,
    githubUrl: getGitHubTreeUrl(`src/${dirName}`),
  };
}

/**
 * Dynamically inspects `Directory.Build.props` and all 16 `src/*\/*.csproj`
 * project files on the server and merges them with verified metadata from
 * `README.md` and `docs/package-selection.md`.
 */
export function getAllPackages(): AstraFlowPackage[] {
  if (cachedPackages) {
    return cachedPackages;
  }

  const buildInfo = getDirectoryBuildInfo();
  const csprojFiles = discoverCsprojPaths();
  const parsed = csprojFiles.map((filePath) =>
    buildPackageRecord(filePath, buildInfo),
  );

  const byId = new Map(parsed.map((pkg) => [pkg.id, pkg]));
  for (const expectedId of PACKAGE_ORDER) {
    if (!byId.has(expectedId)) {
      throw new Error(
        `Missing expected AstraFlow package "${expectedId}" under src/.`,
      );
    }
  }

  cachedPackages = PACKAGE_ORDER.map((id) => byId.get(id)!);
  return cachedPackages;
}

export function getPackageById(id: string): AstraFlowPackage | undefined {
  return getAllPackages().find(
    (pkg) => pkg.id.toLowerCase() === id.toLowerCase(),
  );
}

/**
 * Verified common app shapes sourced from `docs/package-selection.md`.
 */
export function getComposerPresets(): ComposerPreset[] {
  return [
    {
      id: 'cqrs-api',
      label: 'CQRS Handlers Only',
      summary: 'Focused request/response dispatch and pipeline behaviors without object mapping.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
      packageIds: ['AstraFlow.Mediator'],
      recommendedDocHref: '/docs/mediator',
    },
    {
      id: 'mediator-and-mapper',
      label: 'Mediator + Explicit Mapper',
      summary: 'Convenience meta-package combining mediator dispatch and explicit declared mapping.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
      packageIds: ['AstraFlow'],
      recommendedDocHref: '/docs/getting-started',
    },
    {
      id: 'efcore-read-models',
      label: 'EF Core Read Models',
      summary: 'Explicit query projections with EF Core relational translation checks.',
      targetNote: 'Requires net10.0 for EF Core integration',
      packageIds: ['AstraFlow.Mapper', 'AstraFlow.Mapper.EntityFrameworkCore'],
      recommendedDocHref: '/docs/entity-framework-core',
    },
    {
      id: 'conventions-governance',
      label: 'Opt-In Conventions + Security',
      summary: 'Pair-by-pair convention mapping plans backed by shared sensitive-name redaction policy.',
      targetNote: 'netstandard2.0 · net8.0 · net9.0 · net10.0',
      packageIds: [
        'AstraFlow.Mapper',
        'AstraFlow.Mapper.Conventions',
        'AstraFlow.Security',
      ],
      recommendedDocHref: '/docs/convention-mapping',
    },
    {
      id: 'aot-generated-mapping',
      label: 'AOT-Conscious Generators',
      summary: 'Explicit mediator/mapper core paired with compile-time source generators and analyzers.',
      targetNote: 'PrivateAssets="all" for compiler packages',
      packageIds: [
        'AstraFlow.Mediator',
        'AstraFlow.Mapper',
        'AstraFlow.Generators',
        'AstraFlow.Analyzers',
      ],
      recommendedDocHref: '/docs/generators',
    },
    {
      id: 'diagnostics-observability',
      label: 'ASP.NET Core + Telemetry',
      summary: 'Web host integration, FluentValidation pipeline, diagnostics reporting, OpenTelemetry, and CLI.',
      targetNote: 'Requires net10.0 for ASP.NET Core & CLI',
      packageIds: [
        'AstraFlow',
        'AstraFlow.AspNetCore',
        'AstraFlow.FluentValidation',
        'AstraFlow.Diagnostics',
        'AstraFlow.OpenTelemetry',
        'AstraFlow.Cli',
      ],
      recommendedDocHref: '/docs/observability',
    },
    {
      id: 'test-project-suite',
      label: 'Test Project Suite',
      summary: 'AstraFlow fakes/harnesses alongside the 2.4.0 unreleased general-purpose assertion source.',
      targetNote: 'Test projects only (Assertions is 2.4.0 unreleased source)',
      packageIds: ['AstraFlow.Testing', 'AstraFlow.Assertions'],
      recommendedDocHref: '/docs/testing',
    },
  ];
}

/**
 * Computes transitive peer/project dependencies, overlap warnings, target-framework
 * constraints, and truthful NuGet / .csproj / .NET tool install commands for a stack.
 */
export function resolvePackageStack(
  selectedIds: readonly string[],
): ResolvedPackageStack {
  const allPackages = getAllPackages();
  const packageMap = new Map(allPackages.map((pkg) => [pkg.id, pkg]));

  const normalizedSet = new Set<string>();
  for (const id of selectedIds) {
    const matched = allPackages.find(
      (pkg) => pkg.id.toLowerCase() === id.trim().toLowerCase(),
    );
    if (matched) {
      normalizedSet.add(matched.id);
    }
  }

  const orderedSelectedIds = PACKAGE_ORDER.filter((id) =>
    normalizedSet.has(id),
  );
  const selectedPackages = orderedSelectedIds.map((id) => packageMap.get(id)!);

  const visitedImplied = new Set<string>();
  const queue: string[] = [];

  for (const pkg of selectedPackages) {
    for (const refId of pkg.projectReferences) {
      if (!normalizedSet.has(refId) && !visitedImplied.has(refId)) {
        visitedImplied.add(refId);
        queue.push(refId);
      }
    }
  }

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const pkg = packageMap.get(currentId);
    if (!pkg) {
      continue;
    }
    for (const refId of pkg.projectReferences) {
      if (!normalizedSet.has(refId) && !visitedImplied.has(refId)) {
        visitedImplied.add(refId);
        queue.push(refId);
      }
    }
  }

  const impliedDependencies = PACKAGE_ORDER.filter((id) =>
    visitedImplied.has(id),
  );
  const effectiveSet = new Set([...orderedSelectedIds, ...impliedDependencies]);
  const effectivePackages = PACKAGE_ORDER.filter((id) =>
    effectiveSet.has(id),
  ).map((id) => packageMap.get(id)!);

  const warnings: StackWarning[] = [];
  const overlapNotes: string[] = [];

  const hasMeta = normalizedSet.has('AstraFlow');
  const redundantWithMeta = ['AstraFlow.Contracts', 'AstraFlow.Mediator', 'AstraFlow.Mapper'].filter(
    (id) => normalizedSet.has(id),
  );
  if (hasMeta && redundantWithMeta.length > 0) {
    const overlapMessage = `AstraFlow already includes ${redundantWithMeta.join(', ')} transitively. Keep only AstraFlow if you want both mediator and mapper, or remove AstraFlow and pick focused packages.`;
    overlapNotes.push(overlapMessage);
    warnings.push({
      code: 'OVERLAP_META_PACKAGE',
      severity: 'warning',
      title: 'Convenience meta-package overlap',
      message: overlapMessage,
    });
  }

  if (normalizedSet.has('AstraFlow.Assertions')) {
    warnings.push({
      code: 'UNRELEASED_ASSERTIONS',
      severity: 'warning',
      title: '2.4.0 unreleased source only',
      message:
        'AstraFlow.Assertions is implemented in the 2.4.0 source branch and is NOT published on NuGet yet. Keep it out of published 2.3.0 NuGet restore plans.',
    });
  }

  const selectedPrivateAssets = selectedPackages
    .filter((pkg) => pkg.requiresPrivateAssets)
    .map((pkg) => pkg.id);
  if (selectedPrivateAssets.length > 0) {
    warnings.push({
      code: 'PRIVATE_ASSETS_REQUIRED',
      severity: 'info',
      title: 'PrivateAssets="all" required',
      message: `${selectedPrivateAssets.join(' and ')} ship Roslyn assets under analyzers/dotnet/cs. Keep PrivateAssets="all" on their PackageReference so compiler assets do not flow transitively.`,
    });
  }

  if (
    normalizedSet.has('AstraFlow.Generators') &&
    !effectiveSet.has('AstraFlow.Mediator') &&
    !effectiveSet.has('AstraFlow.Mapper')
  ) {
    warnings.push({
      code: 'GENERATOR_PAIRING',
      severity: 'info',
      title: 'Pair generators with Mediator or Mapper',
      message:
        'AstraFlow.Generators emits registration/metadata and [AstraGenerateMapping] code for projects using AstraFlow.Mediator or AstraFlow.Mapper.',
    });
  }

  if (normalizedSet.has('AstraFlow.Cli')) {
    warnings.push({
      code: 'TOOL_INSTALL_SEPARATE',
      severity: 'info',
      title: 'Install AstraFlow.Cli as a .NET tool',
      message:
        'AstraFlow.Cli is packaged as the `astraflow` .NET tool (net10.0), not as an application runtime PackageReference.',
    });
  }

  const hasTestPkg =
    normalizedSet.has('AstraFlow.Testing') ||
    normalizedSet.has('AstraFlow.Assertions');
  const hasAppPkg = selectedPackages.some((pkg) => !pkg.isTestOnly && !pkg.isTool);
  if (hasTestPkg && hasAppPkg) {
    warnings.push({
      code: 'TEST_PROJECT_BOUNDARY',
      severity: 'info',
      title: 'Separate test-project references',
      message:
        'Add AstraFlow.Testing and AstraFlow.Assertions only to test projects, separate from production runtime project files.',
    });
  }

  if (normalizedSet.has('AstraFlow.Mapper.Conventions')) {
    warnings.push({
      code: 'CONVENTIONS_OPT_IN',
      severity: 'info',
      title: 'Opt-in convention boundary',
      message:
        'AstraFlow.Mapper.Conventions stays opt-in per registered profile/pair and blocks sensitive member names by default via AstraFlow.Security.',
    });
  }

  const runtimePackages = effectivePackages.filter(
    (pkg) => pkg.assetType === 'runtime-library',
  );
  const tfmPool =
    runtimePackages.length > 0
      ? runtimePackages
      : selectedPackages.filter((pkg) => pkg.targetFrameworks.length > 0);

  let effectiveTargetFrameworks: string[] = [];
  if (tfmPool.length > 0) {
    const candidateOrder = ['netstandard2.0', 'net8.0', 'net9.0', 'net10.0'];
    effectiveTargetFrameworks = candidateOrder.filter((tfm) =>
      tfmPool.every((pkg) => pkg.targetFrameworks.includes(tfm)),
    );
  }

  if (
    normalizedSet.has('AstraFlow.AspNetCore') ||
    normalizedSet.has('AstraFlow.Mapper.EntityFrameworkCore')
  ) {
    warnings.push({
      code: 'TFM_NET10_ONLY',
      severity: 'info',
      title: 'Target framework constrained to net10.0',
      message:
        'AstraFlow.AspNetCore and AstraFlow.Mapper.EntityFrameworkCore currently target net10.0 only.',
    });
  }

  const publishedNugetPackages = selectedPackages.filter(
    (pkg) => pkg.isPublished && !pkg.isTool,
  );
  const toolPackages = selectedPackages.filter((pkg) => pkg.isTool);
  const unreleasedPackages = selectedPackages.filter((pkg) => !pkg.isPublished);

  const cliLines = publishedNugetPackages.map(
    (pkg) => `dotnet add package ${pkg.id} --version ${LATEST_PUBLISHED_VERSION}`,
  );
  const cliBlock = cliLines.join('\n');

  const toolLines = toolPackages.map(
    (pkg) =>
      `dotnet tool install --global ${pkg.id} --version ${LATEST_PUBLISHED_VERSION}`,
  );
  const toolBlock = toolLines.join('\n');

  const unreleasedLines = unreleasedPackages.map(
    (pkg) =>
      `# UNRELEASED (${pkg.sourceVersion} source only — NOT published on NuGet yet): ${pkg.id}\n# Reference src/${pkg.id}/${pkg.id}.csproj locally or wait for the ${pkg.sourceVersion} NuGet release.`,
  );
  const unreleasedBlock = unreleasedLines.join('\n');

  const xmlItems: string[] = [];
  for (const pkg of publishedNugetPackages) {
    xmlItems.push(`  ${pkg.packageReferenceXml}`);
  }
  for (const pkg of toolPackages) {
    xmlItems.push(`  ${pkg.packageReferenceXml}`);
  }
  for (const pkg of unreleasedPackages) {
    xmlItems.push(`  ${pkg.packageReferenceXml}`);
  }

  const xmlBlock =
    xmlItems.length > 0 ? `<ItemGroup>\n${xmlItems.join('\n')}\n</ItemGroup>` : '';

  const combinedParts = [cliBlock, toolBlock, unreleasedBlock].filter(Boolean);
  const combinedBlock = combinedParts.join('\n\n');

  return {
    selectedIds: orderedSelectedIds,
    selectedPackages,
    impliedDependencies,
    effectivePackages,
    effectiveTargetFrameworks,
    warnings,
    overlapNotes,
    cliBlock,
    toolBlock,
    unreleasedBlock,
    xmlBlock,
    combinedBlock,
    packageCount: selectedPackages.length,
    publishedCount: publishedNugetPackages.length + toolPackages.length,
    unreleasedCount: unreleasedPackages.length,
  };
}
