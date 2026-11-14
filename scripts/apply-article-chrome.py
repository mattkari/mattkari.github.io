#!/usr/bin/env python3
"""Apply the shared article chrome to every standalone article.

Each article under public/articles/<slug>/index.html used to carry its own
inline <style> block and its own text nav. This script replaces both with a
single stylesheet link (public/articles/_article.css) plus a shared header and
footer, so the chrome has ONE source of truth.

It also writes the byline under each title ("author · date · N min read") from
src/lib/articles.ts, so the date and reading time shown on an article can never
disagree with the listing on the home page and the archive.

Idempotent: safe to re-run after adding a new article.

    python3 scripts/apply-article-chrome.py          # apply
    python3 scripts/apply-article-chrome.py --check  # report, change nothing
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTICLES = ROOT / "public" / "articles"
REGISTRY = ROOT / "src" / "lib" / "articles.ts"

# The name as it appears on every article, matching the "Karimov, D." citations.
AUTHOR = "Dusmamat (Matt) Karimov"
MONTHS = ["January", "February", "March", "April", "May", "June", "July",
          "August", "September", "October", "November", "December"]

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?'
    "family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500"
    '&display=swap">'
)

STYLESHEET = '<link rel="stylesheet" href="/articles/_article.css">'

THEME_META = '<meta name="theme-color" content="#020617">'

HEADER = """<header class="site-header">
<div class="inner">
<a class="mark" href="/" aria-label="Home">MK</a>
<a class="name" href="/">Matt Karimov</a>
<a class="nav" href="/writing">All writing</a>
</div>
</header>"""

FOOTER = """<footer class="site-footer">
<div class="inner">
<a href="/">Home</a>
<span class="sep">&middot;</span>
<a href="/writing">All writing</a>
<span class="sep">&middot;</span>
<a href="https://www.linkedin.com/in/mattkari">LinkedIn</a>
<span class="sep">&middot;</span>
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
FONTS_RE = re.compile(r'[ \t]*<link rel="(?:preconnect|stylesheet)" href="https://fonts\.[^"]*"[^>]*>\n?')
SHEET_RE = re.compile(r'[ \t]*<link rel="stylesheet" href="/articles/_article\.css">\n?')
THEME_RE = re.compile(r'[ \t]*<meta name="theme-color"[^>]*>\n?')
# every byline form used so far: with or without the class, either name
BYLINE_RE = re.compile(r'[ \t]*<p(?: class="meta")?>(?:Dusmamat \(Matt\)|Matt) Karimov · [^<]*</p>\n?')
H1_RE = re.compile(r"<h1>.*?</h1>\n?", re.DOTALL)
ENTRY_RE = re.compile(
    r"slug:\s*'([^']+)'.*?date:\s*'(\d{4})-(\d{2})-(\d{2})',\s*readingMinutes:\s*(\d+)",
    re.DOTALL,
)


def read_registry() -> dict[str, dict]:
    """slug -> date and reading time, from the TypeScript registry."""
    entries = {}
    for slug, year, month, day, minutes in ENTRY_RE.findall(REGISTRY.read_text(encoding="utf-8")):
        entries[slug] = {
            "iso": f"{year}-{month}-{day}",
            "display": f"{int(day)} {MONTHS[int(month) - 1]} {year}",
            "minutes": int(minutes),
        }
    return entries


def transform(html: str, entry: dict) -> str:
    # strip anything this script previously inserted, so a re-run is clean
    html = HEADER_RE.sub("", html)
    html = FOOTER_RE.sub("", html)
    html = FONTS_RE.sub("", html)
    html = SHEET_RE.sub("", html)
    html = THEME_RE.sub("", html)

    # drop the per-article inline style block, the old text nav and old footer
    html = STYLE_RE.sub("", html)
    html = OLD_NAV_RE.sub("", html)
    html = OLD_FOOTER_RE.sub("", html)
    html = IMG_STYLE_RE.sub("", html)

    # one byline, directly under the title
    html = BYLINE_RE.sub("", html)
    title = H1_RE.search(html)
    if not title:
        raise ValueError("no <h1> found")
    byline = f'<p class="meta">{AUTHOR} · {entry["display"]} · {entry["minutes"]} min read</p>\n'
    html = html[: title.end()] + byline + html[title.end():]

    head_block = f"{THEME_META}\n{FONTS}\n{STYLESHEET}\n"
    if "</head>" not in html:
        raise ValueError("no </head> found")
    html = html.replace("</head>", head_block + "</head>", 1)

    # header goes immediately after <body>, footer immediately before </body>
    body_open = re.search(r"<body[^>]*>", html)
    if not body_open:
        raise ValueError("no <body> found")
    html = html[: body_open.end()] + "\n" + HEADER + html[body_open.end():]

    if "</body>" not in html:
        raise ValueError("no </body> found")
    html = html.replace("</body>", FOOTER + "\n</body>", 1)

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
        after = transform(before, registry[slug])
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
