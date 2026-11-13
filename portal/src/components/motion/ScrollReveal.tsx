'use client';

import { usePathname } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

export type ScrollRevealDirection = 'up' | 'left' | 'right' | 'fade';

export interface ScrollRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly direction?: ScrollRevealDirection;
  readonly as?: 'div' | 'section' | 'article' | 'aside';
}

/**
 * Progressive scroll-reveal container.
 * Resting CSS always stays at `opacity: 1; transform: none;` so accessibility audits
 * and full-page snapshots never hit hidden elements; GlobalScrollChoreographer animates
 * offscreen targets into view on scroll via Web Animations API with `fill: 'none'`.
 */
export function ScrollReveal({
  children,
  className,
  delay,
  direction = 'up',
  as: Tag = 'div',
}: ScrollRevealProps) {
  return (
    <Tag
      className={className}
      data-reveal={direction}
      data-reveal-delay={delay ? String(delay) : undefined}
    >
      {children}
    </Tag>
  );
}

function getRevealKeyframes(direction: string | null): Keyframe[] {
  if (direction === 'left') {
    return [
      { opacity: 0.01, transform: 'translate3d(-18px, 0, 0) scale(0.99)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
    ];
  }
  if (direction === 'right') {
    return [
      { opacity: 0.01, transform: 'translate3d(18px, 0, 0) scale(0.99)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
    ];
  }
  if (direction === 'fade') {
    return [
      { opacity: 0.01, transform: 'translate3d(0, 0, 0)' },
      { opacity: 1, transform: 'translate3d(0, 0, 0)' },
    ];
  }
  return [
    { opacity: 0.01, transform: 'translate3d(0, 18px, 0) scale(0.985)' },
    { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' },
  ];
}

const REVEAL_SELECTOR = [
  'main [data-reveal]',
  'main .section-head',
  'main .card',
  'main .line-card',
  'main .proof',
  'main .proof-strip-band',
  'main .editorial-panel .section-head',
].join(', ');

/**
 * Route-aware scroll choreographer mounted inside SiteHeader.
 * Observes below-the-fold structural targets across every portal route while strictly
 * excluding hero landmarks and resting opacity changes (WAAPI `fill: 'none'`).
 */
export function GlobalScrollChoreographer() {
  const pathname = usePathname() ?? '/';

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      typeof Element === 'undefined' ||
      typeof Element.prototype.animate !== 'function'
    ) {
      return;
    }

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reducedMotion) {
      return;
    }

    const animated = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;
    let rafId = 0;

    rafId = window.requestAnimationFrame(() => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR),
      );
      if (candidates.length === 0) return;

      const viewportThresholdY = window.innerHeight * 0.94;

      observer = new IntersectionObserver(
        (entries) => {
          let batchIndex = 0;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const el = entry.target as HTMLElement;
            observer?.unobserve(el);
            if (animated.has(el)) continue;
            animated.add(el);

            const customDelayAttr = el.getAttribute('data-reveal-delay');
            const parsedCustomDelay = customDelayAttr
              ? Number.parseInt(customDelayAttr, 10)
              : Number.NaN;
            const siblingDelay = Number.isFinite(parsedCustomDelay)
              ? parsedCustomDelay
              : Math.min(batchIndex, 5) * 50;
            batchIndex += 1;

            const direction = el.getAttribute('data-reveal');
            try {
              el.animate(getRevealKeyframes(direction), {
                duration: 560,
                delay: siblingDelay,
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                fill: 'none',
              });
            } catch {
              // Ignore animation errors in headless or constrained environments
            }
          }
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px 60px 0px',
        },
      );

      for (const el of candidates) {
        if (animated.has(el)) continue;
        // Never animate hero headings, marks, or elements containing/inside hero bands
        if (el.closest('.hero, [data-no-reveal="true"]')) {
          animated.add(el);
          continue;
        }
        const rect = el.getBoundingClientRect();
        // Skip anything already in or above the initial viewport fold
        if (rect.top < viewportThresholdY) {
          animated.add(el);
          continue;
        }
        observer.observe(el);
      }
    });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
