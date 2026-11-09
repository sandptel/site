---
title: Swapping GNOME out of Regolith for COSMIC
date: 2025-09-15
summary: My second Google Summer of Code. Rebuilding a tiling desktop's session on Rust components, and the daemon that fell out of it.
dateline: GSoC 2025 · CCExtractor · mentor Soumya Ranjan Patnaik
branches:
  regolith:
    type: define
    title: Regolith
    body: Ubuntu-based desktop. i3/Sway tiling plus GNOME's system parts.
    link: https://regolith-desktop.com
  mutter:
    type: define
    title: Mutter
    body: GNOME's compositor and window manager. Regolith pulled it in only to get GNOME's settings working.
  wayland:
    type: define
    title: Wayland
    body: The protocol between apps and the display server. On Wayland the [compositor](#sub:compositor) *is* the display server.
    subs:
      compositor:
        type: define
        title: compositor
        body: The program that draws every window to the screen and routes input to them. Sway, Mutter, Hyprland and cosmic-comp are all compositors.
  wlroots:
    type: define
    title: wlroots
    body: A library of compositor building blocks. Sway is built on it, Mutter isn't, which is why GNOME-specific protocols don't carry over.
  cosmic:
    type: figure
    figure: cosmic
    wide: true
    body: System76's Rust desktop, built with the iced GUI toolkit. Drawn here in this page's own base16 theme, the way COSMIC would theme itself.
  mood-longest:
    type: mood
    tone: hard
    body: the part that took the longest
  ipc:
    type: diagram
    title: IPC
    wide: true
    steps:
      - { label: cosmic-settings, note: fork }
      - { label: swayipc-rs }
      - { label: "[socket](#sub:socket)", note: $SWAYSOCK }
      - { label: sway, note: applies }
    cmd: input type:touchpad pointer_accel 0.4
    subs:
      socket:
        type: define
        title: socket
        body: A file-like endpoint two processes use to talk. Sway listens on `$SWAYSOCK`.
  genconf:
    type: aside
    title: ~/.config/regolith3/sway/cosmic-settings/generated-config.d/*
    body: Loaded by Sway on start, so a change made in the settings app survives a restart.
  daemon:
    type: define
    title: daemon
    body: A background program with no window. It starts with the session and just listens.
  fanout:
    type: figure
    figure: fanout
    wide: true
    body: One event, many dialects. cosmolith speaks each compositor's IPC.
  mood-clicked:
    type: mood
    tone: good
    body: "the moment it clicked: one translation layer, any compositor."
---

[Regolith](#b:regolith) is a productivity-focused desktop that pairs tiling window managers, Sway and i3, with GNOME parts for settings and system management. That hybrid works, but GNOME's dependencies, the [Mutter](#b:mutter) compositor and its custom [Wayland](#b:wayland) protocols, make it hard to keep things modular, especially on [wlroots](#b:wlroots)-based compositors like Sway.

[COSMIC](#b:cosmic), System76's new desktop written in Rust, is modular by design. So the project for my second Google Summer of Code was to rebuild Regolith's session on COSMIC components: keep the tiling feel, drop the GNOME baggage.

The biggest piece was settings. Regolith ran four things to manage input, display and power: `gnome-control-center` plus `regolith-inputd`, `regolith-powerd` and `regolith-displayd`. I forked cosmic-settings to replace all four. [~](#b:mood-longest)

Every time you change a setting, the fork sends the matching Sway command over [IPC](#b:ipc) (via swayipc-rs), so it applies instantly. It also writes the setting to a [generated config](#b:genconf) file, so it survives a restart. If two settings conflict, Sway reports it.

Across the summer that meant re-architecting eight COSMIC session apps and activating Wayland services only when they're needed, which cut the session's startup dependency weight by about 40%. Seventeen core components now build, test and cache through one reproducible CI pipeline.

Afterwards I pulled that bridge out into its own [daemon](#b:daemon), cosmolith, which watches COSMIC's config and translates every change into whatever IPC language the running [compositor speaks](#b:fanout). [~](#b:mood-clicked)
