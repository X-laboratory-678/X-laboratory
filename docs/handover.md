# Project Handover

## Site

- Repository: <https://github.com/X-laboratory-678/X-laboratory>
- Live site: <https://x-laboratory-678.github.io/X-laboratory/>
- Production branch: `main`
- Hosting mode: GitHub Project Pages under `/X-laboratory/`

## Architecture

The public site uses Hugo Extended with custom layouts, Markdown Leaf Page Bundles, small YAML controlled vocabularies, native CSS, and minimal native JavaScript. Sveltia CMS provides a GitHub-authenticated editor over those Markdown files; content remains in Git, with no database, site application server, Node frontend toolchain, or third-party theme.

English is published at `/`; Simplified Chinese is published at `/zh/`. Content-specific resources remain inside their Page Bundle. Shared categories, status values, research IDs, and ordering live under `data/`.

V2 uses a hierarchical Hugo menu. People, Research, Events, Resources, and Tools are enabled top-level groups. Events, Resources, Tools, and Materials now have layouts that list verified CMS-managed records. Event series pages remain site structure; specific event records are selected by their `series` field. Tools are Projects with `projectType: tool`. The disclosure behavior is progressively enhanced with native JavaScript and retains a complete no-JavaScript link fallback.

CMS source files are in `static/admin/`; the pinned Sveltia release is loaded from unpkg. `static/admin/config.yml` still needs the actual Cloudflare Worker URL before sign-in works. Cloudflare OAuth credentials and GitHub branch rulesets are external setup; follow `docs/cms-setup.md`. Do not commit OAuth secrets.

## Content Authority

- People, Publications, Projects, Research, and News are authoritative in `content/`.
- Grants and Opportunities have production directories, but currently contain no verified production records; their example bundles are drafts only.
- Stable IDs and bundle paths are relationship keys; display names and titles are not.
- Project `people` and `publications`, Publication `labMembers`, and News relationship fields define their respective links.
- Homepage summaries and related-content lists are generated from these authoritative bundles.
- English and Chinese files share stable IDs and `translationKey` values.
- Example bundles remain `draft: true` validation fixtures and must never be treated as real laboratory activity.
- Provenance for factual claims is recorded in `docs/content-sources.md`.
- Missing or unverified V2 facts are tracked in `docs/missing-information.md`, never in public copy.

## Deployment

`.github/workflows/pages.yml` runs on pull requests targeting `main`, pushes to `main`, and manual dispatch. It first checks bilingual content bundles, then reads the pinned Hugo version and runs the strict production build and `scripts/audit-site.py`. Pull requests do not upload or deploy an artifact. Only pushes to `main` and manual dispatches against `main` upload `public/` as a Pages artifact and deploy it to the `github-pages` environment.

The dynamic Pages URL is important: templates and content must not hard-code the domain or `/X-laboratory/` base path. Do not create a `gh-pages` branch or manually upload generated files.

## Quality Gates

Before review or deployment, run:

```bash
hugo --gc --minify --cleanDestinationDir --environment production --panicOnWarning --printPathWarnings
python scripts/audit-site.py public
```

Required result: zero Hugo warnings and zero audit critical errors. Also review both languages, keyboard navigation, responsive layouts, source provenance, and asset rights when affected by a change.

## Security and Repository Hygiene

- Never commit credentials, PATs, private data, `.env` files, `public/`, `resources/_gen/`, or local test output.
- The Pages workflow uses read-only repository contents permission plus the scoped Pages and OIDC permissions required by its jobs.
- HTTPS is enforced by GitHub Pages.
- The current workstation has a system-level `http.sslverify=false` setting from `D:/GitConfig/.gitconfig` and has reported `CRYPT_E_REVOCATION_OFFLINE`. This is outside the repository. Restore Git HTTPS certificate verification and investigate Windows certificate/revocation connectivity with the system administrator; never copy this setting into repository-local Git configuration.

## Known Limitations and Optional Work

- The favicon is an original provisional mark; final official logo/favicon approval is pending.
- No approved PI portrait is available; the site intentionally uses its neutral fallback.
- No custom domain is configured.
- The CMS sign-in remains inactive until the OAuth Worker URL and repository rulesets are configured. Repository editors need Write access and therefore can also read and modify source code.
- No analytics are configured.
- Search Console registration is optional and has not been performed.
- Firefox, WebKit, and Safari were not available for direct testing on the final Windows environment. Edge and Chrome were tested; Safari must not be inferred from Chromium results.
- The external Durham repository blocks automated access to one cited record, and the cited event report may reset automated connections. Their provenance is retained in `docs/content-sources.md`.

## Maintenance Entry Points

- Routine content procedures: `docs/maintenance.md`
- CMS authentication and repository rules: `docs/cms-setup.md`
- Contributor rules and archetype commands: `CONTRIBUTING.md`
- Content schemas and relationship rules: `docs/content-models.md`
- Factual provenance: `docs/content-sources.md`
- Architecture decisions: `docs/architecture.md`
- Release and domain-change checks: `docs/launch-checklist.md`
- Missing information and publication blockers: `docs/missing-information.md`
