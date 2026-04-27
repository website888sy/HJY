from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SCAN_DIRS = ["about", "data", "home", "object", "photo", "root"]
OUTPUT_FILE = PROJECT_ROOT / "root" / "site-manifest.json"


def main() -> None:
    manifest = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "files": [],
    }

    for directory_name in SCAN_DIRS:
        directory = PROJECT_ROOT / directory_name
        if not directory.exists():
            continue

        for file_path in sorted(path for path in directory.rglob("*") if path.is_file()):
            if any(part.startswith(".") for part in file_path.parts):
                continue

            manifest["files"].append(
                {
                    "path": file_path.relative_to(PROJECT_ROOT).as_posix(),
                    "dir": directory_name,
                    "name": file_path.name,
                    "baseName": file_path.stem,
                    "extension": file_path.suffix.lower(),
                }
            )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Manifest written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
