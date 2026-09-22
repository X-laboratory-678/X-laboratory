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

The current X-Laboratory mark is based on a 16-cell visual grid:

- the geometric X represents the laboratory name and cross-disciplinary work;
- four terminal cells suggest connected research systems and data flow;
- the central gold node represents energy exchange and coordination;
- teal and deep blue-green preserve the previous site mark's visual continuity.

Use the standalone mark at `static/brand/x-laboratory-mark.svg` or the full
wordmark at `static/brand/x-laboratory-logo.svg`. The favicon uses the same
mark so the site identity stays consistent across the header and browser tabs.
