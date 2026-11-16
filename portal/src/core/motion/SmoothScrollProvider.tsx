"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";

let scrollTriggerRegistered = false;

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
 * Scrolls to an element or `#id` hash using standard browser scrolling
 * while respecting sticky-header clearance.
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
  const targetTop = Math.max(
    0,
    window.scrollY + targetEl.getBoundingClientRect().top - headerOffset,
  );

  if (options?.updateHistory && targetEl.id) {
    window.history.pushState(null, "", `#${targetEl.id}`);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  window.scrollTo({
    top: targetTop,
    left: 0,
    behavior: "auto",
  });

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
  const prevPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    ensureScrollTriggerRegistered();

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
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }

      let innerRaf = 0;
      const outerRaf = window.requestAnimationFrame(() => {
        ensureScrollTriggerRegistered();
        ScrollTrigger.refresh();
        if (window.location.hash.length > 1) {
          innerRaf = window.requestAnimationFrame(() => {
            scrollToElementOrHash(window.location.hash, { immediate: true });
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
