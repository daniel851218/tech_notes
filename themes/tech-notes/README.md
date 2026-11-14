# Tech Notes

A Hugo theme for technical blogs, with a paper-grid background, teal accents, and light and dark modes. This repository contains Daniel's Tech Notes in `content/` and the theme in `themes/tech-notes/`.

Fonts are served locally: Atkinson Hyperlegible Next for prose and the interface, JetBrains Mono for code, and STIX Two Math for formulas. See the [theme specification](SPEC.md) for the full color palette, type scale, layouts, and responsive behavior.

All commands and unlinked file paths below are relative to the repository root.

## Run locally

Install Hugo and add the directory containing its executable to `PATH`. Hugo **0.146.0 or later** is required; the site has been tested with **0.159.2 extended**, which is also pinned for Netlify builds. No Node.js or Python packages are required.

Run these commands from the repository root:

```bash
# Confirm Hugo is available
hugo version

# Preview published articles
hugo server --disableFastRender

# Include your draft articles
hugo server -D --disableFastRender

# Production build: output goes to public/
hugo --gc --minify
```

Open the local URL printed by Hugo, usually <http://localhost:1313/>. Stop the preview with `Ctrl+C`.

Hugo creates `public/` for production output and may generate `resources/` and `.hugo_build.lock` while building. These are ignored by Git and do not need to be kept in the source tree.

## Included features

| Feature | Behavior |
| --- | --- |
| Archives | Chronological year groups at `/archives/` |
| Series | Static listings, optional `series_order`, and article sidebar navigation |
| Tags | Tag index, counts, and paginated tag pages |
| Responsive design | Two columns on desktop; single column and collapsible contents on mobile |
| Search | Weighted title, summary, tag, series, and full-text search, including code; shareable `?q=` URLs |
| Inline code | Distinct code styling plus an optional syntax-highlighting shortcode |
| Code blocks | Build-time Chroma highlighting, line numbers, copy controls, horizontal scrolling, and optional line emphasis |
| GNU linker scripts | Local build-time tokenizer for `linker-script`, `ld`, `lds`, and `linkerscript` fences |
| LaTeX | Build-time KaTeX rendering to accessible MathML, including inline/display equations and matrices |
| Contents | Sticky desktop sidebar, active heading tracking, native mobile disclosure |
| Back to top | Appears after scrolling and honors reduced-motion preferences |
| Color themes | System preference, persistent light/dark toggle, and initial theme set before CSS loads |
| Other | RSS, sitemap, canonical/Open Graph metadata, 404 page, local image bundles, keyboard focus styles, skip link, and print layout |

Navigation, archives, taxonomy pages, highlighted code, formulas, and article contents work without JavaScript. Search, copying, active-heading tracking, the theme toggle, and back-to-top use small local scripts. MathML requires a browser with MathML support, such as current Chrome, Edge, Firefox, or Safari. The native mathematical font can differ slightly between platforms.

## Write an article

Use Hugo leaf bundles so article diagrams and images live alongside their Markdown:

```text
content/
  articles/
    <series>/
      <slug>/
        index.md
        images/
          diagram.svg
```

Create the directory and `index.md` manually, then start the file with this front matter and add your article below it:

```yaml
---
title: "My next note"
date: "2026-11-14"
slug: "my-next-note"
draft: true
summary: "A brief description for article cards and search."
tags: ["STM32", "Setup"]
series: ["STM32"]
series_order: 2
showTOC: true
---
```

Change `draft` to `false` to publish it. Article URLs use `/articles/:slug/`, independently of the source series folder. Always set an explicit slug when preserving a published URL. Series use ascending `series_order`; articles without that parameter follow ordered articles, sorted by date. A series without any explicit order is chronological. Regular home and tag listings are newest first.

Add an image with `![Diagram](images/diagram.svg)`. Hugo's embedded image/link hooks resolve page-bundle resources and links, including sites hosted beneath a subdirectory.

Standalone pages live directly under `content/`. Edit `content/about.md` for your introduction; keep `content/archives.md` and `content/search.md` to provide the archives and search pages.

## Code and formulas

Use fenced Markdown with a language identifier: `c`, `cpp`, `python`, `bash`, `json`, `makefile`, or `linker-script`. Unknown languages and unlabelled fences fall back to plain text. Code is highlighted in the generated HTML. The copy button copies source text without the line-number gutter.

C/C++ fences distinguish preprocessor directives, defined macro names, types, and values. Comments are upright; include paths and strings are green. This refinement runs during the build and preserves the source text, including multiline macros.

Hugo highlighting attributes can emphasize lines, for example an opening fence of **\`\`\`c {hl_lines=[2,3]}**. The custom linker-script tokenizer supports line numbering and `lineNoStart`; other Chroma highlighting attributes apply to Chroma-supported languages.

Ordinary inline code uses backticks. For colored inline syntax, use:

```go-html-template
{{< code lang="c" >}}const uint32_t ticks = 1000;{{< /code >}}
```

Write inline formulas with `\(E = mc^2\)` or `$E = mc^2$`. Use `\[...\]` or a standalone `$$` pair for display formulas:

```latex
$$
f_{update} = \frac{f_{clk}}{(PSC + 1)(ARR + 1)}
$$
```

Dollar-delimited math is enabled to match the original blog. Write currency as `&#36;20`, put it in a code span, or remove the `['$', '$']` inline delimiter in `hugo.toml`. Invalid/unsupported LaTeX fails the build with its source location so it cannot silently publish broken formulas. KaTeX supports a broad LaTeX math subset rather than all MathJax extensions.

The original articles contain author-written `<br>` elements. The site enables `markup.goldmark.renderer.unsafe` to preserve them; that option is a site choice and is not imposed by the theme.

## Customize

Edit `hugo.toml` for the blog title, author, menus, GitHub link, pagination size, post sections, and these parameters:

```toml
[params]
  mainSections = ['articles']
  defaultTheme = 'auto' # 'auto', 'light', or 'dark'; a saved choice takes priority
  showReadingTime = true
  showTOC = true
```

Set `showTOC: false` on an individual article to hide its contents. Change CSS custom properties at the beginning of `themes/tech-notes/assets/css/style.css` to adjust fonts, colors, and spacing. To extend the document head without editing the theme, create `layouts/_partials/head-extra.html` in your site.

## Reuse in another project

1. Copy this directory to `themes/tech-notes/` in your Hugo site.
2. Copy the root [hugo.toml](../../hugo.toml), keep `theme = 'tech-notes'`, and customize the site details and menus.
3. Copy the [archives](../../content/archives.md), [search](../../content/search.md), and [About](../../content/about.md) pages into `content/`, then add your own articles.

Keep the configuration's taxonomy, output, markup, and permalink settings.

## Build and deploy

Run `hugo --gc --minify` and check the generated `public/` directory before deployment. Preview the site locally to review navigation, search, code blocks, and formulas.

For Netlify, use this repository with `netlify.toml`: it pins Hugo 0.159.2 extended, runs `hugo --gc --minify`, and publishes `public/`. Set `baseURL` in `hugo.toml` to your production address. Deploy previews use Netlify's preview URL.

Search is entirely local to the browser, using a generated JSON index. Its index size grows with the blog; for a very large archive, a dedicated search indexer may be preferable. Article images retained from your original posts can still refer to external hosts.

## References

- [Original blog source and design specification](https://github.com/daniel851218/tech_notes)
- [Hugo code block render hooks](https://gohugo.io/render-hooks/code-blocks/)
- [Hugo build-time mathematics](https://gohugo.io/functions/transform/tomath/)
- [Hugo template types](https://gohugo.io/templates/types/)

The theme code is [MIT licensed](LICENSE); original article content remains yours. Bundled fonts use the SIL Open Font License; keep their source notes and `OFL.txt` files under [static/fonts/](static/fonts/).
