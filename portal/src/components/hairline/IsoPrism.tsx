'use client';

import {
  useMemo,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEventHandler,
  type PointerEvent,
  type ReactNode,
} from 'react';
import {
  createCamera,
  createIsoPlateGeometry,
  EASE_LIFT_CSS,
  EASE_LIFT_DURATION_MS,
  EASE_STROKE_CSS,
  polyPointsAttr,
  r2,
  seg,
  WARM_FOREST_PALETTE,
  type FacingPredicate,
  type IsoCamera,
  type IsoPlateGeometry,
  type Projector,
  type ReadonlyPoint2,
} from './iso-kernel';
import { useReducedMotionSafe } from './useReducedMotionSafe';

export type IsoPrismVariant =
  | 'ivory'
  | 'sand'
  | 'forest'
  | 'terracotta'
  | 'dark-forest';

export interface IsoPrismTone {
  readonly fill: string;
  readonly stroke: string;
  readonly crease: string;
  readonly guide: string;
  readonly activeStroke: string;
}

export const ISO_PRISM_PALETTES: Readonly<Record<IsoPrismVariant, IsoPrismTone>> = {
  ivory: {
    fill: WARM_FOREST_PALETTE.paperRaised,
    stroke: WARM_FOREST_PALETTE.muted,
    crease: WARM_FOREST_PALETTE.border,
    guide: WARM_FOREST_PALETTE.border,
    activeStroke: WARM_FOREST_PALETTE.signal,
  },
  sand: {
    fill: WARM_FOREST_PALETTE.sand,
    stroke: WARM_FOREST_PALETTE.muted,
    crease: WARM_FOREST_PALETTE.border,
    guide: WARM_FOREST_PALETTE.border,
    activeStroke: WARM_FOREST_PALETTE.signal,
  },
  forest: {
    fill: WARM_FOREST_PALETTE.forest,
    stroke: WARM_FOREST_PALETTE.muted,
    crease: WARM_FOREST_PALETTE.inkSecondary,
    guide: WARM_FOREST_PALETTE.inkSecondary,
    activeStroke: WARM_FOREST_PALETTE.signal,
  },
  terracotta: {
    fill: WARM_FOREST_PALETTE.peach,
    stroke: WARM_FOREST_PALETTE.action,
    crease: WARM_FOREST_PALETTE.signal,
    guide: WARM_FOREST_PALETTE.action,
    activeStroke: WARM_FOREST_PALETTE.signal,
  },
  'dark-forest': {
    fill: WARM_FOREST_PALETTE.forestDeep,
    stroke: WARM_FOREST_PALETTE.muted,
    crease: WARM_FOREST_PALETTE.inkSecondary,
    guide: WARM_FOREST_PALETTE.inkSecondary,
    activeStroke: WARM_FOREST_PALETTE.signal,
  },
} as const;

export interface IsoPrismBounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  z0?: number;
  z1?: number;
  lift?: number;
  radius?: number;
  creaseInset?: number;
  steps?: number;
  taper?: number;
}

export interface IsoPrismProps {
  /** Precomputed rounded-hull solid plate geometry from `createIsoPlateGeometry`. */
  geometry?: IsoPlateGeometry;
  /** Optional world-space footprint bounds if `geometry` is not precomputed externally. */
  bounds?: IsoPrismBounds;
  /** Camera used when `bounds` is supplied without custom `project`/`front`. */
  camera?: IsoCamera;
  /** Custom projector used when `bounds` is supplied. */
  project?: Projector;
  /** Custom facing predicate used when `bounds` is supplied. */
  front?: FacingPredicate;
  /** Direct silhouette SVG path override (Rule 09). */
  silPath?: string;
  /** Direct inner crease SVG path override (Rule 09). */
  creasePath?: string;
  /** Static rest-pose polygon vertices for Rule 01 invisible hit-target `<polygon pointerEvents="all">`. */
  restHitPolygon?: ReadonlyArray<ReadonlyPoint2>;
  /** Warm Forest surface variant. Default `'ivory'`. */
  variant?: IsoPrismVariant;
  /** Signal Orange stroke active/hovered state (Rule 04). */
  active?: boolean;
  /** Signal Orange persistent selected state (Rule 04). */
  selected?: boolean;
  /** Visual vertical screen-space lift in SVG user units (positive lifts upward; Rule 01 hit-target stays stationary). */
  liftPx?: number;
  /** Distance-staggered transition delay in ms (Rule 02). */
  delayMs?: number;
  /** Lift transition duration in ms (Rule 08 default `700`). */
  transitionMs?: number;
  /** Render rear dashed construction drop lines behind the opaque plate (Rule 06). */
  showDropGuides?: boolean;
  /** Explicit dashed drop guide path override. */
  dropGuidesPath?: string;
  /** Enable static invisible rest-pose `<polygon pointerEvents="all">` hit target (Rule 01). Default `true` when interactive. */
  hitTarget?: boolean;
  /** Enables keyboard/screen-reader button semantics. Defaults to `true` when `onSelect`, `onClick`, `onHoverChange`, or `onFocusChange` is provided. */
  interactive?: boolean;
  /** Accessible ARIA role when interactive (default `'button'`). */
  role?: 'button' | 'option' | 'tab' | 'switch';
  tabIndex?: number;
  disabled?: boolean;
  /** Human-readable name used as `aria-label` fallback when interactive. */
  label?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  ariaDescribedBy?: string;
  ariaControls?: string;
  ariaPressed?: boolean | 'mixed';
  ariaSelected?: boolean;
  strokeWidth?: number;
  activeStrokeWidth?: number;
  creaseStrokeWidth?: number;
  onSelect?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  onFocusChange?: (focused: boolean) => void;
  onClick?: MouseEventHandler<SVGGElement>;
  onKeyDown?: (event: KeyboardEvent<SVGGElement>) => void;
  onPointerEnter?: (event: PointerEvent<SVGGElement>) => void;
  onPointerLeave?: (event: PointerEvent<SVGGElement>) => void;
  className?: string;
  style?: CSSProperties;
  id?: string;
  dataTestId?: string;
  /** Purely visual geometric marks (dots, punches, step reliefs) rendered inside the lifted solid group. */
  children?: ReactNode;
}

/**
 * Accessible SVG isometric rounded-hull prism/plate component (`'use client'`).
 * - Rule 01: Optional static rest-pose invisible hit-target `<polygon pointerEvents="all">` prevents hover oscillation during lift.
 * - Rule 04: Signal Orange (`#f25e3b`) stroke carries active/selected state with zero neon glow.
 * - Rule 06: Opaque ground/surface fill occludes rear dashed drop guides.
 * - Rule 08/02: Discrete 700ms `cubic-bezier(0.32, 0.72, 0, 1)` lift with optional `delayMs` stagger, snapping cleanly under reduced motion.
 * - Rule 09: Rounded hull silhouette + dim front-facing top inner crease.
 */
export function IsoPrism({
  geometry,
  bounds,
  camera,
  project,
  front,
  silPath: silPathProp,
  creasePath: creasePathProp,
  restHitPolygon: restHitPolygonProp,
  variant = 'ivory',
  active = false,
  selected = false,
  liftPx = 0,
  delayMs = 0,
  transitionMs = EASE_LIFT_DURATION_MS,
  showDropGuides = false,
  dropGuidesPath: dropGuidesPathProp,
  hitTarget,
  interactive: interactiveProp,
  role = 'button',
  tabIndex,
  disabled = false,
  label,
  ariaLabel,
  ariaLabelledBy,
  ariaDescribedBy,
  ariaControls,
  ariaPressed,
  ariaSelected,
  strokeWidth = 1.15,
  activeStrokeWidth = 1.65,
  creaseStrokeWidth = 0.9,
  onSelect,
  onHoverChange,
  onFocusChange,
  onClick,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  className,
  style,
  id,
  dataTestId,
  children,
}: IsoPrismProps) {
  const reducedMotion = useReducedMotionSafe();
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const computedGeometry = useMemo<IsoPlateGeometry | undefined>(() => {
    if (geometry || !bounds) return geometry;
    const cam = camera ?? createCamera();
    return createIsoPlateGeometry({
      camera: cam,
      project,
      front,
      x0: bounds.x0,
      y0: bounds.y0,
      x1: bounds.x1,
      y1: bounds.y1,
      z0: bounds.z0,
      z1: bounds.z1,
      lift: bounds.lift,
      radius: bounds.radius,
      creaseInset: bounds.creaseInset,
      steps: bounds.steps,
      taper: bounds.taper,
    });
  }, [geometry, bounds, camera, project, front]);

  const silPath = silPathProp ?? computedGeometry?.silPath ?? '';
  const creasePath = creasePathProp ?? computedGeometry?.creasePath ?? '';
  const hitPolygon =
    restHitPolygonProp ??
    computedGeometry?.restHitPolygon ??
    computedGeometry?.topPolygon;

  const restHitPointsAttr = useMemo(() => {
    if (!hitPolygon || hitPolygon.length < 3) return '';
    return polyPointsAttr(hitPolygon);
  }, [hitPolygon]);

  const resolvedDropPath = useMemo(() => {
    if (!showDropGuides) return '';
    if (dropGuidesPathProp !== undefined) return dropGuidesPathProp;
    if (!computedGeometry) return '';
    if (computedGeometry.dropAnchors.dropPath) {
      return computedGeometry.dropAnchors.dropPath;
    }
    if (Math.abs(liftPx) > 0.05) {
      const { left, right, nearest, leftBase, rightBase, nearestBase } =
        computedGeometry.dropAnchors;
      return (
        seg([left[0], left[1] - liftPx], leftBase) +
        seg([right[0], right[1] - liftPx], rightBase) +
        seg([nearest[0], nearest[1] - liftPx], nearestBase)
      );
    }
    return '';
  }, [showDropGuides, dropGuidesPathProp, computedGeometry, liftPx]);

  if (!silPath) {
    return null;
  }

  const tone = ISO_PRISM_PALETTES[variant];
  const isHighlighted = active || selected;
  const isInteractive =
    interactiveProp ??
    Boolean(onSelect || onClick || onHoverChange || onFocusChange);
  const useStaticHitTarget =
    isInteractive && (hitTarget ?? true) && restHitPointsAttr.length > 0;

  const resolvedAriaLabel =
    ariaLabel ?? (ariaLabelledBy ? undefined : label);
  const resolvedPressed =
    ariaPressed ?? (role === 'button' || role === 'switch' ? selected : undefined);
  const resolvedSelected =
    ariaSelected ?? (role === 'option' || role === 'tab' ? selected : undefined);

  const safeTransitionMs = reducedMotion ? 0 : Math.max(0, transitionMs);
  const safeDelayMs = reducedMotion ? 0 : Math.max(0, delayMs);

  const visualTransformStyle: CSSProperties = {
    transform:
      Math.abs(liftPx) > 0.001
        ? `translate3d(0, ${r2(-liftPx)}px, 0)`
        : 'translate3d(0, 0, 0)',
    transition:
      safeTransitionMs > 0
        ? `transform ${safeTransitionMs}ms ${EASE_LIFT_CSS} ${safeDelayMs}ms`
        : 'none',
    pointerEvents: useStaticHitTarget ? 'none' : undefined,
  };

  const strokeTransition = reducedMotion
    ? 'none'
    : `stroke 260ms ${EASE_STROKE_CSS}`;

  const handleKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented || disabled || !isInteractive) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.();
    }
  };

  const handleFocus = (event: FocusEvent<SVGGElement>) => {
    if (!isInteractive || disabled) return;
    let visible = true;
    try {
      visible = event.currentTarget.matches(':focus-visible');
    } catch {
      visible = true;
    }
    setIsFocusVisible(visible);
    onFocusChange?.(true);
  };

  const handleBlur = () => {
    setIsFocusVisible(false);
    if (isInteractive) {
      onFocusChange?.(false);
    }
  };

  const handlePointerEnter = (event: PointerEvent<SVGGElement>) => {
    onPointerEnter?.(event);
    if (!disabled && isInteractive) {
      onHoverChange?.(true);
    }
  };

  const handlePointerLeave = (event: PointerEvent<SVGGElement>) => {
    onPointerLeave?.(event);
    if (isInteractive) {
      onHoverChange?.(false);
    }
  };

  const handleClick: MouseEventHandler<SVGGElement> = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
    if (!event.defaultPrevented && isInteractive) {
      onSelect?.();
    }
  };

  return (
    <g
      id={id}
      data-testid={dataTestId}
      data-hairline-prism="true"
      data-variant={variant}
      data-active={active ? 'true' : 'false'}
      data-selected={selected ? 'true' : 'false'}
      className={className}
      role={isInteractive ? role : undefined}
      tabIndex={isInteractive ? (disabled ? -1 : (tabIndex ?? 0)) : undefined}
      aria-label={isInteractive ? resolvedAriaLabel : undefined}
      aria-labelledby={isInteractive ? ariaLabelledBy : undefined}
      aria-describedby={isInteractive ? ariaDescribedBy : undefined}
      aria-controls={isInteractive ? ariaControls : undefined}
      aria-pressed={isInteractive ? resolvedPressed : undefined}
      aria-selected={isInteractive ? resolvedSelected : undefined}
      aria-disabled={isInteractive && disabled ? true : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      onFocus={isInteractive ? handleFocus : undefined}
      onBlur={isInteractive ? handleBlur : undefined}
      onPointerEnter={isInteractive ? handlePointerEnter : undefined}
      onPointerLeave={isInteractive ? handlePointerLeave : undefined}
      style={{
        outline: 'none',
        cursor: isInteractive ? (disabled ? 'not-allowed' : 'pointer') : undefined,
        pointerEvents:
          !isInteractive && hitTarget === false ? 'none' : undefined,
        ...style,
      }}
    >
      {/* Rule 06: Rear dashed drop guides are painted behind the opaque plate silhouette */}
      {resolvedDropPath ? (
        <path
          d={resolvedDropPath}
          fill="none"
          stroke={tone.guide}
          strokeWidth={1}
          strokeDasharray="1.5 3.5"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
        />
      ) : null}

      {/* Visual lifted solid group: pointerEvents="none" when static hitTarget handles Rule 01 */}
      <g style={visualTransformStyle}>
        <path
          d={silPath}
          fill={tone.fill}
          stroke={isHighlighted ? tone.activeStroke : tone.stroke}
          strokeWidth={isHighlighted ? activeStrokeWidth : strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ transition: strokeTransition }}
        />

        {creasePath ? (
          <path
            d={creasePath}
            fill="none"
            stroke={tone.crease}
            strokeWidth={creaseStrokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            style={{ transition: strokeTransition }}
          />
        ) : null}

        {isFocusVisible ? (
          <path
            d={silPath}
            fill="none"
            stroke={WARM_FOREST_PALETTE.signal}
            strokeWidth={2}
            strokeDasharray="3 2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        ) : null}

        {children}
      </g>

      {/* Rule 01: Static invisible rest-pose hit polygon prevents pointer lift flicker */}
      {useStaticHitTarget ? (
        <polygon
          points={restHitPointsAttr}
          fill="transparent"
          stroke="none"
          pointerEvents="all"
        />
      ) : null}
    </g>
  );
}
