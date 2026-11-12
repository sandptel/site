---
title: Swapping GNOME out of Regolith for COSMIC
date: 2025-09-15
summary: My second Google Summer of Code. Regolith's GNOME parts replaced with COSMIC ones, and a settings app that talks to Sway.
dateline: Google Summer of Code · June to September 2025
repo: https://github.com/sandptel/gsoc25
project: https://summerofcode.withgoogle.com/programs/2025/projects/mV0VlVwv
glance:
  - [project, "[Build a COSMIC based Wayland session for Regolith](https://summerofcode.withgoogle.com/programs/2025/projects/mV0VlVwv)"]
  - [organisation, "[CCExtractor](https://ccextractor.org)"]
  - [mentor, "[Soumya Ranjan Patnaik](https://github.com/SoumyaRanjanPatnaik)"]
  - [outcome, "GNOME settings replaced by a cosmic-settings fork; session runs COSMIC beside Sway"]
  - [code, "[cosmic-settings fork](https://github.com/sandptel/cosmic-settings) · [wm-config #56](https://github.com/regolith-linux/regolith-wm-config/pull/56) · [session #54](https://github.com/regolith-linux/regolith-session/pull/54)"]
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

## Why move off GNOME

[Regolith](#b:regolith) pairs a tiling window manager, Sway or i3, with parts of GNOME for settings and system management. It works, but the GNOME half brings [Mutter](#b:mutter) and its own [Wayland](#b:wayland) protocols along, and those don't sit well with [wlroots](#b:wlroots) compositors like Sway.

[COSMIC](#b:cosmic), System76's desktop written in Rust, is built from small separate pieces: a settings app, a background service, a panel, a launcher, each usable on its own. So for my second GSoC, again with CCExtractor and again mentored by Soumya, the plan was to swap Regolith's GNOME parts for COSMIC ones and keep everything else.

## Settings

The biggest piece was settings. Regolith ran `gnome-control-center` for the window you click around in, plus three small daemons, `regolith-inputd`, `regolith-powerd` and `regolith-displayd`, to carry those changes over to Sway. I forked cosmic-settings to [replace all four](#b:swap). Here are [the old one and the new one](#b:compare) side by side.

The catch is that cosmic-settings was written to talk to COSMIC's own compositor, not to Sway. Every page I wanted to keep had to learn to send its change somewhere else.

## Two ways to reach Sway

I tried [two ways](#b:methods) of getting a change from the settings app into Sway, and built enough of each to compare them.

The first, which I kept, changes the settings app itself. Each change is sent to Sway over [IPC](#b:ipc), so it applies straight away. It's also written to a [generated config](#b:genconf) file that Sway loads every time it starts, so it survives a restart. If two settings clash, Sway reports it like any other config error.

The second leaves the settings app alone and runs a background daemon instead. The daemon watches COSMIC's config files in `~/.config/cosmic/`, and when one changes it sends the matching command to Sway.

| | generated config | background daemon |
|---|---|---|
| Regolith can change the pages | yes, it's our fork | no, only what COSMIC ships |
| applies changes | instantly, over IPC | instantly, over IPC |
| after a restart | Sway reads the files itself | the daemon replays every setting |
| needs a process running | no | yes, all the time |

For one compositor, the files won. Here it is [working](#b:demo): change the key repeat delay, and a new file shows up in that folder with the new value.

## The rest of the session

Settings weren't the only GNOME parts. The rest of the session [moved over](#b:replaced) the same way, one component at a time: `swaybg` became `cosmic-bg` (which follows the wallpaper set in the settings app), `swayidle` became `cosmic-idle`, Nautilus became COSMIC Files, the desktop portal became COSMIC's, and logging out goes through `systemctl` and `loginctl` instead of `gnome-session-quit`.

The [session script](#b:session) needed only one real change. Instead of starting Sway directly, it starts `cosmic-session`, which brings up COSMIC's services and then Sway with Regolith's config. Everything else still starts from that config, as before.

```sh
exec /usr/bin/dbus-run-session -- cosmic-session sway -c "$SWAY_CONFIG_FILE"
```

Across the summer that came to eight session apps reworked and roughly 40% less pulled in at startup.

## Trying it

Getting there on Ubuntu or Debian takes four steps:

1. Add the COSMIC packages from the OpenSUSE Build Service, which has Debian builds.
2. Install the COSMIC components, all except `cosmic-settings`.
3. Build the fork instead: clone [sandptel/cosmic-settings](https://github.com/sandptel/cosmic-settings) and run `just install`.
4. Use the `cosmic` branches of `regolith-wm-config` and `regolith-session`.

Then start the session:

```sh
cosmic-session sway --config /etc/regolith/sway/config
```

The [report](https://github.com/sandptel/gsoc25) has the exact commands.

## Where it stands

It isn't finished. COSMIC itself wasn't stable yet, so I'd call this a working beta. Display, input, power and appearance work, shortcuts are partial, workspaces are still on the list, and I've only tested on Ubuntu. [Here's where it stood](#b:checklist). [~](#b:mood-moving)

The next steps are the missing pages (workspaces, keyboard shortcuts, and Regolith's own pages for startup apps, window rules and default apps), testing on Debian, and a beta release. There's also an optional, more COSMIC version to try, with COSMIC's launcher, panel, dock and applets in place of Regolith's.

I also sent two small fixes upstream, to [cosmic-settings](https://github.com/pop-os/cosmic-settings/pull/1227) and [cosmic-applets](https://github.com/pop-os/cosmic-applets/pull/948).

## Looking back

The daemon approach lost during GSoC, because for a single compositor a file Sway already reads is simpler than a process that has to stay alive.

Once I wanted the same settings to work on Hyprland and niri too, a daemon was the right shape after all. That became [cosmolith](#b:fanout). [~](#b:mood-clicked)

## Further reading

- [cosmic-epoch](https://github.com/pop-os/cosmic-epoch), all of COSMIC in one place
- [SwaySettings](https://github.com/ErikReider/SwaySettings), a settings app built for Sway
- [cosmic-ext-extra-sessions](https://github.com/Drakulix/cosmic-ext-extra-sessions/tree/main/sway), COSMIC alongside other compositors
