// 菜单总表:把所有菜品按分类(点心/主菜/鸡尾酒)分好组,供主页手风琴使用。
// The menu registry — groups every dish by category (dim sum / main / cocktail) for the home accordion.
// 以后加新菜:1) 在 data/ 加一个菜品 JSON(带 category 字段) 2) 在这里 import 并加进 allDishes 即可。
// To add a dish later: 1) drop a dish JSON in data/ (with a `category` field) 2) import it and add it to allDishes.

import kungPaoData from '../data/kung_pao_chicken.json'
import harGowData from '../data/har_gow.json'
import floxTailData from '../data/flox_tail.json'

// 成菜图(有就用,没有的菜在合拢态退回大 emoji 封面) / hero images (dishes without one fall back to a big emoji)
import kungPaoImg from './assets/kongpao_dish.webp'
import harGowImg from './assets/ha_kao_dish.webp'
import floxTailImg from './assets/flox_tail_dish.webp'

// 每道菜 = 数据 + 可选成菜图 / each dish = its data + an optional hero image
const allDishes = [
  { data: harGowData, image: harGowImg },
  { data: kungPaoData, image: kungPaoImg },
  { data: floxTailData, image: floxTailImg },
]

// 分类的展示信息与排序 / display labels and order for each category
const CATEGORY_META = {
  dim_sum: { name_zh: '点心', name_en: 'Dim Sum', emoji: '🥟' },
  main: { name_zh: '主菜', name_en: 'Main', emoji: '🍲' },
  cocktail: { name_zh: '鸡尾酒', name_en: 'Cocktails', emoji: '🍸' },
}
const CATEGORY_ORDER = ['dim_sum', 'main', 'cocktail']

// 按分类把菜分好组 / dishes grouped under each category, in display order
export const categories = CATEGORY_ORDER.map((id) => ({
  id,
  ...CATEGORY_META[id],
  dishes: allDishes.filter((d) => d.data.category === id),
}))
