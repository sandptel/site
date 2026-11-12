---
title: Packaging Regolith for NixOS
date: 2024-09-01
summary: My first Google Summer of Code. Fifteen Regolith packages as Nix derivations, and a session that boots from a flake.
dateline: GSoC 2024 · CCExtractor
repo: https://github.com/sandptel/gsoc24
marks: [regolith, nixos]
branches:
  regolith:
    type: figure
    figure: regolith
    wide: true
    body: A keyboard-first desktop, with i3 or Sway for tiling and GNOME underneath for settings. The keybinding list on the right is remontoire, one of the fifteen packages.
  nixos:
    type: define
    seal: nixos
    title: NixOS
    link: https://nixos.org
    body: A Linux distribution built with Nix. Packages, services and settings all live in one config file, and rebuilding it gives you the same system every time.
  derivation:
    type: figure
    figure: derivation
    body: Nix's build recipe. It only sees what it declares, so the same inputs give the same output in the [store](#sub:store) on any machine.
    subs:
      store:
        type: define
        title: Nix store
        body: "`/nix/store`, where every build lands in its own folder, named by a hash of its inputs. Nothing gets installed to `/usr`."
  ilia:
    type: figure
    figure: ilia
    body: Regolith's app launcher, and one of the fifteen.
  fhs:
    type: figure
    figure: fhs
    body: Debian follows the [FHS](#sub:fhsdef) and NixOS doesn't. Most of the fixes looked like this.
    subs:
      fhsdef:
        type: define
        title: FHS
        body: The Filesystem Hierarchy Standard, the usual Linux layout of `/usr/bin`, `/etc` and so on.
  mood-paths:
    type: mood
    tone: hard
    body: grep -r /usr/bin, again.
  session:
    type: diagram
    title: boot
    steps:
      - { label: flake.nix, note: inputs.regolith }
      - { label: nixosModules.regolith }
      - { label: regolith-session-wayland }
      - { label: sway, note: Regolith's build }
    cmd: $ regolith-session-wayland
  nixrun:
    type: figure
    figure: nixrun
    body: "The launcher from earlier, straight from GitHub. `nix develop github:sandptel/regolith-nix` gives you a shell with all fifteen."
  module:
    type: figure
    figure: nixcollapse
    wide: true
    body: The plan was the whole pile behind one option, with each part swappable.
  after:
    type: figure
    figure: prs
    wide: true
    body: Some of what came after, in regolith-nix and upstream in nixpkgs.
---

My first Google Summer of Code, with CCExtractor, was about getting [Regolith](#b:regolith) onto [NixOS](#b:nixos). Regolith is a tiling desktop made for Ubuntu and Debian. NixOS describes the whole system in one config file. The goal was for someone on NixOS to get the full desktop with one option:

```nix
wayland.regolith.enable = true;
```

To get there, every piece of Regolith had to become a [derivation](#b:derivation). By the end of the summer I had fifteen of them: the session scripts, Regolith's Sway build, the [launcher](#b:ilia), the notification daemon, the input, display and power daemons, and a few packages that are only config files.

Most of the friction came from paths. Regolith expects a [normal filesystem layout](#b:fhs), with binaries in `/usr/bin` and configs in `/etc/regolith`, and NixOS doesn't have one. A lot of the summer went into finding those paths and pointing them at the Nix store instead. [~](#b:mood-paths)

The Wayland session [boots](#b:session) from the flake. Every package is also its own flake, so you can [try one by itself](#b:nixrun), on NixOS or on any distro with Nix installed.

What I didn't finish that summer was the [full module](#b:module), where every part (launcher, notifications, colour scheme, GDM) is an option you can swap. That's what the repo has grown into since. It moved to the regolith-lab organisation, and I've [kept maintaining it](#b:after).
