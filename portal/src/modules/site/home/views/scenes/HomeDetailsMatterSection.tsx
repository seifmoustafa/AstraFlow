'use client';
import { Button } from '@core/ui';
import { useTranslations } from 'next-intl';

import { Exploded } from '@lucasmarkes/hairline/react';
import { useId, useState, type CSSProperties } from 'react';
import { useReducedMotionSafe } from '@core/hairline';
import { MagneticButton } from '@core/motion';
import styles from './HomeDetailsMatterSection.module.css';

export type DetailsPlaneIndex = 0 | 1 | 2;

interface PlaneFocusSpec {
  readonly index: DetailsPlaneIndex;
  readonly labelKey: 'planeContracts' | 'planeExecution' | 'planeVerification';
  readonly tagKey: 'planeContractsTag' | 'planeExecutionTag' | 'planeVerificationTag';
  readonly summaryKey: 'planeContractsSummary' | 'planeExecutionSummary' | 'planeVerificationSummary';
  readonly packages: string;
}

const PLANE_SPECS: readonly PlaneFocusSpec[] = [
  {
    index: 0,
    labelKey: 'planeContracts',
    tagKey: 'planeContractsTag',
    summaryKey: 'planeContractsSummary',
    packages: 'AstraFlow.Contracts',
  },
  {
    index: 1,
    labelKey: 'planeExecution',
    tagKey: 'planeExecutionTag',
    summaryKey: 'planeExecutionSummary',
    packages: 'AstraFlow.Mediator · AstraFlow.Mapper',
  },
  {
    index: 2,
    labelKey: 'planeVerification',
    tagKey: 'planeVerificationTag',
    summaryKey: 'planeVerificationSummary',
    packages: 'AstraFlow.Diagnostics · AstraFlow.Analyzers',
  },
] as const;

const HAIRLINE_WARM_FOREST_STYLE = {
  '--hairline-plate': '#ede5d8',
  '--hairline-hi': '#fffdf8',
  '--hairline-edge': '#93a79a',
  '--hairline-mid': '#e2d8c7',
  '--hairline-lo': '#d3c7b3',
  '--hairline-stroke': '#15352a',
} as CSSProperties;

export interface HomeDetailsMatterSectionProps {
  readonly className?: string;
}

export function HomeDetailsMatterSection({
  className,
}: HomeDetailsMatterSectionProps) {
  const t = useTranslations('site.home.scenes.details');
  const [activePlane, setActivePlane] = useState<DetailsPlaneIndex>(0);
  const [liveCaption, setLiveCaption] = useState<string>(() =>
    t('readyCaption'),
  );

  const reducedMotion = useReducedMotionSafe();
  const headingId = useId();
  const readoutId = useId();
  const planeSpec = PLANE_SPECS[activePlane];
  const livePlaneLabel = t(planeSpec.labelKey);

  return (
    <section
      id="details"
      className={className ? `${styles.section} ${className}` : styles.section}
      aria-labelledby={headingId}
    >
      <div className="site-wrap">
        <div className={styles.layout}>
          <div className={styles.copyColumn} data-reveal="up">
            <p className={styles.eyebrow}>
              <span className={styles.eyebrowDot} aria-hidden="true" />
              {t('eyebrow')}
            </p>
            <h2 id={headingId} className={styles.title}>
              {t('geometryLead')}{' '}
              <span className={styles.titleAccent}>{t('titleAccent')}</span>
            </h2>
            <p className={styles.lead}>
              {t('lead')}
            </p>

            <div
              className={styles.focusPills}
              role="group"
              aria-label={t('inspectPlanesAriaLabel')}
            >
              {PLANE_SPECS.map((plane) => {
                const isSelected = activePlane === plane.index;
                return (
                  <Button
                    key={plane.index}
                    type="button"
                    className={styles.focusPill}
                    aria-pressed={isSelected}
                    aria-controls={readoutId}
                    onClick={() => setActivePlane(plane.index)}
                  >
                    <span className={styles.focusDot} aria-hidden="true" />
                    {t(plane.labelKey)}
                  </Button>
                );
              })}
            </div>

            <div id={readoutId} className={styles.readoutBox} aria-live="polite">
              <div className={styles.readoutHeader}>
                <span className={styles.readoutTag}>{t(planeSpec.tagKey)}</span>
                <span className={styles.readoutPkg}>{planeSpec.packages}</span>
              </div>
              <p className={styles.readoutText}>{t(planeSpec.summaryKey)}</p>
              <p className={styles.liveStream}>
                <span className={styles.liveLabel}>{t('figureCaption')} </span>
                {liveCaption}
              </p>
            </div>

            <div className={styles.ctaWrap}>
              <MagneticButton
                className="button button-outline"
                href="/packages#composer"
              >
                {t('buildStack')}{' '}
                <span className="cta-arrow" aria-hidden="true">
                  ↗
                </span>
              </MagneticButton>
            </div>
          </div>

          <div className={styles.stageColumn} data-reveal="up">
            <div className={styles.figureFrame} data-parallax="stage">
              <span className={`${styles.tick} ${styles.tickTl}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickTr}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickBl}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickBr}`} aria-hidden="true" />

              <div className={styles.frameTop}>
                <span>{t('figureStudy')}</span>
                <span className={styles.frameLiveTag}>
                  <span className={styles.frameLiveDot} aria-hidden="true" />
                  {reducedMotion ? t('reducedMotion') : t('continuousCad')}
                </span>
              </div>

              <Exploded
                play={!reducedMotion}
                theme="light"
                intensity={reducedMotion ? 0 : 1.08}
                label={t('figureAriaLabel')}
                onRead={(caption) => {
                  if (caption && caption.trim().length > 0) {
                    setLiveCaption(caption);
                  }
                }}
                className={styles.hairlineCanvas}
                style={HAIRLINE_WARM_FOREST_STYLE}
              />

              <div className={styles.frameBottom}>
                <span>{t('focus', { label: livePlaneLabel.toUpperCase() })}</span>
                <span>{t('pointerInteractive')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
