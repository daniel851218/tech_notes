# Tech Notes theme specification

This document describes the current theme's visual style, typography, layout, and responsive behavior. Values come from the theme's CSS, templates, and JavaScript. Pixel equivalents for `rem` values assume a 16px browser root size; user font settings can change them.

## Visual direction

A technical notebook with a warm paper background, a subtle square grid, teal links, amber and sage section headings, and bordered white cards. Dark mode keeps the same structure with charcoal surfaces and softer accent colors. The typography emphasizes readable technical prose, distinct code, and native mathematical notation.

- Background grid: 42px squares, drawn with two 1px linear gradients using teal at 4% opacity.
- Cards and panels: 1px borders, 8px corners, and a soft shadow. Card shadows are removed at widths of 640px and below.
- Controls: generally 6px corners; tags use pill shapes; inline code uses 4px corners.
- Links: teal by default, warm orange on hover. Component links may use muted or body text until hovered.
- H2 article sections: amber text with a 2px separator above. H3 sections: sage text.
- Standard link/control transitions: 160ms. Reduced-motion preferences disable transitions, animations, and smooth scrolling.

## Color palette

These tokens are defined in [style.css](assets/css/style.css).

| Role / CSS variable | Light | Dark |
| --- | --- | --- |
| Main text / `--ink` | `#182026` | `#eff2ec` |
| Secondary text / `--muted` | `#66727f` | `#aab2b8` |
| Page background / `--paper` | `#fbfaf5` | `#111315` |
| Card background / `--surface` | `#ffffff` | `#1b1f22` |
| Secondary surface / `--surface-2` | `#f0eee7` | `#242a2e` |
| Borders / `--line` | `#ded9cb` | `#373f45` |
| Primary accent / `--accent` | `#0f7c80` | `#63c7c9` |
| Secondary accent / `--accent-2` | `#b84a31` | `#f09c73` |
| Article H2 / `--heading-2` | `#865314` | `#e8c07d` |
| Article H3 / `--heading-3` | `#32684f` | `#9cc6af` |

The card shadow is `0 18px 45px` with warm black at 7% opacity in light mode and black at 20% in dark mode. Tags and blockquotes use subtle accent tints mixed with the current surface.

Code blocks retain their dark palette in both modes: background `#2d2d2d`, toolbar `#26292b`, border `#373f45`, and default text `#cccccc`.

## Typography

### Font families

All font files are local WOFF2 assets, declared with `font-display: swap` in [fonts.css](assets/css/fonts.css).

| Use | Primary font | Fallbacks | Bundled styles |
| --- | --- | --- | --- |
| Body and interface | Atkinson Hyperlegible Next | Segoe UI, sans-serif | Variable weights 200–800; upright and italic; Latin and Latin Extended subsets |
| Block and inline code | JetBrains Mono | Cascadia Code, Consolas, monospace | Regular, italic, bold, bold italic |
| MathML formulas | STIX Two Math | Cambria Math, math | Regular |

Body and interface share the same sans-serif family. Programming ligatures are disabled for code. Keep the source notes and SIL Open Font License files alongside the fonts under [static/fonts/](static/fonts/).

### Type scale

The mobile column applies at viewport widths of 640px and below.

| Element | Above 640px | Mobile | Weight / line height |
| --- | --- | --- | --- |
| Article prose and lead text | 18px | 17px | 400 / 1.7 |
| Page title and article H1 | 40px | 32px | 800 / 1.15 |
| Article H2 | 28px | 24px | 800 / 1.25 |
| Article H3 | 24px | 21px | 800 / 1.25 |
| Article H4 | 20px | 19px | 800 / 1.25 |
| Article H5 | 18px | 18px | 700 / 1.25 |
| Article H6 | 18px | 17px | 600, italic / 1.25 |
| Article card title | 26px | 22px | 800 / 1.25 |
| Code block | 13.92px | 12.48px | 400 / 1.75 |

Prose paragraphs, lists, and blockquotes have a maximum measure of 70 characters (`70ch`). Titles use slightly negative letter spacing; small section labels use uppercase text and positive letter spacing. Metadata and navigation use smaller interface text. Inline code uses `0.86em`, a tinted background, and the secondary accent color.

## Layout system

### Shared shell

- Main container: `min(1280px, 100% - 64px)`, centered. At widths of 640px and below, use `100% - 32px`.
- Body: a vertical flex layout with a flexible main region, keeping the footer at the bottom on short pages.
- Header: sticky on desktop, with an 88px minimum inner height, bottom border, translucent paper background, and 16px backdrop blur.
- Header contents: book icon and site title, configured navigation, compact search form, and theme toggle. Compact navigation adds a menu control.
- Footer: top border, copyright and links; minimum inner height 90px. It stacks and centers on small screens.
- Standard page padding: `clamp(2rem, 4.5vw, 4.25rem)` above and `5rem` below. At 640px and below, use `2rem` above and `3rem` below.

### Page layouts

| Page | Main content | Supporting region |
| --- | --- | --- |
| Home | Latest Notes heading, count, stacked article cards, pagination | Series list, tag cloud, archives link |
| Article section | Paginated article cards | Shared browsing sidebar |
| Article | Breadcrumb, date and optional reading time, title, optional summary, series/tags, prose, end-of-note link | Table of contents and ordered series navigation |
| Archives | Year groups with dated article rows | Shared browsing sidebar |
| Tags / series index | Two-column grid of taxonomy cards | Shared browsing sidebar |
| Individual tag / series | Heading, count, paginated article cards | Shared browsing sidebar |
| Search | Heading, query field and button, status, result cards | No sidebar; maximum container width 900px |
| Standalone page / 404 | Heading and content or recovery link | No sidebar; maximum container width 850px |

Desktop pages with sidebars use `minmax(0, 1fr)` for the main column and a fixed sidebar. The gap is `clamp(2rem, 4vw, 3.5rem)`. Main content can shrink without forcing code blocks outside the page.

Home and tag listings show newest articles first. Series listings and the article's series navigation use ascending `series_order`, with date ordering as the initial sort. The site configuration controls pagination; the current setting is six articles per page.

### Responsive rules

| Viewport | Behavior |
| --- | --- |
| 1200px and above | Two-column pages use a 300px sidebar. Desktop navigation and header search are visible. |
| 992–1199px | Sidebar reduces to 265px; header spacing and search field narrow. |
| 641–991px | Pages become one column; browsing sidebar panels sit side by side. Header is no longer sticky, has a 78px minimum inner height, and uses a menu instead of desktop navigation. |
| 640px and below | 16px page gutters; smaller type; 72px minimum header inner height. Header search is hidden, sidebar panels and taxonomy cards stack, card reading time is hidden, search controls stack, and footer content centers. Search remains available in the menu. |

On article pages at 991px and below, the order is article header, table of contents, prose, then end-of-note link. The series navigation panel is hidden. JavaScript collapses the contents panel initially; it remains an expandable native `details` element. Without JavaScript, it starts open. The contents list has a 220px maximum height in this layout.

On desktop, the article sidebar is sticky at `7.5rem`, with an independently scrollable maximum height of `calc(100dvh - 9rem)`.

## Content components

- **Article cards:** responsive padding, metadata row, prominent title, summary, tag pills, and a Read note link. Cards are spaced `1.25rem` apart.
- **Tags:** small bordered pills with accent text and a subtle tinted fill. Hover and current states use a solid accent fill; hover raises the pill by 1px.
- **Table of contents:** nested indentation, muted links, and an accent left border on hover or the current heading. The current site includes H2–H4 headings.
- **Blockquotes:** tinted panel with a 3px accent border at the left.
- **Images:** scale to their container, preserve aspect ratio, and have a 1px border and 8px corners.
- **Tables:** bordered cells, tinted header row, and horizontal overflow inside the table region.
- **Code blocks:** dark panel with language label, copy control, line numbers, and horizontal scrolling. Source lines remain unwrapped on screen; tabs occupy four spaces. Copying excludes line numbers.
- **Math:** rendered at build time to MathML using Hugo's math transform. Display formulas scroll horizontally when necessary and use a size of `1.1em`.
- **Back to top:** fixed 44px square control, 22px from the bottom and right, with an 8px radius and subtle shadow. It becomes visible after scrolling 420px.

### Syntax palette

The token styles are defined in [chroma.css](assets/css/chroma.css).

| Token group | Color |
| --- | --- |
| Keywords and types | `#cc99cd` |
| Functions and classes | `#f8c555` |
| Strings | `#7ec699` |
| Numbers and operators | `#f08d49` |
| Comments | `#a4a4a4` |
| General preprocessor / attribute / variable tokens | `#67cdcc` |

C/C++ overrides use purple preprocessor directives, gold macro names, green include paths, and upright comments. Other language comments are italic. Inline syntax highlighting uses theme-aware accent colors rather than the block palette.

## Interaction and accessibility

- Theme preference: saved user choice, then an explicit site default, then system preference. The toggle persists the choice in local storage. Automatic mode follows system changes while no explicit user choice is active.
- Native links, buttons, forms, and disclosure elements support keyboard navigation. A skip link appears on focus; focus indicators use a 2px accent outline with a 4px offset, with inset indicators inside code panels.
- Search exposes status updates through a polite live region and highlights matches. Search requires JavaScript; normal article, archive, taxonomy, and series links remain usable without it.
- Copy controls provide temporary success/failure feedback and appear when JavaScript is available.
- The contents sidebar marks the observed heading as current. Escape closes an open mobile menu and returns focus to its control.
- Reduced-motion mode disables smooth scrolling and transitions.
- Print styling uses a white page background, hides navigation and article sidebars, removes container width restrictions, uses 28pt titles and 11pt prose, and allows code to wrap.

## Source map

| Concern | Source |
| --- | --- |
| Colors, type scale, spacing, components, responsive and print rules | [assets/css/style.css](assets/css/style.css) |
| Font files and loading | [assets/css/fonts.css](assets/css/fonts.css), [static/fonts/](static/fonts/) |
| Syntax highlighting colors | [assets/css/chroma.css](assets/css/chroma.css) |
| Shared document shell | [layouts/baseof.html](layouts/baseof.html) |
| Page layouts and reusable components | [layouts/](layouts/) |
| Initial theme selection | [assets/js/theme-init.js](assets/js/theme-init.js) |
| Theme toggle, copy, contents tracking, and scrolling | [assets/js/main.js](assets/js/main.js) |
| Search behavior | [assets/js/search.js](assets/js/search.js) |
| Site menus, pagination, markup, and theme parameters | [Root hugo.toml](../../hugo.toml) |

Change CSS variables for palette and typography adjustments. Use the site-level `layouts/_partials/head-extra.html` override for additional head content. Keep layout, styling, and interaction changes aligned with this specification.
