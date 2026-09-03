# Launch Checklist

Use this checklist before a GitHub Pages release, after binding a custom domain, and after any change to the public base URL. The first Project Pages deployment was completed and verified on 2026-07-20; unchecked editorial and rights-review items remain ongoing launch responsibilities.

## Deployment Record

- Repository: `https://github.com/X-laboratory-678/X-laboratory`
- Pages URL: `https://x-laboratory-678.github.io/X-laboratory/`
- Deployment mode: GitHub Actions artifact to GitHub Project Pages
- Initial deployed source commit: `595b5cc7c1b87d6d6af481d0912c66f57352d6c7`
- Verification date: 2026-07-20
- Custom domain / `CNAME`: not configured
- Verified production content counts: 1 person, 3 research areas, 3 projects, 5 publications, 2 news items, 0 visible fixtures

## Before Deployment

- [x] Configure an explicitly authorized GitHub repository as `origin`; never infer an account or repository name.
- [x] Inspect any existing remote history before the first push and do not overwrite it.
- [x] In repository settings, select **Pages → Source → GitHub Actions**.
- [x] Confirm the public GitHub Pages or custom-domain URL, including whether a repository subpath is required.
- [x] Pass the Pages-provided `baseURL` through the deployment build; do not hard-code it in layouts or content.
- [x] Confirm that no `CNAME` is required for the current Project Pages deployment.
- [ ] Replace the provisional `static/favicon.svg` only with an approved, original or rights-cleared laboratory identity; do not reuse the university logo without permission.
- [x] Review the laboratory name, institution, unit, PI name, role, public email, official admissions link, and all source provenance.
- [x] Reconfirm that News dates and claims remain source-backed and that Join Us does not imply unconfirmed openings, quotas, funding, scholarships, eligibility, or admission outcomes.
- [x] Confirm publication titles, author order, venue, DOI, date precision, local PDF rights, and BibTeX against authoritative records.
- [x] Confirm that production contains no content images or local PDFs requiring rights review; future assets still require approval, alt text, and explicit dimensions.
- [x] Confirm every English production page has a reviewed Chinese counterpart with the same stable ID and `translationKey`.
- [x] Run the pinned Hugo Extended version recorded in `.hugo-version`.
- [x] Run the strict production build and require zero Hugo errors and zero warnings.
- [x] Run `python scripts/audit-site.py public` and require zero critical errors.
- [x] Repeat the build and audit with the exact intended public `baseURL`.
- [x] Review Home, People, Research, Publications, Projects, News, Join Us, one detail page of each type, both languages, and the 404 page at desktop and mobile widths.
- [x] Keyboard-check the skip link, primary navigation, language switch, publication filters, BibTeX controls, and all Join Us links.
- [x] Validate representative JSON-LD documents as JSON and review their factual values and absolute URLs.
- [x] Inspect `sitemap.xml`, `robots.txt`, root RSS, and News RSS using the final public URL.
- [x] Confirm `public/`, `resources/_gen/`, credentials, private data, and local temporary files are not committed.

## Immediately After Deployment

- [x] Open the final HTTPS URL and confirm HTTPS, redirects, and repository-subpath behavior.
- [x] Confirm English `/`, Chinese `/zh/`, and the language switch work without redirect loops or 404 fallbacks.
- [x] Confirm `/en/` is only a redirect to `/` and is not used as an independent canonical URL.
- [x] Open representative canonical and `hreflang` URLs from the deployed page source and confirm they resolve reciprocally.
- [x] Open Home, People, Publications, Join Us, a News detail, a Project detail, a Research detail, and a deliberately missing URL in a real browser.
- [x] Confirm the deployed 404 page is bilingual, returns the host's expected not-found behavior, links to the correct base-path home, and is not indexed.
- [x] Fetch the deployed `sitemap.xml`, `robots.txt`, `/index.xml`, and `/docs/home/news/index.xml`; confirm they use the final domain.
- [x] Check the browser console and network activity for missing assets, mixed content, unexpected third-party requests, and JavaScript errors.
- [x] Repeat keyboard and mobile-navigation checks on the deployed site.
- [x] Record the deployment URL, release commit, verification date, and deviations.
- [x] Keep the previous known-good Pages commit available for rollback if post-launch checks fail.

## Milestone 10 Final Audit

- [x] Test the live site in the installed Microsoft Edge and Google Chrome browsers.
- [x] Test 1280, 768, 600, 375, and 320 CSS-pixel widths without horizontal page overflow.
- [x] Verify keyboard navigation, mobile focus handling, publication filters, BibTeX view/copy/raw access, Join links, and no-JavaScript fallback.
- [x] Recheck live canonical, reciprocal `hreflang`, Open Graph, JSON-LD, sitemap, robots, RSS, and custom 404 behavior.
- [x] Audit the complete Git history for common PAT, password, private-key, and token patterns.
- [x] Confirm workflow permissions, Pages environment, HTTPS enforcement, repository hygiene, and zero runtime third-party dependencies.
- [x] Complete `docs/maintenance.md` and `docs/handover.md`.

## Open Approval and Environment Items

- [ ] Approve and replace the provisional favicon with a final official, rights-cleared laboratory identity.
- [ ] Add a PI portrait only if an approved image and publication permission become available.
- [ ] Configure a custom domain only if the laboratory chooses one and the DNS/Pages change is reviewed.
- [ ] Register Search Console only if maintainers want the optional external service.
- [ ] Restore Git HTTPS certificate verification in the workstation's system-level Git configuration and investigate Windows certificate-revocation connectivity. This is not a repository setting.
- [ ] Perform direct Firefox, WebKit, and Safari testing when those engines or appropriate devices are available.
