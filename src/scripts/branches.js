// Branch engine: grows overlays out of marked words as you scroll.
// Markup contract (built by src/lib/ui.ts): [data-grove] > svg.roots + .col.body|.jcol,
// anchors [data-b="id ..."] / [data-sub=id], cards .bpos#b-id > .sway > .card.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const qs = new URLSearchParams(location.search);
  const ALL = qs.has('all') || location.hash === '#all';
  const rmq = matchMedia('(prefers-reduced-motion: reduce)');
  const mq = matchMedia('(max-width: 1080px)');
  let reduce = rmq.matches, mobile = mq.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const rnd = s => { const x = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const f = n => Math.round(n * 10) / 10;
  const smooth = t => t * t * (3 - 2 * t);
  const bez = (a, b, c, d, t) => { const u = 1 - t; return u*u*u*a + 3*u*u*t*b + 3*u*t*t*c + t*t*t*d; };

  function el(tag, cls, parent) { const e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); if (parent) parent.appendChild(e); return e; }
  function localOffset(node, stop) { let x = 0, y = 0; while (node && node !== stop) { x += node.offsetLeft; y += node.offsetTop; node = node.offsetParent; } return { x, y }; }

  let seedN = 1;
  function makeBranch(G, anchor, pos, idx, parent) {
    const kind = parent ? 'sub' : anchor.classList.contains('node') ? 'node' : anchor.classList.contains('sprig') ? 'mood' : 'word';
    const g = el('g', 'br br-' + kind, G.svg);
    const glow = el('path', 'glow', g), main = el('path', 'main', g);
    glow.setAttribute('pathLength', 1); main.setAttribute('pathLength', 1);
    const rl = [el('path', 'rootlet', g), el('path', 'rootlet', g)];
    rl.forEach(r => r.setAttribute('pathLength', 1));
    const b0 = el('circle', 'bud', g), b1 = el('circle', 'bud', g);
    const s = seedN++ * 7.31;
    const b = {
      G, anchor, pos, kind, parent, idx, g, glow, main, rl, b0, b1, seed: s,
      sway: pos.querySelector(':scope > .sway'), card: pos.querySelector(':scope > .sway > .card'),
      subs: [], p: 0, pinned: false, open: false, peek: false, landed: false,
      x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, init: false,
      bend: (rnd(s) - .5) * 8, j1: 0, j2: 0, k2: 18,
      rs: [rnd(s + 4) > .5 ? 1 : -1, rnd(s + 5) > .5 ? 1 : -1], stagger: idx * .22,
      want: pos.dataset.want || null, d: ''
    };
    if (kind === 'mood') { b.mood = anchor.dataset.mood; b.para = anchor.closest('.slot').previousElementSibling; g.classList.add('br-mood', b.mood === 'lichen' ? 'tone-good' : 'tone-hard'); }
    pos.setAttribute('aria-hidden', 'false');
    // hover pairing
    const hot = on => { g.classList.toggle('hot', on); pos.classList.toggle('hot', on); anchor.classList.toggle('hot', on); };
    anchor.addEventListener('mouseenter', () => hot(true)); anchor.addEventListener('mouseleave', () => hot(false));
    b.card.addEventListener('mouseenter', () => hot(true)); b.card.addEventListener('mouseleave', () => hot(false));
    if (anchor.id === '') anchor.id = 'a-' + pos.id;
    return b;
  }

  // ---------- explored: what this reader has deliberately opened (per page, kept in their browser) ----------
  const exKey = 'explored:' + location.pathname;
  let seen; try { seen = new Set(JSON.parse(localStorage.getItem(exKey) || '[]')); } catch { seen = new Set(); }
  let exTotal = 0;
  const exUpdate = fresh => {
    const n = seen.size, done = exTotal && n >= exTotal;
    document.querySelectorAll('[data-explored]').forEach(e => e.textContent = n);
    document.querySelectorAll('[data-explore-total]').forEach(e => e.textContent = exTotal);
    const m = $('.explored');
    if (m && exTotal) {
      m.hidden = false; m.style.setProperty('--x', n / exTotal); m.classList.toggle('done', !!done);
      if (fresh) { m.classList.remove('tick'); void m.offsetWidth; m.classList.add('tick'); }
      if (fresh && done) document.dispatchEvent(new CustomEvent('explored:all'));
    }
  };
  const mark = id => { if (seen.has(id)) return; seen.add(id); try { localStorage.setItem(exKey, JSON.stringify([...seen])); } catch {} exUpdate(true); };

  // ---------- groves ----------
  const groves = $$('[data-grove]').map(gel => {
    const G = { el: gel, svg: $('svg.roots', gel), journey: gel.hasAttribute('data-journey'), top: [], subs: [], all: [], trunks: [], moods: [] };
    G.col = $(G.journey ? '.jcol' : '.col.body', gel);
    G.paras = G.journey ? [] : $$(':scope > p', G.col);
    $$('[data-b]', gel).forEach(a => {
      const ids = a.dataset.b.split(' ');
      a.setAttribute('aria-controls', ids.map(i => 'b-' + i).join(' '));
      a.setAttribute('aria-expanded', 'false');
      const group = [];
      ids.forEach((id, i) => { const pos = document.getElementById('b-' + id); if (pos) { const b = makeBranch(G, a, pos, i, null); G.top.push(b); group.push(b); } });
      a.addEventListener('click', () => {
        const pin = !group[0].pinned || group[0].p < .9;
        if (pin && group[0].kind === 'word') mark('b:' + ids.join('+'));
        group.forEach(b => { b.pinned = pin; if (pin) { b.card.classList.remove('flash'); void b.card.offsetWidth; b.card.classList.add('flash'); } });
      });
      a.addEventListener('focus', () => group.forEach(b => b.pinned = true));
      a.addEventListener('branch:pin', e => group.forEach(b => { b.pinned = e.detail; b.g.classList.toggle('lit', e.detail); b.subs.forEach(s => s.g.classList.toggle('lit', e.detail)); }));
    });
    $$('[data-sub]', gel).forEach(btn => {
      const pos = document.getElementById('b-' + btn.dataset.sub);
      const parentPos = btn.closest('.bpos');
      const parent = G.top.find(b => b.pos === parentPos);
      if (!pos || !parent) return;
      const s = makeBranch(G, btn, pos, 0, parent);
      parent.subs.push(s); G.subs.push(s);
      btn.setAttribute('aria-controls', pos.id); btn.setAttribute('aria-expanded', 'false');
      const set = open => { s.open = open; btn.setAttribute('aria-expanded', String(open)); pos.classList.toggle('open', open); parent.pinned = parent.pinned || open; G.dirty = true; };
      s.set = set;
      btn.addEventListener('click', e => { e.stopPropagation(); if (!s.open) mark('sub:' + btn.dataset.sub); set(!s.open); });
      btn.addEventListener('mouseenter', () => s.peek = true); btn.addEventListener('mouseleave', () => s.peek = false);
      btn.addEventListener('focus', () => s.peek = true); btn.addEventListener('blur', () => s.peek = false);
      btn.addEventListener('keydown', e => { if (e.key === 'Escape' && s.open) set(false); });
      pos.addEventListener('keydown', e => { if (e.key === 'Escape' && s.open) { set(false); btn.focus(); } });
    });
    G.all = G.top.concat(G.subs);
    // project cards open compact; they unfold when the reader rests on them (not while scrolling),
    // or on "details" for touch and keyboard. Nested branches unfold with them.
    G.top.filter(b => b.card.classList.contains('t-project')).forEach(b => {
      const btn = b.card.querySelector(':scope > .more');
      if (!btn) return;
      let tIn, tOut;
      const expand = on => {
        if (b.expanded === on) return;
        b.expanded = on; b.card.classList.toggle('open', on); b.pos.classList.toggle('expanded', on);
        if (on) { mark('card:' + b.pos.id); b.subs.forEach(s => mark('sub:' + s.anchor.dataset.sub)); }
        btn.setAttribute('aria-expanded', String(on)); btn.firstChild.textContent = on ? 'less' : 'details';
        b.subs.forEach(s => s.set(on));
        G.animUntil = performance.now() + 700; G.dirty = true;
      };
      b.fold = () => expand(false);
      btn.addEventListener('click', e => { e.stopPropagation(); b.lock = !b.expanded; expand(!b.expanded); });
      b.card.addEventListener('pointermove', e => {
        if (e.pointerType !== 'mouse' || b.expanded || G.mobile || performance.now() - lastScroll < 350) return;
        clearTimeout(tOut); clearTimeout(tIn); tIn = setTimeout(() => expand(true), 260);
      });
      b.pos.addEventListener('pointerenter', () => clearTimeout(tOut));
      b.pos.addEventListener('pointerleave', () => { clearTimeout(tIn); if (!b.lock) tOut = setTimeout(() => expand(false), 420); });
      b.card.addEventListener('keydown', e => { if (e.key === 'Escape' && b.expanded) { b.lock = false; expand(false); btn.focus(); } });
    });
    // trunks
    const tw = el('path', 'trunk wide', G.svg), t1 = el('path', 'trunk', G.svg);
    G.trunks.push(tw, t1);
    if (!G.journey) { const tw2 = el('path', 'trunk wide', G.svg), t2 = el('path', 'trunk', G.svg); G.trunks.push(tw2, t2); }
    G.trunks.forEach(t => { t.setAttribute('pathLength', 1); G.svg.insertBefore(t, G.svg.firstChild); });
    G.moods = G.top.filter(b => b.kind === 'mood');
    return G;
  });

  exTotal = groves.reduce((n, G) => n + G.top.filter(b => b.kind === 'word' || b.card.classList.contains('t-project')).length + G.subs.length, 0);
  exTotal += $$('.demo-tw').length; // the bio's own branches count too
  exUpdate(false);
  if (ALL) groves.forEach(G => G.subs.forEach(s => s.set(true)));

  // ---------- layout (reads, then writes; only on resize/toggle/fonts) ----------
  function trunkPath(x, y0, y1, seed) {
    let d = `M${f(x)},${f(y0)}`, y = y0, i = 0;
    while (y < y1) { const ny = Math.min(y1, y + 90), w = 0; d += ` Q${f(x + w)},${f((y + ny) / 2)} ${f(x)},${f(ny)}`; y = ny; i++; }
    return d;
  }

  function layout(G) {
    const gel = G.el;
    const gr = gel.getBoundingClientRect();
    G.docTop = gr.top + scrollY;
    const cr = G.col.getBoundingClientRect();
    const colL = cr.left - gr.left, colR = cr.right - gr.left;
    G.colL = colL; G.colR = colR;
    const firstP = $('p', G.col);
    const cs = getComputedStyle(firstP);
    G.lh = parseFloat(cs.lineHeight) || 34; G.fs = parseFloat(cs.fontSize) || 19;
    G.mobile = mobile;
    const rel = r => ({ left: r.left - gr.left, top: r.top - gr.top, right: r.right - gr.left, bottom: r.bottom - gr.top, width: r.width, height: r.height });

    if (!mobile) {
      const gutter = colL;
      const gap = G.journey ? 70 : clamp(gutter - 270, 40, 76);
      const cw = G.journey ? clamp(gutter - gap - 40, 240, 400) : clamp(gutter - gap - 70, 200, 252);
      const subOff = clamp(gutter - gap - cw - 22, 0, 50);
      // writes: widths
      // journey cards are sized by how much they matter (data-size); post branches keep one width
      const SCALE = { xl: 1, l: .9, m: .8, s: .68 }, room = Math.min(gutter - gap - 16, 480);
      G.top.forEach(b => {
        const sz = G.journey && SCALE[b.pos.dataset.size];
        b.w = sz ? Math.round(clamp(room * sz, 240, 480)) : b.pos.classList.contains('wide') ? Math.min(cw + 24, gutter - gap - 16) : cw;
        b.pos.style.width = b.w + 'px';
      });
      G.subs.forEach(s => { s.w = s.parent.w - 16; s.pos.style.width = s.w + 'px'; });
      // reads
      G.all.forEach(b => b.h = b.card.offsetHeight);
      G.subs.forEach(s => { const o = localOffset(s.anchor, s.parent.card); s.ax = o.x; s.ay = o.y; s.aw = s.anchor.offsetWidth; s.ah = s.anchor.offsetHeight; });
      G.top.forEach(b => {
        if (b.kind === 'mood') { const pr = rel(b.para.getBoundingClientRect()); b.ar = { left: colL - 40, top: pr.top + 4, width: 24, height: 24 }; b.ar.right = b.ar.left + 24; b.ar.bottom = b.ar.top + 24; }
        else b.ar = rel(b.anchor.getBoundingClientRect());
      });
      const bodyTop = rel(G.col.getBoundingClientRect()).top;
      const last = { L: -1e9, R: -1e9 }; let maxB = 0;
      const sorted = G.top.slice().sort((a, c) => a.ar.top - c.ar.top || a.idx - c.idx);
      sorted.forEach(b => {
        let side = b.want;
        if (!side && b.kind === 'mood') {
          side = last.L <= last.R ? 'L' : 'R';
          b.ar.left = side === 'L' ? colL - 40 : colR + 16; b.ar.right = b.ar.left + 24;
        }
        if (!side) {
          // pick the side that keeps the card closest to its word: push-down cost + length of the run between the lines
          const want0 = b.ar.top - 14, mid = b.ar.left + b.ar.width / 2;
          const cost = sd => Math.max(0, last[sd] + 22 - want0) + .45 * (sd === 'L' ? mid - colL : colR - mid);
          side = cost('L') <= cost('R') ? 'L' : 'R';
        }
        b.side = side; const dir = side === 'R' ? 1 : -1; b.dir = dir;
        b.tx = side === 'R' ? colR + gap : colL - gap - b.w;
        const want = b.kind === 'word' ? b.ar.top - 14 : b.ar.top + b.ar.height / 2 - 30;
        b.ty = Math.max(want, last[side] + 22);
        let total = b.h, sy = b.h + 20;
        // open subs stack under their parent; a closed one waits at the next free spot
        b.subs.forEach(s => {
          s.side = side; s.dir = dir;
          s.ox = side === 'R' ? subOff + 16 : -subOff; s.oy = sy;
          if (s.open) { total = Math.max(total, s.oy + s.h); sy += s.h + 14; }
        });
        last[side] = b.ty + total; maxB = Math.max(maxB, last[side]);
        // geometry anchors
        if (b.kind === 'word') {
          b.sx = b.ar.left + b.ar.width * (.3 + .4 * rnd(b.seed + 7));
          b.sy = b.ar.top + G.lh / 2 + G.fs * .42; b.gy = b.ar.bottom; b.ex = side === 'R' ? colR + 18 : colL - 18;
        } else {
          b.sx = side === 'R' ? b.ar.right : b.ar.left; b.sy = b.gy = b.ar.top + b.ar.height / 2; b.ex = b.sx + dir * 12;
        }
        b.trig = G.docTop + (b.kind === 'word' ? b.ar.top : b.ar.top);
        b.attach = b.kind === 'mood' ? 14 : 24;
      });
      // writes
      G.top.forEach(b => { b.pos.dataset.side = b.side; if (!b.init || reduce) { b.x = b.tx; b.y = b.ty; b.init = true; } });
      G.subs.forEach(s => { s.pos.dataset.side = s.side; s.pos.style.transform = `translate3d(${s.ox}px,${s.oy}px,0)`; });
      G.top.filter(b => b.kind === 'mood').forEach(b => { b.anchor.style.transform = `translate3d(${b.ar.left}px,${b.ar.top}px,0)`; });
      // grow grove so cards never spill into the next section
      const cur = parseFloat(gel.style.paddingBottom) || 0;
      const natural = gel.offsetHeight - cur;
      gel.style.paddingBottom = Math.max(0, maxB - natural + 60) + 'px';
      G.h = gel.offsetHeight;
      // trunks
      const tTop = bodyTop - 10, tBot = G.journey ? rel(G.col.getBoundingClientRect()).bottom - 30 : Math.max(maxB, rel(G.col.getBoundingClientRect()).bottom);
      G.tTop = tTop; G.tLen = tBot - tTop;
      if (G.journey) { const cx = (colL + colR) / 2; G.trunks[0].setAttribute('d', trunkPath(cx, tTop, tBot, 3)); G.trunks[1].setAttribute('d', trunkPath(cx, tTop, tBot, 3)); }
      else {
        const dl = trunkPath(colL - 18, tTop, tBot, 11), dr = trunkPath(colR + 18, tTop + 60, tBot, 23);
        G.trunks[0].setAttribute('d', dl); G.trunks[1].setAttribute('d', dl); G.trunks[2].setAttribute('d', dr); G.trunks[3].setAttribute('d', dr);
      }
    } else {
      // mobile: cards are inline; measure where they sit
      G.top.forEach(b => { b.pos.style.width = ''; b.pos.style.transform = ''; b.pos.dataset.side = 'R'; b.anchor.style.transform = ''; });
      G.subs.forEach(s => { s.pos.style.width = ''; s.pos.style.transform = ''; });
      gel.style.paddingBottom = '';
      const lane = colL + (parseFloat(getComputedStyle(G.col).paddingLeft) || 0) - 16;
      G.top.forEach(b => {
        b.ar = rel(b.anchor.getBoundingClientRect());
        const pr = rel(b.pos.getBoundingClientRect());
        b.cardLeft = pr.left; b.cy = pr.top + 22; b.trig = G.docTop + pr.top;
        const slot = b.pos.parentElement; const li = [...slot.querySelectorAll(':scope > .bpos')].indexOf(b.pos);
        b.lane = lane + li * 3;
        if (b.kind === 'word') { b.sx = b.ar.left + b.ar.width * .5; b.sy = b.ar.top + G.lh / 2 + G.fs * .42; b.gy = b.ar.bottom; }
        else { b.sx = b.ar.left; b.sy = b.gy = b.ar.top + b.ar.height / 2; }
        b.noPath = b.kind === 'mood';
        b.init = true;
      });
      G.h = gel.offsetHeight;
      const tTop = rel(G.col.getBoundingClientRect()).top - 10, tBot = rel(G.col.getBoundingClientRect()).bottom;
      G.tTop = tTop; G.tLen = tBot - tTop;
      const d = trunkPath(lane - 2, tTop, tBot, 5);
      G.trunks.forEach((t, i) => t.setAttribute('d', i < 2 ? d : ''));
    }
    // moods: paragraph centres
    G.moods.forEach(b => { const r = b.para.getBoundingClientRect(); b.mc = r.top + scrollY + r.height / 2; });
    G.svg.setAttribute('width', gel.clientWidth); G.svg.setAttribute('height', G.h);
    G.dirty = false;
  }

  function layoutHero() {
    // the path leaves the compass and settles on "this way, probably", passing beside the text, never through it
    const hero = $('#hero'), svg = hero && $('.wander', hero), comp = hero && $('.compass', hero), hint = hero && $('.hint', hero);
    if (!svg || !comp || !hint || !groves.length) return;
    const hr = hero.getBoundingClientRect(), W = hr.width;
    const rel = el => { const r = el.getBoundingClientRect(); return { l: r.left - hr.left, r: r.right - hr.left, t: r.top - hr.top, b: r.bottom - hr.top, h: r.height, w: r.width }; };
    const c = rel(comp), hi = rel(hint), X = v => clamp(v, 12, W - 12);
    const cx = c.l + c.w / 2, top = c.b + 14, hy = hi.t + hi.h / 2;
    const pts = [[cx, top], [X(cx + 8), top + (hy - top) * .45], [X(cx - 40), hy - 36], [hi.r + 24, hy]];
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    $$('path', svg).forEach(p => p.setAttribute('d', d));
    const dot = $('circle', svg); dot.setAttribute('cx', f(pts[0][0])); dot.setAttribute('cy', f(pts[0][1]));
  }

  function layoutAll() { mobile = mq.matches; groves.forEach(layout); layoutHero(); }

  // ---------- path builders ----------
  function gapRun(x0, ex, gy, seed) {
    let d = ''; const len = Math.abs(ex - x0), dir = ex > x0 ? 1 : -1, n = Math.max(1, Math.round(len / 44));
    for (let i = 1; i <= n; i++) {
      const x = x0 + dir * len * i / n, qx = x0 + dir * len * (i - .5) / n, qy = gy;
      d += ` Q${f(qx)},${f(qy)} ${f(x)},${f(gy)}`;
    }
    return d;
  }
  function rootlet(b, i, px, py, nx, ny, prog) {
    const r = b.rl[i], s = b.rs[i], L = 9 + rnd(b.seed + 11 + i) * 9;
    r.setAttribute('d', `M${f(px)},${f(py)} q${f(nx * 4 + s * ny * -4)},${f(ny * 4 + s * nx * 5)} ${f(nx * L * .6 - s * ny * L)},${f(ny * L * .6 + s * nx * L)}`);
    r.style.strokeDashoffset = 1 - prog;
  }
  function drawDesktop(b, cx, cy, c3x, c3y) {
    const { sx, sy, gy, ex, dir } = b;
    let d = b.kind === 'word' || b.kind === 'sub'
      ? `M${f(sx)},${f(sy)} Q${f(sx)},${f(gy)} ${f(sx + dir * 5)},${f(gy)}` + gapRun(sx + dir * 5, ex, gy, b.seed)
      : `M${f(sx)},${f(sy)} L${f(ex)},${f(gy)}`;
    const mx = (ex + cx) / 2, my = (gy + cy) / 2 + b.bend * Math.min(1, Math.abs(cy - gy) / 60 + .3);
    const c1x = ex + dir * Math.max(22, Math.abs(cx - ex) * .5), c1y = gy + b.j1;
    const c2x = mx - dir * b.k2, c2y = my - (cy - gy) * .2 + b.j2;
    d += ` C${f(c1x)},${f(c1y)} ${f(c2x)},${f(c2y)} ${f(mx)},${f(my)} S${f(c3x)},${f(c3y)} ${f(cx)},${f(cy)}`;
    if (d !== b.d) { b.main.setAttribute('d', d); b.glow.setAttribute('d', d); b.d = d; }
    // rootlets along the outer curve
    const t1 = .55, p1x = bez(ex, c1x, c2x, mx, t1), p1y = bez(gy, c1y, c2y, my, t1);
    const r1x = 2 * mx - c2x, r1y = 2 * my - c2y, t2 = .4, p2x = bez(mx, r1x, c3x, cx, t2), p2y = bez(my, r1y, c3y, cy, t2);
    const n1 = Math.hypot(mx - ex, my - gy) || 1, n2 = Math.hypot(cx - mx, cy - my) || 1;
    rootlet(b, 0, p1x, p1y, (mx - ex) / n1, (my - gy) / n1, clamp((b.p - .5) / .25, 0, 1));
    rootlet(b, 1, p2x, p2y, (cx - mx) / n2, (cy - my) / n2, clamp((b.p - .72) / .22, 0, 1));
    b.b0.setAttribute('cx', f(sx)); b.b0.setAttribute('cy', f(sy)); b.b0.setAttribute('r', b.p > .02 ? 2 : 0);
    b.b1.setAttribute('cx', f(cx)); b.b1.setAttribute('cy', f(cy)); b.b1.setAttribute('r', b.landed ? 3 : 0);
  }
  function drawMobile(b) {
    const { sx, sy, gy, lane, cy, cardLeft } = b;
    let d = b.kind === 'word' ? `M${f(sx)},${f(sy)} Q${f(sx)},${f(gy)} ${f(sx - 5)},${f(gy)}` + gapRun(sx - 5, lane, gy, b.seed) : `M${f(sx)},${f(sy)} L${f(lane)},${f(gy)}`;
    const w = 0;
    d += ` C${f(lane - 2)},${f(gy + 24)} ${f(lane + w)},${f(cy - 50)} ${f(lane)},${f(cy - 14)} Q${f(lane)},${f(cy)} ${f(lane + 10)},${f(cy)} L${f(cardLeft)},${f(cy)}`;
    if (d !== b.d) { b.main.setAttribute('d', d); b.glow.setAttribute('d', d); b.d = d; b.rl.forEach(r => r.setAttribute('d', '')); }
    b.b0.setAttribute('cx', f(sx)); b.b0.setAttribute('cy', f(sy)); b.b0.setAttribute('r', b.p > .02 ? 2 : 0);
    b.b1.setAttribute('cx', f(cardLeft)); b.b1.setAttribute('cy', f(cy)); b.b1.setAttribute('r', b.landed ? 2.5 : 0);
  }
  function countUp(card) {
    card.querySelectorAll('.num[data-count]').forEach(n => {
      if (n.dataset.done) return; n.dataset.done = 1;
      const end = +n.dataset.count, dp = (n.dataset.count.split('.')[1] || '').length, t0 = performance.now(), D = 900 + Math.min(end, 100) * 6;
      if (reduce) return;
      const step = now => { const t = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - t, 3); n.textContent = (end * e).toFixed(dp); if (t < 1) requestAnimationFrame(step); };
      n.textContent = (0).toFixed(dp); requestAnimationFrame(step);
    });
  }
  function setLanded(b, on) {
    if (on === b.landed) return; b.landed = on; b.pos.classList.toggle('landed', on);
    if (on) countUp(b.card);
    if (!b.parent) { const a = b.anchor; a.setAttribute('aria-expanded', String(on)); }
  }

  // ---------- frame loop ----------
  const washE = $('.wash.ember'), washL = $('.wash.lichen'), navNeedle = $('.nowr .needle'), heroNeedle = $('.compass .needle'), heroCap = $('.compass .cap b');
  const needles = [navNeedle, heroNeedle].filter(Boolean);
  let heroAngle = 38, capNow = '';
  const stops = $$('.stop[data-name]');
  // now reading: the centred capsule in the top bar
  const nowr = $('.nowr'), nrName = nowr && $('.nr-name b', nowr), nrDesc = nowr && $('.nr-desc', nowr), nrSeal = nowr && $('.nr-seal', nowr), nrText = nowr && $('.nr-text', nowr);
  const SPRIG_SVG = '<svg viewBox="0 0 20 20"><path d="M10 18 C10 12, 8 9, 4 6 M10 13 C 11 9, 13 7, 16 5"/><circle cx="4" cy="6" r="1.6"/><circle cx="16" cy="5" r="1.6"/></svg>';
  const postTitle = ($('.post-head h1') || {}).textContent || '';
  const nrItems = $$('[data-nr]').map(el => ({ el, name: el.dataset.name, desc: el.dataset.desc || '', seal: ($('.node .seal', el) || {}).outerHTML || '' }));
  groves.filter(G => !G.journey && G.paras.length).forEach(G => G.paras.forEach((p, i) => nrItems.push({
    el: p, name: postTitle, seal: '',
    desc: `¶ ${i + 1} of ${G.paras.length}` + ((w => w.length ? ' · ' + w.join(', ') : '')($$('.tw', p).map(b => b.textContent)))
  })));
  let nrNow = null, nrSwapAt = 0;
  const nrSet = it => {
    if (it === nrNow) return; nrNow = it;
    nowr.classList.toggle('on', !!it);
    if (!it) return;
    nrName.textContent = it.name; nrDesc.textContent = it.desc;
    nrSeal.innerHTML = it.seal || SPRIG_SVG; nrSeal.classList.toggle('glyph', !it.seal);
    // at reading pace the new stop slides in; when flying it just swaps, so the text never blanks out
    const t = performance.now(), calm = !fast && t - nrSwapAt > 300; nrSwapAt = t;
    [nrText, nrSeal].forEach(e => { e.classList.remove('swap'); if (calm) { void e.offsetWidth; e.classList.add('swap'); } });
  };
  let last = performance.now(), lastScroll = 0;
  addEventListener('scroll', () => lastScroll = performance.now(), { passive: true });

  // ---------- motion state: which way, how fast ----------
  // The bio says "can't perceive directions"; the page can. Scroll direction and speed drive
  // the compass, a rewind when you go back up, card inertia, and a bead that carries the year along the trunk.
  const root = document.documentElement;
  let lastSy = scrollY, vel = 0, dirNow = '', fast = false, calmAt = 0, movingAt = 0, angle = 38, readNow = -1, handAt = 0;
  // only the reader's own flings count as "fast"; anchor jumps and scrollTo don't
  const hand = () => handAt = performance.now();
  ['wheel', 'touchmove'].forEach(e => addEventListener(e, hand, { passive: true }));
  addEventListener('keydown', e => { if (/^(PageDown|PageUp|ArrowDown|ArrowUp|Space| |Home|End)$/.test(e.key)) hand(); });
  const headingArrow = nowr && $('.arr', nowr);
  const setDir = d => { if (d !== dirNow) { dirNow = d; root.dataset.dir = d; if (headingArrow) headingArrow.textContent = d === 'up' ? '↑' : '↓'; } };
  const stopInfo = stops.map(s => {
    const sizes = $$('.bpos[data-size]', s).map(e => e.dataset.size);
    return { el: s, name: s.dataset.name, when: ($('.node .yr', s) || {}).textContent || '', big: sizes.includes('xl') ? 2 : sizes.includes('l') ? 1 : 0 };
  });
  let stopIdx = -1, beadNow = '', streak = false;
  // the bead: while you fly through the journey, the year rides the trunk itself, mid-screen
  const jG = () => groves.find(G => G.journey);
  const bead = stops.length ? document.createElement('span') : null;
  if (bead) {
    bead.className = 'bead'; bead.setAttribute('aria-hidden', 'true');
    bead.innerHTML = '<i></i><b class="v"></b><small></small>';
    document.body.appendChild(bead); // fixed to the viewport: never has to chase the scroll
  }
  const beadSet = i => {
    if (!bead || i < 0) return;
    const v = stopInfo[i].when;
    if (v !== beadNow) { const el = $('.v', bead); el.textContent = v; el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); beadNow = v; }
    $('small', bead).textContent = stopInfo[i].name;
  };
  // the tree catches you: a fast run that ends near a key stop eases it into place, once
  function magnet() {
    if (reduce) return;
    let best = null, bd = Infinity;
    for (const s of stopInfo) {
      if (!s.big) continue;
      const r = $('.node', s.el).getBoundingClientRect(), d = r.top + r.height / 2 - innerHeight * .42;
      if (Math.abs(d) < innerHeight * .3 && Math.abs(d) < Math.abs(bd)) { bd = d; best = s; }
    }
    if (best && Math.abs(bd) > 24) scrollTo({ top: scrollY + bd, behavior: 'smooth' });
  }
  function frame(now) {
    const dt = Math.min(1 / 30, (now - last) / 1000); last = now;
    const sy = scrollY, vh = innerHeight;
    let ember = 0, lichen = 0;
    vel += ((sy - lastSy) / Math.max(dt, 1 / 240) - vel) * Math.min(1, dt * 12); lastSy = sy;
    if (Math.abs(vel) > 40) { movingAt = now; setDir(vel > 0 ? 'down' : 'up'); }
    if (!fast && Math.abs(vel) > 2200 && !reduce && now - handAt < 400) { fast = true; root.dataset.speed = 'fast'; streak = true; }
    if (fast) { if (Math.abs(vel) > 900) calmAt = now; else if (now - calmAt > 260) { fast = false; delete root.dataset.speed; } }
    if (streak && !fast && Math.abs(vel) < 60 && now - handAt > 220) { streak = false; if (stopIdx >= 0) magnet(); }
    const lag = reduce ? 0 : clamp(-vel * .028, -40, 40); // cards have a little weight
    const read = Math.round(clamp(sy / Math.max(1, root.scrollHeight - vh), 0, 1) * 500) / 500;
    if (read !== readNow) { readNow = read; root.style.setProperty('--read', read); }
    for (const G of groves) {
      if (G.animUntil > now) G.dirty = true; // re-measure while a card unfolds so neighbours glide
      if (G.dirty) layout(G);
      const visible = sy + vh > G.docTop - 300 && sy < G.docTop + G.h + 300;
      // moods
      G.moods.forEach(b => {
        const w = smooth(clamp(1 - Math.abs(b.mc - (sy + vh * .5)) / (vh * .55), 0, 1));
        if (b.mood === 'ember') ember = Math.max(ember, w); else lichen = Math.max(lichen, w);
      });
      if (!visible) continue;
      const tp = (ALL || reduce) ? 1 : clamp((sy + vh * (G.mobile ? .86 : .8) - G.docTop - G.tTop) / Math.max(1, G.tLen), 0, 1);
      G.trunks.forEach(t => t.style.strokeDashoffset = 1 - tp);
      for (const b of G.top) {
        // phone: cards land as they rise past the thumb, not a third of the screen later
        let target = (ALL || reduce) ? 1 : G.mobile ? clamp((sy + vh * 1.02 - b.trig) / (vh * .2) - b.stagger, 0, 1) : clamp((sy + vh * .8 - b.trig) / (vh * .28) - b.stagger, 0, 1);
        if (b.pinned) target = 1;
        const rate = target < b.p && dirNow === 'up' ? 4.2 : 9; // rewinding folds a touch slower, so you see it
        b.p = (ALL || reduce) ? target : b.p + (target - b.p) * Math.min(1, dt * rate);
        if (Math.abs(b.p - target) < .002) b.p = target;
        setLanded(b, b.landed ? b.p > .82 : b.p > .93);
        if (b.kind === 'node' && (b.p > .03) !== !!b.reached) { b.reached = b.p > .03; b.anchor.classList.toggle('reached', b.reached); }
        if (b.expanded && !b.lock) { const r = b.card.getBoundingClientRect(); if (r.bottom < -40 || r.top > vh + 40) b.fold(); }
        b.main.style.strokeDashoffset = b.glow.style.strokeDashoffset = 1 - b.p;
        if (G.mobile) { if (!b.noPath) drawMobile(b); else { b.main.setAttribute('d', ''); b.glow.setAttribute('d', ''); } }
        else {
          // spring to target position (cards re-stack when a sub opens)
          if (reduce) { b.x = b.tx; b.y = b.ty; }
          else {
            const k = 170, c = 27;
            b.vx += (k * (b.tx - b.x) - c * b.vx) * dt; b.vy += (k * (b.ty + lag - b.y) - c * b.vy) * dt;
            b.x += b.vx * dt; b.y += b.vy * dt;
          }
          let dx = 0, dy = 0, rot = 0;
          if (false) { // ponytail: sway off by design; `!reduce && b.landed` brings it back
            const t = now / 1000, amp = b.kind === 'mood' ? 1.4 : 1;
            dx = (Math.sin(t * .55 + b.seed) * 2.2 + Math.sin(t * 1.3 + b.seed * 2) * .6) * amp;
            dy = Math.cos(t * .47 + b.seed * 1.7) * 1.8 * amp;
            rot = Math.sin(t * .4 + b.seed) * .25 * b.dir;
          }
          b.pos.style.transform = `translate3d(${f(b.x)}px,${f(b.y)}px,0)`;
          b.sway.style.transform = `translate3d(${f(dx)}px,${f(dy)}px,0) rotate(${f(rot * 100) / 100}deg)`;
          b.X = b.x + dx; b.Y = b.y + dy;
          const cx = b.side === 'R' ? b.X : b.X + b.w, cy = b.Y + b.attach;
          drawDesktop(b, cx, cy, cx - b.dir * 30, cy);
        }
      }
      // reading lamp: paragraphs far from the eye line soften
      if (G.paras.length && !reduce) for (const p of G.paras) {
        const r = p.getBoundingClientRect(), d = Math.abs(r.top + r.height / 2 - vh * .45);
        const o = Math.round((1 - .42 * smooth(clamp((d - vh * .3) / (vh * .35), 0, 1))) * 50) / 50;
        if (o !== p._o) { p._o = o; p.style.opacity = o; }
      }
      for (const s of G.subs) {
        const P = s.parent;
        const target = (P.landed ? (s.open ? 1 : s.peek ? .38 : 0) : 0);
        s.p = reduce ? target : s.p + (target - s.p) * Math.min(1, dt * 7);
        if (Math.abs(s.p - target) < .002) s.p = target;
        setLanded(s, s.landed ? s.p > .8 : s.p > .92);
        if (G.mobile) { s.main.setAttribute('d', ''); s.glow.setAttribute('d', ''); s.rl.forEach(r => r.setAttribute('d', '')); s.b0.setAttribute('r', 0); s.b1.setAttribute('r', 0); continue; }
        s.main.style.strokeDashoffset = s.glow.style.strokeDashoffset = 1 - s.p;
        const dir = s.dir;
        s.sx = P.X + (dir > 0 ? s.ax + s.aw : s.ax); s.sy = P.Y + s.ay + s.ah * .5 + 5; s.gy = P.Y + s.ay + s.ah - 2;
        s.ex = dir > 0 ? P.X + P.w + 8 : P.X - 8;
        const top = P.Y + s.oy, cx = dir > 0 ? P.X + s.ox + s.w - 40 : P.X + s.ox + 40;
        drawDesktop(s, cx, top, cx + dir * 14, top - 36);
        s.b0.setAttribute('cx', f(s.sx)); s.b0.setAttribute('cy', f(s.sy));
      }
    }
    // atmosphere
    if (washE) { washE.style.opacity = f(ember * 100) / 100; washL.style.opacity = f(lichen * 100) / 100; }
    // compass that never settles
    const t = now / 1000, moving = now - movingAt < 650;
    const want = reduce ? 37 : moving ? (dirNow === 'up' ? 0 : 180) + Math.sin(t * 3.1) * 5 * Math.min(1, Math.abs(vel) / 800)
      : 38 + Math.sin(t * .7) * 40 + Math.sin(t * 1.9 + 1) * 18 + Math.sin(t * 4.3) * 4;
    angle += (((want - angle) % 360 + 540) % 360 - 180) * Math.min(1, dt * (moving ? 7 : 2.5));
    if (navNeedle) navNeedle.style.transform = `rotate(${f(angle)}deg)`;
    // the hero compass also notices you: hover near it and it points at your cursor
    if (heroNeedle) {
      const aim = window.__aim;
      const hw = aim == null ? angle : aim;
      heroAngle += (((hw - heroAngle) % 360 + 540) % 360 - 180) * Math.min(1, dt * (aim == null ? 8 : 10));
      heroNeedle.style.transform = `rotate(${f(heroAngle)}deg)`;
      const cap = aim != null ? 'you' : moving ? (dirNow === 'up' ? 'north, probably' : 'south, probably') : 'unsure';
      if (cap !== capNow && heroCap) { capNow = cap; heroCap.textContent = cap; }
    }
    root.toggleAttribute('data-moving', moving);
    // where the reader is: stop index for the bead, and the capsule's content
    {
      let cur = '';
      let idx = -1, it = null;
      if (nowr) { for (const x of nrItems) if (x.el.getBoundingClientRect().top < vh * .45) it = x; nrSet(sy > 240 ? it : null); }
      stops.forEach((s, i) => { if (s.getBoundingClientRect().top < vh * .55) { cur = s.dataset.name; idx = i; } });
      if (idx !== stopIdx) { stopIdx = idx; beadSet(idx); }
      if (bead) {
        // only along the trunk
        const G = jG(), mid = sy + vh * .5;
        // it rides under the page layer, so nodes simply pass over it: no on/off flicker at each stop
        const on = fast && idx >= 0 && G && mid > G.docTop + G.tTop && mid < G.docTop + G.tTop + G.tLen;
        if (on !== bead._on) { bead._on = on; bead.classList.toggle('on', !!on); }
        if (on) { const x = Math.round(G.el.getBoundingClientRect().left + (G.mobile ? (G.colL || 34) - 2 : (G.colL + G.colR) / 2)); if (x !== bead._x) { bead._x = x; bead.style.left = x + 'px'; } }
      }
    }
    requestAnimationFrame(frame);
  }

  // ---------- boot ----------
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layoutAll, 120); });
  mq.addEventListener('change', layoutAll);
  rmq.addEventListener('change', () => { reduce = rmq.matches; layoutAll(); });
  layoutAll();
  const go = () => {
    layoutAll();
    if (ALL) {
      const to = qs.get('to');
      const target = to ? document.getElementById(to) : $('[data-grove] .col.body, [data-grove] .jcol');
      const y = target.getBoundingClientRect().top + scrollY - (to ? 40 : (mobile ? 80 : 150));
      scrollTo(0, y);
    }
  };
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(go);
  addEventListener('load', go);
  setTimeout(layoutHero, 1700);
  if (groves.length || needles.length) requestAnimationFrame(frame);
  window.__branches = { groves, mark };
})();
