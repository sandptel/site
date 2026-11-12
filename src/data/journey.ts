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

// Copy style, after Jon Gjengset's CV: one plain line per thing, ordinary verbs,
// numbers only where they carry weight, jargon only when it can't be avoided (and then it branches).
export const JOURNEY: Stop[] = [
  {
    id: 'iit', when: '2021', what: 'IIT Kharagpur', seal: 'iitkgp', tags: [],
    cards: {
      iit: {
        type: 'project', seal: 'iitkgp', want: 'L', size: 'm', dates: '2021 — 2026', title: 'IIT Kharagpur',
        href: 'https://www.iitkgp.ac.in', role: 'B.Tech + M.Tech, dual degree', figure: 'degree',
        gist: 'Five-year dual degree.',
        body: 'Most of the work below started here, as side projects next to coursework.',
      },
    },
  },
  {
    id: 'campus', when: '2022', what: 'first roles on campus', tags: ['people'],
    cards: {
      ecell: { type: 'leaf', want: 'R', title: 'Entrepreneurship Cell', href: 'https://ecell-iitkgp.org', body: 'Associate member, 2022.' },
      unstop: { type: 'leaf', want: 'L', title: 'Unstop · technical writer', href: 'https://unstop.com', body: 'Wrote technical articles for students, 2023.' },
      coeamt: { type: 'leaf', want: 'R', title: 'CoE Advanced Manufacturing', href: 'https://coeamt.iitkgp.ac.in', body: 'Research intern at IIT Kharagpur, 2023.' },
    },
  },
  {
    id: 'rkhall', when: '2023', what: 'GSec Tech · RK Hall', seal: 'rkhall', tags: ['people'],
    cards: {
      rkhall: {
        type: 'project', seal: 'rkhall', want: 'L', size: 'l', dates: 'Aug 2023 — Aug 2024', title: 'General Secretary, Technology',
        href: 'https://www.rkhall.in', role: 'Radhakrishnan Hall of Residence',
        gist: 'Ran the hall\'s technology teams for a year.',
        body: 'Chose captains, put together a team for each inter-hall [technology event](#sub:gc), and managed the budget.',
        figure: 'gc',
        points: [
          'Led 10 teams across the year\'s events',
          'The hall won the General Championship gold twice in my time there',
          'First place in Product Design, Ad Design and a case study competition, 2023',
        ],
        metrics: [[10, '', 'teams'], [2, '×', 'GC gold']],
        subs: {
          gc: { type: 'define', title: 'General Championship', body: 'IIT Kharagpur\'s year-long contest between halls. Technology is one of its tracks.' },
        },
      },
    },
  },
  {
    id: 'gsoc24', when: '2024', what: "GSoC '24 · CCExtractor", seal: 'gsoc', tags: ['nix', 'desktop'],
    cards: {
      gsoc24: {
        type: 'project', seal: 'ccx', want: 'R', size: 'xl', dates: 'Jun — Sep 2024', title: 'Regolith, on NixOS',
        href: '/writing/regolith-on-nixos', role: 'Google Summer of Code · CCExtractor',
        gist: 'Packaged a full Linux desktop so it installs with one line.',
        body: 'Turned Regolith, a Debian desktop, into a NixOS module built from [nix derivations](#sub:derivation), with every path fixed for a system that has no [FHS](#sub:fhs).',
        figure: 'nixcollapse',
        points: [
          'Boots as a live ISO or a virtual machine',
          'CI builds every package for x86 and ARM and caches the results',
        ],
        metrics: [[15, '+', 'packages'], [2, '', 'architectures']],
        icons: ['nixos', 'githubactions', 'qemu', 'i3', 'sway'],
        links: [['the write-up', '/writing/regolith-on-nixos'], ['GSoC project', 'https://summerofcode.withgoogle.com/programs/2024/projects/kWEY5sJj'], ['report', 'https://github.com/sandptel/gsoc24'], ['regolith-nix', 'https://github.com/regolith-lab/regolith-nix']],
        subs: {
          derivation: { type: 'define', title: 'nix derivation', body: 'A recipe that builds a package from only its declared inputs, so it comes out the same on any machine.' },
          fhs: { type: 'define', title: 'FHS', body: 'The usual Linux layout: `/usr/bin`, `/etc` and so on. NixOS doesn\'t use it, so hard-coded paths have to point into `/nix/store` instead.' },
        },
      },
    },
  },
  {
    id: 'nixwild', when: '2024', what: 'nix, everywhere', seal: 'nixos', tags: ['nix', 'desktop'],
    cards: {
      nixpkgs: {
        type: 'project', seal: 'nixos', want: 'L', size: 'm', dates: 'Oct 2024 — 2025', title: 'nixpkgs & regolith-nix',
        href: 'https://github.com/regolith-lab/regolith-nix', role: 'Contributor · maintainer of regolith-nix',
        gist: 'Maintain Regolith\'s Nix port and contribute packages to NixOS.',
        body: 'Kept the port working after the summer: binary caching, separate builds per app, and a VM to test it in.',
        figure: 'prs',
        metrics: [[90, '+', 'merged commits'], [9, '+', 'nixpkgs packages']],
        icons: ['nixos', 'githubactions', 'linux'],
        links: [['regolith-nix', 'https://github.com/regolith-lab/regolith-nix'], ['nixpkgs', 'https://github.com/NixOS/nixpkgs/pulls?q=author%3Asandptel']],
      },
      machine: {
        type: 'project', seal: 'nixos', want: 'R', size: 'm', dates: '2021 — now', title: 'nixos-config',
        href: 'https://github.com/sandptel/nixos-config', role: 'My own machines',
        gist: 'My system, dotfiles and desktop, in one repository since 2021.',
        body: 'Everything is declared in Nix, including a Hyprland and Noctalia desktop I keep refining. When my laptop\'s fingerprint sensor had no Linux driver, I [packaged one](#sub:elan).',
        figure: 'rice',
        points: [
          'Development environments and personal packages as Nix flakes',
          '{fig:fingerprint} elanmoc2: the laptop\'s fingerprint sensor, working on NixOS with one line of config',
        ],
        icons: ['nixos', 'hyprland', 'wayland', 'linux'],
        links: [['nixos-config', 'https://github.com/sandptel/nixos-config'], ['elanmoc2', 'https://github.com/sandptel/elanmoc2'], ['devshells', 'https://github.com/sandptel/devshells']],
        subs: {
          elan: { type: 'define', title: 'elanmoc2', link: 'https://github.com/sandptel/elanmoc2', body: 'NixOS support for the Elan 04f3:0c00 fingerprint sensor. Enabled with `services.fprintd.elanmoc2.enable = true;`' },
        },
      },
    },
  },
  {
    id: 'semver', when: '2025', what: 'cargo-semver-checks', seal: 'rust', tags: ['systems'],
    cards: {
      semver: {
        type: 'project', seal: 'rust', want: 'R', size: 'm', dates: 'Mar 2025', title: 'cargo-semver-checks',
        href: 'https://github.com/obi1kenobi/cargo-semver-checks', role: 'Contributor',
        gist: 'Made breaking-change reports show the code that breaks.',
        body: 'Added [witness](#sub:witness) hints to a Rust linter that catches breaking changes before a release. Its checks run on the [Trustfall](#sub:trustfall) query engine.',
        figure: 'semver',
        icons: ['rust', 'githubactions'],
        subs: {
          witness: { type: 'define', title: 'witness', body: 'A short example of code that worked with the old version and fails with the new one.' },
          trustfall: { type: 'define', title: 'Trustfall', link: 'https://github.com/obi1kenobi/trustfall', body: 'A query engine that can run over any data, here two versions of a library\'s API.' },
        },
      },
    },
  },
  {
    id: 'cosmic', when: '2025', what: 'COSMIC', seal: 'popos', tags: ['desktop', 'systems'],
    cards: {
      cosmic: {
        type: 'project', seal: 'popos', want: 'L', size: 's', dates: 'May — Jun 2025', title: 'COSMIC',
        href: 'https://github.com/pop-os/cosmic-epoch', role: 'Contributor · System76',
        gist: 'Fixes for System76\'s new Rust desktop, during its alpha.',
        body: 'Bugs I ran into while building Regolith\'s COSMIC session, fixed upstream.',
        points: ['Repaired the Nix build for cosmic-applets', 'Fixed a left-Alt keyboard bug in cosmic-settings'],
        icons: ['popos', 'rust', 'iced', 'nixos'],
      },
    },
  },
  {
    id: 'gsoc25', when: '2025', what: "GSoC '25 · CCExtractor", seal: 'gsoc', tags: ['desktop', 'systems'],
    cards: {
      gsoc25: {
        type: 'project', seal: 'ccx', want: 'R', size: 'xl', dates: 'Jun — Sep 2025', title: 'Regolith, on COSMIC',
        href: '/writing/regolith-on-cosmic', role: 'Google Summer of Code · CCExtractor',
        gist: 'Moved Regolith off GNOME and onto COSMIC.',
        body: 'Replaced Regolith\'s GNOME parts with Rust components from COSMIC, including a fork of cosmic-settings that drives Sway over [IPC](#sub:ipc).',
        figure: 'swap',
        points: [
          'Settings apply instantly and survive a restart',
          'Display, input, power and appearance settings working on Sway',
          'One CI pipeline builds, tests and caches the session',
        ],
        metrics: [[8, '+', 'apps reworked'], [40, '%', 'lighter start-up']],
        icons: ['rust', 'wayland', 'iced', 'debian', 'sway'],
        links: [['the write-up', '/writing/regolith-on-cosmic'], ['GSoC project', 'https://summerofcode.withgoogle.com/programs/2025/projects/mV0VlVwv'], ['report', 'https://github.com/sandptel/gsoc25']],
        subs: {
          ipc: { type: 'define', title: 'IPC', body: 'Inter-process communication. Sway listens on a socket, and anything that speaks its protocol can change its settings live.' },
        },
      },
    },
  },
  {
    id: 'mecha', when: '2025', what: 'Mecha Systems', seal: 'mecha', tags: ['systems', 'desktop'],
    cards: {
      mecha: {
        type: 'project', seal: 'mecha', want: 'L', size: 'l', dates: 'Jul 2025 — Jan 2026', title: 'Mecha Systems',
        href: 'https://mecha.so', role: 'Rust developer',
        gist: 'Built system apps for the Comet, an open Linux handheld.',
        body: 'Notifications, screenshots, file sharing and hardware events for the Comet\'s shell, in Rust, talking over [D-Bus](#sub:dbus) and reaching the kernel through [FFI](#sub:ffi).',
        figure: 'dbus',
        points: [
          'Notification and screenshot services on D-Bus',
          'GPU-drawn shell widgets with wgpu and Bevy',
          'LocalSend file sharing built into the shell',
          'Live USB and I2C status, straight from the kernel',
        ],
        metrics: [[9, '+', 'apps & widgets']],
        icons: ['rust', 'bevy', 'wgpu', 'wayland', 'tokio', 'linux'],
        links: [['mecha.so', 'https://mecha.so'], ['mechanix-gui', 'https://github.com/mecha-org/mechanix-gui']],
        subs: {
          dbus: { type: 'define', title: 'D-Bus', link: 'https://www.freedesktop.org/wiki/Software/dbus/', body: 'The message bus Linux desktop apps use to talk to each other.' },
          ffi: { type: 'define', title: 'FFI', body: 'Calling C or C++ code from Rust. Here, the kernel\'s device-event library.' },
        },
      },
    },
  },
  {
    id: 'cosmolith', when: '2026', what: 'cosmolith', seal: 'rust', tags: ['desktop', 'systems'],
    cards: {
      cosmolith: {
        type: 'project', seal: 'rust', want: 'R', size: 'm', dates: 'Jan 2026 —', title: 'cosmolith',
        href: 'https://github.com/sandptel/cosmolith', role: 'Rust daemon',
        gist: 'Lets COSMIC\'s settings control any compositor.',
        body: 'Change a setting in COSMIC and it is applied to Hyprland, Sway or niri straight away.',
        figure: 'fanout',
        points: ['Each compositor implements only what it supports; the rest is skipped'],
        icons: ['rust', 'hyprland', 'sway', 'niri'],
      },
    },
  },
  {
    id: 'wado', when: 'now', what: 'wado', seal: 'wayland', tags: ['systems', 'desktop'],
    cards: {
      wado: {
        type: 'project', seal: 'wayland', want: 'L', size: 'l', dates: 'Apr 2026 — now', title: 'wado',
        href: 'https://github.com/sandptel/wado', role: 'Wayland compositor',
        gist: 'A Linux desktop you can use from a browser.',
        body: 'Renders on the GPU and streams to a browser over WebRTC; mouse, keyboard and touch travel back the other way. When the hardware can\'t keep up it [falls back](#sub:ladder) a step instead of stopping. Try it:',
        figure: 'wado',
        points: ['Video stays on the GPU from render to encode', 'Input has its own low-latency channel'],
        icons: ['rust', 'wayland', 'ffmpeg', 'webrtc', 'webassembly'],
        subs: {
          ladder: { type: 'define', title: 'fallback', body: 'If an encoder fails, wado drops to the next one (GPU, then GPU with a CPU copy, then software) and the stream carries on.' },
        },
      },
    },
  },
  {
    id: 'kitetsu', when: 'now', what: 'kitetsu', seal: 'rust', tags: ['systems', 'people'],
    cards: {
      kitetsu: {
        type: 'project', seal: 'rust', want: 'R', size: 'm', dates: 'Jun 2026 —', title: 'kitetsu',
        href: 'https://github.com/sandptel/kitetsu', role: 'Voice daemon',
        gist: 'Speech recognition that runs on the laptop, not a server.',
        body: 'Listens, transcribes locally and drives small tools. The first is a teleprompter that shows what to say next.',
        figure: 'kitetsu',
        points: ['Runs Moonshine on ONNX; Whisper is optional'],
        icons: ['rust', 'onnx', 'wayland'],
      },
    },
  },
  {
    id: 'pubre', when: 'now', what: 'pubre', seal: 'svelte', tags: ['people'],
    cards: {
      pubre: {
        type: 'project', seal: 'svelte', want: 'L', size: 'm', dates: 'Oct 2026', title: 'pubre',
        href: 'https://sandptel.github.io/pubre/', role: 'E-book reader',
        gist: 'An e-book reader that guides your eyes as you read.',
        body: 'Highlights one word at a time, colours characters and quotes, and keeps everything in the browser, offline.',
        figure: 'pubre',
        points: ['Reading pace follows punctuation', 'No account, no server'],
        icons: ['svelte', 'typescript', 'webassembly'],
        links: [['open pubre', 'https://sandptel.github.io/pubre/'], ['source', 'https://github.com/sandptel/pubre']],
      },
    },
  },
  {
    id: 'side', when: 'side', what: 'small projects', tags: ['desktop', 'nix', 'people'],
    cards: {
      cwal: { type: 'leaf', want: 'R', title: 'cosmic-wal', stars: 7, icons: ['popos'], href: 'https://github.com/sandptel/cosmic-wal', body: 'Applies pywal colours to the COSMIC theme.' },
      shimeji: { type: 'leaf', want: 'L', title: 'shimeji-nix', icons: ['nixos'], href: 'https://github.com/sandptel/shimeji-nix', body: 'The Shimeji desktop mascot, packaged for NixOS.' },
      wbook: { type: 'leaf', want: 'R', title: 'wayland-book-rs', icons: ['wayland'], href: 'https://github.com/sandptel/wayland-book-rs', body: 'The Wayland Book\'s examples, rewritten in Rust.' },
      lox: { type: 'leaf', want: 'L', title: 'lox-interpreter-rust', icons: ['rust'], href: 'https://github.com/sandptel/lox-interpreter-rust', body: 'An interpreter for the Lox language, in Rust.' },
    },
  },
];

// which stops a niche lights up, for the counts on the filter chips
export const nicheCount = (n: Niche) => JOURNEY.filter(s => s.tags.includes(n)).length;
