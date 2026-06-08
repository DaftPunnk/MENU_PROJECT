// App 是根组件:藏青蓝底 + 纯代码画的占位徽标页头,下面是三级菜单导航:
//   分类手风琴(点心/主菜/鸡尾酒) → 点开分类显示菜的小 icon → 点 icon 放大切换到菜品详情(炸开食材)。
// App is the root — a navy base with a code-drawn placeholder crest header, over a three-level menu:
//   a category accordion (dim sum / main / cocktail) → tap a category to reveal dish icons → tap an icon to
//   zoom into the dish detail (where it explodes into ingredients).
//
// 注意:这是一个虚构的占位品牌「甘露 / NECTAR」,用于公开演示,避免使用真实餐厅的名称/logo。
// 想换成自己的品牌,只改下面 header 里的中英文名即可。
// NOTE: "甘露 / NECTAR" is a FICTIONAL placeholder brand used for public demo purposes, so no real
// restaurant's name or logo is used. To rebrand, just edit the names in the header below.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DishCard from './components/DishCard'
import { categories } from './menu'

function App() {
  // openCategory:当前展开的分类 id(手风琴,一次开一个) / which category is expanded (accordion, one at a time)
  const [openCategory, setOpenCategory] = useState(categories[0]?.id ?? null)
  // selected:被选中的菜 { data, image },非空时显示详情页 / the chosen dish; when set, show the detail view
  const [selected, setSelected] = useState(null)

  return (
    // 藏青蓝底 + 中心一抹金色微光 / navy base with a faint gold glow at center
    <div
      className="min-h-screen bg-[#14234a] text-[#e8dcc6]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 50% 28%, rgba(201,169,106,0.12), transparent 60%)',
      }}
    >
      {/* 餐厅页头:纯代码画的金环徽标(原创占位,不含任何受版权保护的图) */}
      {/* restaurant header — a code-drawn gold-ring crest (original placeholder, no copyrighted art) */}
      <header className="text-center pt-10 pb-4">
        <div className="w-28 h-28 mx-auto rounded-full border-2 border-[#c9a96a]/70 flex flex-col items-center justify-center">
          <span className="text-[#c9a96a] text-lg leading-none">◇</span>
          <span className="mt-1 text-2xl font-serif tracking-widest text-[#c9a96a]">甘露</span>
          <span className="mt-1 text-[10px] tracking-[0.3em] text-[#c9a96a]/80">NECTAR</span>
        </div>
        <p className="mt-3 text-xs tracking-[0.4em] text-[#c9a96a]/70 uppercase">Auckland</p>
        {/* 金色细线 + 菱形,呼应中式格栅/窗棂母题 / gold line + diamond, a nod to a lattice motif */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <span className="h-px w-10 bg-[#c9a96a]/40" />
          <span className="text-[#c9a96a]/60 text-xs">◇</span>
          <span className="h-px w-10 bg-[#c9a96a]/40" />
        </div>
      </header>

      {/* 菜单视图与详情视图之间切换;mode="wait" 让旧视图先退场再进场 */}
      {/* swap between the menu view and the detail view; mode="wait" lets the old view leave before the new one enters */}
      <AnimatePresence mode="wait">
        {selected ? (
          // 详情视图:从小图标"放大"进来(scale 0.7 → 1) / detail view zooms in from the small icon (scale 0.7 → 1)
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className="max-w-md mx-auto px-4">
              <button
                onClick={() => setSelected(null)}
                className="mt-2 text-sm text-[#c9a96a]/80 hover:text-[#c9a96a] transition"
              >
                ← 返回菜单 · Back to menu
              </button>
            </div>
            {/* 合拢=封面(成菜图或大 emoji),展开=食材零件 / closed = cover, open = ingredient pieces */}
            <DishCard dish={selected.data} image={selected.image} />
          </motion.div>
        ) : (
          // 菜单视图:分类手风琴 / menu view: the category accordion
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-md mx-auto px-4 py-4"
          >
            {categories.map((cat) => {
              const expanded = openCategory === cat.id
              return (
                <div key={cat.id} className="border-b border-[#c9a96a]/20">
                  {/* 分类标签:点一下展开/收起这一类 / category tag: tap to expand/collapse this category */}
                  <button
                    onClick={() => setOpenCategory(expanded ? null : cat.id)}
                    className="w-full flex items-center justify-between py-4"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-2xl">{cat.emoji}</span>
                      <span className="flex flex-col items-start">
                        <span className="text-lg font-serif tracking-wide text-[#e8dcc6]">{cat.name_zh}</span>
                        <span className="text-xs text-[#c9a96a]/70">{cat.name_en}</span>
                      </span>
                    </span>
                    {/* 展开时箭头转 180° / the chevron flips 180° when expanded */}
                    <motion.span
                      animate={{ rotate: expanded ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-[#c9a96a]/70 text-sm"
                    >
                      ▾
                    </motion.span>
                  </button>

                  {/* 展开区:这一类的菜 icon 网格 / the expanded panel: a grid of dish icons for this category */}
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-3 gap-3 pb-5 pt-1">
                          {cat.dishes.map((d) => (
                            <button
                              key={d.data.id}
                              onClick={() => setSelected(d)}
                              className="flex flex-col items-center gap-2 group"
                            >
                              {/* 菜的小圆 icon:有成菜图用图(完整缩放进圆内,避免高瘦的杯子被裁),没有退回 emoji */}
                              {/* small round dish icon: the photo scaled to fit inside the circle (object-contain so a
                                  tall glass isn't cropped), or the emoji as a fallback */}
                              <span className="w-20 h-20 rounded-full overflow-hidden bg-[#1b2b50] border border-[#c9a96a]/40 group-hover:border-[#c9a96a] transition flex items-center justify-center text-4xl shadow-md">
                                {d.image ? (
                                  <img src={d.image} alt={d.data.name_en} className="w-full h-full object-contain p-1.5" />
                                ) : (
                                  d.data.emoji
                                )}
                              </span>
                              <span className="flex flex-col items-center">
                                <span className="text-xs text-[#e8dcc6] leading-tight text-center">{d.data.name_zh}</span>
                                <span className="text-[10px] text-[#c9a96a]/60 leading-tight text-center">{d.data.name_en}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
