// 「帮我选」的推荐逻辑(不用 AI,纯规则):
//   1) 安全:按客人勾选的忌口,用菜单的 D/G/N/S/V 标记 + 成分里的过敏原,先把不能吃的菜排除掉;
//   2) 口味:剩下的菜按口味标签(data/picker.json)打分,按人数排出一桌搭配(前菜/点心 → 主菜 → 蔬菜 → 饭面 → 甜品)。
// 以后加 AI 时,第 1 步保持由代码完成,AI 只替换第 2 步的"挑哪几道、为什么"。
// The rule-based 'help me pick' logic (no AI):
//   1) safety — drop every dish the guest can't have, using the menu's D/G/N/S/V codes plus the
//      ingredient-level allergen flags;
//   2) taste — score what's left against the mood tags (data/picker.json) and lay out a balanced meal for
//      the party size (openers → mains → veg → rice → dessert).
// When AI is added later, step 1 stays in code; AI only replaces step 2's "which dishes and why".

import food from '../data/food.json'
import beverages from '../data/beverages.json'
import picker from '../data/picker.json'
import { dishById } from './menu'
import { isAvailable } from './availability'

// 忌口:对应菜单标记 + 成分过敏原关键词 / avoid options → menu code + ingredient allergen keywords
export const AVOID = {
  nuts: { code: 'N', flags: ['tree nut', 'peanut'] },
  seafood: { code: 'S', flags: ['shellfish', 'fish', 'seafood'] },
  gluten: { code: 'G', flags: ['gluten'] },
  dairy: { code: 'D', flags: ['dairy'] },
  vegetarian: {}, // 只留标了 V 的菜 / keep only dishes marked V
  spicy: {}, // 排除带 spicy 标签的菜 / drop dishes tagged spicy
}

export const MOODS = ['light', 'bold', 'spicy', 'seafood', 'meat', 'veg', 'signature', 'adventurous']
export const PARTY = ['1', '2', '3-4', '5+']

// ---- 酒水搭配 / drink pairing ----
// 想喝什么(可多选);alcohol_free 是硬性过滤,由代码保证只出无酒精饮品;no_drinks = 不要酒水
// drink preferences (multi-select); alcohol_free is a hard filter enforced in code; no_drinks = skip drinks
export const DRINK_PREFS = ['wine', 'cocktail', 'beer', 'tea', 'alcohol_free', 'no_drinks']
const PREF_SECTIONS = {
  wine: ['wine_glass', 'wine_bottle'],
  cocktail: ['signature_cocktails', 'baijiu_cocktails'],
  beer: ['beer'],
  tea: ['tea'],
  alcohol_free: ['conscious_curations', 'tea', 'soft_drinks'],
}
// 确定不含酒精的分类(啤酒里的 Low / No 可能仍含少量酒精,不算) / sections known to be alcohol-free (low/no beer may still contain some)
const ALCOHOL_FREE = new Set(['conscious_curations', 'tea', 'soft_drinks'])
// 没选偏好时从这些里搭配(烈酒和白酒不作搭配推荐) / the default pairing pool (spirits and baijiu shots aren't paired)
const DEFAULT_DRINK_SECTIONS = ['wine_glass', 'wine_bottle', 'signature_cocktails', 'baijiu_cocktails', 'conscious_curations', 'tea', 'beer']
const DRINK_PREFIX = {
  wine_glass: 'Glass',
  wine_bottle: 'Bottle',
  signature_cocktails: 'Cocktail',
  baijiu_cocktails: 'Baijiu cocktail',
  conscious_curations: 'Alcohol-free',
  tea: 'Tea',
  beer: 'Beer',
  soft_drinks: 'Soft drink',
}
const WHITE = ['Champagne', 'Sparkling', 'Sauvignon Blanc', 'Pinot Gris', 'Chardonnay', 'Riesling', 'Gewürztraminer', 'Other White Varietals']

// 每款酒水一个唯一 id(同一款酒可能既有杯卖又有整瓶) / a unique id per drink (the same wine can be by the glass and by the bottle)
const drinkCandidates = []
{
  const ids = new Set()
  for (const sec of beverages.sections) {
    if (!DRINK_PREFIX[sec.id]) continue
    for (const group of sec.groups) {
      for (const item of group.items) {
        let id = `${DRINK_PREFIX[sec.id]}: ${item.name}`
        if (ids.has(id)) id = `${DRINK_PREFIX[sec.id]} (${group.name_en}): ${item.name}`
        if (ids.has(id) && import.meta.env.DEV) console.warn(`[picker] duplicate drink id "${id}"`)
        ids.add(id)
        drinkCandidates.push({ id, item, section: sec, group, order: drinkCandidates.length })
      }
    }
  }
}
export const allDrinks = drinkCandidates

// 按偏好可选的酒水(无酒精由代码保证) / drinks allowed by the preferences (alcohol-free enforced here)
export function drinksFor(prefs) {
  if (prefs.includes('no_drinks')) return []
  const chosen = prefs.filter((p) => PREF_SECTIONS[p] && p !== 'alcohol_free')
  let sections = new Set(chosen.length ? chosen.flatMap((p) => PREF_SECTIONS[p]) : DEFAULT_DRINK_SECTIONS)
  if (prefs.includes('alcohol_free')) {
    sections = new Set([...sections].filter((s) => ALCOHOL_FREE.has(s)))
    if (!sections.size) sections = new Set(ALCOHOL_FREE)
  }
  return drinkCandidates.filter((d) => sections.has(d.section.id) && isAvailable(d.item))
}

// 几款酒水 / how many drinks to suggest
export const drinkCount = (party) => ({ 1: 1, 2: 2, '3-4': 3, '5+': 3 })[party]

// 只从单点菜里选 / pick from à la carte sections only
const PICK_SECTIONS = new Set(['small_eats', 'dim_sum', 'meats', 'seafood', 'wok', 'rice_noodles', 'vegetarian', 'desserts'])

const candidates = food.sections
  .filter((s) => PICK_SECTIONS.has(s.id))
  .flatMap((s) => s.groups.flatMap((g) => g.items))
  .filter((item) => picker.items[item.name])
  .map((item, order) => {
    const dish = item.dish ? dishById[item.dish] : null
    return {
      item,
      dish,
      order,
      ...picker.items[item.name],
      // 成分里标出的过敏原 / allergens flagged on the ingredients
      flags: new Set(dish ? dish.data.ingredients.flatMap((i) => i.allergens) : []),
    }
  })

// 开发时提醒:标签表里的名字在菜单里找不到 / dev warning: a tagged name that isn't on the menu
if (import.meta.env.DEV) {
  const onMenu = new Set(candidates.map((c) => c.item.name))
  for (const name of Object.keys(picker.items)) {
    if (!onMenu.has(name)) console.warn(`[picker] "${name}" is tagged but not on the food menu`)
  }
}

// 全部候选菜(给 AI 当菜单目录) / every candidate dish (the catalogue the AI sees)
export const allCandidates = candidates

// 排除忌口后还能点的菜(安全过滤,AI 只能从这里面选) / what's left after the avoid filter — the AI may only pick from these
export const candidatesFor = (avoid) => candidates.filter((c) => isAvailable(c.item) && allowed(c, avoid))

function allowed(c, avoid) {
  for (const key of avoid) {
    if (key === 'vegetarian') {
      if (!c.item.codes.includes('V')) return false
    } else if (key === 'spicy') {
      if (c.tags.includes('spicy')) return false
    } else {
      const { code, flags } = AVOID[key]
      if (c.item.codes.includes(code) || flags.some((f) => c.flags.has(f))) return false
    }
  }
  return true
}

// 每种"位置"可以从哪些 course 里选(依次退而求其次) / which courses each slot draws from (in fallback order)
const SLOTS = {
  opener: [['starter', 'dim_sum']],
  main: [['main'], ['veg']],
  side: [['veg', 'rice']],
  veg: [['veg']],
  rice: [['rice']],
  dessert: [['dessert']],
}
// 按人数的一桌搭配 / the meal layout for each party size
const PLANS = {
  1: ['opener', 'main'],
  2: ['opener', 'opener', 'main', 'main', 'side'],
  '3-4': ['opener', 'opener', 'opener', 'main', 'main', 'main', 'veg', 'rice'],
  '5+': ['opener', 'opener', 'opener', 'opener', 'main', 'main', 'main', 'main', 'veg', 'rice'],
}

// 可复现的随机数("换一批"用) / a seeded RNG for "shuffle"
function rng(seed) {
  let a = seed * 2654435761
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function score(c, moods, used, rand) {
  let s = 0
  for (const m of moods) if (c.tags.includes(m)) s += 2
  if (!moods.length && c.tags.includes('signature')) s += 1 // 没选口味就偏向招牌菜 / no mood: lean on signatures
  if (moods.includes('light') && c.tags.includes('bold')) s -= 1
  if (moods.includes('bold') && c.tags.includes('light')) s -= 1
  // 一桌里别都是同一种:同类蛋白、同一种 course 越多越扣分;客人点名想吃的那类不扣
  // variety: repeats of a protein or course cost a little — except a protein the guest asked for
  for (const p of ['seafood', 'meat', 'veg']) {
    if (c.tags.includes(p) && !moods.includes(p)) s -= 0.75 * (used[p] ?? 0)
  }
  s -= 0.5 * (used[c.course] ?? 0)
  // seed 0 按菜单顺序稳定排序;"换一批"后加随机扰动 / seed 0 is stable (menu order); shuffles add jitter
  return s + (rand ? rand() * 1.5 : -c.order * 0.001)
}

// 套餐价格要看人数:北京鸭 1–2 人选半只 / for priced-by-size items (Peking duck) take half for 1–2 people
function priceFor(item, party) {
  if (item.prices) {
    const p = party === '1' || party === '2' ? item.prices[item.prices.length - 1] : item.prices[0]
    return { price: p.price, label: p.label }
  }
  return { price: item.price ?? 0, label: null }
}

// 酒水价格:多规格时取第一个(最小份) / drink price: the first (smallest) size when there are several
function drinkPrice(item) {
  if (item.prices) return { price: item.prices[0].price, label: item.prices[0].label }
  return { price: item.price ?? 0, label: null }
}

// 一桌的搭配,总是带甜品(1–2 人一道,3 人以上两道) / the meal layout, always with dessert (one for 1–2, two for 3+)
function planFor(party) {
  return [...PLANS[party], ...(party === '1' || party === '2' ? ['dessert'] : ['dessert', 'dessert'])]
}

// 每类上几道(告诉 AI 怎么搭配) / how many dishes per slot (the meal shape we ask the AI for)
export function planCounts(party) {
  const counts = {}
  for (const slot of planFor(party)) counts[slot] = (counts[slot] ?? 0) + 1
  return counts
}

// 规则版酒水搭配:按偏好轮流挑;葡萄酒看菜偏清淡/海鲜(白)还是浓郁/肉(红),3 人以上选整瓶
// rule-based drink pairing: rotate through the preferences; wine leans white for light/seafood tables and red
// for rich/meaty ones, by the bottle for 3+
function ruleDrinks(drinkPrefs, party, picks, rand) {
  const pool = drinksFor(drinkPrefs)
  const n = drinkCount(party)
  if (!pool.length) return []
  const inSec = (ids) => pool.filter((d) => ids.includes(d.section.id))
  const light = picks.filter((p) => p.c.tags.includes('seafood') || p.c.tags.includes('light')).length
  const rich = picks.filter((p) => p.c.tags.includes('meat') || p.c.tags.includes('bold')).length
  const wineSec = party === '3-4' || party === '5+' ? ['wine_bottle'] : ['wine_glass']
  const wine = (white) =>
    inSec(wineSec).filter((d) => d.group.name_en !== 'Sweet & Fortified' && WHITE.includes(d.group.name_en) === white)
  const buckets = {
    wine: [wine(light >= rich), wine(light < rich)],
    cocktail: [inSec(['signature_cocktails', 'baijiu_cocktails'])],
    beer: [inSec(['beer'])],
    tea: [inSec(['tea'])],
    alcohol_free: [inSec(['conscious_curations']), inSec(['tea'])],
  }
  const chosen = drinkPrefs.filter((p) => buckets[p] && p !== 'alcohol_free')
  const order = drinkPrefs.includes('alcohol_free')
    ? ['alcohol_free', ...chosen.filter((p) => p === 'tea')]
    : chosen.length
      ? chosen
      : ['wine', 'alcohol_free', 'cocktail']
  let lists = order.flatMap((p) => buckets[p]).filter((b) => b.length)
  if (!lists.length) lists = [pool]

  const out = []
  for (let i = 0; out.length < n && i < n * 4; i++) {
    const list = lists[i % lists.length].filter((d) => !out.includes(d))
    if (list.length) out.push(list[rand ? Math.floor(rand() * list.length) : 0])
  }
  return out.map((d) => ({ d, ...drinkPrice(d.item) }))
}

export function recommend({ moods, party, avoid, drinkPrefs = [], seed = 0 }) {
  const ok = candidatesFor(avoid)
  const rand = seed ? rng(seed) : null
  const plan = planFor(party)

  const picks = []
  const used = {}
  let missing = 0
  for (const slot of plan) {
    let best = null
    for (const courses of SLOTS[slot]) {
      const pool = ok.filter((c) => courses.includes(c.course) && !picks.some((p) => p.c === c))
      for (const c of pool) {
        const s = score(c, moods, used, rand)
        if (!best || s > best.s) best = { c, s }
      }
      if (best) break
    }
    if (!best) {
      missing++
      continue
    }
    const { c } = best
    picks.push({ c, reasons: moods.filter((m) => c.tags.includes(m)), ...priceFor(c.item, party) })
    for (const p of ['seafood', 'meat', 'veg']) if (c.tags.includes(p)) used[p] = (used[p] ?? 0) + 1
    used[c.course] = (used[c.course] ?? 0) + 1
  }

  const drinks = ruleDrinks(drinkPrefs, party, picks, rand)
  return finish(picks, drinks, { moods, party, avoid, okCount: ok.length, short: missing > 0 })
}

// AI 选好的菜(按英文名)→ 和规则推荐一样的结果结构;客户端这里再按忌口校验一遍,不在允许列表里的直接丢掉
// turn the AI's picks (by English name) into the same result shape as the rules — re-checked here against
// the avoid filter, so anything not allowed is dropped
export function fromAi(ai, { moods, party, avoid, drinkPrefs = [] }) {
  const ok = candidatesFor(avoid)
  const byName = new Map(ok.map((c) => [c.item.name, c]))
  const seen = new Set()
  const picks = []
  for (const p of ai.picks) {
    const c = byName.get(p.name)
    if (!c || seen.has(c)) continue
    seen.add(c)
    picks.push({ c, reasons: moods.filter((m) => c.tags.includes(m)), aiReason: p.reason, ...priceFor(c.item, party) })
  }
  // 酒水同样只认允许列表里的(无酒精偏好由这里保证) / drinks too must be on the allowed list (enforces alcohol-free)
  const okDrinks = new Map(drinksFor(drinkPrefs).map((d) => [d.id, d]))
  const drinks = []
  for (const x of ai.drinks ?? []) {
    const d = okDrinks.get(x.id)
    if (!d || drinks.some((y) => y.d === d)) continue
    drinks.push({ d, aiReason: x.reason, ...drinkPrice(d.item) })
  }
  return {
    ...finish(picks, drinks, { moods, party, avoid, okCount: ok.length, short: picks.length === 0 }),
    message: ai.message,
  }
}

function finish(picks, drinks, { moods, party, avoid, okCount, short }) {
  // 按上菜顺序排 / serve order
  const order = ['starter', 'dim_sum', 'main', 'veg', 'rice', 'dessert']
  picks.sort((a, b) => order.indexOf(a.c.course) - order.indexOf(b.c.course) || a.c.order - b.c.order)

  // 想吃招牌、2 人以上、套餐里没有要忌口的 → 顺便提一下套餐 / suggest the set menus for 2+ signature-seekers they can eat
  const setMenus =
    party !== '1' && moods.includes('signature') && !avoid.includes('vegetarian')
      ? food.sections
          .filter((s) => s.id === 'tasting' || s.id === 'duck_set')
          .filter((s) => {
            const codes = new Set(s.groups.flatMap((g) => g.items.flatMap((i) => i.codes)))
            return !avoid.some((k) => AVOID[k].code && codes.has(AVOID[k].code))
          })
      : []

  return {
    picks,
    drinks,
    total: picks.reduce((sum, p) => sum + p.price, 0),
    drinkTotal: drinks.reduce((sum, p) => sum + p.price, 0),
    excluded: candidates.length - okCount,
    short,
    setMenus,
  }
}
