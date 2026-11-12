import { defineConfig } from 'astro/config';
import dedupeIcons from './scripts/dedupe-icons.mjs';

export default defineConfig({
  // GitHub Pages project site: https://sandptel.github.io/site/
  // every internal link goes through withBase() (src/lib/ui.ts), so moving to a root/custom domain is just these two lines
  site: 'https://sandptel.github.io',
  base: '/site',
  // the first paint needs no second request: CSS ships inside the HTML
  build: { inlineStylesheets: 'always' },
  // internal pages are fetched the moment a pointer or thumb lands on a link
  integrations: [dedupeIcons()],
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // code blocks take their colours from the page's base16 theme (--astro-code-* in global.css)
  markdown: { shikiConfig: { theme: 'css-variables' } },
});
