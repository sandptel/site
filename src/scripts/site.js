// Small behaviours shared by every page.
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const save = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const load = k => { try { return localStorage.getItem(k); } catch { return null; } };

/* ---------- theme: mode half + scheme half ---------- */
const theme = $('.theme');
if (theme) {
  const modeBtn = $('.mode', theme), schemeBtn = $('.scheme', theme), list = $('.schemes', theme);
  const items = $$('li', list);
  const sync = () => {
    const dark = root.dataset.mode === 'dark';
    modeBtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    modeBtn.setAttribute('aria-pressed', String(dark));
    const cur = items.find(li => li.dataset.id === root.dataset.scheme) ?? items[0];
    items.forEach(li => li.setAttribute('aria-selected', String(li === cur)));
    $('.nm', schemeBtn).textContent = cur.dataset.label;
    $('.dots', schemeBtn).innerHTML = JSON.parse(cur.dataset[dark ? 'dark' : 'light']).slice(3, 7).map(c => `<i style="background:${c}"></i>`).join('');
  };
  // repaint inside a view transition, revealed as a circle from the click
  const paint = (apply, x, y) => {
    if (!document.startViewTransition || reduce()) { apply(); sync(); return; }
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    document.startViewTransition(() => { apply(); sync(); }).ready.then(() => {
      root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 560, easing: 'cubic-bezier(.2,0,0,1)', pseudoElement: '::view-transition-new(root)' });
    });
  };
  const at = el => { const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; };
  modeBtn.addEventListener('click', () => paint(() => {
    root.dataset.mode = root.dataset.mode === 'dark' ? 'light' : 'dark';
    save('mode', root.dataset.mode);
  }, ...at(modeBtn)));

  const open = on => {
    list.hidden = !on; theme.classList.toggle('open', on); schemeBtn.setAttribute('aria-expanded', String(on));
    if (on) { const sel = items.find(li => li.getAttribute('aria-selected') === 'true') ?? items[0]; sel.focus(); }
  };
  const pick = li => {
    delete theme.dataset.peek;
    paint(() => { root.dataset.scheme = li.dataset.id; save('scheme', li.dataset.id); }, ...at(li));
    open(false); schemeBtn.focus();
  };
  schemeBtn.addEventListener('click', () => open(list.hidden));
  items.forEach((li, i) => {
    li.addEventListener('click', () => pick(li));
    li.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(li); }
      else if (e.key === 'Escape') { open(false); schemeBtn.focus(); }
      else if (e.key === 'Tab') open(false);
    });
    // preview a scheme while hovering it, without committing
    li.addEventListener('mouseenter', () => { theme.dataset.peek = li.dataset.id; root.dataset.scheme = li.dataset.id; });
  });
  list.addEventListener('mouseleave', () => { if (theme.dataset.peek) { root.dataset.scheme = load('scheme') || 'marginalia'; delete theme.dataset.peek; } });
  document.addEventListener('click', e => { if (!theme.contains(e.target) && !list.hidden) { open(false); list.dispatchEvent(new Event('mouseleave')); } });
  sync();
}

/* ---------- top bar gets a rule once you scroll ---------- */
const top = $('.top');
const onScroll = () => top.classList.toggle('scrolled', scrollY > 8);
addEventListener('scroll', onScroll, { passive: true }); onScroll();

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

/* ---------- copy the email address (shown as text too, in case clipboard is refused) ---------- */
$$('.copy[data-copy]').forEach(btn => btn.addEventListener('click', async () => {
  const label = $('i', btn);
  try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'copied'; }
  catch { getSelection().selectAllChildren($('span', btn)); label.textContent = 'selected'; }
  btn.classList.add('done');
  setTimeout(() => { btn.classList.remove('done'); label.textContent = 'copy'; }, 1800);
}));
