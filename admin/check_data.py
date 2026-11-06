#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
check_data.py - quick health check for the HJY project data.

Run:
    admin\\venv\\Scripts\\python.exe admin\\check_data.py
or double-click:
    admin\\check_data.bat

Checks (case-sensitive, like Cloudflare Pages / Linux):
  1. data-csv/files.txt  <->  data-csv/*.csv
  2. PHOTO values in product CSV files  <->  photo/ files
  3. data/about_files.txt  <->  about/*.txt
  4. data/qa_files.txt     <->  QA/*.txt
  5. PWA icons referenced by the manifests exist
  6. admin\\venv looks usable

Exit code 0 = all good, 1 = problems found.
No files are modified.
"""
import csv
import glob
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ADMIN_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(ADMIN_DIR)
DATA_CSV = os.path.join(ROOT, "data-csv")
PHOTO_DIR = os.path.join(ROOT, "photo")
IMAGE_EXTS = ("webp", "png", "jpg", "jpeg", "avif", "gif")

problems = []
warnings = []


def rel(path):
    return os.path.relpath(path, ROOT).replace("\\", "/")


def read_list(path):
    if not os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8-sig") as fh:
        return [line.strip() for line in fh if line.strip() and not line.strip().startswith("#")]


def actual_files(folder, ext, exclude=()):
    if not os.path.isdir(folder):
        return []
    exts = (ext,) if isinstance(ext, str) else tuple(ext)
    return sorted(
        name for name in os.listdir(folder)
        if os.path.isfile(os.path.join(folder, name))
        and name.lower().endswith(exts)
        and name not in exclude
    )


def check_manifest_list(label, manifest_path, folder, ext, exclude=()):
    listed = read_list(manifest_path)
    if listed is None:
        problems.append(f"{label}: missing file {rel(manifest_path)}")
        return
    present = actual_files(folder, ext, exclude)
    for name in listed:
        if name not in present:
            problems.append(f"{label}: listed but missing on disk -> {name}")
    for name in present:
        if name not in listed:
            warnings.append(f"{label}: exists but not listed -> {name}")


def check_image_manifest(label, manifest_path, folder):
    listed = read_list(manifest_path)
    if listed is None:
        problems.append(f"{label}: missing file {rel(manifest_path)}")
        return
    folder_rel = rel(folder).strip("/") + "/"
    normalized = []
    for name in listed:
        value = name.replace("\\", "/")
        if value.startswith(folder_rel):
            value = value[len(folder_rel):]
        normalized.append(value)
    present = actual_files(folder, IMAGE_EXTS)
    for name in normalized:
        if name not in present:
            problems.append(f"{label}: listed but missing on disk -> {name}")
    for name in present:
        if name not in normalized:
            warnings.append(f"{label}: exists but not listed -> {name}")


def photo_index():
    index = {}
    if not os.path.isdir(PHOTO_DIR):
        return index
    for dirpath, _, files in os.walk(PHOTO_DIR):
        for name in files:
            full = os.path.join(dirpath, name)
            index[rel(full).lower()] = rel(full)
    return index


def csv_delimiter(path):
    with open(path, "r", encoding="utf-8-sig", errors="replace") as fh:
        sample = fh.read(8192)
    return ";" if sample.count(";") >= sample.count(",") else ","


def check_photos():
    index = photo_index()
    checked = 0
    for path in sorted(glob.glob(os.path.join(DATA_CSV, "*.csv"))):
        try:
            delimiter = csv_delimiter(path)
            with open(path, "r", encoding="utf-8-sig", newline="") as fh:
                reader = csv.DictReader(fh, delimiter=delimiter)
                if not reader.fieldnames:
                    continue
                key = next((k for k in reader.fieldnames if k and k.strip().upper() == "PHOTO"), None)
                if not key:
                    continue
                for line_no, row in enumerate(reader, start=2):
                    raw = (row.get(key) or "").strip()
                    if not raw:
                        continue
                    for name in re.split(r"[,،]", raw):
                        name = name.strip()
                        if not name:
                            continue
                        checked += 1
                        if "/" in name or "\\" in name:
                            candidates = ["photo/" + name.replace("\\", "/").lstrip("./")]
                        elif os.path.splitext(name)[1]:
                            candidates = ["photo/" + name]
                        else:
                            candidates = [f"photo/{name}.{ext}" for ext in IMAGE_EXTS]
                        exact = next(
                            (c for c in candidates if os.path.isfile(os.path.join(ROOT, c.replace("/", os.sep)))),
                            None,
                        )
                        if exact:
                            continue
                        same_ignore_case = next((index[c.lower()] for c in candidates if c.lower() in index), None)
                        if same_ignore_case:
                            problems.append(
                                f"{os.path.basename(path)}:{line_no}: case mismatch -> {name} (disk: {same_ignore_case})"
                            )
                        else:
                            problems.append(f"{os.path.basename(path)}:{line_no}: photo missing -> {candidates[0]}")
        except Exception as exc:
            problems.append(f"{os.path.basename(path)}: could not read CSV ({exc})")
    return checked


def read_simple_list(path):
    if not os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8-sig") as fh:
        return [line.strip() for line in fh if line.strip() and not line.strip().startswith("#")]


def norm_gov(value):
    return str(value or "").strip().replace(" ", "").lstrip("ال")


def check_shipping():
    carriers_path = os.path.join(ROOT, "data", "carriers.csv")
    govs_path = os.path.join(ROOT, "data", "governorates.csv")
    branches_path = os.path.join(ROOT, "data", "branches.csv")
    carriers = read_simple_list(carriers_path)
    govs = read_simple_list(govs_path)
    if carriers is None:
        problems.append("shipping: missing data/carriers.csv")
        carriers = []
    if govs is None:
        problems.append("shipping: missing data/governorates.csv")
        govs = []
    if not os.path.isfile(branches_path):
        problems.append("shipping: missing data/branches.csv")
        return
    gov_map = {norm_gov(g): g for g in govs}
    carrier_set = set(carriers)
    seen = set()
    with open(branches_path, "r", encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh, delimiter=";")
        for line_no, row in enumerate(reader, start=2):
            company = str(row.get("company") or "").strip()
            gov = str(row.get("governorate") or "").strip()
            branch = str(row.get("branch") or "").strip()
            note = str(row.get("note") or "").strip()
            if not branch:
                problems.append(f"branches.csv:{line_no}: empty branch name")
                continue
            if company and company not in carrier_set:
                problems.append(f"branches.csv:{line_no}: company not in carriers.csv -> {company}")
            if gov:
                if gov not in govs:
                    proper = gov_map.get(norm_gov(gov))
                    if proper:
                        warnings.append(f"branches.csv:{line_no}: governorate spelling «{gov}» (expected «{proper}»)")
                    else:
                        problems.append(f"branches.csv:{line_no}: governorate not in governorates.csv -> {gov}")
            else:
                problems.append(f"branches.csv:{line_no}: empty governorate")
            key = (company, gov, branch)
            if key in seen:
                warnings.append(f"branches.csv:{line_no}: duplicate branch -> {company} / {gov} / {branch}")
            seen.add(key)
            if note and len(note) > 160:
                warnings.append(f"branches.csv:{line_no}: branch note is long ({len(note)} chars)")


def check_manifest_icons(manifest_path):
    if not os.path.isfile(manifest_path):
        problems.append(f"manifest missing: {rel(manifest_path)}")
        return
    base = os.path.dirname(manifest_path)
    try:
        with open(manifest_path, "r", encoding="utf-8-sig") as fh:
            data = json.load(fh)
    except Exception as exc:
        problems.append(f"manifest invalid JSON: {rel(manifest_path)} ({exc})")
        return
    for icon in data.get("icons") or []:
        src = str(icon.get("src") or "").strip()
        if not src:
            continue
        target = os.path.normpath(os.path.join(base, src))
        if not os.path.isfile(target):
            problems.append(f"manifest icon missing -> {rel(target)}")


def main():
    check_manifest_list("data-csv/files.txt", os.path.join(DATA_CSV, "files.txt"), DATA_CSV, ".csv", exclude=("files.txt",))
    check_image_manifest("photo/files.txt", os.path.join(ROOT, "photo", "files.txt"), os.path.join(ROOT, "photo"))
    check_image_manifest(
        "customer_photo/files.txt",
        os.path.join(ROOT, "customer_photo", "files.txt"),
        os.path.join(ROOT, "customer_photo"),
    )

    checked = check_photos()
    print(f"PHOTO names checked: {checked}")

    check_manifest_list("data/about_files.txt", os.path.join(ROOT, "data", "about_files.txt"), os.path.join(ROOT, "about"), ".txt")
    check_manifest_list("data/qa_files.txt", os.path.join(ROOT, "data", "qa_files.txt"), os.path.join(ROOT, "QA"), ".txt")
    check_shipping()

    for manifest in (os.path.join(ROOT, "manifest.json"), os.path.join(ADMIN_DIR, "manifest.json")):
        check_manifest_icons(manifest)

    venv_py = os.path.join(ADMIN_DIR, "venv", "Scripts", "python.exe")
    if not os.path.isfile(venv_py):
        problems.append("admin/venv is missing -> run admin\\setup_env.bat")
    else:
        cfg = os.path.join(ADMIN_DIR, "venv", "pyvenv.cfg")
        if os.path.isfile(cfg):
            with open(cfg, "r", encoding="utf-8", errors="replace") as fh:
                text = fh.read()
            home = ""
            for line in text.splitlines():
                if line.lower().startswith("home"):
                    home = line.split("=", 1)[-1].strip()
                    break
            if home and not os.path.isdir(home):
                warnings.append(f"admin/venv points to a missing Python home -> rebuild: {home}")

    print()
    if warnings:
        print(f"WARNINGS ({len(warnings)}):")
        for item in warnings:
            print("  ! " + item)
        print()
    if problems:
        print(f"PROBLEMS ({len(problems)}):")
        for item in problems:
            print("  x " + item)
        print()
        print("Result: NEEDS ATTENTION")
        return 1
    print("Result: OK - all checked files are present and match.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
