"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

let scrollTriggerRegistered = false;

function ensureScrollTrigger() {
  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

export interface HeroTextRevealProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly delayMs?: number;
  readonly as?: "div" | "span" | "p" | "h1" | "h2";
}

export function HeroTextReveal({
  children,
  className,
  delayMs = 0,
  as: Tag = "div",
}: HeroTextRevealProps) {
  const innerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (
      !el ||
      typeof window === "undefined" ||
      typeof el.animate !== "function"
    ) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    try {
      const animation = el.animate(
        [
          {
            transform: "translate3d(0, 108%, 0)",
            clipPath: "inset(0 0 100% 0)",
            opacity: 1,
          },
          {
            transform: "translate3d(0, 0, 0)",
            clipPath: "inset(0 0 0% 0)",
            opacity: 1,
          },
        ],
        {
          duration: 520,
          delay: delayMs,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "none",
        }
      );

      return () => {
        animation.cancel();
      };
    } catch {
      return;
    }
  }, [delayMs]);

  const maskClass =
    Tag === "span" ? "af-hero-text-mask is-inline" : "af-hero-text-mask";

  return (
    <Tag className={className}>
      <span className={maskClass}>
        <span ref={innerRef} className="af-hero-text-inner">
          {children}
        </span>
      </span>
    </Tag>
  );
}

export interface HeroStageEntranceProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly parallax?: boolean;
}

export function HeroStageEntrance({
  children,
  className,
  parallax = true,
}: HeroStageEntranceProps) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let entranceAnim: Animation | null = null;
    if (typeof el.animate === "function") {
      try {
        entranceAnim = el.animate(
          [
            {
              transform: "translate3d(0, 16px, 0) scale(0.975)",
              opacity: 1,
            },
            {
              transform: "translate3d(0, 0, 0) scale(1)",
              opacity: 1,
            },
          ],
          {
            duration: 640,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "none",
          }
        );
      } catch {
        entranceAnim = null;
      }
    }

    let ctx: gsap.Context | null = null;
    if (parallax) {
      ensureScrollTrigger();
      ctx = gsap.context(() => {
        gsap.to(el, {
          y: 14,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "bottom top",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });
      }, el);
    }

    return () => {
      entranceAnim?.cancel();
      ctx?.revert();
    };
  }, [parallax]);

  return (
    <div ref={stageRef} data-hero-stage="true" className={className}>
      {children}
    </div>
  );
}

export interface MagneticButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  readonly children: ReactNode;
  readonly href?: string;
  readonly className?: string;
  readonly strength?: number;
}

export function MagneticButton({
  children,
  href,
  className,
  strength = 4,
  onMouseMove,
  onMouseLeave,
  ...rest
}: MagneticButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef<number | null>(null);

  const getTarget = useCallback((): HTMLElement | null => {
    return href ? anchorRef.current : spanRef.current;
  }, [href]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const applyOffset = useCallback(
    (clientX: number, clientY: number) => {
      const target = getTarget();
      if (!target || typeof window === "undefined") {
        return;
      }

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(pointer: coarse)").matches
      ) {
        return;
      }

      const rect = target.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const relX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const relY = ((clientY - rect.top) / rect.height) * 2 - 1;
      const clampedX = Math.max(-1, Math.min(1, relX)) * strength;
      const clampedY = Math.max(-1, Math.min(1, relY)) * strength;

      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = window.requestAnimationFrame(() => {
        target.style.transform = `translate3d(${clampedX.toFixed(2)}px, ${clampedY.toFixed(2)}px, 0)`;
      });
    },
    [getTarget, strength]
  );

  const resetOffset = useCallback(() => {
    const target = getTarget();
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (target) {
      target.style.transform = "";
    }
  }, [getTarget]);

  const combinedClassName = className
    ? `af-magnetic ${className}`
    : "af-magnetic";

  if (!href) {
    return (
      <span
        ref={spanRef}
        className={combinedClassName}
        onMouseMove={(event) => applyOffset(event.clientX, event.clientY)}
        onMouseLeave={resetOffset}
        onBlur={resetOffset}
      >
        {children}
      </span>
    );
  }

  const {
    onBlur,
    ...anchorProps
  } = rest;

  const handleAnchorMove = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    applyOffset(event.clientX, event.clientY);
    onMouseMove?.(event);
  };

  const handleAnchorLeave = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    resetOffset();
    onMouseLeave?.(event);
  };

  const isInternal = href.startsWith("/") || href.startsWith("#");

  if (isInternal) {
    return (
      <Link
        {...anchorProps}
        ref={anchorRef}
        href={href}
        className={combinedClassName}
        onMouseMove={handleAnchorMove}
        onMouseLeave={handleAnchorLeave}
        onBlur={(event) => {
          resetOffset();
          onBlur?.(event);
        }}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      {...anchorProps}
      ref={anchorRef}
      href={href}
      className={combinedClassName}
      onMouseMove={handleAnchorMove}
      onMouseLeave={handleAnchorLeave}
      onBlur={(event) => {
        resetOffset();
        onBlur?.(event);
      }}
    >
      {children}
    </a>
  );
}
