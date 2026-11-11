// Post-build: an icon used more than once on a page is drawn once as a <symbol> and reused with <use>.
// Keeps pages small however many logos get added (the journey alone repeated 145KB of identical paths).
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ICON = /<svg class="([^"]*)" viewBox="0 0 24 24" role="img" aria-label="([^"]*)"><title>([^<]*)<\/title><path d="([^"]+)"\/><\/svg>/g;

export function dedupe(html) {
  const count = new Map();
  for (const m of html.matchAll(ICON)) count.set(m[4], (count.get(m[4]) || 0) + 1);
  const ids = new Map();
  for (const [d, n] of count) if (n > 1) ids.set(d, `i${ids.size}`);
  if (!ids.size) return html;
  const out = html.replace(ICON, (all, cls, label, title, d) => ids.has(d)
    ? `<svg class="${cls}" viewBox="0 0 24 24" role="img" aria-label="${label}"><title>${title}</title><use href="#${ids.get(d)}"/></svg>` : all);
  const sprite = `<svg width="0" height="0" style="position:absolute" aria-hidden="true">${[...ids].map(([d, id]) => `<symbol id="${id}" viewBox="0 0 24 24"><path d="${d}"/></symbol>`).join('')}</svg>`;
  return out.replace(/<body([^>]*)>/, `<body$1>${sprite}`);
}

async function* html(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* html(p); else if (e.name.endsWith('.html')) yield p;
  }
}

export default () => ({
  name: 'dedupe-icons',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      for await (const f of html(dir.pathname)) await writeFile(f, dedupe(await readFile(f, 'utf8')));
    },
  },
});

// self-check: `node scripts/dedupe-icons.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  const a = '<svg class="ico" viewBox="0 0 24 24" role="img" aria-label="X"><title>X</title><path d="M0 0h1"/></svg>';
  const r = dedupe(`<body class="b">${a}<p>${a}</p><svg class="ico" viewBox="0 0 24 24" role="img" aria-label="Y"><title>Y</title><path d="M9"/></svg></body>`);
  console.assert((r.match(/<use href="#i0"\/>/g) || []).length === 2, 'both uses');
  console.assert(r.includes('<symbol id="i0"') && r.includes('<path d="M9"/>') && !r.includes('#i1'), 'sprite + singles kept');
  console.log('dedupe ok');
}
