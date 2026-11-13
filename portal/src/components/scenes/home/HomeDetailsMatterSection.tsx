'use client';

import { Exploded } from '@lucasmarkes/hairline/react';
import Link from 'next/link';
import { useId, useState, type CSSProperties } from 'react';
import { useReducedMotionSafe } from '@/components/hairline';
import styles from './HomeDetailsMatterSection.module.css';

export type DetailsPlaneIndex = 0 | 1 | 2;

interface PlaneFocusSpec {
  readonly index: DetailsPlaneIndex;
  readonly pillLabel: string;
  readonly headingTag: string;
  readonly packages: string;
  readonly summary: string;
}

const PLANE_SPECS: readonly PlaneFocusSpec[] = [
  {
    index: 0,
    pillLabel: '01 Contracts Plane',
    headingTag: 'LAYER 01 · CONTRACT SURFACE',
    packages: 'AstraFlow.Contracts',
    summary:
      'Isolates IRequest<T> and INotification DTO boundaries so shared assemblies remain dependency-free.',
  },
  {
    index: 1,
    pillLabel: '02 Execution Spine',
    headingTag: 'LAYER 02 · PIPELINE & MAP',
    packages: 'AstraFlow.Mediator · AstraFlow.Mapper',
    summary:
      'Resolves ordered IPipelineBehavior wrappers and compiled mapping expressions without implicit globals.',
  },
  {
    index: 2,
    pillLabel: '03 Verification Base',
    headingTag: 'LAYER 03 · DIAGNOSTIC FLOOR',
    packages: 'AstraFlow.Diagnostics · AstraFlow.Analyzers',
    summary:
      'Anchors the runtime with static AFAN0101–0404 checks, redacted snapshots, and test harnesses.',
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
  const [activePlane, setActivePlane] = useState<DetailsPlaneIndex>(0);
  const [liveCaption, setLiveCaption] = useState<string>(
    'Exploded isometric architecture ready — move pointer across figure to inspect strata.',
  );

  const reducedMotion = useReducedMotionSafe();
  const headingId = useId();
  const readoutId = useId();
  const planeSpec = PLANE_SPECS[activePlane];

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
              05 / THE DETAILS MATTER
            </p>
            <h2 id={headingId} className={styles.title}>
              Geometry with <span className={styles.titleAccent}>meaning.</span>
            </h2>
            <p className={styles.lead}>
              Isometric relationships, connected systems, and precise motion —
              quietly supporting the engineering architecture, never replacing it.
            </p>

            <div
              className={styles.focusPills}
              role="group"
              aria-label="Inspect architectural depth planes"
            >
              {PLANE_SPECS.map((plane) => {
                const isSelected = activePlane === plane.index;
                return (
                  <button
                    key={plane.index}
                    type="button"
                    className={styles.focusPill}
                    aria-pressed={isSelected}
                    aria-controls={readoutId}
                    onClick={() => setActivePlane(plane.index)}
                  >
                    <span className={styles.focusDot} aria-hidden="true" />
                    {plane.pillLabel}
                  </button>
                );
              })}
            </div>

            <div id={readoutId} className={styles.readoutBox} aria-live="polite">
              <div className={styles.readoutHeader}>
                <span className={styles.readoutTag}>{planeSpec.headingTag}</span>
                <span className={styles.readoutPkg}>{planeSpec.packages}</span>
              </div>
              <p className={styles.readoutText}>{planeSpec.summary}</p>
              <p className={styles.liveStream}>
                <span className={styles.liveLabel}>Figure caption: </span>
                {liveCaption}
              </p>
            </div>

            <div className={styles.ctaWrap}>
              <Link className="button button-outline" href="/packages#composer">
                Build your stack <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>

          <div className={styles.stageColumn} data-reveal="up">
            <div className={styles.figureFrame}>
              <span className={`${styles.tick} ${styles.tickTl}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickTr}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickBl}`} aria-hidden="true" />
              <span className={`${styles.tick} ${styles.tickBr}`} aria-hidden="true" />

              <div className={styles.frameTop}>
                <span>FIGURE 05 / EXPLODED STRATA STUDY</span>
                <span className={styles.frameLiveTag}>
                  <span className={styles.frameLiveDot} aria-hidden="true" />
                  {reducedMotion ? 'REDUCED MOTION REST' : 'CONTINUOUS CAD LOOP'}
                </span>
              </div>

              <Exploded
                play={!reducedMotion}
                theme="light"
                intensity={reducedMotion ? 0 : 1.08}
                label="Exploded isometric AstraFlow architecture figure"
                onRead={(caption) => {
                  if (caption && caption.trim().length > 0) {
                    setLiveCaption(caption);
                  }
                }}
                className={styles.hairlineCanvas}
                style={HAIRLINE_WARM_FOREST_STYLE}
              />

              <div className={styles.frameBottom}>
                <span>FOCUS: {planeSpec.pillLabel.toUpperCase()}</span>
                <span>POINTER INTERACTIVE · WARM FOREST PLATE TOKENS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
