# Agent Guide

This file gives future coding agents the project context needed to work safely in this repository. These instructions apply to the entire repository.

## Project Overview

Daniel's Tech Blog is a small static blog generated from Markdown.

- Generator: `build.py`
- Content: `content/articles/<series-slug>/*.md` and `content/pages/*.md`
- Drafts: `content/draft/*.md` is for unpublished notes and is not converted to HTML
- Templates: `templates/*.html`
- Source assets: `assets/css/style.css` and `assets/js/main.js`
- Generated site output: `site/`
- Requirements: `blog_requirements.md`
- Visual design spec: `blog_spec.md`

The generated `site/` directory is rebuilt from source files by running `python build.py`.

## Build And Verification

Run these from the repository root:

```powershell
python build.py
python -m py_compile build.py
```

After template, CSS, JavaScript, or content changes, rebuild with `python build.py` so the `site/` output matches the source.

For browser checks, open:

```text
file:///C:/Users/danie/Desktop/Tech_Blog/site/index.html
```

Important pages to spot-check:

- Home page: `site/index.html`
- Paginated home page: `site/page/2/index.html`
- Article page: `site/articles/embedded-build-language-notes/index.html`
- Tag filter page: `site/tags/python/index.html`
- Series filter page: `site/series/algorithm-notes/index.html`
- Information page: `site/about/index.html`

## Content Model

Articles use YAML front matter:

```yaml
---
title: "Article Title"
date: "2026-06-03"
tags: ["Python", "Algorithms"]
series: "Algorithm Notes"
summary: "Short article summary."
slug: "article-slug"
---
```

Rules:

- Article `date` is required.
- Pages do not require `date`.
- Tags may be a string or list, but a list is preferred.
- `slug` is optional; if omitted, it is generated from the title.
- Article Markdown files should live in slug-named series folders under `content/articles/`.
- Draft Markdown files may live under `content/draft/`; files in this folder are not converted to HTML.
- Generated article URLs are based on article slugs and do not include the source series folder.
- Local article images should live beside the Markdown file, typically under an `images/` folder, and should be referenced with Markdown-relative paths such as `![Boot flow diagram](images/boot-flow.svg)`.
- Series and tag filter pages are generated statically and must work without JavaScript.

## Design Rules

Use `blog_spec.md` and `assets/css/style.css` as the design source of truth.

Key design tokens:

- Body font: `Georgia, "Times New Roman", serif`
- UI font: `"Trebuchet MS", "Segoe UI", sans-serif`
- Mono font: `"Cascadia Code", Consolas, monospace`
- Light background: `#fbfaf5`
- Dark background: `#121816`
- Primary accent: `--accent`
- Secondary accent: `--accent-2`

Do not introduce a new visual language for small changes. Extend existing variables, typography rules, card styles, tag styles, and Bootstrap layout patterns.

## Static Site Behavior

The site supports:

- Bootstrap 5 responsive layout.
- Light and dark themes through `data-bs-theme`.
- Markdown article rendering.
- Local Markdown images for article diagrams.
- MathJax formula rendering.
- Prism syntax highlighting with line numbers, copy buttons, and custom linker-script support.
- Article table of contents.
- Back-to-top button.
- Static series and tag filtering.
- Home pagination and filter-page pagination.

When changing generated URLs, verify relative `base_path` links from nested pages.

When changing code highlighting, keep these files in sync:

- `templates/base.html` for Prism CSS, plugin scripts, and language component scripts.
- `assets/js/main.js` for code-block preparation and custom linker-script grammar.
- `assets/css/style.css` for block layout, token colors, line numbers, and copy button styling.
- `blog_requirements.md` and `blog_spec.md` for documented behavior and visual rules.

## Editing Guidelines

- Prefer small, focused edits.
- Keep source-of-truth changes in `build.py`, `templates/`, `assets/`, or `content/`.
- Do not manually edit generated files in `site/` unless the user explicitly asks; rebuild instead.
- Preserve existing Markdown and YAML front matter style.
- Use ASCII text unless an existing file already requires non-ASCII content.
- Do not revert user changes or unrelated dirty files.

## Common Tasks

### Add an article

1. Add a Markdown file under the matching slug-named series folder in `content/articles/`.
2. Include front matter with `title`, `date`, `tags`, `series`, `summary`, and optionally `slug`.
3. Run `python build.py`.
4. Check the article page, home listing, tag pages, and series page.

For series articles, place the file under the matching slug-named folder, for example `content/articles/algorithm-notes/article-slug.md`.

For local diagrams, place image files beside the article, for example `content/articles/developer-workflow/images/boot-flow.svg`, and reference them from Markdown as `![Boot flow diagram](images/boot-flow.svg)`.

### Update styling

1. Edit `assets/css/style.css`.
2. Keep values aligned with `blog_spec.md`.
3. Run `python build.py`.
4. Check both light and dark themes.

For code-block styling, also check a page with C, C++, Makefile, Python, and linker-script blocks, and verify line numbers, horizontal scrolling, token colors, and the copy button.

### Update templates

1. Edit the relevant file in `templates/`.
2. Keep Bootstrap 5 layout conventions.
3. Run `python build.py`.
4. Check generated pages at multiple URL depths.

### Update generator behavior

1. Edit `build.py`.
2. Run `python -m py_compile build.py`.
3. Run `python build.py`.
4. Verify generated paths and links.
