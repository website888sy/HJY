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

ROOT = os.path.dirname(os.path.abspath(__file__))
ICON_DIR = os.path.join(ROOT, "admin", "icon")
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

    # update the desktop shortcut (create it if missing)
    ps = r"""
$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$lnk = Join-Path $desktop 'HJY Admin.lnk'
$sc = $ws.CreateShortcut($lnk)
$sc.TargetPath = '{bat}'
$sc.WorkingDirectory = '{root}'
$sc.IconLocation = '{ico}'
$sc.Description = 'HJY Admin - local admin panel launcher'
$sc.Save()
Write-Output 'Desktop shortcut updated'
""".format(bat=os.path.join(ROOT, "start_admin.bat"),
           root=ROOT,
           ico=ico_path)
    subprocess.run(["powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps], check=False)
    print("Done")

if __name__ == "__main__":
    main()
