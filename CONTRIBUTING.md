# Contributing

This guide defines the basic maintenance workflow for future laboratory members. Keep changes small, reviewable, and limited to one purpose.

## Git Workflow

Use this workflow unless the project maintainers specify otherwise:

```text
branch
→ edit
→ local validation
→ commit
→ pull request
```

Do not push directly to `main` when a pull request workflow is available. Never commit secrets, credentials, private personal data, generated site output, or unrelated local files.

## Naming

Content slugs and stable IDs must be:

- Lowercase
- ASCII where practical
- Hyphen-separated
- Descriptive
- Stable after publication

Examples:

```text
new-member
trustworthy-ai
robust-learning-2026
```

Do not use a title or display name as a long-term relationship key. Titles and names may change; stable IDs should not.

## Content Rules

People, Publications, Projects, and News are stored as independent Hugo Leaf Page Bundles. A bundle contains YAML Front Matter, a Markdown body, and related images or documents when needed.

Do not duplicate the same item in a template, homepage list, or central YAML file. Homepage summaries and related-content lists must come from the authoritative Page Bundle.

Public-facing content must not contain internal editorial, provenance, validation, schema, implementation, or data-governance commentary. If optional verified information is unavailable, omit the section rather than explaining the omission to visitors. Keep source decisions and relationship rules in `docs/`, `CONTRIBUTING.md`, and build-time validation.

New content is created as a leaf bundle with the pinned Hugo version. The following commands were verified with Hugo Extended 0.164.0. Run them from the repository root, then complete the required fields and keep `draft: true` until review.

### Add a person

```bash
hugo new content --kind people people/new-member/index.en.md
```

Use the matching bundle path for a translation:

```bash
hugo new content --kind people people/new-member/index.zh.md
```

Keep `id: new-member` and the same `translationKey` in both files.

### Add a publication

```bash
hugo new content --kind publications publications/robust-learning-2026/index.en.md
```

Preserve author order, use author objects with a `name` field, and record People IDs separately in `labMembers`.

### Add a project

```bash
hugo new content --kind projects projects/trustworthy-ai/index.en.md
```

Use stable IDs in `people`, `publications`, and `researchAreas`. Do not copy the inverse relationships into Person bundles.

- Record the source's year precision in `startYear` and `endYear`; never invent month or day values.
- Keep translated project relationship arrays and period/status fields identical.
- Add a Publication ID to `publications` only when an authoritative source explicitly establishes that project-output relationship. A shared research area is not sufficient evidence.
- Leave hero and external-resource fields empty until the asset rights or URLs are confirmed.

### Add a research area

Add the stable ID, English/Chinese labels, and weight to `data/research_areas.yaml`, then create matching English and Chinese bundles under `content/research/<id>/`. Bundle titles must match the corresponding localized labels. Do not add project or publication arrays: related content is aggregated from `Project.researchAreas` and `Publication.researchAreas`.

### Add news

```bash
hugo new content --kind news news/2026-07-20-example-news/index.en.md
```

Use a day-precise ISO date and a controlled news category. News relationships contain Publication or Project IDs, not titles.

- Confirm a reliable source, exact event or first-publication date, and direct X-Laboratory connection before creating a production bundle. **Never invent an event date.**
- Use a stable lowercase ASCII bundle slug prefixed by the verified date. Do not rename it when a headline changes.
- Record every source URL, date decision, relationship, and review date in `docs/content-sources.md`.
- Use `relatedPublication` and `relatedProject` only for explicit relationships. Do not infer one from a shared institution or research area.
- Preserve `date`, `category`, relationship IDs, and `featured` across English and Chinese translations.
- Keep images empty until publication rights and meaningful alt text are confirmed.

## Join Us Maintenance

Join Us is time-sensitive institutional guidance, not a general recruiting template.

- Changes to admissions links, openings, quotas, contact instructions, funding, eligibility, or application language require an authoritative source or explicit laboratory confirmation.
- Never infer that the laboratory is recruiting from a university admissions announcement.
- Never add fake vacancy cards, application forms, response promises, funding claims, or nonexistent email addresses.
- Maintain the official admissions URL in `config/_default/params.yaml` and record its scope and review date in `docs/content-sources.md`.
- The PI contact panel resolves the configured People entity. Update the public email in the People bundle, not in the Join layout or Markdown body.

Before publishing any new bundle, run:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
```

`--cleanDestinationDir` prevents routes from a previous `hugo server -D` or draft build from remaining in the local production output. It only cleans Hugo's ignored `public/` destination.

## Images

- Resize and compress unnecessarily large source images before committing them.
- Provide alt text for every meaningful image.
- Use stable, readable filenames such as `profile.jpg` or `project-overview.png`.
- Do not use camera-generated names such as `IMG_28371.jpg`.
- Do not commit generated thumbnails or responsive variants; Hugo will generate them.
- Confirm that the project has permission to publish each image.

## Publications

### Add a publication

Create the English bundle with the pinned Hugo version, then add the Chinese translation at the same stable bundle path:

```bash
hugo new content --kind publications publications/robust-learning-2026/index.en.md
hugo new content --kind publications publications/robust-learning-2026/index.zh.md
```

- Keep the bundle slug, `id`, and `translationKey` stable and identical across translations.
- Verify the exact title, author names and order, venue, year, and DOI against publisher or DOI metadata. **Never guess bibliographic metadata.**
- Store each author as an object with `name`. For a laboratory author, add `person: <people-id>` and add the same stable ID to `labMembers`.
- Store only the DOI identifier, such as `10.1109/example`, without the `https://doi.org/` prefix.
- Use controlled IDs from `data/research_areas.yaml` and `data/publication_types.yaml`; do not duplicate their labels in Front Matter.
- Preserve the original publication title, authors, venue, year, type, and DOI in the Chinese bundle. Translate only approved body content and surrounding UI.
- Put verified BibTeX in `citation.bib` and set `bibtex: citation.bib`. Check every field against the same authoritative metadata.
- Never commit a publisher PDF unless redistribution rights are explicit. Prefer DOI or a stable legal `paperUrl`.
- Set `selected: true` only for a reviewed representative result; selection controls homepage eligibility, not publication quality claims.
- Check DOI, paper, code, dataset, video, and project links before requesting review.

### Update an existing publication

Correct metadata in both language files and the BibTeX resource, but keep the stable ID, bundle slug, translation key, and public URL unchanged. Change an ID only before public release when the original identifier is demonstrably wrong.

## People

- Use a stable person slug.
- When a current member becomes an alumnus, keep the existing slug whenever possible.
- Do not publish private contact details without the person's consent.
- Confirm names, roles, profile links, and image rights with the member.
- Record authoritative public sources and review dates in `docs/content-sources.md` when adding or materially updating factual profile information.
- Do not convert ambiguous source fields into roles or titles without semantic confirmation.

### Add a current member

Create the English Page Bundle with the pinned Hugo version:

```bash
hugo new content --kind people people/new-member/index.en.md
```

Set a controlled non-alumni `category`, use `status: current`, complete the localized `role`, and keep `draft: true` until review.

### Add a Chinese translation

Create the translation in the same bundle:

```bash
hugo new content --kind people people/new-member/index.zh.md
```

Both `index.en.md` and `index.zh.md` must retain the same stable `id` and `translationKey`. Translate the display name where appropriate, plus `role`, `researchInterests`, biography, and public alumni text; never translate the stable ID.

### Add a portrait

Place the approved image inside the person's bundle, then set:

```yaml
photo: profile.jpg
photoAlt: Concise description of the person in the photograph
```

Use a raster image or SVG Page Resource, never a hotlinked URL. Confirm publication rights before committing it. If no approved portrait exists, leave both fields empty and use the built-in non-photographic fallback.

### Move a person to Alumni

Do not change the stable ID, bundle slug, translation key, or URL. Update both language bundles:

```yaml
category: alumni
status: alumni
left: 2026
alumniNext: Publicly approved next position
```

`left` and `alumniNext` are optional. Omit unknown values instead of adding `N/A` or placeholders.

## Pull Requests

Each pull request must:

- Have a small and clear scope.
- Describe what changed and why.
- Pass the available build and validation checks.
- Avoid unrelated reformatting.
- Include checked images and links where applicable.
- Update documentation when a rule or content field changes.

Before requesting review, inspect the complete diff and report any known warnings or limitations.

## Site Quality and SEO

SEO output is generated from the same reviewed content that renders each page. Do not add a canonical domain, GitHub Pages repository path, translated URL, or schema URL directly to a content file or template.

- Keep `title` and `description` concise, factual, language-appropriate, and distinct within that language.
- Keep English and Chinese `translationKey` values identical so Hugo can generate reciprocal `hreflang` links.
- Do not add an Open Graph image until the laboratory has an approved, rights-cleared image.
- Do not invent publication dates, News authors, organization addresses, social profiles, funding, vacancies, or other structured-data fields.
- Treat `static/favicon.svg` as provisional branding until an approved laboratory identity replaces it.

After every content or template change, build and audit the generated site:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
python scripts/audit-site.py public
```

The audit uses only the Python standard library and exits non-zero for critical metadata, language, link, accessibility-structure, placeholder, XML, or robots failures. Before changing the production domain or deploying, also complete `docs/launch-checklist.md`.

## Deployment

Routine deployment is automatic after an approved change reaches `main`:

```text
push or merge to main
→ GitHub Actions strict build and audit
→ GitHub Pages artifact deployment
```

Do not commit or manually upload `public/`. Confirm the Actions run succeeds and perform a live smoke test after deployment. See `docs/maintenance.md` for routine procedures and `docs/handover.md` for the current production architecture and known limitations.
