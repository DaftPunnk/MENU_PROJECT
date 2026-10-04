"""白底插画 -> 菜单成菜图 / White-background illustration -> menu hero image.

用法 / usage:  python scripts/make_hero.py <输入图> <输出 .webp> [背景阈值 hi,默认 248 / background threshold, default 248]
抠白底(remove_white_bg) -> 去掉零星小斑点(比如角落水印) -> 裁掉透明边 -> 缩到高 890px -> 存 webp。
Knocks out the white background, drops stray specks (e.g. a corner watermark), trims the
transparent margin, scales to 890px tall and saves as webp.
"""
import os
import sys
import tempfile

import numpy as np
from PIL import Image
from scipy import ndimage

from remove_white_bg import remove_white

HEIGHT = 890  # 和现有成菜图一致 / matches the existing hero images


def level_paper(src, out):
    """米色纸纹背景 -> 拉回纯白:按四周边缘的纸色逐通道提亮 / scale each channel so the paper
    colour (taken from the image border) becomes pure white — handles cream / textured backgrounds."""
    a = np.array(Image.open(src).convert("RGB")).astype(np.float32)
    rim = np.concatenate([a[:15].reshape(-1, 3), a[-15:].reshape(-1, 3),
                          a[:, :15].reshape(-1, 3), a[:, -15:].reshape(-1, 3)])
    paper = np.percentile(rim, 25, axis=0)  # 偏暗一点的纸色,纸纹也能一起变白 / darker-side paper tone so texture whitens too
    Image.fromarray(np.clip(a * (255.0 / paper), 0, 255).astype(np.uint8)).save(out)


def make_hero(src, dst, hi=248):
    tmp = os.path.join(tempfile.gettempdir(), "make_hero_cut.png")
    leveled = os.path.join(tempfile.gettempdir(), "make_hero_level.png")
    level_paper(src, leveled)
    remove_white(leveled, tmp, hi=hi, lo=hi - 12)
    a = np.array(Image.open(tmp))

    # 只留大块主体,小于最大块 2% 的孤立斑点清掉 / keep the main subject, drop islands < 2% of the largest
    labels, n = ndimage.label(a[..., 3] > 8)
    if n > 1:
        sizes = ndimage.sum(np.ones_like(labels), labels, range(1, n + 1))
        keep = np.isin(labels, 1 + np.flatnonzero(sizes >= sizes.max() * 0.02))
        a[~keep, 3] = 0

    im = Image.fromarray(a)
    im = im.crop(Image.fromarray(a[..., 3]).point(lambda v: 255 if v > 8 else 0).getbbox())
    w, h = im.size
    im = im.resize((round(w * HEIGHT / h), HEIGHT), Image.LANCZOS)
    im.save(dst, quality=82)
    print(f"saved {dst}  {im.size[0]}x{im.size[1]}")


if __name__ == "__main__":
    make_hero(sys.argv[1], sys.argv[2], *(int(v) for v in sys.argv[3:4]))
