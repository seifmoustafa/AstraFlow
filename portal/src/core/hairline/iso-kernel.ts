/**
 * AstraFlow Hairline Isometric Geometry Kernel
 *
 * Pure TypeScript 2:1 isometric projection, rounded-solid hull geometry,
 * distance-staggered timing (Rule 02), clamped reach falloff (Rule 03),
 * and opaque plate construction helpers (Rules 06 & 09).
 *
 * Strictly zero DOM dependencies so it executes safely in SSR, RSC, and client code.
 */

export type Point2 = [number, number];
export type Point3 = [number, number, number];
export type ReadonlyPoint2 = readonly [number, number];
export type ReadonlyPoint3 = readonly [number, number, number];

export interface RingSample {
  readonly u: number;
  readonly v: number;
  readonly nu: number;
  readonly nv: number;
}

export interface IsoCamera {
  az: number;
  k: number;
  S: number;
  ox: number;
  oy: number;
}

export type Projector = (x: number, y: number, z: number) => Point2;
export type FacingPredicate = (sample: RingSample) => boolean;

export interface PrismPaths {
  sil: string;
  crease: string;
}

export interface IsoPlateGeometryOptions {
  /** Camera used when custom `project`/`front` are not supplied. Defaults to 2:1 camera. */
  camera?: IsoCamera;
  /** Optional precomputed projector from `projectCamera`. */
  project?: Projector;
  /** Optional precomputed facing predicate from `createFacingPredicate`. */
  front?: FacingPredicate;
  /** World-space footprint bounds. */
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  /** Base elevation in world units (default 0). */
  z0?: number;
  /** Top elevation in world units (default 8). */
  z1?: number;
  /** World-space vertical lift offset (default 0). Leaves `restCenter` and `restHitPolygon` stationary (Rule 01). */
  lift?: number;
  /** Corner radius in world units (default 4). */
  radius?: number;
  /** Inner top crease inset `b` in world units (default 1.4; pass 0 to omit crease). */
  creaseInset?: number;
  /** Arc subdivision steps per corner (default 4; increase to 10-14 for large rounds per Rule 09). */
  steps?: number;
  /** Optional inward taper from foot to top ring in world units (default 0). */
  taper?: number;
}

export interface IsoPlateDropAnchors {
  /** Leftmost silhouette extreme at `z0 + lift`. */
  left: Point2;
  /** Rightmost silhouette extreme at `z0 + lift`. */
  right: Point2;
  /** Nearest-to-viewer silhouette extreme at `z0 + lift`. */
  nearest: Point2;
  /** Rest-base endpoint below `left` at `z0`. */
  leftBase: Point2;
  /** Rest-base endpoint below `right` at `z0`. */
  rightBase: Point2;
  /** Rest-base endpoint below `nearest` at `z0`. */
  nearestBase: Point2;
  /** Combined SVG subpath string for dashed drop guides behind a lifted plate (Rule 06). */
  dropPath: string;
}

export interface IsoPlateGeometry {
  /** Opaque rounded-hull outer silhouette SVG path (Rule 09). */
  silPath: string;
  /** Dim front-facing inner top crease SVG path (Rule 09). */
  creasePath: string;
  /** Projected top-ring polygon vertices at `z1 + lift`. */
  topPolygon: Point2[];
  /** Projected silhouette hull vertices at rest (`lift = 0`) for static Rule 01 pointer hit targets. */
  restHitPolygon: Point2[];
  /** Projected top-ring vertices at rest (`lift = 0`). */
  restTopPolygon: Point2[];
  /** Extreme drop anchor coordinates for rear dashed construction guides (Rule 06). */
  dropAnchors: IsoPlateDropAnchors;
  /** Rest-pose center of the top face at `z1` (Rule 01). */
  restCenter: Point2;
  /** Current center of the top face at `z1 + lift`. */
  topCenter: Point2;
  /** Painter's order sort key (`centerX + centerY`, ascending = far to near). */
  depthKey: number;
}

export interface WarmForestPalette {
  readonly paper: '#f7f3eb';
  readonly paperRaised: '#fffdf7';
  readonly sand: '#ece5d9';
  readonly border: '#d8d0c2';
  readonly ink: '#082c26';
  readonly inkSecondary: '#2f5b4e';
  readonly forest: '#0a342b';
  readonly forestDeep: '#051e19';
  readonly signal: '#f25e3b';
  readonly action: '#b73921';
  readonly peach: '#ffd2bd';
  readonly muted: '#617267';
}

export const WARM_FOREST_PALETTE: WarmForestPalette = {
  paper: '#f7f3eb',
  paperRaised: '#fffdf7',
  sand: '#ece5d9',
  border: '#d8d0c2',
  ink: '#082c26',
  inkSecondary: '#2f5b4e',
  forest: '#0a342b',
  forestDeep: '#051e19',
  signal: '#f25e3b',
  action: '#b73921',
  peach: '#ffd2bd',
  muted: '#617267',
} as const;

/** Rule 08 discrete lift clock duration (ms). */
export const EASE_LIFT_DURATION_MS = 700;

/** Rule 08 discrete ease-out curve. */
export const EASE_LIFT_CSS = 'cubic-bezier(0.32, 0.72, 0, 1)';

/** Rule 04 stroke highlight transition curve. */
export const EASE_STROKE_CSS = 'cubic-bezier(0.5, 0, 0.1, 1)';

/** Rule 08 continuous spring parameters (`k 100 · c 18 · m 1`). */
export const SPRING_DEFAULT = {
  stiffness: 100,
  damping: 18,
  mass: 1,
} as const;

/** Clamp `value` into `[a, b]` safely even if bounds are swapped. */
export function clamp(value: number, a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation between `a` and `b` at normalized factor `t`. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Convert degrees to radians. */
export function rad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Round to two decimal places and normalize `-0` to `0` for deterministic SVG paths. */
export function r2(n: number): number {
  const rounded = Math.round(n * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

/** Format a closed SVG polygon path string (`M ... L ... Z`). */
export function poly(pts: ReadonlyArray<ReadonlyPoint2>): string {
  if (pts.length === 0) return '';
  return 'M' + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join('L') + 'Z';
}

/** Format an open SVG polyline path string (`M ... L ...`). */
export function open(pts: ReadonlyArray<ReadonlyPoint2>): string {
  if (pts.length < 2) return '';
  return 'M' + pts.map((p) => `${r2(p[0])} ${r2(p[1])}`).join('L');
}

/** Format a single line segment SVG subpath (`M x0 y0 L x1 y1`). */
export function seg(a: ReadonlyPoint2, b: ReadonlyPoint2): string {
  return `M${r2(a[0])} ${r2(a[1])}L${r2(b[0])} ${r2(b[1])}`;
}

/** Format 2D screen points into an SVG `<polygon points="...">` attribute string. */
export function polyPointsAttr(pts: ReadonlyArray<ReadonlyPoint2>): string {
  return pts.map((p) => `${r2(p[0])},${r2(p[1])}`).join(' ');
}

/**
 * Create a 2:1 isometric camera (`azDeg = 45`, `k = 0.5`, `scale = 1.6`).
 * At default azimuth 45 deg, `+x` extends down-right and `+y` extends down-left.
 */
export function createCamera(azDeg = 45, k = 0.5, scale = 1.6): IsoCamera {
  return {
    az: rad(azDeg),
    k,
    S: scale,
    ox: 0,
    oy: 0,
  };
}

/** Create a world-to-screen `[sx, sy]` projector function for `camera`. */
export function projectCamera(camera: IsoCamera): Projector {
  const c = Math.cos(camera.az);
  const s = Math.sin(camera.az);
  const zf = Math.sqrt(Math.max(0, 1 - camera.k * camera.k));
  return (x: number, y: number, z: number): Point2 => {
    const X = x * c - y * s;
    const Y = x * s + y * c;
    return [
      camera.ox + camera.S * X,
      camera.oy + camera.S * (Y * camera.k - z * zf),
    ];
  };
}

/** Unproject a screen point `(sx, sy)` onto the horizontal world plane at elevation `z`. */
export function unprojectCamera(
  camera: IsoCamera,
  sx: number,
  sy: number,
  z = 0,
): Point2 {
  const c = Math.cos(camera.az);
  const s = Math.sin(camera.az);
  const zf = Math.sqrt(Math.max(0, 1 - camera.k * camera.k));
  const safeScale = Math.abs(camera.S) < 1e-6 ? 1 : camera.S;
  const safeK = Math.abs(camera.k) < 1e-6 ? 1 : camera.k;
  const X = (sx - camera.ox) / safeScale;
  const Y = ((sy - camera.oy) / safeScale + z * zf) / safeK;
  return [X * c + Y * s, -X * s + Y * c];
}

/**
 * Center the projected bounding box of 3D `pts` on `(cx, cy)` by updating `camera.ox` and `camera.oy`.
 * Call once before projecting geometry, including the most extreme lifted pose in `pts` (Rule 03).
 */
export function fitCamera(
  camera: IsoCamera,
  pts: ReadonlyArray<ReadonlyPoint3>,
  cx: number,
  cy: number,
): IsoCamera {
  camera.ox = 0;
  camera.oy = 0;
  if (pts.length === 0) {
    camera.ox = cx;
    camera.oy = cy;
    return camera;
  }
  const project = projectCamera(camera);
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const p of pts) {
    const q = project(p[0], p[1], p[2]);
    if (q[0] < minX) minX = q[0];
    if (q[0] > maxX) maxX = q[0];
    if (q[1] < minY) minY = q[1];
    if (q[1] > maxY) maxY = q[1];
  }

  camera.ox = cx - (minX + maxX) / 2;
  camera.oy = cy - (minY + maxY) / 2;
  return camera;
}

/** Return a predicate identifying outward-facing ring samples visible to `camera`. */
export function createFacingPredicate(camera: IsoCamera): FacingPredicate {
  const s = Math.sin(camera.az);
  const c = Math.cos(camera.az);
  return (sample: RingSample): boolean => sample.nu * s + sample.nv * c >= -1e-6;
}

/** Generate a rounded rectangle footprint ring of samples `{ u, v, nu, nv }`. */
export function rrect(
  u0: number,
  v0: number,
  u1: number,
  v1: number,
  r: number,
  n = 4,
): RingSample[] {
  const minU = Math.min(u0, u1);
  const maxU = Math.max(u0, u1);
  const minV = Math.min(v0, v1);
  const maxV = Math.max(v0, v1);
  const clampedR = Math.max(0, Math.min(r, (maxU - minU) / 2, (maxV - minV) / 2));
  const steps = Math.max(1, Math.round(n));
  const out: RingSample[] = [];
  const corners: ReadonlyArray<readonly [number, number, number]> = [
    [maxU - clampedR, maxV - clampedR, 0],
    [minU + clampedR, maxV - clampedR, 90],
    [minU + clampedR, minV + clampedR, 180],
    [maxU - clampedR, minV + clampedR, 270],
  ];

  for (const [cu, cv, a0] of corners) {
    for (let k = 0; k <= steps; k++) {
      const a = rad(a0 + (90 * k) / steps);
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      out.push({
        u: cu + clampedR * ca,
        v: cv + clampedR * sa,
        nu: ca,
        nv: sa,
      });
    }
  }
  return out;
}

/** Generate a circular footprint ring centered at `(cx, cy)`. */
export function circ(radius: number, n = 96, cx = 0, cy = 0): RingSample[] {
  const steps = Math.max(3, Math.round(n));
  const safeR = Math.max(0, radius);
  const out: RingSample[] = [];
  for (let k = 0; k < steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    out.push({
      u: cx + safeR * ca,
      v: cy + safeR * sa,
      nu: ca,
      nv: sa,
    });
  }
  return out;
}

/**
 * Build `[outerRing, innerCreaseRing]` for a rounded rectangular solid.
 * `b` is clamped strictly below half the shorter side so the crease never turns inside out.
 */
export function rings(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  r: number,
  b: number,
  n = 4,
): [RingSample[], RingSample[]] {
  const minX = Math.min(x0, x1);
  const maxX = Math.max(x0, x1);
  const minY = Math.min(y0, y1);
  const maxY = Math.max(y0, y1);
  const maxInset = Math.max(0, Math.min((maxX - minX) / 2, (maxY - minY) / 2) - 0.1);
  const safeB = clamp(b, 0, maxInset);
  return [
    rrect(minX, minY, maxX, maxY, r, n),
    rrect(minX + safeB, minY + safeB, maxX - safeB, maxY - safeB, Math.max(0.3, r - safeB), n),
  ];
}

/** Project every sample in `ring` onto screen coordinates at world height `z`. */
export function ringAt(
  project: Projector,
  ring: ReadonlyArray<RingSample>,
  z: number,
): Point2[] {
  return ring.map((q) => project(q.u, q.v, z));
}

/** Extract the single continuous cyclic run of items passing `keep`. */
export function run<T>(ring: ReadonlyArray<T>, keep: (item: T) => boolean): T[] {
  const n = ring.length;
  if (n === 0) return [];
  let start = -1;
  for (let i = 0; i < n; i++) {
    if (keep(ring[i]) && !keep(ring[(i + n - 1) % n])) {
      start = i;
      break;
    }
  }
  if (start < 0) return keep(ring[0]) ? ring.slice() : [];
  const out: T[] = [];
  for (let k = 0; k < n && keep(ring[(start + k) % n]); k++) {
    out.push(ring[(start + k) % n]);
  }
  return out;
}

/** Compute the 2D convex hull of screen points using Andrew's monotone chain. */
export function hull(input: ReadonlyArray<ReadonlyPoint2>): Point2[] {
  if (input.length === 0) return [];
  if (input.length === 1) return [[input[0][0], input[0][1]]];
  const pts: Point2[] = input.map((p) => [p[0], p[1]]);
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  const cross = (o: Point2, a: Point2, b: Point2): number =>
    (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

  const lo: Point2[] = [];
  for (const p of pts) {
    while (lo.length > 1 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) {
      lo.pop();
    }
    lo.push(p);
  }

  const up: Point2[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (up.length > 1 && cross(up[up.length - 2], up[up.length - 1], p) <= 0) {
      up.pop();
    }
    up.push(p);
  }

  lo.pop();
  up.pop();
  return lo.concat(up);
}

/** Build `{ sil, crease }` SVG paths for an extruded rounded solid standing from `z0` to `z1` (Rule 09). */
export function prism(
  project: Projector,
  front: FacingPredicate,
  ring: ReadonlyArray<RingSample>,
  inner: ReadonlyArray<RingSample> | null | undefined,
  z0: number,
  z1: number,
): PrismPaths {
  const topPts = ringAt(project, ring, z1);
  const botPts = ringAt(project, ring, z0);
  return {
    sil: poly(hull(topPts.concat(botPts))),
    crease: inner ? open(ringAt(project, run(inner, front), z1)) : '',
  };
}

/**
 * Build `{ sil, crease }` SVG paths for a tapered rounded solid whose top ring is smaller than its foot (Rule 09).
 */
export function taperedPrism(
  project: Projector,
  front: FacingPredicate,
  foot: ReadonlyArray<RingSample>,
  top: ReadonlyArray<RingSample>,
  inner: ReadonlyArray<RingSample> | null | undefined,
  z0: number,
  z1: number,
): PrismPaths {
  const topPts = ringAt(project, top, z1);
  const botPts = ringAt(project, foot, z0);
  return {
    sil: poly(hull(botPts.concat(topPts))),
    crease: inner ? open(ringAt(project, run(inner, front), z1)) : '',
  };
}

/**
 * Round every vertex of a closed 2D polygon using quadratic Bezier corner fillets.
 * Accepts either a per-vertex array of radii or a single uniform radius.
 */
export function fillet(
  pts: ReadonlyArray<ReadonlyPoint2>,
  radii: ReadonlyArray<number> | number,
  n = 4,
): Point2[] {
  const m = pts.length;
  if (m < 3) return pts.map((p) => [p[0], p[1]]);
  const steps = Math.max(1, Math.round(n));
  const out: Point2[] = [];

  for (let i = 0; i < m; i++) {
    const a = pts[(i + m - 1) % m];
    const p = pts[i];
    const b = pts[(i + 1) % m];
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]);
    const lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    if (la < 1e-6 || lb < 1e-6) {
      out.push([p[0], p[1]]);
      continue;
    }
    const r = typeof radii === 'number' ? radii : (radii[i] ?? 0);
    const t = Math.max(0, Math.min(r, la / 2, lb / 2));
    const p1: Point2 = [p[0] + ((a[0] - p[0]) / la) * t, p[1] + ((a[1] - p[1]) / la) * t];
    const p2: Point2 = [p[0] + ((b[0] - p[0]) / lb) * t, p[1] + ((b[1] - p[1]) / lb) * t];

    for (let k = 0; k <= steps; k++) {
      const s = k / steps;
      const w = 1 - s;
      out.push([
        w * w * p1[0] + 2 * w * s * p[0] + s * s * p2[0],
        w * w * p1[1] + 2 * w * s * p[1] + s * s * p2[1],
      ]);
    }
  }
  return out;
}

/** Find `[left, right, nearest]` extreme ring samples in screen coordinates (used for dashed drops). */
export function extremes(
  project: Projector,
  ring: ReadonlyArray<RingSample>,
  z = 0,
): [RingSample, RingSample, RingSample] {
  if (ring.length === 0) {
    const empty: RingSample = { u: 0, v: 0, nu: 0, nv: 0 };
    return [empty, empty, empty];
  }
  const projected = ring.map((q) => project(q.u, q.v, z));
  let leftIdx = 0;
  let rightIdx = 0;
  let nearestIdx = 0;
  for (let k = 1; k < projected.length; k++) {
    if (projected[k][0] < projected[leftIdx][0]) leftIdx = k;
    if (projected[k][0] > projected[rightIdx][0]) rightIdx = k;
    if (projected[k][1] > projected[nearestIdx][1]) nearestIdx = k;
  }
  return [ring[leftIdx], ring[rightIdx], ring[nearestIdx]];
}

/**
 * Compute complete opaque rounded-hull solid plate geometry `{ silPath, creasePath, topPolygon, dropAnchors, restCenter }`
 * with static rest-pose hit polygon (`restHitPolygon`) so plates never show sharp wireframe corners (Rule 09),
 * always paint opaque fills over rear dashed guides (Rule 06), and keep hit targets stationary (Rule 01).
 */
export function createIsoPlateGeometry(options: IsoPlateGeometryOptions): IsoPlateGeometry {
  const cam = options.camera ?? createCamera();
  const P = options.project ?? projectCamera(cam);
  const front = options.front ?? createFacingPredicate(cam);

  const minX = Math.min(options.x0, options.x1);
  const maxX = Math.max(options.x0, options.x1);
  const minY = Math.min(options.y0, options.y1);
  const maxY = Math.max(options.y0, options.y1);
  const shortSide = Math.max(0.2, Math.min(maxX - minX, maxY - minY));

  const baseZ0 = options.z0 ?? 0;
  const baseZ1 = options.z1 ?? 8;
  const lift = options.lift ?? 0;
  const z0 = baseZ0 + lift;
  const z1 = baseZ1 + lift;

  const radius = clamp(options.radius ?? 4, 0, shortSide / 2);
  const taper = clamp(options.taper ?? 0, 0, Math.max(0, shortSide / 2 - 0.5));
  const topShortSide = Math.max(0.2, shortSide - taper * 2);
  const steps = Math.max(1, Math.round(options.steps ?? 4));

  const footRing = rrect(minX, minY, maxX, maxY, radius, steps);
  const topRing =
    taper > 0
      ? rrect(
          minX + taper,
          minY + taper,
          maxX - taper,
          maxY - taper,
          Math.max(0.3, radius - taper),
          steps,
        )
      : footRing;

  const requestedInset = options.creaseInset ?? 1.4;
  const maxInset = Math.max(0, topShortSide / 2 - 0.25);
  const safeInset = requestedInset <= 0 ? 0 : clamp(requestedInset, 0, maxInset);
  const innerRing =
    safeInset > 0
      ? rrect(
          minX + taper + safeInset,
          minY + taper + safeInset,
          maxX - taper - safeInset,
          maxY - taper - safeInset,
          Math.max(0.3, radius - taper - safeInset),
          steps,
        )
      : null;

  const topPolygon = ringAt(P, topRing, z1);
  const botPolygon = ringAt(P, footRing, z0);
  const silPolygon = hull(botPolygon.concat(topPolygon));
  const silPath = poly(silPolygon);
  const creasePath = innerRing ? open(ringAt(P, run(innerRing, front), z1)) : '';

  const isAtRest = Math.abs(lift) < 1e-6;
  const restTopPolygon = isAtRest ? topPolygon : ringAt(P, topRing, baseZ1);
  const restHitPolygon = isAtRest
    ? silPolygon
    : hull(ringAt(P, footRing, baseZ0).concat(restTopPolygon));

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const restCenter = P(cx, cy, baseZ1);
  const topCenter = isAtRest ? restCenter : P(cx, cy, z1);

  const [extLeft, extRight, extNearest] = extremes(P, footRing, baseZ0);
  const left = P(extLeft.u, extLeft.v, z0);
  const right = P(extRight.u, extRight.v, z0);
  const nearest = P(extNearest.u, extNearest.v, z0);
  const leftBase = P(extLeft.u, extLeft.v, baseZ0);
  const rightBase = P(extRight.u, extRight.v, baseZ0);
  const nearestBase = P(extNearest.u, extNearest.v, baseZ0);

  const dropPath =
    Math.abs(lift) > 0.05
      ? seg(left, leftBase) + seg(right, rightBase) + seg(nearest, nearestBase)
      : '';

  return {
    silPath,
    creasePath,
    topPolygon,
    restHitPolygon,
    restTopPolygon,
    dropAnchors: {
      left,
      right,
      nearest,
      leftBase,
      rightBase,
      nearestBase,
      dropPath,
    },
    restCenter,
    topCenter,
    depthKey: cx + cy,
  };
}

/**
 * Build an SVG path string for an isometric conduit polyline with optional quadratic corner rounding.
 */
export function buildIsoConduitPath(
  points: ReadonlyArray<ReadonlyPoint2>,
  cornerRadius = 0,
): string {
  if (points.length < 2) return '';
  if (cornerRadius <= 0 || points.length === 2) {
    return open(points);
  }

  const parts: string[] = [`M${r2(points[0][0])} ${r2(points[0][1])}`];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    const la = Math.hypot(prev[0] - curr[0], prev[1] - curr[1]);
    const lb = Math.hypot(next[0] - curr[0], next[1] - curr[1]);
    if (la < 1e-6 || lb < 1e-6) {
      parts.push(`L${r2(curr[0])} ${r2(curr[1])}`);
      continue;
    }
    const t = Math.min(cornerRadius, la / 2, lb / 2);
    const e1: Point2 = [
      curr[0] + ((prev[0] - curr[0]) / la) * t,
      curr[1] + ((prev[1] - curr[1]) / la) * t,
    ];
    const e2: Point2 = [
      curr[0] + ((next[0] - curr[0]) / lb) * t,
      curr[1] + ((next[1] - curr[1]) / lb) * t,
    ];
    parts.push(`L${r2(e1[0])} ${r2(e1[1])}`);
    parts.push(`Q${r2(curr[0])} ${r2(curr[1])} ${r2(e2[0])} ${r2(e2[1])}`);
  }
  const last = points[points.length - 1];
  parts.push(`L${r2(last[0])} ${r2(last[1])}`);
  return parts.join('');
}

/**
 * Rule 02: Distance-staggered delay (`|index - activeIndex| * stepMs`).
 * Motion radiates outwards from the chosen element instead of marching sequentially down a list.
 * Caps extreme queues with `maxDelayMs` (default 360ms).
 */
export function staggerDelayMs(
  index: number,
  activeIndex: number,
  stepMs = 45,
  maxDelayMs = 360,
): number {
  if (index < 0 || activeIndex < 0) return 0;
  const raw = Math.abs(index - activeIndex) * Math.max(0, stepMs);
  return maxDelayMs > 0 && Number.isFinite(maxDelayMs) ? Math.min(raw, maxDelayMs) : raw;
}

/** Rule 03: Clamp any lift, gap, or lean within composed frame bounds. */
export function clampReach(value: number, min: number, max: number): number {
  return clamp(value, min, max);
}

/** Rule 03: Compute bounded lift (`base + delta`) clamped inside `[minLift, maxLift]`. */
export function clampedLift(
  base: number,
  delta: number,
  minLift: number,
  maxLift: number,
): number {
  return clamp(base + delta, minLift, maxLift);
}

/**
 * Rule 03: Hairline's piecewise radial falloff (`1 -> 0.3125 at 41.7% of radius -> floor at radius`).
 * Prevents pointer displacement from overflowing or fragmenting the figure at high intensity.
 */
export function radialFalloff(
  distance: number,
  radius: number,
  floor = 0.094,
): number {
  const safeFloor = clamp(floor, 0, 1);
  if (radius <= 0) return distance <= 0 ? 1 : safeFloor;
  const u = Math.max(0, distance / radius);
  if (u <= 0) return 1;
  if (u <= 0.417) {
    return clamp(1 - (u / 0.417) * (1 - 0.3125), safeFloor, 1);
  }
  if (u <= 1) {
    return clamp(0.3125 - ((u - 0.417) / 0.583) * (0.3125 - safeFloor), safeFloor, 1);
  }
  return safeFloor;
}

/** Rule 03: Smooth Gaussian falloff clamped to `[floor, 1]`. */
export function gaussianFalloff(
  distance: number,
  sigma: number,
  floor = 0,
): number {
  const safeFloor = clamp(floor, 0, 1);
  if (sigma <= 0) return distance <= 0 ? 1 : safeFloor;
  const raw = Math.exp(-(distance * distance) / (2 * sigma * sigma));
  return clamp(raw, safeFloor, 1);
}

/** Rule 03: Clamp a 2D viewBox coordinate inside safe frame margins. */
export function clampPointToFrame(
  point: ReadonlyPoint2,
  width = 400,
  height = 320,
  padding = 12,
): Point2 {
  const padX = Math.min(Math.max(0, padding), width / 2);
  const padY = Math.min(Math.max(0, padding), height / 2);
  return [
    clamp(point[0], padX, width - padX),
    clamp(point[1], padY, height - padY),
  ];
}

/** Rule 08: Evaluate Hairline's lift cubic-bezier curve `cubic-bezier(0.32, 0.72, 0, 1)` at `t in [0, 1]`. */
export function easeLift(t: number): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  const x1 = 0.32;
  const y1 = 0.72;
  const x2 = 0;
  const y2 = 1;

  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (u: number): number => ((ax * u + bx) * u + cx) * u;
  const sampleY = (u: number): number => ((ay * u + by) * u + cy) * u;
  const derivX = (u: number): number => (3 * ax * u + 2 * bx) * u + cx;

  let u = t;
  for (let i = 0; i < 8; i++) {
    const err = sampleX(u) - t;
    if (Math.abs(err) < 1e-5) break;
    const d = derivX(u);
    if (Math.abs(d) < 1e-6) break;
    u -= err / d;
  }

  if (!(u >= 0 && u <= 1) || Math.abs(sampleX(u) - t) > 1e-4) {
    let lo = 0;
    let hi = 1;
    u = t;
    for (let i = 0; i < 24; i++) {
      if (sampleX(u) < t) lo = u;
      else hi = u;
      u = (lo + hi) / 2;
    }
  }

  return sampleY(u);
}
