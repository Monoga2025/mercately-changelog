# CLAUDE.md — Mercately Changelog

Página pública de releases de Mercately. Single-page React (UMD por CDN) servida desde GitHub Pages.

- **Repo:** https://github.com/Monoga2025/mercately-changelog
- **URL pública:** https://monoga2025.github.io/mercately-changelog/mercately-changelog.html
- **Branch:** `main` (GitHub Pages sirve desde la raíz)
- **Carpeta local:** `C:/Users/danie/OneDrive/Desktop/AI_LAB/_activo/mercately/changelog/`

---

## Arquitectura

| Archivo | Rol |
|---|---|
| `mercately-changelog.html` | Entry point HTML. Carga React + Babel desde CDN y monta `<ChangelogApp/>`. |
| `changelog-app.jsx` | Componente principal: hero, toolbar (search + filtros), timeline zig-zag, overlay artículo, roadmap. Fetch a `changelog.json` con fallback `CHANGELOG_FALLBACK` inline. |
| `changelog-data.jsx` | (Legacy) Datos antes de la API. Mantener como referencia. |
| `changelog-styles.css` | Estilos self-contained. Tokens en `:root`. |
| `changelog.json` | Fuente de verdad de entradas. **Lo edita n8n vía GitHub API**, no a mano. |
| `n8n-changelog-publisher.json` | Workflow exportado de n8n: form → valida password → mergea entrada → PUT a GitHub Contents API. |
| `index.html` | Landing index (separada del visor de blog). |
| `server.py` | Dev server local con CORS abierto. |
| `Mercately_Changelog_API_Docs.pdf` | Doc API REST pública v3 (referencia comercial). |
| `secciones borradores/` | Bloques JSX desactivados pero guardados para re-activar. **No los borres.** |

---

## Flujo de publicación

1. Desarrollador abre la URL del formulario n8n (`Form Trigger`).
2. Mete password, versión, fecha, tipo, título, lede, puntos, autor.
3. n8n:
   - Valida password (`$env.DEV_PASSWORD`).
   - Hace `GET` a `changelog.json` en GitHub.
   - Prepend la nueva entrada al array.
   - `PUT` el archivo actualizado vía Contents API (con `sha` del GET para evitar conflicto).
4. GitHub Pages redeploya en ~1 min.

**Para borrar una entrada:** misma mecánica vía API (no hay UI todavía). Ejemplo manual:
```bash
# Ver historia: git log -p changelog.json
# O commit directo en la web de GitHub
```

---

## Subir screenshots (pendiente — sección desactivada hoy)

El campo `media: { kind, label }` existe en las entradas pero el render del placeholder está **desactivado** en `changelog-app.jsx` (línea ~397). Lo quitamos porque hoy solo muestra un placeholder sintético, no la imagen real.

### Cuando se quiera activar de verdad:

**Opción A — Imagen en el repo (más simple):**
1. Subir el PNG/JPG a `screenshots/v3-9-0.png` en el repo.
2. Extender el schema de la entrada: `media: { kind: "screenshot", src: "screenshots/v3-9-0.png", alt: "MIA · entrenamiento" }`.
3. En `MediaPlaceholder` cambiar el placeholder por `<img src={src} alt={alt} />`.
4. Reactivar la línea en `article-body`:
   ```jsx
   {e.media && <MediaPlaceholder kind={e.media.kind} label={e.media.label} src={e.media.src} />}
   ```
5. Añadir al formulario n8n un campo `fieldType: "file"` y un nodo para hacer `PUT` del binario a `screenshots/{slug}.png` vía Contents API (base64).

**Opción B — Imagen externa (S3 / Cloudinary):**
- El form n8n sube la imagen al bucket → guarda la URL pública en `media.src`.
- Más limpio porque el repo no engorda con binarios.
- Requiere credencial del bucket en n8n.

**Recomendación:** Opción A para empezar (cero infra extra). Migrar a B cuando haya >20 entradas con imagen.

---

## Cambios recientes

### 2026-05-27 (tarde) — Audit y fixes
- Añadido icono `search` (faltaba el `case` en el switch → la lupa del buscador renderizaba vacía).
- Quitado el botón "Ir al roadmap completo" (no existe `mercately.com/roadmap`, devolvía 404). Reactivar cuando exista la URL.

### 2026-05-27 — Limpieza visual
- Añadidas variables CSS `--brand-50/100/200/300/700`, `--bg-blue`, `--ink-700` (faltaban → línea del timeline no renderizaba).
- Toolbar de búsqueda+filtros pasó de `sticky` translúcido a `static` sólido.
- Botón "Ir al roadmap completo" en blanco sobre `--brand-500`.
- Hero: ocultado bloque "Recibe el changelog" (movido a `secciones borradores/cl-subscribe.jsx`). `grid-template-columns` pasa a `1fr`.
- Quitados botones de compartir (link / Twitter / LinkedIn) del `article-author-card`.
- Quitado render del placeholder de screenshot en el overlay del artículo (ver "Subir screenshots").

### 2026-05-25 — Revert y republicación
- Commit `6435ac8` revirtió por error la primera versión del changelog en el repo `mercately-walink-generator`. La página vive **solo** en `Monoga2025/mercately-changelog`.

---

## Comandos útiles

```bash
# Dev local
python -m http.server 8765
# → http://localhost:8765/mercately-changelog.html

# Ver entradas actuales
curl -s https://raw.githubusercontent.com/Monoga2025/mercately-changelog/main/changelog.json | jq '.[] | {version, date, title}'

# Historia del json
git log --oneline -- changelog.json
```

---

## Reglas

- **Nunca** editar `changelog.json` a mano si hay otra publicación concurrente — el `sha` se invalida.
- Cualquier sección que se "oculte" se mueve a `secciones borradores/` con un comentario de cómo reactivarla. No borrar JSX productivo.
- Las variables CSS nuevas se declaran en `:root` de `changelog-styles.css`, no inline.
- Mobile breakpoint único: 900px. La línea del timeline se mueve al margen izquierdo (24px).
