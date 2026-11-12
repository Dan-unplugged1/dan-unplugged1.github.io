// "Inside My Mind": a central knot with five linked nodes around it.
// Drag to rotate, hover a node for its title, click one to select it. Selection is shared with the
// HTML list and panels through a window event ('mind', detail.index), so both stay in step.
import * as THREE from 'three';

export function createMind({ camera, lineMat, wireOf, edgesOf, lineOf, EMERALD, ELECTRIC, PALE, reduceMotion, smallScreen }) {
  const el = document.querySelector('[data-3d="mind"]');
  const label = document.querySelector('[data-mind-label]');
  const group = new THREE.Group();
  group.visible = false;
  if (!el) return { group, el: null, update() {} };

  const names = JSON.parse(el.dataset.names);
  const edges = JSON.parse(el.dataset.edges);
  const N = names.length;

  // ---- centre: a knot that never quite resolves, around a bright core ----
  const knot = wireOf(new THREE.TorusKnotGeometry(0.2, 0.062, 72, 6, 2, 3), lineMat(EMERALD, 0.85));
  const heart = new THREE.Mesh(new THREE.IcosahedronGeometry(0.05, 1), new THREE.MeshBasicMaterial({ color: EMERALD }));
  group.add(knot, heart);

  // ---- nodes ----
  const R = 0.74;
  const nodes = names.map((name, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const pos = new THREE.Vector3(Math.cos(a) * R, -Math.sin(a) * R * 0.92, (i % 2 ? -0.28 : 0.24));
    const mat = new THREE.MeshPhysicalMaterial({ color: EMERALD, emissive: EMERALD, emissiveIntensity: 0.5, metalness: 0.4, roughness: 0.25, flatShading: true });
    const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.075, 0), mat);
    const shellMat = lineMat(ELECTRIC, 0.6);
    const shell = edgesOf(new THREE.OctahedronGeometry(0.125, 0), shellMat);
    const hit = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
    hit.userData.index = i;
    const holder = new THREE.Group();
    holder.position.copy(pos);
    holder.add(body, shell, hit);
    const spokeMat = lineMat(EMERALD, 0.16);
    group.add(holder, lineOf([new THREE.Vector3(), pos.clone()], spokeMat));
    return { name, pos, holder, body, shell, mat, shellMat, hit, spokeMat };
  });
  const hits = nodes.map((n) => n.hit);
  const links = edges.map(([a, b]) => {
    const mat = lineMat(EMERALD, 0.35);
    group.add(lineOf([nodes[a].pos.clone(), nodes[b].pos.clone()], mat));
    return { a, b, mat };
  });
  const isLinked = (i, j) => edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i));

  // ---- signals travelling along the connections ----
  const PULSES = links.length * 2;
  const pulsePos = new Float32Array(PULSES * 3);
  const pulseGeo = new THREE.BufferGeometry();
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
  const pulses = new THREE.Points(pulseGeo, new THREE.PointsMaterial({ color: PALE, size: 0.05, sizeAttenuation: true, transparent: true, opacity: 0.9 }));
  pulses.frustumCulled = false;
  group.add(pulses);

  // ---- a loose shell of particles ----
  const DUST = smallScreen ? 70 : 150;
  const dustPos = new Float32Array(DUST * 3);
  for (let i = 0; i < DUST; i++) {
    const r = 0.5 + Math.random() * 0.6, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    dustPos.set([r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph)], i * 3);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ color: EMERALD, size: 0.03, sizeAttenuation: true, transparent: true, opacity: 0.5 }));
  group.add(dust);

  // ---- state ----
  let selected = -1, hover = -1, follow = false, zoom = 1;
  let dragging = false, moved = 0, lastX = 0, lastY = 0, velX = 0, velY = 0, hasMouse = false;
  const ndc = new THREE.Vector2(9, 9), raycaster = new THREE.Raycaster();
  const qTarget = new THREE.Quaternion(), qTmp = new THREE.Quaternion();
  const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), FRONT = new THREE.Vector3(0.12, 0.08, 1).normalize();
  const cDim = new THREE.Color(EMERALD), cHot = new THREE.Color(ELECTRIC), v = new THREE.Vector3();
  group.quaternion.setFromEuler(new THREE.Euler(0.25, -0.35, 0));

  const turn = (ax, ay) => {
    group.quaternion.premultiply(qTmp.setFromAxisAngle(AY, ay)).premultiply(qTmp.setFromAxisAngle(AX, ax));
  };
  const setNdc = (e) => ndc.set((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1));
  const pickAt = () => {
    raycaster.setFromCamera(ndc, camera);
    return raycaster.intersectObjects(hits, false)[0]?.object.userData.index ?? -1;
  };
  const select = (index) => dispatchEvent(new CustomEvent('mind', { detail: { index, from: 'scene' } }));

  addEventListener('mind', (e) => {
    selected = e.detail.index;
    follow = selected >= 0;
    if (follow) qTarget.setFromUnitVectors(v.copy(nodes[selected].pos).normalize(), FRONT);
  });

  el.addEventListener('pointerdown', (e) => {
    dragging = true; moved = 0; lastX = e.clientX; lastY = e.clientY; velX = velY = 0;
    setNdc(e);
    el.setPointerCapture?.(e.pointerId);
    el.classList.add('dragging');
  });
  el.addEventListener('pointermove', (e) => {
    setNdc(e);
    hasMouse = e.pointerType === 'mouse';
    if (!dragging) return;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    lastX = e.clientX; lastY = e.clientY;
    moved += Math.abs(dx) + Math.abs(dy);
    if (moved > 6) follow = false; // the visitor has taken over the view
    velY = dx * 0.008; velX = dy * 0.008;
    turn(velX, velY);
  });
  const release = (e) => {
    if (!dragging) return;
    dragging = false;
    el.classList.remove('dragging');
    if (e.type === 'pointerup' && moved <= 6) {
      setNdc(e);
      const idx = pickAt();
      if (idx >= 0) select(idx);
    }
  };
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
  el.addEventListener('pointerleave', () => { hasMouse = false; ndc.set(9, 9); });

  function update(t, dt) {
    const k = Math.min(1, dt * 6);

    // rotation: follow the selected node, or coast after a drag, or turn slowly on its own
    if (!dragging) {
      if (follow) group.quaternion.slerp(qTarget, reduceMotion ? 1 : Math.min(1, dt * 3));
      else {
        velX *= Math.exp(-dt * 3); velY *= Math.exp(-dt * 3);
        turn(velX, velY + (reduceMotion || selected >= 0 ? 0 : dt * 0.14));
      }
    }

    // hover (mouse only): title label and pointer cursor
    if (hasMouse && !dragging) {
      const idx = pickAt();
      if (idx !== hover) { hover = idx; el.classList.toggle('over-node', idx >= 0); }
    } else if (!hasMouse && hover !== -1) { hover = -1; el.classList.remove('over-node'); }

    // looks
    nodes.forEach((n, i) => {
      const on = i === selected, near = selected >= 0 && isLinked(i, selected), hot = on || i === hover, other = selected >= 0 && !on && !near;
      const s = n.holder.scale.x + ((on ? 1.5 : near ? 1.2 : hot ? 1.25 : 1) - n.holder.scale.x) * k;
      n.holder.scale.setScalar(s);
      n.mat.emissiveIntensity += ((on ? 1.0 : near ? 0.75 : other ? 0.1 : hot ? 0.9 : 0.5) - n.mat.emissiveIntensity) * k;
      n.mat.color.lerp(on || hot ? cHot : cDim, k);
      n.mat.emissive.lerp(on || hot ? cHot : cDim, k);
      n.shellMat.opacity += ((on ? 1 : near ? 0.85 : other ? 0.12 : 0.6) - n.shellMat.opacity) * k;
      n.spokeMat.opacity += ((on ? 0.6 : other ? 0.05 : 0.16) - n.spokeMat.opacity) * k;
      if (!reduceMotion) { n.body.rotation.y += dt * (on ? 1.6 : 0.5); n.shell.rotation.y -= dt * 0.3; n.shell.rotation.x += dt * 0.2; }
    });
    const live = [];
    links.forEach((l, i) => {
      const touch = l.a === selected || l.b === selected;
      if (selected < 0 || touch) live.push(i);
      l.mat.opacity += ((selected < 0 ? 0.35 : touch ? 0.95 : 0.05) - l.mat.opacity) * k;
      l.mat.color.lerp(touch ? cHot : cDim, k);
    });
    for (let p = 0; p < PULSES; p++) {
      const l = links[live[p % live.length]];
      let f = ((reduceMotion ? 0 : t * 0.3) + p * 0.37) % 1;
      if (p % 2) f = 1 - f;
      v.copy(nodes[l.a].pos).lerp(nodes[l.b].pos, f).toArray(pulsePos, p * 3);
    }
    pulseGeo.attributes.position.needsUpdate = true;

    if (!reduceMotion) {
      knot.rotation.x = t * 0.25; knot.rotation.y = t * 0.4;
      dust.rotation.y = -t * 0.05; dust.rotation.z = t * 0.02;
      heart.scale.setScalar(1 + Math.sin(t * 2.4) * 0.18);
    }

    // a gentle push in when something is selected
    zoom += ((selected >= 0 ? 1.14 : 1) - zoom) * Math.min(1, dt * 3);
    group.scale.multiplyScalar(zoom);

    // title label for the hovered node (or the selected one)
    if (label) {
      const show = hover >= 0 ? hover : selected;
      if (show < 0) { if (!label.hidden) label.hidden = true; }
      else {
        group.updateMatrixWorld();
        v.copy(nodes[show].pos).applyMatrix4(group.matrixWorld).project(camera);
        const r = el.getBoundingClientRect();
        const x = ((v.x + 1) / 2) * innerWidth - r.left, y = ((1 - v.y) / 2) * innerHeight - r.top;
        label.textContent = nodes[show].name;
        label.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -260%)`;
        if (label.hidden) label.hidden = false;
      }
    }
  }

  return { group, el, update };
}
