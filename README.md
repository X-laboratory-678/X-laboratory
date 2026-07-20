# X-Laboratory Website

Official website source for **X-Laboratory** at Shanghai University of Electric Power / 上海电力大学.

- Live site: <https://x-laboratory-678.github.io/X-laboratory/>
- Repository: <https://github.com/X-laboratory-678/X-laboratory>
- Production branch: `main`
- Status: Milestone 10 — Testing, Polish & Handover completed

The site is a bilingual, content-driven Hugo website deployed automatically to GitHub Project Pages. It has no database, backend server, CMS, or Node frontend toolchain.

## Technology

- Hugo Extended `0.164.0`, pinned in `.hugo-version`
- Custom Hugo layouts
- Markdown Leaf Page Bundles
- YAML controlled vocabularies
- Native CSS
- Minimal native JavaScript ES Modules
- GitHub Actions and GitHub Pages

English is published at `/`; Simplified Chinese is published at `/zh/`. The live Project Pages base path is `/X-laboratory/`, and templates derive it dynamically rather than hard-coding it.

## Content Architecture

```text
content/people/        People profiles
content/research/      Research area pages
content/publications/  Publication records and BibTeX
content/projects/      Project records
content/news/          Source-backed News
content/join/          Join Us guidance
content/contact/       Contact and location page copy
data/                  Controlled IDs, labels, categories, and ordering
i18n/                  Shared interface translations
```

People, Publications, Projects, Research, and News are authoritative in their Page Bundles. Stable IDs—not display names—connect related content. Homepage and related-content summaries are generated from these sources. Public email, phone, and laboratory address have one source of truth under `params.contact` in `config/_default/params.yaml`; the PI's People email remains the institutional address.

Draft Example bundles remain development fixtures for validation and are excluded from production. Factual provenance is recorded in `docs/content-sources.md`.

## Prerequisites

- Git
- Hugo Extended matching `.hugo-version` exactly
- Python 3 for the zero-dependency generated-site audit

Verify Hugo before development:

```bash
hugo version
```

The output must contain `v0.164.0` and `extended`.

## Local Development

Preview production content:

```bash
hugo server
```

Include draft fixtures or new draft content:

```bash
hugo server -D
```

## Strict Build and Audit

Run both quality gates after content, template, CSS, JavaScript, configuration, or deployment changes:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
python scripts/audit-site.py public
```

The strict build must have zero warnings, and the audit must report zero critical errors. Generated `public/` and `resources/_gen/` output must not be committed.

The local production configuration intentionally uses a reserved `example.invalid` base URL. GitHub Actions replaces it with the URL supplied by GitHub Pages; do not hard-code the live domain or repository path in layouts or content.

## Deployment

The supported deployment flow is:

```text
push or merge to main
→ GitHub Actions installs the pinned Hugo Extended release
→ strict production build with the Pages-provided base URL
→ scripts/audit-site.py
→ Pages artifact upload
→ automatic GitHub Pages deployment
```

Do not create a `gh-pages` branch or manually upload `public/`. The current site has no custom domain or `CNAME`.

## Documentation

- [Routine maintenance](docs/maintenance.md)
- [Project handover](docs/handover.md)
- [Contribution guide](CONTRIBUTING.md)
- [Content models](docs/content-models.md)
- [Content provenance](docs/content-sources.md)
- [Architecture decisions](docs/architecture.md)
- [Launch and domain-change checklist](docs/launch-checklist.md)

The current favicon is an original provisional mark, not an approved official X-Laboratory or university logo. See the handover document for known limitations and optional future work.
