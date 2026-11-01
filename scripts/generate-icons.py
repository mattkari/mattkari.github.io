#!/usr/bin/env python3
"""Generate every site icon from one SVG master.

Master: public/icon-master.svg (the MK monogram, amber on slate-950).

    python3 scripts/generate-icons.py

Writes:
  public/favicon.ico        16 / 32 / 48 px
  public/icon-192.png       manifest
  public/icon-512.png       manifest
  public/apple-touch-icon.png  180x180, opaque (iOS ignores transparency)

Rendered with chromium because it is already the repo's headless renderer and
no SVG library is installed. The Playfair letterforms come from the self-hosted
font file so the render needs no network.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
MASTER = PUBLIC / "icon-master.svg"
MASTER_SMALL = PUBLIC / "icon-master-small.svg"
RENDER_AT = 512

PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{
  font-family: "Playfair Display";
  src: url("file://{root}/public/fonts/playfair-latin.woff2") format("woff2");
  font-weight: 400 900; font-style: normal;
}}
html,body {{ margin:0; padding:0; width:{n}px; height:{n}px; overflow:hidden; }}
svg {{ display:block; width:{n}px; height:{n}px; }}
</style></head><body>{svg}</body></html>"""


def render_master(chromium: str, master: Path) -> Path:
    svg = master.read_text(encoding="utf-8")
    page = PAGE.format(root=ROOT, n=RENDER_AT, svg=svg)
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False, encoding="utf-8") as fh:
        fh.write(page)
        tmp = fh.name
    out = Path(tempfile.mkdtemp(prefix="icon-")) / f"{master.stem}.png"
    profile = tempfile.mkdtemp(prefix="chrome-icon-")
    subprocess.run(
        [chromium, "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
         f"--user-data-dir={profile}", "--default-background-color=00000000",
         f"--window-size={RENDER_AT},{RENDER_AT}", f"--screenshot={out}", f"file://{tmp}"],
        check=True, capture_output=True, timeout=120,
    )
    Path(tmp).unlink(missing_ok=True)
    shutil.rmtree(profile, ignore_errors=True)
    return out


def main() -> int:
    chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    if not chromium:
        print("chromium not found", file=sys.stderr)
        return 1
    for src in (MASTER, MASTER_SMALL):
        if not src.exists():
            print(f"missing master: {src}", file=sys.stderr)
            return 1

    big_png = render_master(chromium, MASTER)
    master = Image.open(big_png).convert("RGBA")
    print(f"rendered master at {master.size[0]}px")

    for size in (192, 512):
        dest = PUBLIC / f"icon-{size}.png"
        master.resize((size, size), Image.Resampling.LANCZOS).save(dest)
        print(f"  {dest.relative_to(ROOT)}")

    # iOS composites on white if the icon is transparent, so flatten on the brand navy
    apple = Image.new("RGB", (180, 180), (2, 6, 23))
    resized = master.resize((180, 180), Image.Resampling.LANCZOS)
    apple.paste(resized, (0, 0), resized)
    apple.save(PUBLIC / "apple-touch-icon.png")
    print("  public/apple-touch-icon.png")

    # The ringed monogram turns to mush at 16px, so the .ico uses a ring-less
    # variant with much larger letterforms.
    small_png = render_master(chromium, MASTER_SMALL)
    small = Image.open(small_png).convert("RGBA")
    ico = PUBLIC / "favicon.ico"
    small.save(ico, sizes=[(16, 16), (32, 32), (48, 48)])
    print(f"  {ico.relative_to(ROOT)} (16/32/48, ring-less variant)")

    shutil.rmtree(big_png.parent, ignore_errors=True)
    shutil.rmtree(small_png.parent, ignore_errors=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
