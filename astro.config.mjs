import { defineConfig } from 'astro/config';

// Static site: `npm run build` writes plain HTML/CSS/JS to dist/, ready for any web host.
// Hosted on GitHub Pages at the address below (see .github/workflows/deploy.yml).
export default defineConfig({
  site: 'https://dan-unplugged1.github.io',
  devToolbar: { enabled: false },
});
