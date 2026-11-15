import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import Link from "next/link";
import { getCommunityGovernance } from '../data/service';
import type { ContributionPathway, ContributionPathwayId } from '../data/model';
import { GITHUB_LINKS, LATEST_PUBLISHED_VERSION } from "@core/config/site-config";
import {
  HeroStageEntrance,
  HeroTextReveal,
  MagneticButton,
} from "@core/motion";
import {
  CommunityContributionCurrent,
  CommunityStudySection,
} from './index';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('community.seo');
  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/community' },
  };
}

export default async function CommunityPage() {
  const t = await getTranslations('community.page');
  const tPathways = await getTranslations('community.pathways');
  const governance = getCommunityGovernance();
  const pathwayCopy: Record<ContributionPathwayId, Omit<ContributionPathway, 'id' | 'number' | 'href' | 'isExternal'>> = {
    'source-repo': { title: tPathways('source-repo.title'), summary: tPathways('source-repo.summary'), detail: tPathways('source-repo.detail', { version: LATEST_PUBLISHED_VERSION }), ctaLabel: tPathways('source-repo.ctaLabel'), tags: tPathways('source-repo.tags').split('\n') },
    'issue-tracker': { title: tPathways('issue-tracker.title'), summary: tPathways('issue-tracker.summary'), detail: tPathways('issue-tracker.detail'), ctaLabel: tPathways('issue-tracker.ctaLabel'), tags: tPathways('issue-tracker.tags').split('\n') },
    'pull-requests': { title: tPathways('pull-requests.title'), summary: tPathways('pull-requests.summary'), detail: tPathways('pull-requests.detail'), ctaLabel: tPathways('pull-requests.ctaLabel'), tags: tPathways('pull-requests.tags').split('\n') },
    'contributing-guide': { title: tPathways('contributing-guide.title'), summary: tPathways('contributing-guide.summary'), detail: tPathways('contributing-guide.detail'), ctaLabel: tPathways('contributing-guide.ctaLabel'), tags: tPathways('contributing-guide.tags').split('\n') },
    'security-policy': { title: tPathways('security-policy.title'), summary: tPathways('security-policy.summary'), detail: tPathways('security-policy.detail', { hours: governance.securitySlaHours }), ctaLabel: tPathways('security-policy.ctaLabel'), tags: tPathways('security-policy.tags').split('\n') },
    'documentation-hub': { title: tPathways('documentation-hub.title'), summary: tPathways('documentation-hub.summary'), detail: tPathways('documentation-hub.detail'), ctaLabel: tPathways('documentation-hub.ctaLabel'), tags: tPathways('documentation-hub.tags').split('\n') },
  };
  const pathways: ContributionPathway[] = governance.pathways.map((definition) => ({ ...definition, ...pathwayCopy[definition.id] }));

  return (
    <main id="main" data-page="community">
      <section
        aria-labelledby="v10-community-title"
        className="hero v10-community-hero"
      >
        <div className="site-wrap v10-community-grid">
          <div className="v10-community-copy">
            <p className="eyebrow">{t('heroEyebrow')}</p>
            <h1 id="v10-community-title">
              <HeroTextReveal as="span">
                {t('titleLead')}
                <br />
                {t('titleMain')}<span className="v10-period">.</span>
                <span className="v10-community-italic">
                  {t('titleAccent')}
                </span>
              </HeroTextReveal>
            </h1>
            <p className="v10-community-lead">
              {t('repoIntro', { scope: t('repoScope') })}
            </p>
            <div className="links">
              <MagneticButton
                className="button button-primary"
                href={GITHUB_LINKS.repo}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('exploreRepository')}
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </MagneticButton>
              <MagneticButton
                className="button button-outline"
                href={GITHUB_LINKS.issues}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('openIssues')}
                <span aria-hidden="true" className="arrow">
                  ↗
                </span>
              </MagneticButton>
            </div>
            <p className="mono v10-community-note">
              {t('noPrivateGate')}
            </p>
          </div>

          <HeroStageEntrance>
            <CommunityContributionCurrent
              pathways={pathways}
              governance={governance}
            />
          </HeroStageEntrance>
        </div>

        <div className="site-wrap v10-community-values">
          <div>
            <span>01</span>{t('valueRead')}
          </div>
          <div>
            <span>02</span>{t('valueTradeoff')}
          </div>
          <div>
            <span>03</span>{t('valueVerify')}
          </div>
        </div>
      </section>

      <section className="editorial-panel">
        <div className="site-wrap">
          <div className="section-head" data-reveal="up">
            <div>
              <p className="eyebrow">{t('pathwaysEyebrow')}</p>
              <h2>{t('pathwaysTitle')}</h2>
            </div>
            <p className="section-caption">
              {t('pathwaysCaption')}
            </p>
          </div>

          <div className="card-list" data-reveal="up">
            {pathways.map((pathway) =>
              pathway.isExternal ? (
                <a
                  key={pathway.id}
                  href={pathway.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="line-card"
                >
                  <span className="tiny index">
                    {t('pathNumber', { number: pathway.number })}
                  </span>
                  <h3>{pathway.title}</h3>
                  <small>{pathway.summary}</small>
                  <div className="community-tag-row">
                    {pathway.tags.map((tag) => (
                      <span key={tag} className="release-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </a>
              ) : (
                <Link
                  key={pathway.id}
                  href={pathway.href}
                  className="line-card"
                >
                  <span className="tiny index">
                    {t('pathNumber', { number: pathway.number })}
                  </span>
                  <h3>{pathway.title}</h3>
                  <small>{pathway.summary}</small>
                  <div className="community-tag-row">
                    {pathway.tags.map((tag) => (
                      <span key={tag} className="release-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              ),
            )}
          </div>

          <div className="community-governance-grid" data-reveal="up">
            <article className="community-governance-card">
              <span className="tiny signal">{t('contributingFile')}</span>
              <h3>{t('buildBaseline')}</h3>
              <p>
                {t('buildInstructions')}
              </p>
              <pre
                className="community-cmd-pre"
                tabIndex={0}
                data-lenis-prevent
              >
                <code>{governance.buildTestCommands.join("\n")}</code>
              </pre>
              <ul className="community-checklist">
                {t('checklist').split('\n').map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="links" style={{ marginBlockStart: 20 }}>
                <a
                  className="button button-outline"
                  href={GITHUB_LINKS.contributing}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('readContributing')}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </article>

            <article className="community-governance-card">
              <span className="tiny signal">
                {t('securitySupport')}
              </span>
              <h3>
                {t('responsibleDisclosure', {
                  hours: governance.securitySlaHours,
                })}
              </h3>
              <p>{t('codeOfConductSummary')}</p>
              <ul
                className="community-checklist"
                style={{ marginBlockStart: 14 }}
              >
                {t('securityScopes').split('\n').map((scope) => (
                  <li key={scope}>{scope}</li>
                ))}
              </ul>
              <div className="links" style={{ marginBlockStart: 20 }}>
                <a
                  className="button button-primary"
                  href={GITHUB_LINKS.advisories}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('openAdvisory')}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
                <a
                  className="button button-outline"
                  href={governance.buyMeACoffeeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('supportCoffee')}
                  <span aria-hidden="true" className="arrow">
                    ↗
                  </span>
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <CommunityStudySection />
    </main>
  );
}
