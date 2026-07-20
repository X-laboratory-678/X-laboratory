# X-Laboratory Website

## Project Overview

This repository contains the source for the official website of **X-Laboratory** at Shanghai University of Electric Power. The reserved `example.invalid` production base URL stands in for the future approved GitHub Pages or custom-domain URL.

The project prioritizes long-term content maintenance, performance, accessibility, and static deployment without a database or backend server.

## Architecture

```text
Markdown / YAML content
          ↓
         Hugo
          ↓
      Static site
          ↓
    GitHub Pages
```

The primary content entities will use Markdown Page Bundles. Custom Hugo layouts will render the content without a third-party full theme.

## Technology

- Hugo Extended
- Custom Hugo layouts
- Markdown Page Bundles
- YAML for controlled shared data
- Native CSS
- Minimal native JavaScript ES Modules
- GitHub Actions
- GitHub Pages

No Node.js or npm toolchain is assumed.

## Repository Status

Current phase: **Milestone 9 — GitHub Actions deployment preparation completed; first deployment pending an authorized GitHub repository**.

The repository now contains a professional shared shell, a responsive bilingual homepage, and production-ready People, Research, Publications, Projects, News, and Join Us sections. It also provides reciprocal language metadata, canonical and Open Graph metadata, factual JSON-LD, sitemap/robots/RSS output, bilingual 404 handling, an automated generated-site audit, and a GitHub Pages artifact workflow. The workflow has not run because no authorized GitHub remote is configured. Search is not implemented.

The People section now provides a production-quality, content-driven directory; localized category grouping; reusable member cards and portrait fallbacks; stable Alumni handling; formal person profiles; and reverse aggregation of related Publication and Project bundles.

The Publications section provides five verified representative papers, year grouping, accessible year/type/research-area filters, bilingual detail pages, DOI and BibTeX access, lab-author links, homepage selection, and reverse aggregation on the PI profile.

The Research and Projects sections provide three formal research areas, three verified projects, build-time cross-content aggregation, and bilingual directory/detail routes. The News system publishes only source-backed, day-precise updates and feeds the homepage automatically. Join Us provides research-fit guidance, People-resolved PI contact, and a stable official university admissions link without claiming laboratory openings, quotas, or funding.

> **Fixture note:** Example Student, Example Alumnus, Publication, Project, and News bundles remain development-only fixtures with `draft: true`; production output contains only reviewed real content.

## Project Identity

- Laboratory: X-Laboratory
- Institution: Shanghai University of Electric Power / 上海电力大学
- Unit: Division of Electrical Engineering / 电气工程学部
- Principal Investigator: Jiangjiao Xu / 许江蛟

The PI profile is sourced from the university's official faculty page. Provenance and review information are recorded in `docs/content-sources.md`. Other People, Publication, Project, and News records whose names begin with “Example” or “示例” remain development fixtures and must not be presented as real X-Laboratory activity.

## Prerequisites

- Git
- Hugo Extended `0.164.0`, matching `.hugo-version` exactly

The pinned Hugo version is the single source of truth for local development and future GitHub Actions. Version upgrades must be deliberate, tested in a focused change, and applied to local and CI instructions together. Milestone 1 installs the pinned Extended build at user level; the Hugo executable is not stored in this repository.

Confirm the installed edition and version before development:

```bash
hugo version
```

The output must include both `v0.164.0` and `extended`.

## Local Development

Start the local development server with:

```bash
hugo server
```

To include draft content during content work, use `hugo server -D`. Draft bundles are excluded from production builds.

## Build

Run a production build with:

```bash
hugo --minify --environment production
```

The generated site is written to `public/`. Generated output and `resources/_gen/` are ignored and must not be committed. The production configuration uses the reserved `https://example.invalid/lab-site/` URL with a subpath; future CI must override `baseURL` with the actual GitHub Pages or custom-domain URL. This reserved URL is an intentional configuration placeholder and is exempt from the visible-content placeholder check.

Run the complete production verification with:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
python scripts/audit-site.py public
```

## Content Architecture

The implemented authoritative content model is:

```text
People       → Hugo Leaf Page Bundles
Publications → Hugo Leaf Page Bundles
Projects     → Hugo Leaf Page Bundles
News         → Hugo Leaf Page Bundles
```

Each primary entity combines YAML Front Matter, a Markdown body, and related bundle resources where needed. Hugo validates required fields, controlled values, duplicate IDs, translation consistency, resources, and cross-content references at build time. See `docs/content-models.md`.

## Multilingual

The planned URL convention is:

```text
English: /
Chinese: /zh/
```

The Hugo language keys are `en` and `zh`, because the key determines the public URL prefix. Document locales are exactly `en` and `zh-CN`. English builds at `/`, Simplified Chinese at `/zh/`, and the generated `/en/` page is only Hugo's redirect alias to the English root.

Every indexable translated page emits a self-referential canonical plus reciprocal `en` and `zh-CN` alternates. Open Graph and JSON-LD metadata are generated server-side from page data; templates do not hard-code the deployment domain. The current favicon is an original provisional site mark, not an approved laboratory or university logo.

## Shared UI

The shared visual system is implemented with native CSS design tokens and focused component styles. It provides containers, spacing primitives, buttons, section headers, editorial lists, cards, responsive navigation, language switching, and a restrained footer. Production builds concatenate, minify, and fingerprint one site stylesheet.

The only site JavaScript is `assets/js/navigation.js`, a small ES module that progressively enhances the mobile navigation. Without JavaScript, the navigation remains visible and may wrap; after JavaScript initializes, it becomes a collapsible menu with `aria-expanded`, Escape-key closing, and focus return.

## Homepage Aggregation

Homepage copy lives in the language-specific home page front matter. Business entities are never duplicated there. The homepage dynamically reads:

- featured projects from `content/projects/`
- selected publications from `content/publications/`
- latest news from `content/news/`
- current PI and faculty previews from `content/people/`
- ordered Research Page Bundles backed by `data/research_areas.yaml`

Empty business collections are omitted from the public homepage rather than showing development-oriented empty messages.

## Deployment

The deployment flow in `.github/workflows/pages.yml` is:

```text
git push
→ read and install the Hugo Extended version from .hugo-version
→ obtain the repository or custom-domain URL from GitHub Pages
→ strict Hugo production build using that base URL
→ python scripts/audit-site.py public
→ upload the public/ Pages artifact
→ deploy to the github-pages environment
```

The workflow runs on pushes to `main` and manual dispatch. It uses no Node/npm site build and never commits `public/`. Build or audit failure prevents deployment. No remote repository, custom domain, or live Pages deployment is currently configured, so there is no deployment URL to publish here.

After an authorized repository is connected, an administrator must confirm **Settings → Pages → Source → GitHub Actions**. The workflow then derives either a Project Pages subpath URL or a configured custom-domain URL from `actions/configure-pages`; do not replace this with a guessed URL or hard-code a domain in Hugo templates.

## Project Milestones

0. Architecture and repository rules
1. Hugo foundation
2. Content models
3. Shared UI and homepage
4. People
5. Publications
6. Research and Projects
7. News and Join Us
8. Multilingual, SEO, and site quality
9. GitHub Actions and deployment
10. Testing, polish, and handover

## Contribution

Read [CONTRIBUTING.md](CONTRIBUTING.md) before changing content or code. Architecture decisions are recorded in [docs/architecture.md](docs/architecture.md). Before any public launch or domain change, complete [docs/launch-checklist.md](docs/launch-checklist.md).
