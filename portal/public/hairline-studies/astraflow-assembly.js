/**
 * astraflow-assembly: three interlocking architectural plates.
 * Contracts, composition and inspection dock as selection shifts.
 */
const {
  Cam, facing, fit, flatDot, mk, place, pointer,
  prism, proj, put, register, disposer, rings, solid, tdone, tset, tval, tween, unproj,
} = HL;

const N = 3, FW = 72, FD = 54, TK = 4;
const PITCH_Z = 16;
const NAMES = ["declarations", "composition", "inspection"];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value, active = -1;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [
    [-12, -12, 0], [FW + 36, FD + 36, 0],
    [-12, -12, N * PITCH_Z + 50], [FW + 36, FD + 36, N * PITCH_Z + 50],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const [br, bi] = rings(-10, -10, FW + 34, FD + 34, 8, 2);
  put(solid(g), prism(P, front, br, bi, -6, 0));

  const spine = mk("path", { class: "nf dash" }, g);
  spine.setAttribute("d", "M " + P(FW / 2 + 12, FD / 2 + 12, 0).join(" ") + " L " + P(FW / 2 + 12, FD / 2 + 12, N * PITCH_Z + 45).join(" "));

  const plates = [];
  for (let i = 0; i < N; i++) {
    const ox = i * 12, oy = i * 12;
    const [ring, inner] = rings(ox, oy, ox + FW, oy + FD, 5, 1.4);
    const s = solid(g);
    const dots = [];
    for (let k = 0; k <= i; k++) dots.push(flatDot(g, C, 1.1, "dot off"));
    const restZ = i * PITCH_Z + (i === 1 ? 4 : 0);
    plates.push({
      i, ox, oy, ring, inner, el: s, dots,
      restZ,
      z: tween(restZ, 600),
      drawnZ: NaN,
    });
  }

  function drawPlate(p, now) {
    const z = tval(p.z, now);
    if (z === p.drawnZ) return;
    p.drawnZ = z;
    put(p.el, prism(P, front, p.ring, p.inner, z, z + TK));
    const cx = p.ox + FW / 2, cy = p.oy + FD / 2;
    p.dots.forEach((d, k) => {
      place(d, P(cx + (k - p.i / 2) * 5, cy, z + TK));
    });
  }

  const loop = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of plates) {
      if (!tdone(p.z, now)) moving = true;
      drawPlate(p, now);
    }
    return moving;
  });
  bag.add(loop.unregister);

  function choose(f) {
    if (f === active) return;
    const now = performance.now();
    const from = active >= 0 ? active : 1;
    active = f;

    plates.forEach((p, i) => {
      const delay = Math.abs(i - from) * 40;
      let targetZ = p.restZ;
      if (f >= 0) {
        if (i === f) targetZ = p.restZ + gap;
        else if (i > f) targetZ = p.restZ + gap * 0.4;
      }
      tset(p.z, targetZ, now, delay);
      p.el.sil.setAttribute("class", i === f ? "sil hi" : "sil");
      p.dots.forEach((d) => d.setAttribute("class", i === f ? "dot m" : "dot off"));
    });

    read.textContent = f < 0 ? "rest" : NAMES[f];
    loop.wake();
  }

  function pick([sx, sy]) {
    for (let i = N - 1; i >= 0; i--) {
      const p = plates[i];
      const [wx, wy] = unproj(C, sx, sy, p.restZ + TK);
      if (wx >= p.ox && wx <= p.ox + FW && wy >= p.oy && wy <= p.oy + FD) return i;
    }
    return -1;
  }

  bag.add(pointer(stage, {
    move: (p) => choose(pick(p)),
    leave: () => choose(-1),
  }));

  choose(-1);
  plates.forEach((p) => drawPlate(p, 0));

  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "astraflow-assembly",
  means: "Three interlocking architectural plates: contracts, composition and inspection dock on an aligned axis as selection shifts.",
  rules: [1, 3, 5, 8, 9],
  range: [12, 26, 42],
  tour: [[160, 220], [200, 170], [240, 120], null],
  mount,
});
