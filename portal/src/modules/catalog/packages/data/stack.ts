import type {
  AstraFlowPackageData,
  ResolvedPackageStack,
  StackWarning,
} from './model';

function compareTargetFramework(left: string, right: string): number {
  const leftMatch = left.match(/^(?:netstandard)?net?(\d+)(?:\.(\d+))?$/i);
  const rightMatch = right.match(/^(?:netstandard)?net?(\d+)(?:\.(\d+))?$/i);
  if (!leftMatch || !rightMatch) return left.localeCompare(right);

  const leftMajor = Number(leftMatch[1]);
  const rightMajor = Number(rightMatch[1]);
  if (leftMajor !== rightMajor) return leftMajor - rightMajor;
  return Number(leftMatch[2] ?? 0) - Number(rightMatch[2] ?? 0);
}

/** Pure stack composition shared by server-rendered views and the client composer. */
export function resolvePackageStack<TPackage extends AstraFlowPackageData>(
  selectedIds: readonly string[],
  packages: readonly TPackage[],
): ResolvedPackageStack<TPackage> {
  const packageOrder = packages.map((pkg) => pkg.id);
  const packageMap = new Map(packages.map((pkg) => [pkg.id, pkg]));
  const normalizedSet = new Set<string>();

  for (const requestedId of selectedIds) {
    const match = packages.find(
      (pkg) => pkg.id.toLowerCase() === requestedId.trim().toLowerCase(),
    );
    if (match) normalizedSet.add(match.id);
  }

  const orderedSelectedIds = packageOrder.filter((id) => normalizedSet.has(id));
  const selectedPackages = orderedSelectedIds.map((id) => packageMap.get(id)!);
  const impliedSet = new Set<string>();
  const pending = selectedPackages.flatMap((pkg) => pkg.projectReferences);

  while (pending.length > 0) {
    const id = pending.shift()!;
    if (normalizedSet.has(id) || impliedSet.has(id)) continue;
    impliedSet.add(id);
    const dependency = packageMap.get(id);
    if (dependency) pending.push(...dependency.projectReferences);
  }

  const impliedDependencies = packageOrder.filter((id) => impliedSet.has(id));
  const effectiveSet = new Set([...orderedSelectedIds, ...impliedDependencies]);
  const effectivePackages = packageOrder
    .filter((id) => effectiveSet.has(id))
    .map((id) => packageMap.get(id)!);

  const warnings: StackWarning[] = [];

  for (const metaPackage of selectedPackages.filter((pkg) => pkg.kind === 'meta-package')) {
    const redundantPackages = metaPackage.bundledPackageIds.filter((id) =>
      normalizedSet.has(id),
    );
    if (redundantPackages.length === 0) continue;
    warnings.push({
      code: 'OVERLAP_META_PACKAGE',
      severity: 'warning',
      metaPackageId: metaPackage.id,
      includedPackageIds: redundantPackages,
    });
  }

  const privateAssetPackages = selectedPackages
    .filter((pkg) => pkg.distribution.privateAssets === 'all')
    .map((pkg) => pkg.id);
  if (privateAssetPackages.length > 0) {
    warnings.push({
      code: 'PRIVATE_ASSETS_REQUIRED',
      severity: 'info',
      packageIds: privateAssetPackages,
    });
  }

  for (const pkg of selectedPackages) {
    for (const constraint of pkg.stackConstraints) {
      if (constraint.packageIds.some((id) => effectiveSet.has(id))) continue;
      warnings.push({
        code: 'GENERATOR_PAIRING',
        severity: 'info',
        packageId: pkg.id,
        requiredPackageIds: constraint.packageIds,
      });
    }
  }

  const toolPackages = selectedPackages.filter(
    (pkg) => pkg.distribution.installKind === 'dotnet-tool',
  );
  if (toolPackages.length > 0) {
    warnings.push({
      code: 'TOOL_INSTALL_SEPARATE',
      severity: 'info',
      packageIds: toolPackages.map((pkg) => pkg.id),
    });
  }

  const hasTestPackages = selectedPackages.some((pkg) => pkg.audience === 'test');
  const hasApplicationPackages = selectedPackages.some(
    (pkg) => pkg.audience === 'application',
  );
  if (hasTestPackages && hasApplicationPackages) {
    warnings.push({ code: 'TEST_PROJECT_BOUNDARY', severity: 'info' });
  }

  const optInPackages = selectedPackages
    .filter((pkg) => pkg.activation === 'opt-in')
    .map((pkg) => pkg.id);
  if (optInPackages.length > 0) {
    warnings.push({
      code: 'CONVENTIONS_OPT_IN',
      severity: 'info',
      packageIds: optInPackages,
    });
  }

  const requiredHostFrameworks = Array.from(
    new Set(
      selectedPackages
        .map((pkg) => pkg.hostFrameworkRequirement)
        .filter((framework): framework is string => framework !== null),
    ),
  );
  if (requiredHostFrameworks.length > 0) {
    const integrationCount = selectedPackages.filter(
      (pkg) => pkg.hostFrameworkRequirement !== null,
    ).length;
    warnings.push({
      code: 'TFM_NET10_ONLY',
      severity: 'info',
      integrationCount,
      frameworkNames: requiredHostFrameworks,
    });
  }

  const runtimePackages = effectivePackages.filter(
    (pkg) => pkg.distribution.assetType === 'runtime-library',
  );
  const frameworkPackages =
    runtimePackages.length > 0
      ? runtimePackages
      : selectedPackages.filter((pkg) => pkg.targetFrameworks.length > 0);
  const candidates = Array.from(
    new Set(frameworkPackages.flatMap((pkg) => pkg.targetFrameworks)),
  ).sort(compareTargetFramework);
  const effectiveTargetFrameworks = candidates.filter((framework) =>
    frameworkPackages.every((pkg) => pkg.targetFrameworks.includes(framework)),
  );

  const publishedPackages = selectedPackages.filter(
    (pkg) => pkg.release.availability === 'published',
  );
  const publishedNugetPackages = publishedPackages.filter(
    (pkg) => pkg.distribution.installKind !== 'dotnet-tool',
  );
  const publishedTools = publishedPackages.filter(
    (pkg) => pkg.distribution.installKind === 'dotnet-tool',
  );
  const cliBlock = publishedNugetPackages
    .map((pkg) => pkg.distribution.installCommand)
    .filter((command): command is string => command !== null)
    .join('\n');
  const toolBlock = publishedTools
    .map((pkg) => pkg.distribution.installCommand)
    .filter((command): command is string => command !== null)
    .join('\n');
  const xmlItems = [...publishedNugetPackages, ...publishedTools]
    .map((pkg) => pkg.distribution.packageReferenceXml)
    .filter((xml): xml is string => xml !== null)
    .map((xml) => `  ${xml}`);
  const xmlBlock =
    xmlItems.length > 0 ? `<ItemGroup>\n${xmlItems.join('\n')}\n</ItemGroup>` : '';
  const combinedBlock = [cliBlock, toolBlock].filter(Boolean).join('\n\n');

  return {
    selectedIds: orderedSelectedIds,
    selectedPackages,
    impliedDependencies,
    effectivePackages,
    effectiveTargetFrameworks,
    warnings,
    cliBlock,
    toolBlock,
    unreleasedBlock: '',
    xmlBlock,
    combinedBlock,
    packageCount: selectedPackages.length,
    publishedCount: publishedPackages.length,
    unreleasedCount: selectedPackages.length - publishedPackages.length,
  };
}
