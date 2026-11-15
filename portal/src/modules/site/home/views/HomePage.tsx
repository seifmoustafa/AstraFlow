import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from 'next-intl/server';
import { MagneticButton } from "@core/motion";
import { SignalArchitectureHero } from './hero/SignalArchitectureHero';
import {
  HomeDetailsMatterSection,
  HomeExplodedArchitecture,
  LivingFlowAtlas,
} from './scenes';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('site.home.seo');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/' },
  };
}

const PROOF_ITEMS = [
  {
    num: "01",
    title: 'proofs.explicitTitle',
    caption: 'proofs.explicitCaption',
  },
  {
    num: "02",
    title: 'proofs.composableTitle',
    caption: 'proofs.composableCaption',
  },
  {
    num: "03",
    title: 'proofs.predictableTitle',
    caption: 'proofs.predictableCaption',
  },
] as const;

const MODULE_CARDS = [
  {
    index: "01 / REQUEST",
    title: 'moduleCards.mediatorTitle',
    summary: 'moduleCards.mediatorSummary',
    href: "/packages#directory",
  },
  {
    index: "02 / MAPPING",
    title: 'moduleCards.mapperTitle',
    summary: 'moduleCards.mapperSummary',
    href: "/packages#directory",
  },
  {
    index: "03 / INSPECTION",
    title: 'moduleCards.diagnosticsTitle',
    summary: 'moduleCards.diagnosticsSummary',
    href: "/packages#directory",
  },
  {
    index: "04 / CONFIDENCE",
    title: 'moduleCards.testingTitle',
    summary: 'moduleCards.testingSummary',
    href: "/packages#directory",
  },
  {
    index: "05 / BUILD TIME",
    title: 'moduleCards.generatorsTitle',
    summary: 'moduleCards.generatorsSummary',
    href: "/packages#directory",
  },
  {
    index: "06 / TOOLING",
    title: 'moduleCards.toolingTitle',
    summary: 'moduleCards.toolingSummary',
    href: "/packages#directory",
  },
] as const;

export default async function HomePage() {
  const t = await getTranslations('site.home.page');

  return (
    <main id="main" data-page="home">
      <SignalArchitectureHero />

      <div className="proof-strip-band">
        <div className="site-wrap">
          <div className="proof-strip">
            {PROOF_ITEMS.map((item) => (
              <div key={item.num} className="proof">
                <span className="num">{item.num}</span>
                <div>
                  <strong>{t(item.title)}</strong>
                  <small>{t(item.caption)}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LivingFlowAtlas />

      <HomeExplodedArchitecture />

      <section className="editorial-panel v10-modules-section">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">{t('modulesEyebrow')}</p>
              <h2>
                {t('modulesTitle')}
                <br />
                <span className="v10-ital">{t('modulesTitleAccent')}</span>
              </h2>
            </div>
            <p className="section-caption">
              {t('modulesCaption')}
            </p>
          </div>

          <div className="card-list">
            {MODULE_CARDS.map((card, idx) => (
              <Link
                key={card.index}
                className="line-card"
                href={card.href}
                data-reveal="up"
                data-reveal-delay={String(idx * 45)}
              >
                <span className="index tiny">{card.index}</span>
                <h3>{t(card.title)}</h3>
                <small>{t(card.summary)}</small>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <HomeDetailsMatterSection />

      <section
        className="ending-cta-band"
        aria-labelledby="ending-cta-heading"
      >
        <div className="site-wrap ending-cta-inner">
          <div className="ending-cta-copy" data-reveal="up">
            <p className="eyebrow">{t('actionEyebrow')}</p>
            <h2 id="ending-cta-heading">
              {t('actionTitle')}
              <br />
              <span className="v10-ital">{t('actionTitleAccent')}</span>
            </h2>
            <p>
              {t('actionBody')}
            </p>
          </div>
          <div className="ending-cta-actions" data-reveal="up">
            <MagneticButton
              className="button button-primary"
              href="/docs/getting-started"
            >
              {t('readQuickStart')}{" "}
              <span className="cta-arrow" aria-hidden="true">
                ↗
              </span>
            </MagneticButton>
            <MagneticButton className="button button-outline" href="/packages">
              {t('explorePackages')}{" "}
              <span className="cta-arrow" aria-hidden="true">
                ↗
              </span>
            </MagneticButton>
          </div>
        </div>
      </section>
    </main>
  );
}
