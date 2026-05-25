"""
Mercately Changelog — Servidor local con API REST completa
Los datos se persisten en changelog.json

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ENDPOINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GET    /api/changelog              → todos los releases
         ?tag=new|improvement|...   → filtra por tag
         ?q=texto                   → búsqueda libre
         ?featured=true             → solo destacados

  GET    /api/changelog/tags        → tags disponibles
  GET    /api/changelog/:id         → un release por ID

  POST   /api/changelog             → crear nueva entrada
  PUT    /api/changelog/:id         → reemplazar entrada completa
  PATCH  /api/changelog/:id         → actualizar campos parciales
  DELETE /api/changelog/:id         → eliminar entrada

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CAMPOS REQUERIDOS en POST/PUT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  id, version, date, dateISO, tags[], title, lede,
  author { name, initials }

  Campos opcionales: featured, media, points[], readTime, month

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  USO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  python server.py          → puerto 3000
  python server.py 8080     → puerto personalizado
"""

import json
import sys
import os
import re
from http.server import SimpleHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs

DATA_FILE  = os.path.join(os.path.dirname(os.path.abspath(__file__)), "changelog.json")
VALID_TAGS = {"new", "improvement", "fix", "api", "mobile"}
REQUIRED   = {"id", "version", "date", "dateISO", "tags", "title", "lede", "author"}

TAG_LABELS = {
    "new":         "Nuevo",
    "improvement": "Mejora",
    "fix":         "Corrección",
    "api":         "API",
    "mobile":      "Móvil",
}

# ── Persistencia ─────────────────────────────────────────────────────────────
def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(entries):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)

# ── Validación ────────────────────────────────────────────────────────────────
def validate(body, partial=False):
    """Devuelve lista de errores. Si partial=True (PATCH) no exige campos."""
    errors = []
    if not partial:
        missing = REQUIRED - set(body.keys())
        if missing:
            errors.append(f"Campos requeridos faltantes: {', '.join(sorted(missing))}")

    if "tags" in body:
        if not isinstance(body["tags"], list) or len(body["tags"]) == 0:
            errors.append("'tags' debe ser una lista no vacía")
        else:
            bad = [t for t in body["tags"] if t not in VALID_TAGS]
            if bad:
                errors.append(f"Tags inválidos: {bad}. Válidos: {list(VALID_TAGS)}")

    if "dateISO" in body:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(body.get("dateISO", ""))):
            errors.append("'dateISO' debe tener formato YYYY-MM-DD")

    if "author" in body:
        a = body["author"]
        if not isinstance(a, dict) or "name" not in a or "initials" not in a:
            errors.append("'author' debe tener { name, initials }")

    return errors

# ── Handler ───────────────────────────────────────────────────────────────────
class ChangelogHandler(SimpleHTTPRequestHandler):

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin",  "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    # ── GET ──────────────────────────────────────────────────────────────────
    def do_GET(self):
        parsed = urlparse(self.path)
        path   = parsed.path.rstrip("/")
        params = parse_qs(parsed.query)

        if path == "/api/changelog/tags":
            self._json({"tags": [{"id": k, "label": v} for k, v in TAG_LABELS.items()]})
            return

        if path.startswith("/api/changelog/"):
            entry_id = path.split("/api/changelog/", 1)[-1]
            entry = next((e for e in load_data() if e["id"] == entry_id), None)
            if entry:
                self._json(entry)
            else:
                self._error(404, f"No existe ninguna entrada con id '{entry_id}'")
            return

        if path == "/api/changelog":
            entries = load_data()

            tag = params.get("tag", [None])[0]
            if tag and tag != "all":
                entries = [e for e in entries if tag in e.get("tags", [])]

            q = params.get("q", [None])[0]
            if q:
                ql = q.lower()
                entries = [
                    e for e in entries
                    if ql in e.get("title", "").lower()
                    or ql in e.get("lede",  "").lower()
                    or ql in e.get("version", "").lower()
                    or any(ql in (p.get("b","") + " " + p.get("t","")).lower()
                           for p in e.get("points", []))
                ]

            featured = params.get("featured", [None])[0]
            if featured == "true":
                entries = [e for e in entries if e.get("featured")]

            self._json({"total": len(entries), "entries": entries})
            return

        if path.startswith("/api/"):
            self._error(404, "Endpoint no encontrado")
            return

        # Raíz → changelog
        if path == "" or path == "/":
            self.send_response(302)
            self.send_header("Location", "/mercately-changelog.html")
            self.end_headers()
            return

        super().do_GET()

    # ── POST — crear entrada ─────────────────────────────────────────────────
    def do_POST(self):
        path = urlparse(self.path).path.rstrip("/")
        if path != "/api/changelog":
            self._error(404, "Endpoint no encontrado")
            return

        body = self._read_body()
        if body is None:
            return

        errors = validate(body)
        if errors:
            self._error(400, f"Datos inválidos: {'; '.join(errors)}")
            return

        entries = load_data()
        if any(e["id"] == body["id"] for e in entries):
            self._error(409, f"Ya existe una entrada con id '{body['id']}'. Usa PUT para actualizar.")
            return

        # Insertar ordenado por fecha (más reciente primero)
        entries.append(body)
        entries.sort(key=lambda e: e.get("dateISO", ""), reverse=True)
        save_data(entries)

        print(f"  POST /api/changelog → creado '{body['id']}'")
        self._json(body, status=201)

    # ── PUT — reemplazar entrada completa ────────────────────────────────────
    def do_PUT(self):
        path = urlparse(self.path).path.rstrip("/")
        if not path.startswith("/api/changelog/"):
            self._error(404, "Endpoint no encontrado")
            return

        entry_id = path.split("/api/changelog/", 1)[-1]
        body = self._read_body()
        if body is None:
            return

        body["id"] = entry_id  # el ID lo manda la URL, no el body
        errors = validate(body)
        if errors:
            self._error(400, f"Datos inválidos: {'; '.join(errors)}")
            return

        entries = load_data()
        idx = next((i for i, e in enumerate(entries) if e["id"] == entry_id), None)
        if idx is None:
            self._error(404, f"No existe ninguna entrada con id '{entry_id}'")
            return

        entries[idx] = body
        entries.sort(key=lambda e: e.get("dateISO", ""), reverse=True)
        save_data(entries)

        print(f"  PUT /api/changelog/{entry_id} → reemplazado")
        self._json(body)

    # ── PATCH — actualizar campos parciales ──────────────────────────────────
    def do_PATCH(self):
        path = urlparse(self.path).path.rstrip("/")
        if not path.startswith("/api/changelog/"):
            self._error(404, "Endpoint no encontrado")
            return

        entry_id = path.split("/api/changelog/", 1)[-1]
        body = self._read_body()
        if body is None:
            return

        errors = validate(body, partial=True)
        if errors:
            self._error(400, f"Datos inválidos: {'; '.join(errors)}")
            return

        entries = load_data()
        idx = next((i for i, e in enumerate(entries) if e["id"] == entry_id), None)
        if idx is None:
            self._error(404, f"No existe ninguna entrada con id '{entry_id}'")
            return

        entries[idx].update(body)
        entries.sort(key=lambda e: e.get("dateISO", ""), reverse=True)
        save_data(entries)

        print(f"  PATCH /api/changelog/{entry_id} → actualizado")
        self._json(entries[idx])

    # ── DELETE ───────────────────────────────────────────────────────────────
    def do_DELETE(self):
        path = urlparse(self.path).path.rstrip("/")
        if not path.startswith("/api/changelog/"):
            self._error(404, "Endpoint no encontrado")
            return

        entry_id = path.split("/api/changelog/", 1)[-1]
        entries = load_data()
        new_entries = [e for e in entries if e["id"] != entry_id]

        if len(new_entries) == len(entries):
            self._error(404, f"No existe ninguna entrada con id '{entry_id}'")
            return

        save_data(new_entries)
        print(f"  DELETE /api/changelog/{entry_id} → eliminado")
        self._json({"deleted": entry_id})

    # ── Helpers ───────────────────────────────────────────────────────────────
    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            self._error(400, "Body vacío — envía JSON con Content-Type: application/json")
            return None
        try:
            return json.loads(self.rfile.read(length).decode("utf-8"))
        except json.JSONDecodeError as e:
            self._error(400, f"JSON inválido: {e}")
            return None

    def _json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False, indent=2).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _error(self, status, message):
        self._json({"error": message, "status": status}, status=status)

    def log_message(self, fmt, *args):
        if args and "/api/" in str(args[0]):
            print(f"  API → {args[0]} {args[1] if len(args) > 1 else ''}")
        elif not any(ext in str(args[0] if args else "") for ext in [".jsx", ".css", ".png", ".ico", ".json"]):
            print(f"  {args[0] if args else ''} {args[1] if len(args) > 1 else ''}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = HTTPServer(("", port), ChangelogHandler)
    print(f"""
╔══════════════════════════════════════════════════════════╗
║       Mercately Changelog API — puerto {port}              ║
╠══════════════════════════════════════════════════════════╣
║  Changelog:  http://localhost:{port}/                       ║
╠══════════════════════════════════════════════════════════╣
║  GET    /api/changelog              todos los releases   ║
║  GET    /api/changelog?tag=new      filtrar por tag      ║
║  GET    /api/changelog?q=texto      búsqueda libre       ║
║  GET    /api/changelog/:id          un release           ║
║  GET    /api/changelog/tags         tags disponibles     ║
║  POST   /api/changelog              crear entrada        ║
║  PUT    /api/changelog/:id          reemplazar entrada   ║
║  PATCH  /api/changelog/:id          actualizar parcial   ║
║  DELETE /api/changelog/:id          eliminar entrada     ║
╠══════════════════════════════════════════════════════════╣
║  Datos persistidos en: changelog.json                    ║
╚══════════════════════════════════════════════════════════╝
Ctrl+C para detener.
""")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido.")
