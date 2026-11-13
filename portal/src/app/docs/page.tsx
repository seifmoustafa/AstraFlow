import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CliCopyPill,
  DocsHeroDesk,
  DocsSearch,
} from '@/components/scenes/docs';
import heroStyles from '@/components/scenes/docs/DocsHeroDesk.module.css';
import searchStyles from '@/components/scenes/docs/DocsSearch.module.css';
import { getAllDocs, getDocCategories } from '@/lib/docs';
import { LATEST_PUBLISHED_VERSION } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'Documentation',
  description:
    'Search and browse verified AstraFlow guides, package deep dives, compatibility baselines, and Architecture Decision Records generated directly from repository markdown.',
  alternates: {
    canonical: '/docs',
  },
};

export default function DocsIndexPage() {
  const allDocs = getAllDocs();
  const categories = getDocCategories();
  const adrCount =
    categories.find((group) => group.category === 'Architecture Decisions (ADRs)')
      ?.docs.length ?? 0;
  const quickStartCommand = `dotnet add package AstraFlow.Mediator --version ${LATEST_PUBLISHED_VERSION}`;

  return (
    <main id="main" data-page="docs">
      <section className={`hero ${heroStyles.subhero}`}>
        <div className={`site-wrap ${heroStyles.subheroGrid}`}>
          <div className={heroStyles.heroCopy}>
            <p className="eyebrow">THE DOCUMENTATION / ORIGINAL SOURCES</p>
            <h1 className={heroStyles.heroTitle}>
              Understand it.{' '}
              <span className={`ital signal ${heroStyles.heroTitleEm}`}>
                Then build it.
              </span>
            </h1>
            <p className={heroStyles.heroLead}>
              Start with a request. Follow the API. Examine the trade-offs. Practical documentation that works like an instrument — not another marketing poster.
            </p>
            <div className={heroStyles.heroActions}>
              <Link className="button button-primary" href="/docs/getting-started">
                Start with the basics ↗
              </Link>
              <a className="button button-outline" href="#reference">
                Explore the reference ↓
              </a>
            </div>
            <div className={heroStyles.heroStrip}>
              <span>{allDocs.length} SOURCE GUIDES</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>{categories.length} CURATED TRACKS</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>{adrCount} ARCHITECTURE ADRS</span>
            </div>
          </div>

          <DocsHeroDesk docs={allDocs} />
        </div>
      </section>

      <section id="reference" className={searchStyles.referenceSection}>
        <div className="site-wrap">
          <header className={searchStyles.sectionHeader}>
            <p className="eyebrow">01 / LIVING REFERENCE DESK</p>
            <h2 className={searchStyles.sectionTitle}>
              Find the answer.{' '}
              <span className="ital signal">Follow the source.</span>
            </h2>
            <p className={searchStyles.sectionIntroLead}>
              Search the real documentation. Move with your keyboard. Open source-backed articles, inspect headings, and copy starter C# snippets without leaving the desk.
            </p>
          </header>

          <DocsSearch docs={allDocs} categories={categories} />
        </div>
      </section>

      <section id="category-index" className={searchStyles.tracksSection}>
        <div className="site-wrap">
          <header className={searchStyles.tracksHeader}>
            <p className="eyebrow">02 / CURATED SOURCE TRACKS</p>
            <h2 className={searchStyles.tracksTitle}>
              Six tracks, <span className="ital signal">zero draft clutter.</span>
            </h2>
            <p className={searchStyles.tracksLead}>
              Every curated guide and Architecture Decision Record organized from your first compiled request to release operations and locked architectural records.
            </p>
          </header>

          <div className={searchStyles.tracksGrid}>
            {categories.map((group, groupIndex) => (
              <section
                aria-label={`${group.category} documentation track`}
                className={searchStyles.trackShelf}
                key={group.category}
              >
                <div className={searchStyles.trackShelfHead}>
                  <span className={searchStyles.trackShelfNum}>
                    TRACK {String(groupIndex + 1).padStart(2, '0')}
                  </span>
                  <span className={searchStyles.trackShelfCount}>
                    {group.docs.length} {group.docs.length === 1 ? 'guide' : 'guides'}
                  </span>
                </div>
                <h3 className={searchStyles.trackShelfTitle}>{group.category}</h3>
                <ul className={searchStyles.trackShelfList}>
                  {group.docs.map((doc) => (
                    <li key={doc.slugPath}>
                      <Link className={searchStyles.trackShelfLink} href={doc.href}>
                        <span>{doc.title}</span>
                        <span className={searchStyles.trackShelfMeta}>
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

      <section className={searchStyles.calloutOuter} aria-label="The first ten minutes">
        <div className="site-wrap">
          <div className={searchStyles.docsCallout}>
            <div className={searchStyles.docsCalloutCopy}>
              <p className={searchStyles.calloutEyebrow}>THE FIRST TEN MINUTES</p>
              <h2 className={searchStyles.calloutHeading}>
                Get a request{' '}
                <span className={searchStyles.calloutItalic}>
                  through the system.
                </span>
              </h2>
              <p className={searchStyles.calloutLead}>
                Install the generated mediator on .NET {LATEST_PUBLISHED_VERSION}, register your handler assembly, and run your first verified slice in one pass.
              </p>
            </div>

            <div className={searchStyles.docsCalloutActions}>
              <CliCopyPill command={quickStartCommand} />
              <Link className={searchStyles.calloutCta} href="/docs/getting-started">
                Read getting started ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
