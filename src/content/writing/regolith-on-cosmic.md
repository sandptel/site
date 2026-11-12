---
title: Swapping GNOME out of Regolith for COSMIC
date: 2025-09-15
summary: My second Google Summer of Code. Regolith's GNOME parts replaced with COSMIC ones, and a settings app that talks to Sway.
dateline: GSoC 2025 · CCExtractor · mentor Soumya Ranjan Patnaik
repo: https://github.com/sandptel/gsoc25
marks: [gnome, popos]
branches:
  regolith:
    type: figure
    figure: regolith
    wide: true
    body: Stock Regolith. i3 or Sway does the tiling, GNOME does the settings.
  mutter:
    type: define
    title: Mutter
    body: GNOME's compositor and window manager. Regolith pulled it in only to get GNOME's settings working.
  wayland:
    type: define
    seal: wayland
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
    body: A library of compositor building blocks. Sway is built on it and Mutter isn't, which is why GNOME-specific protocols don't carry over.
  cosmic:
    type: figure
    figure: cosmic
    wide: true
    body: System76's Rust desktop, built with the iced GUI toolkit. Drawn here in this page's own base16 theme, the way COSMIC would theme itself.
  swap:
    type: figure
    figure: swap
    wide: true
    body: Four GNOME-era pieces out, one fork in.
  compare:
    type: figure
    figure: compare
    wide: true
    body: Drag across. Left is GNOME Settings in stock Regolith, right is the fork running on Sway.
  methods:
    type: figure
    figure: methods
    wide: true
    body: Both apply a change through swayipc. Where they differ is how a setting survives a restart.
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
    type: figure
    figure: genconf
    body: Sway includes this folder from its main config. The file is the one written in the recording below.
  demo:
    type: figure
    figure: demo
    wide: true
    body: The fork on Sway. Change a setting, and the file manager on the left picks up the new file.
  replaced:
    type: figure
    figure: replaced
    body: Mostly a few lines each in regolith-wm-config ([#56](https://github.com/regolith-linux/regolith-wm-config/pull/56)).
  session:
    type: diagram
    title: session
    steps:
      - { label: regolith-session }
      - { label: dbus-run-session }
      - { label: cosmic-session }
      - { label: sway, note: starts the rest }
    cmd: exec dbus-run-session -- cosmic-session sway -c "$SWAY_CONFIG_FILE"
  checklist:
    type: figure
    figure: checklist
    body: As it stood in the final report.
  mood-moving:
    type: mood
    tone: hard
    body: building on something that kept moving.
  fanout:
    type: figure
    figure: fanout
    wide: true
    body: One event, many dialects. cosmolith speaks each compositor's IPC.
  mood-clicked:
    type: mood
    tone: good
    body: same idea, better timing.
---

[Regolith](#b:regolith) pairs a tiling window manager, Sway or i3, with parts of GNOME for settings and system management. It works, but the GNOME half brings [Mutter](#b:mutter) and its own [Wayland](#b:wayland) protocols along, and those don't sit well with [wlroots](#b:wlroots) compositors like Sway.

[COSMIC](#b:cosmic), System76's desktop written in Rust, is built from small separate pieces. So for my second GSoC, again with CCExtractor and again mentored by Soumya, the plan was to swap Regolith's GNOME parts for COSMIC ones and keep everything else.

The biggest piece was settings. Regolith ran `gnome-control-center` plus three small daemons for input, display and power. I forked cosmic-settings to [replace all four](#b:swap). Here are [the old one and the new one](#b:compare) side by side.

I tried [two ways](#b:methods) of getting a change from the settings app into Sway. The one I kept sends each change to Sway over [IPC](#b:ipc), so it applies straight away, and also writes it to a [generated config](#b:genconf) file that Sway loads on start, so it survives a restart. If two settings clash, Sway reports it like any other config error.

Here it is [working](#b:demo): change the key repeat delay and a new file shows up in that folder.

The rest of the session [moved over](#b:replaced) the same way, one component at a time, and the [session script](#b:session) now starts `cosmic-session` next to Sway. Across the summer that came to eight session apps reworked and roughly 40% less pulled in at startup.

It isn't finished. COSMIC itself wasn't stable yet, so I'd call this a working beta. Display, input, power and appearance work, shortcuts are partial, workspaces are still on the list, and I've only tested on Ubuntu. [Here's where it stood](#b:checklist). [~](#b:mood-moving)

I also sent two small fixes upstream, to [cosmic-settings](https://github.com/pop-os/cosmic-settings/pull/1227) and [cosmic-applets](https://github.com/pop-os/cosmic-applets/pull/948).

One thing I like looking back: the daemon approach lost during GSoC, because for a single compositor a file Sway already reads is simpler than a process that has to stay alive. Once I wanted the same settings to work on Hyprland and niri too, a daemon was the right shape after all. That became [cosmolith](#b:fanout). [~](#b:mood-clicked)
