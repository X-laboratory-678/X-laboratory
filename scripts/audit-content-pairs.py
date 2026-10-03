#!/usr/bin/env python3
"""Require both configured CMS locales for every managed page bundle."""

from __future__ import annotations

import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"
SECTIONS = (
    "people",
    "research",
    "publications",
    "projects",
    "news",
    "grants",
    "opportunities",
    "events",
    "resources",
    "materials",
)
LOCALE_FILES = {"index.en.md", "index.zh.md"}


def main() -> int:
    errors: list[str] = []
    checked = 0

    for section in SECTIONS:
        section_root = CONTENT / section
        if not section_root.is_dir():
            errors.append(f"missing managed content section: content/{section}")
            continue

        bundle_dirs: set[Path] = set()
        for path in section_root.rglob("index*.md"):
            # Hugo section indexes are navigation/configuration files, not records.
            # Materials has a root leaf bundle that renders the materials directory.
            if path.parent == section_root and section != "materials":
                continue
            bundle_dirs.add(path.parent)

        for bundle_dir in sorted(bundle_dirs):
            present = {path.name for path in bundle_dir.glob("index*.md")}
            unknown = present - LOCALE_FILES
            relative_dir = bundle_dir.relative_to(ROOT).as_posix()
            if unknown:
                errors.append(
                    f"{relative_dir}: unsupported bundle index file(s): "
                    + ", ".join(sorted(unknown))
                )
            missing = LOCALE_FILES - present
            if missing:
                errors.append(
                    f"{relative_dir}: missing bilingual file(s): "
                    + ", ".join(sorted(missing))
                )
            if not unknown and not missing:
                checked += 1

    if errors:
        print("Bilingual CMS content audit failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1

    print(f"Bilingual CMS content audit passed ({checked} page bundles checked).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
