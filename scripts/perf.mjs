// `npm run perf`: build, serve, then scroll the home page as a mid-range phone (4x slower CPU)
// and fail if rendering work or page weight goes over budget. Needs Chrome/Chromium (CHROME=path to override).
import { spawn, execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';

// budgets: measured at 2026-11 with headroom; raise only with a reason
const BUDGET = {
  fcpMs: 900,          // first paint, 4x throttle, local server
  scrollLayouts: 450,  // layouts during a full-page wheel scroll + fling-back (~1000 frames); was ~1000 before the 2026-11 pass, now ~325
  scrollStyleS: 1.6,   // style recalc seconds in that scroll (4x CPU); now ~1.15, i.e. ~0.3ms/frame on a real phone
  scrollScriptS: 0.5,  // script seconds in that scroll; now ~0.3
  htmlGzipKB: 90,      // home page, CSS inlined
  jsKB: 45,            // largest client bundle
};
// animating these re-runs layout every frame; use transform / opacity / clip-path instead
const LAYOUT_PROPS = /^(width|height|min-width|max-width|min-height|max-height|top|left|right|bottom|margin.*|padding.*|font-size|line-height|inset.*|gap|grid-template.*|flex.*)$/;

const fails = [];
const check = (name, v, max) => { const ok = v <= max; console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${v} (budget ${max})`); if (!ok) fails.push(name); };

// static: keyframes that animate layout properties
const css = readFileSync('src/styles/global.css', 'utf8');
for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
  const bad = [...m[2].matchAll(/([a-z-]+)\s*:/g)].map(x => x[1]).filter(p => LAYOUT_PROPS.test(p));
  if (bad.length) { console.log(`FAIL @keyframes ${m[1]} animates ${[...new Set(bad)].join(', ')}`); fails.push(`keyframes ${m[1]}`); }
}

execSync('npm run build', { stdio: 'ignore' });
check('html gzip KB (index)', Math.round(gzipSync(readFileSync('dist/index.html')).length / 1024), BUDGET.htmlGzipKB);
const js = readdirSync('dist/_astro').filter(f => f.endsWith('.js')).map(f => statSync(`dist/_astro/${f}`).size);
check('largest js KB', Math.round(Math.max(0, ...js) / 1024), BUDGET.jsKB);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const port = 4400 + Math.floor(Math.random() * 300), cdp = port + 1000;
// dist/ served under the deploy base, like GitHub Pages
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/site/, '') || '/';
  if (p.endsWith('/')) p += 'index.html'; else if (!extname(p)) p += '/index.html';
  try { res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(join('dist', p))); }
  catch { res.writeHead(404); res.end(); }
}).listen(port);
const chrome = spawn(process.env.CHROME || 'google-chrome', ['--headless=new', '--window-size=390,844', `--remote-debugging-port=${cdp}`, `--user-data-dir=${tmpdir()}/perf-${cdp}`, 'about:blank'], { stdio: 'ignore' });
const done = () => { chrome.kill(); server.close(); };
try {
  let tabs;
  for (let i = 0; i < 60; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${cdp}/json`)).json(); if (tabs.some(t => t.type === 'page')) break; } catch {} await sleep(250); }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = {};
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; } };
  const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async x => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result.result.value;
  const metric = async () => Object.fromEntries((await send('Performance.getMetrics')).result.metrics.map(m => [m.name, m.value]));
  await send('Runtime.enable'); await send('Page.enable'); await send('Performance.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
  await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await send('Page.navigate', { url: `http://127.0.0.1:${port}/site/` }); await sleep(5000);
  check('first paint ms', Math.round(await ev(`performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 1e9`)), BUDGET.fcpMs);
  const a = await metric(), H = await ev('document.documentElement.scrollHeight');
  for (let y = 0; y < H - 844; y += 600) await send('Input.synthesizeScrollGesture', { x: 200, y: 600, yDistance: -600, speed: 1400, gestureSourceType: 'mouse' });
  const sy = await ev('scrollY');
  await send('Input.synthesizeScrollGesture', { x: 200, y: 200, yDistance: 4000, speed: 6000, gestureSourceType: 'mouse' }); // a fling back up
  const b = await metric();
  if (sy < 200) { console.log('FAIL scroll gesture did not move the page'); fails.push('scroll'); }
  check('scroll layouts', b.LayoutCount - a.LayoutCount, BUDGET.scrollLayouts);
  check('scroll style s', +(b.RecalcStyleDuration - a.RecalcStyleDuration).toFixed(2), BUDGET.scrollStyleS);
  check('scroll script s', +(b.ScriptDuration - a.ScriptDuration).toFixed(2), BUDGET.scrollScriptS);
  ws.close();
} finally { done(); }
if (fails.length) { console.log(`\n${fails.length} over budget`); process.exit(1); }
console.log('\nwithin budget');
