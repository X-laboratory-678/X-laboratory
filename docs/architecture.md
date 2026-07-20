# Architecture Decision Records

These decisions define the initial architecture. A future change that conflicts with them requires an explicit review and an updated or superseding decision record.

## ADR-001 — Use Hugo Extended

**Decision:** Build the site with the exact Hugo Extended version recorded in `.hugo-version`.

**Reason:** Hugo produces a fast static site without a database or backend. The Extended edition preserves access to the complete asset and image-processing feature set.

**Consequences:** Local development and CI must use the same pinned version. Upgrades are deliberate and tested rather than automatic.

## ADR-002 — Use Custom Layouts

**Decision:** Build project-owned Hugo layouts instead of adopting a third-party full theme.

**Reason:** The laboratory needs specialized People, Publication, Project, and multilingual relationships without inheriting a theme's content model or upgrade constraints.

**Consequences:** The project owns its HTML, accessibility, and visual maintenance. Reusable UI belongs in Hugo Partials, not a premature standalone theme.

## ADR-003 — Use Page Bundles for Primary Content Entities

**Decision:** Store People, Publications, Projects, and News as Hugo Leaf Page Bundles with YAML Front Matter and Markdown bodies.

**Reason:** Page Bundles keep each entity, image, PDF, BibTeX file, and translation logically together while allowing independent pages and clean Git reviews.

**Consequences:** Contributors edit multiple small bundles instead of a large central YAML file. `data/` remains limited to controlled shared data.

## ADR-004 — Use Native CSS

**Decision:** Use project-owned native CSS rather than a CSS framework.

**Reason:** Modern CSS provides the required responsive layout and design system without framework weight, naming constraints, or upgrade cost.

**Consequences:** The project must define clear design tokens and component conventions. Bootstrap, Tailwind, and similar frameworks require a new approved decision.

## ADR-005 — Use Minimal Native JavaScript

**Decision:** Use small native ES Modules only for progressive enhancement.

**Reason:** Core content is static and does not require a client application framework. Minimal JavaScript improves performance, resilience, and accessibility.

**Consequences:** Navigation and content remain usable without JavaScript. Interactive modules must be isolated and justified.

## ADR-006 — Use GitHub Actions and GitHub Pages

**Decision:** Build with GitHub Actions and deploy the generated static artifact to GitHub Pages.

**Reason:** This provides an auditable `git push` deployment flow without operating a server.

**Consequences:** The workflow must pin Hugo, handle GitHub Project Pages base paths, and avoid committing generated `public/` output.

## ADR-007 — Use Stable Slug/ID Relationships

**Decision:** Represent internal relationships with stable slugs or IDs, never mutable display names.

**Reason:** Names and titles can change, and string matching creates fragile or ambiguous relationships.

**Consequences:** Published IDs should rarely change. Content validation must detect missing or duplicate references.

## ADR-008 — Prepare Multilingual Architecture from the Beginning

**Decision:** Reserve English at `/`, Simplified Chinese at `/zh/`, use Hugo language keys `en` and `zh`, and emit document locales `en` and `zh-CN`.

**Reason:** Establishing stable language and URL conventions early avoids a disruptive content and URL migration later.

**Consequences:** Slugs and translation keys must remain stable, interface text will move to `i18n/`, and templates must emit correct language relationships when multilingual implementation begins.

## ADR-009 — Split Research Vocabulary from Research Pages

**Decision:** Keep stable research-area IDs, localized short labels, and ordering in `data/research_areas.yaml`; store public descriptions, Markdown narrative, and SEO metadata in multilingual Research Page Bundles.

**Reason:** Filters and relationship validation need one small controlled vocabulary, while public research pages need reviewable prose, translations, routes, and automatic related-content aggregation.

**Consequences:** Every published Research bundle ID and title must match its vocabulary entry. Projects and Publications reference only the stable ID; Research pages never duplicate relationship arrays.

## ADR-010 — Represent Verified Project Periods as Years

**Decision:** Use integer `startYear` and optional `endYear` fields for Projects instead of day-level dates.

**Reason:** Current authoritative sources publish project periods only at year precision. Full dates would imply unsupported precision and complicate maintenance.

**Consequences:** Project cards and details format a single year or inclusive year range. The build validates plausible values and rejects an end year earlier than the start year.

## ADR-011 — Generate Factual SEO Metadata at Build Time

**Decision:** Generate canonical URLs, reciprocal language alternates, Open Graph metadata, and JSON-LD from Hugo page objects and verified Front Matter. Validate the generated production site with the zero-dependency `scripts/audit-site.py` command.

**Reason:** Build-time metadata remains consistent with translated routes and GitHub Pages subpaths without adding client-side code or duplicating content. A generated-output audit catches failures that source-only checks cannot see.

**Consequences:** Templates use `.Permalink`, `.AllTranslations`, and language configuration rather than string replacement or a hard-coded domain. Home pages emit `WebSite` and `Organization`; People emit `Person`; Publications emit `ScholarlyArticle`; News emits `NewsArticle`; other pages use a conservative `WebPage`. Unknown images, logos, addresses, authors, dates, and organization facts are omitted. Publication years remain year-precision values unless a verified full date exists.

## ADR-012 — Deploy a Validated Pages Artifact

**Decision:** Deploy through `.github/workflows/pages.yml` using separate build and deploy jobs. The build reads the Hugo Extended version from `.hugo-version`, obtains the public URL from `actions/configure-pages`, runs the strict Hugo build and generated-site audit, and uploads only `public/` as a Pages artifact. The deploy job publishes that artifact to the `github-pages` environment.

**Reason:** GitHub's Pages artifact flow avoids committing generated files or maintaining a `gh-pages` branch. Using the Pages-provided base URL supports repository subpaths and a future configured custom domain without changing templates.

**Consequences:** A failed version check, Hugo warning, build error, or audit error prevents artifact upload and deployment. The workflow runs on pushes to `main` and manual dispatch only. Repository administrators must select GitHub Actions as the Pages source. The repository currently has no authorized remote, so this architecture is locally ready but has not been deployed.
