#!/usr/bin/env python3
"""Self-host the article fonts from the files next/font already builds.

The home page gets Inter and Playfair Display through next/font, which
downloads them at build time and serves them from the site itself. The
standalone articles used to load the same two families from Google Fonts over
the network. This script copies the Latin and Latin Extended files out of the
Next.js build into public/fonts under stable names, and writes the matching
@font-face rules into public/articles/_article.css, so articles make no
third-party request.

Run it after a build, and again only if the fonts in src/app/layout.tsx change:

    npm run build
    python3 scripts/copy-article-fonts.py

It also provides the public/fonts files that generate-og-images.py and
generate-icons.py read.
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BUILD_CSS = ROOT / ".next" / "static" / "css"
BUILD_MEDIA = ROOT / ".next" / "static" / "media"
FONTS = ROOT / "public" / "fonts"
STYLESHEET = ROOT / "public" / "articles" / "_article.css"

# family as next/font names it -> stable file prefix
FAMILIES = {"Inter": "inter", "Playfair Display": "playfair"}
# a code point that only this subset's unicode-range contains
SUBSETS = {"latin": "u+0131", "latin-ext": "u+0100-02ba"}

START = "/* fonts:start (written by scripts/copy-article-fonts.py) */"
END = "/* fonts:end */"
FACE_RE = re.compile(r"@font-face\{([^}]*)\}")


def field(block: str, name: str) -> str:
    match = re.search(rf"{name}:([^;]+)", block)
    return match.group(1).strip() if match else ""


def main() -> int:
    if not BUILD_CSS.is_dir():
        print("no Next.js build found: run `npm run build` first", file=sys.stderr)
        return 1

    faces = []
    for sheet in sorted(BUILD_CSS.glob("*.css")):
        for match in FACE_RE.finditer(sheet.read_text(encoding="utf-8")):
            block = match.group(1)
            family = field(block, "font-family").strip("'\"")
            url = re.search(r"url\(([^)]+)\)", block)
            if family not in FAMILIES or not url or field(block, "font-style") != "normal":
                continue
            ranges = field(block, "unicode-range").lower()
            for subset, marker in SUBSETS.items():
                if marker in ranges.split(","):
                    faces.append((family, subset, field(block, "font-weight"), ranges,
                                  BUILD_MEDIA / url.group(1).split("/")[-1]))

    expected = len(FAMILIES) * len(SUBSETS)
    if len(faces) != expected:
        print(f"expected {expected} font files in the build, found {len(faces)}", file=sys.stderr)
        return 1

    FONTS.mkdir(parents=True, exist_ok=True)
    rules = []
    for family, subset, weight, ranges, source in sorted(faces, key=lambda f: (f[0], f[1])):
        name = f"{FAMILIES[family]}-{subset}.woff2"
        shutil.copyfile(source, FONTS / name)
        rules.append(
            "@font-face {\n"
            f'  font-family: "{family}";\n'
            "  font-style: normal;\n"
            f"  font-weight: {weight};\n"
            "  font-display: swap;\n"
            f'  src: url("/fonts/{name}") format("woff2");\n'
            f"  unicode-range: {ranges};\n"
            "}"
        )
        print(f"  {name}  ({source.stat().st_size // 1024} KB)")

    block = START + "\n" + "\n\n".join(rules) + "\n" + END
    css = STYLESHEET.read_text(encoding="utf-8")
    if START in css:
        css = css[: css.index(START)] + block + css[css.index(END) + len(END):]
    else:
        # the rules go straight after the opening comment, before :root
        css = css.replace(":root {", block + "\n\n:root {", 1)
    STYLESHEET.write_text(css, encoding="utf-8")
    print(f"wrote {len(rules)} @font-face rules to {STYLESHEET.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
