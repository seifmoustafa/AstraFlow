/* AstraFlow / Craft v12. Enhances existing verified application state; never owns it. */
(() => {
  'use strict';
  const path = document.querySelector('#flow-path');
  const pulse = document.querySelector('.v12-stage-travel');
  const code = document.querySelector('#flow-code');
  const counter = document.querySelector('#v12-decision-count');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Observe authoritative state written by vision.js. No duplicate flow state machine.
  if (path && pulse) {
    let previous = -1;
    let frame = 0;
    const update = () => {
      const active = path.querySelector('.flow-node[data-active="true"]');
      const nodes = [...path.querySelectorAll('.flow-node')];
      if (!active || !nodes.length) return;
      const index = nodes.indexOf(active);
      const rail = path.getBoundingClientRect();
      const rect = active.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - rail.left - 3.5;
      pulse.style.setProperty('--v12-stage-x', `${Math.max(0,x)}px`);
      if (counter) counter.textContent = String(index + 1).padStart(2,'0');
      if (previous >= 0 && previous !== index && !reduced.matches && code) {
        code.classList.add('v12-swap');
        clearTimeout(code._v12fade);
        code._v12fade = setTimeout(() => code.classList.remove('v12-swap'), 155);
      }
      previous = index;
    };
    const queueUpdate = () => {cancelAnimationFrame(frame);frame=requestAnimationFrame(update)};
    new MutationObserver(queueUpdate).observe(path, {subtree:true,attributes:true,attributeFilter:['data-active']});
    addEventListener('resize',queueUpdate,{passive:true});
    reduced.addEventListener?.('change',queueUpdate);
    queueUpdate();
  }
  // Status only on user-selected flow; no auto-play that changes code without permission.
  const hub = document.querySelector('.v10-flow-instrument');
  if(hub) {
    hub.addEventListener('keydown', (event) => {
      // Native buttons already handle Enter/Space; don't intercept Tab or scroll keys.
      if(event.key === 'Home' && event.target.closest('.flow-path')) {
        const first = hub.querySelector('.flow-node[data-stage="0"]');
        first?.click();first?.focus(); event.preventDefault();
      }
      if(event.key === 'End' && event.target.closest('.flow-path')) {
        const last = hub.querySelector('.flow-node[data-stage="3"]');
        last?.click();last?.focus();event.preventDefault();
      }
    });
  }
})();
