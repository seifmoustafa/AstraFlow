import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getLearningMilestones } from '../data/presentation';
import type {
  LearningMilestoneCopy,
  LearningMilestoneId,
  PresentedLearningMilestone,
} from '../data/model';
import { LATEST_PUBLISHED_VERSION } from '@core/config/site-config';
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from '@core/motion';
import {
  GuidesHeroQuickJump,
  GuidesKineticRunway,
} from './index';
import styles from './GuidesKineticRunway.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('learning.guides.seo');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/guides' },
  };
}

const PRACTICAL_PATHS = [
  { key: 'request', href: '/docs/getting-started' },
  { key: 'pipeline', href: '/docs/pipelines' },
  { key: 'data', href: '/docs/mapper' },
  { key: 'inspection', href: '/docs/diagnostics' },
  { key: 'confidence', href: '/docs/testing' },
  { key: 'migration', href: '/docs/migration-and-troubleshooting' },
] as const;

export default async function GuidesPage() {
  const t = await getTranslations('learning.guides.page');
  const milestoneT = await getTranslations('learning.guides.milestones');
  const milestones = getLearningMilestones();
  type MilestoneCopyField =
    | 'title'
    | 'shortTitle'
    | 'subtitle'
    | 'summary'
    | 'keyConcepts'
    | 'docLabel'
    | 'secondaryLabels';
  const milestoneText = milestoneT as unknown as (
    key: `${LearningMilestoneId}.${MilestoneCopyField}`,
  ) => string;
  const getMilestoneCopy = (
    id: LearningMilestoneId,
  ): LearningMilestoneCopy => ({
    title: milestoneText(`${id}.title`),
    shortTitle: milestoneText(`${id}.shortTitle`),
    subtitle: milestoneText(`${id}.subtitle`),
    summary: milestoneText(`${id}.summary`),
    keyConcepts: milestoneText(`${id}.keyConcepts`).split('\n'),
    docLabel: milestoneText(`${id}.docLabel`),
    secondaryLabels: milestoneText(`${id}.secondaryLabels`).split('\n'),
  });
  const presentedMilestones: PresentedLearningMilestone[] = milestones.map(
    (milestone) => {
      const copy = getMilestoneCopy(milestone.id);
      return {
        ...milestone,
        ...copy,
        keyConcepts: copy.keyConcepts.map((concept) =>
          concept.replaceAll('{version}', LATEST_PUBLISHED_VERSION),
        ),
        secondaryLinks: milestone.secondaryLinkHrefs.map((href, index) => ({
          href,
          label: copy.secondaryLabels[index] ?? copy.docLabel,
        })),
      };
    },
  );
  const paths = PRACTICAL_PATHS.map(({ key, href }) => ({
    href,
    eyebrow: t(`paths.${key}.eyebrow`),
    title: t(`paths.${key}.title`),
    description: t(`paths.${key}.description`),
  }));

  return (
    <main id="main" data-page="guides">
      <section className={`hero ${styles.heroSection}`}>
        <div className="site-wrap">
          <div className={styles.heroHeaderGrid}>
            <div className={styles.heroCopy}>
              <p className="eyebrow">{t('heroEyebrow')}</p>
              <HeroTextReveal as="h1" className={styles.heroTitle}>
                {t('titleLead')}
                <br />
                <span className="ital signal">{t('titleAccent')}</span>
              </HeroTextReveal>
              <p className={styles.heroLead}>{t('heroLead')}</p>
              <div className={styles.heroLinks}>
                <MagneticButton
                  className="button button-primary"
                  href="#guides-runway"
                >
                  {t('startMilestone')}
                  <span aria-hidden="true" className="arrow">
                    ↓
                  </span>
                </MagneticButton>
                <MagneticButton
                  className="button button-outline"
                  href="/docs/getting-started"
                >
                  {t('gettingStarted')}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </MagneticButton>
              </div>
            </div>

            <HeroStageEntrance>
              <GuidesHeroQuickJump
                milestones={presentedMilestones.map(({ id, stepNumber, shortTitle }) => ({
                  id,
                  stepNumber,
                  shortTitle,
                }))}
              />
            </HeroStageEntrance>
          </div>

          <GuidesKineticRunway milestones={presentedMilestones} />
        </div>
      </section>

      <section className={styles.pathsSection}>
        <div className="site-wrap">
          <div className={styles.pathsHead} data-reveal="up">
            <div>
              <p className="eyebrow">{t('pathsEyebrow')}</p>
              <h2 className={styles.pathsTitle}>
                {t('pathsTitleLead')}{' '}
                <span className="ital signal">{t('pathsTitleAccent')}</span>
              </h2>
            </div>
            <p className={styles.pathsCaption}>{t('pathsCaption')}</p>
          </div>

          <div className={styles.journeyCards}>
            {paths.map((pathItem) => (
              <Link
                key={pathItem.href}
                href={pathItem.href}
                data-reveal="up"
                className={styles.journeyCard}
              >
                <div className={styles.journeyCardTop}>
                  <span>{pathItem.eyebrow}</span>
                  <span className={styles.journeyCardArrow} aria-hidden="true">
                    ↗
                  </span>
                </div>
                <h3>{pathItem.title}</h3>
                <p>{pathItem.description}</p>
                <span className={styles.journeyCardBottom}>{t('readGuide')}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
