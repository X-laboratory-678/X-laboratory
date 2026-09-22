# Logo designer and X-Laboratory brand mark

## Deployment

The upstream pixel-grid editor is kept as an isolated tool at
`tools/logo-designer/`. It is a standalone React/Vite application and is not
bundled into the Hugo site. This keeps the laboratory website within its
native Hugo, CSS, and ES-module architecture while giving maintainers a local
editor for future logo iterations.

From `tools/logo-designer/`:

```text
npm install
npm run dev
```

The production build is generated with `npm run build`, and the upstream
project already includes a GitHub Pages workflow in
`tools/logo-designer/.github/workflows/deploy.yml`.

## Current logo

The current X-Laboratory mark follows the compact academic-lab layout used in
the reference direction while remaining original:

- the blue square and white linework provide a clear mark at small sizes;
- the cyan hexagonal cell suggests a scientific laboratory and a connected
  system;
- the bold white uppercase X makes the laboratory name immediately legible;
- the central node represents the shared research core, while the four
  terminals suggest connected data, energy, and learning systems;
- the `XLab` wordmark and two-line descriptor make the research scope legible
  in institutional applications.

Use the standalone mark at `static/brand/x-laboratory-mark.svg` or the full
wordmark at `static/brand/x-laboratory-logo.svg`. The site header and favicon
use the same mark so the identity stays consistent across the page and browser
tabs.
