// Scroll-driven motion and small interactions. Everything is visible without
// JavaScript or with "reduce motion" switched on; the animations only ever add to that.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
if (import.meta.env.DEV) window.__gsap = gsap; // handy in the browser console while developing; not in the built site
const root = document.documentElement;

// Reading progress bar
gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });

// The small site title in the corner only appears once the hero (which already shows it) is behind you
root.classList.toggle('at-top', scrollY < innerHeight * 0.6);
ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: '60% top',
  onToggle: (self) => root.classList.toggle('at-top', self.isActive) });

// Highlight the current section in the navigation
const navLinks = [...document.querySelectorAll('[data-nav]')];
const setCurrent = (section) => navLinks.forEach((a) => {
  const on = a.dataset.nav === section;
  a.classList.toggle('on', on);
  if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
});
let current = null;
document.querySelectorAll('[data-section]').forEach((el) => {
  ScrollTrigger.create({
    trigger: el, start: 'top 50%', end: 'bottom 50%',
    onToggle: (self) => {
      if (self.isActive) current = el.dataset.section;
      else if (current === el.dataset.section) current = null;
      setCurrent(current);
    },
  });
});

// Mobile menu
const menuBtn = document.querySelector('.menu-btn');
const setMenu = (open) => {
  root.classList.toggle('nav-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
};
if (menuBtn) {
  menuBtn.addEventListener('click', () => setMenu(!root.classList.contains('nav-open')));
  document.querySelectorAll('.site-nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('nav-open')) { setMenu(false); menuBtn.focus(); } });
}

// The Curiosity Lab. Two events are shared with the 3D structures (lab.js):
//   'discipline' = which area is hovered,  'lab' = which area is open (-1 = back to the overview)
const labBtns = [...document.querySelectorAll('[data-lab]')];
const labPanels = [...document.querySelectorAll('[data-lab-panel]')];
const labText = document.querySelector('.lab-text');
let labNow = -1;
const hoverLab = (index) => dispatchEvent(new CustomEvent('discipline', { detail: { index } }));
const openLab = (index, from) => dispatchEvent(new CustomEvent('lab', { detail: { index, from } }));
labBtns.forEach((btn) => {
  const i = Number(btn.dataset.lab);
  btn.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hoverLab(i); });
  btn.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hoverLab(-1); });
  btn.addEventListener('focus', () => hoverLab(i));
  btn.addEventListener('blur', () => hoverLab(-1));
  btn.addEventListener('click', () => openLab(i, 'list'));
});
document.querySelectorAll('[data-lab-go]').forEach((btn) => btn.addEventListener('click', () => openLab(Number(btn.dataset.labGo), 'panel')));
document.querySelectorAll('[data-lab-back]').forEach((btn) => btn.addEventListener('click', () => openLab(-1, 'panel')));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && labNow >= 0 && !root.classList.contains('nav-open') && document.activeElement?.closest?.('.lab-text, body') ) {
    if (document.activeElement?.closest?.('[data-mind-panel]')) return; // that panel handles its own Escape
    openLab(-1, 'key');
  }
});
addEventListener('discipline', (e) => labBtns.forEach((btn) => btn.classList.toggle('on', Number(btn.dataset.lab) === e.detail.index)));
addEventListener('lab', (e) => {
  const was = labNow;
  labNow = e.detail.index;
  // keep the column the same height when the list is swapped for a panel, so the page does not jump
  if (labText) {
    if (labNow >= 0 && was < 0) labText.style.minHeight = labText.offsetHeight + 'px';
    if (labNow < 0) labText.style.minHeight = '';
    labText.classList.toggle('lab-open', labNow >= 0);
  }
  document.querySelector('.lab-anchor')?.parentElement.classList.toggle('has-selection', labNow >= 0);
  labPanels.forEach((p) => { p.hidden = Number(p.dataset.labPanel) !== labNow; });
  ScrollTrigger.refresh();
  const panel = labPanels[labNow];
  if (panel) {
    // the button that was pressed has just been replaced by the panel, so move focus into it
    panel.querySelector('h3')?.focus({ preventScroll: true });
    const r = panel.getBoundingClientRect();
    if (r.top < 70 || r.top > innerHeight * 0.8) panel.scrollIntoView({ block: 'center', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  } else if (was >= 0) {
    hoverLab(-1);
    labBtns[was]?.focus({ preventScroll: true });
  }
});

// Inside My Mind: the list, the panels and the 3D nodes all follow one 'mind' event (detail.index, -1 = none)
const mindBtns = [...document.querySelectorAll('[data-mind]')];
const mindPanels = [...document.querySelectorAll('[data-mind-panel]')];
let mindNow = -1;
const pickMind = (index, from) => dispatchEvent(new CustomEvent('mind', { detail: { index, from } }));
mindBtns.forEach((btn) => btn.addEventListener('click', () => {
  const i = Number(btn.dataset.mind);
  pickMind(i === mindNow ? -1 : i, 'list');
}));
document.querySelectorAll('[data-mind-go]').forEach((btn) => btn.addEventListener('click', () => pickMind(Number(btn.dataset.mindGo), 'panel')));
document.querySelectorAll('[data-mind-close]').forEach((btn) => btn.addEventListener('click', () => {
  const was = mindNow;
  pickMind(-1, 'panel');
  mindBtns[was]?.focus({ preventScroll: true });
}));
addEventListener('keydown', (e) => {
  if (e.key !== 'Escape' || mindNow < 0 || root.classList.contains('nav-open')) return;
  const inside = document.activeElement?.closest?.('[data-mind-panel]');
  const was = mindNow;
  pickMind(-1, 'key');
  if (inside) mindBtns[was]?.focus({ preventScroll: true });
});
addEventListener('mind', (e) => {
  mindNow = e.detail.index;
  mindBtns.forEach((btn) => {
    const on = Number(btn.dataset.mind) === mindNow;
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', String(on));
  });
  mindPanels.forEach((p) => { p.hidden = Number(p.dataset.mindPanel) !== mindNow; });
  document.querySelector('.mind-stage')?.classList.toggle('has-selection', mindNow >= 0);
  ScrollTrigger.refresh();
  // if the panel opened out of sight (small screens: it sits under the 3D view), bring it into view
  const panel = mindPanels[mindNow];
  if (panel && e.detail.from !== 'scene') {
    const r = panel.getBoundingClientRect();
    if (r.bottom > innerHeight || r.top < 70) panel.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
});

// Opening or closing a case study changes the page height
document.querySelectorAll('details.case').forEach((d) => d.addEventListener('toggle', () => ScrollTrigger.refresh()));

const mm = gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)', () => {
  // Hero entrance: the three words rise from behind a mask, then the supporting copy fades in
  gsap.from('.hl > span', { yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.15 });
  gsap.from('.hero-in', { opacity: 0, y: 24, duration: 0.9, ease: 'power3.out', stagger: 0.12, delay: 0.75 });

  // Scrolling through the pinned hero: light the word for the current phase, clear the supporting copy
  // out of the way, and let everything go just before the next section arrives. (The 3D side of this
  // is driven by the same scroll position in scene.js.)
  const pin = document.querySelector('.hero-pin');
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress, phase = p < 0.06 ? null : p < 0.3 ? '0' : p < 0.74 ? '1' : '2';
      if (phase === null) pin.removeAttribute('data-phase-now'); else pin.setAttribute('data-phase-now', phase);
    } });
  gsap.to('.hero-intro', { opacity: 0, y: -30, ease: 'none', immediateRender: false,
    scrollTrigger: { trigger: '.hero', start: '4% top', end: '16% top', scrub: true } });
  gsap.to('.hero-copy', { opacity: 0, scale: 1.06, ease: 'none', transformOrigin: 'left center', immediateRender: false,
    scrollTrigger: { trigger: '.hero', start: '84% bottom', end: 'bottom bottom', scrub: true } });

  document.querySelectorAll('.chapter').forEach((ch) => {
    // Headline rises word by word from behind a mask
    gsap.from(ch.querySelectorAll('h2 .w > span'), { yPercent: 115, duration: 1, ease: 'power4.out', stagger: 0.06,
      scrollTrigger: { trigger: ch.querySelector('h2'), start: 'top 85%' } });
    // The outlined chapter number drifts at a different speed (parallax)
    gsap.fromTo(ch.querySelector('.ghost'), { yPercent: 25 }, { yPercent: -35, ease: 'none',
      scrollTrigger: { trigger: ch, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Paragraphs and other blocks ease in as they arrive
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, { opacity: 0, y: 36, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // Diagrams draw themselves with the scroll
  document.querySelectorAll('svg.viz').forEach((svg) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: svg, start: 'top 82%', end: 'center 45%', scrub: 0.6 } });
    const lines = svg.querySelectorAll('[data-draw]');
    const pops = svg.querySelectorAll('[data-pop]');
    if (lines.length) tl.fromTo(lines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: 'none', stagger: 0.12, duration: 1 }, 0);
    if (pops.length) tl.from(pops, { scale: 0.6, opacity: 0, stagger: 0.1, duration: 0.5, ease: 'back.out(2)' }, 0.1);
  });

  // Chapter 02: the phone types its code once, when it comes into view
  const phone = document.querySelector('.phone');
  if (phone) {
    const typing = gsap.timeline({ scrollTrigger: { trigger: phone, start: 'top 70%' } });
    phone.querySelectorAll('.ln').forEach((ln) => {
      const n = Number(ln.dataset.type) || 1;
      typing.fromTo(ln, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: n * 0.018 + 0.04, ease: `steps(${n})` }, '>0.08');
    });
    gsap.fromTo(phone, { y: 60 }, { y: -60, ease: 'none', scrollTrigger: { trigger: phone, start: 'top bottom', end: 'bottom top', scrub: true } });
  }

  // Chapter 03: the layers lift apart
  gsap.utils.toArray('.layer').forEach((layer, i) => {
    gsap.fromTo(layer, { z: 0, opacity: i ? 0.15 : 1 }, { z: i * 80, opacity: 1, ease: 'none',
      scrollTrigger: { trigger: '.stack', start: 'top 85%', end: 'top 25%', scrub: 0.6 } });
  });

  // Chapter 03: the timeline line grows as you read down it
  gsap.fromTo('.tl-line span', { scaleY: 0 }, { scaleY: 1, ease: 'none',
    scrollTrigger: { trigger: '.timeline', start: 'top 70%', end: 'bottom 65%', scrub: 0.4 } });
});

// Web fonts change text heights; re-measure once they are in.
if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());
