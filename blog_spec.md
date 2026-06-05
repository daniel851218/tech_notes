# Blog Design Specification

This document describes the visual design rules for Daniel's Tech Blog. The source of truth is `assets/css/style.css`.

## Design Direction

- Style: technical editorial blog with a quiet grid-paper background, strong UI headings, serif reading text, and restrained accent colors.
- Framework: Bootstrap 5 layout and components, customized through local CSS.
- Theme support: light and dark themes are controlled by `data-bs-theme` on the `html` element.

## Font Families

| Token | Font stack | Usage |
| --- | --- | --- |
| `--font-body` | `Georgia, "Times New Roman", serif` | Body text, article prose, summaries |
| `--font-ui` | `"Trebuchet MS", "Segoe UI", sans-serif` | Navigation, headings, cards, taxonomy, controls |
| `--font-mono` | `"Cascadia Code", Consolas, monospace` | Inline code, code blocks |

## Color Tokens

### Light Theme

| Token | Value | Usage |
| --- | --- | --- |
| `--ink` | `#182026` | Primary text and headings |
| `--muted` | `#66727f` | Secondary text, metadata, navigation |
| `--paper` | `#fbfaf5` | Page background |
| `--surface` | `#ffffff` | Cards, panels, controls |
| `--surface-2` | `#f0eee7` | Tables, inline code background |
| `--line` | `#ded9cb` | Borders and dividers |
| `--accent` | `#0f7c80` | Links, tags, primary controls |
| `--accent-2` | `#b84a31` | Eyebrows, hover links, h2 headings |
| `--heading-2` | `#b84a31` | Article `h2` headings |
| `--heading-3` | `#2f8f68` | Article `h3` headings |
| `--code-bg` | `#101820` | Code theme token |
| `--shadow` | `0 18px 45px rgba(34, 31, 24, 0.1)` | Cards and sidebar panels |

### Dark Theme

| Token | Value | Usage |
| --- | --- | --- |
| `--ink` | `#eff2ec` | Primary text and headings |
| `--muted` | `#aab2b8` | Secondary text, metadata, navigation |
| `--paper` | `#111315` | Page background |
| `--surface` | `#1b1f22` | Cards, panels, controls |
| `--surface-2` | `#242a2e` | Tables, inline code background |
| `--line` | `#373f45` | Borders and dividers |
| `--accent` | `#63c7c9` | Links, tags, primary controls |
| `--accent-2` | `#f09c73` | Eyebrows, hover links, h2 headings |
| `--heading-2` | `#f09c73` | Article `h2` headings |
| `--heading-3` | `#42b883` | Article `h3` headings |
| `--code-bg` | `#0b1117` | Code theme token |
| `--shadow` | `0 18px 45px rgba(0, 0, 0, 0.32)` | Cards and sidebar panels |

## Typography Scale

| Element | Font family | Size | Weight | Line height | Color |
| --- | --- | --- | --- | --- | --- |
| Site wordmark | `--font-ui` | `clamp(1.2rem, 1rem + 1vw, 1.75rem)` | `800` | default | `--ink` |
| Page title | `--font-ui` | `clamp(2.4rem, 5vw, 5rem)` | `900` | `0.95` | `--ink` |
| Article title | `--font-ui` | `clamp(2.1875rem, 3.44vw, 4.6rem)` | `900` | `0.95` | `--ink` |
| Article lead copy | `--font-body` | `1.125rem` on article pages | normal | `1.6` | `--muted` |
| General lead copy | `--font-body` | `clamp(1.1rem, 1rem + 0.6vw, 1.4rem)` | normal | `1.6` | `--muted` |
| Article card title | `--font-ui` | `clamp(1.45rem, 2.6vw, 2.25rem)` | `900` | `1.05` | `--ink` |
| Article card summary | `--font-body` | `1.05rem` | normal | `1.65` | `--muted` |
| Article prose | `--font-body` | `1.08rem` | normal | `1.78` | `--ink` |
| Eyebrow text | `--font-ui` | `0.78rem` | `900` | default | `--accent-2` |
| Metadata | `--font-ui` | `0.86rem` | `800` | default | `--muted` |
| Tags and pills | `--font-ui` | `0.8rem` | `900` | default | `--accent` |
| Sidebar heading | `--font-ui` | `1rem` | `900` | default | `--ink` |
| Table of contents link | `--font-ui` | `0.92rem` | `800` | default | `--muted` |
| Code block | `--font-mono` | `0.94rem` | normal | `1.65rem` | Prism theme colors |

## Layout

- Body background uses a 42px square grid over `--paper`.
- Header is sticky on desktop and static below `991.98px`.
- Main page sections use `.page-band` padding: `clamp(2rem, 4vw, 4rem) 0`.
- Article pages use `.article-shell` top padding: `clamp(2rem, 5vw, 5rem)`.
- Article content uses Bootstrap columns: main article content on the left and sidebar on the right.
- Article sidebar is sticky with `top: 6rem` on desktop and static below `991.98px`.
- Narrow information pages use `.narrow-page` with `max-width: 880px`.

## Components

### Header and Footer

- Header and footer background: `color-mix(in srgb, var(--paper) 88%, transparent)`.
- Header and footer use `backdrop-filter: blur(16px)`.
- Navigation links use `--muted`, `font-weight: 700`, and inherit Bootstrap spacing.
- Navbar search uses `--surface`, `--line`, `--accent`, `--font-ui`, and an icon-only search button.
- Theme toggle uses `--surface`, `--line`, and `--ink`.

### Article Cards

- Border: `1px solid var(--line)`.
- Border radius: `8px`.
- Background: `--surface`.
- Shadow: `--shadow`.
- Padding: `clamp(1.25rem, 3vw, 2rem)`.
- List gap: `1.25rem`.

### Sidebar Panels

- Border: `1px solid var(--line)`.
- Border radius: `8px`.
- Background: `--surface`.
- Shadow: `--shadow`.
- Padding: `1.25rem`.
- Stack gap: `1rem`.

### Tags and Taxonomy

- Tag pills are rounded with `border-radius: 999px`.
- Tag padding: `0.25rem 0.65rem`.
- Tag background: `color-mix(in srgb, var(--accent) 8%, var(--surface))`.
- Tag border: `1px solid color-mix(in srgb, var(--accent) 45%, var(--line))`.
- Hover/focus/active tag state uses `--accent` background, white text, and `translateY(-1px)`.
- Taxonomy list links use dashed `--line` dividers, `6px` radius, and `translateX(2px)` on hover/focus/active.

### Filter Heading

- Used on static series and tag listing pages.
- Left border: `4px solid var(--accent)`.
- Left padding: `1rem`.
- Bottom margin: `1.25rem`.
- Heading size: `clamp(1.65rem, 3vw, 2.45rem)`.

### Search

- Navbar search is compact on desktop and full width inside the collapsed mobile navigation.
- Search page content uses a centered `.search-shell` with `max-width: 880px`.
- Search inputs and buttons use `8px` radius, `--surface` backgrounds, `--line` borders, and `--accent` focus/active states.
- Search result cards match article card styling with `--surface`, `--line`, `8px` radius, and `--shadow`.
- Search status text uses `--font-ui`, `--muted`, and `font-weight: 700`.

### Pagination

- Page link size: `2.25rem` by `2.25rem`.
- Background: `--surface`.
- Border: `--line`.
- Text color: `--accent`.
- Active state uses `--accent` for border and background.

### Back To Top Button

- Fixed at bottom right: `right: 1rem`, `bottom: 1rem`.
- Size: `2.75rem` by `2.75rem`.
- Shape: circle.
- Hidden by default with `opacity: 0`, `pointer-events: none`, and `translateY(0.75rem)`.
- Visible state restores opacity and pointer events.

## Article Content

- Prose text color: `--ink`.
- Prose font size: `1.08rem`.
- Prose line height: `1.78`.
- Article `h2`, `h3`, and `h4` use `--font-ui`, `font-weight: 900`, and `line-height: 1.15`.
- Article `h2` has a `2px solid var(--line)` top border and `1.25rem` top padding.
- Article `h2` color: `--heading-2`.
- Article `h3` color: `--heading-3`.
- Paragraphs, lists, tables, and code blocks use `margin-bottom: 1.15rem`.
- Article images use responsive sizing with `max-width: 100%`, `height: auto`, `8px` radius, `--line` border, `--surface` background, and `--shadow`.
- Figure captions use `--font-ui`, `--muted`, `0.9rem`, and centered text.

## Images and Figures

- Local article images are referenced from Markdown with paths relative to the article source file, for example `![Boot flow diagram](images/boot-flow.svg)`.
- Supported local image extensions: `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, and `.webp`.
- The build copies referenced local images into the generated article folder while preserving the Markdown-relative path.
- External image URLs are left unchanged.

## Code Styling

### Inline Code

- Inline code is scoped to `.prose :not(pre) > code`.
- Font family: `--font-mono`.
- Background: `--surface-2`.
- Text color: `--accent-2`.
- Border radius: `4px`.
- Padding: `0.12rem 0.35rem`.

### Syntax Highlight Blocks

- Code blocks are written as fenced Markdown blocks with language identifiers, for example ```` ```python ````.
- Rendering uses Prism `1.29.0` with manual highlighting enabled through `window.Prism.manual = true`.
- Loaded Prism languages: `clike`, `c`, `cpp`, `python`, and `makefile`.
- Custom Prism language aliases registered in `assets/js/main.js`: `linker-script`, `ld`, `lds`, and `linkerscript`.
- Every article code block inside `.prose pre` receives the matching `language-*` class from its nested `code` element and the `line-numbers` class during page load.
- Code blocks must remain horizontally scrollable instead of wrapping long code lines.

### Code Block Layout

- Selector: `.prose pre[class*="language-"]`.
- Background: `#2d2d2d`.
- Text color: `#ccc`.
- Font family: `--font-mono`.
- Font size: `0.94rem`.
- Line height token: `--code-line-height: 1.65rem`.
- Margin: `1.5em 0`.
- Padding: `2.65rem 1rem 1rem 4.25rem`.
- Border radius: `8px`.
- Horizontal overflow: `auto`.
- Font ligatures: disabled with `font-variant-ligatures: none` and `font-feature-settings: "liga" 0, "calt" 0`.
- Text shadow: none.
- Nested `code` elements inherit font family, size, line height, color, and whitespace from the `pre`.

### Line Numbers

- Line numbers use Prism's line-numbers plugin.
- Number gutter selector: `.prose .line-numbers .line-numbers-rows`.
- Gutter position: `top: 0`, `left: -4.25rem`.
- Gutter width: `3.25rem`.
- Gutter divider: `1px solid #42b883`.
- Number color: `#7a8797`.
- Number padding-right: `0.75rem`.
- Each number row height and line height must match `--code-line-height`.

### Copy Button

- Copy behavior uses Prism's toolbar and copy-to-clipboard plugins.
- Toolbar is positioned at `top: 0.7rem` and `right: 0.7rem` inside the code block wrapper.
- Toolbar opacity is `0` by default and becomes visible on code block hover or focus-within.
- Copy button size: `2rem` by `2rem`.
- Button border radius: `6px`.
- Button background: `color-mix(in srgb, #2d2d2d 72%, transparent)`.
- Button icon color: `#5bc0be`.
- Button text is visually hidden by setting `font-size: 0`; the icon is drawn with a CSS mask.
- Hover/focus state background: `color-mix(in srgb, var(--accent) 28%, #2d2d2d)`.
- Hover/focus state text/icon color: `#ffffff`.
- Hover/focus transform: `scale(1.08)`.
- Success state uses `data-copy-state="copy-success"` and changes the icon mask to a check mark with `#42b883`.

### Syntax Token Colors

| Token selector | Color | Notes |
| --- | --- | --- |
| `.token.keyword`, `.token.boolean` | `#cc99cd` | Keywords and booleans |
| `.token.function`, `.token.class-name` | `#f8c555` | Functions and class names |
| `.token.string`, `.token.char` | `#7ec699` | Strings and characters |
| `.token.number`, `.token.operator`, `.token.constant` | `#f08d49` | Numbers, operators, constants |
| `.token.comment`, `.token.prolog`, `.token.doctype`, `.token.cdata` | `#999` | Italic comments and metadata |
| `.token.macro`, `.token.directive`, `.token.property`, `.token.variable`, `.token.symbol`, `.token.section` | `#67cdcc` | Preprocessor-like and linker-script tokens |

### Linker Script Highlighting

- Linker-script code blocks should use `linker-script`, `ld`, `lds`, or `linkerscript` as the fenced-code language.
- Supported linker-script token groups: block comments, hash comments, strings, GNU linker-script keywords, booleans, sections, numbers with optional `K`, `M`, or `G` suffixes, function-like symbols, operators, punctuation, and plain symbols.
- The linker-script grammar should stay in `assets/js/main.js` unless it becomes large enough to justify a separate local module.

## Tables

- Width: `100%`.
- Border collapse: `collapse`.
- Border radius: `8px`.
- Font family: `--font-ui`.
- Font size: `0.95rem`.
- Cell border: `1px solid var(--line)`.
- Cell padding: `0.7rem`.
- Header background: `--surface-2`.

## Motion and Interaction

- Page scroll behavior: smooth.
- Link hover color: `--accent-2`.
- Tag, taxonomy, article metadata, copy button, and back-to-top states use short transitions from `160ms` to `180ms`.
- Focus-visible states should remain visually equivalent to hover states for keyboard accessibility.

## Responsive Rules

- At widths below `991.98px`, the article sidebar and site header stop being sticky.
- At widths below `575.98px`, page and article titles can use full width, and article cards/sidebar panels drop box shadows.
- Font sizes use `clamp()` for major titles so they scale fluidly without viewport-only font sizing.

## Content and Generated Pages

- Articles are written in Markdown with YAML front matter.
- Article Markdown files live in slug-named series folders under `content/articles/`.
- Article front matter supports `title`, `date`, `tags`, `series`, `summary`, and `slug`.
- Generated article URLs are based on the article slug, not the source folder path.
- Static filter pages are generated for each series and tag.
- Tag and series links must point to generated filter pages and remain shareable without JavaScript.
- Static article search is generated at `search/index.html` with article data in `search-index.json`.
- Search covers published articles only and matches title, summary, tags, series, and article body text.
