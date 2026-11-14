"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
  scrollToElementOrHash,
} from "@core/motion";
import type { ChangelogRelease, ChangelogStats } from '../data/model';
import {
  GITHUB_LINKS,
  LATEST_PUBLISHED_DATE,
  SUPPORTED_MIN_MAJOR,
} from "@core/config/site-config";
import { ReleaseFolio, type ReleaseFilter } from "./ReleaseFolio";
import { VersionDeck } from "./VersionDeck";
import styles from "./ChangelogShell.module.css";

export interface ChangelogShellProps {
  releases: readonly ChangelogRelease[];
  stats: ChangelogStats;
}

export function ChangelogShell({ releases, stats }: ChangelogShellProps) {
  const t = useTranslations('releases.changelog.shell');
  const [selectedAnchor, setSelectedAnchor] = useState(
    () => releases[0]?.anchorId ?? "",
  );
  const [filter, setFilter] = useState<ReleaseFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, "");
      if (!rawHash || rawHash === "releases") {
        return;
      }
      const match = releases.find((release) => release.anchorId === rawHash);
      if (match) {
        setSelectedAnchor(match.anchorId);
        setFilter("all");
        setSearchQuery("");
        scrollToElementOrHash("releases");
      }
    };

    const frame = window.requestAnimationFrame(syncFromHash);
    window.addEventListener("hashchange", syncFromHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, [releases]);

  const handleSelectRelease = (anchorId: string) => {
    setSelectedAnchor(anchorId);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${anchorId}`);
    }
  };

  const handleJumpToRelease = (anchorId: string) => {
    setFilter("all");
    setSearchQuery("");
    setSelectedAnchor(anchorId);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${anchorId}`);
      scrollToElementOrHash("releases");
    }
  };

  return (
    <main id="main" data-page="changelog">
      <section className={`hero ${styles.subhero}`}>
        <div className={`site-wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">{t('heroEyebrow')}</p>
            <HeroTextReveal as="h1" className={styles.heroHeading}>
              {t('heroTitle')}
              <span className={`ital signal ${styles.heroItal}`}>
                {t('heroAccent')}
              </span>
            </HeroTextReveal>
            <p className={styles.heroLead}>
              {t('heroLead')}
            </p>
            <div className="links">
              <MagneticButton className="button button-primary" href="#releases">
                {t('exploreNotes')}
                <span aria-hidden="true" className="arrow">
                  ↘
                </span>
              </MagneticButton>
              <MagneticButton
                className="button button-outline"
                href={GITHUB_LINKS.changelog}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('changelogFile')}
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </MagneticButton>
            </div>

            <div
              className={styles.provenanceStrip}
              aria-label={t('summaryAriaLabel')}
            >
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotSignal} aria-hidden="true" />
                {t('publishedSuite', { version: stats.latestPublishedVersion })}
              </span>
              <span className={styles.provenanceItem}>
                <span className={styles.provenanceDotForest} aria-hidden="true" />
                {t('publishedDate', { date: LATEST_PUBLISHED_DATE })}
              </span>
              <span className={styles.provenanceItem}>
                {t('editionStats', {
                  supported: String(stats.publishedCount),
                  major: String(SUPPORTED_MIN_MAJOR),
                  total: String(stats.totalReleases),
                })}
              </span>
            </div>
          </div>

          <HeroStageEntrance>
            <VersionDeck
              releases={releases}
              stats={stats}
              onJumpToRelease={handleJumpToRelease}
            />
          </HeroStageEntrance>
        </div>
      </section>

      <section className={styles.releasesSection} id="releases">
        <div className={`site-wrap ${styles.sectionWrap}`}>
          <div className={styles.sectionHeader} data-reveal="up">
            <div className={styles.sectionTitleBlock}>
              <p className="eyebrow">{t('historyEyebrow')}</p>
              <h2 className={styles.sectionHeading}>
                {t('historyTitle')} <span className="ital signal">{t('historyAccent')}</span>
              </h2>
            </div>
            <p className={styles.sectionCaption}>
              {t('historySummary', {
                total: String(stats.totalReleases),
                latest: String(stats.latestCount),
                major: String(stats.majorCount),
                features: String(stats.featureCount),
                historical: String(stats.historicalCount),
                deprecated: stats.deprecatedReleaseCount > 0
                  ? t('deprecatedSummary', { count: String(stats.deprecatedReleaseCount) })
                  : '',
                breaking: String(stats.breakingReleaseCount),
              })}
            </p>
          </div>

          <ReleaseFolio
            releases={releases}
            stats={stats}
            selectedAnchor={selectedAnchor}
            onSelectRelease={handleSelectRelease}
            filter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

          <aside
            className={styles.releasesNotice}
            data-reveal="up"
            aria-label={t('upgradeAriaLabel')}
          >
            <div className={styles.noticeCopy}>
              <span className={styles.noticeEyebrow}>
                {t('upgradeEyebrow')}
              </span>
              <p className={styles.noticeText}>
                {t('upgradeText')}
              </p>
            </div>
            <Link
              className={styles.noticeLink}
              href="/docs/migration-and-troubleshooting"
            >
              {t('upgradeGuide')}
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
