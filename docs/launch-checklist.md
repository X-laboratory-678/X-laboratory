# Launch Checklist

Use this checklist before the first GitHub Pages release, after binding a custom domain, and after any change to the public base URL. The deployment workflow is locally ready, but the first deployment remains pending until an authorized GitHub repository is configured.

## Before Deployment

- [ ] Configure an explicitly authorized GitHub repository as `origin`; never infer an account or repository name.
- [ ] Inspect any existing remote history before the first push and do not overwrite it.
- [ ] In repository settings, select **Pages → Source → GitHub Actions**.
- [ ] Confirm the public GitHub Pages or custom-domain URL, including whether a repository subpath is required.
- [ ] Replace the reserved production `baseURL` or pass the approved value through the deployment build; do not hard-code it in layouts or content.
- [ ] Confirm whether a `CNAME` file is required and that its value matches the approved custom domain.
- [ ] Replace the provisional `static/favicon.svg` only with an approved, original or rights-cleared laboratory identity; do not reuse the university logo without permission.
- [ ] Review the laboratory name, institution, unit, PI name, role, public email, official admissions link, and all source provenance.
- [ ] Reconfirm that News dates and claims remain source-backed and that Join Us does not imply unconfirmed openings, quotas, funding, scholarships, eligibility, or admission outcomes.
- [ ] Confirm publication titles, author order, venue, DOI, date precision, local PDF rights, and BibTeX against authoritative records.
- [ ] Confirm image publication rights, meaningful alt text, and explicit generated dimensions for every production image.
- [ ] Confirm every English production page has a reviewed Chinese counterpart with the same stable ID and `translationKey`.
- [ ] Run the pinned Hugo Extended version recorded in `.hugo-version`.
- [ ] Run the strict production build and require zero Hugo errors and zero warnings.
- [ ] Run `python scripts/audit-site.py public` and require zero critical errors.
- [ ] Repeat the build and audit with the exact intended public `baseURL`.
- [ ] Review Home, People, Research, Publications, Projects, News, Join Us, one detail page of each type, both languages, and the 404 page at desktop and mobile widths.
- [ ] Keyboard-check the skip link, primary navigation, language switch, publication filters, BibTeX controls, and all Join Us links.
- [ ] Validate representative JSON-LD documents as JSON and review their factual values and absolute URLs.
- [ ] Inspect `sitemap.xml`, `robots.txt`, root RSS, and News RSS using the final public URL.
- [ ] Confirm `public/`, `resources/_gen/`, credentials, private data, and local temporary files are not committed.

## Immediately After Deployment

- [ ] Open the final HTTPS URL and confirm the certificate, redirects, and repository subpath or custom-domain behavior.
- [ ] Confirm English `/`, Chinese `/zh/`, and the language switch work without redirect loops or 404 fallbacks.
- [ ] Confirm `/en/`, if published by Hugo, is only a redirect to `/` and is not used as an independent canonical URL.
- [ ] Open representative canonical and `hreflang` URLs from the deployed page source and confirm they resolve reciprocally.
- [ ] Open Home, People, Publications, Join Us, a News detail, a Project detail, a Research detail, and a deliberately missing URL in a real browser.
- [ ] Confirm the deployed 404 page is bilingual, returns the host's expected not-found behavior, links to the correct base-path home, and is not indexed.
- [ ] Fetch the deployed `sitemap.xml`, `robots.txt`, `/index.xml`, and `/news/index.xml`; confirm they are valid and use the final domain.
- [ ] Check the browser console and network panel for missing assets, mixed content, unexpected third-party requests, and JavaScript errors.
- [ ] Repeat keyboard and mobile-navigation checks on the deployed site.
- [ ] Record the deployment URL, release commit, verification date, reviewer, and any approved deviations.
- [ ] Keep the previous known-good Pages artifact or commit available for rollback if post-launch checks fail.
