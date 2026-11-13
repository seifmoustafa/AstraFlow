"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

let scrollTriggerRegistered = false;
let activeLenis: Lenis | null = null;

function ensureScrollTriggerRegistered() {
  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }
}

function getHeaderScrollOffset(): number {
  if (typeof window === "undefined") {
    return 92;
  }
  const headerEl = document.querySelector<HTMLElement>(".site-header");
  const measured = headerEl ? headerEl.getBoundingClientRect().height : 76;
  return Math.round((measured > 0 ? measured : 76) + 16);
}

/**
 * Scrolls smoothly (via Lenis when active, or native scrollTo under reduced-motion)
 * to an element or `#id` hash while respecting sticky-header clearance.
 */
export function scrollToElementOrHash(
  target: string | HTMLElement,
  options?: { readonly immediate?: boolean; readonly updateHistory?: boolean },
): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  let targetEl: HTMLElement | null = null;
  if (typeof target === "string") {
    const cleanId = decodeURIComponent(target.replace(/^#/, "")).trim();
    if (!cleanId) {
      return false;
    }
    targetEl = document.getElementById(cleanId);
  } else {
    targetEl = target;
  }

  if (!targetEl) {
    return false;
  }

  const headerOffset = getHeaderScrollOffset();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const immediate = Boolean(options?.immediate) || reduced;
  const targetTop = Math.max(
    0,
    window.scrollY + targetEl.getBoundingClientRect().top - headerOffset,
  );

  if (options?.updateHistory && targetEl.id) {
    window.history.pushState(null, "", `#${targetEl.id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  if (activeLenis && !immediate) {
    activeLenis.scrollTo(targetTop, {
      duration: 0.85,
      force: true,
    });
  } else {
    window.scrollTo({
      top: targetTop,
      behavior: immediate ? "auto" : "smooth",
    });
  }

  if (targetEl.id === "main") {
    if (!targetEl.hasAttribute("tabindex")) {
      targetEl.setAttribute("tabindex", "-1");
    }
    targetEl.focus({ preventScroll: true });
  }

  return true;
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
      if (activeLenis === lenisRef.current) {
        activeLenis = null;
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
      activeLenis = instance;
      instance.on("scroll", ScrollTrigger.update);

      tick = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const targetNode = event.target as Element | null;
      const anchor = targetNode?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.includes("#")) {
        return;
      }

      let parsed: URL;
      try {
        parsed = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }

      if (
        parsed.origin === window.location.origin &&
        parsed.pathname === window.location.pathname &&
        parsed.hash.length > 1
      ) {
        const scrolled = scrollToElementOrHash(parsed.hash, {
          updateHistory: true,
        });
        if (scrolled) {
          event.preventDefault();
        }
      }
    };

    setup();
    reducedMotionQuery.addEventListener("change", setup);
    document.addEventListener("click", handleDocumentClick);

    let initialHashRaf: number | null = null;
    if (window.location.hash.length > 1) {
      initialHashRaf = window.requestAnimationFrame(() => {
        scrollToElementOrHash(window.location.hash, { immediate: true });
      });
    }

    return () => {
      if (initialHashRaf !== null) {
        window.cancelAnimationFrame(initialHashRaf);
      }
      document.removeEventListener("click", handleDocumentClick);
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

      let innerRaf = 0;
      const outerRaf = window.requestAnimationFrame(() => {
        ensureScrollTriggerRegistered();
        ScrollTrigger.refresh();
        if (window.location.hash.length > 1) {
          innerRaf = window.requestAnimationFrame(() => {
            scrollToElementOrHash(window.location.hash, { immediate: false });
          });
        }
      });

      return () => {
        window.cancelAnimationFrame(outerRaf);
        if (innerRaf) {
          window.cancelAnimationFrame(innerRaf);
        }
      };
    }
  }, [pathname]);

  return <>{children}</>;
}
