# Project Agent Rules

## Project Purpose

This repository contains the official website for a university research laboratory. The site must be professional, modern, high-performance, and maintainable over many years. It must not require a complex backend, and laboratory members without frontend experience must be able to maintain routine content.

## Technology Stack

Use:

- Hugo Extended, pinned to the version in `.hugo-version`
- Custom Hugo layouts
- Markdown Page Bundles
- YAML data only where appropriate
- Native CSS
- Native JavaScript ES Modules
- GitHub Actions
- GitHub Pages

Do not introduce the following without an explicit requirement and an approved architecture decision:

- React, Vue, Next.js, or Angular
- jQuery
- Bootstrap or Tailwind
- A Node-based frontend build pipeline
- A database
- A backend framework or application server
- A third-party full Hugo theme

## Architecture Rules

- Separate content from presentation logic.
- Do not hard-code People, Publications, Projects, or News entries in HTML templates.
- Home page summaries must be generated from their authoritative content sources.
- Do not maintain duplicate copies of the same content.
- Use stable slugs or IDs for every internal relationship.
- Never use a display name or mutable title as a relationship key.
- Keep each change within its stated milestone and avoid speculative implementation.

## Hugo Rules

- Prefer Hugo's native content, template, asset, taxonomy, and multilingual features.
- Use Page Bundles for content-related images, documents, and other resources.
- Use Partials for reusable template components.
- Do not prematurely extract the site into an independent Hugo theme.
- Generate internal URLs with Hugo URL and page reference helpers.
- Never hard-code a deployment base path.
- Templates must work when deployed under a GitHub Project Pages subpath.

## Content Rules

People, Publications, Projects, and News primarily use:

```text
Hugo Leaf Page Bundle
+ YAML Front Matter
+ Markdown body
```

Use `data/` only for:

- Categories
- Controlled vocabularies
- Global metadata
- Ordering configuration

Do not place all people, publications, projects, or news in a single large YAML file.

## Frontend Rules

- Use semantic HTML.
- Design mobile-first.
- Apply progressive enhancement.
- Keep JavaScript minimal.
- Core content must remain readable when JavaScript is unavailable.
- Support accessible keyboard navigation and visible focus states.
- Respect `prefers-reduced-motion`.
- Output correct image dimensions and responsive image variants where appropriate.

## CSS Rules

- Define design values with CSS Custom Properties and design tokens.
- Use Grid and Flexbox for layout.
- Avoid extensive absolute positioning.
- Do not use `!important` without a documented, exceptional reason.
- Do not duplicate component styles.
- Do not add a third-party CSS framework without an approved architecture decision.

## JavaScript Rules

JavaScript is allowed only for focused progressive enhancement, including:

- Mobile navigation
- Content filters
- BibTeX interactions
- Optional search

Use small, isolated ES Modules. Do not add a global framework. Core content and navigation must remain accessible when JavaScript is disabled.

## Multilingual Rules

- English is the default language at `/`.
- Simplified Chinese is published at `/zh/`.
- Hugo language keys are `en` and `zh`; document locales are exactly `en` and `zh-CN`.
- Keep slugs stable across languages where practical.
- Keep `translationKey` values stable.
- Place reusable interface text in `i18n/` when multilingual implementation begins.
- Do not scatter hard-coded English interface labels through templates.

## Accessibility Rules

- Use semantic landmarks.
- Provide a skip link.
- Make all interactive features keyboard accessible.
- Preserve visible focus indicators.
- Give controls explicit labels.
- Give meaningful images useful alt text and decorative images empty alt text.
- Maintain sufficient color contrast.
- Respect reduced-motion preferences.
- Never use color as the only way to communicate information.

## SEO Rules

The implementation must support:

- Unique page titles
- Meta descriptions
- Canonical URLs
- `hreflang` links
- Open Graph metadata
- Sitemap generation
- RSS feeds
- Appropriate JSON-LD structured data

SEO metadata must be generated from Hugo page data. Canonical URLs, alternate-language URLs, and structured-data URLs must never hard-code a deployment domain or Project Pages base path. Structured data must omit unknown fields instead of inventing them.

## Dependency Policy

> Every dependency must justify its maintenance cost.

Do not add a dependency for a problem that Hugo, native CSS, or native JavaScript can reasonably solve. Record the reason and maintenance impact before adding a new dependency.

## Build Rules

At the end of every implementation task:

1. Inspect all changed files.
2. Run appropriate formatting and validation.
3. After Hugo becomes available, run a production build.
4. Do not leave a known build-breaking state.
5. Report warnings and errors.
6. Never silently ignore a failed command or check.

## Git Rules

- `main` is the default branch.
- Keep each milestone in a focused commit or pull request where practical.
- Do not commit `public/` or `resources/_gen/`.
- Do not commit operating-system temporary files.
- Do not commit secrets, tokens, credentials, or private personal data.
- Do not force-push.
- Do not push automatically unless the user explicitly asks.
- Avoid unrelated formatting changes in focused work.

## Definition of Done

A future milestone is complete only when:

- All in-scope work is complete.
- No out-of-scope feature was implemented implicitly.
- The production build succeeds once a Hugo site exists.
- No known obvious error remains.
- Relevant documentation is updated.
- Accessibility has no obvious regression.
- Basic mobile and desktop checks are complete when UI exists.
- The Git diff has been reviewed.
