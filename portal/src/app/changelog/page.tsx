import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllChangelogReleases,
  getChangelogStats,
} from "@/lib/changelog";
import { GITHUB_LINKS } from "@/lib/site-config";
import { ReleaseFolio, VersionDeck } from "@/components/scenes/changelog";
import metaStyles from "@/components/scenes/changelog/ChangelogMeta.module.css";

export const metadata: Metadata = {
  title: "Changelog",
  description:
    "Full AstraFlow release history parsed from CHANGELOG.md with explicit provenance separating published NuGet 2.3.0 releases from unreleased 2.4.0 source milestones.",
  alternates: {
    canonical: "/changelog",
  },
};

export default function ChangelogPage() {
  const releases = getAllChangelogReleases();
  const stats = getChangelogStats();

  return (
    <main id="main" data-page="changelog">
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div className={metaStyles.heroColumn}>
            <p className="eyebrow">RELEASE CHRONICLE</p>
            <h1>
              Every version.
              <span className="ital">Accounted for.</span>
            </h1>
            <p className="lead">
              Parsed directly from CHANGELOG.md with explicit provenance: NuGet{" "}
              {stats.latestPublishedVersion} is published and verified,{" "}
              {stats.latestUnreleasedVersion} is active unreleased source, and
              every breaking change stays visible.
            </p>
            <div className="links">
              <a className="button button-primary" href="#releases">
                Inspect release folio
                <span aria-hidden="true" className="arrow">
                  ↓
                </span>
              </a>
              <a
                className="button button-outline"
                href={GITHUB_LINKS.changelog}
                target="_blank"
                rel="noopener noreferrer"
              >
                View CHANGELOG.md
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
            </div>

            <div
              className={metaStyles.provenancePills}
              aria-label="Release provenance summary"
            >
              <span className={metaStyles.provenancePill}>
                <span className={metaStyles.provenanceDot} aria-hidden="true" />
                {stats.latestPublishedVersion} Latest NuGet
              </span>
              <span className={metaStyles.provenancePill}>
                <span
                  className={`${metaStyles.provenanceDot} ${metaStyles.provenanceDotSignal}`}
                  aria-hidden="true"
                />
                {stats.latestUnreleasedVersion} Unreleased Source
              </span>
              <span className={metaStyles.provenancePill}>
                {stats.totalReleases} Recorded Versions
              </span>
            </div>
          </div>

          <VersionDeck releases={releases} stats={stats} />
        </div>
      </section>

      <section className="editorial-panel" id="releases">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">01 / RELEASE FOLIO</p>
              <h2>Progress, with provenance.</h2>
            </div>
            <p className="section-caption">
              Inspecting all {stats.totalReleases} entries parsed from
              CHANGELOG.md ({stats.publishedCount} published/historical,{" "}
              {stats.unreleasedCount} unreleased source,{" "}
              {stats.breakingReleaseCount} with breaking changes).
            </p>
          </div>

          <ReleaseFolio releases={releases} stats={stats} />

          <aside
            className={metaStyles.accuracyNotice}
            data-reveal="up"
            aria-label="Release accuracy and provenance policy"
          >
            <div className={metaStyles.accuracyCopy}>
              <span className={metaStyles.accuracyEyebrow}>
                RELEASE ACCURACY &amp; PROVENANCE
              </span>
              <p className={metaStyles.accuracyText}>
                NuGet publication ({stats.latestPublishedVersion} on
                2026-11-10), active source development (
                {stats.latestUnreleasedVersion}), and GitHub Release tags
                without full package parity (2.1.0) are tracked distinctly.
                Always verify package IDs before upgrading production hosts.
              </p>
            </div>
            <Link
              className={metaStyles.accuracyLink}
              href="/docs/version-upgrade-guide"
            >
              Read upgrade guide ↗
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
