import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@core/motion';
import { CliCopyPill } from '@modules/documentation/article';
import { DocsHeroDesk } from './DocsHeroDesk';
import { DocsSearch } from './DocsSearch';
import heroStyles from './DocsHeroDesk.module.css';
import searchStyles from './DocsSearch.module.css';
import {
  DOC_CATEGORY_MESSAGE_KEYS,
  getAllDocs,
  getDocCategories,
} from '@modules/documentation/data';
import { getAllPackages } from '@modules/catalog/packages';
import { LATEST_PUBLISHED_VERSION } from '@core/config/site-config';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('documentation.index');
  return {
    title: t('metadataTitle'),
    description: t('metadataDescription'),
    alternates: { canonical: '/docs' },
  };
}

export default async function DocsIndexPage() {
  const t = await getTranslations('documentation.index');
  const tCategory = await getTranslations('documentation.categories');
  const allDocs = getAllDocs();
  const packages = getAllPackages();
  const categories = getDocCategories();
  const quickStartCommand = `dotnet add package AstraFlow.Mediator --version ${LATEST_PUBLISHED_VERSION}`;

  return (
    <main id="main" data-page="docs">
      <section className={`hero ${heroStyles.subhero}`}>
        <div className={`site-wrap ${heroStyles.subheroGrid}`}>
          <div className={heroStyles.heroCopy}>
            <p className="eyebrow">{t('eyebrow')}</p>
            <HeroTextReveal as="h1" className={heroStyles.heroTitle}>
              {t('titleLead')}{' '}
              <span className={`ital signal ${heroStyles.heroTitleEm}`}>
                {t('titleAccent')}
              </span>
            </HeroTextReveal>
            <HeroTextReveal
              as="p"
              className={heroStyles.heroLead}
              delayMs={90}
            >
              {t('lead')}
            </HeroTextReveal>
            <div className={heroStyles.heroActions}>
              <MagneticButton
                className="button button-primary"
                href="/docs/getting-started"
              >
                {t('startBasics')} <span aria-hidden="true" className="arrow">↗</span>
              </MagneticButton>
              <MagneticButton className="button button-outline" href="#reference">
                {t('exploreReference')} <span aria-hidden="true" className="arrow">↓</span>
              </MagneticButton>
            </div>
            <div className={heroStyles.heroStrip}>
              <span>{t('productGuides', { count: String(allDocs.length) })}</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>{t('productTracks', { count: String(categories.length) })}</span>
              <span aria-hidden="true" className={heroStyles.heroStripDot}>
                ·
              </span>
              <span>{t('packages', { count: String(packages.length) })}</span>
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
            <p className="eyebrow">{t('referenceEyebrow')}</p>
            <h2 className={searchStyles.sectionTitle}>
              {t('referenceTitleLead')}{' '}
              <span className="ital signal">{t('referenceTitleAccent')}</span>
            </h2>
            <p className={searchStyles.sectionIntroLead}>
              {t('referenceLead')}
            </p>
          </header>

          <DocsSearch docs={allDocs} categories={categories} />
        </div>
      </section>

      <section id="category-index" className={searchStyles.tracksSection}>
        <div className="site-wrap">
          <header className={searchStyles.tracksHeader} data-reveal="up">
            <p className="eyebrow">{t('tracksEyebrow')}</p>
            <h2 className={searchStyles.tracksTitle}>
              {t('tracksTitleLead')}{' '}
              <span className="ital signal">{t('tracksTitleAccent')}</span>
            </h2>
            <p className={searchStyles.tracksLead}>
              {t('tracksLead')}
            </p>
          </header>

          <div className={searchStyles.tracksGrid}>
            {categories.map((group, groupIndex) => (
              <section
                aria-label={t('trackAriaLabel', {
                  category: tCategory(DOC_CATEGORY_MESSAGE_KEYS[group.category]),
                })}
                className={searchStyles.trackShelf}
                data-reveal="up"
                key={group.category}
              >
                <div className={searchStyles.trackShelfHead}>
                  <span className={searchStyles.trackShelfNum}>
                    {t('trackNumber', { number: String(groupIndex + 1).padStart(2, '0') })}
                  </span>
                  <span className={searchStyles.trackShelfCount}>
                    {group.docs.length} {t(group.docs.length === 1 ? 'guide' : 'guides')}
                  </span>
                </div>
                <h3 className={searchStyles.trackShelfTitle}>
                  {tCategory(DOC_CATEGORY_MESSAGE_KEYS[group.category])}
                </h3>
                <ul className={searchStyles.trackShelfList}>
                  {group.docs.map((doc) => (
                    <li key={doc.slugPath}>
                      <Link className={searchStyles.trackShelfLink} href={doc.href}>
                        <span>{doc.title}</span>
                        <span className={searchStyles.trackShelfMeta}>
                          {t('minutes', { count: String(doc.readingMinutes) })}
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

      <section className={searchStyles.calloutOuter} aria-label={t('tenMinutesAria')}>
        <div className="site-wrap">
          <div className={searchStyles.docsCallout} data-reveal="up">
            <div className={searchStyles.docsCalloutCopy}>
              <p className={searchStyles.calloutEyebrow}>{t('tenMinutesEyebrow')}</p>
              <h2 className={searchStyles.calloutHeading}>
                {t('tenMinutesTitle')}{' '}
                <span className={searchStyles.calloutItalic}>
                  {t('tenMinutesAccent')}
                </span>
              </h2>
              <p className={searchStyles.calloutLead}>
                {t('tenMinutesLead', { version: LATEST_PUBLISHED_VERSION })}
              </p>
            </div>

            <div className={searchStyles.docsCalloutActions}>
              <CliCopyPill command={quickStartCommand} />
              <Link className={searchStyles.calloutCta} href="/docs/getting-started">
                {t('readGettingStarted')} ↗
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
