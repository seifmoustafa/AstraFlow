"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { MotionConfig } from "motion/react";

export interface ReducedMotionContextValue {
  /** True when the provider is mounted above the consumer */
  hasProvider: boolean;
  /** True when the user OS/browser requests `(prefers-reduced-motion: reduce)` */
  prefersReducedMotion: boolean;
  /** True when `document.visibilityState === 'visible'` */
  isDocumentVisible: boolean;
  /** True when the user has manually paused the hero signal trace */
  userPaused: boolean;
  /** Toggle manual pause of the hero signal trace */
  toggleUserPause: () => void;
  /** Set manual pause state explicitly */
  setUserPaused: (paused: boolean) => void;
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  hasProvider: false,
  prefersReducedMotion: false,
  isDocumentVisible: true,
  userPaused: false,
  toggleUserPause: () => {},
  setUserPaused: () => {},
});

export function useReducedMotionContext(): ReducedMotionContextValue {
  return useContext(ReducedMotionContext);
}

/**
 * Resolves the canonical `data-page` attribute value expected by
 * `vision.css`, `final.css`, `polish.css`, and `craft-v12.css`.
 */
function resolveDataPage(pathname: string | null): string {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/packages")) return "packages";
  if (pathname.startsWith("/docs")) return "docs";
  if (pathname.startsWith("/guides")) return "guides";
  if (pathname.startsWith("/changelog")) return "changelog";
  if (pathname.startsWith("/community")) return "community";
  return "home";
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface ReducedMotionProviderProps {
  children: React.ReactNode;
}

/**
 * Global Motion & Hairline discipline provider per `MOTION-HAIRLINE-DESIGN-CONTRACT.md`:
 * 1. Wraps the React tree in `<MotionConfig reducedMotion="user">` from `motion/react`.
 * 2. Tracks `(prefers-reduced-motion: reduce)` and `document.visibilityState`.
 * 3. Synchronizes `document.body.dataset.page` with the active route so page-scoped
 *    v12 CSS selectors (`body[data-page="home"]`, `body:not([data-page="home"])`, etc.) match 100%.
 * 4. Applies `.hairline-ivory` CSS custom properties (`--hairline-plate`, `--hairline-hi`, etc.).
 * 5. Runs RAF-throttled `--v11-scroll` header progress indicator and one-shot below-the-fold
 *    `IntersectionObserver` (`data-v11-entrance`) without ever hiding LCP or Hero geometry.
 * 6. Synchronizes Flow Explorer stage beam travel (`--v12-stage-x`, `--v11-stage-progress`)
 *    and Home Hero signal pause/resume state (`#v10-signature-stage`, `#v10-motion-toggle`).
 */
export function ReducedMotionProvider({
  children,
}: ReducedMotionProviderProps) {
  const pathname = usePathname();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [userPaused, setUserPaused] = useState(false);

  const toggleUserPause = useCallback(() => {
    setUserPaused((prev) => !prev);
  }, []);

  // Sync body[data-page] and Hairline CSS variables synchronously on route change
  useIsomorphicLayoutEffect(() => {
    if (typeof document === "undefined") return;
    const pageId = resolveDataPage(pathname);
    document.body.setAttribute("data-page", pageId);
    document.documentElement.setAttribute("data-theme", "warm-forest");

    // Ensure Hairline v0.5.1 custom properties are available on :root for Warm Ivory surfaces
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--hairline-plate", "#F7F3EB");
    rootStyle.setProperty("--hairline-hi", "#082C26");
    rootStyle.setProperty("--hairline-edge", "#62766B");
    rootStyle.setProperty("--hairline-mid", "#92A69A");
    rootStyle.setProperty("--hairline-lo", "#D6D3C8");
    rootStyle.setProperty("--hairline-stroke", "0.9");
  }, [pathname]);

  // Track prefers-reduced-motion and document visibility
  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    setIsDocumentVisible(!document.hidden);

    const onMediaChange = () => setPrefersReducedMotion(media.matches);
    const onVisibilityChange = () => setIsDocumentVisible(!document.hidden);

    media.addEventListener?.("change", onMediaChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      media.removeEventListener?.("change", onMediaChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // RAF-throttled scroll completion indicator (--v11-scroll) per polish.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    let pending = false;
    const updateProgress = () => {
      const max = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const percent = Math.max(0, Math.min(1, window.scrollY / max));
      document.documentElement.style.setProperty(
        "--v11-scroll",
        percent.toFixed(4),
      );
    };

    const onScroll = () => {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(() => {
        updateProgress();
        pending = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateProgress, { passive: true });
    updateProgress();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateProgress);
    };
  }, [pathname]);

  // Below-the-fold one-shot entrance observer (never touches Hero or LCP) per polish.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    const selector =
      ".editorial-panel .section-head, .editorial-panel .line-card, .v10-assembly-head, .v10-assembly-figure, .release-row, .docs-reading, .v10-flow-instrument";

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
        el.removeAttribute("data-v11-entrance");
      });
      return;
    }

    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(selector),
    ).filter(
      (el) => el.getBoundingClientRect().top > window.innerHeight + 20,
    );

    if (candidates.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.v11Entrance = "visible";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -4% 0px" },
    );

    candidates.forEach((el) => {
      el.dataset.v11Entrance = "waiting";
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname, prefersReducedMotion]);

  // Flow Explorer stage beam travel & progress synchronizer per craft-v12.js & polish.js
  useEffect(() => {
    if (typeof window === "undefined") return;

    const path = document.querySelector<HTMLElement>("#flow-path");
    const pulse = document.querySelector<HTMLElement>(".v12-stage-travel");
    if (!path || !pulse) return;

    let frame = 0;
    const update = () => {
      const active = path.querySelector<HTMLElement>(
        '.flow-node[data-active="true"]',
      );
      const nodes = Array.from(path.querySelectorAll<HTMLElement>(".flow-node"));
      if (!active || nodes.length === 0) return;

      const index = Math.max(0, nodes.indexOf(active));
      const rail = path.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const x = Math.max(0, rect.left + rect.width / 2 - rail.left - 3.5);

      pulse.style.setProperty("--v12-stage-x", `${x.toFixed(1)}px`);
      path.style.setProperty("--v12-stage-x", `${x.toFixed(1)}px`);
      path.style.setProperty(
        "--v11-stage-progress",
        `${((index / 3) * 100).toFixed(2)}%`,
      );
      path.setAttribute("aria-label", `Guided flow, step ${index + 1} of 4`);

      const counter = document.querySelector<HTMLElement>(
        "#v12-decision-count",
      );
      if (counter) {
        counter.textContent = String(index + 1).padStart(2, "0");
      }
    };

    const queueUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(update);
    };

    const mutationObserver = new MutationObserver(queueUpdate);
    mutationObserver.observe(path, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-active", "aria-pressed"],
    });

    let resizeObserver: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(queueUpdate);
      resizeObserver.observe(path);
    }

    window.addEventListener("resize", queueUpdate, { passive: true });
    queueUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      mutationObserver.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("resize", queueUpdate);
    };
  }, [pathname, prefersReducedMotion]);

  const contextValue = useMemo<ReducedMotionContextValue>(
    () => ({
      hasProvider: true,
      prefersReducedMotion,
      isDocumentVisible,
      userPaused,
      toggleUserPause,
      setUserPaused,
    }),
    [prefersReducedMotion, isDocumentVisible, userPaused, toggleUserPause],
  );

  return (
    <ReducedMotionContext.Provider value={contextValue}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ReducedMotionContext.Provider>
  );
}

/**
 * Reusable hook for Home Hero SignalTrace pause/resume, IntersectionObserver,
 * document visibility, and `(prefers-reduced-motion: reduce)` synchronization.
 * Works both inside `<ReducedMotionProvider>` and standalone.
 */
export function useSignalPauseController(
  stageRef: React.RefObject<HTMLElement | null>,
) {
  const ctx = useReducedMotionContext();
  const [localReduced, setLocalReduced] = useState(false);
  const [localDocVisible, setLocalDocVisible] = useState(true);
  const [localUserPaused, setLocalUserPaused] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setLocalReduced(media.matches);
    setLocalDocVisible(!document.hidden);

    const onMediaChange = () => setLocalReduced(media.matches);
    const onVisibilityChange = () => setLocalDocVisible(!document.hidden);

    media.addEventListener?.("change", onMediaChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    let observer: IntersectionObserver | null = null;
    if ("IntersectionObserver" in window && stageRef.current) {
      observer = new IntersectionObserver(
        (entries) => {
          setIsIntersecting(entries[0]?.isIntersecting ?? true);
        },
        { threshold: 0.06 },
      );
      observer.observe(stageRef.current);
    }

    return () => {
      media.removeEventListener?.("change", onMediaChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer?.disconnect();
    };
  }, [stageRef]);

  const prefersReducedMotion = ctx.hasProvider
    ? ctx.prefersReducedMotion || localReduced
    : localReduced;
  const isDocumentVisible = ctx.hasProvider
    ? ctx.isDocumentVisible && localDocVisible
    : localDocVisible;
  const userPaused = ctx.hasProvider ? ctx.userPaused : localUserPaused;
  const toggleUserPause = useCallback(() => {
    if (ctx.hasProvider) {
      ctx.toggleUserPause();
    } else {
      setLocalUserPaused((prev) => !prev);
    }
  }, [ctx]);

  const isPaused =
    prefersReducedMotion || userPaused || !isIntersecting || !isDocumentVisible;

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const svg = el.querySelector<SVGSVGElement>(".v10-logo-svg");
    if (!svg) return;
    try {
      if (isPaused) {
        svg.pauseAnimations?.();
      } else {
        svg.unpauseAnimations?.();
      }
    } catch {
      // Safe fallback when SVGSMILElement.pauseAnimations is unsupported
    }
  }, [isPaused, stageRef]);

  return {
    isPaused,
    userPaused,
    prefersReducedMotion,
    toggleUserPause,
  };
}

/**
 * Hook for synchronizing Flow Explorer stage beam travel (`--v12-stage-x`)
 * and progress bar (`--v11-stage-progress`) with zero layout thrash.
 */
export function useFlowStageSynchronizer(
  railRef: React.RefObject<HTMLElement | null>,
  nodeRefs: React.RefObject<Array<HTMLElement | null>>,
  step: 0 | 1 | 2 | 3,
  depsKey?: string,
) {
  const [stageX, setStageX] = useState<number>(0);

  useIsomorphicLayoutEffect(() => {
    const update = () => {
      const rail = railRef.current;
      const activeNode = nodeRefs.current?.[step];
      if (!rail || !activeNode) return;
      const railRect = rail.getBoundingClientRect();
      const nodeRect = activeNode.getBoundingClientRect();
      const x = Math.max(
        0,
        nodeRect.left + nodeRect.width / 2 - railRect.left - 3.5,
      );
      setStageX(Number(x.toFixed(1)));
    };

    update();

    const rail = railRef.current;
    let observer: ResizeObserver | null = null;
    if (rail && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(update);
      observer.observe(rail);
    }

    window.addEventListener("resize", update, { passive: true });
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [railRef, nodeRefs, step, depsKey]);

  return {
    stageX,
    progressPercent: `${((step / 3) * 100).toFixed(2)}%`,
  };
}
