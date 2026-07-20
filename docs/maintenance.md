# Site Maintenance

This guide covers routine content maintenance for X-Laboratory. Read `CONTRIBUTING.md` and keep stable IDs, bundle paths, and translation keys unchanged after publication.

## Routine Workflow

1. Create a focused branch.
2. Edit the authoritative Markdown Page Bundles or controlled YAML vocabulary.
3. Keep new or unreviewed content at `draft: true`.
4. Preview both languages locally.
5. Run the strict build and generated-site audit.
6. Review the diff and use a pull request when available.

Do not edit Hugo-generated `public/` files or upload them manually.

## Update the Principal Investigator

The PI content is maintained in:

```text
content/people/jiangjiao-xu/index.en.md
content/people/jiangjiao-xu/index.zh.md
```

Update both language files together. Verify roles, affiliation, public email, biography, and research directions against an authoritative source, then update the review record in `docs/content-sources.md`. Do not adopt a title from an event report when it conflicts with the current official faculty profile.

## Add a Member

Create both translations in the same Page Bundle:

```bash
hugo new content --kind people people/new-member/index.en.md
hugo new content --kind people people/new-member/index.zh.md
```

Keep the bundle slug, `id`, and `translationKey` identical. Localize the display name where appropriate, role, research interests, and biography. Publish contact details or a portrait only with approval and documented image rights.

## Move a Member to Alumni

Keep the existing bundle directory, stable `id`, `translationKey`, and public URL. In both translations set:

```yaml
category: alumni
status: alumni
left: 2026
```

`left` and `alumniNext` are optional. Omit unknown information rather than adding placeholders.

## Add a Publication

Create paired bundles with the same stable ID:

```bash
hugo new content --kind publications publications/paper-slug/index.en.md
hugo new content --kind publications publications/paper-slug/index.zh.md
```

- Verify the exact title, author order, venue, year, and DOI against publisher or DOI metadata.
- Store authors in publication order; add `person` only for explicitly identified laboratory members.
- Keep `labMembers` consistent with author `person` IDs.
- Preserve bibliographic fields in the Chinese bundle; official English paper titles need not be translated.
- Put checked BibTeX in `citation.bib` and reference it with `bibtex: citation.bib`.
- Do not commit a publisher PDF unless redistribution rights are explicit.
- Use only controlled research IDs from `data/research_areas.yaml`.

## Add a Project

Create English and Chinese bundles under `content/projects/<stable-id>/`.

- Preserve the official Chinese title; document that the English title is an editorial translation.
- Record only source-supported year precision in `startYear` and `endYear`.
- Use stable People, Publication, and Research Area IDs for relationships.
- Do not infer publications, datasets, code, demonstrations, outcomes, grant numbers, or amounts.
- Record the authoritative source and review date in `docs/content-sources.md`.

## Add News

Use a verified day-prefixed bundle slug:

```bash
hugo new content --kind news news/2026-07-20-example-news/index.en.md
hugo new content --kind news news/2026-07-20-example-news/index.zh.md
```

Production News requires a reliable source, an exact event or publication date, and a direct relationship to X-Laboratory or Jiangjiao Xu. Never invent dates or laboratory launch, hiring, award, or project-start claims. Record the source, date decision, relationship, and review date in `docs/content-sources.md`.

## Update Join Us

General guidance is in `content/join/index.en.md` and `index.zh.md`. The official admissions index and public inquiry address are configured in `config/_default/params.yaml`; PI identity and the secondary institutional email resolve from the People bundle.

Keep university admissions separate from laboratory availability. Do not add openings, quotas, funding, scholarships, eligibility rules, response promises, or application requirements without an authoritative source or explicit laboratory confirmation.

## Update Contact and Location

The single source of truth is `params.contact` in `config/_default/params.yaml`. Update the public email, phone display/`tel` pair, and English/Chinese address there—not in Home, Contact, Join Us, Footer, or Markdown body text.

- `contact.publicEmail` is the user-approved public inquiry address.
- The PI bundle's `email` remains the institutional address and continues to appear on the PI profile and as a secondary Contact/Join link.
- Keep the phone display value in readable international form and the `tel` value compact with a leading `+`.
- Update localized and structured-address fields together after confirmation.
- Map links are generated from the confirmed Chinese address. Do not add guessed coordinates, API keys, a map SDK, or an automatically loaded iframe.
- Update `docs/content-sources.md` with the authorization/source and review date after a factual change.

## Assets and Branding

- Put content-specific assets inside their Page Bundle.
- Confirm publication rights and meaningful alt text before committing an image.
- Do not copy university logos, publisher covers, event images, or publisher PDFs without permission.
- `static/favicon.svg` is an original provisional mark, not the approved official X-Laboratory logo.
- Do not commit Hugo-generated image variants.

## Local Preview

Preview normal production content:

```bash
hugo server
```

Include draft fixtures or new draft content when needed:

```bash
hugo server -D
```

## Strict Build and Site Audit

Use the exact Hugo Extended version in `.hugo-version`:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
python scripts/audit-site.py public
```

The strict build must finish without warnings. The audit must report zero critical errors. It checks metadata, language links, JSON-LD, internal links and fragments, accessibility structure, placeholders, XML output, and robots rules.

## Deployment

The supported deployment path is:

```text
merge or push to main
→ GitHub Actions strict build and audit
→ GitHub Pages artifact
→ automatic Pages deployment
```

Confirm the workflow and live site after deployment. Never commit or manually upload `public/`. Repository administrators should keep Pages configured to use GitHub Actions.

## Periodic Review

- Recheck PI role, institutional email, public Contact email/phone/address, source provenance, admissions index, and News claims.
- Recheck DOI and external links when updating Publications.
- Review image and PDF rights before every public asset addition.
- Replace the provisional favicon only after final branding approval.
- Repeat `docs/launch-checklist.md` after a custom-domain or public base-URL change.
