# -*- coding: utf-8 -*-
"""
make_icon.py — converts any image inside admin/icon into app.ico
and updates the desktop shortcut (HJY Admin).

How to use:
  1) Put your image inside:  admin/icon/
     (supported formats: PNG, JPG, JPEG, WEBP, GIF, BMP)
  2) Run this file (or double-click make-icon.bat)
  3) The desktop shortcut icon is updated automatically.
"""
import os, sys, glob, subprocess
from PIL import Image

ADMIN_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ADMIN_DIR)
ICON_DIR = os.path.join(ADMIN_DIR, "icon")
EXTS = ("*.png", "*.jpg", "*.jpeg", "*.webp", "*.gif", "*.bmp")

def main():
    cands = []
    for e in EXTS:
        cands += glob.glob(os.path.join(ICON_DIR, e))
    cands = [c for c in cands if not c.lower().endswith(".ico")]
    if not cands:
        print("No image found inside admin/icon")
        print("Put your image (png/jpg/webp...) there, then run again.")
        sys.exit(1)

    src = cands[0]
    print("Source image:", os.path.basename(src))
    img = Image.open(src).convert("RGBA")

    # crop to a 1:1 square (center) so the icon is symmetric
    w, h = img.size
    s = min(w, h)
    img = img.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s))
    img = img.resize((256, 256), Image.LANCZOS)

    ico_path = os.path.join(ICON_DIR, "app.ico")
    img.save(ico_path, format="ICO", sizes=[
        (16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)
    ])
    print("Icon created:", ico_path)

    # update the desktop shortcuts (app-mode launchers: HJY Admin + HJY Store)
    subprocess.run(
        ["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass",
         "-File", os.path.join(ROOT, "create_shortcuts.ps1")],
        check=False,
    )
    print("Done")

if __name__ == "__main__":
    main()
