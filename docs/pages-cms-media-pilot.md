# Pages CMS image and media scope

This configuration is active on the main branch. The production entry at /admin/ opens Pages CMS for X-laboratory-678/X-laboratory.

## People portraits

Existing portrait files remain in each person's Hugo Page Bundle and the existing photo field is read-only. New or replacement portraits use the optional photoUpload field and are stored in static/uploads/. Keep photoAlt accurate and use the same uploaded path in both the Chinese and English files for that person.

When photoUpload is empty, the page continues to use the existing Page Bundle portrait. The site renders uploads with a base-path-aware URL, so images work at the GitHub Project Pages subpath.

## Other image fields

Existing image paths for publications, projects, news, grants, opportunities, and materials remain read-only. Their Page Bundle files are unchanged. Uploading to a shared media folder cannot safely select the right directory for each existing bundle, so do not edit those paths through Pages CMS.

## Validation and publishing

The bilingual audit checks that both language files reference the same uploaded path, the image exists under static/uploads/, and meaningful alt text is present. The production workflow then runs the Hugo build and generated-site audit before deployment.

A Pages CMS save to main creates a commit immediately. If a build or audit fails, the commit remains in Git while the live site stays on the last successful deployment. Fix the content or revert the bad commit through the repository, then confirm the next deployment succeeds.

## Current limits

Pages CMS can edit existing configured records. Creating, renaming, and deleting records are disabled while the bilingual page-bundle workflow is being stabilized. New records and changes to controlled vocabularies still need a maintainer to prepare and review them through Git.
