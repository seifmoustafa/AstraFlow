import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CliCopyPill,
  DocsHeroDesk,
  DocsSearch,
} from '@/components/scenes/docs';
import docsStyles from '@/components/scenes/docs/DocsSearch.module.css';
import { getAllDocs, getDocCategories } from '@/lib/docs';
import { LATEST_PUBLISHED_VERSION } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Search and browse verified AstraFlow guides, package deep dives, compatibility tables, and Architecture Decision Records generated directly from repository markdown.',
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsIndexPage() {
  const allDocs = getAllDocs();
  const categories = getDocCategories();
  const quickStartCommand = `dotnet add package AstraFlow.Mediator --version ${LATEST_PUBLISHED_VERSION}`;

  return (
    <main id="main" data-page="docs">
      <section className="hero">
        <div className="site-wrap page-intro grid">
          <div>
            <p className="eyebrow">DOCUMENTATION / VERIFIED SOURCE</p>
            <h1>
              Read less. <span className="ital">Understand faster.</span>
            </h1>
            <p className="lead">
              Every guide, integration reference, benchmark methodology, and Architecture Decision Record in this portal is indexed straight from the AstraFlow repository with draft notes and historical planning docs stripped out.
            </p>
            <div className="cta-row">
              <Link className="button button-primary" href="/docs/getting-started">
                Quick start ↗
              </Link>
              <a className="button button-outline" href="#living-desk">
                Search docs ↓
              </a>
            </div>

            <dl className={docsStyles.heroStatsStrip}>
              <div className={docsStyles.heroStatItem}>
                <dt className={docsStyles.heroStatLabel}>Verified guides &amp; ADRs</dt>
                <dd className={docsStyles.heroStatValue}>{allDocs.length}</dd>
              </div>
              <div className={docsStyles.heroStatItem}>
                <dt className={docsStyles.heroStatLabel}>Architectural tracks</dt>
                <dd className={docsStyles.heroStatValue}>{categories.length}</dd>
              </div>
              <div className={docsStyles.heroStatItem}>
                <dt className={docsStyles.heroStatLabel}>Draft noise</dt>
                <dd className={docsStyles.heroStatValue}>Zero</dd>
              </div>
            </dl>
          </div>

          <DocsHeroDesk docs={allDocs} />
        </div>
      </section>

      <section id="living-desk" className="section">
        <div className="site-wrap">
          <div className="section-head">
            <p className="eyebrow">01 / LIVING REFERENCE DESK</p>
            <h2>Search, filter, and preview before you open a page.</h2>
            <p className="lead">
              Press <kbd>/</kbd> or <kbd>Ctrl+K</kbd> to jump straight to the search bar, filter by architectural track, and inspect section headings or starter code right in the Reference Lens.
            </p>
          </div>

          <DocsSearch docs={allDocs} categories={categories} />
        </div>
      </section>

      <section id="category-index" className={docsStyles.directorySection}>
        <div className="site-wrap">
          <header className={docsStyles.directoryHeader}>
            <p className="eyebrow">02 / COMPLETE CURATED DIRECTORY</p>
            <h2 className={docsStyles.directoryTitle}>
              All {allDocs.length} guides across {categories.length} tracks.
            </h2>
            <p className={docsStyles.directoryLead}>
              Ordered from your first handler in Getting Started through Explicit Mapping, Integrations, Diagnostics &amp; Testing, Operational Reference, and locked Architecture Decision Records.
            </p>
          </header>

          <div className={docsStyles.directoryGrid}>
            {categories.map((group, groupIndex) => (
              <section
                key={group.category}
                className={docsStyles.directoryCard}
                aria-label={`${group.category} directory`}
              >
                <div className={docsStyles.directoryCardHead}>
                  <span className={docsStyles.directoryCatNum}>
                    {String(groupIndex + 1).padStart(2, '0')}
                  </span>
                  <span className={docsStyles.directoryCatCount}>
                    {group.docs.length} {group.docs.length === 1 ? 'doc' : 'docs'}
                  </span>
                </div>
                <h3 className={docsStyles.directoryCatTitle}>{group.category}</h3>
                <ul className={docsStyles.directoryList}>
                  {group.docs.map((doc) => (
                    <li key={doc.slugPath}>
                      <Link href={doc.href} className={docsStyles.directoryItemLink}>
                        <span>{doc.title}</span>
                        <span className={docsStyles.directoryItemMeta}>
                          {doc.isUnreleasedSource ? '2.4.0 · ' : ''}
                          {doc.readingMinutes}m
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className={docsStyles.tenMinutesBand} aria-label="The first ten minutes">
        <div className={`site-wrap ${docsStyles.tenMinutesInner}`}>
          <p className={docsStyles.tenMinutesEyebrow}>THE FIRST TEN MINUTES</p>
          <h2 className={docsStyles.tenMinutesHeading}>
            Install one package,{' '}
            <span className={docsStyles.tenMinutesItalic}>wire one handler,</span>{' '}
            run one test.
          </h2>
          <p className={docsStyles.tenMinutesLead}>
            Start with source-generated dispatch on .NET {LATEST_PUBLISHED_VERSION} without pulling in unnecessary abstractions or runtime reflection scanners.
          </p>
          <div className={docsStyles.tenMinutesActions}>
            <CliCopyPill command={quickStartCommand} />
            <Link href="/docs/getting-started" className={docsStyles.tenMinutesCta}>
              Open Getting Started ↗
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
