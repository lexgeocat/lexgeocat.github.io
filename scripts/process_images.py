#!/usr/bin/env python3
"""Convierte y optimiza imágenes subidas a raw-uploads/.

Recorre raw-uploads/normativa/ y raw-uploads/servicios/, redimensiona cada
imagen a un máximo de 800px en el lado mayor (preservando aspect ratio) y la
escribe como WebP calidad 85 en src/assets/img/<destino>/<slug>.webp, donde
<slug> es el nombre de archivo sin el prefijo de timestamp que añadió el
Worker (formato: <timestamp>-<slug>.<ext>).

Tras procesar con éxito, borra el archivo original de raw-uploads/.
"""

from __future__ import annotations

import os
import re
import sys
from pathlib import Path

from PIL import Image

MAX_SIDE = 800
WEBP_QUALITY = 85
# El Worker genera: <timestamp>-<safeName>.<ext>
TIMESTAMP_PREFIX = re.compile(r"^\d+-(?P<slug>.+)$")

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "raw-uploads"
DEST_ROOT = REPO_ROOT / "src" / "assets" / "img"
DESTINOS = ("normativa", "servicios")

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass


def slug_from_filename(name: str) -> str | None:
    """
    Quita prefijo timestamp y extensión.
    1782011606159-p.jpeg  →  p
    """
    stem = name.rsplit(".", 1)[0] if "." in name else name
    m = TIMESTAMP_PREFIX.match(stem)
    if not m:
        return None
    return m.group("slug")


def process_one(src: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as img:
        img.load()
        # Preservar transparencia en WebP
        if img.mode in ("P", "LA"):
            img = img.convert("RGBA")
        elif img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        w, h = img.size
        scale = min(1.0, MAX_SIDE / float(max(w, h)))
        if scale < 1.0:
            new_size = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
            img = img.resize(new_size, Image.LANCZOS)

        img.save(dest, format="WEBP", quality=WEBP_QUALITY, method=6)

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
            print(
                f"  [skip] {entry.name} — no tiene prefijo de timestamp esperado "
                f"(<timestamp>-<slug>.<ext>). Se ignora sin borrar."
            )
            continue

        dest = dest_dir / f"{slug}.webp"
        print(f"  [proc] {entry.name} → {dest.relative_to(REPO_ROOT)}")

        try:
            process_one(entry, dest)
        except Exception as exc:
            print(f"  [error] {entry.name}: {exc}", file=sys.stderr)
            failed.append(entry)
            continue

        try:
            os.remove(entry)
        except OSError as exc:
            print(f"  [warn] no se pudo borrar {entry.name}: {exc}", file=sys.stderr)

        processed += 1

    return processed, failed


def main() -> int:
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
            f"[warn] {len(all_failed)} archivo(s) con error — no se borraron:",
            file=sys.stderr,
        )
        for f in all_failed:
            print(f"  - {f.name}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())