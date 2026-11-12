// The Interactive Playground: experiments A (chart) and B (regression).
// Both are drawn as plain SVG, with no chart library. Experiment C lives in creative.js.
const NS = 'http://www.w3.org/2000/svg';
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const svgEl = (name, attrs = {}, text) => {
  const n = document.createElementNS(NS, name);
  for (const k in attrs) n.setAttribute(k, attrs[k]);
  if (text !== undefined) n.textContent = text;
  return n;
};
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmt = (v, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : 'n/a');

// ---------------------------------------------------------------- A: Data in Motion
(function dataInMotion() {
  const root = document.querySelector('[data-exp="data"]');
  if (!root) return;
  const svg = root.querySelector('[data-chart]');
  const inputs = [...root.querySelectorAll('[data-value]')];
  const initial = JSON.parse(root.dataset.sample);
  let items = initial.map((d) => ({ ...d }));
  let shown = items.map((d) => d.value); // what is drawn right now; eases toward the real values
  let mode = 'bars', raf = 0;
  const W = 600, H = 340, L = 44, R = 14, T = 26, B = 44, PW = W - L - R, PH = H - T - B;

  function draw() {
    svg.replaceChildren();
    const top = Math.max(10, Math.ceil(Math.max(...items.map((d) => d.value), ...shown) / 20) * 20);
    const y = (v) => T + PH - (v / top) * PH;
    for (let g = 0; g <= 4; g++) {
      const v = (top / 4) * g;
      svg.append(svgEl('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }), svgEl('text', { class: 'tick', x: L - 8, y: y(v) + 4, 'text-anchor': 'end' }, Math.round(v)));
    }
    const step = PW / items.length, bw = Math.min(56, step * 0.6);
    const xs = items.map((_, i) => L + step * (i + 0.5));
    if (mode === 'line') {
      const d = shown.map((v, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
      svg.append(svgEl('path', { class: 'area', d: `${d} L${xs[xs.length - 1]} ${y(0)} L${xs[0]} ${y(0)} Z` }), svgEl('path', { class: 'line', d }));
    }
    items.forEach((it, i) => {
      const v = shown[i];
      if (mode === 'bars') svg.append(svgEl('rect', { class: 'bar', x: xs[i] - bw / 2, y: y(v), width: bw, height: Math.max(0, y(0) - y(v)), rx: 4 }));
      else svg.append(svgEl('circle', { class: 'dot', cx: xs[i], cy: y(v), r: 5 }));
      svg.append(svgEl('text', { class: 'value', x: xs[i], y: y(v) - 9, 'text-anchor': 'middle' }, Math.round(v)), svgEl('text', { class: 'cat', x: xs[i], y: H - B + 22, 'text-anchor': 'middle' }, it.label));
    });
  }

  function tick() {
    let moving = false;
    shown = shown.map((v, i) => {
      const target = items[i].value, next = reduceMotion ? target : v + (target - v) * 0.18;
      if (Math.abs(target - next) > 0.3) { moving = true; return next; }
      return target;
    });
    draw();
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function refresh() {
    const vals = items.map((d) => d.value), total = vals.reduce((a, b) => a + b, 0);
    root.querySelector('[data-out="total"]').textContent = total;
    root.querySelector('[data-out="mean"]').textContent = fmt(total / vals.length, 1);
    const hi = Math.max(...vals);
    root.querySelector('[data-out="max"]').textContent = `${hi} (${items[vals.indexOf(hi)].label})`;
    svg.setAttribute('aria-label', `${mode === 'bars' ? 'Bar' : 'Line'} chart of the demonstration data: ${items.map((d) => `${d.label} ${d.value}`).join(', ')}`);
    inputs.forEach((inp, i) => {
      inp.previousElementSibling.textContent = items[i].label;
      if (document.activeElement !== inp) inp.value = items[i].value;
    });
    if (!raf) raf = requestAnimationFrame(tick);
  }

  inputs.forEach((inp, i) => inp.addEventListener('input', () => {
    const v = Number(inp.value);
    items[i].value = Number.isFinite(v) ? clamp(Math.round(v), 0, 100) : 0;
    refresh();
  }));
  inputs.forEach((inp, i) => inp.addEventListener('blur', () => { inp.value = items[i].value; }));
  root.querySelectorAll('[data-mode]').forEach((btn) => btn.addEventListener('click', () => {
    mode = btn.dataset.mode;
    root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    refresh();
  }));
  root.querySelectorAll('[data-act]').forEach((btn) => btn.addEventListener('click', () => {
    const act = btn.dataset.act;
    if (act === 'sort') {
      // labels travel with their values; the drawn heights ease from the old order to the new one
      const order = items.map((d, i) => i).sort((a, b) => items[b].value - items[a].value);
      items = order.map((i) => items[i]);
    } else if (act === 'shuffle') items.forEach((d) => { d.value = Math.round(8 + Math.random() * 88); });
    else if (act === 'reset') {
      items = initial.map((d) => ({ ...d }));
      mode = 'bars';
      root.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mode === 'bars')));
    }
    refresh();
  }));
  refresh();
})();

// ---------------------------------------------------------------- B: The Logic Machine
(function logicMachine() {
  const root = document.querySelector('[data-exp="logic"]');
  if (!root) return;
  const svg = root.querySelector('[data-plot]');
  const W = 600, H = 380, L = 46, R = 16, T = 18, B = 44, PW = W - L - R, PH = H - T - B, MAX = 10;
  const px = (x) => L + (x / MAX) * PW, py = (y) => T + PH - (y / MAX) * PH;
  const defaults = { slope: 0.6, noise: 1, n: 18, residuals: true };
  const params = { ...defaults };
  let points = [], dragging = -1, focused = -1;

  // A small seeded generator, so the same settings always give the same points.
  function generator(seed) {
    let a = seed >>> 0;
    const uniform = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const normal = () => Math.sqrt(-2 * Math.log(1 - uniform())) * Math.cos(2 * Math.PI * uniform()); // Box-Muller
    return { uniform, normal };
  }
  function generate() {
    const g = generator(20261112);
    points = Array.from({ length: params.n }, () => {
      const x = 0.6 + g.uniform() * 8.8;
      return { x, y: clamp(5 + params.slope * (x - 5) + params.noise * g.normal(), 0.2, 9.8) };
    });
  }

  // Ordinary least squares for y = b0 + b1 x.
  function fit(pts) {
    const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
    let sxx = 0, sxy = 0, syy = 0;
    for (const p of pts) { sxx += (p.x - mx) ** 2; sxy += (p.x - mx) * (p.y - my); syy += (p.y - my) ** 2; }
    if (sxx === 0) return { b0: NaN, b1: NaN, r2: NaN };
    const b1 = sxy / sxx, b0 = my - b1 * mx;
    let sse = 0;
    for (const p of pts) sse += (p.y - (b0 + b1 * p.x)) ** 2;
    return { b0, b1, r2: syy === 0 ? NaN : 1 - sse / syy };
  }

  function draw() {
    const { b0, b1, r2 } = fit(points);
    svg.replaceChildren();
    const defs = svgEl('defs'), clip = svgEl('clipPath', { id: 'plot-clip' });
    clip.append(svgEl('rect', { x: L, y: T, width: PW, height: PH }));
    defs.append(clip);
    svg.append(defs);
    for (let g = 0; g <= 5; g++) {
      const v = g * 2;
      svg.append(svgEl('line', { class: 'grid', x1: L, x2: W - R, y1: py(v), y2: py(v) }), svgEl('text', { class: 'tick', x: L - 8, y: py(v) + 4, 'text-anchor': 'end' }, v),
        svgEl('text', { class: 'tick', x: px(v), y: H - B + 18, 'text-anchor': 'middle' }, v));
    }
    svg.append(svgEl('text', { class: 'axis', x: L + PW / 2, y: H - 6, 'text-anchor': 'middle' }, 'x (input)'), svgEl('text', { class: 'axis', x: 12, y: T + PH / 2, 'text-anchor': 'middle', transform: `rotate(-90 12 ${T + PH / 2})` }, 'y (output)'));
    const ok = Number.isFinite(b1);
    if (ok && params.residuals) points.forEach((p) => svg.append(svgEl('line', { class: 'residual', x1: px(p.x), x2: px(p.x), y1: py(p.y), y2: py(b0 + b1 * p.x), 'clip-path': 'url(#plot-clip)' })));
    if (ok) svg.append(svgEl('line', { class: 'fit', x1: px(0), y1: py(b0), x2: px(MAX), y2: py(b0 + b1 * MAX), 'clip-path': 'url(#plot-clip)' }));
    points.forEach((p, i) => {
      const c = svgEl('circle', { class: 'pt', cx: px(p.x), cy: py(p.y), r: 7, tabindex: 0, role: 'button', 'data-i': i, 'aria-label': `Point ${i + 1}: x ${fmt(p.x, 1)}, y ${fmt(p.y, 1)}. Use the arrow keys to move it.` });
      svg.append(c);
      if (i === focused) c.focus({ preventScroll: true });
    });
    const sign = b0 < 0 ? '−' : '+';
    root.querySelector('[data-out="equation"]').textContent = ok ? `ŷ = ${fmt(b1)}x ${sign} ${fmt(Math.abs(b0))}` : 'not defined (all x are equal)';
    root.querySelector('[data-out="b1"]').textContent = fmt(b1);
    root.querySelector('[data-out="b0"]').textContent = fmt(b0);
    root.querySelector('[data-out="r2"]').textContent = fmt(r2, 3);
    svg.setAttribute('aria-label', ok ? `Scatter plot of ${points.length} points with fitted line y = ${fmt(b1)} x ${sign} ${fmt(Math.abs(b0))}, R squared ${fmt(r2, 3)}` : 'Scatter plot');
  }

  function syncInputs() {
    root.querySelectorAll('[data-param]').forEach((inp) => {
      if (inp.type === 'checkbox') inp.checked = params.residuals; else inp.value = params[inp.dataset.param];
    });
    root.querySelector('[data-for="slope"]').textContent = fmt(params.slope);
    root.querySelector('[data-for="noise"]').textContent = fmt(params.noise, 1);
    root.querySelector('[data-for="n"]').textContent = params.n;
  }
  root.querySelectorAll('[data-param]').forEach((inp) => inp.addEventListener('input', () => {
    const key = inp.dataset.param;
    if (key === 'residuals') params.residuals = inp.checked;
    else { params[key] = Number(inp.value); focused = -1; generate(); }
    syncInputs(); draw();
  }));
  root.querySelector('[data-act="reset"]').addEventListener('click', () => { Object.assign(params, defaults); focused = -1; generate(); syncInputs(); draw(); });

  // Drag a point with mouse or touch
  const toData = (e) => {
    const r = svg.getBoundingClientRect();
    const sx = ((e.clientX - r.left) / r.width) * W, sy = ((e.clientY - r.top) / r.height) * H;
    return { x: clamp(((sx - L) / PW) * MAX, 0, MAX), y: clamp(((T + PH - sy) / PH) * MAX, 0, MAX) };
  };
  svg.addEventListener('pointerdown', (e) => {
    const i = e.target.dataset?.i;
    if (i === undefined) return;
    dragging = Number(i); focused = dragging;
    svg.setPointerCapture(e.pointerId);
    svg.classList.add('dragging');
    e.preventDefault();
  });
  svg.addEventListener('pointermove', (e) => {
    if (dragging < 0) return;
    Object.assign(points[dragging], toData(e));
    draw();
  });
  const drop = () => { dragging = -1; svg.classList.remove('dragging'); };
  svg.addEventListener('pointerup', drop);
  svg.addEventListener('pointercancel', drop);
  // ...or with the keyboard
  svg.addEventListener('keydown', (e) => {
    const i = e.target.dataset?.i;
    const move = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.2], ArrowDown: [0, -0.2] }[e.key];
    if (i === undefined || !move) return;
    e.preventDefault();
    const p = points[Number(i)];
    p.x = clamp(p.x + move[0], 0, MAX); p.y = clamp(p.y + move[1], 0, MAX);
    focused = Number(i);
    draw();
  });
  svg.addEventListener('focusout', (e) => { if (!svg.contains(e.relatedTarget)) focused = -1; });

  generate(); syncInputs(); draw();
})();

// ---------------------------------------------------------------- C: slider read-outs (the 3D part is in creative.js)
(function creativeControls() {
  const root = document.querySelector('[data-exp="creative"]');
  if (!root) return;
  const show = () => root.querySelectorAll('[data-param]').forEach((inp) => {
    const out = root.querySelector(`[data-for="${inp.dataset.param}"]`);
    if (out) out.textContent = inp.dataset.param === 'density' ? inp.value : Number(inp.value).toFixed(1);
  });
  root.addEventListener('input', show);
  root.addEventListener('creative-reset', show);
  show();
})();
