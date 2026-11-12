---
title: Packaging Regolith for NixOS
date: 2024-09-01
summary: My first Google Summer of Code. Fifteen Regolith packages as Nix derivations, and a session that boots from a flake.
dateline: Google Summer of Code · June to September 2024
repo: https://github.com/sandptel/gsoc24
project: https://summerofcode.withgoogle.com/programs/2024/projects/kWEY5sJj
glance:
  - [project, "[Create Nix derivations for Regolith Linux](https://summerofcode.withgoogle.com/programs/2024/projects/kWEY5sJj)"]
  - [organisation, "[CCExtractor](https://ccextractor.org)"]
  - [mentor, "[Soumya Ranjan Patnaik](https://github.com/SoumyaRanjanPatnaik)"]
  - [outcome, "15 packages, a bootable Wayland session, per-app flakes"]
  - [code, "[regolith-lab/regolith-nix](https://github.com/regolith-lab/regolith-nix)"]
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
  pkgs:
    type: figure
    figure: pkgs
    wide: true
    body: The fifteen, and what each one does.
  current:
    type: define
    title: /run/current-system/sw
    body: Where NixOS links every package your config asks for, so `$PATH` has one place to look. Each entry is a link into `/nix/store`.
  flake:
    type: define
    seal: nixos
    title: flake
    body: A `flake.nix` at the root of a repo. It pins every input to an exact version and exposes outputs, like packages, NixOS modules and dev shells, that others can use by URL.
  cache:
    type: define
    title: binary cache
    body: A server that holds store paths someone already built. Nix downloads from it instead of compiling, as long as the inputs match exactly.
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

## The goal

My first Google Summer of Code, with CCExtractor, was about getting [Regolith](#b:regolith) onto [NixOS](#b:nixos). Regolith is a tiling desktop made for Ubuntu and Debian: i3 or Sway for the windows, with GNOME's parts underneath for settings. NixOS describes the whole system in one config file.

The two don't fit together on their own. Regolith ships as Debian packages that expect to live in `/usr` and `/etc`, and NixOS installs nothing there. So the project was to rebuild Regolith out of Nix's own building blocks, until someone on NixOS could get the full desktop with one option:

```nix
wayland.regolith.enable = true;
```

## How Nix builds things

Everything in Nix starts as a [derivation](#b:derivation): a recipe that says what to build, from which sources, with which dependencies, and how. Nix runs it in a sandbox that can only see what the recipe declares, which is why the result comes out the same on any machine.

The output doesn't go to `/usr/bin`. It lands in its own folder in the Nix store, and NixOS links the packages you've asked for into [`/run/current-system/sw`](#b:current). Packaging something for NixOS mostly means writing that recipe, and making sure the program still finds everything once it lives at a path like that.

## Fifteen packages

By the end of the summer I had derivations for [fifteen parts](#b:pkgs) of Regolith. Ten of them are programs you can run, including the session itself, Regolith's Sway build, the [launcher](#b:ilia) and its input, display and power daemons:

- `regolith-session`, `sway-regolith`, `trawld`, `ilia`, `remontoire`
- `i3xrocks`, `xrescat`, `regolith-displayd`, `regolith-inputd`, `regolith-powerd`

The other five don't come down to one program you run: a library, the default look, the configs that tie the session together, and the notification daemon, which ships several:

- `libtrawldb`, `regolith-look-default`, `regolith-wm-config`
- `regolith-sway-root-config`, `rofication`

## The hard part: paths

Regolith expects a [normal filesystem layout](#b:fhs). Its scripts call programs at `/usr/bin/…`, its configs sit in `/etc/regolith`, and pieces of it find each other by those fixed locations. On NixOS none of those paths exist.

A lot of the summer went into finding those paths, one package at a time, and pointing them at the Nix store instead. Most fixes were a line or two each. Finding them was the slow part, because a missed path usually doesn't fail the build, it fails later when the session starts.

## Trying it

The Wayland session [boots](#b:session) from the flake. On NixOS that takes three steps: turn on flakes, add the repo as an input, and import its module.

```nix
nix.settings.experimental-features = [ "nix-command" "flakes" ];
```

```nix
inputs.regolith.url = "github:sandptel/regolith-nix";
# and in nixosSystem's modules:
inputs.regolith.nixosModules.regolith
```

After a rebuild, `regolith-session-wayland` starts the desktop.

Every package is also its own [flake](#b:flake), so you can [try one by itself](#b:nixrun), on NixOS or on any other distro once Nix is installed. If you want all fifteen at once, `nix develop github:sandptel/regolith-nix` drops you into a shell that has them.

## What I didn't finish

The goal was a [full module](#b:module), where each part of the desktop is an option you can swap. This is the shape I was aiming for:

```nix
wayland.regolith = {
  enable = true;
  launcher = pkgs.ilia;
  notification-manager = pkgs.rofication;
  color-scheme = "gruvbox-dark";
  gdm.enable = true;
};
```

By the end of GSoC the packages and the session worked, but those options were still to come.

## After GSoC

That module is what the repo has grown into since. It moved to the regolith-lab organisation, picked up [binary caching](#b:cache) so nobody has to compile everything, got separate builds per app, and gained a VM to test the whole desktop in. I've [kept maintaining it](#b:after).
