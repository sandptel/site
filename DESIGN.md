# DESIGN.md: sandptel — personal site

## Brief
Who: Sandeep Patel (sandptel), Rust / Nix / Wayland systems dev, 2× GSoC (CCExtractor: Regolith on NixOS 2024, Regolith on COSMIC 2025). Readers: recruiters, OSS maintainers, curious devs, mostly desktop, some phone.
Job: read a post or the journey and *get it*, even the jargon, without leaving the page.
Primary: scroll and read; branch off into an overlay when a word is unfamiliar, then come back.
Success: readers open branches and finish the post; they remember the branching.
Feel: minimal and calm. The main text stays quiet and the branches are where the play happens.
Signature: **branching on scroll**, a bidirectional tree. Overlays grow off the reading line and explain terms, show an image or diagram, or hint at a mood. They can nest (a branch can have its own branch).
Assumed (the demos test these): the branch metaphor (sidenotes, organic tree, git graph) · light vs dark · whether branches open on scroll or on click · how deep nesting goes.

## Concept
Marginalia that grows: a quiet paper page (A) where hairline roots grow from marked words as you scroll (B) and land on typed panels (define, an animated diagram, an image, mood). The journey continues the same tree. Small, quiet details carry the bio "Can't perceive directions": a compass that never settles, the bio set on a drifting baseline, a wandering line, "this way, probably".
Reference demo: scratchpad variant-merged.html → https://claude.ai/artifact/YGKSMzbQ66pikdPUhpPfws

## Tokens
Color (light = A paper; dark = B soil): paper #F4F3EE · card #FBFAF6 · ink #1E1D1A · graphite #6B6860 · quill #2F4B8F (branches, links) · rule #D6D3C8 · mood wash #B9A67A at low alpha · nested branches = quill at half opacity
Dark (A's): #15161A · panel #1B1C21 · ink #E4E1D8 · muted #9C988E · rule #34363C · quill #9FB3E6
Type: Newsreader 300 (display: name, titles) / Newsreader (body, 19px/1.8) / Young Serif (panel terms, journey years) / Fragment Mono (labels, code)
Motion: branches drawn by scroll in both directions · cards settle with ease-out cubic-bezier(.2,0,0,1), no overshoot, no sway · ease-out .2s for hover · everything fully drawn under reduced motion

## Decisions
<!-- date · feature · verdict · why -->
2026-11-10 · theming · base16 is the colour source of truth; every colour on the site is a semantic role (bg panel sunk fg muted faint rule accent nest live warn danger ember cyan) derived from the 16 slots and nudged to clear AA · "use base16 as theming… make sure all the colors fit"
2026-11-10 · theme switch · one pill that splits on hover into a mode half and a scheme half; the theme change is revealed as a circle spreading from the click (View Transitions) · user spec
2026-11-10 · motion · keep the UI minimal and put the flashy motion in the panels and small details (figures, count-ups, compass heading, logo tilt) · "flashy in the animations and the details instead of the whole page content"
2026-11-10 · logos · org marks (IIT KGP, CCExtractor, Regolith, Mecha, Pop!_OS) keep their colours on white seal tiles; tech marks (Simple Icons, CC0) are drawn in currentColor so they follow the theme
2026-11-10 · journey cards · progressive disclosure: compact by default (seal, dates, linked title, role, one-line gist, numbers); unfold on hover-intent (260ms rest, ignored while scrolling) or "details"; nested branches unfold with the card and neighbours glide down · "content looks overwhelming when scrolling"
2026-11-10 · journey cards (revised) · compact is not minimal: header, gist, figure, two key-point tiles and numbers (about the length of the first prototype); the fold row hints what's inside (+points · terms · links); cards are sized by interest: GSoC xl, Mecha/wado/RK Hall l, most m, small contributions s · "too sleek… size them by how much they grab the eye"
2026-11-10 · layout · "Places" logo wall moved to the end of the home page; hero carries GitHub / LinkedIn / email · user request
2026-11-10 · titles · every card title links to its repo/org with a sliding arrow · "links embedded in the branches headers"
2026-11-10 · nixos-config card · compact shows the rice alone (two Hyprland workspaces + a literal rice-bowl sticker, "riced since 2021"); the fingerprint moved beside the elanmoc2 point and animates only when the card is open (points can lead with `{fig:name}`) · "fingerprint in the same rice animation is not a good idea"
2026-11-10 · motion pass · direction-aware: the compass points south/north with your scroll (the bio's "can't perceive directions", answered); scrolling back up folds cards below you toward their branch (rewind); cards carry slight inertia; nodes stay dim until the trunk reaches them; card contents cascade in on landing; post paragraphs soften away from the eye line
2026-11-10 · fast scroll · no overlays on top of the UI (user rejected a fly-past toast and a floating year panel): a bead rides the trunk mid-screen carrying the year (odometer roll), fixed to the viewport so it never lags, passing *under* nodes so it never flickers; a fast run that ends near a key stop eases it into place once · "creative yet fitting the ui, not built on top of it"
2026-11-10 · now-reading capsule · centred, fixed width (no jumping): compass, the stop's seal, name + one-line gist (or "¶ n of N · branch words" on posts), explored count, and a progress track along its bottom edge; swaps animate only at reading pace
2026-11-10 · curiosity hooks · the hero word "branch" demonstrates itself once; the hero compass points at the cursor ("heading: you"); an explored meter counts what the reader opened; j/k/x/t/d/g/? keys; idle nudge on the hero; a coda with "rewind the tree"
2026-11-10 · placeholder copy to confirm: IIT card line, kitetsu teleprompter cue, semver example, pubre "238 wpm" readout
2026-11-09 · concept · A Marginalia: keep its look (paper ground, quiet type, small hero) · "the simplicity & background theme"
2026-11-09 · concept · B Living tree: keep the branching engine, the typed panels (define card, animated IPC diagram, mood), the journey tree and the compass/bio touches · "these small touches make it super cool"
2026-11-09 · concept · C git graph: discard (not picked)
2026-11-09 · concept · merge = B's engine and panels in A's palette and scale
2026-11-09 · formal pass · use A's colours in both themes (B's soil is dropped), no grain or sway, 2px square panels, straight runs along the lines, gentle curves only, no spring overshoot · "more formal and minimal, reduce the curviness"

## Tasks
- [x] Concept round: 3 variants of the branching reader
- [x] Port the merged demo into Astro: branches in post frontmatter, `[word](#b:id)` in the text
- [x] base16 theming (8 light/dark families, contrast-checked roles) via scripts/themes.py
- [x] Journey from the resume + GitHub, with animated figures per stop
- [ ] Replace placeholder voice lines (see Decisions 2026-11-10)
- [ ] Self-host fonts; set `site` in astro.config.mjs; RSS

## Phone
- Same tree, tuned for a thumb: cards land as they rise past ~80% of the screen (desktop waits for 80% then eases), the trunk keeps pace.
- Hero terms open as a bottom sheet (tap elsewhere or pull it down to close); one tap fires enter/focus/click, so only the click decides on touch.
- Niche filters are one swipeable row; the places wall is three seals across; footer carries the nav when the top nav hides (≤460px).
- No hover on touch: presses answer instead (scale/tint), copy that says "hover" or "press ?" is swapped or hidden, and Android gets a 6ms tick on deliberate taps.

## Rendering budget (2026-11)
- Measured on a 390px phone at 4x CPU, full scroll: layouts ~1000 → ~325, forced layouts mostly gone, style ~0.3ms/frame real-device, HTML 361KB → 234KB (62KB gzip), first paint ~280ms.
- Compass needles are separate composited SVG layers; the "now" LED glow breathes with opacity/scale; header blur is off on touch screens.
- Photo flips: an early turn at ~1.4s, then 5s, 10s, 15s, then every 20s; only while the bio is on screen and nobody is reading/hovering it. The text box eases to the height of the side showing.
- Guardrail: `npm run perf` (budgets in `scripts/perf.mjs`).

## Posts (2026-11)
- On desktop, a post's margin cards show only while their paragraph is being read: they open as the word passes ~60% of the screen and fold once the paragraph has scrolled near the top. Clicking a word opens its card early (it still folds with its paragraph). Cards dodge only the cards open at the same time, so each sits level with its word. Journey cards and phone (inline) cards stay open once grown.
- Posts are split into numbered `##` sections; the reading bar shows the current section. Header: report repo + GSoC project page, an at-a-glance list (`glance` in frontmatter), and a contents line.
