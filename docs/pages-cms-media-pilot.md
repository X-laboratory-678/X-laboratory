# Pages CMS media pilot

This pilot leaves existing portrait files and `photo` front matter in each People Page Bundle. Pages CMS uploads test/new portraits to `static/uploads/` through an additional optional `photoUpload` field.

## Editor workflow

1. Open the English or Chinese record and use **新头像（上传）** to upload or select an image.
2. Set the same uploaded image in the other language version of the person record. The build requires both translations to use the same path.
3. Keep **现有头像文件（页面包）** unchanged. If **新头像（上传）** is empty, the site keeps displaying the existing portrait.
4. Enter or retain meaningful alternative text in **photoAlt**.

New upload URLs are stored as `/uploads/<filename>` and rendered with Hugo's `relURL`, which applies the configured Project Pages subpath. The build rejects an upload path outside `/uploads/`, a missing file, missing alt text, or a mismatch between translations.

## Pilot scope

This only enables People portraits. Publications, projects, news, grants, and materials keep their image fields read-only until each field has a matching template and validator. Existing files are not moved. Keep production editors and routes on the current setup until the draft PR's image upload and CI checks pass.
