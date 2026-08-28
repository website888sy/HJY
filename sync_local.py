#!/usr/bin/env python3
"""
HJY local server + auto local-sync.
Run:  python sync_local.py
Then open:  http://localhost:8333/admin/index.html
Every publish in the admin writes changes to THIS folder automatically (CSV + photos).
"""
import json, base64, os, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, unquote

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8333

def resolve(path):
    parts = [p for p in path.split("/") if p and p not in (".", "..")]
    local = os.path.join(ROOT, *parts)
    real = os.path.realpath(local)
    if not (real == os.path.realpath(ROOT) or real.startswith(os.path.realpath(ROOT) + os.sep)):
        return None
    return local

class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
    def _json(self, code, obj):
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/ping":
            return self._json(200, {"ok": True, "root": ROOT})
        # serve files (so the admin can be opened from here)
        rel = unquote(parsed.path).lstrip("/")
        if not rel:
            rel = "index.html"
        local = resolve(rel)
        if not local or not os.path.isfile(local):
            return self._json(404, {"ok": False, "error": "not found"})
        data = open(local, "rb").read()
        ctype = "application/octet-stream"
        if local.endswith(".html"): ctype = "text/html; charset=utf-8"
        elif local.endswith(".js"): ctype = "application/javascript; charset=utf-8"
        elif local.endswith(".css"): ctype = "text/css; charset=utf-8"
        elif local.endswith(".json"): ctype = "application/json; charset=utf-8"
        elif local.endswith((".png", ".webp", ".jpg", ".jpeg", ".gif", ".ico")): ctype = "image/" + local.rsplit(".", 1)[-1]
        elif local.endswith(".csv"): ctype = "text/csv; charset=utf-8"
        elif local.endswith(".txt"): ctype = "text/plain; charset=utf-8"
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)
    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}
        if parsed.path == "/list":
            # list files inside a folder (e.g. data-csv) -> used by the admin
            folder = str(payload.get("dir", "")).strip("/")
            out = []
            base = os.path.join(ROOT, *[p for p in folder.split("/") if p])
            if os.path.isdir(base) and os.path.realpath(base).startswith(os.path.realpath(ROOT) + os.sep):
                for fn in sorted(os.listdir(base)):
                    lp = os.path.join(base, fn)
                    if os.path.isfile(lp):
                        out.append(fn)
            return self._json(200, {"ok": True, "dir": folder, "files": out})
        if parsed.path == "/write":
            written, failed = 0, 0
            for f in payload.get("files", []):
                p = resolve(str(f.get("path", "")))
                if not p:
                    failed += 1; continue
                try:
                    os.makedirs(os.path.dirname(p), exist_ok=True)
                    if f.get("base64"):
                        data = base64.b64decode(f["base64"])
                        with open(p, "wb") as fh:
                            fh.write(data)
                    else:
                        with open(p, "w", encoding="utf-8", newline="") as fh:
                            fh.write(str(f.get("content", "")))
                    written += 1
                except Exception:
                    failed += 1
            return self._json(200, {"ok": True, "written": written, "failed": failed})
        if parsed.path == "/exists":
            result = {}
            for p in payload.get("paths", []):
                lp = resolve(str(p))
                result[str(p)] = bool(lp and os.path.isfile(lp))
            return self._json(200, {"ok": True, "exists": result})
        if parsed.path == "/delete":
            deleted = 0
            for p in payload.get("paths", []):
                lp = resolve(str(p))
                if lp and os.path.exists(lp) and os.path.isfile(lp):
                    try:
                        os.remove(lp); deleted += 1
                    except Exception:
                        pass
            return self._json(200, {"ok": True, "deleted": deleted})
        return self._json(404, {"ok": False})

if __name__ == "__main__":
    print("=" * 56)
    print("HJY local server + auto local-sync")
    print("Root folder:", ROOT)
    print("Open admin at:  http://localhost:%d/admin/index.html" % PORT)
    print("Press Ctrl+C to stop.")
    print("=" * 56)
    try:
        ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
