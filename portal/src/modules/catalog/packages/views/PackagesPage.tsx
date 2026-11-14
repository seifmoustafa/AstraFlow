import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { getAllPackages } from '../data/service';
import { getComposerPresets } from '../data/presets';
import type {
  ComposerPresetPresentation,
  PackagePresentation,
} from '../data/model';
import { PackagesWorkspace } from './index';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('catalog.packages.seo');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/packages' },
  };
}

export default async function PackagesPage() {
  const t = await getTranslations('catalog.packages');
  const tTargetSummary = await getTranslations('catalog.packages.targetSummary');
  const raw = t.raw as unknown as (key: string) => unknown;
  const packageProfiles = raw('packageProfiles') as Record<string, PackagePresentation>;
  const presetProfiles = raw('presetProfiles') as Record<
    string,
    ComposerPresetPresentation
  >;

  const packages = getAllPackages().map((pkg) => {
    const presentation = packageProfiles[pkg.id];
    if (!presentation) {
      throw new Error(`Missing localized package copy for "${pkg.id}".`);
    }

    const frameworks = pkg.targetFrameworks.join(' · ');
    const targetSummary =
      pkg.distribution.assetType === 'compiler-analyzer'
        ? tTargetSummary('compiler', { frameworks })
        : pkg.distribution.assetType === 'dotnet-tool'
          ? tTargetSummary('tool', { frameworks })
          : tTargetSummary('runtime', { frameworks });

    return { ...pkg, ...presentation, targetSummary };
  });

  const presets = getComposerPresets().map((preset) => {
    const presentation = presetProfiles[preset.id];
    if (!presentation) {
      throw new Error(`Missing localized preset copy for "${preset.id}".`);
    }
    return { ...preset, ...presentation };
  });

  return (
    <main id="main" data-page="packages">
      <PackagesWorkspace packages={packages} presets={presets} />
    </main>
  );
}
