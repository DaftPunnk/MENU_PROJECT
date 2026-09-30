# 交接文档 / Handover Guide

> 写给接手部署和维护的 IT 同事。
> For the IT team taking over deployment and maintenance.

---

## 1. 这是什么 / What this is

一个**纯静态网站**（React + Vite），没有后端、没有数据库，运行时也不调用任何外部 API。`npm run build` 会生成一个 `dist/` 文件夹，把它放到任何能托管静态网页的地方就能用。

A **fully static website** (React + Vite): no backend, no database, no external API calls at runtime. `npm run build` produces a `dist/` folder that can be served from any static web host.

**环境要求 / Requirements**：Node.js 20+ 和 npm。Only needed to build — the server itself just serves files.

---

## 2. 构建与部署 / Build & Deploy

### 2.1 设置部署路径 / Set the base path

网站部署在哪个路径下，就用环境变量 `VITE_BASE` 告诉构建工具（**必须以 `/` 开头和结尾**）。
Tell the build which URL path the site will live under via the `VITE_BASE` env var (**must start and end with `/`**).

| 部署位置 / Where it's hosted | `VITE_BASE` |
| --- | --- |
| 独立子域名 / its own subdomain, e.g. `https://menu.example.co.nz/` | `/` |
| 主站子路径 / a sub-path of the main site, e.g. `https://example.co.nz/menu/` | `/menu/` |
| 不设置 / unset | `/MENU_PROJECT/`（原作者的 GitHub Pages 演示用 / the original author's GitHub Pages demo） |

### 2.2 构建 / Build

```bash
# macOS / Linux
npm ci
VITE_BASE=/menu/ npm run build

# Windows Git Bash — 要关掉它的路径自动转换,否则 /menu/ 会变成 /Program Files/Git/menu/
# Windows Git Bash — turn off its path conversion, or /menu/ becomes /Program Files/Git/menu/
MSYS_NO_PATHCONV=1 VITE_BASE=/menu/ npm run build
```

```powershell
# Windows PowerShell
npm ci
$env:VITE_BASE = '/menu/'; npm run build
```

产物在 `dist/`。可以先本地预览确认 / Output is in `dist/`. Optional local check:

```bash
npm run preview
```

### 2.3 上传 / Upload

把 `dist/` **里面的全部文件**复制到服务器对应的目录即可（Nginx / Apache / IIS 都行），也可以用 Netlify、Vercel、Cloudflare Pages 等静态托管平台（构建命令 `npm run build`，输出目录 `dist`，环境变量 `VITE_BASE`）。

Copy **the contents of** `dist/` to the matching directory on the server (Nginx / Apache / IIS all work), or use a static host such as Netlify, Vercel or Cloudflare Pages (build command `npm run build`, output directory `dist`, env var `VITE_BASE`).

- **不需要重写规则 / No rewrite rules needed** — 只有一个页面，没有前端路由。It's a single page with no client-side routing.
- **缓存 / Caching** — `dist/assets/` 里的文件名带内容哈希，可以长期缓存；`index.html` 应设为不缓存（或很短），这样更新后客人马上看到新版。
  Files in `dist/assets/` have content hashes and can be cached long-term; `index.html` should be no-cache (or very short) so updates show up immediately.
- **HTTPS** — 建议开启 / recommended.

Nginx 示例 / example (sub-path `/menu/`):

```nginx
location /menu/ {
    alias /var/www/menu/;          # dist/ 的内容放这里 / contents of dist/ go here
    index index.html;
}
location /menu/assets/ {
    alias /var/www/menu/assets/;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location = /menu/index.html {
    alias /var/www/menu/index.html;
    add_header Cache-Control "no-cache";
}
```

---

## 3. 上线前检查 / Go-live Checklist

- [ ] **品牌 / Branding** — 仓库里的「甘露 / NECTAR」是**虚构占位品牌**，上线前换成正式店名和 logo：
  The "甘露 / NECTAR" brand in this repo is a **fictional placeholder** — replace it before going live:
  - `src/App.jsx` — 页头的徽标和店名 / header crest and name
  - `index.html` — `<title>`
  - `public/favicon.svg` — 浏览器标签图标 / browser tab icon
- [ ] **过敏原核对 / Allergen sign-off** — 所有菜品的成分和过敏原标记（`data/*.json` 里的 `allergens`）必须由厨房核对确认。
  Every ingredient and allergen flag (`allergens` in `data/*.json`) must be verified by the kitchen.
- [ ] **固定网址 / A permanent URL** — 桌上二维码印出来就改不了，务必指向饭店自己长期掌握的域名。
  Printed table QR codes can't be changed, so point them at a domain the restaurant controls long-term.
- [ ] **手机实测 / Test on real phones** — iPhone 和 Android 各扫一次码走一遍。Scan and click through on both iPhone and Android.

---

## 4. 更新内容 / Updating Content

改完任何内容都要**重新 build 并上传 `dist/`**。
After any content change, **rebuild and re-upload `dist/`**.

### 4.1 加一道带成分拆解的菜 / Add a dish with an ingredient breakdown

1. **数据 / Data** — 在 `data/` 新建一个 JSON（可复制 `data/har_gow.json` 改）：
   Create a JSON in `data/` (copy `data/har_gow.json` as a template):

   ```json
   {
     "id": "my-dish",
     "name_zh": "中文菜名",
     "name_en": "English Name",
     "category": "dim_sum",
     "emoji": "🥟",
     "cultural_note_en": "A short English note for non-Chinese guests.",
     "ingredients": [
       { "name_zh": "虾仁", "name_en": "Shrimp", "emoji": "🦐", "image": "shrimp",
         "category": "protein", "allergens": ["shellfish"] }
     ]
   }
   ```

   - `category`：`dim_sum`（点心）、`main`（主菜）或 `cocktail`（鸡尾酒——拆解时从酒杯里飞出，而不是盘子）。
     `dim_sum`, `main`, or `cocktail` (cocktails burst out of a glass instead of a plate).
   - `ingredients` 最多约 12 个，排成 4 列。Up to about 12, laid out in 4 columns.
   - `allergens` 为空数组 `[]` 表示无过敏原；非空时自动显示红边和 ⚠️ 标签。
     An empty `[]` means no allergens; anything else shows a red ring and a ⚠️ badge.
2. **成菜图 / Hero image**（可选 / optional）— 放进 `src/assets/`，推荐透明背景 `.webp`。没有图时会显示 `emoji`。
   Put it in `src/assets/`, ideally a transparent `.webp`. Falls back to the `emoji` if absent.
3. **注册 / Register** — 在 `src/menu.js` 里 import 数据和图片，加进 `allDishes`。
   In `src/menu.js`, import the data and image and add them to `allDishes`.
4. **食材图 / Ingredient images**（可选 / optional）— 透明 `.webp` 放进 `src/assets/`，在 `src/ingredientImages.js` 里加一行，键名与 JSON 里的 `image` 一致。没有图的食材显示 `emoji`。
   Add a transparent `.webp` to `src/assets/` and one line in `src/ingredientImages.js`, keyed by the ingredient's `image` value. Ingredients without an image show their `emoji`.

### 4.2 改酒水单 / Edit the drinks list

全部在 `data/beverages.json`：`sections`（大类）→ `groups`（小组，可无标题）→ `items`（品项）。
Everything is in `data/beverages.json`: `sections` → `groups` (optionally titled) → `items`.

```json
{ "name": "Royal 75", "price": 28, "desc_en": "Lychee, Mandarin, Gin ..." }
{ "name": "2024 Cloudy Bay", "detail": "Marlborough", "price": 24 }
{ "name": "Antipodes Water", "prices": [{ "label": "500ml", "price": 7 }, { "label": "1L", "price": 14 }] }
{ "name": "Flox-tail", "price": 26, "dish": "flox-tail" }
```

- `detail`：产区 / 规格等小字 / small print such as region or size
- `desc_en`：描述 / description
- `prices`：多规格价格，代替 `price` / multiple sizes, instead of `price`
- `price_note`：价格后的小字，如 `pp` / small text after the price, e.g. `pp`
- `dish`：填某道菜 JSON 的 `id`，这一行就能点进成分拆解 / set to a dish JSON's `id` to make the row open its breakdown

### 4.3 图片工具 / Image helpers

`scripts/` 里有两个 Python 小工具（需要 Pillow、NumPy、SciPy）：
Two small Python helpers in `scripts/` (need Pillow, NumPy, SciPy):

- `remove_white_bg.py` — 把白底抠成透明 / knock out a white background
- `slice_ingredients.py` — 把一张食材网格图切成单张透明图 / slice an ingredient grid sheet into single transparent images

---

## 5. 项目结构 / Project Structure

```
data/                    菜品与酒水数据 / dish & drinks data (JSON)
src/
  App.jsx                页头 + 菜品/酒水切换 + 分类导航 / header, food/drinks tabs, category nav
  menu.js                菜品注册表 / dish registry
  ingredientImages.js    食材图映射 / ingredient image map
  components/
    DishCard.jsx         成分拆解动画(盘子/酒杯) / breakdown animation (plate / glass)
    IngredientChip.jsx   单个食材 / one ingredient piece
    DrinksList.jsx       酒水价目列表 / drinks price list
  assets/                图片 / images
public/                  原样复制的静态文件(favicon) / copied as-is (favicon)
scripts/                 图片处理工具 / image helpers
vite.config.js           构建配置(VITE_BASE) / build config (VITE_BASE)
```
