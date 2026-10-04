"""把近白色背景抠成透明 / Knock a near-white background out to transparency.

用法 / usage:  python scripts/remove_white_bg.py <输入图> <输出图>
对干净白底 + 高对比主体(如酱色鸡丁)效果好;不是通用抠图,边缘柔和处理避免白边。
Works well for a clean white background behind a high-contrast subject. Edges are feathered
to avoid white halos. Not a general-purpose matting tool.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage


def remove_white(src, dst, hi=236, lo=218):
    # hi: 比它亮的中性像素算背景;lo~hi 是柔边过渡带。背景很干净(如 Gemini 出图)时调高,避免吃掉白色泡沫/杯沿
    # hi: neutral pixels brighter than this are background; lo..hi is the soft-edge band.
    # Raise both for very clean backgrounds (e.g. Gemini output) so white foam / glass rims survive.
    im = Image.open(src).convert("RGBA")
    a = np.array(im).astype(np.int16)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    mx = np.maximum(np.maximum(r, g), b)
    mn = np.minimum(np.minimum(r, g), b)
    spread = mx - mn  # 低=接近灰/白(中性),高=有颜色 / low = neutral (white-ish), high = colored

    alpha = a[..., 3].astype(np.float32)

    # 纯白且中性 -> 全透明;只抠和图片边缘连通的白色,主体内部的白色高光(玻璃杯沿、泡沫)保留
    # pure white & neutral -> fully transparent; only white connected to the image border is
    # removed, so white highlights inside the subject (glass rims, foam) are kept
    white = (mn >= hi) & (spread <= 14)
    labels, _ = ndimage.label(white)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    bg = np.isin(labels, border[border > 0])
    alpha[bg] = 0

    # 边缘过渡带:紧贴背景、亮度介于 lo~hi 的中性像素按亮度渐变透明,做出柔边
    # edge band: neutral pixels between lo and hi right next to the background fade out for a soft edge
    near_bg = ndimage.binary_dilation(bg, iterations=3)
    edge = (~bg) & near_bg & (mn >= lo) & (spread <= 20)
    val = (hi - mn) / float(hi - lo) * 255.0  # mn=hi -> 0, mn=lo -> 255
    val = np.clip(val, 0, 255)
    alpha[edge] = np.minimum(alpha[edge], val[edge])

    a[..., 3] = np.clip(alpha, 0, 255)
    Image.fromarray(a.astype(np.uint8)).save(dst)

    cleared = int((a[..., 3] == 0).sum())
    total = a.shape[0] * a.shape[1]
    print(f"saved {dst}  ({cleared/total:.0%} of pixels made transparent)")


if __name__ == "__main__":
    remove_white(sys.argv[1], sys.argv[2])
