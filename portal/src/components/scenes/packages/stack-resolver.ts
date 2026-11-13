import type {
  AstraFlowPackage,
  PackageCategory,
  ResolvedPackageStack,
  StackWarning,
} from '@/lib/packages';
import { LATEST_PUBLISHED_VERSION } from '@/lib/site-config';

export type PackageSpec = AstraFlowPackage;

export type ComposerLayerKey =
  | 'core'
  | 'mapping'
  | 'diagnostics-security'
  | 'testing'
  | 'tooling'
  | 'integrations';

export interface ComposerLayerGroup {
  key: ComposerLayerKey;
  label: string;
  description: string;
  categories: readonly PackageCategory[];
}

export const PACKAGE_LAYER_GROUPS: readonly ComposerLayerGroup[] = [
  {
    key: 'core',
    label: 'Core',
    description: 'Umbrella entry, shared mediator contracts, and dispatch engine.',
    categories: ['convenience', 'mediator'],
  },
  {
    key: 'mapping',
    label: 'Mapping & EF',
    description: 'Explicit rules, opt-in conventions, and EF Core projection validation.',
    categories: ['mapping'],
  },
  {
    key: 'diagnostics-security',
    label: 'Diagnostics & Security',
    description: 'Startup registration reports and shared redaction policies.',
    categories: ['diagnostics-security'],
  },
  {
    key: 'testing',
    label: 'Testing & Quality',
    description: 'Runner-neutral test harnesses and fluent .Should() assertions.',
    categories: ['testing'],
  },
  {
    key: 'tooling',
    label: 'Build-Time & Tooling',
    description: 'Roslyn analyzers, incremental generators (PrivateAssets="all"), and CLI tool.',
    categories: ['tooling'],
  },
  {
    key: 'integrations',
    label: 'Framework Integrations',
    description: 'ASP.NET Core host endpoints, FluentValidation pipelines, and OpenTelemetry.',
    categories: ['integrations'],
  },
] as const;

export const STAGE_STACK_EVENT = 'astraflow:stage-stack';

export interface StageStackEventDetail {
  packageIds: string[];
  moduleId?: string;
  label?: string;
  mode?: 'replace' | 'add';
}

export function dispatchStageStackEvent(detail: StageStackEventDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<StageStackEventDetail>(STAGE_STACK_EVENT, { detail }));
}

export function groupPackagesByLayer(
  packages: readonly AstraFlowPackage[],
): Array<ComposerLayerGroup & { packages: AstraFlowPackage[] }> {
  return PACKAGE_LAYER_GROUPS.map((group) => ({
    ...group,
    packages: packages.filter((pkg) => group.categories.includes(pkg.category)),
  })).filter((group) => group.packages.length > 0);
}

/**
 * Pure browser-safe equivalent of `resolvePackageStack()` from `@/lib/packages`.
 * Computes transitive project dependencies, overlap/tool/boundary warnings,
 * compatible TFM intersection, and accurate CLI / XML / .NET tool install outputs
 * without importing Node `fs`/`path` APIs in client bundles.
 */
export function resolvePackageStackClient(
  selectedIds: readonly string[],
  packages: readonly AstraFlowPackage[],
): ResolvedPackageStack {
  const packageOrder = packages.map((pkg) => pkg.id);
  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const latestPublishedVersion =
    packages.find((pkg) => pkg.isPublished && pkg.publishedVersion)?.publishedVersion ??
    LATEST_PUBLISHED_VERSION;

  const normalizedSet = new Set<string>();
  for (const id of selectedIds) {
    const matched = packages.find(
      (pkg) => pkg.id.toLowerCase() === id.trim().toLowerCase(),
    );
    if (matched) {
      normalizedSet.add(matched.id);
    }
  }

  const orderedSelectedIds = packageOrder.filter((id) => normalizedSet.has(id));
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
    if (!pkg) continue;
    for (const refId of pkg.projectReferences) {
      if (!normalizedSet.has(refId) && !visitedImplied.has(refId)) {
        visitedImplied.add(refId);
        queue.push(refId);
      }
    }
  }

  const impliedDependencies = packageOrder.filter((id) => visitedImplied.has(id));
  const effectiveSet = new Set([...orderedSelectedIds, ...impliedDependencies]);
  const effectivePackages = packageOrder
    .filter((id) => effectiveSet.has(id))
    .map((id) => packageMap.get(id)!);

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
    normalizedSet.has('AstraFlow.Testing') || normalizedSet.has('AstraFlow.Assertions');
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

  const nugetPackages = selectedPackages.filter((pkg) => !pkg.isTool);
  const toolPackages = selectedPackages.filter((pkg) => pkg.isTool);

  const cliLines = nugetPackages.map(
    (pkg) =>
      `dotnet add package ${pkg.id} --version ${pkg.publishedVersion ?? latestPublishedVersion}`,
  );
  const cliBlock = cliLines.join('\n');

  const toolLines = toolPackages.map(
    (pkg) =>
      `dotnet tool install --global ${pkg.id} --version ${pkg.publishedVersion ?? latestPublishedVersion}`,
  );
  const toolBlock = toolLines.join('\n');

  const xmlItems: string[] = [];
  for (const pkg of nugetPackages) {
    xmlItems.push(`  ${pkg.packageReferenceXml}`);
  }
  for (const pkg of toolPackages) {
    xmlItems.push(`  ${pkg.packageReferenceXml}`);
  }

  const xmlBlock =
    xmlItems.length > 0 ? `<ItemGroup>\n${xmlItems.join('\n')}\n</ItemGroup>` : '';

  const combinedParts = [cliBlock, toolBlock].filter(Boolean);
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
    unreleasedBlock: '',
    xmlBlock,
    combinedBlock,
    packageCount: selectedPackages.length,
    publishedCount: selectedPackages.length,
    unreleasedCount: 0,
  };
}
