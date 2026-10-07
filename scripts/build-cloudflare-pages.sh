#!/usr/bin/env bash
set -euo pipefail

python3 scripts/audit-content-pairs.py

if [[ "${CF_PAGES_BRANCH:-}" == "main" ]]; then
  hugo --gc --minify --cleanDestinationDir \
    --environment production \
    --panicOnWarning \
    --printPathWarnings \
    --baseURL "https://x-laboratory-678.github.io/X-laboratory/"
  python3 scripts/audit-site.py public
else
  hugo --gc --minify --cleanDestinationDir \
    --environment preview \
    --buildDrafts \
    --panicOnWarning \
    --printPathWarnings \
    --baseURL "https://x-laboratory-678.github.io/X-laboratory/"
fi
