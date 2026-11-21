#!/usr/bin/env python3
"""
[P0-PERF-01] 靜態圖資瘦身與 WebP 批次轉檔腳本
- 移除 tarot 根目錄重複的 7 張大圖
- 依容器尺寸上限縮放並轉換/壓縮為 WebP
- 刪除舊 JPG/PNG 原檔，目標總體積 < 6 MB
"""
from pathlib import Path
from PIL import Image

IMAGES_ROOT = Path(__file__).resolve().parent.parent / "apps" / "web" / "public" / "images"

DUPLICATE_TAROT_FILES = [
    "tarot/the_fool.jpg",
    "tarot/magician.jpg",
    "tarot/the_high_priestess.jpg",
    "tarot/the_lovers.jpg",
    "tarot/wheel_of_fortune.jpg",
    "tarot/the_star.jpg",
    "tarot/the_sun.jpg",
]


def get_target_spec(rel_path: str) -> tuple[int, int]:
    """回傳 (max_width, webp_quality)"""
    if rel_path.startswith("tarot/cards/"):
        return (320, 68)
    if rel_path.startswith("tarot/"):
        return (420, 72)
    if rel_path.startswith("life-simulator/"):
        return (720, 72)
    # banners & scene illustrations (<= 1600px, 1200px 兼顧畫質與體積)
    return (1200, 74)


def main() -> None:
    if not IMAGES_ROOT.exists():
        raise SystemExit(f"Images root not found: {IMAGES_ROOT}")

    removed_dups = 0
    for rel in DUPLICATE_TAROT_FILES:
        target = IMAGES_ROOT / rel
        if target.exists():
            target.unlink()
            removed_dups += 1

    processed = 0
    for path in sorted(IMAGES_ROOT.rglob("*")):
        if not path.is_file():
            continue
        ext = path.suffix.lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue

        rel = path.relative_to(IMAGES_ROOT).as_posix()
        max_w, quality = get_target_spec(rel)
        webp_path = path.with_suffix(".webp")

        with Image.open(path) as im:
            im = im.convert("RGB")
            w, h = im.size
            if w > max_w:
                new_h = max(1, int(h * (max_w / w)))
                im = im.resize((max_w, new_h), Image.Resampling.LANCZOS)
            im.save(webp_path, format="WEBP", quality=quality, method=6)

        if ext != ".webp":
            path.unlink()
        processed += 1

    total_after = sum(p.stat().st_size for p in IMAGES_ROOT.rglob("*") if p.is_file())
    print(f"Removed duplicate tarot files: {removed_dups}")
    print(f"Optimized WebP files: {processed}")
    print(f"Total images dir size after optimization: {total_after / (1024 * 1024):.2f} MB")


if __name__ == "__main__":
    main()
