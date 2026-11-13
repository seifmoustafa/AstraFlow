"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export type ScrollRevealDirection = "up" | "left" | "right" | "fade";

export interface ScrollRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delay?: number;
  readonly direction?: ScrollRevealDirection;
  readonly as?: "div" | "section" | "article" | "aside";
}

let scrollTriggerRegistered = false;

function ensureScrollTrigger() {
  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
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
  direction = "up",
  as: Tag = "div",
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

function getRevealKeyframes(
  el: HTMLElement,
  direction: string | null
): Keyframe[] {
  const isMaskedHead =
    el.matches(".section-head, .eyebrow") && !direction;

  if (isMaskedHead) {
    return [
      {
        opacity: 1,
        transform: "translate3d(0, 22px, 0)",
        clipPath: "inset(0 0 100% 0)",
      },
      {
        opacity: 1,
        transform: "translate3d(0, 0, 0)",
        clipPath: "inset(0 0 0% 0)",
      },
    ];
  }

  if (direction === "left") {
    return [
      {
        opacity: 1,
        transform: "perspective(900px) rotateY(3deg) translate3d(-22px, 0, 0)",
      },
      {
        opacity: 1,
        transform: "none",
      },
    ];
  }

  if (direction === "right") {
    return [
      {
        opacity: 1,
        transform: "perspective(900px) rotateY(-3deg) translate3d(22px, 0, 0)",
      },
      {
        opacity: 1,
        transform: "none",
      },
    ];
  }

  if (direction === "fade") {
    return [
      {
        opacity: 1,
        clipPath: "inset(0 0 18% 0)",
      },
      {
        opacity: 1,
        clipPath: "inset(0 0 0% 0)",
      },
    ];
  }

  return [
    {
      opacity: 1,
      transform: "perspective(900px) rotateX(4deg) translate3d(0, 26px, 0)",
    },
    {
      opacity: 1,
      transform: "none",
    },
  ];
}

const REVEAL_SELECTOR = [
  "main .section-head",
  "main .eyebrow",
  "main .card",
  "main .line-card",
  "main .proof",
  "main .journeyCard",
  'main [class*="journeyCard"]',
  "main [data-reveal]",
].join(", ");

/**
 * Route-aware scroll choreographer mounted inside SiteHeader.
 * Combines IntersectionObserver perspective card cascades & masked section-head wipes
 * (always `opacity: 1` and `fill: 'none'`) with GSAP ScrollTrigger scrub parallax.
 */
export function GlobalScrollChoreographer() {
  const pathname = usePathname() ?? "/";

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof IntersectionObserver === "undefined" ||
      typeof Element === "undefined" ||
      typeof Element.prototype.animate !== "function"
    ) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      return;
    }

    const animated = new WeakSet<Element>();
    let observer: IntersectionObserver | null = null;
    let gsapContext: gsap.Context | null = null;
    let rafId = 0;

    rafId = window.requestAnimationFrame(() => {
      ensureScrollTrigger();

      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)
      );

      if (candidates.length > 0) {
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

              const customDelayAttr = el.getAttribute("data-reveal-delay");
              const parsedCustomDelay = customDelayAttr
                ? Number.parseInt(customDelayAttr, 10)
                : Number.NaN;
              const siblingDelay = Number.isFinite(parsedCustomDelay)
                ? parsedCustomDelay
                : Math.min(batchIndex, 6) * 50;
              batchIndex += 1;

              const direction = el.getAttribute("data-reveal");
              try {
                el.animate(getRevealKeyframes(el, direction), {
                  duration: 540,
                  delay: siblingDelay,
                  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                  fill: "none",
                });
              } catch {
                // Ignore animation errors in constrained headless environments
              }
            }
          },
          {
            threshold: 0.08,
            rootMargin: "0px 0px 48px 0px",
          }
        );

        for (const el of candidates) {
          if (animated.has(el)) continue;
          if (el.closest('.hero, [data-no-reveal="true"]')) {
            animated.add(el);
            continue;
          }
          const rect = el.getBoundingClientRect();
          if (rect.top < viewportThresholdY) {
            animated.add(el);
            continue;
          }
          observer.observe(el);
        }
      }

      const stageTargets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-parallax="stage"]')
      );
      const bgTargets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-parallax="bg"]')
      );

      if (stageTargets.length > 0 || bgTargets.length > 0) {
        gsapContext = gsap.context(() => {
          for (const target of stageTargets) {
            gsap.fromTo(
              target,
              { y: -14 },
              {
                y: 14,
                ease: "none",
                scrollTrigger: {
                  trigger: target,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.5,
                  invalidateOnRefresh: true,
                },
              }
            );
          }

          for (const target of bgTargets) {
            gsap.fromTo(
              target,
              { y: -10 },
              {
                y: 10,
                ease: "none",
                scrollTrigger: {
                  trigger: target,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.5,
                  invalidateOnRefresh: true,
                },
              }
            );
          }
        });
      }

      ScrollTrigger.refresh();
    });

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer?.disconnect();
      gsapContext?.revert();
    };
  }, [pathname]);

  return null;
}
