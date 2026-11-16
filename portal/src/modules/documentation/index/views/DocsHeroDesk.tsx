'use client';
import { Button } from '@core/ui';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { DocCategory, DocSummary } from '@modules/documentation/data';
import { useReducedMotionSafe, useViewportActivity } from '@core/hairline';
import styles from './DocsHeroDesk.module.css';

export interface DocsHeroDeskProps {
  docs?: DocSummary[];
}

type FolioVolumeId =
  | 'getting-started'
  | 'mediator-pipelines'
  | 'mapping-projections'
  | 'integrations'
  | 'testing-tooling';

interface FolioVolumeSpec {
  id: FolioVolumeId;
  num: string;
  category: DocCategory;
  flagshipSlug: string;
  apiBadge: string;
  defaultMinutes: number;
  sheetTone: 'ivory' | 'forest' | 'sand' | 'terracotta' | 'linen';
}

const FOLIO_VOLUMES: readonly FolioVolumeSpec[] = [
  {
    id: 'getting-started',
    num: '01',
    category: 'Getting Started',
    flagshipSlug: 'getting-started',
    apiBadge: 'IRequest<T>',
    defaultMinutes: 4,
    sheetTone: 'ivory',
  },
  {
    id: 'mediator-pipelines',
    num: '02',
    category: 'Mediator & Pipelines',
    flagshipSlug: 'mediator',
    apiBadge: 'IMediator',
    defaultMinutes: 5,
    sheetTone: 'forest',
  },
  {
    id: 'mapping-projections',
    num: '03',
    category: 'Mapping & Projections',
    flagshipSlug: 'mapper',
    apiBadge: 'IMapper',
    defaultMinutes: 5,
    sheetTone: 'sand',
  },
  {
    id: 'integrations',
    num: '04',
    category: 'Framework Integrations',
    flagshipSlug: 'aspnetcore',
    apiBadge: 'MapAstraFlow',
    defaultMinutes: 4,
    sheetTone: 'terracotta',
  },
  {
    id: 'testing-tooling',
    num: '05',
    category: 'Testing, Diagnostics & Tooling',
    flagshipSlug: 'testing',
    apiBadge: 'AstraFlowTestHost',
    defaultMinutes: 5,
    sheetTone: 'linen',
  },
];

function FolioHairlineDiagram({
  volumeId,
  tone,
}: {
  volumeId: string;
  tone: FolioVolumeSpec['sheetTone'];
}) {
  const isDarkSheet = tone === 'forest' || tone === 'terracotta';
  const strokeMain = isDarkSheet ? 'rgba(255, 250, 242, 0.85)' : 'rgba(8, 44, 38, 0.78)';
  const strokeSub = isDarkSheet ? 'rgba(255, 210, 189, 0.55)' : 'rgba(47, 91, 78, 0.45)';
  const accent = isDarkSheet ? '#ffd2bd' : '#f25e3b';

  if (volumeId === 'getting-started') {
    return (
      <svg aria-hidden="true" className={styles.sheetDiagram} viewBox="0 0 140 54">
        <polygon
          fill="none"
          points="14,34 40,22 66,34 40,46"
          stroke={strokeMain}
          strokeWidth="1.25"
        />
        <polygon
          fill="none"
          points="74,20 100,8 126,20 100,32"
          stroke={strokeMain}
          strokeWidth="1.25"
        />
        <path
          d="M 52 29 C 64 21, 72 21, 86 20"
          fill="none"
          stroke={accent}
          strokeDasharray="3 2.5"
          strokeWidth="1.6"
        />
        <circle cx="88" cy="20" fill={accent} r="2.6" />
        <line stroke={strokeSub} strokeWidth="1" x1="14" x2="40" y1="49" y2="49" />
      </svg>
    );
  }

  if (volumeId === 'mediator-pipelines') {
    return (
      <svg aria-hidden="true" className={styles.sheetDiagram} viewBox="0 0 140 54">
        <polygon fill="none" points="22,40 56,28 90,40 56,51" stroke={strokeSub} strokeWidth="1.15" />
        <polygon fill="none" points="32,29 66,17 100,29 66,40" stroke={strokeMain} strokeWidth="1.2" />
        <polygon fill="none" points="44,18 78,6 112,18 78,29" stroke={accent} strokeWidth="1.45" />
        <circle cx="78" cy="18" fill={accent} r="2.3" />
      </svg>
    );
  }

  if (volumeId === 'mapping-projections') {
    return (
      <svg aria-hidden="true" className={styles.sheetDiagram} viewBox="0 0 140 54">
        <polygon
          fill="none"
          points="18,18 46,6 74,18 46,30"
          stroke={strokeMain}
          strokeWidth="1.25"
        />
        <polygon
          fill="none"
          points="64,34 94,20 124,34 94,48"
          stroke={strokeMain}
          strokeWidth="1.25"
        />
        <path d="M 46 30 L 94 20" fill="none" stroke={accent} strokeWidth="1.6" />
        <line stroke={strokeSub} strokeWidth="1" x1="18" x2="18" y1="18" y2="30" />
        <line stroke={strokeSub} strokeWidth="1" x1="74" x2="74" y1="18" y2="30" />
      </svg>
    );
  }

  if (volumeId === 'integrations') {
    return (
      <svg aria-hidden="true" className={styles.sheetDiagram} viewBox="0 0 140 54">
        <rect fill="none" height="22" rx="2.5" stroke={strokeMain} strokeWidth="1.25" width="32" x="12" y="16" />
        <rect fill="none" height="28" rx="2.5" stroke={strokeMain} strokeWidth="1.25" width="32" x="54" y="13" />
        <rect fill="none" height="22" rx="2.5" stroke={strokeMain} strokeWidth="1.25" width="32" x="96" y="16" />
        <path d="M 44 27 L 54 27 M 86 27 L 96 27" stroke={accent} strokeWidth="1.8" />
        <circle cx="70" cy="27" fill={accent} r="2.8" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className={styles.sheetDiagram} viewBox="0 0 140 54">
      <polyline
        fill="none"
        points="10,36 32,36 44,14 58,42 74,22 90,34 128,34"
        stroke={accent}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <line stroke={strokeSub} strokeDasharray="3 3" strokeWidth="1" x1="10" x2="130" y1="45" y2="45" />
      <circle cx="114" cy="18" fill="none" r="8" stroke={strokeMain} strokeWidth="1.2" />
      <circle cx="114" cy="18" fill={accent} r="2.4" />
    </svg>
  );
}

export function DocsHeroDesk({ docs = [] }: DocsHeroDeskProps) {
  const t = useTranslations('documentation.heroDesk');
  const volumeCopy: Record<FolioVolumeId, {
    shortTag: string;
    shelfTitle: string;
    flagshipTitle: string;
    summary: string;
  }> = {
    'getting-started': {
      shortTag: t('volumes.gettingStarted.shortTag'),
      shelfTitle: t('volumes.gettingStarted.shelfTitle'),
      flagshipTitle: t('volumes.gettingStarted.flagshipTitle'),
      summary: t('volumes.gettingStarted.summary'),
    },
    'mediator-pipelines': {
      shortTag: t('volumes.mediatorPipelines.shortTag'),
      shelfTitle: t('volumes.mediatorPipelines.shelfTitle'),
      flagshipTitle: t('volumes.mediatorPipelines.flagshipTitle'),
      summary: t('volumes.mediatorPipelines.summary'),
    },
    'mapping-projections': {
      shortTag: t('volumes.mappingProjections.shortTag'),
      shelfTitle: t('volumes.mappingProjections.shelfTitle'),
      flagshipTitle: t('volumes.mappingProjections.flagshipTitle'),
      summary: t('volumes.mappingProjections.summary'),
    },
    integrations: {
      shortTag: t('volumes.integrations.shortTag'),
      shelfTitle: t('volumes.integrations.shelfTitle'),
      flagshipTitle: t('volumes.integrations.flagshipTitle'),
      summary: t('volumes.integrations.summary'),
    },
    'testing-tooling': {
      shortTag: t('volumes.testingTooling.shortTag'),
      shelfTitle: t('volumes.testingTooling.shelfTitle'),
      flagshipTitle: t('volumes.testingTooling.flagshipTitle'),
      summary: t('volumes.testingTooling.summary'),
    },
  };
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotionSafe();
  const { isActive: isInViewport } = useViewportActivity(rootRef, {
    paused: reducedMotion,
    initialInView: true,
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);
  const [userLocked, setUserLocked] = useState(false);

  const docBySlug = useMemo(() => {
    const map = new Map<string, DocSummary>();
    for (const doc of docs) {
      map.set(doc.slugPath, doc);
    }
    return map;
  }, [docs]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<DocCategory, number>();
    for (const doc of docs) {
      counts.set(doc.category, (counts.get(doc.category) ?? 0) + 1);
    }
    return counts;
  }, [docs]);

  const autoSweepActive =
    !reducedMotion && isInViewport && !isHovering && !hasFocusWithin && !userLocked;

  useEffect(() => {
    if (!autoSweepActive) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FOLIO_VOLUMES.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [autoSweepActive]);

  const selectVolume = (index: number, lockIdleSweep: boolean) => {
    const safeIndex = (index + FOLIO_VOLUMES.length) % FOLIO_VOLUMES.length;
    setActiveIndex(safeIndex);
    if (lockIdleSweep) {
      setUserLocked(true);
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let targetIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      targetIndex = (index + 1) % FOLIO_VOLUMES.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      targetIndex = (index - 1 + FOLIO_VOLUMES.length) % FOLIO_VOLUMES.length;
    } else if (event.key === 'Home') {
      targetIndex = 0;
    } else if (event.key === 'End') {
      targetIndex = FOLIO_VOLUMES.length - 1;
    } else if (event.key === 'Escape') {
      setUserLocked(false);
      return;
    }

    if (targetIndex !== null) {
      event.preventDefault();
      selectVolume(targetIndex, true);
      tabRefs.current[targetIndex]?.focus();
    }
  };

  const activeVolume = FOLIO_VOLUMES[activeIndex];
  const activeVolumeCopy = volumeCopy[activeVolume.id];
  const flagshipDoc = docBySlug.get(activeVolume.flagshipSlug);
  const categoryCount = categoryCounts.get(activeVolume.category) ?? 0;

  return (
    <div
      className={styles.deskRoot}
      onBlurCapture={(event) => {
        const nextFocus = event.relatedTarget as Node | null;
        if (!event.currentTarget.contains(nextFocus)) {
          setHasFocusWithin(false);
        }
      }}
      onFocusCapture={() => setHasFocusWithin(true)}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      ref={rootRef}
    >
      <div className={styles.deskHeader}>
        <span className={styles.deskEyebrow}>
          {t('deskEyebrow')}
        </span>
        <span className={styles.liveStatus}>
          <span
            aria-hidden="true"
            className={`${styles.liveDot} ${
              autoSweepActive ? styles.liveDotSweep : ''
            }`}
          />
          {userLocked
            ? t('folioPinned')
            : t('liveFolio')}
        </span>
      </div>

      {/* Frameless open architectural folio desk */}
      <div className={styles.deskStage}>
        <div aria-hidden="true" className={styles.deskGrid} />

        {/* Subtle concentric compass circles & continuous Signal Orange reader arc */}
        <svg
          aria-hidden="true"
          className={styles.deskBackdropSvg}
          viewBox="0 0 600 370"
        >
          <circle
            cx="316"
            cy="185"
            fill="none"
            r="96"
            stroke="rgba(8, 44, 38, 0.08)"
            strokeWidth="1"
          />
          <circle
            cx="316"
            cy="185"
            fill="none"
            r="152"
            stroke="rgba(8, 44, 38, 0.065)"
            strokeDasharray="4 6"
            strokeWidth="1"
          />
          <circle
            cx="316"
            cy="185"
            fill="none"
            r="208"
            stroke="rgba(8, 44, 38, 0.05)"
            strokeWidth="1"
          />
          <path
            d="M 38 296 C 148 250, 232 108, 358 112 S 506 202, 574 84"
            fill="none"
            stroke="rgba(242, 94, 59, 0.25)"
            strokeWidth="1.5"
          />
          <path
            className={
              reducedMotion ? styles.readerArcStatic : styles.readerArcLive
            }
            d="M 38 296 C 148 250, 232 108, 358 112 S 506 202, 574 84"
            fill="none"
            stroke="#f25e3b"
            strokeDasharray="24 14"
            strokeLinecap="round"
            strokeWidth="2.1"
          />
          <circle cx="574" cy="84" fill="#f25e3b" r="3.4" />
        </svg>

        {/* 5 Fanned 3D Perspective Physical Folio Sheets */}
        <div
          aria-label={t('volumeAriaLabel')}
          className={styles.sheetsGroup}
          role="group"
        >
          {FOLIO_VOLUMES.map((vol, index) => {
            const copy = volumeCopy[vol.id];
            const isActive = index === activeIndex;
            const toneClass =
              vol.sheetTone === 'forest'
                ? styles.sheetForest
                : vol.sheetTone === 'sand'
                  ? styles.sheetSand
                  : vol.sheetTone === 'terracotta'
                    ? styles.sheetTerracotta
                    : vol.sheetTone === 'linen'
                      ? styles.sheetLinen
                      : styles.sheetIvory;

            return (
              <Button
                aria-pressed={isActive}
                className={`${styles.folioSheet} ${toneClass} ${
                  isActive ? styles.folioSheetActive : ''
                }`}
                data-testid={`docs-volume-${vol.num}`}
                key={vol.id}
                onClick={() => selectVolume(index, true)}
                onFocus={() => selectVolume(index, false)}
                onMouseEnter={() => {
                  if (!userLocked) selectVolume(index, false);
                }}
                style={
                  {
                    '--sheet-index': index,
                    '--sheet-z': isActive ? 20 : 6 - index,
                  } as React.CSSProperties
                }
                type="button"
              >
                <span className={styles.sheetTop}>
                  <span className={styles.sheetNum}>
                    {vol.num} / {copy.shortTag}
                  </span>
                  <span className={styles.sheetApi}>{vol.apiBadge}</span>
                </span>

                <FolioHairlineDiagram tone={vol.sheetTone} volumeId={vol.id} />

                <span className={styles.sheetFoot}>
                  <strong className={styles.sheetTitle}>{copy.shelfTitle}</strong>
                  <span aria-hidden="true" className={styles.sheetArrow}>
                    ↗
                  </span>
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Synchronized compact subject tabs */}
      <div
        aria-label={t('tracksAriaLabel')}
        className={styles.trackTablist}
        role="tablist"
      >
        {FOLIO_VOLUMES.map((vol, index) => {
          const copy = volumeCopy[vol.id];
          const isActive = index === activeIndex;
          return (
            <Button
              aria-controls={`codex-lens-${vol.id}`}
              aria-selected={isActive}
              className={`${styles.trackTab} ${
                isActive ? styles.trackTabActive : ''
              }`}
              id={`codex-volume-tab-${vol.id}`}
              key={vol.id}
              onClick={() => selectVolume(index, true)}
              onKeyDown={(event) => handleTabKeyDown(event, index)}
              onMouseEnter={() => {
                if (!userLocked) selectVolume(index, false);
              }}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              tabIndex={isActive ? 0 : -1}
              type="button"
            >
              <span className={styles.trackTabNum}>{vol.num}</span>
              <span className={styles.trackTabTitle}>{copy.shelfTitle}</span>
            </Button>
          );
        })}
      </div>

      {/* Bottom Reference Readout Bar */}
      <div
        aria-live="polite"
        className={styles.readoutBar}
        id={`codex-lens-${activeVolume.id}`}
      >
        <div className={styles.readoutContent}>
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              animate={{ opacity: 1 }}
              className={styles.readoutMotionLayer}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              initial={reducedMotion ? false : { opacity: 0 }}
              key={activeVolume.id}
              transition={{ duration: reducedMotion ? 0 : 0.16 }}
            >
              <div className={styles.readoutMeta}>
                <span>
                  {t('folioLabel', {
                    number: activeVolume.num,
                    title: activeVolumeCopy.shelfTitle,
                  })}
                </span>
                {categoryCount > 0 ? (
                  <span>{t('guideCount', { count: String(categoryCount) })}</span>
                ) : null}
                <span>
                  {t('minutesRead', {
                    count: String(flagshipDoc?.readingMinutes ?? activeVolume.defaultMinutes),
                  })}
                </span>
                <code className={styles.readoutApi}>{activeVolume.apiBadge}</code>
              </div>

              <h2 className={styles.readoutTitle}>
                {flagshipDoc?.title ?? activeVolumeCopy.flagshipTitle}
              </h2>
              <p className={styles.readoutSummary}>{activeVolumeCopy.summary}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Link
          className={styles.readoutCta}
          href={`/docs/${activeVolume.flagshipSlug}`}
        >
          {t('openTrackGuide')} <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </div>
  );
}
