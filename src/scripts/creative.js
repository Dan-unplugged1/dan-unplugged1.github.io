// Experiment C, "The Creative Engine": a particle form drawn in the shared 3D scene.
// Every particle sits on a surface whose radius is a sum of sine waves, so the whole form
// breathes and folds. The pointer pushes nearby particles aside. The three sliders in the
// page set how many particles are drawn, how fast the form moves, and how fast it turns.
import * as THREE from 'three';

export function createCreative({ EMERALD, ELECTRIC, PALE, reduceMotion, smallScreen }) {
  const el = document.querySelector('[data-3d="creative"]');
  const root = document.querySelector('[data-exp="creative"]');
  const group = new THREE.Group();
  group.visible = false;
  if (!el || !root) return { group, el: null, update() {} };

  const input = (name) => root.querySelector(`[data-param="${name}"]`);
  const density = input('density'), speed = input('speed'), rotation = input('rotation');
  // lighter scenes on small screens
  if (smallScreen) { density.max = '3000'; density.value = '1400'; density.defaultValue = '1400'; }
  root.dispatchEvent(new CustomEvent('creative-reset')); // refresh the numbers shown beside the sliders
  const MAX = Number(density.max);
  const defaults = { density: density.value, speed: speed.value, rotation: rotation.value };

  // fixed random recipe per particle: where on the surface it sits, and how it differs from its neighbours
  const A = new Float32Array(MAX), PH = new Float32Array(MAX), C = new Float32Array(MAX);
  const pos = new Float32Array(MAX * 3), col = new Float32Array(MAX * 3);
  const c1 = new THREE.Color(EMERALD), c2 = new THREE.Color(ELECTRIC), c3 = new THREE.Color(PALE), c = new THREE.Color();
  for (let i = 0; i < MAX; i++) {
    A[i] = Math.random(); PH[i] = Math.acos(2 * Math.random() - 1); C[i] = Math.random();
    c.copy(c1).lerp(c2, Math.min(1, C[i] * 1.6));
    if (C[i] > 0.82) c.lerp(c3, (C[i] - 0.82) / 0.18);
    c.toArray(col, i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const points = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.03, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.9 }));
  points.frustumCulled = false;
  group.add(points);

  let time = 0, turn = 0, px = 9, py = 9, pointerOn = false;
  const track = (e) => {
    const r = el.getBoundingClientRect(), half = Math.min(r.width, r.height) * 0.5 * 0.9;
    px = (e.clientX - (r.left + r.width / 2)) / half;
    py = -(e.clientY - (r.top + r.height / 2)) / half;
    pointerOn = true;
  };
  el.addEventListener('pointermove', track);
  el.addEventListener('pointerdown', track);
  const off = () => { pointerOn = false; };
  el.addEventListener('pointerleave', off);
  el.addEventListener('pointercancel', off);
  el.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') off(); });

  root.querySelector('[data-act="reset"]').addEventListener('click', () => {
    density.value = defaults.density; speed.value = defaults.speed; rotation.value = defaults.rotation;
    time = 0; turn = 0;
    root.dispatchEvent(new CustomEvent('creative-reset'));
  });

  const TAU = Math.PI * 2, REACH = 0.38;
  function update(t, dt) {
    const n = Math.min(MAX, Number(density.value));
    if (!reduceMotion) { time += dt * Number(speed.value); turn += dt * Number(rotation.value); }
    const cs = Math.cos(turn), sn = Math.sin(turn);
    for (let i = 0; i < n; i++) {
      const th = A[i] * TAU + time * (0.12 + C[i] * 0.4), ph = PH[i];
      const r = 0.6 + 0.2 * Math.sin(3 * th + time * 0.7) * Math.sin(2 * ph + time * 0.4) + 0.08 * Math.sin(5 * ph - time + C[i] * 6);
      const sx = r * Math.sin(ph) * Math.cos(th), sz = r * Math.sin(ph) * Math.sin(th);
      let x = sx * cs + sz * sn, y = r * Math.cos(ph);
      const z = -sx * sn + sz * cs;
      if (pointerOn) {
        const dx = x - px, dy = y - py, d = Math.hypot(dx, dy);
        if (d < REACH) { const f = ((REACH - d) / REACH) * 0.3 / (d || 0.001); x += dx * f; y += dy * f; }
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    }
    geo.setDrawRange(0, n);
    geo.attributes.position.needsUpdate = true;
  }

  return { group, el, update };
}
