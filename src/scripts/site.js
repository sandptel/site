// Small behaviours shared by every page.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const load = k => { try { return localStorage.getItem(k); } catch { return null; } };

/* ---------- theme: a sky switch for light/dark, and a panel of base16 themes ---------- */
const theme = $('.theme');
if (theme) {
  const modeBtn = $('.mode', theme), schemeBtn = $('.scheme', theme), panel = $('.schemes', theme);
  const items = $$('.sch-grid li', panel), segs = $$('.seg button', panel), segInd = $('.seg-ind', panel);
  const dark = () => root.dataset.mode === 'dark';
  const osDark = matchMedia('(prefers-color-scheme: dark)');
  const sync = () => {
    modeBtn.setAttribute('aria-checked', String(dark()));
    const cur = items.find(li => li.dataset.id === root.dataset.scheme) ?? items[0];
    items.forEach(li => li.setAttribute('aria-selected', String(li === cur)));
    $('.nm', schemeBtn).textContent = cur.dataset.label;
    const sw = JSON.parse(cur.dataset[dark() ? 'dark' : 'light']);
    $('.wheel', schemeBtn).style.background = `conic-gradient(${sw[3]} 0 25%, ${sw[4]} 0 50%, ${sw[5]} 0 75%, ${sw[6]} 0)`;
    const pref = root.dataset.pref || 'light';
    segs.forEach((b, i) => { const on = b.dataset.m === pref; b.setAttribute('aria-checked', String(on)); if (on) segInd.style.transform = `translateX(${i * 100}%)`; });
  };
  // repaint inside a view transition, revealed as a circle from the click (kept as it was)
  const paint = (apply, x, y) => {
    if (!document.startViewTransition || reduce()) { apply(); sync(); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => { apply(); sync(); }).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(.2,0,0,1)', pseudoElement: '::view-transition-new(root)' });
    });
  };
  const at = el => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
  const setPref = (pref, from) => {
    const mode = pref === 'auto' ? (osDark.matches ? 'dark' : 'light') : pref;
    const change = mode !== root.dataset.mode;
    const apply = () => { root.dataset.pref = pref; root.dataset.mode = mode; save('mode', pref); };
    change ? paint(apply, ...at(from)) : (apply(), sync());
  };
  modeBtn.addEventListener('click', () => setPref(dark() ? 'light' : 'dark', $('.knob', modeBtn)));
  segs.forEach(b => b.addEventListener('click', () => setPref(b.dataset.m, b)));
  osDark.addEventListener('change', () => { if (root.dataset.pref === 'auto') setPref('auto', modeBtn); });

  const open = on => {
    panel.hidden = !on; theme.classList.toggle('open', on); schemeBtn.setAttribute('aria-expanded', String(on));
    if (on) { const sel = items.find(li => li.getAttribute('aria-selected') === 'true') ?? items[0]; sel.focus({ preventScroll: true }); }
  };
  const restore = () => { if (theme.dataset.peek) { root.dataset.scheme = load('scheme') || 'marginalia'; delete theme.dataset.peek; sync(); } };
  const pick = li => {
    delete theme.dataset.peek;
    paint(() => { root.dataset.scheme = li.dataset.id; save('scheme', li.dataset.id); }, ...at(li));
    $('.wheel', schemeBtn).animate([{ transform: 'rotate(0)' }, { transform: 'rotate(90deg)' }], { duration: reduce() ? 0 : 520, easing: 'cubic-bezier(.2,0,0,1)' });
    open(false); schemeBtn.focus();
  };
  schemeBtn.addEventListener('click', () => open(panel.hidden));
  const COLS = 2;
  items.forEach((li, i) => {
    li.addEventListener('click', () => pick(li));
    li.addEventListener('keydown', e => {
      const mv = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: COLS, ArrowUp: -COLS }[e.key];
      if (mv) { e.preventDefault(); items[(i + mv + items.length) % items.length].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
      else if (e.key === 'Escape') { restore(); open(false); schemeBtn.focus(); }
      else if (e.key === 'Tab') { restore(); open(false); }
    });
    // preview a scheme while hovering (or arrowing onto) it, without committing
    const peek = () => { theme.dataset.peek = li.dataset.id; root.dataset.scheme = li.dataset.id; };
    li.addEventListener('mouseenter', peek); li.addEventListener('focus', peek);
  });
  $('.sch-grid', panel).addEventListener('mouseleave', restore);
  document.addEventListener('click', e => { if (!theme.contains(e.target) && !panel.hidden) { restore(); open(false); } });
  sync();
  theme.sync = sync;
}

/* ---------- top bar gets a rule once you scroll ---------- */
// a sentinel at the very top says when the page has scrolled: no scroll handler, no per-event layout read
const top = $('.top'), sentinel = document.createElement('div');
sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:8px;pointer-events:none';
document.body.prepend(sentinel);
new IntersectionObserver(([e]) => top.classList.toggle('scrolled', !e.isIntersecting)).observe(sentinel);

/* ---------- logo wall: stagger in, tilt toward the pointer ---------- */
const wall = $('.wall');
if (wall) {
  new IntersectionObserver((es, io) => es.forEach(e => { if (e.isIntersecting) { wall.classList.add('in'); io.disconnect(); } }), { threshold: .2 }).observe(wall);
  $$('a', wall).forEach(a => {
    a.addEventListener('pointermove', e => {
      if (reduce() || e.pointerType !== 'mouse') return;
      const r = a.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      a.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`); a.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    });
    a.addEventListener('pointerleave', () => { a.style.removeProperty('--rx'); a.style.removeProperty('--ry'); });
  });
}

/* ---------- niches: light up (and grow) the matching stops ---------- */
const journey = $('.journey');
$$('.niches button').forEach(btn => btn.addEventListener('click', () => {
  const on = btn.getAttribute('aria-pressed') !== 'true';
  $$('.niches button').forEach(b => b.setAttribute('aria-pressed', String(b === btn && on)));
  journey.classList.toggle('filtering', on);
  journey.classList.toggle('dim-out', on);
  $$('.stop', journey).forEach(s => {
    const match = on && s.dataset.tags.split(' ').includes(btn.dataset.niche);
    s.classList.toggle('match', match);
    $('.node', s).dispatchEvent(new CustomEvent('branch:pin', { detail: match }));
  });
  if (on) $('.stop.match', journey)?.scrollIntoView({ behavior: reduce() ? 'auto' : 'smooth', block: 'center' });
}));

/* ---------- wado: walk down the fallback ladder ---------- */
const TIERS = [['vaapi-dmabuf', 'zero-copy, on the GPU'], ['vaapi-cpu', 'CPU read-back, GPU encode'], ['x264-cpu', 'software encode, still streaming']];
$$('.fig-wado').forEach(fig => {
  const btn = $('.drop', fig);
  btn.addEventListener('click', () => {
    const t = (+fig.dataset.tier + 1) % TIERS.length;
    fig.dataset.tier = t;
    $('.tier-name', fig).textContent = TIERS[t][0];
    $('.tier-note', fig).textContent = TIERS[t][1];
    btn.textContent = t === TIERS.length - 1 ? 'recover' : 'fail a tier';
    if (t && !reduce()) { fig.classList.remove('shake'); void fig.offsetWidth; fig.classList.add('shake'); }
  });
});

/* ---------- write-ups: before/after slider, the two-approach tabs, the demo recording ---------- */
$$('.fig-cmp').forEach(fig => $('input', fig).addEventListener('input', e => { fig.classList.add('touched'); fig.style.setProperty('--x', e.target.value); }));
$$('.fig-meth').forEach(fig => $$('[role=tab]', fig).forEach(t => t.addEventListener('click', () => {
  fig.dataset.m = t.dataset.m;
  $$('[role=tab]', fig).forEach(o => o.setAttribute('aria-selected', String(o === t)));
})));
// plays only while on screen, never by itself under reduced motion; click or enter holds it
const reel = new IntersectionObserver(es => es.forEach(({ target: v, isIntersecting: on }) => {
  if (!on) v.pause(); else if (!reduce() && !v.dataset.held) v.play().catch(() => {});
}), { threshold: .4 });
$$('.fig-vid video').forEach(v => {
  reel.observe(v); v.tabIndex = 0;
  v.addEventListener('play', () => v.parentElement.classList.add('playing'));
  v.addEventListener('pause', () => v.parentElement.classList.remove('playing'));
  const toggle = () => { if (v.paused) { delete v.dataset.held; v.play(); } else { v.dataset.held = 1; v.pause(); } };
  v.addEventListener('click', toggle);
  v.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
});

/* ---------- copy the email address (shown as text too, in case clipboard is refused) ---------- */
$$('.copy[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const label = $('i', btn);
  try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'copied'; }
  catch { getSelection().selectAllChildren($('span', btn)); label.textContent = 'selected'; }
  btn.classList.add('done');
  setTimeout(() => { btn.classList.remove('done'); label.textContent = 'copy'; }, 1800);
}));

/* ---------- a small notice, for moments worth one line ---------- */
function notice(html, ms = 5200) {
  const n = document.createElement('div');
  n.className = 'notice'; n.setAttribute('role', 'status'); n.innerHTML = html;
  document.body.appendChild(n);
  requestAnimationFrame(() => n.classList.add('on'));
  setTimeout(() => { n.classList.remove('on'); setTimeout(() => n.remove(), 450); }, ms);
}
document.addEventListener('explored:all', () => notice('<b>You opened every note on this page.</b> More than I expected anyone to.'));

/* ---------- hero: a few words in the bio grow their definitions ---------- */
const hb = $('.hero-branch'), hero = $('#hero');
if (hb && hero) {
  let cur = null, hideT;
  const place = w => {
    const h = hero.getBoundingClientRect(), r = w.getBoundingClientRect();
    const x = r.left - h.left, left = Math.max(0, Math.min(x - 40, h.width - 320));
    hb.style.left = left + 'px'; hb.style.top = (r.bottom - h.top + 26) + 'px';
    const svg = $('.hb-line', hb), ax = x + r.width / 2 - left;
    svg.setAttribute('width', Math.max(ax, 60) + 20); svg.setAttribute('height', 28);
    $('path', svg).setAttribute('d', `M${ax},-17 V2`);
  };
  const show = w => {
    clearTimeout(hideT);
    $$('.demo-tw').forEach(b => { b.classList.toggle('hot', b === w); b.setAttribute('aria-expanded', String(b === w)); });
    if (!w) { hb.classList.remove('on'); cur = null; return; }
    $$('.card', hb).forEach(c => c.hidden = c.dataset.for !== w.dataset.def);
    place(w); cur = w;
    hb.classList.remove('on'); void hb.offsetWidth; hb.classList.add('on');
    window.__branches?.mark('hero:' + w.dataset.def);
  };
  const later = () => { hideT = setTimeout(() => show(null), 450); };
  // one tap fires enter, focus and click; only the click decides on touch
  let ptr = 0, shownAt = 0;
  const open = w => { if (cur !== w) { show(w); shownAt = performance.now(); } };
  $$('.demo-tw').forEach(w => {
    w.addEventListener('pointerdown', () => ptr = performance.now());
    w.addEventListener('pointerenter', e => e.pointerType === 'mouse' && open(w));
    w.addEventListener('focus', () => performance.now() - ptr > 500 && open(w));
    w.addEventListener('click', () => (cur === w && performance.now() - shownAt > 350 ? show(null) : open(w)));
    w.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); show(cur === w ? null : w); } });
    w.addEventListener('pointerleave', e => e.pointerType === 'mouse' && later());
    w.addEventListener('blur', () => performance.now() - ptr > 500 && later());
  });
  hb.addEventListener('mouseenter', () => clearTimeout(hideT));
  hb.addEventListener('mouseleave', later);
  // phone: the card is a bottom sheet; tap elsewhere or pull it down to put it away
  document.addEventListener('click', e => cur && !hb.contains(e.target) && !e.target.closest('.demo-tw') && show(null));
  let y0 = null;
  hb.addEventListener('touchstart', e => { y0 = e.touches[0].clientY; }, { passive: true });
  hb.addEventListener('touchmove', e => { if (y0 === null) return; const dy = Math.max(0, e.touches[0].clientY - y0); hb.style.setProperty('--pull', dy + 'px'); hb.classList.add('pulling'); }, { passive: true });
  hb.addEventListener('touchend', () => {
    const dy = parseFloat(hb.style.getPropertyValue('--pull')) || 0;
    hb.classList.remove('pulling'); hb.style.removeProperty('--pull'); y0 = null;
    if (dy > 56) show(null);
  });
  addEventListener('resize', () => cur && place(cur));
}

/* ---------- hero compass: point at the reader ---------- */
const compass = $('.compass');
if (compass) {
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse' || scrollY > innerHeight) { window.__aim = null; return; }
    const r = compass.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + 58;
    const d = Math.hypot(e.clientX - cx, e.clientY - cy);
    window.__aim = d < 420 ? Math.atan2(e.clientX - cx, cy - e.clientY) * 180 / Math.PI : null;
  }, { passive: true });
  document.addEventListener('pointerleave', () => window.__aim = null);
}

/* ---------- idle on the hero: the arrow stirs ---------- */
const hint = $('.hint');
if (hint) {
  let idleT;
  const arm = () => { clearTimeout(idleT); hint.classList.remove('nudge'); idleT = setTimeout(() => { if (scrollY < 60) { hint.classList.add('nudge'); $('.hint-t', hint).textContent = 'scroll; it grows'; } }, 7000); };
  ['scroll', 'pointermove', 'keydown'].forEach(e => addEventListener(e, arm, { passive: true }));
  arm();
}

/* ---------- rewind the tree ---------- */
const rewind = () => { scrollTo({ top: 0, behavior: reduce() ? 'auto' : 'smooth' }); };
$$('.rewind').forEach(b => b.addEventListener('click', rewind));

/* ---------- keyboard: j/k stops, x open, t theme, d dark, g top, ? help ---------- */
const help = $('.keys-help');
const marks = () => $$('.stop').length ? $$('.stop') : $$('.col.body > p').filter(p => p.nextElementSibling?.classList.contains('slot'));
const go = step => {
  const list = marks(), y = 90;
  const i = list.findIndex(el => el.getBoundingClientRect().top > y + 4);
  const cur = i === -1 ? list.length : i;
  const target = step > 0 ? list[cur] : list[Math.max(0, cur - 2)];
  if (target) scrollTo({ top: target.getBoundingClientRect().top + scrollY - y, behavior: reduce() ? 'auto' : 'smooth' });
};
addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
  if (e.key === '?') { help.hidden = !help.hidden; if (!help.hidden) $('.kh-card', help).focus?.(); return; }
  if (e.key === 'Escape' && !help.hidden) { help.hidden = true; return; }
  if (!help.hidden) return;
  if (e.key === 'j') go(1);
  else if (e.key === 'k') go(-1);
  else if (e.key === 'g') rewind();
  else if (e.key === 'd') $('.theme .mode')?.click();
  else if (e.key === 't') {
    const items = $$('.sch-grid li'), i = items.findIndex(li => li.dataset.id === root.dataset.scheme);
    const next = items[(i + 1) % items.length];
    root.dataset.scheme = next.dataset.id; save('scheme', next.dataset.id);
    theme?.sync?.();
    notice(`theme · <b>${next.dataset.label}</b>`, 1400);
  } else if (e.key === 'x') {
    const cards = $$('.card.t-project').filter(c => { const r = c.getBoundingClientRect(); return r.top < innerHeight * .7 && r.bottom > 80; });
    cards[0]?.querySelector(':scope > .more')?.click();
  }
});
help?.addEventListener('click', e => { if (e.target === help) help.hidden = true; });

/* ---------- the photo turns once: academic side → programming side ---------- */
const me = $('.me-card');
if (me) {
  const btn = $('.flip', me), fa = $('.face-text.fa'), fb = $('.face-text.fb'), about = $('.about');
  let timer;
  const faces = $('.faces');
  // the box takes the height of the side showing, so the shorter side leaves no gap
  const fit = () => { faces.style.height = (me.dataset.face === 'a' ? fa : fb).offsetHeight + 'px'; };
  new ResizeObserver(fit).observe(fa); new ResizeObserver(fit).observe(fb);
  const set = face => {
    if (me.dataset.face === face) return;
    me.dataset.face = face; btn.setAttribute('aria-pressed', String(face === 'b'));
    fa.inert = face !== 'a'; fb.inert = face !== 'b'; fit();
    $('.hero-branch')?.classList.remove('on'); $$('.demo-tw.hot').forEach(b => b.classList.remove('hot'));
  };
  // one early turn so the reader sees it turns, then it slows down: 5s, 10s, 15s, then every 20s
  const GAPS = [1400, 5000, 10000, 15000, 20000];
  let step = 0;
  const next = () => GAPS[Math.min(step++, GAPS.length - 1)];
  // never swap the text under someone who is reading or pointing at it, nor while the hero is off screen
  const busy = () => about.matches(':hover') || about.contains(document.activeElement) || !!$('.hero-branch.on');
  const away = () => { const r = about.getBoundingClientRect(); return document.hidden || r.bottom < 60 || r.top > innerHeight; };
  const turn = () => {
    clearTimeout(timer);
    if (busy() || away()) { timer = setTimeout(turn, 1500); return; }
    set(me.dataset.face === 'a' ? 'b' : 'a');
    timer = setTimeout(turn, next());
  };
  // a click turns it now; the rhythm carries on from there
  btn.addEventListener('click', () => { clearTimeout(timer); set(me.dataset.face === 'a' ? 'b' : 'a'); if (!reduce()) timer = setTimeout(turn, next()); });
  if (!reduce()) timer = setTimeout(turn, next());
}

/* ---------- phone: a faint tick under the thumb on deliberate taps ---------- */
if (navigator.vibrate && matchMedia('(hover: none)').matches)
  document.addEventListener('click', e => e.target.closest('.more, .flip, .niches button, .demo-tw, .mode') && navigator.vibrate(6));

/* ---------- loops sleep off screen: a figure scrolled past stops costing frames ---------- */
const sleeper = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('asleep', !e.isIntersecting)), { rootMargin: '120px 0px' });
$$('.fig, .now, .hint, .mode, .nowr').forEach(el => sleeper.observe(el));
