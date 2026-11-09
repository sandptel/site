// Named figures for branch cards. Markup only: motion lives in global.css
// under `.fig-*`, and only runs once the card has landed (`.landed`).
// Every colour comes from the theme, so figures re-skin with base16.
import iconsJson from '../data/icons.json';

const I = iconsJson as Record<string, { title: string; path: string }>;
const ico = (n: string) => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="${I[n].path}"/></svg>`;

const FIGS: Record<string, () => string> = {
  // COSMIC desktop, drawn from the page's own base16 slots
  cosmic: () => `<div class="fig fig-cosmic" role="img" aria-label="Sketch of a COSMIC desktop: top panel, a settings window with toggles, a dock">
    <div class="panel"><span class="ws"><b></b><b></b><b></b></span><span class="clock"></span><span class="tray"><b></b><b></b><b></b></span></div>
    <div class="win"><div class="hb"><b></b><b></b><b></b></div>
      <div class="side"><b></b><b></b><b></b><b></b><b></b></div>
      <div class="pane"><div class="row"><b></b><span class="tg t1"></span></div><div class="row"><b></b><span class="tg t2"></span></div><div class="row"><b></b><span class="tg t3"></span></div><div class="slider"><span></span></div></div>
    </div>
    <div class="dock"><b></b><b></b><b></b><b></b><b></b><i></i></div>
  </div>`,

  // one config change fanned out to each compositor's IPC
  fanout: () => `<div class="fig fig-fanout" role="img" aria-label="cosmolith sends one event to Hyprland, Sway and niri, each in its own IPC">
    <div class="src"><span class="dot"></span>cosmolith<small>Event::Input{accel: 0.4}</small></div>
    <svg class="wires" viewBox="0 0 300 90" preserveAspectRatio="none" aria-hidden="true">
      <path d="M150 0 C150 40, 50 40, 50 90"/><path d="M150 0 L150 90"/><path d="M150 0 C150 40, 250 40, 250 90"/>
    </svg>
    <span class="pk p1"></span><span class="pk p2"></span><span class="pk p3"></span>
    <div class="dst">
      <span>${ico('hyprland')}<b>Hyprland</b><small>hyprctl</small></span>
      <span>${ico('sway')}<b>Sway</b><small>swaymsg</small></span>
      <span>${ico('niri')}<b>niri</b><small>niri msg</small></span>
    </div>
  </div>`,

  // GSoC '24: a pile of interdependent packages collapses into one NixOS option
  nixcollapse: () => {
    const pkgs = ['sway-regolith', 'i3-regolith', 'ilia', 'rofication', 'trawl', 'remontoire', 'regolith-look', 'regolith-session', 'i3xrocks', 'regolith-displayd', 'regolith-inputd', 'regolith-powerd', 'gnome-control-center', 'xrescat', 'regolith-ftue'];
    return `<div class="fig fig-nix" role="img" aria-label="Fifteen Regolith packages collapse into a single NixOS option">
      <div class="pile">${pkgs.map((p, i) => `<span style="--i:${i}">${p}</span>`).join('')}</div>
      <code class="one">${ico('nixos')}<span>wayland.regolith.enable = <b>true</b>;</span></code>
      <p class="arch"><span>x86_64-linux</span><span>aarch64-linux</span><span>cachix ✓</span></p>
    </div>`;
  },

  // merged pull requests, newest first
  prs: () => {
    const rows: [string, string, string][] = [
      ['regolith-lab/regolith-nix', 'feat: adds cachix support for binary caching', 'Apr 2025'],
      ['regolith-lab/regolith-nix', 'adds individual CD for essential applications', 'Apr 2025'],
      ['regolith-lab/regolith-nix', 'FHS env for regolith · working sway-regolith · VM', 'Feb 2025'],
      ['NixOS/nixpkgs', 'vtracer: init at 0.6.4', 'Dec 2024'],
    ];
    return `<ol class="fig fig-prs">${rows.map(([r, t, d], i) => `<li style="--i:${i}"><svg class="merge" viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="3" r="1.6"/><circle cx="4" cy="13" r="1.6"/><circle cx="12" cy="8" r="1.6"/><path d="M4 4.6v6.8M4 6c0 2 2 2 6.4 2"/></svg><span class="repo">${r}</span><span class="t">${t}</span><time>${d}</time></li>`).join('')}</ol>`;
  },

  // cargo-semver-checks: a lint fires and a witness proves the break
  semver: () => `<pre class="fig fig-term" role="img" aria-label="cargo-semver-checks output: a lint fails and a witness hint shows code that no longer compiles"><span class="l l1"><b class="warn">--- failure</b> function_parameter_count_changed</span>
<span class="l l2">  parse(src) now takes 2 parameters instead of 1</span>
<span class="l l3"><b class="live">  witness:</b> downstream code like this breaks</span>
<span class="l l4">    <i>let</i> doc = mycrate::parse(src);<b class="caret"></b></span></pre>`,

  // GSoC '25: four GNOME-era daemons swapped for one COSMIC fork, and what that did to startup
  swap: () => `<div class="fig fig-swap" role="img" aria-label="gnome-control-center, regolith-inputd, regolith-powerd and regolith-displayd are replaced by one cosmic-settings fork that applies changes live over swayipc-rs and persists them to generated config; startup dependencies drop by about 40 percent">
    <div class="cols">
      <div class="old"><p class="lbl">before · GNOME parts</p><span>gnome-control-center</span><span>regolith-inputd</span><span>regolith-powerd</span><span>regolith-displayd</span></div>
      <div class="arrow" aria-hidden="true">→</div>
      <div class="new"><p class="lbl">after · COSMIC</p><span class="main">${ico('popos')}cosmic-settings <small>fork</small></span><span class="via">↳ swayipc-rs <small>applies live</small></span><span class="via">↳ generated-config.d <small>persists</small></span></div>
    </div>
    <div class="weight"><span class="lbl">startup dependency weight</span><div class="bar"><i class="was"></i><i class="now"></i></div><b>−40%</b></div>
  </div>`,

  // RK Hall: the Tech GC calendar as a scoreboard, personal firsts marked
  gc: () => {
    const ev: [string, boolean][] = [['Product Design', true], ['Ad Design', true], ['Case Study', true], ['Hardware Modelling', false], ['Open Soft', false], ['Data Analytics', false], ['Tech Quiz', false], ['Biz Quiz', false], ['Maths Olympiad', false], ['Chem Quest', false]];
    return `<div class="fig fig-gc" role="img" aria-label="Ten Technology GC events, each with a hall team; first places in Product Design, Ad Design and Case Study; GC gold twice">
      <ol class="events">${ev.map(([n, w], i) => `<li style="--i:${i}"${w ? ' class="win"' : ''}><span>${n}</span>${w ? '<b>1st</b>' : ''}</li>`).join('')}</ol>
      <div class="medals"><span class="medal m1"><i></i>GC</span><span class="medal m2"><i></i>GC</span><small>gold, twice<br>with RK Hall</small></div>
    </div>`;
  },

  // the rice: a tiled Hyprland + Noctalia desktop flipping between two workspaces, in this page's base16 theme,
  // with a (literal) rice bowl sticker
  rice: () => `<div class="fig fig-rice" role="img" aria-label="A tiled Hyprland desktop with a Noctalia bar switching between two workspaces; a rice bowl sticker reads riced since 2021">
    <div class="bar" aria-hidden="true"><span class="wsp"><b></b><b></b><b></b><b></b><u></u></span><span class="clk"></span><span class="tray"><b></b><b></b></span></div>
    <div class="ws ws1" aria-hidden="true"><i class="w1"><em></em><em></em><em></em><em></em></i><i class="w2"><em></em><em></em></i><i class="w3"><em></em><em></em></i></div>
    <div class="ws ws2" aria-hidden="true"><i class="w4"><em></em><em></em><em></em></i><i class="w5"><em></em><em></em><em></em><em></em><em></em></i></div>
    <span class="bowl" aria-hidden="true">
      <svg viewBox="0 0 48 48">
        <path class="steam s1" d="M17 15c-2-3 2-4 0-7"/><path class="steam s2" d="M24 13c-2-3 2-4 0-7"/><path class="steam s3" d="M31 15c-2-3 2-4 0-7"/>
        <path class="chop" d="M30 22 L44 6"/><path class="chop" d="M33 23 L46 9"/>
        <path class="rice" d="M9 27c0-6 7-10 15-10s15 4 15 10z"/>
        <g class="grains"><ellipse cx="16" cy="23" rx="1.4" ry=".8"/><ellipse cx="22" cy="20" rx="1.4" ry=".8"/><ellipse cx="28" cy="22" rx="1.4" ry=".8"/><ellipse cx="33" cy="25" rx="1.4" ry=".8"/><ellipse cx="20" cy="25" rx="1.4" ry=".8"/></g>
        <path class="bowl-b" d="M6 27h36c0 9-8 15-18 15S6 36 6 27z"/>
        <path class="rim" d="M6 27h36"/><path class="band" d="M10 32h28"/>
      </svg>
      <small>riced since 2021</small>
    </span>
  </div>`,

  // elanmoc2: a small sensor that traces, scans and matches; sits beside the point that talks about it
  // (glyph after Lucide's "fingerprint", ISC)
  fingerprint: () => `<span class="fig-fp" role="img" aria-label="Fingerprint read and matched">
    <svg viewBox="0 0 24 24" aria-hidden="true"><g class="base"><path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M2 16h.01"/></g><g class="act"><path style="--k:0" d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" pathLength="1"/><path style="--k:1" d="M14 13.12c0 2.38 0 6.38-1 8.88" pathLength="1"/><path style="--k:2" d="M9 6.8a6 6 0 0 1 9 5.2v2" pathLength="1"/><path style="--k:3" d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" pathLength="1"/><path style="--k:4" d="M8.65 22c.21-.66.45-1.32.57-2" pathLength="1"/><path style="--k:5" d="M17.29 21.02c.12-.6.43-2.3.5-3.02" pathLength="1"/><path style="--k:6" d="M2 12a10 10 0 0 1 18-6" pathLength="1"/><path style="--k:7" d="M21.8 16c.2-2 .131-5.354 0-6" pathLength="1"/><path style="--k:8" d="M2 16h.01" pathLength="1"/></g><line class="scan" x1="1" x2="23" y1="2" y2="2"/></svg>
    <i class="ok" aria-hidden="true"><svg viewBox="0 0 12 12"><path d="M3 6.2l2 2 4-4.4" pathLength="1"/></svg></i>
  </span>`,

  // Mecha: kernel events through FFI into Rust, broadcast on D-Bus
  dbus: () => `<div class="fig fig-dbus" role="img" aria-label="udev events from USB and I2C pass through FFI bindings into Rust and are broadcast as D-Bus signals to shell apps">
    <div class="lane"><span class="tag">udev</span><span class="ev e1">USB add</span><span class="ev e2">I2C change</span></div>
    <div class="ffi"><span>C++ headers</span><b>FFI</b><span>${ico('rust')}rust</span></div>
    <div class="bus"><span class="sig"></span><b>D-Bus</b>
      <span class="ear r1">shell</span><span class="ear r2">notifications</span><span class="ear r3">settings</span>
    </div>
  </div>`,

  // wado: the zero-copy pipeline and its 3-tier fallback ladder (interactive)
  wado: () => `<div class="fig fig-wado" data-tier="0">
    <div class="pipe" aria-hidden="true">
      <span class="st s-render">${ico('wayland')}render</span>
      <span class="st s-dmabuf">DMA-BUF</span>
      <span class="st s-readback">CPU read-back</span>
      <span class="st s-vaapi">VA-API</span>
      <span class="st s-x264">x264</span>
      <span class="st s-h264">${ico('ffmpeg')}H.264</span>
      <span class="st s-rtc">${ico('webrtc')}WebRTC</span>
      <span class="frame"></span>
    </div>
    <div class="ctl">
      <span class="badge" role="status" aria-live="polite"><i></i><b class="tier-name">vaapi-dmabuf</b><small class="tier-note">zero-copy, on the GPU</small></span>
      <button type="button" class="drop">fail a tier</button>
    </div>
  </div>`,

  // kitetsu: speech in, on-device transcript, teleprompter cue out
  kitetsu: () => `<div class="fig fig-kit" role="img" aria-label="A waveform is transcribed on-device and a teleprompter shows the next line to say">
    <div class="wave">${Array.from({ length: 28 }, (_, i) => `<i style="--i:${i}"></i>`).join('')}</div>
    <p class="model">${ico('onnx')}moonshine · onnx · on-device</p>
    <p class="cue"><small>next</small><span>${'so the compositor owns the display and the input'.split(' ').map((w, i) => `<b style="--i:${i}">${w}</b>`).join(' ')}</span></p>
  </div>`,

  // pubre: the word-by-word reading guide, with the character lens
  pubre: () => {
    const words = 'Call me Ishmael. Some years ago, never mind how long precisely, having little or no money in my purse,'.split(' ');
    return `<div class="fig fig-pubre" role="img" aria-label="The reading guide moves word by word through the first line of Moby-Dick; the name Ishmael is coloured by the character lens">
      <p class="page">${words.map((w, i) => `<span style="--i:${i}"${w.startsWith('Ishmael') ? ' class="who"' : ''}>${w}</span>`).join(' ')}</p>
      <p class="pace"><span>238 wpm</span><span>guide · word</span><span>lens · cast</span></p>
    </div>`;
  },

  // IIT Kharagpur: the dual degree as a five-year bar
  degree: () => `<div class="fig fig-degree" role="img" aria-label="Dual degree, 2021 to 2026: B.Tech and M.Tech">
    <div class="bar"><span class="fill"></span><i style="--x:0"></i><i style="--x:.8"></i><i style="--x:1"></i></div>
    <p><span>2021</span><span>B.Tech</span><span>M.Tech · 2026</span></p>
  </div>`,
};

export function figure(name: string) {
  const f = FIGS[name];
  if (!f) throw new Error(`unknown figure ${name}`);
  return f();
}
