# X-Laboratory Website

Official website source for **X-Laboratory** at Shanghai University of Electric Power / 上海电力大学.

- Live site: <https://x-laboratory-678.github.io/X-laboratory/>
- Repository: <https://github.com/X-laboratory-678/X-laboratory>
- Production branch: `main`
- Status: Pages CMS remains the live `/admin/` editor while the visual Worker CMS is piloted. Do not switch editors until the pilot, protected preview, and deployment checks pass.

The public site is a bilingual, content-driven Hugo website deployed automatically to GitHub Project Pages. The visual CMS is a separate Cloudflare Worker with D1-backed accounts and audit records; it edits the existing Markdown and YAML source in Git and does not change the public site's Hugo architecture.

## Technology

- Hugo Extended `0.164.0`, pinned in `.hugo-version`
- Custom Hugo layouts
- Markdown Leaf Page Bundles
- YAML controlled vocabularies
- Native CSS
- Minimal native JavaScript ES Modules
- GitHub Actions and GitHub Pages
- Cloudflare Worker and D1 for the visual editor only

English is published at `/`; Simplified Chinese is published at `/zh/`. The live Project Pages base path is `/X-laboratory/`, and templates derive it dynamically rather than hard-coding it.

Public content uses documentation-style route groups:

```text
/docs/home/members/          People
/docs/home/news/             News
/docs/home/join-us/          Join Us
/docs/home/contact/          Contact
/docs/research/              Research
/docs/research/publications/ Publications
/docs/research/projects/     Projects
```

Chinese routes use the same stable ASCII paths below `/zh/`. Legacy top-level routes remain redirect aliases.

## Content Architecture

```text
content/people/        People profiles
content/research/      Research area pages
content/publications/  Publication records and BibTeX
content/projects/      Project records
content/news/          Source-backed News
content/grants/        Verified research funding records
content/opportunities/ Confirmed laboratory-specific opportunities
content/join/          Join Us guidance
content/contact/       Contact and location page copy
data/                  Controlled IDs, labels, categories, and ordering
i18n/                  Shared interface translations
```

The content repository includes ten collections, bilingual page bundles, controlled vocabularies, and shared site settings. During the pilot, Pages CMS remains the current `/admin/` editor. The visual CMS adds click-to-edit previews, personal editor accounts, draft branches, and a recoverable trash area; it is intended to replace routine editing only after protected previews and publish checks pass. Stable IDs, page bundle paths, translation keys, and relationships remain system-managed. Research directions remain maintainer-managed. Existing Page Bundle images remain read-only except for People portraits. Projects with `projectType: tool` also populate the Tools directory. See `docs/missing-information.md` for facts still needed from the laboratory.

When the visual CMS is deployed, editors will sign in at the Worker `/editor/` address with their own username and password. They can click page content, save a shared draft, preview it while signed in, then request publication. A GitHub PR runs the bilingual audit, strict Hugo build, and site audit before the Worker can merge it to `main`; GitHub Pages then deploys production. Pages CMS remains available to maintainers as the fallback. See [the CMS setup guide](docs/cms-setup.md).

Grants and Opportunities now have bilingual public directories with honest empty states. Draft example bundles exercise their layouts locally but are excluded from production; they are not evidence of funding or recruitment.

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
Visual CMS shared draft branch
→ GitHub pull request
→ bilingual content audit and pinned Hugo build
→ generated-site audit
→ checked merge to main
→ automatic GitHub Pages deployment
```

Until the visual CMS pilot is deployed, Pages CMS remains the active editor and saves directly to `main`. Do not create a `gh-pages` branch or manually upload `public/`. The current site has no custom domain or `CNAME`.

## Documentation

- [Routine maintenance](docs/maintenance.md)
- [CMS setup and repository publishing](docs/cms-setup.md)
- [Pages CMS image and media scope](docs/pages-cms-media-pilot.md)
- [Project handover](docs/handover.md)
- [Contribution guide](CONTRIBUTING.md)
- [Content models](docs/content-models.md)
- [Content provenance](docs/content-sources.md)
- [Missing information registry](docs/missing-information.md)
- [Architecture decisions](docs/architecture.md)
- [Launch and domain-change checklist](docs/launch-checklist.md)

The current favicon is an original provisional mark, not an approved official X-Laboratory or university logo. See the handover document for known limitations and optional future work.
