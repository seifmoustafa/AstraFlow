"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

let scrollTriggerRegistered = false;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

export interface SmoothScrollProviderProps {
  readonly children: ReactNode;
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const pathname = usePathname() ?? "/";
  const lenisRef = useRef<Lenis | null>(null);
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    ensureScrollTriggerRegistered();

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;

    const teardown = () => {
      if (tick) {
        gsap.ticker.remove(tick);
        tick = null;
      }
      if (lenis) {
        lenis.destroy();
        lenis = null;
      }
      lenisRef.current = null;
    };

    const setup = () => {
      teardown();
      if (reducedMotionQuery.matches) {
        return;
      }

      const instance = new Lenis({
        lerp: 0.095,
        smoothWheel: true,
        autoRaf: false,
        respectReducedMotion: true,
        prevent: (node: HTMLElement) =>
          Boolean(node.closest("[data-lenis-prevent], pre, code")),
      });

      lenis = instance;
      lenisRef.current = instance;
      instance.on("scroll", ScrollTrigger.update);

      tick = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    setup();
    reducedMotionQuery.addEventListener("change", setup);

    return () => {
      reducedMotionQuery.removeEventListener("change", setup);
      teardown();
    };
  }, []);

  useEffect(() => {
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;

      if (!window.location.hash) {
        lenisRef.current?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      }

      const rafId = window.requestAnimationFrame(() => {
        ensureScrollTriggerRegistered();
        ScrollTrigger.refresh();
      });

      return () => window.cancelAnimationFrame(rafId);
    }
  }, [pathname]);

  return <>{children}</>;
}
