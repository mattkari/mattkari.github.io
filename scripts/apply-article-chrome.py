#!/usr/bin/env python3
"""Apply the shared article chrome to every standalone article.

Each article under public/articles/<slug>/index.html used to carry its own
inline <style> block and its own text nav. This script replaces both with a
single stylesheet link (public/articles/_article.css) plus a shared header and
footer, so the chrome has ONE source of truth.

It also writes two things from src/lib/articles.ts, so an article can never
disagree with the listing on the home page and the archive:

  - the byline under each title ("author · date · N min read")
  - the links at the end of each article to the next and previous one

And it adds the reading aids every article shares: an id on each heading, an
"On this page" list at the top, a "Back to top" button, and
the small script that drives that button and the copy buttons on code blocks.
  - the machine-readable metadata in <head>: the publication date, a link to
    the RSS feed, and a schema.org BlogPosting block for search engines

Idempotent: safe to re-run after adding a new article.

    python3 scripts/apply-article-chrome.py          # apply
    python3 scripts/apply-article-chrome.py --check  # report, change nothing
"""

from __future__ import annotations

import html as htmllib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES = ROOT / "public" / "articles"
REGISTRY = ROOT / "src" / "lib" / "articles.ts"
SITE_FILE = ROOT / "src" / "lib" / "site.ts"


def read_site_url() -> str:
    """The site address, from the one place the app defines it."""
    match = re.search(r"SITE_URL\s*=\s*'([^']+)'", SITE_FILE.read_text(encoding="utf-8"))
    if not match:
        raise ValueError("no SITE_URL found in src/lib/site.ts")
    return match.group(1).rstrip("/")


SITE_URL = read_site_url()

# The name as it appears on every article, matching the "Karimov, D." citations.
AUTHOR = "Dusmamat (Matt) Karimov"
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

# The fonts are self-hosted (see scripts/copy-article-fonts.py), so an article
# makes no third-party request. Preloading the two Latin files lets the text
# paint in the right face straight away.
FONTS = (
    '<link rel="preload" href="/fonts/inter-latin.woff2" as="font" type="font/woff2" crossorigin>\n'
    '<link rel="preload" href="/fonts/playfair-latin.woff2" as="font" type="font/woff2" crossorigin>'
)

STYLESHEET = '<link rel="stylesheet" href="/articles/_article.css">'

# The browser chrome follows the system setting, like the page does by default.
THEME_META = (
    '<meta name="color-scheme" content="light dark">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fbf8f3">\n'
    '<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#020617">'
)

# The same script the app inlines: it settles the theme before the first paint.
THEME_SCRIPT = (
    "<script data-theme-init>\n"
    + (ROOT / "src" / "lib" / "theme-init.js").read_text(encoding="utf-8").strip()
    + "\n</script>"
)

TOGGLE = (
    '<button class="theme-toggle" type="button" data-theme-toggle '
    'aria-label="Switch between light and dark theme" title="Switch between light and dark theme">\n'
    '<svg class="to-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>\n'
    '<svg class="to-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" '
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41'
    'M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>\n'
    "</button>"
)

HEADER = """<header class="site-header">
<div class="inner">
<a class="mark" href="/" aria-label="Home">MK</a>
<a class="name" href="/">Matt Karimov</a>
<a class="nav" href="/writing">All writing</a>
{toggle}
</div>
</header>""".format(toggle=TOGGLE)

FOOTER = """<footer class="site-footer">
<div class="inner">
<a href="/">Home</a>
<span class="sep" aria-hidden="true">&middot;</span>
<a href="/writing">All writing</a>
<span class="sep" aria-hidden="true">&middot;</span>
<a href="https://www.linkedin.com/in/mattkari">LinkedIn</a>
<span class="sep" aria-hidden="true">&middot;</span>
<a href="https://github.com/mattkari">GitHub</a>
</div>
</footer>"""

STYLE_RE = re.compile(r"[ \t]*<style>.*?</style>\n?", re.DOTALL)
OLD_NAV_RE = re.compile(r"[ \t]*<nav\b.*?</nav>\n?", re.DOTALL)
# an older generator inlined a light-theme footer on some articles
OLD_FOOTER_RE = re.compile(r"[ \t]*<footer style=.*?</footer>\n?", re.DOTALL)
# light-theme borders inlined on <img> tags; _article.css styles images now
IMG_STYLE_RE = re.compile(r'\s*style="max-width:100%;height:auto;border:1px solid #ddd"')
HEADER_RE = re.compile(r'<header class="site-header">.*?</header>\n?', re.DOTALL)
FOOTER_RE = re.compile(r'<footer class="site-footer">.*?</footer>\n?', re.DOTALL)
# the Google Fonts links older runs inserted, and this script's own preloads
FONTS_RE = re.compile(
    r'[ \t]*<link rel="(?:preconnect|stylesheet)" href="https://fonts\.[^"]*"[^>]*>\n?'
    r'|[ \t]*<link rel="preload" href="/fonts/[^"]*"[^>]*>\n?'
)
SHEET_RE = re.compile(r'[ \t]*<link rel="stylesheet" href="/articles/_article\.css">\n?')
THEME_RE = re.compile(r'[ \t]*<meta name="(?:theme-color|color-scheme)"[^>]*>\n?')
THEME_SCRIPT_RE = re.compile(r"[ \t]*<script data-theme-init>.*?</script>\n?", re.DOTALL)
# every byline form used so far: with or without the class, either name
BYLINE_RE = re.compile(r'[ \t]*<p(?: class="meta")?>(?:Dusmamat \(Matt\)|Matt) Karimov · [^<]*</p>\n?')
FEED_LINK = (
    '<link rel="alternate" type="application/rss+xml" '
    f'title="Matt Karimov: Writing" href="{SITE_URL}/feed.xml">'
)
FEED_RE = re.compile(r'[ \t]*<link rel="alternate" type="application/rss\+xml"[^>]*>\n?')
PUBLISHED_RE = re.compile(r'[ \t]*<meta property="article:(?:published_time|author)"[^>]*>\n?')
JSONLD_RE = re.compile(r'[ \t]*<script type="application/ld\+json">.*?</script>\n?', re.DOTALL)
# absolute addresses in <head> that must follow the site address if it changes
ORIGIN_RE = re.compile(
    r'((?:rel="canonical" href|property="og:(?:url|image)" content|name="twitter:image" content)=")'
    r'https?://[^/"]+'
)
TITLE_RE = re.compile(r"<title>(.*?)</title>", re.DOTALL)
DESCRIPTION_RE = re.compile(r'<meta name="description" content="([^"]*)">')
H1_RE = re.compile(r"<h1>.*?</h1>\n?", re.DOTALL)
ENTRY_RE = re.compile(
    r"slug:\s*'([^']+)'.*?date:\s*'(\d{4})-(\d{2})-(\d{2})',\s*readingMinutes:\s*(\d+)",
    re.DOTALL,
)


TITLE_ENTRY_RE = re.compile(r"\{\s*slug:\s*'([^']+)',\s*title:\s*(.+?),\s*summary:", re.DOTALL)


def read_registry() -> dict[str, dict]:
    """slug -> title, date, reading time and neighbours, from the TypeScript registry."""
    source = REGISTRY.read_text(encoding="utf-8")
    titles = {}
    for slug, raw in TITLE_ENTRY_RE.findall(source):
        raw = raw.strip()
        title = raw[1:-1] if raw[0] in "\"'`" else raw
        titles[slug] = title.replace("\\'", "'").replace('\\"', '"')

    entries = {}
    for slug, year, month, day, minutes in ENTRY_RE.findall(source):
        entries[slug] = {
            "title": titles[slug],
            "iso": f"{year}-{month}-{day}",
            "display": f"{int(day)} {MONTHS[int(month) - 1]} {year}",
            "minutes": int(minutes),
        }

    # newest first, as the site lists them; sorted() keeps the registry's order for equal dates
    order = sorted(entries, key=lambda slug: entries[slug]["iso"], reverse=True)
    for i, slug in enumerate(order):
        entries[slug]["newer"] = order[i - 1] if i > 0 else None
        entries[slug]["older"] = order[i + 1] if i + 1 < len(order) else None
        entries[slug]["total"] = len(order)
    return entries


# ---------- reading aids ----------

# Every article with at least this many sections gets an "On this page" list,
# so all articles open the same way, short or long.
TOC_MIN_SECTIONS = 3

HEADING_RE = re.compile(r'<h([23])(?: id="[^"]*")?>(.*?)</h\1>', re.DOTALL)
TOC_RE = re.compile(r'[ \t]*<nav class="toc".*?</nav>\n?', re.DOTALL)
MORE_RE = re.compile(r'[ \t]*<nav class="more".*?</nav>\n?', re.DOTALL)
# the hand-written ending some older articles carried
OLD_MORE_RE = re.compile(
    r'[ \t]*<hr\s*/?>\s*<p class="meta"><a href="/writing">More articles</a> · <a href="/">About me</a></p>\n?'
)
TO_TOP = '<a class="to-top" href="#top">Back to top</a>'
TO_TOP_RE = re.compile(r'[ \t]*<a class="to-top"[^>]*>.*?</a>\n?')
ARTICLE_SCRIPT = '<script src="/articles/_article.js" defer></script>'
ARTICLE_SCRIPT_RE = re.compile(r'[ \t]*<script src="/articles/_article\.js" defer></script>\n?')


def plain(fragment: str) -> str:
    return htmllib.unescape(re.sub(r"<[^>]+>", "", fragment)).strip()


def add_heading_ids(html: str) -> tuple[str, list[tuple[str, str]]]:
    """Give every h2 and h3 an id made from its words; return the h2s for the contents list."""
    used: set[str] = set()
    sections: list[tuple[str, str]] = []

    def with_id(match: re.Match) -> str:
        level, inner = match.group(1), match.group(2)
        base = re.sub(r"[^a-z0-9]+", "-", plain(inner).lower()).strip("-") or "section"
        anchor, n = base, 2
        while anchor in used:
            anchor, n = f"{base}-{n}", n + 1
        used.add(anchor)
        if level == "2":
            sections.append((anchor, inner.strip()))
        return f'<h{level} id="{anchor}">{inner}</h{level}>'

    return HEADING_RE.sub(with_id, html), sections


def contents(sections: list[tuple[str, str]]) -> str:
    items = "\n".join(f'<li><a href="#{anchor}">{label}</a></li>' for anchor, label in sections)
    return (
        '<nav class="toc" aria-label="On this page">\n'
        f"<details open>\n<summary>On this page</summary>\n<ol>\n{items}\n</ol>\n</details>\n</nav>\n"
    )


def keep_reading(entry: dict, registry: dict[str, dict]) -> str:
    """The end of every article: the neighbouring essays and the way back to the list."""
    cards = []
    for label, key in (("Newer", "newer"), ("Older", "older")):
        slug = entry[key]
        if slug:
            cards.append(
                f'<a class="more-card" href="/articles/{slug}/">'
                f'<span class="more-label">{label}</span>'
                f'<span class="more-title">{htmllib.escape(registry[slug]["title"], quote=False)}</span></a>'
            )
    return (
        '<nav class="more" aria-label="Keep reading">\n'
        '<p class="more-heading">Keep reading</p>\n'
        '<div class="more-cards">\n' + "\n".join(cards) + "\n</div>\n"
        f'<a class="more-all" href="/writing">All {entry["total"]} essays</a>\n'
        "</nav>\n"
    )


def structured_data(html: str, slug: str, entry: dict) -> str:
    """schema.org BlogPosting, built from the page's own title and description."""
    title = TITLE_RE.search(html)
    description = DESCRIPTION_RE.search(html)
    if not title or not description:
        raise ValueError("no <title> or meta description found")
    url = f"{SITE_URL}/articles/{slug}/"
    data = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": htmllib.unescape(title.group(1).strip()),
        "description": htmllib.unescape(description.group(1)),
        "datePublished": entry["iso"],
        "inLanguage": "en-GB",
        "url": url,
        "mainEntityOfPage": url,
        "image": f"{SITE_URL}/og/{slug}.png",
        "author": {"@type": "Person", "name": "Matt Karimov", "url": SITE_URL},
    }
    # "</" must not appear inside a <script> block
    body = json.dumps(data, ensure_ascii=False, indent=1).replace("</", "<\\/")
    return f'<script type="application/ld+json">\n{body}\n</script>'


def transform(html: str, slug: str, entry: dict, registry: dict[str, dict]) -> str:
    # strip anything this script previously inserted, so a re-run is clean
    html = HEADER_RE.sub("", html)
    html = FOOTER_RE.sub("", html)
    html = TOC_RE.sub("", html)
    html = MORE_RE.sub("", html)
    html = OLD_MORE_RE.sub("", html)
    html = TO_TOP_RE.sub("", html)
    html = ARTICLE_SCRIPT_RE.sub("", html)
    html = FONTS_RE.sub("", html)
    html = SHEET_RE.sub("", html)
    html = THEME_RE.sub("", html)
    html = THEME_SCRIPT_RE.sub("", html)
    html = FEED_RE.sub("", html)
    html = PUBLISHED_RE.sub("", html)
    html = JSONLD_RE.sub("", html)

    # drop the per-article inline style block, the old text nav and old footer
    html = STYLE_RE.sub("", html)
    html = OLD_NAV_RE.sub("", html)
    html = OLD_FOOTER_RE.sub("", html)
    html = IMG_STYLE_RE.sub("", html)

    # canonical and social-card addresses point at the current site address
    html = ORIGIN_RE.sub(lambda m: m.group(1) + SITE_URL, html)

    # one byline, directly under the title
    html = BYLINE_RE.sub("", html)
    title = H1_RE.search(html)
    if not title:
        raise ValueError("no <h1> found")
    byline = f'<p class="meta">{AUTHOR} · {entry["display"]} · {entry["minutes"]} min read</p>\n'

    # headings get ids; a long enough article gets a contents list under the byline
    html, sections = add_heading_ids(html)
    long_enough = len(sections) >= TOC_MIN_SECTIONS
    title = H1_RE.search(html)
    html = html[: title.end()] + byline + (contents(sections) if long_enough else "") + html[title.end():]

    # every article ends the same way
    html = html.replace("</article>", keep_reading(entry, registry) + "</article>", 1)

    published = f'<meta property="article:published_time" content="{entry["iso"]}">'
    head_block = (
        f"{published}\n{FEED_LINK}\n{structured_data(html, slug, entry)}\n"
        f"{THEME_META}\n{THEME_SCRIPT}\n{FONTS}\n{STYLESHEET}\n{ARTICLE_SCRIPT}\n"
    )
    if "</head>" not in html:
        raise ValueError("no </head> found")
    html = html.replace("</head>", head_block + "</head>", 1)

    # header goes immediately after <body>, footer immediately before </body>
    body_open = re.search(r"<body[^>]*>", html)
    if not body_open:
        raise ValueError("no <body> found")
    html = html[: body_open.start()] + '<body id="top">' + "\n" + HEADER + html[body_open.end():]

    if "</body>" not in html:
        raise ValueError("no </body> found")
    html = html.replace("</body>", TO_TOP + "\n" + FOOTER + "\n</body>", 1)

    return html


def main() -> int:
    check = "--check" in sys.argv
    pages = sorted(ARTICLES.glob("*/index.html"))
    if not pages:
        print("no articles found", file=sys.stderr)
        return 1

    registry = read_registry()
    unregistered = [p.parent.name for p in pages if p.parent.name not in registry]
    if unregistered:
        print(f"not in src/lib/articles.ts: {', '.join(unregistered)}", file=sys.stderr)
        return 1

    changed = 0
    for page in pages:
        before = page.read_text(encoding="utf-8")
        slug = page.parent.name
        after = transform(before, slug, registry[slug], registry)
        if before == after:
            print(f"  ok       {slug}")
            continue
        changed += 1
        if check:
            print(f"  WOULD FIX {slug}")
        else:
            page.write_text(after, encoding="utf-8")
            print(f"  updated  {slug}")

    print(f"\n{len(pages)} article(s), {changed} changed")
    if check and changed:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
