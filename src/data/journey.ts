// The journey: one stop per node on the home page's trunk, oldest first.
// `tags` drive the niche filter; `cards` are branches (see src/lib/ui.ts).
// Sources: resume (Nov 2026), LinkedIn, GitHub repos and merged PRs.
import type { Branch } from '../lib/ui';

export const NICHES = {
  systems: { label: 'Systems programming', icons: ['rust', 'tokio', 'wgpu'] },
  desktop: { label: 'Linux desktop', icons: ['wayland', 'linux', 'sway'] },
  nix: { label: 'Nix & reproducible builds', icons: ['nixos', 'githubactions'] },
  people: { label: 'Leading & building for people', icons: ['github', 'svelte'] },
} as const;
export type Niche = keyof typeof NICHES;

export interface Stop {
  id: string;
  when: string; // big label on the node
  what: string; // small label under it
  seal?: string;
  tags: Niche[];
  cards: Record<string, Branch>;
}

export const GITHUB = 'https://github.com/sandptel';
export const LINKEDIN = 'https://www.linkedin.com/in/sandptel';
export const EMAIL = 'sandppatel15@gmail.com';

export const JOURNEY: Stop[] = [
  {
    id: 'iit', when: '2021', what: 'IIT Kharagpur', seal: 'iitkgp', tags: [],
    cards: {
      iit: {
        type: 'project', seal: 'iitkgp', want: 'L', dates: '2021 — 2026', title: 'Indian Institute of Technology Kharagpur', size: 'm', gist: 'Five-year dual degree, B.Tech and M.Tech, 2021 to 2026.',
        href: 'https://www.iitkgp.ac.in', role: 'Dual degree · B.Tech + M.Tech, five years', figure: 'degree',
        body: 'Five years in Kharagpur. Somewhere in the middle, the Linux habit turned into the actual work.',
      },
    },
  },
  {
    id: 'campus', when: '2022', what: 'first rooms on campus', tags: ['people'],
    cards: {
      ecell: { type: 'leaf', want: 'R', title: 'Entrepreneurship Cell', href: 'https://ecell-iitkgp.org', body: 'Associate member, May — Jul 2022. Talks, case workshops and the startup side of KGP.' },
      unstop: { type: 'leaf', want: 'L', title: 'Unstop · technical writer', href: 'https://unstop.com', body: 'Internship, May — Jul 2023. Writing that explains technical things to people who aren\'t technical yet.' },
      coeamt: { type: 'leaf', want: 'R', title: 'CoE Advanced Manufacturing', href: 'https://coeamt.iitkgp.ac.in', body: 'Research intern, May — Nov 2023, at IIT Kharagpur\'s Centre of Excellence in Advanced Manufacturing Technology.' },
    },
  },
  {
    id: 'rkhall', when: '2023', what: 'GSec Tech · RK Hall', seal: 'rkhall', tags: ['people'],
    cards: {
      rkhall: {
        type: 'project', seal: 'rkhall', want: 'L', dates: 'Aug 2023 — Aug 2024', title: 'General Secretary, Technology', size: 'l', gist: "Ran RK Hall's Technology GC campaign: ten teams, one budget, gold twice.",
        href: 'https://www.rkhall.in', role: 'Radhakrishnan Hall of Residence, IIT Kharagpur',
        body: 'Ran the hall\'s side of the inter-hall Technology [General Championship](#sub:gc): picking captains, building a team for every event, and spending the budget where it would place.',
        figure: 'gc',
        points: [
          'Led **10 teams** across the Tech GC calendar, from quizzes to hardware modelling',
          'Owned the hall\'s technology budget for the year',
          'Personally took first in **Product Design**, **Ad Design** and the **NoBroker case study** (₹25,000), 2023',
        ],
        metrics: [[10, '', 'teams led'], [2, '×', 'GC gold with RK Hall'], [3, '', 'personal firsts']],
        subs: {
          gc: { type: 'define', title: 'General Championship', body: 'IIT Kharagpur\'s year-long inter-hall contest. Technology is one of its four tracks, run with the Technology Students\' Gymkhana.' },
        },
      },
    },
  },
  {
    id: 'gsoc24', when: '2024', what: "GSoC '24 · CCExtractor", seal: 'gsoc', tags: ['nix', 'desktop'],
    cards: {
      gsoc24: {
        type: 'project', seal: 'ccx', want: 'R', dates: 'Jun — Sep 2024', title: 'Regolith, as a NixOS module', size: 'xl', gist: "Regolith's whole desktop, installable with one NixOS option.",
        href: 'https://summerofcode.withgoogle.com/programs/2024/projects/kWEY5sJj', role: 'Google Summer of Code · Open Source Developer',
        body: 'Packaged a whole Debian-based desktop into one NixOS module, built from [nix derivations](#sub:derivation) and fixed up for a system with no [FHS](#sub:fhs).',
        figure: 'nixcollapse',
        points: [
          'Bootable as a Linux ISO or a QEMU VM, from one flake',
          'Imperative cmake → declarative derivations with a closed dependency graph',
          'Hard-coded paths rewritten with sed and patchelf to link only into the nix store',
        ],
        metrics: [[15, '+', 'apps & services'], [18, '+', 'apps cross-built'], [2, '', 'architectures']],
        icons: ['nixos', 'githubactions', 'qemu', 'i3', 'sway'],
        links: [['GSoC project', 'https://summerofcode.withgoogle.com/programs/2024/projects/kWEY5sJj'], ['report', 'https://github.com/sandptel/gsoc24'], ['regolith-nix', 'https://github.com/regolith-lab/regolith-nix']],
        subs: {
          derivation: { type: 'define', title: 'nix derivation', body: 'A sandboxed recipe that builds a package from only its declared inputs. Same inputs, same output, on any machine.' },
          fhs: { type: 'define', title: 'FHS', body: 'The Filesystem Hierarchy Standard: `/usr/bin`, `/etc` and friends. NixOS deliberately doesn\'t follow it, so every hard-coded path had to point into `/nix/store` instead.' },
        },
      },
    },
  },
  {
    id: 'nixwild', when: '2024', what: 'nix, everywhere', seal: 'nixos', tags: ['nix', 'desktop'],
    cards: {
      nixpkgs: {
        type: 'project', seal: 'nixos', want: 'L', dates: 'Oct 2024 — 2025', title: 'nixpkgs & regolith-nix', size: 'm', gist: 'Packages upstream in nixpkgs, and the Nix port of Regolith, maintained.',
        href: 'https://github.com/regolith-lab/regolith-nix', role: 'Contributor · core maintainer of regolith-nix',
        body: 'Derivations upstream in nixpkgs, and maintaining the Nix port of Regolith (1.2k★ upstream) after the summer ended: binary caching, per-app CD, an FHS environment and a VM to test it in.',
        figure: 'prs',
        metrics: [[90, '+', 'merge commits'], [9, '+', 'nixpkgs derivations'], [1.2, 'k★', 'upstream desktop']],
        icons: ['nixos', 'githubactions', 'linux'],
        links: [['regolith-nix', 'https://github.com/regolith-lab/regolith-nix'], ['nixpkgs', 'https://github.com/NixOS/nixpkgs/pulls?q=author%3Asandptel']],
      },
      machine: {
        type: 'project', seal: 'nixos', want: 'R', dates: '2021 — now', title: 'nixos-config: my own machine', size: 'm', gist: 'My laptop, dotfiles and Hyprland rice as one flake, since 2021.',
        href: 'https://github.com/sandptel/nixos-config', role: 'One flake for the system, the dotfiles and the rice',
        body: 'Every machine I use is declared in one repo: system, dotfiles, and a Hyprland + Noctalia setup I built and keep refining since 2021. When my laptop\'s fingerprint sensor had no driver on NixOS, I [packaged one](#sub:elan).',
        figure: 'rice',
        points: [
          'Flakes for everything: per-project devshells, my own packages and NixOS modules',
          'Dotfiles and the whole rice (Hyprland, Noctalia, theming) versioned with the system',
          '{fig:fingerprint} **elanmoc2**: my laptop\'s Elan 04f3:0c00 sensor, read and matched through fprintd, enabled with one line',
        ],
        icons: ['nixos', 'hyprland', 'wayland', 'linux'],
        links: [['nixos-config', 'https://github.com/sandptel/nixos-config'], ['elanmoc2', 'https://github.com/sandptel/elanmoc2'], ['devshells', 'https://github.com/sandptel/devshells']],
        subs: {
          elan: { type: 'define', title: 'elanmoc2', link: 'https://github.com/sandptel/elanmoc2', body: 'NixOS support for the 04f3:0c00 Elan fingerprint sensor, which shipped without a working driver. Packaged as a flake with a module, so turning it on is one line: `services.fprintd.elanmoc2.enable = true;`' },
        },
      },
    },
  },
  {
    id: 'semver', when: '2025', what: 'cargo-semver-checks', seal: 'rust', tags: ['systems'],
    cards: {
      semver: {
        type: 'project', seal: 'rust', want: 'R', dates: 'Mar 2025', title: 'cargo-semver-checks', size: 'm', gist: 'Breaking-change reports that show the code they break.',
        href: 'https://github.com/obi1kenobi/cargo-semver-checks', role: 'Contributor · 1.5k★ Rust semver linter',
        body: 'Added [witness](#sub:witness) hints to lints like `function_parameter_count_changed`, so a breaking-change report shows *why* it breaks. Lints are queries on the [Trustfall](#sub:trustfall) engine.',
        figure: 'semver',
        icons: ['rust', 'githubactions'],
        subs: {
          witness: { type: 'define', title: 'witness', body: 'A short piece of downstream code that compiled against the old version and won\'t against the new one: proof, not a warning.' },
          trustfall: { type: 'define', title: 'Trustfall', link: 'https://github.com/obi1kenobi/trustfall', body: 'A query engine that runs over any data source. cargo-semver-checks uses it to query two versions of a crate\'s API.' },
        },
      },
    },
  },
  {
    id: 'cosmic', when: '2025', what: 'COSMIC upstream', seal: 'popos', tags: ['desktop', 'systems'],
    cards: {
      cosmic: {
        type: 'project', seal: 'popos', want: 'L', dates: 'May — Jun 2025', title: 'COSMIC epoch', size: 's', gist: "Fixes to System76's Rust desktop, before its alpha.",
        href: 'https://github.com/pop-os/cosmic-epoch', role: 'Contributor · System76 / Pop!_OS · 4.4k★',
        body: 'Debugged and patched iced-based applets and settings panels in the pre-alpha desktop.',
        points: ['Fixed the broken `flake.nix` in cosmic-applets', 'Fixed left-Alt behaviour in cosmic-settings when right-Alt is the compose key'],
        icons: ['popos', 'rust', 'iced', 'nixos'],
      },
    },
  },
  {
    id: 'gsoc25', when: '2025', what: "GSoC '25 · CCExtractor", seal: 'gsoc', tags: ['desktop', 'systems'],
    cards: {
      gsoc25: {
        type: 'project', seal: 'ccx', want: 'R', dates: 'Jun — Sep 2025', title: 'Regolith, on COSMIC', size: 'xl', gist: "Regolith's session rebuilt on Rust COSMIC parts, and 40% lighter to start.",
        href: '/writing/regolith-on-cosmic', role: 'Google Summer of Code · Open Source Developer',
        body: 'Replaced Regolith\'s GNOME stack with Rust COSMIC components, then pulled the settings bridge out into a [daemon](#sub:fdpoll) any compositor can use.',
        figure: 'swap',
        points: [
          'Wayland services start only when needed',
          'Live config over IPC for Sway, Hyprland, niri and custom compositors',
          'One reproducible CI that builds, tests and caches the session',
        ],
        metrics: [[8, '+', 'apps re-architected'], [40, '%', 'lighter startup'], [17, '+', 'components in CI']],
        icons: ['rust', 'wayland', 'iced', 'debian', 'sway'],
        links: [['the write-up', '/writing/regolith-on-cosmic'], ['GSoC project', 'https://summerofcode.withgoogle.com/programs/2025/projects/mV0VlVwv'], ['report', 'https://github.com/sandptel/gsoc25']],
        subs: {
          fdpoll: { type: 'define', title: 'fd polling', body: 'Waiting on file descriptors instead of timers: the daemon sleeps until a config file actually changes, then fires the IPC call.' },
        },
      },
    },
  },
  {
    id: 'mecha', when: '2025', what: 'Mecha Systems', seal: 'mecha', tags: ['systems', 'desktop'],
    cards: {
      mecha: {
        type: 'project', seal: 'mecha', want: 'L', dates: 'Jul 2025 — Jan 2026', title: 'Mecha Systems', size: 'l', gist: 'The shell of the Mecha Comet handheld, in Rust from D-Bus down to the GPU.',
        href: 'https://mecha.so', role: 'Rust Developer · Systems Engineer',
        body: 'The shell for the Mecha Comet, an open, modular Linux handheld: system services over [D-Bus](#sub:dbus), GPU-drawn widgets, and [FFI](#sub:ffi) down to the kernel\'s device events.',
        figure: 'dbus',
        points: [
          'freedesktop **notification** and **screenshot** protocols as async-Rust D-Bus server and client libraries',
          'GPU-accelerated shell apps and widgets in wgpu and Bevy ECS for embedded targets',
          '**LocalSend**\'s TCP peer-to-peer file transfer inside a gpui overlay',
          'Raw C++ udev headers through FFI: zero-copy parsing, live USB and I2C state broadcast on D-Bus',
        ],
        metrics: [[9, '+', 'shell apps & widgets'], [2, '', 'D-Bus protocols']],
        icons: ['rust', 'bevy', 'wgpu', 'wayland', 'tokio', 'linux'],
        links: [['mecha.so', 'https://mecha.so'], ['mechanix-gui', 'https://github.com/mecha-org/mechanix-gui']],
        subs: {
          dbus: { type: 'define', title: 'D-Bus', link: 'https://www.freedesktop.org/wiki/Software/dbus/', body: 'The Linux desktop\'s message bus. Apps publish services and signals on it; notifications and screenshots are both just D-Bus interfaces.' },
          ffi: { type: 'define', title: 'FFI', body: 'Foreign function interface: calling C or C++ from Rust. Here, the raw udev headers parsed with zero copies.' },
        },
      },
    },
  },
  {
    id: 'cosmolith', when: '2026', what: 'cosmolith', seal: 'rust', tags: ['desktop', 'systems'],
    cards: {
      cosmolith: {
        type: 'project', seal: 'rust', want: 'R', dates: 'Jan 2026 —', title: 'cosmolith', size: 'm', gist: "One daemon that teaches COSMIC's settings to any compositor.",
        href: 'https://github.com/sandptel/cosmolith', role: 'Rust daemon · COSMIC config → any compositor',
        body: 'Watches COSMIC\'s settings, turns each change into a typed event, and dispatches it to the running compositor\'s IPC. Hyprland first.',
        figure: 'fanout',
        points: ['Watcher → Event → Dispatcher → Compositor traits: a backend only implements the events it supports', 'Compositor detected at start-up; unsupported events are skipped, not errors'],
        icons: ['rust', 'hyprland', 'sway', 'niri'],
      },
    },
  },
  {
    id: 'wado', when: 'now', what: 'wado', seal: 'wayland', tags: ['systems', 'desktop'],
    cards: {
      wado: {
        type: 'project', seal: 'wayland', want: 'L', dates: 'Apr 2026 — now', title: 'wado', size: 'l', gist: 'A Wayland desktop you can drive from a browser, encoded on the GPU.',
        href: 'https://github.com/sandptel/wado', role: 'Headless Wayland compositor · streams over WebRTC',
        body: 'A compositor of its own, built on Smithay, that renders straight into a GPU buffer and streams it to a browser. Input rides a separate data channel back. When hardware can\'t keep up it [steps down a tier](#sub:ladder) instead of failing. Try it:',
        figure: 'wado',
        points: ['Render → DMA-BUF → VA-API → H.264 with no CPU round-trip', 'Mouse, keyboard and touch back over their own low-latency channel', 'Dioxus (WASM) client; per-client output size and frame rate'],
        icons: ['rust', 'wayland', 'ffmpeg', 'webrtc', 'webassembly'],
        subs: {
          ladder: { type: 'define', title: 'fallback ladder', body: 'Each encoder is probed by actually opening it. A runtime failure drops one tier, zero-copy → CPU read-back → software, and the stream keeps going.' },
        },
      },
    },
  },
  {
    id: 'kitetsu', when: 'now', what: 'kitetsu', seal: 'rust', tags: ['systems', 'people'],
    cards: {
      kitetsu: {
        type: 'project', seal: 'rust', want: 'R', dates: 'Jun 2026 —', title: 'kitetsu', size: 'm', gist: 'Speech in, cues out: a voice daemon that never leaves the laptop.',
        href: 'https://github.com/sandptel/kitetsu', role: 'Local voice daemon · on-device speech',
        body: 'A Rust daemon that listens, transcribes on-device and drives small overlay tools. The first is a teleprompter that tells you what to say next.',
        figure: 'kitetsu',
        points: ['Moonshine on ONNX by default; Whisper and a REST backend behind feature flags', 'One CLI grammar for the daemon and `kitetsu-ctl`; tools theme from a base16 palette'],
        icons: ['rust', 'onnx', 'wayland'],
      },
    },
  },
  {
    id: 'pubre', when: 'now', what: 'pubre', seal: 'svelte', tags: ['people'],
    cards: {
      pubre: {
        type: 'project', seal: 'svelte', want: 'L', dates: 'Oct 2026', title: 'pubre', size: 'm', gist: 'An EPUB reader that reads along with you, fully offline.',
        href: 'https://sandptel.github.io/pubre/', role: 'An EPUB reader that reads with you',
        body: 'A word-by-word reading guide, character lenses and cast portraits. Everything runs in the browser, offline; books never leave the device.',
        figure: 'pubre',
        points: ['Pace follows punctuation and rhythm; nine pointer styles', 'Lenses colour characters, voice quotes and define rare words on-device'],
        icons: ['svelte', 'typescript', 'webassembly'],
        links: [['open pubre', 'https://sandptel.github.io/pubre/'], ['source', 'https://github.com/sandptel/pubre']],
      },
    },
  },
  {
    id: 'side', when: 'side', what: 'small branches', tags: ['desktop', 'nix', 'people'],
    cards: {
      cwal: { type: 'leaf', want: 'R', title: 'cosmic-wal', stars: 7, icons: ['popos'], href: 'https://github.com/sandptel/cosmic-wal', body: 'pywal and wallust colours → your COSMIC theme.' },
      shimeji: { type: 'leaf', want: 'L', title: 'shimeji-nix', icons: ['nixos'], href: 'https://github.com/sandptel/shimeji-nix', body: 'The Shimeji desktop mascot, packaged with a NixOS module.' },
      wbook: { type: 'leaf', want: 'R', title: 'wayland-book-rs', icons: ['wayland'], href: 'https://github.com/sandptel/wayland-book-rs', body: 'The Wayland Book\'s C examples, rewritten in Rust.' },
      lox: { type: 'leaf', want: 'L', title: 'lox-interpreter-rust', icons: ['rust'], href: 'https://github.com/sandptel/lox-interpreter-rust', body: 'Crafting Interpreters\' Lox, in Rust, plus a Pratt parser on the side.' },
    },
  },
];

// which stops a niche lights up, for the counts on the filter chips
export const nicheCount = (n: Niche) => JOURNEY.filter(s => s.tags.includes(n)).length;
