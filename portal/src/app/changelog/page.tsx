import type { Metadata } from "next";
import Link from "next/link";
import {
  getAllChangelogReleases,
  getChangelogStats,
} from "@/lib/changelog";
import {
  ChangelogChronicle,
  ChangelogFolioHero,
} from "@/components/scenes/changelog";

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
          <div>
            <p className="eyebrow">THE RECORD / NOT THE HYPE</p>
            <h1>
              Every version.
              <span className="ital">An honest story.</span>
            </h1>
            <p className="lead">
              Parsed directly from CHANGELOG.md with truthful provenance: NuGet{" "}
              {stats.latestPublishedVersion} is published and verified,{" "}
              {stats.latestUnreleasedVersion} is active unreleased source, and
              every breaking change stays visible.
            </p>
            <div className="links">
              <a className="button button-primary" href="#releases">
                Explore the chronology
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </a>
              <Link className="button button-outline" href="/docs/version-upgrade-guide">
                Upgrade guide
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </Link>
            </div>
          </div>

          <ChangelogFolioHero releases={releases} stats={stats} />
        </div>
      </section>

      <section className="editorial-panel" id="releases">
        <div className="site-wrap">
          <div className="section-head">
            <div>
              <p className="eyebrow">A LIVING HISTORY</p>
              <h2>Progress, with provenance.</h2>
            </div>
            <p className="section-caption">
              Showing all {stats.totalReleases} tracked releases from
              CHANGELOG.md ({stats.publishedCount} published/historical,{" "}
              {stats.unreleasedCount} unreleased source,{" "}
              {stats.breakingReleaseCount} with breaking changes).
            </p>
          </div>

          <ChangelogChronicle releases={releases} stats={stats} />
        </div>
      </section>
    </main>
  );
}
