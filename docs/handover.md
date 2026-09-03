# Project Handover

## Site

- Repository: <https://github.com/X-laboratory-678/X-laboratory>
- Live site: <https://x-laboratory-678.github.io/X-laboratory/>
- Production branch: `main`
- Hosting mode: GitHub Project Pages under `/X-laboratory/`

## Architecture

The site uses Hugo Extended with custom layouts, Markdown Leaf Page Bundles, small YAML controlled vocabularies, native CSS, and minimal native JavaScript. It has no database, application server, Node frontend toolchain, or third-party theme.

English is published at `/`; Simplified Chinese is published at `/zh/`. Content-specific resources remain inside their Page Bundle. Shared categories, status values, research IDs, and ordering live under `data/`.

V2 uses a hierarchical Hugo menu. People and Research are currently enabled groups; Events, Resources, Tools, and not-yet-built child destinations remain registered but disabled until their routes ship. The disclosure behavior is progressively enhanced with native JavaScript and retains a complete no-JavaScript link fallback.

## Content Authority

- People, Publications, Projects, Research, and News are authoritative in `content/`.
- Stable IDs and bundle paths are relationship keys; display names and titles are not.
- Project `people` and `publications`, Publication `labMembers`, and News relationship fields define their respective links.
- Homepage summaries and related-content lists are generated from these authoritative bundles.
- English and Chinese files share stable IDs and `translationKey` values.
- Example bundles remain `draft: true` validation fixtures and must never be treated as real laboratory activity.
- Provenance for factual claims is recorded in `docs/content-sources.md`.
- Missing or unverified V2 facts are tracked in `docs/missing-information.md`, never in public copy.

## Deployment

`.github/workflows/pages.yml` runs on pushes to `main`. It reads the pinned Hugo version, obtains the actual URL from GitHub Pages, performs the strict production build and `scripts/audit-site.py`, uploads `public/` as a Pages artifact, and deploys it to the `github-pages` environment.

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
- There is no CMS or analytics by design.
- Search Console registration is optional and has not been performed.
- Firefox, WebKit, and Safari were not available for direct testing on the final Windows environment. Edge and Chrome were tested; Safari must not be inferred from Chromium results.
- The external Durham repository blocks automated access to one cited record, and the cited event report may reset automated connections. Their provenance is retained in `docs/content-sources.md`.

## Maintenance Entry Points

- Routine content procedures: `docs/maintenance.md`
- Contributor rules and archetype commands: `CONTRIBUTING.md`
- Content schemas and relationship rules: `docs/content-models.md`
- Factual provenance: `docs/content-sources.md`
- Architecture decisions: `docs/architecture.md`
- Release and domain-change checks: `docs/launch-checklist.md`
- Missing information and publication blockers: `docs/missing-information.md`
