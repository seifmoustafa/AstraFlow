import type { Metadata } from 'next';
import Link from 'next/link';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@/components/motion';
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
    'Search and browse verified AstraFlow guides, package deep dives, mapping patterns, framework integrations, and diagnostics references.',
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
      <section className={`hero ${heroStyles.subhero}`}>
        <div className={`site-wrap ${heroStyles.subheroGrid}`}>
          <div className={heroStyles.heroCopy}>
            <p className="eyebrow">THE DOCUMENTATION / PRODUCT REFERENCE</p>
            <HeroTextReveal as="h1" className={heroStyles.heroTitle}>
              Understand it.{' '}
              <span className={`ital signal ${heroStyles.heroTitleEm}`}>
                Then build it.
              </span>
            </HeroTextReveal>
            <HeroTextReveal
              as="p"
              className={heroStyles.heroLead}
              delayMs={90}
            >
              Start with a request. Follow the API. Examine the trade-offs. Practical documentation that works like an instrument — not another marketing poster.
            </HeroTextReveal>
            <div className={heroStyles.heroActions}>
              <MagneticButton
                className="button button-primary"
                href="/docs/getting-started"
              >
                Start with the basics <span aria-hidden="true" className="arrow">↗</span>
              </MagneticButton>
              <MagneticButton className="button button-outline" href="#reference">
                Explore the reference <span aria-hidden="true" className="arrow">↓</span>
              </MagneticButton>
            </div>
            <div className={heroStyles.heroStrip}>
              <span>{allDocs.length} PRODUCT GUIDES</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>{categories.length} PRODUCT TRACKS</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>16 .NET PACKAGES</span>
            </div>
          </div>

          <HeroStageEntrance>
            <DocsHeroDesk docs={allDocs} />
          </HeroStageEntrance>
        </div>
      </section>

      <section id="reference" className={searchStyles.referenceSection}>
        <div className="site-wrap">
          <header className={searchStyles.sectionHeader} data-reveal="up">
            <p className="eyebrow">01 / LIVING REFERENCE DESK</p>
            <h2 className={searchStyles.sectionTitle}>
              Find the answer.{' '}
              <span className="ital signal">Follow the API.</span>
            </h2>
            <p className={searchStyles.sectionIntroLead}>
              Search the complete product documentation. Move with your keyboard. Open focused guides, inspect headings, and copy starter C# snippets without leaving the desk.
            </p>
          </header>

          <DocsSearch docs={allDocs} categories={categories} />
        </div>
      </section>

      <section id="category-index" className={searchStyles.tracksSection}>
        <div className="site-wrap">
          <header className={searchStyles.tracksHeader} data-reveal="up">
            <p className="eyebrow">02 / CURATED PRODUCT TRACKS</p>
            <h2 className={searchStyles.tracksTitle}>
              Five tracks, <span className="ital signal">zero draft clutter.</span>
            </h2>
            <p className={searchStyles.tracksLead}>
              Every AstraFlow guide organized from your first compiled request through explicit mapping, framework integrations, diagnostics, and tooling.
            </p>
          </header>

          <div className={searchStyles.tracksGrid}>
            {categories.map((group, groupIndex) => (
              <section
                aria-label={`${group.category} documentation track`}
                className={searchStyles.trackShelf}
                data-reveal="up"
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
          <div className={searchStyles.docsCallout} data-reveal="up">
            <div className={searchStyles.docsCalloutCopy}>
              <p className={searchStyles.calloutEyebrow}>THE FIRST TEN MINUTES</p>
              <h2 className={searchStyles.calloutHeading}>
                Get a request{' '}
                <span className={searchStyles.calloutItalic}>
                  through the system.
                </span>
              </h2>
              <p className={searchStyles.calloutLead}>
                Install AstraFlow.Mediator {LATEST_PUBLISHED_VERSION}, register your handler assembly, and run your first verified slice in one pass.
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
