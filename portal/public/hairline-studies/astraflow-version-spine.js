/**
 * astraflow-version-spine: a mechanical archive of chronological release plates.
 * Plates bound along a rigid spine pull forward when inspected.
 */
const {
  Cam, facing, fit, flatDot, mk, place, pointer,
  prism, proj, put, register, disposer, rings, solid, tdone, tset, tval, tween, unproj,
} = HL;

const N = 5, SW = 58, SD = 8, TK = 18;
const G = 12;
const NAMES = ["v2.4", "v2.3", "v2.2", "v2.1", "v2.0"];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let pullDist = value, active = -1;
  const C = Cam(45, 0.5, 1.7);
  fit(C, [
    [-24, -10, 0], [SW + 36, (N - 1) * G + SD + 16, 0],
    [-24, -10, TK + 14], [SW + 36, (N - 1) * G + SD + 16, TK + 14],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);

  // Rigid spine along the left
  const spine = solid(g);
  const spineLen = (N - 1) * G + SD + 10;
  const [sr, si] = rings(-14, -6, -2, spineLen - 4, 3, 1);
  put(spine, prism(P, front, sr, si, 0, TK + 4));

  // 5 release sheets bound along the spine
  const sheets = [];
  for (let i = 0; i < N; i++) {
    const y0 = i * G, y1 = y0 + SD;
    const [ring, inner] = rings(0, y0, SW, y1, 2.5, 0.8);
    const s = solid(g);
    const dot = flatDot(g, C, 1, i === 0 ? "dot" : "dot off");
    sheets.push({
      i, y0, y1, ring, inner, el: s, dot,
      restX: i === 0 ? 6 : 0,
      x: tween(i === 0 ? 6 : 0, 550),
      drawnX: NaN,
    });
  }

  function drawSheet(sh, now) {
    const x = tval(sh.x, now);
    if (x === sh.drawnX) return;
    sh.drawnX = x;
    const [r, inn] = rings(x, sh.y0, x + SW, sh.y1, 2.5, 0.8);
    put(sh.el, prism(P, front, r, inn, 0, TK));
    place(sh.dot, P(x + SW - 7, (sh.y0 + sh.y1) / 2, TK));
  }

  const loop = register(stage, (_dt, now) => {
    let moving = false;
    for (const sh of sheets) {
      if (!tdone(sh.x, now)) moving = true;
      drawSheet(sh, now);
    }
    return moving;
  });
  bag.add(loop.unregister);

  function choose(f) {
    if (f === active) return;
    const now = performance.now();
    const from = active >= 0 ? active : 0;
    active = f;

    sheets.forEach((sh, i) => {
      const delay = Math.abs(i - from) * 35;
      let targetX = sh.restX;
      if (f >= 0) {
        if (i === f) targetX = pullDist;
        else if (Math.abs(i - f) === 1) targetX = pullDist * 0.28;
        else targetX = 0;
      }
      tset(sh.x, targetX, now, delay);
      sh.el.sil.setAttribute("class", i === f ? "sil hi" : "sil");
      sh.dot.setAttribute("class", i === f ? "dot" : "dot off");
    });

    read.textContent = f < 0 ? "rest" : NAMES[f];
    loop.wake();
  }

  function pick([sx, sy]) {
    const [wx, wy] = unproj(C, sx, sy, TK / 2);
    if (wx < -6 || wx > SW + pullDist + 10) return -1;
    for (let i = 0; i < N; i++) {
      if (wy >= sheets[i].y0 - G / 3 && wy <= sheets[i].y1 + G / 3) return i;
    }
    return -1;
  }

  bag.add(pointer(stage, {
    move: (p) => choose(pick(p)),
    leave: () => choose(-1),
  }));

  choose(-1);
  sheets.forEach((sh) => drawSheet(sh, 0));

  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { pullDist = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "astraflow-version-spine",
  means: "A mechanical archive of chronological release plates bound along a rigid spine, pulling forward on focus.",
  rules: [1, 2, 4, 8, 10],
  range: [10, 22, 36],
  tour: [[160, 140], [190, 170], [210, 210], null],
  mount,
});
