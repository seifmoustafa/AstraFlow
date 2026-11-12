/**
 * astraflow-route: a precision rail carrying four pipeline stations.
 * Selecting a station lifts it and advances the signal shuttle.
 */
const {
  Cam, clamp, facing, fit, flatDot, mk, place, pointer,
  prism, proj, put, register, disposer, rings, solid, tdone, tset, tval, tween, unproj,
} = HL;

const N = 4, W = 36, D = 28, GAP = 12, PITCH = W + GAP;
const TOTAL_W = N * PITCH - GAP;
const PB = 6, BASE_EXT = 10;
const LIFT = 14;
const NAMES = ["request", "behavior", "handler", "result"];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  const C = Cam(45, 0.5, 1.6);
  fit(C, [
    [-BASE_EXT, -BASE_EXT, -PB],
    [TOTAL_W + BASE_EXT, D + BASE_EXT, -PB],
    [TOTAL_W + BASE_EXT, -BASE_EXT, -PB],
    [-BASE_EXT, D + BASE_EXT, -PB],
    [0, 0, LIFT + 14],
    [TOTAL_W, D, LIFT + 14],
  ], 200, 166);
  const P = proj(C), front = facing(C);
  let stepDelay = value, active = -1;

  const g = mk("g", {}, svg);
  const [pr, pi] = rings(-BASE_EXT, -BASE_EXT, TOTAL_W + BASE_EXT, D + BASE_EXT, 7, 2);
  put(solid(g), prism(P, front, pr, pi, -PB, 0));

  const railY = D / 2;
  const rail = mk("path", { class: "nf dash" }, g);
  rail.setAttribute("d", "M " + P(-4, railY, 0).join(" ") + " L " + P(TOTAL_W + 4, railY, 0).join(" "));

  const stations = [];
  for (let i = 0; i < N; i++) {
    const x0 = i * PITCH, x1 = x0 + W;
    const [ring, inner] = rings(x0, 0, x1, D, 4, 1.4);
    const s = solid(g);
    const dots = [];
    for (let k = 0; k <= i; k++) dots.push(flatDot(g, C, 0.9, "dot off"));
    stations.push({
      i, x0, x1, ring, inner, el: s, dots,
      z: tween(i === 0 ? 3 : 0, 500),
      drawnZ: NaN,
    });
  }

  const shuttle = solid(g);
  const shuttleDot = flatDot(g, C, 1.4, "dot");
  const shuttleX = tween(stations[0].x0 + W / 2, 600);
  let drawnSX = NaN;

  function drawStation(st, now) {
    const z = tval(st.z, now);
    if (z === st.drawnZ) return;
    st.drawnZ = z;
    put(st.el, prism(P, front, st.ring, st.inner, 0, 6 + z));
    const cx = st.x0 + W / 2;
    st.dots.forEach((d, k) => {
      place(d, P(cx + (k - st.i / 2) * 4.5, railY, 6 + z));
    });
  }

  function drawShuttle(now) {
    const sx = tval(shuttleX, now);
    if (sx === drawnSX) return;
    drawnSX = sx;
    const [sr, si] = rings(sx - 7, railY - 7, sx + 7, railY + 7, 3, 1);
    put(shuttle, prism(P, front, sr, si, 6, 12));
    shuttle.sil.setAttribute("class", "sil hi");
    place(shuttleDot, P(sx, railY, 12));
  }

  const loop = register(stage, (_dt, now) => {
    let moving = !tdone(shuttleX, now);
    drawShuttle(now);
    for (const st of stations) {
      if (!tdone(st.z, now)) moving = true;
      drawStation(st, now);
    }
    return moving;
  });
  bag.add(loop.unregister);

  function choose(f) {
    if (f === active) return;
    const now = performance.now();
    const from = active >= 0 ? active : 0;
    active = f;
    const targetIdx = f >= 0 ? f : 0;
    const targetX = stations[targetIdx].x0 + W / 2;
    tset(shuttleX, targetX, now, 0);

    stations.forEach((st, i) => {
      const delay = Math.abs(i - from) * stepDelay;
      const targetZ = f === i ? LIFT : f < 0 && i === 0 ? 3 : 0;
      tset(st.z, targetZ, now, delay);
      st.el.sil.setAttribute("class", i === f ? "sil hi" : "sil");
      st.dots.forEach((d) => d.setAttribute("class", i === f ? "dot m" : "dot off"));
    });

    read.textContent = f < 0 ? "rest" : NAMES[f];
    loop.wake();
  }

  function pick([sx, sy]) {
    const [wx, wy] = unproj(C, sx, sy, 0);
    if (wy < -BASE_EXT || wy > D + BASE_EXT || wx < -BASE_EXT || wx > TOTAL_W + BASE_EXT) return -1;
    for (let i = 0; i < N; i++) {
      if (wx >= stations[i].x0 - GAP / 2 && wx <= stations[i].x1 + GAP / 2) return i;
    }
    return -1;
  }

  bag.add(pointer(stage, {
    move: (p) => choose(pick(p)),
    leave: () => choose(-1),
  }));

  choose(-1);
  drawShuttle(0);
  stations.forEach((st) => drawStation(st, 0));

  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stepDelay = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "astraflow-route",
  means: "A structural rail carrying four pipeline stages: request, behavior, handler and result, illuminated as the signal advances.",
  rules: [1, 2, 4, 8, 10],
  range: [20, 45, 75],
  tour: [[120, 160], [170, 150], [230, 165], [290, 180], null],
  mount,
});
