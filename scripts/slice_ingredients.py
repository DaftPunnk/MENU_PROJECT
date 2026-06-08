"""把一张"食材网格图"切成 11 张透明 PNG / Slice a grid sheet of ingredients into 11 transparent PNGs.

输入是一张 4列 × 3行 的网格图(最后一格留空),浅灰底。脚本会:
  1) 从四边自动探测背景色
  2) 按背景色抠成透明(带柔边)
  3) 切成 4×3 网格,对每格自动裁到内容边界
  4) 按"从左到右、从上到下"的顺序命名保存

The input is a 4-col × 3-row grid sheet (last cell empty) on a light grey background. It:
  1) auto-detects the background color from the borders
  2) keys that background out to transparency (with a soft edge)
  3) slices into a 4×3 grid and auto-crops each cell to its content
  4) saves them named in reading order (left→right, top→bottom)

用法 / usage:
  # 默认宫保鸡丁 4×3 网格 / default Kung Pao 4×3 sheet:
  python scripts/slice_ingredients.py src/assets/ingredients_sheet.png src/assets

  # 自定义网格 + 名字(逗号分隔,读序排列) / custom grid + names (comma-separated, in reading order):
  python scripts/slice_ingredients.py <sheet> <outdir> <cols> <rows> <name1,name2,...>
"""
import sys
import os
import numpy as np
from PIL import Image
from scipy import ndimage

# 默认网格与文件名(宫保鸡丁);可由命令行覆盖。名字顺序必须和提示词里的格子顺序一致。
# Default grid + filenames (Kung Pao); overridable from the CLI. The name order must match the
# cell order in the image-generation prompt (left→right, top→bottom).
DEFAULT_COLS, DEFAULT_ROWS = 4, 3
DEFAULT_NAMES = [
    "cashew",      # 1 腰果
    "chili",       # 2 干辣椒
    "peppercorn",  # 3 花椒
    "scallion",    # 4 葱
    "ginger",      # 5 姜
    "garlic",      # 6 蒜
    "soy_sauce",   # 7 酱油
    "vinegar",     # 8 醋
    "sugar",       # 9 糖
    "cooking_wine",# 10 料酒
    "cornstarch",  # 11 淀粉
]


def detect_bg(rgb):
    """从四边采样,取中位数作为背景色 / sample the borders, take the median as the background color."""
    h, w = rgb.shape[:2]
    b = max(2, min(h, w) // 100)  # 边框采样厚度 / border sampling thickness
    edges = np.concatenate([
        rgb[:b].reshape(-1, 3), rgb[-b:].reshape(-1, 3),
        rgb[:, :b].reshape(-1, 3), rgb[:, -b:].reshape(-1, 3),
    ])
    return np.median(edges, axis=0)


def key_out_bg(rgba, bg, t_low=12.0, t_high=26.0):
    """按到背景色的距离抠图:近=透明,远=保留,中间=柔边。
    阈值收得很紧,这样白色食材(糖/淀粉,约距灰底50)不会被当成背景抠掉;
    代价是彩色食材边缘留一圈极薄的灰边,56px 显示下基本看不见。
    Key out by distance to the bg color: near→transparent, far→opaque, in-between→feathered.
    Thresholds are deliberately tight so near-white foods (sugar/cornstarch, ~50 from grey)
    survive; the cost is a hairline grey fringe on colored items, invisible at 56px."""
    a = rgba.astype(np.float32)
    dist = np.sqrt(((a[..., :3] - bg) ** 2).sum(axis=2))
    alpha = np.clip((dist - t_low) / (t_high - t_low), 0, 1) * 255.0
    a[..., 3] = np.minimum(a[..., 3], alpha)

    # 只保留"最大的一块透明区域"(=真背景);其它所有透明斑点(如糖粒缝隙间被抠出的灰色)
    # 一律填回不透明,避免盘子底色从食材中间透出来。网格图上真背景把所有食材连成一片,
    # 必然是最大的连通透明块,所以这招很稳。
    # Keep only the single largest transparent region (= the true background); every other
    # transparent speck (e.g. grey gaps between sugar grains) is restored to opaque so the plate
    # color can't show through. On a grid sheet the true background wraps around every item and is
    # by far the largest connected transparent blob, so this is robust.
    transparent = a[..., 3] < 8
    lbl, num = ndimage.label(transparent)
    if num > 1:
        sizes = np.bincount(lbl.ravel())
        sizes[0] = 0  # 标签0是不透明区域,忽略 / label 0 is the opaque region
        biggest = sizes.argmax()
        restore = transparent & (lbl != biggest)
        a[..., 3] = np.where(restore, 255, a[..., 3])
    return a.astype(np.uint8)


def autocrop(cell, pad_frac=0.06):
    """裁掉透明边,只留内容,并留一点边距 / crop to the opaque content with a little padding."""
    alpha = cell[..., 3]
    ys, xs = np.where(alpha > 16)
    if len(xs) == 0:
        return None  # 空格子 / empty cell
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    pad = int(max(x1 - x0, y1 - y0) * pad_frac)
    h, w = alpha.shape
    x0, y0 = max(0, x0 - pad), max(0, y0 - pad)
    x1, y1 = min(w, x1 + pad + 1), min(h, y1 + pad + 1)
    return cell[y0:y1, x0:x1]


def main(src, outdir, cols=DEFAULT_COLS, rows=DEFAULT_ROWS, names=DEFAULT_NAMES):
    im = Image.open(src).convert("RGBA")
    arr = np.array(im)
    bg = detect_bg(arr[..., :3])
    print(f"detected background color: RGB({int(bg[0])},{int(bg[1])},{int(bg[2])})")

    keyed = key_out_bg(arr, bg)
    H, W = keyed.shape[:2]
    cw, ch = W // cols, H // rows

    saved = 0
    for i, name in enumerate(names):
        r, c = i // cols, i % cols
        cell = keyed[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
        cropped = autocrop(cell)
        if cropped is None:
            print(f"  [skip] cell {i+1} ({name}) looks empty")
            continue
        out = os.path.join(outdir, f"{name}.png")
        Image.fromarray(cropped).save(out)
        print(f"  [ok] {name}.png  ({cropped.shape[1]}x{cropped.shape[0]})")
        saved += 1
    print(f"done - {saved}/{len(names)} ingredients saved to {outdir}")


if __name__ == "__main__":
    src, outdir = sys.argv[1], sys.argv[2]
    if len(sys.argv) > 5:
        cols, rows = int(sys.argv[3]), int(sys.argv[4])
        names = [n.strip() for n in sys.argv[5].split(",") if n.strip()]
        main(src, outdir, cols, rows, names)
    else:
        main(src, outdir)
