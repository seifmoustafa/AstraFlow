'use client';
import { Button, Input } from '@core/ui';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AstraFlowPackage } from '@modules/catalog/packages';
import { getPackageReleaseLabel } from '../data/presentation';
import { scrollToElementOrHash } from '@core/motion';
import {
  dispatchStageStackEvent,
  PACKAGE_LAYER_GROUPS,
  type ComposerLayerKey,
} from './stack-resolver';
import styles from './PackagesDirectory.module.css';

export interface PackagesDirectoryProps {
  packages: AstraFlowPackage[];
  onStagePackage?: (packageId: string) => void;
  composerAnchorId?: string;
}

export function PackagesDirectory({
  packages,
  onStagePackage,
  composerAnchorId = 'composer',
}: PackagesDirectoryProps) {
  const t = useTranslations('catalog.packages.directory');
  const tLayers = useTranslations('catalog.packages.layers');
  const tRelease = useTranslations('catalog.packages.releaseLabels');
  const layerLabels: Record<ComposerLayerKey, string> = {
    core: tLayers('core'),
    mapping: tLayers('mapping'),
    'diagnostics-security': tLayers('diagnostics-security'),
    testing: tLayers('testing'),
    tooling: tLayers('tooling'),
    integrations: tLayers('integrations'),
  };
  const [activeLayer, setActiveLayer] = useState<ComposerLayerKey | 'all'>('all');
  const [query, setQuery] = useState('');

  const filteredPackages = useMemo(() => {
    const q = query.trim().toLowerCase();
    const layer = PACKAGE_LAYER_GROUPS.find((g) => g.key === activeLayer);

    return packages.filter((pkg) => {
      if (layer && !layer.categories.includes(pkg.category)) {
        return false;
      }
      if (!q) return true;
      return (
        pkg.id.toLowerCase().includes(q) ||
        pkg.categoryLabel.toLowerCase().includes(q) ||
        pkg.roleSummary.toLowerCase().includes(q) ||
        pkg.capabilities.some((capability) => capability.toLowerCase().includes(q)) ||
        pkg.targetSummary.toLowerCase().includes(q)
      );
    });
  }, [packages, activeLayer, query]);

  const handleStage = (pkg: AstraFlowPackage) => {
    onStagePackage?.(pkg.id);
    dispatchStageStackEvent({
      packageIds: [pkg.id],
      label: pkg.id,
      mode: 'add',
    });

    scrollToElementOrHash(composerAnchorId);
  };

  return (
    <div className={styles.directoryWrap}>
      <div className={styles.controlsRow}>
        <div
          className={styles.filterPills}
          role="group"
          aria-label={t('filterByLayer')}
        >
          <Button
            type="button"
            className={styles.filterBtn}
            aria-pressed={activeLayer === 'all'}
            onClick={() => setActiveLayer('all')}
          >
            {t('all', { count: String(packages.length) })}
          </Button>
          {PACKAGE_LAYER_GROUPS.map((group) => {
            const count = packages.filter((pkg) =>
              group.categories.includes(pkg.category),
            ).length;
            return (
              <Button
                key={group.key}
                type="button"
                className={styles.filterBtn}
                aria-pressed={activeLayer === group.key}
                onClick={() => setActiveLayer(group.key)}
              >
                {layerLabels[group.key]} ({count})
              </Button>
            );
          })}
        </div>

        <Input
          type="search"
          aria-label={t('filterLabel')}
          placeholder={t('filterPlaceholder')}
          className={styles.searchField}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filteredPackages.length > 0 ? (
        <div className={styles.grid}>
          {filteredPackages.map((pkg) => {
            const badgeText = getPackageReleaseLabel(pkg, {
              planned: (version) => tRelease('planned', { version }),
              tool: (version) => tRelease('tool', { version }),
              privateAssets: (version) => tRelease('privateAssets', { version }),
              published: (version) => tRelease('published', { version }),
            });

            return (
              <article
                key={pkg.id}
                id={pkg.id}
                data-reveal="up"
                className={styles.card}
              >
                <div className={styles.cardTop}>
                  <span className={styles.categoryBadge}>{pkg.categoryLabel}</span>
                  <span className={styles.statusBadge}>{badgeText}</span>
                </div>

                <h3 className={styles.cardTitle}>{pkg.id}</h3>
                <p className={styles.cardRole}>{pkg.roleSummary}</p>
                <p className={styles.cardTfm}>{pkg.targetSummary}</p>

                <div className={styles.cardActions}>
                  <Link href={pkg.docHref} className={styles.docAnchor}>
                    {t('documentation')} <span aria-hidden="true">↗</span>
                  </Link>
                  <Button
                    type="button"
                    className={styles.stageChipBtn}
                    onClick={() => handleStage(pkg)}
                  >
                    {t('stageInStack')}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyState}>
          {t('noMatches', { query: query.trim() })}
        </p>
      )}
    </div>
  );
}
