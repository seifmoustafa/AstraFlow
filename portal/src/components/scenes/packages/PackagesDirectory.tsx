'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { AstraFlowPackage } from '@/lib/packages';
import { useReducedMotionSafe } from '@/components/hairline';
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
  const [activeLayer, setActiveLayer] = useState<ComposerLayerKey | 'all'>('all');
  const [query, setQuery] = useState('');
  const reducedMotion = useReducedMotionSafe();

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

    const target = document.getElementById(composerAnchorId);
    if (target) {
      target.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className={styles.directoryWrap}>
      <div className={styles.controlsRow}>
        <div
          className={styles.filterPills}
          role="group"
          aria-label="Filter package directory by layer"
        >
          <button
            type="button"
            className={styles.filterBtn}
            aria-pressed={activeLayer === 'all'}
            onClick={() => setActiveLayer('all')}
          >
            All ({packages.length})
          </button>
          {PACKAGE_LAYER_GROUPS.map((group) => {
            const count = packages.filter((pkg) =>
              group.categories.includes(pkg.category),
            ).length;
            return (
              <button
                key={group.key}
                type="button"
                className={styles.filterBtn}
                aria-pressed={activeLayer === group.key}
                onClick={() => setActiveLayer(group.key)}
              >
                {group.label} ({count})
              </button>
            );
          })}
        </div>

        <input
          type="search"
          aria-label="Filter package directory"
          placeholder="Filter packages (e.g. Mapper, CLI, net10.0)..."
          className={styles.searchField}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filteredPackages.length > 0 ? (
        <div className={styles.grid}>
          {filteredPackages.map((pkg) => {
            const badgeText = !pkg.isPublished
              ? `2.4.0 UNRELEASED SOURCE`
              : pkg.isTool
                ? `${pkg.publishedVersion} · .NET Tool`
                : pkg.requiresPrivateAssets
                  ? `${pkg.publishedVersion} · PrivateAssets="all"`
                  : `${pkg.publishedVersion} · Published`;

            return (
              <article
                key={pkg.id}
                id={pkg.id}
                data-reveal="up"
                className={`${styles.card} ${
                  !pkg.isPublished ? styles.cardUnreleased : ''
                }`}
              >
                <div className={styles.cardTop}>
                  <span className={styles.categoryBadge}>{pkg.categoryLabel}</span>
                  <span
                    className={
                      !pkg.isPublished ? styles.statusBadgeWarn : styles.statusBadge
                    }
                  >
                    {badgeText}
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{pkg.id}</h3>
                <p className={styles.cardRole}>{pkg.roleSummary}</p>
                <p className={styles.cardTfm}>{pkg.targetSummary}</p>

                <div className={styles.cardActions}>
                  <Link href={pkg.docHref} className={styles.docAnchor}>
                    Documentation <span aria-hidden="true">↗</span>
                  </Link>
                  <button
                    type="button"
                    className={styles.stageChipBtn}
                    onClick={() => handleStage(pkg)}
                  >
                    + Stage in stack
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p className={styles.emptyState}>
          No packages match &ldquo;{query.trim()}&rdquo; in this layer.
        </p>
      )}
    </div>
  );
}
