// The fixed 3D layer behind the page.
//  - Hero: one set of nodes that is first a twisted lattice (curiosity), then spreads into a
//    network with signals running along it (code), then forms a tunnel you fly into (creation).
//  - Ending: the name in extruded letters.
//  - Chapter 01: the "curiosity engine", which spins faster the faster you scroll.
//  - Inside My Mind (mind.js) and The Curiosity Lab (lab.js): interactive structures with their own files.
// Objects for chapters are lined up with empty `.anchor` boxes in the page, so they follow the layout on any screen.
import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import fontData from '../assets/helvetiker_bold.typeface.json'; // from the three.js examples (three@0.160.0)
import { createMind } from './mind.js';
import { createLab } from './lab.js';
import { createCreative } from './creative.js';

const EMERALD = 0x00a64f, ELECTRIC = 0x3dffa2, PALE = 0xeafff4, BG = 0x050907;

const canvas = document.getElementById('scene');
const NAME = (canvas.dataset.name || '').toUpperCase();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallScreen = matchMedia('(max-width: 700px)').matches;
const rand = (n) => (Math.random() - 0.5) * 2 * n;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (x, a, b) => { const k = clamp01((x - a) / (b - a)); return k * k * (3 - 2 * k); };

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, smallScreen ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;

const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 20, 64);
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.5;

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
const lightA = new THREE.PointLight(0x00d166, 26, 40);
const lightB = new THREE.PointLight(0xc8ffe6, 14, 40);
scene.add(lightA, lightB, new THREE.AmbientLight(0x9affc8, 0.2));

const lineMat = (color, opacity = 1) => new THREE.LineBasicMaterial({ color, transparent: true, opacity });
const wireOf = (geo, mat) => new THREE.LineSegments(new THREE.WireframeGeometry(geo), mat);
const edgesOf = (geo, mat) => new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat);
const lineOf = (points, mat) => new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat);

// ---- particles ----
const STAR_COUNT = smallScreen ? 900 : 1600;
const starPos = new Float32Array(STAR_COUNT * 3);
for (let i = 0; i < STAR_COUNT; i++) {
  const r = 12 + Math.random() * 40, th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
  starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  starPos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
  starPos[i * 3 + 2] = r * Math.cos(ph);
}
const starGeo = new THREE.BufferGeometry();
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  color: 0xbfffe0, size: 0.085, sizeAttenuation: true, transparent: true, opacity: 0.75, fog: false }));
scene.add(stars);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), 0.34, 0.6, 0.86));
composer.addPass(new OutputPass());

// ---- the name ----
const group = new THREE.Group();
scene.add(group);
const letters = [];
const font = new FontLoader().parse(fontData);
const size = 1, unit = size / font.data.resolution;
const chars = [...NAME];
const cFrom = new THREE.Color(EMERALD), cTo = new THREE.Color(ELECTRIC);
let cursor = 0;
chars.forEach((ch, i) => {
  const glyph = font.data.glyphs[ch] || font.data.glyphs['?'];
  if (ch.trim()) {
    const geo = new TextGeometry(ch, { font, size, depth: 0.36, curveSegments: 10,
      bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.03, bevelSegments: 5 });
    geo.computeBoundingBox();
    const c = geo.boundingBox.getCenter(new THREE.Vector3());
    geo.translate(-c.x, -c.y, -c.z); // each letter turns around its own centre
    const color = cFrom.clone().lerp(cTo, chars.length > 1 ? i / (chars.length - 1) : 0.5);
    const mesh = new THREE.Mesh(geo, new THREE.MeshPhysicalMaterial({
      color, metalness: 0.85, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.15, emissive: color, emissiveIntensity: 0.14 }));
    group.add(mesh);
    letters.push({
      mesh, i,
      home: new THREE.Vector3(cursor + c.x, 0, 0),
      away: new THREE.Vector3(rand(16), rand(10), -72 - Math.random() * 20), // where it drifts to mid-story (inside the fog)
      pos: new THREE.Vector3(), vel: new THREE.Vector3(),
      rot: new THREE.Vector3(), rotVel: new THREE.Vector3(),
      spin: 0, spinNow: 0,
    });
  }
  cursor += glyph.ha * unit;
});
const textWidth = cursor || 6;
for (const l of letters) {
  l.home.x -= cursor / 2;
  l.pos.copy(l.away); // the name only assembles at the very end of the page
}

// ---- hero: one set of nodes with three arrangements, blended by scroll ----
const heroEl = document.querySelector('[data-hero]');
const heroAnchor = document.querySelector('[data-3d="hero"]');
const FRAMES = smallScreen ? 7 : 9, PER = 8, NODES = FRAMES * PER, RING_GAP = 5.5;
const seeded = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const nodeA = [], nodeB = [], nodeC = [], cur = [];
for (let k = 0; k < FRAMES; k++) for (let j = 0; j < PER; j++) {
  const i = k * PER + j, u = k / (FRAMES - 1);
  // A: square frames stacked into a twisted lattice, narrow at both ends (unit size)
  const r = (0.16 + 0.66 * Math.pow(Math.sin(u * Math.PI), 0.8)) * (j % 2 ? Math.SQRT1_2 : 1);
  const a = (j / PER) * Math.PI * 2 + k * 0.34;
  nodeA.push(new THREE.Vector3(Math.cos(a) * r, (u - 0.5) * 2.1, Math.sin(a) * r));
  // B: scattered across the view as a network (-1..1, scaled to the screen each frame)
  nodeB.push(new THREE.Vector3((seeded(i) - 0.5) * 2, (seeded(i + 99) - 0.5) * 2, seeded(i + 199)));
  // C: the same frames become the rings of a tunnel (angle on a unit circle, z = ring number)
  const ta = (j / PER) * Math.PI * 2 + k * 0.22;
  nodeC.push(new THREE.Vector3(Math.cos(ta), Math.sin(ta), k));
  cur.push(new THREE.Vector3());
}
const edges = [];
for (let k = 0; k < FRAMES; k++) for (let j = 0; j < PER; j++) {
  edges.push([k * PER + j, k * PER + ((j + 1) % PER)]); // around each frame
  if (k < FRAMES - 1) edges.push([k * PER + j, (k + 1) * PER + j]); // between frames
}
const heroLinePos = new Float32Array(edges.length * 6);
const heroLineGeo = new THREE.BufferGeometry();
heroLineGeo.setAttribute('position', new THREE.BufferAttribute(heroLinePos, 3));
const heroLineMat = lineMat(EMERALD, 0.9);
const heroLines = new THREE.LineSegments(heroLineGeo, heroLineMat);
const heroNodePos = new Float32Array(NODES * 3);
const heroNodeGeo = new THREE.BufferGeometry();
heroNodeGeo.setAttribute('position', new THREE.BufferAttribute(heroNodePos, 3));
const heroNodeMat = new THREE.PointsMaterial({ color: ELECTRIC, size: 0.085, sizeAttenuation: true, transparent: true });
const heroNodes = new THREE.Points(heroNodeGeo, heroNodeMat);
// signals that run along the connections
const PULSES = smallScreen ? 14 : 30;
const pulses = Array.from({ length: PULSES }, (_, i) => ({ e: Math.floor(seeded(i + 7) * edges.length), o: seeded(i + 40), v: 0.25 + seeded(i + 80) * 0.5 }));
const pulsePos = new Float32Array(PULSES * 3);
const pulseGeo = new THREE.BufferGeometry();
pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
const pulseMat = new THREE.PointsMaterial({ color: PALE, size: 0.13, sizeAttenuation: true, transparent: true });
const pulsePts = new THREE.Points(pulseGeo, pulseMat);
// the core: a faceted emerald at the heart of the lattice, which ends up as the light at the end of the tunnel
const coreMat = new THREE.MeshPhysicalMaterial({ color: EMERALD, emissive: EMERALD, emissiveIntensity: 0.9, metalness: 0.5, roughness: 0.2, flatShading: true, transparent: true });
const core = new THREE.Mesh(new THREE.OctahedronGeometry(1, 0), coreMat);
const coreShellMat = lineMat(ELECTRIC, 0.8);
core.add(edgesOf(new THREE.OctahedronGeometry(1.45, 0), coreShellMat));
for (const o of [heroLines, heroNodes, pulsePts]) o.frustumCulled = false;
scene.add(heroLines, heroNodes, pulsePts, core);
const heroProxy = new THREE.Object3D(), aPos = new THREE.Vector3(2, 0, 0), origin = new THREE.Vector3(0, 0, -1);
const corePos = new THREE.Vector3(), pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3();
let aScale = 2;

// ---- chapter 01: the curiosity engine (unit size, scaled to its anchor) ----
function buildEngine() {
  const g = new THREE.Group();
  const core = wireOf(new THREE.IcosahedronGeometry(0.4, 1), lineMat(ELECTRIC, 0.9));
  const heart = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), new THREE.MeshBasicMaterial({ color: ELECTRIC }));
  const rings = [0.6, 0.78, 0.96].map((r, i) => {
    const pts = [];
    for (let k = 0; k < 96; k++) pts.push(new THREE.Vector3(Math.cos((k / 96) * Math.PI * 2) * r, Math.sin((k / 96) * Math.PI * 2) * r, 0));
    const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat(i === 1 ? PALE : EMERALD, i === 1 ? 0.5 : 0.8));
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), new THREE.MeshBasicMaterial({ color: PALE }));
    bead.position.x = r;
    ring.add(bead);
    ring.rotation.set(1.1 + i * 0.9, i * 0.8, 0);
    return ring;
  });
  g.add(core, heart, ...rings);
  g.userData.update = (t, dt, spin) => {
    core.rotation.y += dt * (0.4 + spin * 2);
    core.rotation.x += dt * 0.2;
    rings.forEach((ring, i) => {
      ring.rotation.x += dt * (0.25 + i * 0.12 + spin * (1.6 + i * 0.5));
      ring.rotation.y += dt * (0.18 + i * 0.1 + spin * 0.8);
      ring.rotation.z += dt * 0.3;
    });
    heart.scale.setScalar(1 + Math.sin(t * 3) * 0.15 + Math.min(spin, 1.5) * 0.5);
  };
  return g;
}

const engine = buildEngine();
engine.visible = false;
scene.add(engine);
const engineEl = document.querySelector('[data-3d="engine"]');
const lab = createLab({ camera, lineMat, wireOf, edgesOf, lineOf, EMERALD, ELECTRIC, PALE, reduceMotion });
scene.add(lab.group);
const creative = createCreative({ EMERALD, ELECTRIC, PALE, reduceMotion, smallScreen });
scene.add(creative.group);
const mind = createMind({ camera, lineMat, wireOf, edgesOf, lineOf, EMERALD, ELECTRIC, PALE, reduceMotion, smallScreen });
scene.add(mind.group);

// Line a unit-sized object up with a box in the page.
const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
const v = new THREE.Vector3(), dir = new THREE.Vector3();
function place(obj, el) {
  const r = el && el.getBoundingClientRect();
  if (!r || r.width === 0 || r.bottom < -120 || r.top > innerHeight + 120) { obj.visible = false; return false; }
  const nx = ((r.left + r.width / 2) / innerWidth) * 2 - 1, ny = -(((r.top + r.height / 2) / innerHeight) * 2 - 1);
  v.set(nx, ny, 0.5).unproject(camera);
  dir.copy(v).sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z; // where that screen point meets the z = 0 plane
  obj.position.copy(camera.position).addScaledVector(dir, dist);
  obj.scale.setScalar(Math.min(r.width, r.height) * 0.5 * ((2 * dist * halfFov) / innerHeight) * 0.9);
  obj.visible = true;
  return true;
}

let baseZ = 8;
function fit() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  composer.setSize(w, h);
  camera.aspect = w / h;
  baseZ = Math.max((textWidth * 1.35) / (2 * halfFov * camera.aspect), 6.6);
  camera.position.set(0, 0, baseZ);
  camera.updateProjectionMatrix();
}
addEventListener('resize', fit);
fit();

// ---- pointer ----
const pointer = new THREE.Vector2(0, 0), ndc = new THREE.Vector2(9, 9);
const raycaster = new THREE.Raycaster();
let hovered = null, away = 1;
addEventListener('pointermove', (e) => {
  pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1);
  ndc.set(pointer.x, -pointer.y);
});
addEventListener('pointerdown', (e) => {
  if (reduceMotion || away > 0.15 || e.target.closest('a, button, summary')) return;
  for (const l of letters) {
    l.vel.add(new THREE.Vector3(rand(9), rand(7), rand(9)));
    l.rotVel.add(new THREE.Vector3(rand(14), rand(14), rand(14)));
  }
});

const K = 38, DAMP = 6.5, RK = 30, RDAMP = 6;
const startedAt = performance.now();
let lastFrame = startedAt, lastY = scrollY, spin = 0;
let useBloom = true, sampleTime = 0, sampleFrames = 0, sampled = false;
const target = new THREE.Vector3(), force = new THREE.Vector3();

renderer.setAnimationLoop(() => {
  const now = performance.now();
  const rawDt = (now - lastFrame) / 1000;
  const dt = Math.min(rawDt, 0.5);
  const steps = Math.max(1, Math.ceil(dt * 60)), h = dt / steps; // springs are stepped at 60 per second or finer, so slow frames stay stable
  const t = (now - startedAt) / 1000;
  lastFrame = now;

  // Graceful fallback: if this device can't hold a reasonable frame rate, drop the glow pass and the resolution.
  if (!sampled && rawDt < 0.5) {
    sampleTime += rawDt; sampleFrames++;
    if (sampleTime > 2.5) {
      sampled = true;
      if (sampleFrames / sampleTime < 28) { useBloom = false; renderer.setPixelRatio(1); fit(); }
    }
  }

  const vh = innerHeight, max = Math.max(1, document.documentElement.scrollHeight - vh), y = scrollY;
  const progress = clamp01(y / max);
  away = clamp01((max - y) / (vh * 0.75)); // 0 at the very bottom of the page (name assembled), 1 everywhere else
  const drift = away * away * (3 - 2 * away);
  const mid = smooth(Math.min(y, max - y) / vh, 0, 0.75); // 0 at both ends of the page, 1 in between

  // Hero: how far through the pinned hero we are (0..1), and how far past it (0..1)
  const hr = heroEl.getBoundingClientRect(), span = Math.max(1, hr.height - vh);
  const hp = reduceMotion ? 0 : clamp01(-hr.top / span);
  const past = reduceMotion ? clamp01(-hr.top / (vh * 0.9)) : clamp01((-hr.top - span) / (vh * 0.9));
  const ab = smooth(hp, 0.08, 0.5), bc = smooth(hp, 0.55, 0.96), heroFade = 1 - past;
  const speed = Math.min(Math.abs(y - lastY) / Math.max(dt, 1 / 120) / vh, 4); // screens per second
  spin += ((reduceMotion ? 0 : speed) - spin) * Math.min(1, dt * 4);
  lastY = y;

  // Camera: pushes in and swings gently as the story scrolls, and leans a little toward the pointer
  if (reduceMotion) camera.position.set(0, 0, baseZ);
  else camera.position.set(Math.sin(progress * Math.PI * 2) * 0.5 * mid + pointer.x * 0.14, -pointer.y * 0.1, baseZ - mid * 0.8 - bc * heroFade * 3);
  camera.lookAt(0, 0, 0);
  if (!reduceMotion) camera.rotateZ(Math.sin(progress * Math.PI * 3) * 0.025 * mid + bc * heroFade * 0.12);
  camera.updateMatrixWorld();

  // ---- hero: lattice -> network -> tunnel ----
  const heroOn = heroFade > 0.002;
  heroLines.visible = heroNodes.visible = pulsePts.visible = core.visible = heroOn;
  if (heroOn) {
    if (place(heroProxy, heroAnchor)) { aPos.copy(heroProxy.position); aScale = heroProxy.scale.x * 0.84; }
    const halfH = baseZ * halfFov, halfW = halfH * camera.aspect, tunnelR = Math.max(3.6, Math.min(halfW, halfH) * 1.5);
    const ry = t * 0.22 + pointer.x * 0.5, rx = 0.22 + pointer.y * 0.25;
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    for (let i = 0; i < NODES; i++) {
      const A = nodeA[i], B = nodeB[i], C = nodeC[i];
      // A: spin around the vertical axis, tilt toward the pointer, then move to the anchor
      const x1 = A.x * cy + A.z * sy, z1 = -A.x * sy + A.z * cy;
      pa.set(x1, A.y * cx - z1 * sx, A.y * sx + z1 * cx).multiplyScalar(aScale).add(aPos);
      // B: spread over the screen, breathing slightly
      pb.set(B.x * halfW * 0.92 + Math.sin(t * 0.6 + i) * 0.22, B.y * halfH * 0.8 + Math.cos(t * 0.5 + i * 1.3) * 0.22, 1 - B.z * 10 + Math.sin(t * 0.4 + i * 0.7) * 0.3);
      // C: rings receding from the camera, sliding toward it as the scroll continues
      const twist = t * 0.05 * (C.z % 2 ? 1 : -1);
      const ca = Math.cos(twist), sa = Math.sin(twist);
      pc.set((C.x * ca - C.y * sa) * tunnelR, (C.x * sa + C.y * ca) * tunnelR, baseZ - 5 - C.z * RING_GAP + bc * 9 + past * 6);
      cur[i].copy(pa).lerp(pb, ab).lerp(pc, bc);
      cur[i].toArray(heroNodePos, i * 3);
    }
    for (let e = 0; e < edges.length; e++) {
      cur[edges[e][0]].toArray(heroLinePos, e * 6);
      cur[edges[e][1]].toArray(heroLinePos, e * 6 + 3);
    }
    for (let p = 0; p < PULSES; p++) {
      const pu = pulses[p], f = (t * pu.v + pu.o) % 1;
      pa.copy(cur[edges[pu.e][0]]).lerp(cur[edges[pu.e][1]], f).toArray(pulsePos, p * 3);
    }
    heroLineGeo.attributes.position.needsUpdate = heroNodeGeo.attributes.position.needsUpdate = pulseGeo.attributes.position.needsUpdate = true;
    const net = ab * (1 - bc); // 1 only in the network phase
    heroLineMat.opacity = (0.9 - net * 0.5) * heroFade;
    heroLineMat.color.set(EMERALD).lerp(cTo, bc * 0.5);
    heroNodeMat.opacity = (0.55 + net * 0.45) * heroFade;
    pulseMat.opacity = (reduceMotion ? 0 : 0.2 + ab * 0.8) * heroFade;
    // core: heart of the lattice -> centre of the network -> light at the far end of the tunnel
    corePos.copy(aPos).lerp(origin, ab);
    pc.set(0, 0, baseZ - 9 - FRAMES * RING_GAP + bc * 9 + past * 6);
    core.position.copy(corePos).lerp(pc, bc);
    core.scale.setScalar(THREE.MathUtils.lerp(THREE.MathUtils.lerp(aScale * 0.2, 0.28, ab), 1.5, bc));
    if (!reduceMotion) core.rotation.set(t * 0.3, t * 0.45, 0);
    coreMat.opacity = heroFade;
    coreMat.emissiveIntensity = 0.9 + bc * 1.6;
    coreShellMat.opacity = 0.8 * heroFade;
  }

  // ---- name ----
  if (!reduceMotion && away < 0.15) {
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(group.children, false)[0]?.object ?? null;
    if (hit !== hovered) {
      hovered = hit;
      const l = letters.find((x) => x.mesh === hit);
      if (l) l.spin += Math.PI * 2;
    }
  }
  for (const l of letters) {
    target.copy(l.home).lerp(l.away, drift);
    if (reduceMotion) l.pos.copy(target);
    else {
      for (let s = 0; s < steps; s++) {
        force.copy(target).sub(l.pos);
        l.vel.addScaledVector(force, K * h).multiplyScalar(Math.exp(-DAMP * h));
        l.pos.addScaledVector(l.vel, h);
        l.rotVel.addScaledVector(l.rot, -RK * h).multiplyScalar(Math.exp(-RDAMP * h));
        l.rot.addScaledVector(l.rotVel, h);
      }
      l.spinNow += (l.spin - l.spinNow) * Math.min(1, dt * 4.5);
    }
    const bob = reduceMotion ? 0 : Math.sin(t * 1.4 + l.i * 0.6) * 0.09;
    l.mesh.position.set(l.pos.x, l.pos.y + bob, l.pos.z);
    l.mesh.rotation.set(l.rot.x + (reduceMotion ? 0 : Math.sin(t * 1.1 + l.i * 0.6) * 0.07) + drift * l.i, l.rot.y + l.spinNow + drift * 2, l.rot.z);
    l.mesh.visible = l.pos.z > -58; // fully fogged beyond this, so skip drawing it
  }
  const sway = reduceMotion ? 0 : Math.sin(t * 0.5) * 0.12;
  group.rotation.y += (pointer.x * 0.5 * (1 - drift) + sway - group.rotation.y) * Math.min(1, dt * 3);
  group.rotation.x += (pointer.y * 0.28 * (1 - drift) - group.rotation.x) * Math.min(1, dt * 3);

  // ---- chapter objects ----
  if (place(engine, engineEl)) engine.userData.update(t, reduceMotion ? 0 : dt, spin);
  if (place(mind.group, mind.el)) mind.update(t, dt);
  if (place(lab.group, lab.el)) lab.update(t, dt, pointer);
  if (place(creative.group, creative.el)) creative.update(t, dt);

  lightA.position.set(Math.cos(t * 0.7) * 6, Math.sin(t * 0.9) * 2.5, 4 + Math.sin(t * 0.7) * 2);
  lightB.position.set(Math.cos(t * 0.6 + Math.PI) * 6, Math.sin(t * 0.8 + 2) * 2.5, 4 + Math.cos(t * 0.5) * 2);

  // particles drift slowly and turn with the scroll
  stars.rotation.y = (reduceMotion ? 0 : t * 0.012) + progress * 0.9;
  stars.rotation.x = progress * 0.35;

  if (useBloom) composer.render(); else renderer.render(scene, camera);
});
