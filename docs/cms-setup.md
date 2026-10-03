# Sveltia CMS Setup

This guide completes the external account configuration for the CMS implementation in this repository. The repository changes configure the editor and its checks, but they do not deploy an OAuth Worker or change GitHub settings. Sign-in will not work until the owner completes these steps.

## What the CMS manages

Open the editor at:

```text
https://x-laboratory-678.github.io/X-laboratory/admin/
```

The CMS edits the existing Markdown page bundles in Git. It creates content pull requests; merging a passing pull request into `main` is what publishes the update through GitHub Pages.

The configured collections are People, Publications, Projects and Tools, Research, News, Grants, Opportunities, Events, Resources, and Materials. Research is edit-only so its IDs remain aligned with the controlled research vocabulary. Event-series landing pages are maintained as site structure; the Events collection contains specific events. Tools are Projects whose `projectType` is `tool`. Every editable item needs `index.en.md` and `index.zh.md`.

The site includes future-dated pages in production builds so an event can be published before its scheduled date. A pull request's merge is the publication action; do not use a future date as an embargo.

## GitHub access

Every CMS user must have **Write** access to `X-laboratory-678/X-laboratory`. GitHub's repository backend grants access at repository level: CMS users can also read and modify source code, workflows, and other repository files outside the CMS. Invite only trusted collaborators. The designated content owner is [@X-laboratory-678](https://github.com/X-laboratory-678).

## Deploy the OAuth Worker

1. Create a GitHub OAuth App under the account that will own the integration. Set its homepage URL to `https://x-laboratory-678.github.io/X-laboratory/admin/`.
2. Deploy the official [Sveltia CMS Auth Worker](https://github.com/sveltia/sveltia-cms-auth) to a Cloudflare account. Follow its current deployment instructions and use the URL Cloudflare assigns, for example `https://<worker-name>.<account-subdomain>.workers.dev`.
3. Set the OAuth App's authorization callback URL to `<worker-url>/callback`.
4. Configure the Worker variables:
   - `GITHUB_CLIENT_ID`: the OAuth App client ID.
   - `GITHUB_CLIENT_SECRET`: the OAuth App secret, stored as an encrypted Worker secret.
   - `ALLOWED_DOMAINS`: `x-laboratory-678.github.io`.
5. Keep the client secret in Cloudflare's secret store. Never put it in this repository, `static/admin/config.yml`, or a pull request.
6. Replace the placeholder `backend.base_url` in `static/admin/config.yml` with the Worker URL, without a trailing slash. Review and merge that change through the normal pull-request checks.

The Worker URL is intentionally a placeholder in the checked-in config. Do not treat the example hostname as a live authentication service.

## Configure GitHub Pages and repository rules

In repository settings, select **GitHub Actions** as the Pages build and deployment source. Then configure rulesets for the default branch `main`. Use the separate rules described below so an owner bypass for the CODEOWNERS rule does not bypass CI or the PR-only merge restriction.

### Ruleset A: required PR and CI

- Target branch: `main`.
- Require a pull request before merging.
- Require at least one approval from someone other than the PR author.
- Require the `Build and audit` status check from `.github/workflows/pages.yml`.
- Do not add bypass actors.

The workflow checks the bilingual pair audit, Hugo production build, and generated-site audit on pull requests. GitHub displays the job check as `Build and audit`; select the exact check emitted by the workflow if the repository UI shows a qualified name.

### Ruleset B: owner review of content

- Target branch: `main`.
- Require approval from Code Owners.
- Add `X-laboratory-678` as a bypass actor for pull requests only.

`.github/CODEOWNERS` assigns `/content/` to `@X-laboratory-678`. This makes owner review required for content pull requests under the normal merge path. GitHub ruleset bypass actors cannot be limited to bypassing only their own authored pull requests, so the owner can technically bypass this review requirement on any pull request. Use that bypass only when the owner authored the PR; for everyone else's content PR, the owner should approve it normally. Ruleset A still requires a separate approval and the CI check.

### Ruleset C: only the owner can update `main`

- Target branch: `main`.
- Enable **Restrict updates**.
- Add `X-laboratory-678` as the only bypass actor, with pull-request-only bypass.
- Do not allow direct pushes as a bypass.

Other repository writers can prepare and submit pull requests, but only the owner can merge changes into `main`. The owner must merge through a pull request so Ruleset A's status check and approval requirements still apply. GitHub does not provide a rule that limits an actor's bypass to a particular PR author; this restriction therefore controls who may exercise the bypass, while the owner-review procedure above controls when it should be used.

After setup, verify a non-member cannot sign in, an authorized writer can open a CMS pull request, failing CI blocks merge, a content change requests owner review, and only the owner can merge. Finally, merge an approved change and confirm the Pages deployment completes.

## Routine editor workflow

1. Open `/admin/` and sign in with an authorized GitHub account.
2. Create or edit an entry, and complete both language versions.
3. Submit the CMS change as a pull request.
4. Review the generated paths. New records should use `content/<collection>/<stable-id>/index.en.md` and `index.zh.md`; keep the same stable ID and `translationKey` in both translations.
5. Wait for the bilingual audit, strict Hugo build, and generated-site audit. Resolve failures before requesting final review.
6. The owner reviews content changes and merges the passing PR. GitHub Pages deploys from `main`.

Controlled vocabularies and site-wide settings are deliberately not editable in the CMS. Adding a content type, changing a vocabulary, or changing site behavior requires a code change and review.
