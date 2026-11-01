#!/usr/bin/env python3
"""Generate 1200x630 Open Graph cards for the site and every article.

The site is a static export, so cards are rendered once and committed. The
titles come from src/lib/articles.ts, which is the single registry for the
Writing section, so adding an article there and re-running this script is all
that is needed.

    python3 scripts/generate-og-images.py

Output: public/og/default.png and public/og/<slug>.png
Requires: chromium (headless), already used elsewhere in this repo.
"""

from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REGISTRY = ROOT / "src" / "lib" / "articles.ts"
OUT_DIR = ROOT / "public" / "og"

WIDTH, HEIGHT = 1200, 630

FACE = '''@font-face {{ font-family:"Inter"; src:url("file://{root}/public/fonts/inter-latin.woff2") format("woff2"); font-weight:100 900; font-style:normal; }}
@font-face {{ font-family:"Playfair Display"; src:url("file://{root}/public/fonts/playfair-latin.woff2") format("woff2"); font-weight:400 900; font-style:normal; }}'''

TEMPLATE = """<!doctype html>
<html><head><meta charset="utf-8">
<style>
{fontface}
* {{ box-sizing: border-box; margin: 0; }}
body {{
  width: {w}px; height: {h}px; overflow: hidden; position: relative;
  background: #020617; color: #f8fafc;
  font-family: Inter, system-ui, sans-serif;
}}
.glow-a {{ position:absolute; left:-180px; top:-220px; width:720px; height:720px;
  border-radius:50%; background:rgba(37,99,235,.28); filter:blur(110px); }}
.glow-b {{ position:absolute; right:-140px; bottom:-260px; width:620px; height:620px;
  border-radius:50%; background:rgba(252,211,77,.16); filter:blur(110px); }}
.rule {{ position:absolute; left:0; right:0; top:0; height:2px;
  background:linear-gradient(90deg,transparent,rgba(252,211,77,.75),transparent); }}
.wrap {{ position:relative; height:100%; padding:68px 76px;
  display:flex; flex-direction:column; justify-content:space-between; }}
.kicker {{ font-size:19px; letter-spacing:.3em; text-transform:uppercase;
  color:rgba(252,211,77,.85); font-weight:500; }}
h1 {{ font-family:"Playfair Display",Georgia,serif; font-weight:600;
  font-size:{size}px; line-height:1.14; letter-spacing:-.015em; max-width:1010px; }}
h1 .accent {{ font-style:italic; color:#fcd34d; }}
.foot {{ display:flex; align-items:center; gap:18px; }}
.mark {{ width:52px; height:52px; border:1.5px solid rgba(252,211,77,.55);
  border-radius:999px; display:flex; align-items:center; justify-content:center;
  font-family:"Playfair Display",Georgia,serif; font-size:20px; color:#fcd34d; }}
.who {{ font-size:21px; font-weight:600; }}
.dom {{ margin-left:auto; font-size:18px; letter-spacing:.16em;
  text-transform:uppercase; color:#94a3b8; }}
</style></head>
<body>
<div class="glow-a"></div><div class="glow-b"></div><div class="rule"></div>
<div class="wrap">
  <div class="kicker">{kicker}</div>
  <h1>{title}</h1>
  <div class="foot">
    <div class="mark">MK</div>
    <div class="who">Matt Karimov</div>
    <div class="dom">mattkari.github.io</div>
  </div>
</div>
</body></html>"""


def read_registry() -> list[dict]:
    """Pull slug + title pairs out of the TypeScript registry."""
    src = REGISTRY.read_text(encoding="utf-8")
    entries = []
    for match in re.finditer(r"\{\s*slug:\s*'([^']+)',\s*title:\s*(.+?),\s*summary:", src, re.DOTALL):
        slug, raw_title = match.group(1), match.group(2).strip()
        # the registry uses single quotes, double quotes, or a template literal
        title = raw_title[1:-1] if raw_title[0] in "\"'`" else raw_title
        title = title.replace("\\'", "'").replace('\\"', '"')
        entries.append({"slug": slug, "title": title})
    return entries


def title_size(title: str) -> int:
    """Shrink the display type so long titles stay inside the card."""
    n = len(title)
    if n <= 48:
        return 66
    if n <= 72:
        return 56
    if n <= 100:
        return 47
    return 40


def accent_markup(title: str) -> str:
    """Italicise the phrase after the last colon, or the final three words."""
    safe = html.escape(title)
    if ": " in safe:
        head, tail = safe.rsplit(": ", 1)
        return f"{head}:<br><span class='accent'>{tail}</span>"
    words = safe.split()
    if len(words) > 5:
        head, tail = " ".join(words[:-3]), " ".join(words[-3:])
        return f"{head} <span class='accent'>{tail}</span>"
    return f"<span class='accent'>{safe}</span>"


def render(dest: Path, kicker: str, title: str, chromium: str) -> None:
    page = TEMPLATE.format(
        fontface=FACE.format(root=ROOT),
        w=WIDTH, h=HEIGHT, kicker=kicker,
        title=accent_markup(title), size=title_size(title),
    )
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as fh:
        fh.write(page)
        tmp = fh.name
    # browser_exec holds chromium's default profile, so give each render its own
    profile = tempfile.mkdtemp(prefix="chrome-og-")
    subprocess.run(
        [chromium, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         f"--user-data-dir={profile}",
         f"--window-size={WIDTH},{HEIGHT}", f"--screenshot={dest}", f"file://{tmp}"],
        check=True, capture_output=True, timeout=120,
    )
    Path(tmp).unlink(missing_ok=True)
    shutil.rmtree(profile, ignore_errors=True)
    print(f"  {dest.relative_to(ROOT)}")


def wire_article_tags(entries: list[dict]) -> int:
    """Inject og:image/twitter tags into each standalone article page.

    Idempotent: previously injected tags are stripped before re-adding, so a
    re-run after a title change refreshes them.
    """
    root = ROOT / "public" / "articles"
    site = "https://mattkari.github.io"
    count = 0
    for entry in entries:
        page = root / entry["slug"] / "index.html"
        if not page.exists():
            print(f"  ! no page for {entry['slug']}", file=sys.stderr)
            continue
        html_text = page.read_text(encoding="utf-8")
        card = f"{site}/og/{entry['slug']}.png"
        for pattern in (
            r'<meta property="og:image"[^>]*>\n?',
            r'<meta property="og:image:(?:width|height)"[^>]*>\n?',
            r'<meta property="og:type"[^>]*>\n?',
            r'<meta name="twitter:[^"]*"[^>]*>\n?',
        ):
            html_text = re.sub(pattern, "", html_text)
        title = re.search(r'<meta property="og:title" content="([^"]*)"', html_text)
        desc = re.search(r'<meta property="og:description" content="([^"]*)"', html_text)
        block = (
            '<meta property="og:type" content="article">\n'
            f'<meta property="og:image" content="{card}">\n'
            '<meta property="og:image:width" content="1200">\n'
            '<meta property="og:image:height" content="630">\n'
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:title" content="{title.group(1) if title else ""}">\n'
            f'<meta name="twitter:description" content="{desc.group(1) if desc else ""}">\n'
            f'<meta name="twitter:image" content="{card}">\n'
        )
        if '<meta name="theme-color"' in html_text:
            html_text = html_text.replace('<meta name="theme-color"', block + '<meta name="theme-color"', 1)
        else:
            html_text = html_text.replace("</head>", block + "</head>", 1)
        page.write_text(html_text, encoding="utf-8")
        count += 1
    return count


def main() -> int:
    chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    if not chromium:
        print("chromium not found", file=sys.stderr)
        return 1

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    render(OUT_DIR / "default.png", "Matt Karimov \u00b7 AI engineering",
           "Answers that show their evidence", chromium)

    entries = read_registry()
    if not entries:
        print("no articles parsed from the registry", file=sys.stderr)
        return 1
    for entry in entries:
        render(OUT_DIR / f"{entry['slug']}.png", "Essay \u00b7 mattkari.github.io",
               entry["title"], chromium)

    wired = wire_article_tags(entries)
    print(f"\n{len(entries) + 1} card(s) in {OUT_DIR.relative_to(ROOT)}; "
          f"{wired} article page(s) tagged")
    print(json.dumps([e["slug"] for e in entries], indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
