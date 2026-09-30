// DrinksList 是酒水单:分类手风琴(鸡尾酒/啤酒/葡萄酒/烈酒…),展开后是"名字 + 价格 + 描述"的价目列表。
// 目前只有品项,没有成分拆解;带 dish 字段的品项(如 Flox-tail)已有拆解,点一下跳到详情。
// DrinksList is the beverage list — a section accordion (cocktails / beer / wine / spirits…) that expands into
// a "name + price + description" price list. Items only for now, no breakdowns; an item with a `dish` field
// (e.g. Flox-tail) already has one, and tapping it opens the detail view.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import beverages from '../../data/beverages.json'
import { dishById } from '../menu'

// 价格显示:整数不带小数,其余保留两位 / whole prices without decimals, others with two
const fmt = (n) => (Number.isInteger(n) ? `${n}` : n.toFixed(2))

function Price({ item }) {
  if (item.prices) {
    // 多规格(如 50ml / 500ml) / multiple sizes (e.g. 50ml / 500ml)
    return (
      <span className="flex flex-col items-end">
        {item.prices.map((p) => (
          <span key={p.label} className="whitespace-nowrap">
            <span className="text-[10px] text-[#c9a96a]/60 mr-1">{p.label}</span>
            {fmt(p.price)}
          </span>
        ))}
      </span>
    )
  }
  return (
    <span className="whitespace-nowrap">
      {fmt(item.price)}
      {item.price_note && <span className="text-[10px] text-[#c9a96a]/60 ml-1">{item.price_note}</span>}
    </span>
  )
}

function DrinksList({ onSelectDish }) {
  // 手风琴:一次开一个分类 / accordion — one section open at a time
  const [openSection, setOpenSection] = useState(beverages.sections[0]?.id ?? null)

  return (
    <div>
      {beverages.sections.map((sec) => {
        const expanded = openSection === sec.id
        return (
          <div key={sec.id} className="border-b border-[#c9a96a]/20">
            {/* 分类标签 / section tag */}
            <button
              onClick={() => setOpenSection(expanded ? null : sec.id)}
              className="w-full flex items-center justify-between py-4"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{sec.emoji}</span>
                <span className="flex flex-col items-start">
                  <span className="text-lg font-serif tracking-wide text-[#e8dcc6]">{sec.name_zh}</span>
                  <span className="text-xs text-[#c9a96a]/70">{sec.name_en}</span>
                </span>
              </span>
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
                className="text-[#c9a96a]/70 text-sm"
              >
                ▾
              </motion.span>
            </button>

            {/* 展开区:分组小标题 + 价目行 / expanded panel: group subheadings + price rows */}
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pb-5">
                    {sec.note_en && (
                      <p className="text-xs italic text-[#e8dcc6]/50 leading-relaxed mb-3">{sec.note_en}</p>
                    )}
                    {sec.groups.map((g, gi) => (
                      <div key={gi} className="mb-3">
                        {g.name_en && (
                          <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#c9a96a] mt-3 mb-1">
                            {g.name_zh} · {g.name_en}
                          </h3>
                        )}
                        <ul>
                          {g.items.map((item, ii) => {
                            const linked = item.dish && dishById[item.dish]
                            const row = (
                              <>
                                <span className="flex flex-col min-w-0">
                                  <span className="text-sm text-[#e8dcc6] leading-snug">
                                    {item.name}
                                    {linked && (
                                      <span className="ml-2 text-[10px] text-[#c9a96a] border border-[#c9a96a]/50 rounded-full px-1.5 py-px align-middle">
                                        成分 · Ingredients ›
                                      </span>
                                    )}
                                  </span>
                                  {item.detail && (
                                    <span className="text-[11px] text-[#c9a96a]/60 leading-snug">{item.detail}</span>
                                  )}
                                  {item.desc_en && (
                                    <span className="text-[11px] text-[#e8dcc6]/55 leading-snug mt-0.5">{item.desc_en}</span>
                                  )}
                                </span>
                                <span className="text-sm text-[#c9a96a] shrink-0">
                                  <Price item={item} />
                                </span>
                              </>
                            )
                            return (
                              <li key={ii} className="border-t border-[#c9a96a]/10 first:border-t-0">
                                {linked ? (
                                  <button
                                    onClick={() => onSelectDish(linked)}
                                    className="w-full text-left flex justify-between gap-4 py-2"
                                  >
                                    {row}
                                  </button>
                                ) : (
                                  <div className="flex justify-between gap-4 py-2">{row}</div>
                                )}
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}

      {/* 法定提示 / legal footer */}
      <p className="text-[10px] text-center text-[#e8dcc6]/40 mt-6">{beverages.footer_en}</p>
    </div>
  )
}

export default DrinksList
