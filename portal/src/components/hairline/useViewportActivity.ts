'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from 'react';

export interface UseViewportActivityOptions {
  /** IntersectionObserver root margin (default `'80px'`, matching Hairline kernel). */
  rootMargin?: string;
  /** IntersectionObserver threshold (default `0.01`). */
  threshold?: number | number[];
  /** External pause flag. When `true`, `isActive` becomes `false`. */
  paused?: boolean;
  /** Initial intersecting state before IntersectionObserver reports (default `false` per Rule 07). */
  initialInView?: boolean;
}

export interface ViewportActivityState<T extends Element = Element> {
  /** True only when element intersects viewport, tab is visible, and not externally paused (Rule 07). */
  isActive: boolean;
  /** True when the observed element intersects the viewport (or when `targetRef === null`). */
  isIntersecting: boolean;
  /** True when `document.visibilityState === 'visible'`. */
  isDocumentVisible: boolean;
  /** Internal fallback ref returned for callers that omit `targetRef`. */
  ref: RefObject<T | null>;
}

function subscribeVisibility(callback: () => void): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }
  document.addEventListener('visibilitychange', callback);
  return () => document.removeEventListener('visibilitychange', callback);
}

function getVisibilitySnapshot(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }
  return document.visibilityState !== 'hidden';
}

function getVisibilityServerSnapshot(): boolean {
  return true;
}

/**
 * Rule 07 (`cost: loops sleep offscreen`):
 * Tracks both `IntersectionObserver` intersection and `document.visibilityState`
 * so ambient animations and signal loops pause automatically when scrolled offscreen or in background tabs.
 *
 * Pass a `targetRef`, attach the returned `ref`, or pass `null` to track document visibility only.
 */
export function useViewportActivity<T extends Element = Element>(
  targetRef?: RefObject<T | null> | null,
  options: UseViewportActivityOptions = {},
): ViewportActivityState<T> {
  const {
    rootMargin = '80px',
    threshold = 0.01,
    paused = false,
    initialInView = false,
  } = options;

  const internalRef = useRef<T | null>(null);
  const isDocumentVisible = useSyncExternalStore(
    subscribeVisibility,
    getVisibilitySnapshot,
    getVisibilityServerSnapshot,
  );

  const visibilityOnly = targetRef === null;
  const [isIntersecting, setIsIntersecting] = useState<boolean>(
    visibilityOnly ? true : initialInView,
  );

  const thresholdKey = Array.isArray(threshold)
    ? threshold.join(',')
    : String(threshold);

  useEffect(() => {
    if (visibilityOnly) return;

    const element = targetRef ? targetRef.current : internalRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const parsedThreshold = thresholdKey.includes(',')
      ? thresholdKey.split(',').map((n) => Number(n))
      : Number(thresholdKey);

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      {
        rootMargin,
        threshold: parsedThreshold,
      },
    );

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [visibilityOnly, targetRef, rootMargin, thresholdKey]);

  const effectiveIntersecting = visibilityOnly ? true : isIntersecting;
  const isActive = !paused && isDocumentVisible && effectiveIntersecting;

  return {
    isActive,
    isIntersecting: effectiveIntersecting,
    isDocumentVisible,
    ref: internalRef,
  };
}
