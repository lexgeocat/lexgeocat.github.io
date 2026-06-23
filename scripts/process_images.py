#!/usr/bin/env python3
"""Convierte y optimiza imágenes subidas a raw-uploads/.

Recorre raw-uploads/normativa/ y raw-uploads/servicios/, valida tamaño y modo,
redimensiona cada imagen a un máximo de 800px en el lado mayor (preservando
aspect ratio) y la escribe como WebP calidad 85 en
src/assets/img/<destino>/<slug>.webp.

Opciones:
  --transparent   Quita el fondo blanco (casi-blanco) de la imagen resultante,
                  preservando la transparencia al guardarla como WebP. Útil
                  para portadas de libros que se muestran sobre superficies
                  de cualquier color (modo claro/oscuro).
"""

from __future__ import annotations

import argparse
import os
import re
import sys
import unicodedata
from pathlib import Path

from PIL import Image
import numpy as np

MAX_SIDE = 800
WEBP_QUALITY = 85

# El Worker genera: <timestamp>-<safeName>.<ext>
TIMESTAMP_PREFIX = re.compile(r"^\d+-(?P<slug>.+)$")

# Umbral para considerar un píxel como "blanco de fondo".
WHITE_THRESHOLD = 245
# Rango de halo: píxeles con min(R,G,B) en [WHITE_THRESHOLD-HALO_RANGE+1,
# WHITE_THRESHOLD-1] se atenúan linealmente para evitar bordes duros.
HALO_RANGE = 8

# Tamaño máximo permitido para imágenes raw (defensa contra OOM en CI).
MAX_RAW_BYTES = 25 * 1024 * 1024  # 25 MB

REPO_ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = REPO_ROOT / "raw-uploads"
DEST_ROOT = REPO_ROOT / "src" / "assets" / "img"
PROCESSED_DIR = RAW_DIR / "_processed"
DESTINOS = ("normativa", "servicios")


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Procesa imágenes de raw-uploads/.")
    p.add_argument(
        "--transparent",
        action="store_true",
        help="Quita el fondo blanco (casi-blanco) preservando la transparencia.",
    )
    return p.parse_args()


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


def remove_white_bg(img: Image.Image) -> Image.Image:
    """Quita el fondo blanco/casi-blanco con halo alfa vectorizado (NumPy).

    - min(R,G,B) ≥ WHITE_THRESHOLD            → alfa = 0 (transparente)
    - min(R,G,B) ∈ [WHITE_THRESHOLD-HALO_RANGE+1, WHITE_THRESHOLD-1]
                                              → alfa decreciente de 255 → 1
    - resto                                   → alfa = 255

    NOTA: np.asarray() sobre una Pillow.Image devuelve un buffer de solo
    lectura; copiamos con np.array(...) para obtener un array escribible.
    """
    if img.mode != "RGBA":
        img = img.convert("RGBA")

    arr = np.array(img, dtype=np.uint8)  # copia escribible
    r, g, b, _a = arr[..., 0], arr[..., 1], arr[..., 2], arr[..., 3]
    mn = np.minimum(np.minimum(r, g), b)

    alpha = np.full(mn.shape, 255, dtype=np.uint8)

    # Totalmente transparentes: píxeles blancos puros
    alpha[mn >= WHITE_THRESHOLD] = 0

    # Halo: píxeles "casi blancos" — atenuación lineal.
    halo_lo = WHITE_THRESHOLD - HALO_RANGE  # inclusivo: alpha = 255
    halo_hi = WHITE_THRESHOLD - 1           # inclusivo: alpha = 1
    halo_mask = (mn >= halo_lo) & (mn <= halo_hi)
    if halo_mask.any():
        # Mapear mn ∈ [halo_lo, halo_hi] → alpha ∈ [255, 1]
        norm = (mn[halo_mask].astype(np.int32) - halo_lo) / max(1, halo_hi - halo_lo)
        alpha[halo_mask] = (255 - 254 * norm).astype(np.uint8)

    arr[..., 3] = alpha
    return Image.fromarray(arr, mode="RGBA")


def process_one(src: Path, dest: Path, transparent: bool) -> tuple[Path, int]:
    """Abre, transforma y guarda la imagen. Devuelve (ruta_final, bytes_escritos)."""
    # G. CMYK → RGB antes de cualquier operación (WebP no soporta CMYK).
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

    if transparent:
        if img.mode != "RGBA":
            img = img.convert("RGBA")
        img = remove_white_bg(img)
    else:
        if img.mode in ("P", "LA"):
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

    # C. Quitar metadatos EXIF/GPS/ICC: Pillow no añade EXIF al guardar WebP
    # a menos que se pase explícitamente, así que basta con no copiarlo.
    save_kwargs: dict = {"format": "WEBP", "quality": WEBP_QUALITY, "method": 6}
    img.save(dest, **save_kwargs)

    return dest, dest.stat().st_size


def move_to_processed(src: Path) -> None:
    """E. Mueve el archivo raw a raw-uploads/_processed/<destino>/<nombre>."""
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


def process_destino(destino: str, transparent: bool) -> tuple[int, list[Path]]:
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
                f"(<timestamp>-<slug>.<ext>). Se mueve sin procesar."
            )
            failed.append(entry)
            continue

        # D. Validar tamaño ANTES de abrir para evitar OOM en CI.
        size = entry.stat().st_size
        if size > MAX_RAW_BYTES:
            print(
                f"  [skip] {entry.name} — {size / 1024 / 1024:.1f} MB excede el "
                f"límite de {MAX_RAW_BYTES / 1024 / 1024:.0f} MB. Se mueve sin procesar.",
                file=sys.stderr,
            )
            failed.append(entry)
            continue

        dest = dest_dir / f"{slug}.webp"
        suffix = " (fondo blanco → transparente)" if transparent else ""
        print(f"  [proc] {entry.name} → {dest.relative_to(REPO_ROOT)}{suffix}")

        try:
            _, written = process_one(entry, dest, transparent=transparent)
            print(f"         → {written / 1024:.1f} KB WebP")
        except Exception as exc:
            print(f"  [error] {entry.name}: {exc}", file=sys.stderr)
            failed.append(entry)
            continue

        # E. Mover (no borrar) a _processed/ para permitir auditoría y re-run.
        try:
            move_to_processed(entry)
        except OSError as exc:
            print(f"  [warn] no se pudo archivar {entry.name}: {exc}", file=sys.stderr)

        processed += 1

    return processed, failed


def main() -> int:
    args = parse_args()
    transparent = args.transparent
    setup_stdout()

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
            f"[warn] {len(all_failed)} archivo(s) no procesados (movidos a _processed/):",
            file=sys.stderr,
        )
        for f in all_failed:
            print(f"  - {f}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
