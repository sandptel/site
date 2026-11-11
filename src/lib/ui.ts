// Server-side HTML builders for branches, icons and seals.
// Branch cards are plain strings so the same renderer serves markdown posts
// (woven into rendered HTML) and the journey (built from src/data/journey.ts).
import icons from '../data/icons.json';
import { figure } from './figures';

/** Prefix a root-absolute path with the deploy base (`/site` on GitHub Pages); leaves URLs and #fragments alone. */
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
export const withBase = (p: string) => (/^\/(?!\/)/.test(p) ? BASE + p : p);

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Simple Icons mark, drawn in currentColor so every base16 theme tints it. */
export function icon(name: string, cls = 'ico') {
  const i = (icons as Record<string, { title: string; path: string }>)[name];
  if (!i) throw new Error(`unknown icon ${name}`);
  return `<svg class="${cls}" viewBox="0 0 24 24" role="img" aria-label="${esc(i.title)}"><title>${esc(i.title)}</title><path d="${i.path}"/></svg>`;
}

/** Organisation marks keep their own colours on a small tile; tech marks follow the theme. */
const SEALS: Record<string, { label: string; img?: string; icon?: string }> = {
  iitkgp: { label: 'IIT Kharagpur', img: '/logos/iitkgp.svg' },
  gsoc: { label: 'Google Summer of Code', icon: 'googlesummerofcode' },
  ccx: { label: 'CCExtractor', img: '/logos/CCExtractor.png' },
  regolith: { label: 'Regolith', img: '/logos/regolith-lab.png' },
  mecha: { label: 'Mecha', img: '/logos/mecha-org.png' },
  rkhall: { label: 'Radhakrishnan Hall of Residence', img: '/logos/rkhall.jpg' },
  popos: { label: 'Pop!_OS / COSMIC', img: '/logos/pop-os.png' },
  nixos: { label: 'NixOS', icon: 'nixos' },
  rust: { label: 'Rust', icon: 'rust' },
  github: { label: 'GitHub', icon: 'github' },
  wayland: { label: 'Wayland', icon: 'wayland' },
  svelte: { label: 'Svelte', icon: 'svelte' },
};
export function seal(key: string, cls = '') {
  const s = SEALS[key];
  if (!s) throw new Error(`unknown seal ${key}`);
  const inner = s.img ? `<img src="${withBase(s.img)}" alt="" loading="lazy" decoding="async">` : icon(s.icon!, 'ico');
  return `<span class="seal seal-${key}${s.img ? ' raster' : ''} ${cls}" title="${esc(s.label)}" aria-label="${esc(s.label)}">${inner}</span>`;
}
export const sealLabel = (key: string) => SEALS[key].label;

/** Tiny inline markdown: `code`, **bold**, *em*, [x](#sub:id) nested branch, [x](url) link. */
export function inline(md = '') {
  const parts: string[] = [];
  const keep = (h: string) => `\u0000${parts.push(h) - 1}\u0000`;
  let s = md.replace(/`([^`]+)`/g, (_, c) => keep(`<code>${esc(c)}</code>`));
  s = esc(s);
  s = s.replace(/\[([^\]]+)\]\(#sub:([\w-]+)\)/g, (_, t, id) => `<button class="tw sub" type="button" data-sub="${id}">${t}</button>`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${withBase(href)}">${t}</a>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => parts[+i]);
}

export interface Branch {
  type: 'define' | 'aside' | 'diagram' | 'figure' | 'mood' | 'project' | 'leaf';
  title?: string; body?: string; link?: string; wide?: boolean; want?: 'L' | 'R'; tone?: 'hard' | 'good';
  steps?: { label: string; note?: string }[]; cmd?: string; figure?: string;
  subs?: Record<string, Branch>;
  // journey cards
  seal?: string; role?: string; dates?: string; metrics?: [number, string, string][]; icons?: string[];
  links?: [string, string][]; stars?: number;
  href?: string; // where the card's title points; defaults to its first link
  points?: string[]; // highlights, shown as a short list
  gist?: string; // the one line a compact card shows before it expands
  size?: 'xl' | 'l' | 'm' | 's'; // how much of the eye it deserves; sets width and type scale
}

const GLYPH: Record<string, string> = { define: 'define', aside: 'aside', diagram: 'diagram', figure: 'figure', project: 'project', leaf: 'project' };

function cardInner(id: string, b: Branch, nested: boolean) {
  const kind = (GLYPH[b.type] ?? b.type) + (nested ? ' · nested' : '') + (b.type === 'diagram' && b.title ? ` · ${b.title.toLowerCase()}` : '');
  const head = `<p class="ctype"><span class="g"></span>${esc(kind)}</p>`;
  switch (b.type) {
    case 'mood':
      return `<p class="ctype">mood</p><p class="mood-line">${inline(b.body)}</p>`;
    case 'define':
      return `${head}<h3>${title(b.title ?? id, b.link)}<em>n.</em></h3><p>${inline(b.body)}</p>`;
    case 'aside':
      return `${head}<p class="path">${esc(b.title ?? '').replace(/\//g, '/<wbr>')}</p><p>${inline(b.body)}</p>`;
    case 'diagram': {
      const steps = (b.steps ?? []).map((s, i) => `<div class="step s${i + 1}"><i></i><span>${inline(s.label)}</span>${s.note ? `<small>${inline(s.note)}</small>` : ''}</div>`).join('');
      return `${head}<div class="flow" style="--n:${b.steps?.length ?? 0}" role="img" aria-label="${esc((b.steps ?? []).map(s => s.label.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')).join(' → '))}"><span class="pulse"></span>${steps}${b.cmd ? `<pre class="cmd">${esc(b.cmd)}</pre>` : ''}</div>`;
    }
    case 'figure':
      return `${head}${figure(b.figure!)}${b.body ? `<p class="cap">${inline(b.body)}</p>` : ''}`;
    case 'leaf':
      return `<h3 class="leaf-h">${b.icons?.length ? icon(b.icons[0]) : ''}${title(b.title ?? id, b.href ?? b.links?.[0]?.[1])}${b.stars ? `<span class="stars">★ ${b.stars}</span>` : ''}</h3><p>${inline(b.body)}</p>`;
    case 'project': {
      const href = b.href ?? b.links?.[0]?.[1];
      const metrics = b.metrics?.length ? `<dl class="metrics">${b.metrics.map(([n, suf, label], i) => `<div style="--i:${i}"><dt><span class="num" data-count="${n}">${n}</span>${esc(suf)}</dt><dd>${esc(label)}</dd></div>`).join('')}</dl>` : '';
      const points = b.points?.length ? `<ul class="pts">${b.points.map((p, i) => `<li style="--i:${i}">${inline(p)}</li>`).join('')}</ul>` : '';
      const stack = b.icons?.length ? `<p class="stack">${b.icons.map(n => `<span class="chip">${icon(n)}${esc(I[n].title)}</span>`).join('')}</p>` : '';
      const sealHtml = b.seal ? (href ? `<a class="seal-link" href="${withBase(href)}" tabindex="-1" aria-hidden="true">${seal(b.seal)}</a>` : seal(b.seal)) : '';
      // compact by default: header, gist, the figure and the numbers;
      // the story, the points, stack and links unfold on hover, focus or "details"
      const pts = b.points ?? [], keys: string[] = [], rest = pts; // collapsed stays light: points live in the expanded view
      const nSubs = Object.keys(b.subs ?? {}).length, nLinks = (b.links?.length ?? (href ? 1 : 0));
      const head = `<header class="ph">${sealHtml}<div><p class="ctype">${esc(b.dates ?? 'project')}</p><h3>${title(b.title ?? id, href)}</h3>${b.role ? `<p class="role">${esc(b.role)}</p>` : ''}</div></header>`;
      // a point may lead with `{fig:name}` to carry its own small figure
      const pt = (p: string, i: number) => { const m = p.match(/^\{fig:(\w+)\}\s*/); return m ? `<li class="has-fig" style="--i:${i}">${figure(m[1])}<span>${inline(p.slice(m[0].length))}</span></li>` : `<li style="--i:${i}">${inline(p)}</li>`; };
      const keysHtml = keys.length ? `<ul class="keys">${keys.map(pt).join('')}</ul>` : '';
      const restHtml = rest.length ? `<ul class="pts">${rest.map(pt).join('')}</ul>` : '';
      const compactStack = !b.figure && stack;
      const more = `<p>${inline(b.body)}</p>${restHtml}${(!compactStack && stack) || links(b) ? `<div class="foot-row">${compactStack ? '' : stack}${links(b)}</div>` : ''}`;
      const hint = [rest.length && `+${rest.length} point${rest.length > 1 ? 's' : ''}`, nSubs && `${nSubs} term${nSubs > 1 ? 's' : ''}`, nLinks > 1 && `${nLinks} links`].filter(Boolean).join(' · ') || 'the full story';
      return `${head}${b.gist ? `<p class="gist">${inline(b.gist)}</p>` : ''}${b.figure ? figure(b.figure) : ''}${keysHtml}${metrics}${compactStack || ''}`
        + `<div class="more-wrap"><div class="more-in">${more}</div></div>`
        + `<button class="more" type="button" aria-expanded="false"><span>details</span><small>${esc(hint)}</small><i aria-hidden="true"></i></button>`;
    }
  }
}
const I = icons as Record<string, { title: string; path: string }>;
/** a card title that links out, with an arrow that slides on hover */
const title = (t: string, href?: string) => href
  ? `<a class="h-link" href="${withBase(href)}">${esc(t)}<span class="arr" aria-hidden="true">${/^https?:/.test(href) ? '↗' : '→'}</span></a>`
  : esc(t);
// the first link already sits on the title, so the footer carries the rest
const links = (b: Branch) => b.links && b.links.length > 1 ? `<p class="links">${b.links.slice(1).map(([t, h]) => `<a href="${withBase(h)}">${esc(t)}${/^https?:/.test(h) ? ' ↗' : ''}</a>`).join('')}</p>` : '';

/** `.bpos > .sway > aside.card (+ nested .bpos.sub)`, the markup the branch engine expects. */
export function renderBranch(id: string, b: Branch, nested = false): string {
  const cls = ['bpos', nested && 'sub', b.wide && 'wide'].filter(Boolean).join(' ');
  const size = b.size ?? (b.type === 'leaf' ? 's' : b.type === 'project' ? 'm' : '');
  const card = `<aside class="card t-${b.type}${b.tone ? ` tone-${b.tone}` : ''}${size ? ` size-${size}` : ''}" aria-label="${esc(b.type === 'mood' ? 'Mood' : `Branch: ${b.title ?? id}`)}">${cardInner(id, b, nested)}</aside>`;
  const subs = Object.entries(b.subs ?? {}).map(([sid, s]) => renderBranch(sid, s, true)).join('');
  return `<div class="${cls}" id="b-${id}"${b.want ? ` data-want="${b.want}"` : ''}${size ? ` data-size="${size}"` : ''}><div class="sway">${card}${subs}</div></div>`;
}

const SPRIG = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18 C10 12, 8 9, 4 6 M10 13 C 11 9, 13 7, 16 5"/><circle cx="4" cy="6" r="1.6"/><circle cx="16" cy="5" r="1.6"/></svg>';

/**
 * Weave branches into rendered markdown: every `<a href="#b:id">` becomes a
 * branch anchor, and the paragraph that holds it is followed by a slot with
 * the rendered cards. Mood links (`[~](#b:mood-id)`) become a sprig in the slot.
 */
export function weave(html: string, branches: Record<string, Branch>) {
  const used = new Set<string>();
  const out = html.replace(/<p>([\s\S]*?)<\/p>/g, (whole, inner: string) => {
    const ids: string[] = [];
    const sprigs: string[] = [];
    inner = inner.replace(/\s*<a href="#b:([\w-]+)">([\s\S]*?)<\/a>/g, (m, id: string, text: string) => {
      const b = branches[id];
      if (!b) throw new Error(`post links #b:${id} but no branches.${id}`);
      ids.push(id); used.add(id);
      if (b.type === 'mood') {
        sprigs.push(`<button class="sprig tone-${b.tone ?? 'hard'}" type="button" data-b="${id}" data-mood="${b.tone === 'good' ? 'lichen' : 'ember'}" aria-label="Mood of this paragraph">${SPRIG}</button>`);
        return '';
      }
      return `${m.match(/^\s*/)![0]}<button class="tw" type="button" data-b="${id}">${text}</button>`;
    });
    if (!ids.length) return whole;
    const cards = ids.map(id => (branches[id].type === 'mood' ? sprigs.shift() : '') + renderBranch(id, branches[id])).join('');
    return `<p>${inner}</p>\n<div class="slot">${cards}</div>`;
  });
  const unused = Object.keys(branches).filter(k => !used.has(k));
  if (unused.length) throw new Error(`branches never linked from the text: ${unused.join(', ')}`);
  return out;
}
