# X-Laboratory local content editor

This independent Cloudflare Worker adds local editor accounts without changing the existing Sveltia CMS at `/admin/`. The Worker serves its own editor page and same-origin API at `/editor/` and `/api/`. GitHub OAuth is used only for the separate administrator area. Local editors never receive GitHub credentials or repository write access.

## What it does

- Reads the existing Sveltia collection and field definitions from `static/admin/config.yml` on the main branch.
- Edits bilingual Hugo page bundles while keeping English and Chinese content separate. Fields marked `i18n: duplicate` are synchronized in both front-matter files.
- Limits writes to content Markdown and uploaded images. It cannot edit site code, workflows, CMS configuration, or authentication settings.
- Creates a content-only branch and pull request through a GitHub App installed on this repository only.
- Merges only its own pull requests after the `Build and audit` check and every check run on the commit have completed successfully. Failed checks leave the pull request open and unmerged.
- Seeds the pending local editor account `k`. An administrator issues a one-time setup link; the editor chooses a new password. No initial password is embedded in this repository.

## Deployment

1. Run `npx wrangler d1 create x-lab-cms-editor` to create a Cloudflare D1 database. Put its database ID in `wrangler.toml`, then run `npm ci` and `npm run db:migrate:remote` from this folder.
2. Create a separate GitHub OAuth App for this Worker. Its callback URL is `https://<worker-host>/auth/github/callback`. Keep the existing Sveltia callback and OAuth App unchanged. Set the Worker secrets `ADMIN_GITHUB_CLIENT_ID` and `ADMIN_GITHUB_CLIENT_SECRET`. Set `ADMIN_GITHUB_USERS` to the comma-separated GitHub logins allowed to manage editor accounts; the default is `X-laboratory-678`.
3. Create a GitHub App for the content editor and install it on only `X-laboratory-678/X-laboratory`. Grant repository permissions: Contents read/write, Pull requests read/write, Checks read, and Metadata read. Subscribe its webhook to `check_suite` and `deployment_status`; set the webhook URL to `https://<worker-host>/webhooks/github`. After installing the App, get its installation ID from the App installation's Configure page URL. Store `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET` as Worker secrets.
4. Generate a random `PASSWORD_PEPPER` secret and set it with `npx wrangler secret put PASSWORD_PEPPER`. Add each OAuth and GitHub App credential as a Worker secret with `npx wrangler secret put ADMIN_GITHUB_CLIENT_ID`, `ADMIN_GITHUB_CLIENT_SECRET`, `GITHUB_APP_ID`, `GITHUB_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY`, and `GITHUB_WEBHOOK_SECRET`. Never put passwords, OAuth secrets, private keys, webhook secrets, or pepper in this repository or in a chat. Editors derive a PBKDF2 key in the browser; the Worker stores a peppered HMAC verifier, never the plaintext password.
5. Set the D1, OAuth, and GitHub App secrets, then deploy with `npm run deploy`. Open `https://<worker-host>/editor/` to confirm the Worker page and `/health` to check the API.
6. Update `static/editor/config.js` with the deployed Worker origin and publish that small launcher change to main. Then `https://x-laboratory-678.github.io/X-laboratory/editor/` opens the editor. The Worker URL is public; credentials and secrets are not.
7. Sign in to the editor as an allowlisted GitHub administrator. The seeded `k` account appears as pending setup. Issue a one-time link and deliver it privately to the editor. The link expires after 30 minutes and can be used once. Account reset uses the same one-time flow.

## GitHub App webhook and automatic merge

The Worker validates `X-Hub-Signature-256`, verifies the repository and matching editor-created pull request, confirms the `Build and audit` check passed and that no check run failed or remains incomplete, then asks GitHub to squash-merge that pull request. It does not merge unrelated pull requests. `deployment_status` updates the editor's publish status after GitHub Pages deploys. A failed build remains unmerged; a failed Pages deployment is surfaced after merge so an administrator can repair the deployment.

Main-branch protections still apply. Configure the repository's required checks and merge rules so the GitHub App can satisfy them. Do not grant the App access to any other repository.

## Local verification

Run `npm ci`, `npm run db:migrate:local`, and `npm run dev`. The Worker requires Cloudflare bindings and GitHub OAuth/App secrets to exercise protected flows. The public editor launcher remains inactive until `static/editor/config.js` contains the deployed Worker origin.

