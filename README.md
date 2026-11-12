# Coker Demilade Daniel: Curiosity. Code. Creation.

Personal portfolio, live at https://dan-unplugged1.github.io

Built with Astro, Three.js and GSAP. It is a single static page.

## Editing

- All the words are in `src/content/story.ts`.
- Project screenshots are in `public/projects/`.
- Colours and type are the tokens at the top of `src/styles/global.css`.

## Running it locally

```
npm install
npm run dev
```

## Publishing

Push to `main`. GitHub Actions builds the site and publishes it to GitHub Pages
(see `.github/workflows/deploy.yml`).

The 3D letter font is Helvetiker from the three.js examples; its licence is in `src/assets/helvetiker-LICENSE.txt`.
