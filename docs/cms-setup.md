# Pages CMS Access and Publishing

Pages CMS is the active content editor for the X-Laboratory website.

## Open the editor

Use either entry:

- Admin landing page: https://x-laboratory-678.github.io/X-laboratory/admin/
- Pages CMS for the production branch: https://app.pagescms.org/x-laboratory-678/x-laboratory/main

Sign in with GitHub. Check the repository name in the Pages CMS header before editing; it must be X-laboratory-678/X-laboratory. The official Pages CMS GitHub App is installed for this repository only. The old Cloudflare Worker editor remains linked from the admin landing page for rollback.

## Editor access

A GitHub user needs access to this repository to sign in and edit the repository. GitHub repository write access also permits changes to files outside the content editor, including site code and workflows, so grant it only to trusted maintainers.

For content editors who should not receive a GitHub account, a repository maintainer can invite them by email using the Collaborators controls in Pages CMS. Pages CMS collaborators can edit content and media in the invited repository, but they cannot manage the CMS configuration or invite other collaborators. Invite each person only to this repository.

## What editors can change

Pages CMS shows ten existing content collections: People, Publications, Projects and Tools, Research, News, Grants, Opportunities, Events, Resources, and Materials. Current records can be edited. Creating, renaming, or deleting records is disabled to protect stable URLs, IDs, and bilingual page bundles. Research records are editable, but their stable IDs and translation keys are read-only.

English and Chinese files are separate entries. Open the same record in each language and make the matching change in both files where appropriate. Keep the existing stable ID, translation key, bundle path, and relationships unchanged.

Existing Page Bundle images remain read-only. People portraits have an optional upload field that stores new images in static/uploads/. Use the same uploaded image path in both language files and provide suitable alt text. Other image fields remain read-only. See pages-cms-media-pilot.md for the current media rules.

## Save and publish

The production link opens the main branch. Saving there creates a Git commit directly on main; it does not create a review pull request. Each commit starts the GitHub Actions workflow:

1. Check the bilingual content files.
2. Build the Hugo site using the pinned Hugo version.
3. Audit the generated website.
4. Deploy the new site to GitHub Pages if all steps pass.

A failed check does not remove the content commit from main. The live website remains on the last successful deployment. If this happens, record the error and affected content, then ask a maintainer to fix or revert the commit. Recheck the live page after a successful deployment.

Use GitHub pull requests for changes to code, the CMS configuration, controlled vocabularies, or this publishing setup. Do not edit those files through Pages CMS.

## Safe editing rules

- Make one content change at a time and wait for the save to finish.
- Review both language versions before finishing.
- Do not change stable IDs, translation keys, filenames, or existing relationships.
- Do not put passwords, API tokens, private keys, webhook secrets, or one-time setup links into content.
- Ask a maintainer when a field is unclear, a required value is missing, or a publishing check fails.
- Confirm permission to publish a person's image and use descriptive alt text.

## Rollback

The Cloudflare Worker editor remains available from the admin landing page during the observation period. If Pages CMS is unavailable, use the old editor only for content that it supports and avoid editing the same record in both editors at once. A maintainer can repair or revert Git changes and confirm the Pages deployment.

The previous Sveltia configuration remains in static/admin/config.yml for reference. It is not the current /admin/ entry and still depends on its former OAuth setup.
