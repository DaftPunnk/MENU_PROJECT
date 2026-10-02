// MenuList 是通用价目单(菜品和酒水共用):分类手风琴,展开后是"名字 + 价格 + 描述"的价目列表。
// 品项带 dish 字段(= data/dishes/ 里某道菜的 id)就能点进成分拆解;没有的只显示品项(如游水海鲜、大部分酒水)。
// MenuList is the shared price list (food and drinks): a section accordion that expands into
// "name + price + description" rows. An item with a `dish` field (the id of a breakdown in data/dishes/)
// opens the breakdown when tapped; items without one are list-only (e.g. live seafood, most drinks).
//
// 展开哪个分类由 App 保管,这样从详情页返回时还停在原来的分类
// App owns which section is open, so coming back from a detail view keeps the same section open.
//
// 文字按所选语言显示(见 i18n.js);酒水的品名、产区、描述不翻译,只翻分类和小标题。
// Text follows the chosen language (see i18n.js); drink names, regions and descriptions stay as they are —
// only section and group headings are translated.

import { AnimatePresence, motion } from 'framer-motion'
import { dishById } from '../menu'
import { names, pick, t, useLang } from '../i18n'
import { CodeBadges, CodeLegend } from './MenuCodes'

// 价格显示:整数不带小数,其余保留两位 / whole prices without decimals, others with two
const fmt = (n) => (Number.isInteger(n) ? `${n}` : n.toFixed(2))

function Price({ item }) {
  const lang = useLang()
  if (item.prices) {
    // 多规格(如 50ml / 500ml、整只 / 半只) / multiple sizes (e.g. 50ml / 500ml, whole / half)
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
  // 时价等文字价格 / a text price such as market price
  if (item.price_text) return <span className="whitespace-nowrap">{pick(item, 'price_text', lang)}</span>
  // 套餐里的菜没有单价 / dishes inside a set menu have no price of their own
  if (item.price == null) return null
  return (
    <span className="whitespace-nowrap">
      {fmt(item.price)}
      {item.price_note && <span className="text-[10px] text-[#c9a96a]/60 ml-1">{item.price_note}</span>}
    </span>
  )
}

function MenuList({ menu, openSection, onToggleSection, onSelectDish }) {
  const lang = useLang()
  return (
    <div>
      {menu.sections.map((sec) => {
        const expanded = openSection === sec.id
        const secName = names(sec, lang)
        const note = pick(sec, 'note', lang)
        return (
          <div key={sec.id} className="border-b border-[#c9a96a]/20">
            {/* 分类标签 / section tag */}
            <button
              onClick={() => onToggleSection(expanded ? null : sec.id)}
              className="w-full flex items-center justify-between py-4"
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{sec.emoji}</span>
                <span className="flex flex-col items-start">
                  <span className="text-lg font-serif tracking-wide text-[#e8dcc6] text-left">{secName.primary}</span>
                  {secName.ref && <span className="text-xs text-[#c9a96a]/70 text-left">{secName.ref}</span>}
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
                    {note && <p className="text-xs italic text-[#e8dcc6]/60 leading-relaxed mb-3">{note}</p>}
                    {sec.groups.map((g, gi) => (
                      <div key={gi} className="mb-3">
                        {g.name_en && (
                          <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#c9a96a] mt-3 mb-1">
                            {pick(g, 'name', lang)}
                          </h3>
                        )}
                        <ul>
                          {g.items.map((item, ii) => {
                            const linked = item.dish && dishById[item.dish]
                            const itemName = names(item, lang)
                            const detail = pick(item, 'detail', lang)
                            const desc = pick(item, 'desc', lang)
                            // 过敏原字母 + 「成分」入口 / allergen letters + the "ingredients" link tag
                            const tags = (
                              <>
                                {item.codes?.length > 0 && (
                                  <span className="ml-1.5">
                                    <CodeBadges codes={item.codes} />
                                  </span>
                                )}
                                {linked && (
                                  <span className="ml-2 text-[10px] text-[#c9a96a] border border-[#c9a96a]/50 rounded-full px-1.5 py-px align-middle whitespace-nowrap">
                                    {t('ingredients', lang)}
                                  </span>
                                )}
                              </>
                            )
                            const row = (
                              <>
                                <span className="flex flex-col min-w-0">
                                  {/* 所选语言的名字在上,参照名小字在下;酒水只有一个名字 */}
                                  {/* the chosen-language name on top, the reference name small below; drinks have just one name */}
                                  <span className="text-sm text-[#e8dcc6] leading-snug">
                                    {itemName.primary}
                                    {/* 没有参照名(如酒水)时,标记直接跟在名字后面 / no reference name (e.g. drinks): tags follow the name */}
                                    {!itemName.ref && tags}
                                  </span>
                                  {itemName.ref && (
                                    <span className="text-xs text-[#e8dcc6]/60 leading-snug">
                                      {itemName.ref}
                                      {tags}
                                    </span>
                                  )}
                                  {detail && <span className="text-[11px] text-[#c9a96a]/60 leading-snug">{detail}</span>}
                                  {desc && <span className="text-[11px] text-[#e8dcc6]/55 leading-snug mt-0.5">{desc}</span>}
                                </span>
                                <span className="text-sm text-[#c9a96a] shrink-0">
                                  <Price item={item} />
                                </span>
                              </>
                            )
                            return (
                              <li key={ii} className="border-t border-[#c9a96a]/10 first:border-t-0">
                                {linked ? (
                                  // 把这一行的菜单标记一起带进详情页 / carry this row's menu codes into the detail view
                                  <button
                                    onClick={() => onSelectDish({ ...linked, codes: item.codes })}
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

      {/* 过敏原图例 + 底部提示 / allergen legend + footer */}
      {menu.allergen_legend && <CodeLegend />}
      <p className="text-[10px] text-center text-[#e8dcc6]/40 mt-4">{pick(menu, 'footer', lang)}</p>
    </div>
  )
}

export default MenuList
