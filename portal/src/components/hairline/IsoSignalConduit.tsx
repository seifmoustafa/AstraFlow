'use client';

import { useEffect, useMemo, useRef, type CSSProperties } from 'react';
import {
  buildIsoConduitPath,
  clamp,
  createCamera,
  EASE_LIFT_CSS,
  EASE_LIFT_DURATION_MS,
  EASE_STROKE_CSS,
  projectCamera,
  r2,
  WARM_FOREST_PALETTE,
  type IsoCamera,
  type Projector,
  type ReadonlyPoint2,
  type ReadonlyPoint3,
} from './iso-kernel';
import { useReducedMotionSafe } from './useReducedMotionSafe';
import { useViewportActivity } from './useViewportActivity';

export type IsoSignalConduitSurface = 'ivory' | 'forest';

export interface IsoSignalConduitProps {
  /** Precomputed SVG path string `d`. Takes precedence over `points` and `worldPoints`. */
  path?: string;
  /** 2D projected screen-space polyline points. */
  points?: ReadonlyArray<ReadonlyPoint2>;
  /** 3D world-space waypoints projected via `camera` or `project`. */
  worldPoints?: ReadonlyArray<ReadonlyPoint3>;
  /** Camera used when `worldPoints` is provided (defaults to 2:1 `createCamera()`). */
  camera?: IsoCamera;
  /** Custom projector used when `worldPoints` is provided. */
  project?: Projector;
  /** Optional corner fillet radius in screen units for `points` / `worldPoints` (default `0`). */
  cornerRadius?: number;
  /** Energizes the Signal Orange (`#f25e3b`) active trace and sliding pulse. */
  active?: boolean;
  /** Fractional trace reveal in `[0, 1]` (defaults to `1` when `active`, `0` when inactive). */
  progress?: number;
  /** Externally pauses the sliding signal pulse while keeping the active trace visible. */
  paused?: boolean;
  /** Optional viewport activity override; when omitted, `useViewportActivity` pauses offscreen/background tabs (Rule 07). */
  viewportActive?: boolean;
  /** Surface context for base dashed guide contrast (`'ivory' | 'forest'`). Default `'ivory'`. */
  surface?: IsoSignalConduitSurface;
  /** Optional base dashed guide color override (Warm Forest palette). */
  baseColor?: string;
  /** Optional active trace color override (defaults to Signal Orange `#f25e3b`). */
  signalColor?: string;
  /** Base dashed guide `stroke-dasharray` (default `'2 4'`). */
  dashArray?: string;
  /** Base dashed guide stroke width (default `1.1`). */
  baseStrokeWidth?: number;
  /** Active Signal Orange trace stroke width (default `1.65`). */
  activeStrokeWidth?: number;
  /** Full traversal duration in ms for the sliding pulse dot (default `2200`). */
  pulseDurationMs?: number;
  /** Radius of the sliding signal pulse dot in SVG user units (default `2.5`). */
  pulseRadius?: number;
  /** Render crisp geometric terminal anchor dots at endpoints (default `false`). */
  showTerminals?: boolean;
  /** Transition duration in ms for discrete active/progress updates (Rule 08 default `700`). */
  transitionMs?: number;
  /** Stagger delay in ms (Rule 02). */
  delayMs?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
  id?: string;
  dataTestId?: string;
}

/**
 * Orthogonal-isometric SVG hairline conduit (`'use client'`).
 * Renders a base dashed engineering guide (`strokeDasharray`), an energized Signal Orange (`#f25e3b`)
 * active trace, and a subtle sliding signal pulse when `active` is true.
 * Automatically pauses under `prefers-reduced-motion`, explicit `paused`, offscreen scrolling,
 * and background tabs (Rule 07).
 */
export function IsoSignalConduit({
  path: pathProp,
  points,
  worldPoints,
  camera,
  project,
  cornerRadius = 0,
  active = false,
  progress: progressProp,
  paused = false,
  viewportActive: viewportActiveProp,
  surface = 'ivory',
  baseColor,
  signalColor,
  dashArray = '2 4',
  baseStrokeWidth = 1.1,
  activeStrokeWidth = 1.65,
  pulseDurationMs = 2200,
  pulseRadius = 2.5,
  showTerminals = false,
  transitionMs = EASE_LIFT_DURATION_MS,
  delayMs = 0,
  className,
  style,
  ariaLabel,
  id,
  dataTestId,
}: IsoSignalConduitProps) {
  const reducedMotion = useReducedMotionSafe();
  const groupRef = useRef<SVGGElement | null>(null);
  const tracePathRef = useRef<SVGPathElement | null>(null);
  const pulseDotRef = useRef<SVGCircleElement | null>(null);
  const pulseProgressRef = useRef<number>(0);

  const skipInternalObserver = viewportActiveProp !== undefined;
  const { isActive: observedViewportActive } = useViewportActivity(
    skipInternalObserver ? null : groupRef,
    { paused: paused || !active || reducedMotion },
  );

  const effectiveViewportActive =
    viewportActiveProp !== undefined ? viewportActiveProp : observedViewportActive;

  const resolvedPoints = useMemo<ReadonlyArray<ReadonlyPoint2> | undefined>(() => {
    if (points && points.length >= 2) return points;
    if (worldPoints && worldPoints.length >= 2) {
      const P = project ?? projectCamera(camera ?? createCamera());
      return worldPoints.map((pt) => P(pt[0], pt[1], pt[2]));
    }
    return undefined;
  }, [points, worldPoints, camera, project]);

  const d = useMemo(() => {
    if (pathProp) return pathProp;
    if (resolvedPoints) return buildIsoConduitPath(resolvedPoints, cornerRadius);
    return '';
  }, [pathProp, resolvedPoints, cornerRadius]);

  const clampedProgress =
    progressProp !== undefined
      ? clamp(progressProp, 0, 1)
      : active
        ? 1
        : 0;

  const shouldAnimate =
    Boolean(d) &&
    active &&
    clampedProgress > 0.05 &&
    !paused &&
    !reducedMotion &&
    effectiveViewportActive;

  useEffect(() => {
    const pathEl = tracePathRef.current;
    const dotEl = pulseDotRef.current;
    if (!pathEl || !dotEl || typeof pathEl.getTotalLength !== 'function') {
      return;
    }

    const totalLength = pathEl.getTotalLength();
    if (!Number.isFinite(totalLength) || totalLength <= 0.5) {
      dotEl.style.opacity = '0';
      return;
    }

    const activeLength = totalLength * clampedProgress;
    const placeDot = (fraction: number) => {
      const dist = clamp(fraction * activeLength, 0, activeLength);
      const pt = pathEl.getPointAtLength(dist);
      dotEl.setAttribute('cx', String(r2(pt.x)));
      dotEl.setAttribute('cy', String(r2(pt.y)));
      dotEl.style.opacity = active && activeLength > 1 ? '1' : '0';
    };

    if (!active || reducedMotion || activeLength <= 1) {
      dotEl.style.opacity = '0';
      return;
    }

    // When explicitly paused or offscreen while active, freeze the pulse cleanly in place.
    if (!shouldAnimate) {
      placeDot(pulseProgressRef.current);
      return;
    }

    let rafId = 0;
    let lastNow = performance.now();
    const safeDuration = Math.max(400, pulseDurationMs);

    placeDot(pulseProgressRef.current);

    const tick = (now: number) => {
      const dt = Math.min(50, Math.max(0, now - lastNow));
      lastNow = now;
      pulseProgressRef.current = (pulseProgressRef.current + dt / safeDuration) % 1;
      placeDot(pulseProgressRef.current);
      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(rafId);
    };
  }, [d, active, clampedProgress, shouldAnimate, reducedMotion, pulseDurationMs]);

  if (!d) {
    return null;
  }

  const resolvedBaseStroke =
    baseColor ??
    (surface === 'forest'
      ? WARM_FOREST_PALETTE.inkSecondary
      : WARM_FOREST_PALETTE.border);
  const resolvedSignalStroke = signalColor ?? WARM_FOREST_PALETTE.signal;
  const dotCoreBorder =
    surface === 'forest'
      ? WARM_FOREST_PALETTE.ink
      : WARM_FOREST_PALETTE.paperRaised;

  const safeTransitionMs = reducedMotion ? 0 : Math.max(0, transitionMs);
  const safeDelayMs = reducedMotion ? 0 : Math.max(0, delayMs);
  const traceVisible = clampedProgress > 0.001;

  const startTerminal = resolvedPoints?.[0];
  const endTerminal = resolvedPoints?.[resolvedPoints.length - 1];

  return (
    <g
      ref={groupRef}
      id={id}
      data-testid={dataTestId}
      data-hairline-conduit="true"
      data-conduit-active={active ? 'true' : 'false'}
      data-conduit-paused={shouldAnimate ? 'false' : 'true'}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      style={style}
    >
      {/* Base dashed engineering guide */}
      <path
        d={d}
        fill="none"
        stroke={resolvedBaseStroke}
        strokeWidth={baseStrokeWidth}
        strokeDasharray={dashArray}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* Energized Signal Orange active trace */}
      <path
        ref={tracePathRef}
        d={d}
        pathLength={100}
        fill="none"
        stroke={resolvedSignalStroke}
        strokeWidth={activeStrokeWidth}
        strokeDasharray="100 104"
        strokeDashoffset={r2(100 * (1 - clampedProgress))}
        strokeOpacity={traceVisible ? 1 : 0}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          transition:
            safeTransitionMs > 0
              ? `stroke-dashoffset ${safeTransitionMs}ms ${EASE_LIFT_CSS} ${safeDelayMs}ms, stroke-opacity 220ms ${EASE_STROKE_CSS}`
              : 'none',
        }}
      />

      {/* Optional crisp terminal anchor dots */}
      {showTerminals && startTerminal && endTerminal ? (
        <>
          <circle
            cx={r2(startTerminal[0])}
            cy={r2(startTerminal[1])}
            r={2}
            fill={traceVisible ? resolvedSignalStroke : resolvedBaseStroke}
          />
          <circle
            cx={r2(endTerminal[0])}
            cy={r2(endTerminal[1])}
            r={2}
            fill={
              active && clampedProgress >= 0.99
                ? resolvedSignalStroke
                : resolvedBaseStroke
            }
          />
        </>
      ) : null}

      {/* Sliding signal pulse dot (always sleeps offscreen, when paused, and under reduced motion) */}
      <circle
        ref={pulseDotRef}
        cx={startTerminal ? r2(startTerminal[0]) : 0}
        cy={startTerminal ? r2(startTerminal[1]) : 0}
        r={pulseRadius}
        fill={resolvedSignalStroke}
        stroke={dotCoreBorder}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
        style={{ opacity: 0, pointerEvents: 'none' }}
      />
    </g>
  );
}
