"""把近白色背景抠成透明 / Knock a near-white background out to transparency.

用法 / usage:  python scripts/remove_white_bg.py <输入图> <输出图>
对干净白底 + 高对比主体(如酱色鸡丁)效果好;不是通用抠图,边缘柔和处理避免白边。
Works well for a clean white background behind a high-contrast subject. Edges are feathered
to avoid white halos. Not a general-purpose matting tool.
"""
import sys
import numpy as np
from PIL import Image


def remove_white(src, dst):
    im = Image.open(src).convert("RGBA")
    a = np.array(im).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    spread = mx - mn  # 低=接近灰/白(中性),高=有颜色 / low = neutral (white-ish), high = colored

    alpha = a[..., 3].astype(np.float32)

    # 纯白且中性 -> 全透明 / pure white & neutral -> fully transparent
    bg = (mn >= 236) & (spread <= 14)
    alpha[bg] = 0

    # 边缘过渡带:介于 218~236 的中性像素按亮度渐变透明,做出柔边
    # edge band: neutral pixels between 218–236 fade out for a soft edge
    edge = (~bg) & (mn >= 218) & (spread <= 20)
    val = (236.0 - mn) / (236.0 - 218.0) * 255.0  # mn=236 -> 0, mn=218 -> 255
    val = np.clip(val, 0, 255)
    alpha[edge] = np.minimum(alpha[edge], val[edge])

    a[..., 3] = np.clip(alpha, 0, 255)
    Image.fromarray(a.astype(np.uint8)).save(dst)

    cleared = int((a[..., 3] == 0).sum())
    total = a.shape[0] * a.shape[1]
    print(f"saved {dst}  ({cleared/total:.0%} of pixels made transparent)")


if __name__ == "__main__":
    remove_white(sys.argv[1], sys.argv[2])
