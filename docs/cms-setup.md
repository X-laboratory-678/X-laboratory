# Pages CMS Access and Publishing

Pages CMS is the active content editor for the X-Laboratory website.

## Open the editor

- Admin landing page: https://x-laboratory-678.github.io/X-laboratory/admin/
- Pages CMS on the production branch: https://app.pagescms.org/x-laboratory-678/x-laboratory/main

Sign in with GitHub, or use the email invitation sent by a repository maintainer. Confirm that the repository header says `X-laboratory-678/X-laboratory`. The official Pages CMS GitHub App is installed for this repository only.

## Editor access

A GitHub user with repository write access can edit the repository, including site code and workflows. Give that access only to trusted maintainers.

For editors without GitHub accounts, a maintainer can invite them by email in Pages CMS. Pages CMS collaborators can edit content and media in the invited repository, but cannot change `.pages.yml`, manage collaborators, or access other repositories.

## Collections and language labels

Pages CMS has ten collections: People, Publications, Projects and Tools, Research, News, Grants, Opportunities, Events, Resources, and Materials. Each item appears with a `【英文】` or `【中文】` marker. The English and Chinese files remain separate entries in the same page bundle.

Research directions are maintained with their controlled vocabulary by a maintainer. Creating a Research entry is disabled.

## Create a bilingual draft

For People, Publications, Projects and Tools, News, Grants, Opportunities, Events, Resources, or Materials:

1. Open the collection and choose **创建双语草稿**.
2. Enter a lowercase English ID using letters, numbers, and hyphens, plus an English title and a Chinese title.
3. Confirm. The action uses the matching Hugo archetype to create `index.en.md` and `index.zh.md` in one page bundle.
4. Edit both language entries. Fill in every field marked required; keep the ID, translation key, bundle path, and relationships unchanged.

The two new files start as drafts and do not appear on the public website. IDs cannot be reused. Renaming and deleting records remain disabled.

## Publish both languages

When both drafts are complete:

1. Open either language entry and choose **发布中英文版本**.
2. Confirm the action.
3. The workflow checks that both files exist, their IDs and translation keys match, both are drafts, language labels are correct, and required fields are filled.
4. It then runs the bilingual file audit, a strict production Hugo build using the GitHub Pages base path, and the generated-site audit.
5. Only after all checks pass does it commit both files. On `main`, the workflow deploys the exact site artifact it just verified.

If a check fails, no commit or deployment is made, so both files remain drafts. Read the failed GitHub Actions run and ask a maintainer for help.

Use the production `main` branch for changes intended for the live site. Testing on another branch will commit to that branch; publishing there does not deploy to the production website.

## Edit existing records

Pages CMS saves edits to the currently selected branch. On `main`, each save continues to run the existing bilingual check, strict Hugo build, site audit, and deployment workflow. Edit the matching English and Chinese entries when the change applies to both languages.

Existing page-bundle images remain read-only. People portraits can be uploaded to `static/uploads/`; use the same uploaded image path in both language files and provide suitable alt text. Other image fields remain read-only.

A failed existing-record check does not remove the content commit from `main`; the live website stays on the last successful deployment. Record the failed run and ask a maintainer to fix or revert it.

## Safe editing rules

- Do not change stable IDs, translation keys, filenames, or existing relationships.
- Do not put passwords, API tokens, private keys, webhook secrets, or one-time setup links in website content.
- Confirm permission before publishing a person's photo and provide descriptive alt text.
- Ask a maintainer if a required value is unclear or a publishing check fails.

## Legacy editor

The Cloudflare Worker editor at https://x-lab-cms-editor.fangx6531.workers.dev/editor/ is a maintainer-only fallback during the observation period. Editors should use Pages CMS and must not edit the same record in both systems.

The previous Sveltia CMS configuration remains in `static/admin/config.yml` for reference; it is not the current `/admin/` entry.
