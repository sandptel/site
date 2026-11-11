import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages project site: https://sandptel.github.io/site/
  // every internal link goes through withBase() (src/lib/ui.ts), so moving to a root/custom domain is just these two lines
  site: 'https://sandptel.github.io',
  base: '/site',
});
