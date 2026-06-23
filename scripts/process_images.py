#!/usr/bin/env python3
"""Convierte y optimiza imágenes subidas a raw-uploads/.

Recorre raw-uploads/normativa/ y raw-uploads/servicios/, redimensiona cada
imagen a un máximo de 800px en el lado mayor (preservando aspect ratio) y la
escribe como WebP calidad 85 en src/assets/img/<destino>/<slug>.webp, donde
<slug> es el nombre de archivo sin el prefijo de timestamp que añadió el
Worker (formato: <timestamp>-<slug>.<ext>).

Tras procesar con éxito, borra el archivo original de raw-uploads/.

Opciones:
  --transparent   Quita el fondo blanco (casi-blanco) de la imagen resultante,
                  preservando la transparencia al guardarla como WebP. Útil
                  para portadas de libros que se muestran sobre superficies
                  de cualquier color (modo claro/oscuro).
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

# Umbral para considerar un píxel como "blanco de fondo".
# Por encima de este valor en los 3 canales → se hace transparente.
WHITE_THRESHOLD = 245
# Distancia máxima al blanco puro permitida como "halo" (anti-aliasing).
# Un píxel que está dentro de este margen pero no supera WHITE_THRESHOLD se
# atenúa proporcionalmente para evitar bordes duros.
HALO_RANGE = 8  # 245..252 → se atenúa

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


def remove_white_bg(img: Image.Image) -> Image.Image:
    """Convierte el fondo blanco/casi-blanco en transparente (canal alfa).

    Implementa un threshold suave:
      - píxel con min(R,G,B) ≥ WHITE_THRESHOLD       → alfa = 0 (totalmente transparente)
      - píxel con min(R,G,B) en [WHITE_THRESHOLD-HALO_RANGE, WHITE_THRESHOLD)
                                                    → alfa decreciente (halo limpio)
      - resto                                        → alfa = 255
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            mn = min(r, g, b)
            if mn >= WHITE_THRESHOLD:
                pixels[x, y] = (r, g, b, 0)
            elif mn >= WHITE_THRESHOLD - HALO_RANGE:
                # Atenuación lineal: a 245 → 255, a 252 → 0
                alpha = int(255 * (mn - (WHITE_THRESHOLD - HALO_RANGE)) / HALO_RANGE)
                pixels[x, y] = (r, g, b, alpha)
    return img


def process_one(src: Path, dest: Path, transparent: bool = False) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as img:
        img.load()
        # Para poder quitar el fondo necesitamos RGBA
        if transparent:
            if img.mode != "RGBA":
                img = img.convert("RGBA")
            img = remove_white_bg(img)
        else:
            # Preservar transparencia si ya existe; si no, RGB
            if img.mode in ("P", "LA"):
                img = img.convert("RGBA")
            elif img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

        w, h = img.size
        scale = min(1.0, MAX_SIDE / float(max(w, h)))
        if scale < 1.0:
            new_size = (max(1, int(round(w * scale))), max(1, int(round(h * scale))))
            img = img.resize(new_size, Image.LANCZOS)

        # WebP soporta RGBA → con alfa se conserva la transparencia
        save_kwargs = {"format": "WEBP", "quality": WEBP_QUALITY, "method": 6}
        if img.mode == "RGBA":
            save_kwargs["lossless"] = False  # sí permite alfa con calidad
        img.save(dest, **save_kwargs)

def process_destino(destino: str, transparent: bool = False) -> tuple[int, list[Path]]:
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
        suffix = " (fondo blanco → transparente)" if transparent else ""
        print(f"  [proc] {entry.name} → {dest.relative_to(REPO_ROOT)}{suffix}")

        try:
            process_one(entry, dest, transparent=transparent)
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
    args = sys.argv[1:]
    transparent = "--transparent" in args

    if not RAW_DIR.exists():
        print("[done] Directorio raw-uploads/ no existe. Nada que procesar.")
        return 0

    if transparent:
        print("[modo] Quitar fondo blanco (canal alfa) activado.")

    total = 0
    all_failed: list[Path] = []

    for destino in DESTINOS:
        print(f"[destino] {destino}")
        n, failed = process_destino(destino, transparent=transparent)
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