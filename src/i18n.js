// 多语言:中文 / English / Français。界面文字在这里;菜单内容在 data/*.json 里用 _zh / _en / _fr 后缀字段。
// Languages: Chinese / English / French. UI strings live here; menu content lives in data/*.json as
// fields suffixed _zh / _en / _fr.

import { createContext, useContext } from 'react'

export const LANGS = [
  { id: 'zh', label: '中文', html: 'zh-Hans' },
  { id: 'en', label: 'English', html: 'en' },
  { id: 'fr', label: 'Français', html: 'fr' },
]

export const LangContext = createContext('en')
export const useLang = () => useContext(LangContext)

const UI = {
  food: { zh: '菜品', en: 'Food', fr: 'Plats' },
  drinks: { zh: '酒水', en: 'Drinks', fr: 'Boissons' },
  back: { zh: '← 返回菜单', en: '← Back to menu', fr: '← Retour au menu' },
  tapOpen: { zh: '点击分解', en: 'Tap to break apart', fr: 'Touchez pour décomposer' },
  tapClose: { zh: '点击复原', en: 'Tap to reassemble', fr: 'Touchez pour recomposer' },
  ingredients: { zh: '成分 ›', en: 'Ingredients ›', fr: 'Ingrédients ›' },
}

// 界面文字 / a UI string in the given language
export const t = (key, lang) => UI[key][lang] ?? UI[key].en

// 食材上的过敏原标签(数据里是英文关键词) / ingredient allergen tags (stored as English keywords in the data)
const ALLERGENS = {
  gluten: { zh: '麸质', fr: 'gluten' },
  soy: { zh: '大豆', fr: 'soja' },
  shellfish: { zh: '甲壳贝类', fr: 'crustacés / mollusques' },
  fish: { zh: '鱼', fr: 'poisson' },
  seafood: { zh: '海鲜', fr: 'produits de la mer' },
  egg: { zh: '鸡蛋', fr: 'œuf' },
  dairy: { zh: '乳制品', fr: 'lait' },
  sesame: { zh: '芝麻', fr: 'sésame' },
  'tree nut': { zh: '坚果', fr: 'fruits à coque' },
  alcohol: { zh: '酒精', fr: 'alcool' },
}
export const allergenLabel = (a, lang) => (lang === 'en' ? a : ALLERGENS[a]?.[lang] ?? a)

// 取某字段对应语言的值:field_<lang> → field_en → field(价目单品项的英文名就叫 name)
// a field in the given language: field_<lang> → field_en → field (price-list items keep their English name in `name`)
export const pick = (obj, field, lang) => obj[`${field}_${lang}`] ?? obj[`${field}_en`] ?? obj[field]

// 主名称 + 参照名称:选中语言为主;下面小字给一个参照,方便客人指给服务员看、和纸质菜单对上
//   中文 → 参照英文;English → 参照中文;Français → 参照英文(纸质菜单上的名字)
// primary name + a small reference name, so a guest can point it out to staff and match the printed menu:
//   zh → English; en → Chinese; fr → English (the name on the printed menu)
export function names(obj, lang) {
  const primary = pick(obj, 'name', lang)
  const ref = lang === 'en' ? obj.name_zh : (obj.name_en ?? obj.name)
  return { primary, ref: ref && ref !== primary ? ref : null }
}
