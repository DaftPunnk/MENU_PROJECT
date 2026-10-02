// 菜品注册表:data/dishes/ 里的每个 JSON 都是一道有成分拆解的菜,自动全部载入,按 id 查找。
// 价目单(data/food.json、data/beverages.json)里带 dish 字段的品项,通过 dishById 打开详情。
// The dish registry — every JSON in data/dishes/ is a dish with an ingredient breakdown, loaded automatically
// and looked up by id. Price-list items (data/food.json, data/beverages.json) with a `dish` field open it via dishById.
// 以后加新菜:在 data/dishes/ 放一个 JSON,再在价目单对应品项上写 "dish": "<id>" 即可。
// To add a dish later: drop a JSON in data/dishes/, then set "dish": "<id>" on its price-list item.

// 成菜图(有就用,没有的菜在合拢态退回大 emoji 封面) / hero images (dishes without one fall back to a big emoji)
import kungPaoImg from './assets/kongpao_dish.webp'
import harGowImg from './assets/ha_kao_dish.webp'
import floxTailImg from './assets/flox_tail_dish.webp'

// 按菜品 id 对应成菜图 / hero image by dish id
const heroImages = {
  'kung-pao-chicken': kungPaoImg,
  'ha-kao': harGowImg,
  'flox-tail': floxTailImg,
}

const dishFiles = import.meta.glob('../data/dishes/*.json', { eager: true, import: 'default' })

// 每道菜 = 数据 + 可选成菜图 / each dish = its data + an optional hero image
export const dishById = Object.fromEntries(
  Object.values(dishFiles).map((data) => [data.id, { data, image: heroImages[data.id] }]),
)
