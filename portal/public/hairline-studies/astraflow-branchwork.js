/**
 * astraflow-branchwork: a central repository hub with four contribution paths.
 * Selecting a destination illuminates its route and elevates the station pad.
 */
const {
  Cam, facing, fit, flatDot, mk, place, pointer,
  prism, proj, put, register, disposer, rings, solid, tdone, tset, tval, tween, unproj,
} = HL;

const NAMES = ["source", "issues", "reviews", "docs"];
const STATIONS = [
  { i: 0, x: -56, y: -24, dots: 1 },
  { i: 1, x: 56, y: -24, dots: 2 },
  { i: 2, x: -56, y: 36, dots: 3 },
  { i: 3, x: 56, y: 36, dots: 4 },
];
const PW = 28, PD = 22;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stagger = value, active = -1;
  const C = Cam(45, 0.5, 1.65);
  fit(C, [
    [-80, -48, -4], [80, 60, -4],
    [-80, -48, 22], [80, 60, 22],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);

  // Central hub
  const hub = solid(g);
  const [hr, hi] = rings(-14, -14, 14, 14, 4, 1.4);
  put(hub, prism(P, front, hr, hi, 0, 7));
  const hubDot = flatDot(g, C, 1.2, "dot");
  place(hubDot, P(0, 0, 7));

  // Conduit routes from hub to each station
  const routes = STATIONS.map((st) => {
    const p = mk("path", { class: "nf" }, g);
    p.setAttribute("d", "M " + P(0, 0, 3.5).join(" ") + " L " + P(st.x, st.y, 3.5).join(" "));
    return p;
  });

  // Four destination station pads
  const pads = STATIONS.map((st) => {
    const s = solid(g);
    const [pr, pi] = rings(st.x - PW / 2, st.y - PD / 2, st.x + PW / 2, st.y + PD / 2, 4, 1.2);
    const dots = [];
    for (let k = 0; k < st.dots; k++) dots.push(flatDot(g, C, 0.85, "dot off"));
    return {
      ...st,
      ring: pr, inner: pi, el: s, dots,
      z: tween(st.i === 0 ? 3 : 0, 500),
      drawnZ: NaN,
    };
  });

  // Signal carrier bead
  const bead = flatDot(g, C, 1.5, "dot");
  const beadProg = tween(0, 600);
  let beadStation = 0;

  function drawPad(pad, now) {
    const z = tval(pad.z, now);
    if (z === pad.drawnZ) return;
    pad.drawnZ = z;
    put(pad.el, prism(P, front, pad.ring, pad.inner, 0, 4 + z));
    pad.dots.forEach((d, k) => {
      place(d, P(pad.x + (k - (pad.dots - 1) / 2) * 4.5, pad.y, 4 + z));
    });
  }

  function drawBead(now) {
    const prog = tval(beadProg, now);
    const target = STATIONS[beadStation];
    const bx = target.x * prog, by = target.y * prog;
    place(bead, P(bx, by, 3.5 + 4 * Math.sin(prog * Math.PI)));
  }

  const loop = register(stage, (_dt, now) => {
    let moving = !tdone(beadProg, now);
    drawBead(now);
    for (const pad of pads) {
      if (!tdone(pad.z, now)) moving = true;
      drawPad(pad, now);
    }
    return moving;
  });
  bag.add(loop.unregister);

  function choose(f) {
    if (f === active) return;
    const now = performance.now();
    const from = active >= 0 ? active : 0;
    active = f;

    if (f >= 0) {
      beadStation = f;
      tset(beadProg, 1, now, 0);
    } else {
      tset(beadProg, 0, now, 0);
    }

    pads.forEach((pad, i) => {
      const delay = Math.abs(i - from) * stagger;
      const targetZ = f === i ? 9 : f < 0 && i === 0 ? 3 : 0;
      tset(pad.z, targetZ, now, delay);
      pad.el.sil.setAttribute("class", i === f ? "sil hi" : "sil");
      pad.dots.forEach((d) => d.setAttribute("class", i === f ? "dot m" : "dot off"));
      routes[i].setAttribute("class", i === f ? "nf hi" : "nf");
    });

    hub.sil.setAttribute("class", f >= 0 ? "sil hi" : "sil");
    read.textContent = f < 0 ? "rest" : NAMES[f];
    loop.wake();
  }

  function pick([sx, sy]) {
    const [wx, wy] = unproj(C, sx, sy, 0);
    let bestDist = 38, chosen = -1;
    for (const st of STATIONS) {
      const d = Math.hypot(wx - st.x, wy - st.y);
      if (d < bestDist) {
        bestDist = d;
        chosen = st.i;
      }
    }
    return chosen;
  }

  bag.add(pointer(stage, {
    move: (p) => choose(pick(p)),
    leave: () => choose(-1),
  }));

  choose(-1);
  pads.forEach((p) => drawPad(p, 0));
  drawBead(0);

  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stagger = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "astraflow-branchwork",
  means: "A central repository hub extending four open contribution paths to source, issues, reviews and documentation.",
  rules: [1, 2, 4, 8, 10],
  range: [20, 50, 90],
  tour: [[140, 140], [250, 140], [140, 190], [250, 190], null],
  mount,
});
