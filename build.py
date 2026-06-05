from __future__ import annotations

import json
import math
import re
import shutil
from dataclasses import dataclass, field
from datetime import date, datetime
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
from typing import Any, Callable, Dict, Iterable, List, Optional, Set, Tuple
from urllib.parse import urlsplit

import markdown
import yaml
from jinja2 import Environment, FileSystemLoader, select_autoescape
from markdown.extensions import Extension
from markdown.treeprocessors import Treeprocessor


ROOT = Path(__file__).parent.resolve()
CONTENT_DIR = ROOT / "content"
ARTICLES_DIR = CONTENT_DIR / "articles"
PAGES_DIR = CONTENT_DIR / "pages"
TEMPLATES_DIR = ROOT / "templates"
ASSETS_DIR = ROOT / "assets"
SITE_DIR = ROOT / "site"

SITE_TITLE = "Daniel's Tech Notes"
AUTHOR = "Daniel"
POSTS_PER_PAGE = 8
LOCAL_IMAGE_EXTENSIONS = {".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
MARKDOWN_IMAGE_RE = re.compile(r"!\[[^\]]*\]\(\s*(?P<src><[^>]+>|[^)\s]+)")


class PlainTextHTMLParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.parts: List[str] = []

    def handle_data(self, data: str) -> None:
        if data.strip():
            self.parts.append(data)

    def text(self) -> str:
        return re.sub(r"\s+", " ", " ".join(self.parts)).strip()


class ExternalLinksTreeprocessor(Treeprocessor):
    def run(self, root: Any) -> Any:
        for link in root.iter("a"):
            href = link.get("href")
            if href and urlsplit(href).scheme in {"http", "https"}:
                link.set("target", "_blank")
                link.set("rel", "noopener noreferrer")
        return root


class ExternalLinksExtension(Extension):
    def extendMarkdown(self, md: markdown.Markdown) -> None:
        md.treeprocessors.register(ExternalLinksTreeprocessor(md), "external_links", 15)


@dataclass
class Document:
    source: Path
    title: str
    slug: str
    body: str
    html: str
    date: Optional[date] = None
    summary: str = ""
    tags: List[str] = field(default_factory=list)
    series: Optional[str] = None
    toc: List[Dict[str, Any]] = field(default_factory=list)
    url: str = ""
    tag_items: List[Dict[str, Any]] = field(default_factory=list)
    series_item: Optional[Dict[str, Any]] = None
    assets: List[Tuple[Path, PurePosixPath]] = field(default_factory=list)

    @property
    def display_date(self) -> str:
        return self.date.isoformat() if self.date else ""


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-{2,}", "-", value)
    return value.strip("-") or "untitled"


def split_front_matter(text: str) -> Tuple[Dict[str, Any], str]:
    if not text.startswith("---"):
        return {}, text

    parts = text.split("---", 2)
    if len(parts) < 3:
        return {}, text

    meta = yaml.safe_load(parts[1]) or {}
    if not isinstance(meta, dict):
        raise ValueError("YAML front matter must be a mapping.")
    return meta, parts[2].lstrip()


def parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    return datetime.strptime(str(value), "%Y-%m-%d").date()


def render_markdown(body: str) -> Tuple[str, List[Dict[str, Any]]]:
    md = markdown.Markdown(
        extensions=[
            "extra",
            "fenced_code",
            "tables",
            "toc",
            "sane_lists",
            ExternalLinksExtension(),
        ],
        extension_configs={
            "toc": {
                "permalink": False,
                "separator": "-",
            }
        },
        output_format="html5",
    )
    html = md.convert(body)
    return html, flatten_toc(getattr(md, "toc_tokens", []))


def is_external_or_absolute_asset(src: str) -> bool:
    parsed = urlsplit(src)
    return bool(parsed.scheme or parsed.netloc or src.startswith(("/", "\\")))


def markdown_image_assets(body: str, source_path: Path) -> List[Tuple[Path, PurePosixPath]]:
    assets: List[Tuple[Path, PurePosixPath]] = []
    seen: Set[str] = set()

    for match in MARKDOWN_IMAGE_RE.finditer(body):
        src = match.group("src").strip().strip("<>")
        if not src or is_external_or_absolute_asset(src):
            continue

        path_part = urlsplit(src).path
        relative_path = PurePosixPath(path_part)
        if ".." in relative_path.parts:
            raise ValueError(f"{source_path} has image path outside article directory: {src}")

        if relative_path.suffix.lower() not in LOCAL_IMAGE_EXTENSIONS:
            raise ValueError(f"{source_path} has unsupported image file extension: {src}")

        asset_source = (source_path.parent / Path(*relative_path.parts)).resolve()
        if not asset_source.is_file():
            raise ValueError(f"{source_path} references missing image asset: {src}")

        key = relative_path.as_posix()
        if key not in seen:
            seen.add(key)
            assets.append((asset_source, relative_path))

    return assets


def flatten_toc(tokens: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    for token in tokens:
        items.append(
            {
                "level": token.get("level"),
                "id": token.get("id"),
                "name": token.get("name"),
            }
        )
        items.extend(flatten_toc(token.get("children") or []))
    return items


def read_markdown(path: Path, *, require_date: bool) -> Document:
    meta, body = split_front_matter(path.read_text(encoding="utf-8"))
    title = str(meta.get("title") or extract_title(body) or path.stem.replace("-", " ").title())
    slug = slugify(str(meta.get("slug") or title))
    html, toc = render_markdown(body)
    tags = meta.get("tags") or []
    if isinstance(tags, str):
        tags = [tags]

    doc_date = parse_date(meta.get("date"))
    if require_date and doc_date is None:
        raise ValueError(f"{path} is missing required front matter field: date")

    return Document(
        source=path,
        title=title,
        slug=slug,
        body=body,
        html=html,
        date=doc_date,
        summary=str(meta.get("summary") or ""),
        tags=[str(tag) for tag in tags],
        series=str(meta["series"]) if meta.get("series") else None,
        toc=toc,
        assets=markdown_image_assets(body, path),
    )


def extract_title(body: str) -> Optional[str]:
    for line in body.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return None


def clean_site() -> None:
    if SITE_DIR.exists():
        shutil.rmtree(SITE_DIR)
    SITE_DIR.mkdir(parents=True)
    shutil.copytree(ASSETS_DIR, SITE_DIR / "assets")


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def write_html(path: Path, content: str) -> None:
    ensure_parent(path)
    path.write_text(content, encoding="utf-8")


def write_json(path: Path, data: Any) -> None:
    ensure_parent(path)
    path.write_text(json.dumps(data, ensure_ascii=True, indent=2), encoding="utf-8")


def html_to_plain_text(html: str) -> str:
    parser = PlainTextHTMLParser()
    parser.feed(html)
    return parser.text()


def search_index_item(article: Document) -> Dict[str, Any]:
    return {
        "title": article.title,
        "date": article.display_date,
        "summary": article.summary,
        "tags": article.tags,
        "series": article.series or "",
        "url": article.url,
        "body": html_to_plain_text(article.html),
    }


def make_search_index(articles: Iterable[Document]) -> List[Dict[str, Any]]:
    return [search_index_item(article) for article in articles]


def write_search_index(index: List[Dict[str, Any]]) -> None:
    write_json(SITE_DIR / "search-index.json", index)


def copy_article_assets(article: Document) -> None:
    article_dir = (SITE_DIR / article.url).parent
    for source, relative_path in article.assets:
        destination = article_dir / Path(*relative_path.parts)
        ensure_parent(destination)
        shutil.copy2(source, destination)


def url_depth(url: str) -> str:
    depth = max(0, len([part for part in url.split("/") if part]) - 1)
    return "../" * depth


def taxonomy_item(section: str, name: str, count: int, slug: str) -> Dict[str, Any]:
    return {
        "name": name,
        "count": count,
        "slug": slug,
        "url": f"{section}/{slug}/index.html",
    }


def taxonomy_items(section: str, counts: Dict[str, int]) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    used_slugs: Dict[str, int] = {}
    for name, count in sorted(counts.items(), key=lambda item: item[0].lower()):
        base_slug = slugify(name)
        slug_count = used_slugs.get(base_slug, 0)
        used_slugs[base_slug] = slug_count + 1
        slug = base_slug if slug_count == 0 else f"{base_slug}-{slug_count + 1}"
        items.append(taxonomy_item(section, name, count, slug))
    return items


def build_taxonomy(articles: Iterable[Document]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    tags: Dict[str, int] = {}
    series: Dict[str, int] = {}
    for article in articles:
        for tag in article.tags:
            tags[tag] = tags.get(tag, 0) + 1
        if article.series:
            series[article.series] = series.get(article.series, 0) + 1

    tag_items = taxonomy_items("tags", tags)
    series_items = taxonomy_items("series", series)
    return tag_items, series_items


def attach_taxonomy_links(
    articles: Iterable[Document],
    tag_items: List[Dict[str, Any]],
    series_items: List[Dict[str, Any]],
) -> None:
    tags_by_name = {item["name"]: item for item in tag_items}
    series_by_name = {item["name"]: item for item in series_items}
    for article in articles:
        article.tag_items = [tags_by_name[tag] for tag in article.tags if tag in tags_by_name]
        article.series_item = series_by_name.get(article.series or "")


def validate_unique_article_slugs(articles: Iterable[Document]) -> None:
    seen: Dict[str, Path] = {}
    for article in articles:
        if article.slug in seen:
            raise ValueError(f"Duplicate article slug '{article.slug}' in {seen[article.slug]} and {article.source}")
        seen[article.slug] = article.source


def load_documents() -> Tuple[List[Document], List[Document]]:
    articles = [read_markdown(path, require_date=True) for path in sorted(ARTICLES_DIR.rglob("*.md"))]
    validate_unique_article_slugs(articles)
    articles.sort(key=lambda doc: doc.date or date.min, reverse=True)
    for article in articles:
        article.url = f"articles/{article.slug}/index.html"

    pages = [read_markdown(path, require_date=False) for path in sorted(PAGES_DIR.glob("*.md"))]
    for page in pages:
        page.url = f"{page.slug}/index.html"

    return articles, pages


def make_env() -> Environment:
    env = Environment(
        loader=FileSystemLoader(TEMPLATES_DIR),
        autoescape=select_autoescape(["html", "xml"]),
    )
    env.filters["date"] = lambda value: value.isoformat() if value else ""
    return env


def make_pagination(total_items: int, current_page: int, url_for_page: Callable[[int], str]) -> Dict[str, Any]:
    total_pages = max(1, math.ceil(total_items / POSTS_PER_PAGE))
    return {
        "current": current_page,
        "total": total_pages,
        "previous_url": url_for_page(current_page - 1) if current_page > 1 else None,
        "next_url": url_for_page(current_page + 1) if current_page < total_pages else None,
        "pages": [
            {
                "number": number,
                "url": url_for_page(number),
            }
            for number in range(1, total_pages + 1)
        ],
    }


def render_article_listing_pages(
    env: Environment,
    common: Dict[str, Any],
    articles: List[Document],
    *,
    page_title: str,
    url_for_page: Callable[[int], str],
    active_filter: Optional[Dict[str, Any]] = None,
) -> None:
    total_pages = max(1, math.ceil(len(articles) / POSTS_PER_PAGE))
    home_template = env.get_template("home.html")

    for page_number in range(1, total_pages + 1):
        start = (page_number - 1) * POSTS_PER_PAGE
        page_articles = articles[start : start + POSTS_PER_PAGE]
        page_url = url_for_page(page_number)
        html = home_template.render(
            **common,
            page_title=page_title,
            current_url=page_url,
            base_path=url_depth(page_url),
            articles=page_articles,
            pagination=make_pagination(len(articles), page_number, url_for_page),
            active_filter=active_filter,
        )
        write_html(SITE_DIR / page_url, html)


def render_site() -> None:
    clean_site()
    articles, pages = load_documents()
    tag_items, series_items = build_taxonomy(articles)
    attach_taxonomy_links(articles, tag_items, series_items)
    env = make_env()

    common = {
        "site_title": SITE_TITLE,
        "author": AUTHOR,
        "year": datetime.now().year,
        "pages": pages,
        "tags": tag_items,
        "series": series_items,
    }

    article_template = env.get_template("article.html")
    for article in articles:
        html = article_template.render(
            **common,
            page_title=f"{article.title} | {SITE_TITLE}",
            current_url=article.url,
            base_path=url_depth(article.url),
            article=article,
        )
        write_html(SITE_DIR / article.url, html)
        copy_article_assets(article)

    page_template = env.get_template("page.html")
    for page in pages:
        html = page_template.render(
            **common,
            page_title=f"{page.title} | {SITE_TITLE}",
            current_url=page.url,
            base_path=url_depth(page.url),
            page=page,
        )
        write_html(SITE_DIR / page.url, html)

    search_index = make_search_index(articles)
    search_template = env.get_template("search.html")
    search_url = "search/index.html"
    html = search_template.render(
        **common,
        page_title=f"Search | {SITE_TITLE}",
        current_url=search_url,
        base_path=url_depth(search_url),
        search_index=search_index,
    )
    write_html(SITE_DIR / search_url, html)
    write_search_index(search_index)

    render_article_listing_pages(
        env,
        common,
        articles,
        page_title=SITE_TITLE,
        url_for_page=lambda number: "index.html" if number == 1 else f"page/{number}/index.html",
    )

    for item in tag_items:
        filtered_articles = [article for article in articles if item["name"] in article.tags]
        render_article_listing_pages(
            env,
            common,
            filtered_articles,
            page_title=f"Tag: {item['name']} | {SITE_TITLE}",
            url_for_page=lambda number, slug=item["slug"]: f"tags/{slug}/index.html" if number == 1 else f"tags/{slug}/page/{number}/index.html",
            active_filter={"type": "Tag", "name": item["name"], "count": item["count"]},
        )

    for item in series_items:
        filtered_articles = [article for article in articles if article.series == item["name"]]
        render_article_listing_pages(
            env,
            common,
            filtered_articles,
            page_title=f"Series: {item['name']} | {SITE_TITLE}",
            url_for_page=lambda number, slug=item["slug"]: f"series/{slug}/index.html" if number == 1 else f"series/{slug}/page/{number}/index.html",
            active_filter={"type": "Series", "name": item["name"], "count": item["count"]},
        )


if __name__ == "__main__":
    render_site()
    print(f"Built {SITE_DIR}")
