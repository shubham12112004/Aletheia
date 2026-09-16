"""Generate Alethia favicon assets with transparent padding around the logo."""

from __future__ import annotations

import io
import struct
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
SOURCE = PUBLIC / "alethia-logo-source.png"
PADDING_RATIO = 0.175  # 17.5% transparent padding on each side


def extract_logo(source: Image.Image) -> Image.Image:
    rgba = source.convert("RGBA")
    alpha = np.array(rgba)[:, :, 3]
    ys, xs = np.where(alpha > 128)
    left, top, right, bottom = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    return rgba.crop((left, top, right, bottom))


def render_icon(logo: Image.Image, size: int) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    content_size = max(1, round(size * (1 - 2 * PADDING_RATIO)))

    logo_w, logo_h = logo.size
    scale = min(content_size / logo_w, content_size / logo_h)
    target_w = max(1, round(logo_w * scale))
    target_h = max(1, round(logo_h * scale))

    resized = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)
    offset = ((size - target_w) // 2, (size - target_h) // 2)
    canvas.paste(resized, offset, resized)
    return canvas


def write_multi_size_ico(path: Path, images: list[Image.Image]) -> None:
    """Write a multi-resolution ICO with embedded PNG frames."""
    png_buffers: list[bytes] = []
    for image in images:
        buffer = io.BytesIO()
        image.save(buffer, format="PNG", optimize=True)
        png_buffers.append(buffer.getvalue())

    count = len(png_buffers)
    header = struct.pack("<HHH", 0, 1, count)
    entries = bytearray()
    image_data = bytearray()
    offset = 6 + (16 * count)

    for image, png_bytes in zip(images, png_buffers):
        width, height = image.size
        stored_width = 0 if width >= 256 else width
        stored_height = 0 if height >= 256 else height
        entries.extend(
            struct.pack(
                "<BBBBHHII",
                stored_width,
                stored_height,
                0,
                0,
                1,
                32,
                len(png_bytes),
                offset,
            )
        )
        image_data.extend(png_bytes)
        offset += len(png_bytes)

    path.write_bytes(header + bytes(entries) + bytes(image_data))


def main() -> None:
    source = Image.open(SOURCE)
    logo = extract_logo(source)

    png_sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
        "android-chrome-192x192.png": 192,
        "android-chrome-512x512.png": 512,
        "favicon.png": 512,
    }

    ico_sizes = [16, 32, 48, 64]
    ico_images = []

    for filename, size in png_sizes.items():
        icon = render_icon(logo, size)
        icon.save(PUBLIC / filename, optimize=True)
        print(f"Wrote {filename} ({size}x{size})")

    for size in ico_sizes:
        ico_images.append(render_icon(logo, size))

    write_multi_size_ico(PUBLIC / "favicon.ico", ico_images)
    print(f"Wrote favicon.ico ({', '.join(str(s) for s in ico_sizes)})")


if __name__ == "__main__":
    main()
