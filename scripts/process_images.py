#!/usr/bin/env python3
"""Convierte y optimiza imágenes subidas a raw-uploads/.

Recorre raw-uploads/normativa/ y raw-uploads/servicios/, valida tamaño y modo,
redimensiona cada imagen a un máximo de 800px en el lado mayor (preservando
aspect ratio) y la escribe como WebP calidad 85 en
src/assets/img/<destino>/<slug>.webp.
"""

from __future__ import annotations

import os
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image

MAX_SIDE = 800
WEBP_QUALITY = 85

# El Worker genera: <timestamp>-<safeName>.<ext>
TIMESTAMP_PREFIX = re.compile(r"^\d+-(?P<slug>.+)$")

# Tamaño máximo permitido para imágenes raw (defensa contra OOM en CI).
# El frontend (imageUpload.ts) y el Worker validan 8 MB antes de llegar
# al repo, pero por si un archivo mayor se cuela (subida directa, bypass
# del Worker), Python aplica un límite más alto (25 MB) antes de abrirlo
# con Pillow para evitar Out-of-Memory en el runner de CI.
MAX_RAW_BYTES = 25 * 1024 * 1024  # 25 MB

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "raw-uploads"
DEST_ROOT = REPO_ROOT / "src" / "assets" / "img"
PROCESSED_DIR = RAW_DIR / "_processed"
DESTINOS = ("normativa", "servicios")


def setup_stdout() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass


def slug_from_filename(name: str) -> str | None:
    """
    Quita prefijo timestamp y extensión, luego sanea el slug resultante.
    1782011606159-p.jpeg                → p
    1782011606159-Mi Imagen (1).jpg     → mi-imagen-1
    """
    stem = name.rsplit(".", 1)[0] if "." in name else name
    m = TIMESTAMP_PREFIX.match(stem)
    if not m:
        return None
    return slugify(m.group("slug"))


def slugify(text: str) -> str:
    """Normaliza el slug preservando compatibilidad con filenames del Worker.

    El Worker genera nombres como `chatgpt-image-22-jun-2026-09_30_57-p-m`
    que se almacenan también en BD (columna `imagen_url`). Si cambiáramos
    `_` por `-`, el slug en disco dejaría de coincidir con el filename en
    BD y `normativaImage.ts` no podría resolverlo.

    Reglas:
      - diacríticos → ASCII (`NFD` + filtro `Mn`)
      - cualquier cosa fuera de [a-zA-Z0-9._-] → guion
      - minúsculas
      - colapsa múltiples guiones
    """
    normalized = unicodedata.normalize("NFD", text)
    stripped = "".join(c for c in normalized if unicodedata.category(c) != "Mn")
    # Preservamos [a-z0-9._-]; el resto (espacios, paréntesis, símbolos) → guion.
    # Importante: NO reemplazar `_` para mantener compat con el filename del Worker.
    kebab = re.sub(r"[^a-z0-9._-]+", "-", stripped.lower())
    kebab = re.sub(r"-+", "-", kebab).strip("-")
    return kebab or "imagen"


def process_one(src: Path, dest: Path) -> tuple[Path, int]:
    """Abre, transforma y guarda la imagen. Devuelve (ruta_final, bytes_escritos)."""
    # CMYK → RGB antes de cualquier operación (WebP no soporta CMYK).
    # Importante: copiar el buffer a una imagen nueva (no usar `with Image.open`
    # + load()) porque el LazyImage resultante es de solo lectura y resize/save
    # fallan con "assignment destination is read-only".
    raw = Image.open(src)
    try:
        img = raw.copy()
    finally:
        raw.close()

    if img.mode == "CMYK":
        img = img.convert("RGB")
    elif img.mode in ("P", "LA"):
        img = img.convert("RGBA")
    elif img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")

    # Redimensionado preservando aspect ratio
    w, h = img.size
    scale = min(1.0, MAX_SIDE / float(max(w, h)))
    if scale < 1.0:
        new_size = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
        img = img.resize(new_size, Image.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)

    # Pillow no añade EXIF al guardar WebP a menos que se pase explícitamente,
    # así que basta con no copiarlo.
    save_kwargs: dict = {"format": "WEBP", "quality": WEBP_QUALITY, "method": 6}
    img.save(dest, **save_kwargs)

    return dest, dest.stat().st_size


def move_to_processed(src: Path) -> None:
    """Mueve el archivo raw a raw-uploads/_processed/<destino>/<nombre>."""
    destino = src.parent.name
    target_dir = PROCESSED_DIR / destino
    target_dir.mkdir(parents=True, exist_ok=True)
    target = target_dir / src.name
    # Si ya existe uno con el mismo nombre, añade sufijo -<n>.
    if target.exists():
        stem = target.stem
        suffix = target.suffix
        n = 1
        while True:
            cand = target_dir / f"{stem}-{n}{suffix}"
            if not cand.exists():
                target = cand
                break
            n += 1
    os.replace(src, target)


def move_failed_to_processed(entry: Path, reason: str) -> None:
    """Mueve un archivo fallido a `_processed/` para que no bloquee futuros runs."""
    print(f"  [skip] {entry.name} — {reason}")
    try:
        move_to_processed(entry)
    except OSError as exc:
        print(f"  [warn] no se pudo archivar {entry.name}: {exc}", file=sys.stderr)


def process_destino(destino: str) -> tuple[int, list[Path]]:
    src_dir = RAW_DIR / destino
    if not src_dir.exists():
        print(f"  [skip] carpeta raw-uploads/{destino}/ no existe, nada que procesar.")
        return 0, []

    processed = 0
    failed: list[Path] = []
    dest_dir = DEST_ROOT / destino

    entries = sorted(
        (e for e in src_dir.iterdir() if e.is_file() and not e.name.startswith(".")),
        key=lambda e: e.name,
    )

    if not entries:
        print(f"  [skip] raw-uploads/{destino}/ está vacío.")
        return 0, []

    for entry in entries:
        slug = slug_from_filename(entry.name)
        if not slug:
            move_failed_to_processed(
                entry,
                "no tiene prefijo de timestamp esperado "
                "(<timestamp>-<slug>.<ext>).",
            )
            failed.append(entry)
            continue

        # Validar tamaño ANTES de abrir para evitar OOM en CI.
        size = entry.stat().st_size
        if size > MAX_RAW_BYTES:
            move_failed_to_processed(
                entry,
                f"{size / 1024 / 1024:.1f} MB excede el límite de "
                f"{MAX_RAW_BYTES / 1024 / 1024:.0f} MB.",
            )
            failed.append(entry)
            continue

        dest = dest_dir / f"{slug}.webp"
        print(f"  [proc] {entry.name} → {dest.relative_to(REPO_ROOT)}")

        try:
            _, written = process_one(entry, dest)
            print(f"         → {written / 1024:.1f} KB WebP")
        except Exception as exc:
            move_failed_to_processed(entry, str(exc))
            failed.append(entry)
            continue

        # Mover (no borrar) a _processed/ para permitir auditoría y re-run.
        try:
            move_to_processed(entry)
        except OSError as exc:
            print(f"  [warn] no se pudo archivar {entry.name}: {exc}", file=sys.stderr)

        processed += 1

    return processed, failed


def main() -> int:
    setup_stdout()

    if not RAW_DIR.exists():
        print("[done] Directorio raw-uploads/ no existe. Nada que procesar.")
        return 0

    total = 0
    all_failed: list[Path] = []

    for destino in DESTINOS:
        print(f"[destino] {destino}")
        n, failed = process_destino(destino)
        total += n
        all_failed.extend(failed)

    print(f"[done] {total} imagen(es) procesada(s).")
    if all_failed:
        print(
            f"[warn] {len(all_failed)} archivo(s) no procesados (movidos a _processed/):",
            file=sys.stderr,
        )
        for f in all_failed:
            print(f"  - {f}", file=sys.stderr)
        # No retornar 1: los WebPs buenos ya se generaron y deben committearse.
        # Si salimos con exit code != 0, GitHub Actions corta el workflow y
        # los WebPs se pierden con el runner efímero.
        print("[info] Se reportan fallos pero no se bloquea el commit de los WebPs exitosos.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
