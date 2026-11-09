# site

Personal semi-portfolio site. Astro, static output, no UI framework.

- Devshell: `../nix/flake.nix` (loaded by direnv from `../.envrc`)
- `npm run dev` · `npm run build` (→ `dist/`) · `npm run check`
- Content: `src/content/{projects,writing}/*.md`, schema in `src/content.config.ts`. `draft: true` hides an entry.
- Pages: `src/pages/`, shared shell `src/layouts/Base.astro`, styles `src/styles/global.css`
