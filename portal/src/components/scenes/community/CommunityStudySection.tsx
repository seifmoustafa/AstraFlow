'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import Link from 'next/link';
import { Relay } from '@lucasmarkes/hairline/react';
import {
  useReducedMotionSafe,
  useViewportActivity,
} from '@/components/hairline';
import styles from './CommunityStudySection.module.css';

export interface StudyQuestionItem {
  id: string;
  number: string;
  topic: string;
  question: string;
  answer: string;
  href: string;
  ctaLabel: string;
}

const STUDY_QUESTIONS: StudyQuestionItem[] = [
  {
    id: 'dispatch',
    number: '01',
    topic: 'DISPATCH',
    question: 'How does generated mediator dispatch stay reflection-free?',
    answer:
      'Compile-time source generation emits typed dispatchers and closed pipeline invocations directly against your handlers instead of runtime reflection lookup.',
    href: '/docs/adr/0002-generated-mediator',
    ctaLabel: 'Read ADR-0002 ↗',
  },
  {
    id: 'mapping',
    number: '02',
    topic: 'MAPPING',
    question: 'How are object mapping pairs verified at startup?',
    answer:
      'Source-generated mapping plans match members at compile time while Roslyn analyzers and startup verification catch unmapped properties before production.',
    href: '/docs/mapper',
    ctaLabel: 'Read mapper guide ↗',
  },
  {
    id: 'diagnostics',
    number: '03',
    topic: 'DIAGNOSTICS',
    question: 'How do diagnostic reports guarantee zero payload leakage?',
    answer:
      'Diagnostics restrict snapshots to structural route/handler metadata and explicit redaction summaries so user request payloads never serialize into reports.',
    href: '/docs/diagnostics-endpoint-safety',
    ctaLabel: 'Read safety contract ↗',
  },
  {
    id: 'contracts',
    number: '04',
    topic: 'CONTRACTS',
    question: 'Why does AstraFlow.Contracts stay zero-dependency?',
    answer:
      'Keeping the contracts assembly pure lets domain models declare request, response, and notification markers without pulling ASP.NET or container weights.',
    href: '/docs/architecture',
    ctaLabel: 'Read architecture ↗',
  },
];

const AUTO_CYCLE_MS = 3500;

export interface CommunityStudySectionProps {
  className?: string;
}

export function CommunityStudySection({
  className,
}: CommunityStudySectionProps) {
  const [autoIndex, setAutoIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [relayCaption, setRelayCaption] = useState<string>(
    'Relay topology active across four documented AstraFlow subsystems.',
  );

  const sectionRef = useRef<HTMLElement | null>(null);
  const cardBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const reducedMotion = useReducedMotionSafe();
  const sectionActivity = useViewportActivity(sectionRef, {
    paused: reducedMotion,
    initialInView: true,
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
      setRelayCaption(
        'Continuous four-branch study relay sweeping active subsystem pathways.',
      );
      return;
    }

    if (trimmed.length < 14) {
      setRelayCaption(
        `Study relay tracking active branch (${trimmed}) across AstraFlow subsystems.`,
      );
      return;
    }

    setRelayCaption(trimmed);
  }, []);

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
          <p className="eyebrow">03 / BUILT TO BE STUDIED</p>
          <h2 id="community-study-heading" className={styles.heading}>
            One codebase.
            <span className={styles.headingItalic}>Many good questions.</span>
          </h2>
          <p className={styles.lead}>
            No invented chat rooms, testimonials, star counters, or vanity
            statistics. The repository, test suites, and documentation are the
            primary channels.
          </p>

          <div
            className={styles.cardsGrid}
            role="group"
            aria-label="Architectural study questions across AstraFlow subsystems"
          >
            {STUDY_QUESTIONS.map((item, index) => {
              const isActive = activeIndex === index;
              return (
                <article
                  key={item.id}
                  className={`${styles.questionCard}${
                    isActive ? ` ${styles.questionCardActive}` : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <button
                    ref={(el) => {
                      cardBtnRefs.current[index] = el;
                    }}
                    type="button"
                    aria-expanded={isActive}
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
                        {item.number} / {item.topic}
                      </span>
                      <span
                        className={styles.cardStateDot}
                        aria-hidden="true"
                      />
                    </span>
                    <strong className={styles.cardQuestion}>
                      {item.question}
                    </strong>
                  </button>

                  {isActive ? (
                    <p
                      id={`study-answer-${item.id}`}
                      className={styles.cardAnswer}
                    >
                      {item.answer}
                    </p>
                  ) : null}

                  <Link href={item.href} className={styles.cardDocLink}>
                    {item.ctaLabel}
                  </Link>
                </article>
              );
            })}
          </div>

          <div className={styles.ctaRow}>
            <Link className="button button-primary" href="/docs">
              Read the documentation
              <span aria-hidden="true" className="arrow">
                ↗
              </span>
            </Link>
          </div>
        </div>

        <div className={styles.stageColumn} data-reveal="up">
          <div className={styles.relayFrame}>
            <div className={styles.relayHeader}>
              <span>FIGURE 06 / FOUR-BRANCH CODEBASE TOPOLOGY</span>
              <span className={styles.relayPill}>
                <span className={styles.relayDot} aria-hidden="true" />
                <span>
                  {activeItem.number} {activeItem.topic}
                </span>
              </span>
            </div>

            <div className={styles.relayCanvas}>
              <Relay
                play={!reducedMotion}
                theme="light"
                intensity={1.12}
                label="Interactive four-branch AstraFlow codebase study topology"
                onRead={handleRelayRead}
                className={styles.relayHost}
              />
            </div>

            <div
              className={styles.branchBar}
              role="group"
              aria-label="Synchronized architecture branch selectors"
            >
              {STUDY_QUESTIONS.map((item, index) => (
                <button
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
                  <span className={styles.branchTitle}>{item.topic}</span>
                </button>
              ))}
            </div>

            <div className={styles.telemetryReadout} aria-live="polite">
              <span className={styles.telemetryLabel}>
                RELAY TELEMETRY · {activeItem.number} / {activeItem.topic}
              </span>
              <p className={styles.telemetryText}>{relayCaption}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
