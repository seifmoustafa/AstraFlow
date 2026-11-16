'use client';
import { Button } from '@core/ui';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Relay } from '@lucasmarkes/hairline/react';
import {
  useReducedMotionSafe,
  useViewportActivity,
} from '@core/hairline';
import styles from './CommunityStudySection.module.css';

export interface StudyQuestionItem {
  id: 'dispatch' | 'mapping' | 'diagnostics' | 'contracts';
  number: string;
  href: string;
}

const STUDY_QUESTIONS: StudyQuestionItem[] = [
  {
    id: 'dispatch',
    number: '01',
    href: '/docs/generated-dispatch',
  },
  {
    id: 'mapping',
    number: '02',
    href: '/docs/mapper',
  },
  {
    id: 'diagnostics',
    number: '03',
    href: '/docs/diagnostics',
  },
  {
    id: 'contracts',
    number: '04',
    href: '/docs/architecture',
  },
];

const AUTO_CYCLE_MS = 3500;

export interface CommunityStudySectionProps {
  className?: string;
}

export function CommunityStudySection({
  className,
}: CommunityStudySectionProps) {
  const t = useTranslations('community.study');
  const [autoIndex, setAutoIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(0);
  const [relayCaption, setRelayCaption] = useState<string>(() =>
    t('relayInitial'),
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotionSafe();
  const sectionActivity = useViewportActivity(sectionRef, {
    paused: reducedMotion,
    initialInView: false,
  });

  const isUserControlled =
    hoveredIndex !== null || focusedIndex !== null || pinnedIndex !== null;

  useEffect(() => {
    if (reducedMotion || !sectionActivity.isActive || isUserControlled) {
      return;
    }

    const timerId = window.setInterval(() => {
      setAutoIndex((prev) => (prev + 1) % STUDY_QUESTIONS.length);
    }, AUTO_CYCLE_MS);

    return () => window.clearInterval(timerId);
  }, [reducedMotion, sectionActivity.isActive, isUserControlled]);

  const activeIndex =
    hoveredIndex ?? focusedIndex ?? pinnedIndex ?? autoIndex;
  const activeItem = STUDY_QUESTIONS[activeIndex] ?? STUDY_QUESTIONS[0];
  const questionCopy = {
    dispatch: {
      topic: t('questions.dispatch.topic'),
      question: t('questions.dispatch.question'),
      answer: t('questions.dispatch.answer'),
      cta: t('questions.dispatch.cta'),
    },
    mapping: {
      topic: t('questions.mapping.topic'),
      question: t('questions.mapping.question'),
      answer: t('questions.mapping.answer'),
      cta: t('questions.mapping.cta'),
    },
    diagnostics: {
      topic: t('questions.diagnostics.topic'),
      question: t('questions.diagnostics.question'),
      answer: t('questions.diagnostics.answer'),
      cta: t('questions.diagnostics.cta'),
    },
    contracts: {
      topic: t('questions.contracts.topic'),
      question: t('questions.contracts.question'),
      answer: t('questions.contracts.answer'),
      cta: t('questions.contracts.cta'),
    },
  };
  const activeCopy = questionCopy[activeItem.id];

  const handleRelayRead = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    const normalized = trimmed.toLowerCase();
    if (
      normalized === 'rest' ||
      normalized === 'idle' ||
      normalized === 'pulse' ||
      normalized === 'active'
    ) {
      setRelayCaption(t('relayContinuous'));
      return;
    }

    if (trimmed.length < 14) {
      setRelayCaption(t('relayBranch', { branch: trimmed }));
      return;
    }

    setRelayCaption(trimmed);
  }, [t]);

  function focusCard(nextIndex: number) {
    const wrapped =
      (nextIndex + STUDY_QUESTIONS.length) % STUDY_QUESTIONS.length;
    setFocusedIndex(wrapped);
    setPinnedIndex(wrapped);
    cardBtnRefs.current[wrapped]?.focus();
  }

  function handleCardKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      focusCard(index + 1);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      focusCard(index - 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusCard(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusCard(STUDY_QUESTIONS.length - 1);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      setPinnedIndex(null);
      setHoveredIndex(null);
      setFocusedIndex(null);
    }
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="community-study-heading"
      className={
        className ? `${styles.studyBand} ${className}` : styles.studyBand
      }
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className={`site-wrap ${styles.studyGrid}`}>
        <div className={styles.copyColumn} data-reveal="up">
          <p className="eyebrow">{t('eyebrow')}</p>
          <h2 id="community-study-heading" className={styles.heading}>
            {t('titleLead')}
            <span className={styles.headingItalic}>{t('titleAccent')}</span>
          </h2>
          <p className={styles.lead}>{t('lead')}</p>

          <div
            className={styles.cardsGrid}
            role="group"
            aria-label={t('questionsAria')}
          >
            {STUDY_QUESTIONS.map((item, index) => {
              const isActive = activeIndex === index;
              const isExpanded =
                focusedIndex !== null
                  ? focusedIndex === index
                  : pinnedIndex === index;
              const copy = questionCopy[item.id];
              return (
                <article
                  key={item.id}
                  className={`${styles.questionCard}${
                    isActive ? ` ${styles.questionCardActive}` : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <Button
                    ref={(el) => {
                      cardBtnRefs.current[index] = el;
                    }}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls={`study-answer-${item.id}`}
                    className={styles.cardToggleBtn}
                    onClick={() =>
                      setPinnedIndex((prev) => (prev === index ? null : index))
                    }
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() =>
                      setFocusedIndex((curr) => (curr === index ? null : curr))
                    }
                    onKeyDown={(event) => handleCardKeyDown(event, index)}
                  >
                    <span className={styles.cardMetaRow}>
                      <span>
                        {item.number} / {copy.topic}
                      </span>
                      <span
                        className={styles.cardStateDot}
                        aria-hidden="true"
                      />
                    </span>
                    <strong className={styles.cardQuestion}>
                      {copy.question}
                    </strong>
                  </Button>

                  {isExpanded ? (
                    <p
                      id={`study-answer-${item.id}`}
                      className={styles.cardAnswer}
                    >
                      {copy.answer}
                    </p>
                  ) : null}

                  <Link href={item.href} className={styles.cardDocLink}>
                    {copy.cta}
                  </Link>
                </article>
              );
            })}
          </div>

          <div className={styles.ctaRow}>
            <Link className="button button-primary" href="/docs">
              {t('readDocs')}
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.stageColumn} data-parallax="stage">
          <div className={styles.relayFrame}>
            <div className={styles.relayHeader}>
              <span>{t('figureLabel')}</span>
              <span className={styles.relayPill}>
                <span className={styles.relayDot} aria-hidden="true" />
                <span>
                  {activeItem.number} {activeCopy.topic}
                </span>
              </span>
            </div>

            <div className={styles.relayCanvas}>
              <Relay
                play={!reducedMotion && sectionActivity.isActive}
                theme="light"
                intensity={1.12}
                label={t('relayAria')}
                onRead={handleRelayRead}
                className={styles.relayHost}
              />
            </div>

            <div
              className={styles.branchBar}
              role="group"
              aria-label={t('branchSelectorsAria')}
            >
              {STUDY_QUESTIONS.map((item, index) => (
                <Button
                  key={`branch-${item.id}`}
                  type="button"
                  aria-pressed={activeIndex === index}
                  className={styles.branchBadge}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onClick={() =>
                    setPinnedIndex((prev) => (prev === index ? null : index))
                  }
                >
                  <span>{item.number}</span>
                  <span className={styles.branchTitle}>
                    {questionCopy[item.id].topic}
                  </span>
                </Button>
              ))}
            </div>

            <div className={styles.telemetryReadout} aria-live="polite">
              <span className={styles.telemetryLabel}>
                {t('telemetryLabel', {
                  number: activeItem.number,
                  topic: activeCopy.topic,
                })}
              </span>
              <p className={styles.telemetryText}>{relayCaption}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
