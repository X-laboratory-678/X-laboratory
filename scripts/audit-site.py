#!/usr/bin/env python3
"""Audit a generated Hugo site using only the Python standard library."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any
from urllib.parse import unquote, urljoin, urlparse
import xml.etree.ElementTree as ET


PLACEHOLDERS = (
    "LAB_NAME",
    "LAB_NAME_ZH",
    "LAB_DOMAIN",
    "PI_NAME",
    "UNIVERSITY_NAME",
    "Example Student",
    "Example Alumnus",
    "Example Publication",
    "Example Project",
    "Example News",
    "示例学生",
    "示例校友",
    "示例论文",
    "示例项目",
    "示例动态",
)

EDITORIAL_LEAKAGE_PHRASES = (
    "缺少直接证据时",
    "本页面不为项目归属",
    "未导入",
    "开发 fixture",
    "稳定 ID",
    "构建验证",
    "反向聚合",
    "编辑性翻译",
    "不据此推断",
    "依据内容中明确填写的研究方向 ID 自动汇总",
    "in the absence of direct evidence",
    "without direct evidence",
    "not imported",
    "development fixture",
    "stable ID",
    "Front Matter",
    "reverse aggregation",
    "editorial translation",
    "are maintained on the related publication page",
    "aggregated by their explicit research-area IDs",
)

BLOCKED_ROUTE_PARTS = (
    "/example-",
    "/people/lab-director/",
    "/people/pi/",
)

URL_KEYS = {"url", "@id", "sameAs", "contentUrl", "mainEntityOfPage"}

APPROVED_EXTERNAL_IFRAMES = {
    ("https", "www.openstreetmap.org", "/export/embed.html"),
}


@dataclass
class Document:
    path: Path
    relative: str
    lang: str = ""
    titles: list[str] = field(default_factory=list)
    descriptions: list[str] = field(default_factory=list)
    links: list[dict[str, str]] = field(default_factory=list)
    metas: list[dict[str, str]] = field(default_factory=list)
    references: list[tuple[str, str, str]] = field(default_factory=list)
    ids: list[str] = field(default_factory=list)
    h1_count: int = 0
    headings: list[int] = field(default_factory=list)
    json_ld: list[str] = field(default_factory=list)
    visible_text: list[str] = field(default_factory=list)
    images: list[dict[str, str]] = field(default_factory=list)
    controls: list[tuple[str, dict[str, str]]] = field(default_factory=list)
    labels_for: set[str] = field(default_factory=set)
    aria_references: list[tuple[str, str]] = field(default_factory=list)
    time_elements: list[dict[str, str]] = field(default_factory=list)

    @property
    def is_404(self) -> bool:
        return self.relative == "404.html" or self.relative.endswith("/404.html")

    @property
    def is_alias(self) -> bool:
        return any(
            meta.get("http-equiv", "").lower() == "refresh"
            for meta in self.metas
        )

    @property
    def indexable(self) -> bool:
        return not self.is_404 and not self.is_alias and not any(
            "noindex" in meta.get("content", "").lower()
            for meta in self.metas
            if meta.get("name", "").lower() == "robots"
        )

    def link_values(self, rel_name: str) -> list[str]:
        return [
            attrs.get("href", "")
            for attrs in self.links
            if rel_name in attrs.get("rel", "").lower().split()
        ]

    def canonical(self) -> str:
        values = self.link_values("canonical")
        return values[0] if len(values) == 1 else ""

    def hreflang(self) -> dict[str, str]:
        return {
            attrs["hreflang"]: attrs.get("href", "")
            for attrs in self.links
            if "alternate" in attrs.get("rel", "").lower().split()
            and attrs.get("hreflang")
        }


class SiteHTMLParser(HTMLParser):
    def __init__(self, document: Document) -> None:
        super().__init__(convert_charrefs=True)
        self.document = document
        self._title_depth = 0
        self._json_depth = 0
        self._json_parts: list[str] = []
        self._hidden_depth = 0

    @staticmethod
    def attrs_dict(attrs: list[tuple[str, str | None]]) -> dict[str, str]:
        return {key.lower(): value or "" for key, value in attrs}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = self.attrs_dict(attrs)
        tag = tag.lower()
        if tag == "html":
            self.document.lang = data.get("lang", "")
        if tag == "title":
            self._title_depth += 1
            self.document.titles.append("")
        if tag in {"script", "style", "template", "noscript"}:
            self._hidden_depth += 1
        if tag == "script" and data.get("type", "").lower() == "application/ld+json":
            self._json_depth += 1
            self._json_parts = []
        if tag == "meta":
            self.document.metas.append(data)
            if data.get("name", "").lower() == "description":
                self.document.descriptions.append(data.get("content", "").strip())
        if tag == "link":
            self.document.links.append(data)
        if "id" in data:
            self.document.ids.append(data["id"])
        if tag == "h1":
            self.document.h1_count += 1
        if re.fullmatch(r"h[1-6]", tag):
            self.document.headings.append(int(tag[1]))
        if tag in {"a", "link"} and data.get("href"):
            self.document.references.append((tag, "href", data["href"]))
        if tag in {"img", "script", "iframe", "source", "video", "audio"} and data.get("src"):
            self.document.references.append((tag, "src", data["src"]))
        if tag == "source" and data.get("srcset"):
            for candidate in data["srcset"].split(","):
                self.document.references.append((tag, "srcset", candidate.strip().split()[0]))
        if tag == "img":
            self.document.images.append(data)
        if tag in {"input", "select", "textarea", "button"}:
            self.document.controls.append((tag, data))
        if tag == "label" and data.get("for"):
            self.document.labels_for.add(data["for"])
        for attribute in ("aria-labelledby", "aria-describedby", "aria-controls"):
            if data.get(attribute):
                self.document.aria_references.append((attribute, data[attribute]))
        if tag == "time":
            self.document.time_elements.append(data)

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title" and self._title_depth:
            self._title_depth -= 1
        if tag == "script" and self._json_depth:
            self.document.json_ld.append("".join(self._json_parts).strip())
            self._json_depth -= 1
            self._json_parts = []
        if tag in {"script", "style", "template", "noscript"} and self._hidden_depth:
            self._hidden_depth -= 1

    def handle_data(self, data: str) -> None:
        if self._title_depth and self.document.titles:
            self.document.titles[-1] += data
        if self._json_depth:
            self._json_parts.append(data)
        if not self._hidden_depth and not self._title_depth:
            text = " ".join(data.split())
            if text:
                self.document.visible_text.append(text)


class Audit:
    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.documents: dict[str, Document] = {}
        self.errors: list[str] = []
        self.notes: list[str] = []
        self.site_origin = ""
        self.base_path = "/"
        self.runtime_js: set[str] = set()
        self.runtime_css: set[str] = set()

    def error(self, message: str) -> None:
        self.errors.append(message)

    def load(self) -> None:
        if not self.root.is_dir():
            self.error(f"generated site directory does not exist: {self.root}")
            return
        for path in sorted(self.root.rglob("*.html")):
            relative = path.relative_to(self.root).as_posix()
            document = Document(path=path, relative=relative)
            parser = SiteHTMLParser(document)
            try:
                parser.feed(path.read_text(encoding="utf-8"))
                parser.close()
            except (OSError, UnicodeError) as exc:
                self.error(f"{relative}: cannot read HTML: {exc}")
                continue
            document.titles = [" ".join(value.split()) for value in document.titles]
            self.documents[relative] = document

        home = self.documents.get("index.html")
        if not home or not home.canonical():
            self.error("index.html: cannot determine site base URL from canonical")
            return
        parsed = urlparse(home.canonical())
        self.site_origin = f"{parsed.scheme}://{parsed.netloc}"
        self.base_path = parsed.path if parsed.path.endswith("/") else f"{parsed.path}/"

    def expected_url(self, document: Document) -> str:
        if document.relative == "index.html":
            route = ""
        elif document.relative.endswith("/index.html"):
            route = f"{document.relative[:-10]}/"
        else:
            route = document.relative
        return urljoin(f"{self.site_origin}{self.base_path}", route)

    def local_path(self, url: str, source: Document | None = None) -> tuple[Path | None, str]:
        base = source.canonical() if source and source.canonical() else f"{self.site_origin}{self.base_path}"
        absolute = urljoin(base, url)
        parsed = urlparse(absolute)
        if parsed.scheme not in {"http", "https"} or f"{parsed.scheme}://{parsed.netloc}" != self.site_origin:
            return None, parsed.fragment
        path = unquote(parsed.path)
        if self.base_path != "/" and not path.startswith(self.base_path):
            return Path("__outside_base__") / path.lstrip("/"), parsed.fragment
        relative = path[len(self.base_path):] if self.base_path != "/" else path.lstrip("/")
        candidate = self.root / PurePosixPath(relative)
        if path.endswith("/"):
            candidate = candidate / "index.html"
        elif not candidate.suffix and not candidate.exists():
            candidate = candidate / "index.html"
        return candidate, parsed.fragment

    def audit_metadata(self) -> None:
        titles_by_lang: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        descriptions_by_lang: dict[str, dict[str, list[str]]] = defaultdict(lambda: defaultdict(list))
        for document in self.documents.values():
            if document.is_alias:
                canonicals = document.link_values("canonical")
                if len(canonicals) != 1:
                    self.error(f"{document.relative}: redirect alias must have one canonical")
                continue

            expected_lang = "zh-CN" if document.relative.startswith("zh/") else "en"
            if document.lang != expected_lang:
                self.error(f"{document.relative}: html lang is {document.lang!r}, expected {expected_lang!r}")
            if len(document.titles) != 1 or not document.titles[0]:
                self.error(f"{document.relative}: expected exactly one non-empty title")
            if len(document.descriptions) != 1 or len(document.descriptions[0]) < 10:
                self.error(f"{document.relative}: expected exactly one useful meta description")
            if document.h1_count != 1:
                self.error(f"{document.relative}: expected exactly one h1, found {document.h1_count}")
            for previous, current in zip(document.headings, document.headings[1:]):
                if current > previous + 1:
                    self.error(f"{document.relative}: heading level jumps from h{previous} to h{current}")

            if document.is_404:
                if document.link_values("canonical"):
                    self.error("404.html: must not emit a canonical")
                if not any("noindex" in meta.get("content", "").lower() for meta in document.metas):
                    self.error("404.html: missing noindex robots directive")
                if any(tag == "script" and attr == "src" for tag, attr, _ in document.references):
                    self.error("404.html: must not load runtime JavaScript")
                continue

            if len(document.link_values("canonical")) != 1:
                self.error(f"{document.relative}: expected exactly one canonical")
            elif document.canonical() != self.expected_url(document):
                self.error(f"{document.relative}: canonical is not self-referential")
            if document.titles:
                titles_by_lang[document.lang][document.titles[0]].append(document.relative)
            if document.descriptions:
                descriptions_by_lang[document.lang][document.descriptions[0]].append(document.relative)

            og = {
                meta.get("property", ""): meta.get("content", "")
                for meta in document.metas
                if meta.get("property", "").startswith("og:")
            }
            required_og = {"og:title", "og:description", "og:url", "og:type", "og:site_name", "og:locale"}
            missing_og = sorted(key for key in required_og if not og.get(key))
            if missing_og:
                self.error(f"{document.relative}: missing Open Graph fields: {', '.join(missing_og)}")
            if og.get("og:url") != document.canonical():
                self.error(f"{document.relative}: og:url does not match canonical")
            localized_relative = document.relative.removeprefix("zh/")
            article_expected = (
                localized_relative.startswith("docs/home/news/")
                and localized_relative != "docs/home/news/index.html"
            ) or (
                localized_relative.startswith("docs/research/publications/")
                and localized_relative != "docs/research/publications/index.html"
            )
            if og.get("og:type") != ("article" if article_expected else "website"):
                self.error(f"{document.relative}: incorrect og:type {og.get('og:type')!r}")

        for lang, values in titles_by_lang.items():
            for value, paths in values.items():
                if len(paths) > 1:
                    self.error(f"duplicate title in {lang}: {value!r} ({', '.join(paths)})")
        for lang, values in descriptions_by_lang.items():
            for value, paths in values.items():
                if len(paths) > 1:
                    self.error(f"duplicate meta description in {lang}: {value!r} ({', '.join(paths)})")

    def audit_languages(self) -> None:
        expected_languages = {"en", "zh-CN"}
        by_canonical = {doc.canonical(): doc for doc in self.documents.values() if doc.indexable and doc.canonical()}
        for document in self.documents.values():
            if not document.indexable:
                continue
            alternates = document.hreflang()
            if set(alternates) != expected_languages:
                self.error(f"{document.relative}: hreflang set is {sorted(alternates)}, expected {sorted(expected_languages)}")
                continue
            if alternates.get(document.lang) != document.canonical():
                self.error(f"{document.relative}: self hreflang does not match canonical")
            for language, target_url in alternates.items():
                target = by_canonical.get(target_url)
                if not target:
                    self.error(f"{document.relative}: hreflang {language} target is not an indexable page: {target_url}")
                elif target.hreflang().get(document.lang) != document.canonical():
                    self.error(f"{document.relative}: hreflang relationship is not reciprocal with {target.relative}")

    def audit_json_ld(self) -> None:
        def inspect(value: Any, path: str, document: Document) -> None:
            if isinstance(value, dict):
                for key, child in value.items():
                    if child == "":
                        self.error(f"{document.relative}: JSON-LD has empty field at {path}.{key}")
                    if key in URL_KEYS and isinstance(child, str) and child and not urlparse(child).scheme:
                        self.error(f"{document.relative}: JSON-LD URL is not absolute at {path}.{key}")
                    inspect(child, f"{path}.{key}", document)
            elif isinstance(value, list):
                for index, child in enumerate(value):
                    inspect(child, f"{path}[{index}]", document)

        for document in self.documents.values():
            if not document.indexable:
                continue
            if len(document.json_ld) != 1:
                self.error(f"{document.relative}: expected exactly one JSON-LD block")
                continue
            try:
                payload = json.loads(document.json_ld[0])
            except json.JSONDecodeError as exc:
                self.error(f"{document.relative}: invalid JSON-LD: {exc}")
                continue
            if payload.get("@context") != "https://schema.org":
                self.error(f"{document.relative}: JSON-LD is missing schema.org context")
            inspect(payload, "$", document)

    def audit_html_quality(self) -> None:
        for document in self.documents.values():
            if document.is_alias:
                continue
            duplicates = [value for value, count in Counter(document.ids).items() if count > 1]
            if duplicates:
                self.error(f"{document.relative}: duplicate IDs: {', '.join(sorted(duplicates))}")
            known_ids = set(document.ids)
            for attribute, values in document.aria_references:
                for value in values.split():
                    if value not in known_ids:
                        self.error(f"{document.relative}: {attribute} references missing id {value!r}")
            for image in document.images:
                if "alt" not in image:
                    self.error(f"{document.relative}: img is missing alt")
                if not image.get("width") or not image.get("height"):
                    self.error(f"{document.relative}: img is missing explicit width/height")
            for tag, control in document.controls:
                if tag == "input" and control.get("type", "text").lower() in {"hidden", "submit", "button"}:
                    continue
                labelled = bool(control.get("aria-label") or control.get("aria-labelledby"))
                if control.get("id") in document.labels_for:
                    labelled = True
                if tag == "button" and "".join(document.visible_text):
                    labelled = labelled or bool(control.get("data-nav-label"))
                if not labelled and tag != "button":
                    self.error(f"{document.relative}: {tag} control lacks an accessible label")
            for time_element in document.time_elements:
                if not time_element.get("datetime"):
                    self.error(f"{document.relative}: time element lacks datetime")

    def audit_links(self) -> None:
        for document in self.documents.values():
            if document.is_alias:
                continue
            for tag, attribute, value in document.references:
                if not value or value.startswith(("mailto:", "tel:", "data:")):
                    continue
                if value.lower().startswith("javascript:"):
                    self.error(f"{document.relative}: javascript URL is not allowed")
                    continue
                parsed_direct = urlparse(value)
                if parsed_direct.scheme in {"http", "https"} and f"{parsed_direct.scheme}://{parsed_direct.netloc}" != self.site_origin:
                    if tag in {"script", "img", "source", "iframe"} or (tag == "link" and "stylesheet" in next((link.get("rel", "") for link in document.links if link.get("href") == value), "")):
                        approved_iframe = tag == "iframe" and (parsed_direct.scheme, parsed_direct.netloc, parsed_direct.path) in APPROVED_EXTERNAL_IFRAMES
                        if not approved_iframe:
                            self.error(f"{document.relative}: third-party runtime asset: {value}")
                    continue
                if value.startswith("/") and self.base_path != "/" and not value.startswith(self.base_path):
                    self.error(f"{document.relative}: root-relative URL breaks configured subpath: {value}")
                    continue
                target, fragment = self.local_path(value, document)
                if target is None:
                    continue
                if "__outside_base__" in target.parts:
                    self.error(f"{document.relative}: internal URL escapes configured base path: {value}")
                    continue
                if not target.exists():
                    self.error(f"{document.relative}: broken internal {attribute}: {value}")
                    continue
                if fragment and target.suffix.lower() == ".html":
                    try:
                        target_relative = target.relative_to(self.root).as_posix()
                    except ValueError:
                        continue
                    target_document = self.documents.get(target_relative)
                    if target_document and fragment not in set(target_document.ids):
                        self.error(f"{document.relative}: missing fragment #{fragment} in {target_relative}")
                if tag == "script" and attribute == "src":
                    self.runtime_js.add(target.relative_to(self.root).as_posix())
                if tag == "link" and attribute == "href":
                    rel = next((item.get("rel", "") for item in document.links if item.get("href") == value), "")
                    if "stylesheet" in rel:
                        self.runtime_css.add(target.relative_to(self.root).as_posix())

    def audit_placeholders(self) -> None:
        for document in self.documents.values():
            if document.is_alias:
                continue
            visible = " ".join(document.visible_text)
            for placeholder in PLACEHOLDERS:
                if placeholder.casefold() in visible.casefold():
                    self.error(f"{document.relative}: visible placeholder/fixture text: {placeholder}")
            for blocked in BLOCKED_ROUTE_PARTS:
                for _, _, value in document.references:
                    if blocked in value:
                        self.error(f"{document.relative}: blocked fixture or legacy route: {value}")
        for path in self.root.rglob("*"):
            relative = f"/{path.relative_to(self.root).as_posix().lower()}"
            if "/example-" in relative:
                self.error(f"fixture route exists in production output: {relative}")

    def audit_editorial_leakage(self) -> None:
        for document in self.documents.values():
            if document.is_alias:
                continue
            visible = " ".join(document.visible_text).casefold()
            for phrase in EDITORIAL_LEAKAGE_PHRASES:
                if phrase.casefold() in visible:
                    self.error(f"{document.relative}: public editorial leakage: {phrase}")

    def audit_xml_and_robots(self) -> None:
        xml_files = sorted(self.root.rglob("*.xml"))
        if not xml_files:
            self.error("no XML outputs found")
        for path in xml_files:
            try:
                tree = ET.parse(path)
            except ET.ParseError as exc:
                self.error(f"{path.relative_to(self.root).as_posix()}: invalid XML: {exc}")
                continue
            text = " ".join(node.strip() for node in tree.getroot().itertext() if node.strip())
            for placeholder in PLACEHOLDERS:
                if placeholder.casefold() in text.casefold():
                    self.error(f"{path.relative_to(self.root).as_posix()}: placeholder/fixture in XML: {placeholder}")

        for required in ("sitemap.xml", "index.xml", "docs/home/news/index.xml"):
            if not (self.root / required).is_file():
                self.error(f"missing required XML output: {required}")

        sitemap = self.root / "sitemap.xml"
        if sitemap.is_file():
            try:
                root = ET.parse(sitemap).getroot()
                locations = [node.text or "" for node in root.findall("{*}url/{*}loc")]
                locations.extend(node.text or "" for node in root.findall("{*}sitemap/{*}loc"))
                if not locations:
                    self.error("sitemap.xml contains no URLs")
                for location in locations:
                    if not location.startswith(f"{self.site_origin}{self.base_path}"):
                        self.error(f"sitemap.xml URL does not use configured baseURL: {location}")
                    if any(part in location for part in BLOCKED_ROUTE_PARTS):
                        self.error(f"sitemap.xml contains fixture/legacy route: {location}")
            except ET.ParseError:
                pass

        robots = self.root / "robots.txt"
        if not robots.is_file():
            self.error("missing robots.txt")
        else:
            content = robots.read_text(encoding="utf-8")
            if re.search(r"(?im)^\s*Disallow:\s*/\s*$", content):
                self.error("robots.txt blocks the entire site")
            expected_sitemap = f"Sitemap: {self.site_origin}{self.base_path}sitemap.xml"
            if expected_sitemap not in content:
                self.error("robots.txt does not point to the configured sitemap")

    def run(self) -> int:
        self.load()
        if self.documents and self.site_origin:
            self.audit_metadata()
            self.audit_languages()
            self.audit_json_ld()
            self.audit_html_quality()
            self.audit_links()
            self.audit_placeholders()
            self.audit_editorial_leakage()
            self.audit_xml_and_robots()

        js_bytes = sum((self.root / path).stat().st_size for path in self.runtime_js if (self.root / path).is_file())
        css_bytes = sum((self.root / path).stat().st_size for path in self.runtime_css if (self.root / path).is_file())
        indexable = sum(document.indexable for document in self.documents.values())
        aliases = sum(document.is_alias for document in self.documents.values())
        print("Site audit")
        print(f"  directory: {self.root}")
        print(f"  base path: {self.base_path}")
        not_found = sum(document.is_404 for document in self.documents.values())
        print(f"  HTML: {len(self.documents)} ({indexable} indexable, {aliases} redirect alias, {not_found} language 404 outputs)")
        print(f"  runtime CSS: {len(self.runtime_css)} file(s), {css_bytes} bytes")
        print(f"  runtime JS: {len(self.runtime_js)} file(s), {js_bytes} bytes")
        print(f"  critical errors: {len(self.errors)}")
        for error in self.errors:
            print(f"ERROR: {error}")
        return 1 if self.errors else 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("public_dir", nargs="?", default="public", help="generated Hugo output directory")
    args = parser.parse_args()
    return Audit(Path(args.public_dir)).run()


if __name__ == "__main__":
    sys.exit(main())
