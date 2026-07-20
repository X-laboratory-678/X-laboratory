# Content Model Specification

## General Conventions

People, Publications, Projects, and News are implemented as Hugo Leaf Page Bundles with YAML Front Matter and Markdown bodies. Archetypes provide consistent starting files, and Hugo templates validate the rules in this document during every rendered build.

- Every relationship uses a stable `id` or slug.
- A display title or person's name is never a relationship key.
- Dates use ISO 8601 format.
- URL fields may point to external resources unless documented as an internal slug.
- Optional fields should be omitted when empty rather than filled with placeholder values.
- `draft` is a boolean in every publishable entity.

## People Schema

The Markdown body stores the biography.

| Field | Required | Type | Description |
|---|---:|---|---|
| `title` | Yes | string | Person's display name. |
| `id` | Yes | string | Stable unique ID, normally matching the bundle slug. |
| `role` | Yes | string | Human-readable role or position. |
| `category` | Yes | string | Controlled category such as `pi`, `faculty`, `postdoc`, `phd`, `master`, `ra`, `undergraduate`, `visitor`, or `alumni`. |
| `status` | Yes | string | Controlled value: `current` or `alumni`. |
| `photo` | No | string | Bundle-relative profile image filename. |
| `photoAlt` | Conditional | string | Required when `photo` is meaningful content. |
| `email` | No | string | Approved public email address. |
| `homepage` | No | URL | Personal or institutional homepage. |
| `github` | No | URL | GitHub profile. |
| `googleScholar` | No | URL | Google Scholar profile. |
| `orcid` | No | string/URL | ORCID identifier or profile URL. |
| `researchInterests` | No | string array | Short research-interest labels. |
| `joined` | No | date/year | Date or year the member joined. |
| `left` | No | date/year | Date or year the member left. |
| `alumniNext` | No | string | Publicly approved next position or destination. |
| `weight` | No | integer | Explicit ordering within a category; lower values appear first. |
| `draft` | No | boolean | Whether Hugo should exclude the page from production; the archetype defaults to `true`. |

### People display and lifecycle rules

- `category` is a stable machine value used for directory grouping; it is never shown as a role.
- `role` is localized, user-facing text maintained independently in each language bundle. Research interests are localized the same way.
- `category: alumni` and `status: alumni` must always be used together. Every other category uses `status: current`.
- Directory categories and their ordering come from `data/people_categories.yaml`; empty categories are omitted. Members sort by `weight`, then title as a deterministic fallback.
- Moving a person to Alumni does not change the bundle slug, stable `id`, translation key, or URL. Update only `category`, `status`, and optional `left` and `alumniNext` values.
- Person pages discover publications through `Publication.labMembers` and projects through `Project.people`. Person Front Matter does not duplicate either relationship.

### People portrait rules

- `photo` always names a Page Bundle resource and requires meaningful `photoAlt` text.
- Raster portraits are processed to the shared 4:5 presentation ratio and output with explicit dimensions.
- SVG resources bypass raster processing and still receive stable presentation dimensions.
- When `photo` is absent, templates render an `aria-hidden` typographic fallback that is visibly not a photograph.

## Publication Schema

The Markdown body stores the abstract or longer publication notes.

> `authors` and `labMembers` have different meanings. `authors` preserves the publication's exact author list and order. `labMembers` contains stable People IDs for internal relationships. They must not be inferred from each other.

| Field | Required | Type | Description |
|---|---:|---|---|
| `title` | Yes | string | Full publication title. |
| `id` | Yes | string | Stable unique ID, normally matching the bundle slug. |
| `authors` | Yes | object array | Ordered author list as published. Each object has `name`; a lab author also has an explicit `person` stable ID. |
| `labMembers` | No | string array | Stable People IDs for laboratory authors. |
| `venue` | No | string | Full conference, journal, or repository name; may be absent for early preprints. |
| `venueShort` | No | string | Recognized venue abbreviation. |
| `year` | Yes | integer | Publication year. |
| `date` | No | date | Full publication date when known. |
| `publicationType` | Yes | string | Controlled type such as `conference`, `journal`, `preprint`, `workshop`, or `book-chapter`. |
| `doi` | No | string | DOI without presentation-specific text. |
| `paperUrl` | No | URL | Canonical paper landing page. |
| `pdf` | No | string/URL | Bundle-relative PDF or stable external URL. |
| `code` | No | URL | Source code repository. |
| `projectPage` | No | string/URL | Internal Project ID or external project page. |
| `dataset` | No | URL | Dataset or data repository. |
| `video` | No | URL | Talk, presentation, or demo video. |
| `bibtex` | No | string | Prefer a bundle-relative `.bib` filename. |
| `thumbnail` | No | string | Bundle-relative image filename. |
| `selected` | No | boolean | Whether the publication is featured in selected lists; defaults to `false`. |
| `researchAreas` | No | string array | Stable controlled research-area IDs. |
| `tags` | No | string array | Additional discovery labels. |
| `links` | No | object array | Additional links with `label` and `url`. |
| `draft` | No | boolean | Whether Hugo should exclude the page from production; the archetype defaults to `true`. |

### Publication identity and display rules

- Preserve the publisher's exact title, author names, and author order. Punctuation between authors belongs to the template, not `author.name`.
- `labMembers` is authoritative for reverse aggregation. An author is linked and emphasized only when its explicit `person` ID also appears in `labMembers`; templates never infer membership from a name.
- Store DOI identifiers as `10.xxxx/...`, never as `https://doi.org/...`. Templates construct the DOI link.
- English and Chinese translations preserve the same title, authors and order, person mappings, venue, year, publication type, and DOI. Only surrounding interface text and an approved body may be localized.
- The directory sorts by year descending, then known date descending, then title as a deterministic fallback. Filters use build-time `year`, `publicationType`, and `researchAreas` values embedded in the HTML.
- `selected: true` makes a publication eligible for the homepage; the homepage applies its own item limit.

### Publication resources and rights

- Prefer a bundle-relative `citation.bib`. Its bibliographic fields must come from verified publisher or DOI metadata; never invent volume, issue, pages, or article numbers.
- A local PDF is allowed only when the laboratory has a redistributable author version, repository version, open-access version, user-provided file, or explicit publisher permission. Otherwise use DOI or `paperUrl` and do not copy the PDF into the repository.
- BibTeX remains readable through HTML `<details>` and a raw resource link without JavaScript. JavaScript only adds Clipboard API copying and accessible status feedback.
- Publication thumbnails are optional. Do not use publisher covers, screenshots, paper first pages, or generated illustrations without appropriate rights.

## Research Area Schema

Research areas use a deliberately split model. `data/research_areas.yaml` is authoritative for the stable `id`, localized short labels, and `weight`. A multilingual leaf Page Bundle at `content/research/<id>/` is authoritative for the public title, description, Markdown body, SEO metadata, and route.

| Field | Required | Type | Description |
|---|---:|---|---|
| `title` | Yes | string | Localized public title; must equal the corresponding vocabulary label. |
| `id` | Yes | string | Stable research-area ID matching both the vocabulary entry and bundle slug. |
| `description` | Yes | string | Localized summary for cards and metadata. |
| `weight` | No | integer | Page ordering, kept aligned with the controlled vocabulary. |
| `draft` | No | boolean | Whether Hugo excludes the page from production. |

The Markdown body provides the public overview. Projects and Publications are aggregated in templates from their own `researchAreas` arrays. Research bundles must not maintain duplicate project or publication lists.

## Project Schema

The Markdown body stores the detailed project description.

| Field | Required | Type | Description |
|---|---:|---|---|
| `title` | Yes | string | Project display title. |
| `id` | Yes | string | Stable unique ID, normally matching the bundle slug. |
| `summary` | Yes | string | Short text for cards and listings. |
| `hero` | No | string | Bundle-relative primary image. |
| `heroAlt` | Conditional | string | Required when `hero` is meaningful content. |
| `status` | Yes | string | Controlled value such as `planned`, `active`, `completed`, or `archived`. |
| `startYear` | Yes | integer | Verified project start year. |
| `endYear` | No | integer | Verified project end year; omit only when the source gives no end year. |
| `people` | No | string array | Stable People IDs. |
| `researchAreas` | No | string array | Stable controlled research-area IDs. |
| `publications` | No | string array | Stable Publication IDs. |
| `code` | No | URL | Source code repository. |
| `dataset` | No | URL | Dataset or data repository. |
| `demo` | No | URL | Public demonstration. |
| `links` | No | object array | Additional links with `label` and `url`. |
| `featured` | No | boolean | Whether the project may appear in featured summaries; defaults to `false`. |
| `weight` | No | integer | Explicit ordering; lower values appear first. |
| `draft` | No | boolean | Whether Hugo should exclude the page from production; the archetype defaults to `true`. |

## News Schema

The Markdown body stores the complete news article. Production News is event data, not general promotional copy: every item requires a reliable source, an exact day, and a clear connection to X-Laboratory or Jiangjiao Xu.

| Field | Required | Type | Description |
|---|---:|---|---|
| `title` | Yes | string | News headline. |
| `date` | Yes | date/datetime | Verified event date or first formal publication date with day precision, in ISO 8601 format. Year-only and month-only values are not acceptable. |
| `lastmod` | No | datetime | Last meaningful content update. |
| `summary` | No | string | Short listing and metadata summary. |
| `image` | No | string | Bundle-relative cover image. |
| `imageAlt` | Conditional | string | Required when `image` is meaningful content. |
| `category` | Yes | string | Controlled category such as `award`, `publication`, `event`, `announcement`, or `media`. |
| `relatedPublication` | No | string | Stable Publication ID. |
| `relatedProject` | No | string | Stable Project ID. |
| `featured` | No | boolean | Whether the item may appear in featured summaries; defaults to `false`. |
| `draft` | No | boolean | Whether Hugo should exclude the page from production; the archetype defaults to `true`. |

### News accuracy and relationship rules

- The bundle slug is the permanent URL key and uses a date prefix plus a concise ASCII slug. News does not add a separate `id`.
- A publication News date uses the first formal online-publication date when an authoritative source supplies one; otherwise a day-precise issued date may be used. DOI creation timestamps are not treated as publication dates by themselves.
- `relatedPublication` and `relatedProject` contain stable IDs. The News bundle is authoritative for these relationships; Publication and Project bundles do not maintain inverse News arrays.
- Sharing an institution or research area is not enough to establish a News relationship.
- English and Chinese translations must preserve `date`, `category`, `relatedPublication`, `relatedProject`, and `featured`. Titles, summaries, and Markdown bodies are localized.
- Source URLs and review notes belong in `docs/content-sources.md`, not duplicated Front Matter.

## Site Contact Configuration

Public laboratory contact data has one authoritative configuration under `params.contact` in `config/_default/params.yaml`. Templates must resolve the principal investigator by stable People ID and must not duplicate email, phone, or address values in Home, Contact, Join Us, Footer, or Markdown bodies.

| Field | Required | Description |
|---|---:|---|
| `principalInvestigatorId` | Yes | Stable People ID used to resolve the PI name, profile URL, and institutional email. |
| `publicEmail` | Yes | User-approved public inquiry email used by Contact and Join Us. |
| `publicPhone.display` | Yes | Internationally readable public phone display value. |
| `publicPhone.tel` | Yes | Compact international `tel:` URI value beginning with `+`. |
| `address.en` | Yes | Confirmed English laboratory address. |
| `address.zh` | Yes | Confirmed Chinese laboratory address. |
| `address.streetAddress` | Yes | Confirmed street-address component for structured data. |
| `address.addressLocality` | Yes | Confirmed locality for structured data. |
| `address.addressRegion` | Yes | Confirmed region for structured data. |
| `address.addressCountry` | Yes | Confirmed country code for structured data. |
| `location.campusName.en` / `.zh` | Yes | Confirmed localized campus name. |
| `location.latitude` / `.longitude` | Yes | Verified map-marker coordinates stored as decimal strings. |
| `location.embedBoundingBox` | Yes | Verified OpenStreetMap viewport in west,south,east,north order. |

The PI's `People.email` remains the institutional address. `contact.publicEmail` is the general public contact address and does not overwrite Person metadata. The English and Chinese Contact pages live in `content/contact/` and use a focused layout. `contact.location` stores the verified bilingual campus name, marker coordinates, and embed bounding box. Templates generate a lazy-loaded OpenStreetMap iframe plus address-based Amap and Google Maps links; no API key, map SDK, or JavaScript dependency is used.

Organization JSON-LD may use the public email, telephone, `ContactPoint`, and `PostalAddress`. Person JSON-LD continues to use the institutional People email.

## Join Us Content Page

Join Us is a multilingual Markdown content page with a focused custom layout. Core guidance remains in `content/join/index.en.md` and `index.zh.md`. The layout resolves the principal investigator through `params.contact.principalInvestigatorId`, uses `params.contact.publicEmail` as the primary inquiry address, preserves the People entity's institutional email as a secondary link, reads Research pages dynamically, and uses one configured official admissions URL.

Join Us is informational rather than a vacancy or application model. Openings, quotas, funding, eligibility, response times, or application requirements must not be inferred. Changes to admissions links, availability language, or contact instructions require an authoritative source or explicit laboratory confirmation.

## Directory and Page Bundle Convention

Each entity occupies one leaf bundle. The bundle directory name is the permanent machine-readable slug.

```text
content/<section>/<stable-slug>/
├── index.en.md
├── index.zh.md
└── optional-bundle-resource.ext
```

The primary entity sections are `people`, `research`, `publications`, `projects`, and `news`. Their section roots use `_index.en.md` and `_index.zh.md`. Contact and Join Us are standalone multilingual content pages rather than entity directories. Do not store entity records directly in section root files or central YAML arrays. Research is the narrow exception to the central-data rule: only its controlled ID/label/weight vocabulary lives in YAML; all public page content remains in Page Bundles.

People, Publication, and Project `id` values must match their bundle slug. IDs use lowercase ASCII where practical, contain hyphen-separated alphanumeric segments, and remain unchanged when a display title changes. News uses a stable date-prefixed bundle slug, such as `2026-01-publication-announcement`, instead of a separate `id` field.

## Required Fields

The build rejects published content missing these fields:

- People: `title`, `id`, `role`, `category`, `status`
- Research: `title`, `id`, `description`
- Publications: `title`, `id`, non-empty `authors`, `year`, `publicationType`
- Projects: `title`, `id`, `summary`, `status`, `startYear`
- News: `title`, parseable `date`, `category`

Each Publication author is an object containing at least `name`. This preserves author order while allowing later fields such as equal contribution, correspondence, or affiliation without changing the basic structure.

Fields marked optional may be omitted or left empty. Minimal templates must not fail when optional profile links, venue, images, external URLs, summaries, or relationships are absent.

## Controlled Vocabularies

Controlled values live in small files under `data/`:

- `people_categories.yaml` validates `People.category`.
- `publication_types.yaml` validates `Publication.publicationType`.
- `project_statuses.yaml` validates `Project.status`.
- `research_areas.yaml` validates every `researchAreas` reference.
- `news_categories.yaml` validates `News.category`.

Each entry has a stable `id`, an administrative label, and a `weight` where ordering is relevant. Interface labels are localized through `i18n/`; research-area entries also carry localized content labels. The current research-area vocabulary is a restrained information-architecture summary of the principal investigator's officially published research directions; provenance is recorded in `docs/content-sources.md`.

## Relationship Model and Authority

All internal references contain stable IDs, never display names, titles, or URLs:

```text
Project.people                → People.id
Project.publications          → Publication.id
Project.researchAreas         → Research Area.id
Publication.labMembers        → People.id
Publication.researchAreas     → Research Area.id
News.relatedPublication       → Publication.id
News.relatedProject           → Project.id
```

`Project.people` is authoritative for People-to-Project membership. Person bundles do not maintain a duplicate `projects` array. `Project.publications` is authoritative for the explicit Project-to-Publication relationship. `Publication.projectPage` is an optional landing-page link and is not a relational source of truth. Sharing a `researchAreas` value establishes topical grouping only; it never implies that a Publication is an output of a Project.

The cached Hugo resolver looks in the current language first and then the default English site. This permits a translated page to reference an entity that has not yet been translated. Missing references cause a build error rather than disappearing silently.

## Duplicate and Translation Rules

Hugo builds a cached ID index for People, Research, Publications, and Projects in each language. Duplicate IDs in the same entity type and language cause a build error. Translated versions must use the same stable `id`; the build compares every page in `AllTranslations`. Project translations must also preserve status, period, People IDs, Research Area IDs, Publication IDs, featured state, and weight. News translations preserve event date, category, relationship IDs, and featured state.

Translated bundle files use `index.en.md` and `index.zh.md`. The Hugo language keys are `en` and `zh`; document locales are exactly `en` and `zh-CN`; public paths are `/` and `/zh/`. Every translated pair uses an explicit stable `translationKey` so translation links remain intact even if a title changes.

## Bundle Resource Rules

Content-specific images, PDFs, BibTeX files, and similar assets belong in the entity bundle. Do not duplicate the same resource for each language. Hugo shares resources across linked multilingual bundles.

When `photo`, `hero`, or `image` is set, it must resolve through `Page.Resources.GetMatch`, and the corresponding alt-text field is required. Publication `bibtex`, local `pdf`, and `thumbnail` fields must also resolve to bundle resources. Missing resources or alt text cause a build error. Generated thumbnails and processed variants must not be committed.

## Build-Time Validation

`layouts/partials/content/validate-site.html` runs once per rendered language through `partialCached`. It checks required fields, ID syntax and bundle matching, duplicate IDs, controlled vocabularies, bundle resources, and internal references. Research validation checks vocabulary membership and localized title consistency. Project validation checks year ranges and translation-invariant relationships. News validation checks category, related IDs, bundle images, and translation-invariant event metadata. Site Contact validation resolves the configured PI and requires a public email, phone display and international `tel` value, both localized addresses, and the confirmed structured-address fields. Join validation requires an HTTPS admissions URL. Publication translations additionally validate title, year, publication type, DOI, venue, author order, and person mappings. Publication validation also checks DOI representation and the consistency of `authors[].person` with `labMembers`. Validation uses `errorf`, so invalid content exits nonzero in both normal and strict builds.
