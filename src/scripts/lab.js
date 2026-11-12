// "The Curiosity Lab": six structures in a ring, one per discipline, every pair linked.
// Each has its own shape and its own idle movement. Hovering one lights it and its links;
// opening one brings it to the centre while the others stand back.
// Two window events keep this in step with the HTML list and panels:
//   'discipline' (detail.index) = which one is hovered,  'lab' (detail.index) = which one is open (-1 = none).
import * as THREE from 'three';

export function createLab({ camera, lineMat, wireOf, edgesOf, lineOf, EMERALD, ELECTRIC, PALE, reduceMotion }) {
  const el = document.querySelector('[data-3d="lab"]');
  const label = document.querySelector('[data-lab-label]');
  const group = new THREE.Group();
  group.visible = false;
  if (!el) return { group, el: null, update() {} };
  const names = JSON.parse(el.dataset.names);

  // Each maker returns the object and a `tick` that plays its idle movement.
  const makers = [
    // Web Development: structure inside structure, turning against each other
    (m) => {
      const outer = edgesOf(new THREE.BoxGeometry(1.3, 1.3, 1.3), m), inner = edgesOf(new THREE.BoxGeometry(0.6, 0.6, 0.6), m);
      return { obj: new THREE.Group().add(outer, inner), tick: (t, dt) => {
        outer.rotation.y += dt * 0.35; inner.rotation.y -= dt * 0.8; inner.rotation.x += dt * 0.5;
        inner.scale.setScalar(1 + Math.sin(t * 2) * 0.15);
      } };
    },
    // Web Design: a curve that tumbles and flexes
    (m) => {
      const ring = wireOf(new THREE.TorusGeometry(0.62, 0.26, 6, 14), m);
      return { obj: ring, tick: (t, dt) => {
        ring.rotation.x += dt * 0.45; ring.rotation.y += dt * 0.28;
        ring.scale.set(1 + Math.sin(t * 1.3) * 0.1, 1 - Math.sin(t * 1.3) * 0.1, 1);
      } };
    },
    // Data Analytics: bars that keep changing height
    (m) => {
      const o = new THREE.Group(), heights = [0.5, 0.95, 0.7, 1.35];
      const bars = heights.map((h, k) => {
        const bar = edgesOf(new THREE.BoxGeometry(0.24, h, 0.24), m);
        bar.position.set(-0.54 + k * 0.36, h / 2 - 0.68, 0);
        o.add(bar);
        return bar;
      });
      return { obj: o, tick: (t, dt) => {
        o.rotation.y += dt * 0.3;
        bars.forEach((bar, k) => {
          const s = 0.8 + 0.3 * Math.sin(t * 1.5 + k * 1.4);
          bar.scale.y = s;
          bar.position.y = (heights[k] * s) / 2 - 0.68; // grow from the base
        });
      } };
    },
    // Statistical Modelling: a distribution that widens and narrows
    (m) => {
      const pts = [];
      for (let k = 0; k <= 40; k++) { const x = -1 + k / 20; pts.push(new THREE.Vector3(x, Math.exp(-x * x * 5) * 1.3 - 0.6, 0)); }
      const base = [new THREE.Vector3(-1, -0.6, 0), new THREE.Vector3(1, -0.6, 0)];
      const a = new THREE.Group().add(lineOf(pts, m), lineOf(base, m));
      const b = a.clone();
      b.rotation.y = Math.PI / 2;
      const o = new THREE.Group().add(a, b);
      return { obj: o, tick: (t, dt) => {
        o.rotation.y += dt * 0.3;
        const w = 1 + Math.sin(t * 1.1) * 0.22;
        a.scale.set(w, 1 / w, 1); b.scale.set(w, 1 / w, 1); // wider means flatter
      } };
    },
    // Data Engineering: a pipeline with something moving through it
    (m) => {
      const o = new THREE.Group();
      const stages = [-0.75, 0, 0.75].map((x) => {
        const stage = edgesOf(new THREE.CylinderGeometry(0.26, 0.26, 0.4, 10), m);
        stage.rotation.z = Math.PI / 2;
        stage.position.x = x;
        o.add(stage);
        return stage;
      });
      const packet = new THREE.Mesh(new THREE.OctahedronGeometry(0.1, 0), new THREE.MeshBasicMaterial({ color: PALE }));
      o.add(lineOf([new THREE.Vector3(-1.15, 0, 0), new THREE.Vector3(1.15, 0, 0)], m), packet);
      return { obj: o, tick: (t, dt) => {
        o.rotation.y = Math.sin(t * 0.5) * 0.5;
        stages.forEach((stage, k) => { stage.rotation.x += dt * (0.8 + k * 0.5); });
        packet.position.x = ((t * 0.7) % 1) * 2.3 - 1.15;
      } };
    },
    // Artificial Intelligence: a network of nodes that pulses
    (m) => {
      const geo = new THREE.IcosahedronGeometry(0.75, 1);
      const net = wireOf(geo, m), dots = new THREE.Points(geo, new THREE.PointsMaterial({ color: PALE, size: 0.045, transparent: true }));
      const o = new THREE.Group().add(net, dots);
      return { obj: o, tick: (t, dt) => {
        o.rotation.y += dt * 0.3; o.rotation.x += dt * 0.17;
        o.scale.setScalar(1 + Math.sin(t * 2.6) * 0.07);
      } };
    },
  ];

  const R = 0.74, BASE = 0.2;
  const items = makers.map((make, i) => {
    const a = (i / makers.length) * Math.PI * 2 - Math.PI / 2;
    const mat = lineMat(EMERALD, 0.8);
    const home = new THREE.Vector3(Math.cos(a) * R, -Math.sin(a) * R, 0); // clockwise from the top, matching the list
    const holder = new THREE.Group();
    holder.position.copy(home);
    holder.scale.setScalar(BASE);
    const { obj, tick } = make(mat);
    obj.rotation.x = 0.35;
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.userData.index = i;
    holder.add(obj, hit);
    group.add(holder);
    return { holder, home, mat, hit, tick };
  });
  const hits = items.map((it) => it.hit);
  const links = [];
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const mat = lineMat(EMERALD, 0.14);
    const line = lineOf([items[i].home.clone(), items[j].home.clone()], mat);
    line.frustumCulled = false;
    group.add(line);
    links.push({ i, j, mat, pos: line.geometry.attributes.position });
  }

  let hover = -1, open = -1, sceneHover = -1, hasMouse = false, downX = 0, downY = 0;
  const ndc = new THREE.Vector2(9, 9), raycaster = new THREE.Raycaster();
  const cDim = new THREE.Color(EMERALD), cHot = new THREE.Color(ELECTRIC), target = new THREE.Vector3(), v = new THREE.Vector3();
  const CENTRE = new THREE.Vector3(0, 0, 0.15);
  const setNdc = (e) => ndc.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  const pickAt = () => {
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(hits, false)[0]?.object.userData.index ?? -1;
  };

  addEventListener('discipline', (e) => { hover = e.detail.index; });
  addEventListener('lab', (e) => { open = e.detail.index; });
  el.addEventListener('pointermove', (e) => { setNdc(e); hasMouse = e.pointerType === 'mouse'; });
  el.addEventListener('pointerleave', () => { hasMouse = false; ndc.set(9, 9); });
  el.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
  el.addEventListener('pointerup', (e) => {
    if (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 8) return; // a scroll or drag, not a tap
    setNdc(e);
    const idx = pickAt();
    if (idx >= 0 && idx !== open) dispatchEvent(new CustomEvent('lab', { detail: { index: idx, from: 'scene' } }));
  });

  function update(t, dt, pointer) {
    const k = Math.min(1, dt * 5), anyOpen = open >= 0;

    // hover from the mouse over the 3D structures themselves
    const idx = hasMouse ? pickAt() : -1;
    if (idx !== sceneHover) {
      sceneHover = idx;
      el.classList.toggle('over-node', idx >= 0 && idx !== open);
      dispatchEvent(new CustomEvent('discipline', { detail: { index: idx } }));
    }

    items.forEach((it, i) => {
      const isOpen = i === open, hot = i === hover;
      target.copy(isOpen ? CENTRE : it.home);
      if (anyOpen && !isOpen) target.multiplyScalar(1.12); // the others stand back
      it.holder.position.lerp(target, reduceMotion ? 1 : k);
      const s = isOpen ? 0.5 : anyOpen ? (hot ? 0.16 : 0.13) : hot ? 0.27 : BASE;
      it.holder.scale.setScalar(it.holder.scale.x + (s - it.holder.scale.x) * (reduceMotion ? 1 : k));
      const o = isOpen ? 1 : anyOpen ? (hot ? 0.8 : 0.3) : hover < 0 ? 0.8 : hot ? 1 : 0.32;
      it.mat.opacity += (o - it.mat.opacity) * k;
      it.mat.color.lerp(isOpen || hot ? cHot : cDim, k);
      if (!reduceMotion) it.tick(t, dt * (isOpen || hot ? 2 : 1));
    });
    links.forEach((l) => {
      const a = items[l.i].holder.position, b = items[l.j].holder.position;
      l.pos.setXYZ(0, a.x, a.y, a.z); l.pos.setXYZ(1, b.x, b.y, b.z);
      l.pos.needsUpdate = true;
      const touchOpen = l.i === open || l.j === open, touchHover = l.i === hover || l.j === hover;
      const o = anyOpen ? (touchOpen ? 0.45 : 0.03) : hover < 0 ? 0.14 : touchHover ? 0.75 : 0.04;
      l.mat.opacity += (o - l.mat.opacity) * k;
      l.mat.color.lerp(touchOpen || (!anyOpen && touchHover) ? cHot : cDim, k);
    });
    if (!reduceMotion) group.rotation.set(pointer.y * 0.16, pointer.x * 0.22, Math.sin(t * 0.25) * 0.05);

    // title label for the structure under the mouse
    if (label) {
      const show = sceneHover >= 0 && sceneHover !== open ? sceneHover : -1;
      if (show < 0) { if (!label.hidden) label.hidden = true; }
      else {
        group.updateMatrixWorld();
        v.copy(items[show].holder.position).applyMatrix4(group.matrixWorld).project(camera);
        const r = el.getBoundingClientRect();
        const x = ((v.x + 1) / 2) * innerWidth - r.left, y = ((1 - v.y) / 2) * innerHeight - r.top;
        label.textContent = names[show];
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -330%)`;
        if (label.hidden) label.hidden = false;
      }
    }
  }

  return { group, el, update };
}
