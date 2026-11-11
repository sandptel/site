# site

Personal semi-portfolio site. Astro, static output, no UI framework.

- Devshell: `../nix/flake.nix` (loaded by direnv from `../.envrc`)
- `npm run dev` · `npm run build` (→ `dist/`) · `npm run check`
- Content: `src/content/{projects,writing}/*.md`, schema in `src/content.config.ts`. `draft: true` hides an entry.
- Pages: `src/pages/`, shared shell `src/layouts/Base.astro`, styles `src/styles/global.css`

## Performance rules (checked by `npm run perf`; keep it green)
- Animate only `transform`, `opacity`, `clip-path` (or `stroke-dashoffset` on small SVG). `perf` fails on @keyframes that animate width/height/top/left/margin/padding/max-*.
- Looping figure animations go inside a `.fig`: it sleeps (animation paused) off screen via IntersectionObserver in `site.js`.
- No per-frame layout reads. In `branches.js`, positions come from `measure()` (cached doc offsets, refreshed by a ResizeObserver); write SVG attributes with `A(el, k, v)` (writes only on change); settled cards skip all writes.
- No scroll listeners that read `scrollY` or touch the DOM: use IntersectionObserver, or the existing frame loop.
- Don't set custom properties on `:root` per frame (restyles the whole page); scope them to the element that uses them.
- Repeated icons are deduped into `<symbol>`s at build (`scripts/dedupe-icons.mjs`); keep using `icon()`.
- Fonts are self-hosted in `src/assets/fonts` (only Newsreader is preloaded). CSS is inlined; below-the-fold sections use `content-visibility: auto`.
