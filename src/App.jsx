// App 是根组件:藏青蓝底 + 纯代码画的占位徽标页头,下面是「菜品 / 酒水」两个标签,都是价目单(MenuList):
//   分类手风琴 → 展开看品项;有成分拆解的品项点一下放大切换到详情(炸开食材),其余只显示品项。
// App is the root — a navy base with a code-drawn placeholder crest header, over two tabs that are both
// price lists (MenuList): a section accordion of items; items with a breakdown zoom into the detail view
// (where the dish explodes into ingredients), the rest are list-only.
//
// 注意:这是一个虚构的占位品牌「甘露 / NECTAR」,用于公开演示,避免使用真实餐厅的名称/logo。
// 想换成自己的品牌,只改下面 header 里的中英文名即可。
// NOTE: "甘露 / NECTAR" is a FICTIONAL placeholder brand used for public demo purposes, so no real
// restaurant's name or logo is used. To rebrand, just edit the names in the header below.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DishCard from './components/DishCard'
import MenuList from './components/MenuList'
import food from '../data/food.json'
import beverages from '../data/beverages.json'

function App() {
  // openSection:每个标签各自展开的分类 id(手风琴,一次开一个);放在这里,从详情页返回时保持不变
  // which section is expanded on each tab (accordion, one at a time); kept here so it survives a detail view
  const [openSection, setOpenSection] = useState({
    food: food.sections[0]?.id ?? null,
    drinks: beverages.sections[0]?.id ?? null,
  })
  // selected:被选中的菜 { data, image },非空时显示详情页 / the chosen dish; when set, show the detail view
  const [selected, setSelected] = useState(null)
  // tab:'food' 菜品 / 'drinks' 酒水;从详情返回时停留在原来的标签 / stays put when returning from a detail view
  const [tab, setTab] = useState('food')

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
            <DishCard dish={selected.data} image={selected.image} codes={selected.codes} />
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
            {/* 菜品 / 酒水 切换 / food ⇄ drinks toggle */}
            <div className="flex justify-center gap-2 mb-2">
              {[
                { id: 'food', label: '菜品 · Food' },
                { id: 'drinks', label: '酒水 · Drinks' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    'px-4 py-1.5 rounded-full text-sm border transition ' +
                    (tab === t.id
                      ? 'bg-[#c9a96a] text-[#14234a] border-[#c9a96a]'
                      : 'text-[#c9a96a]/80 border-[#c9a96a]/40 hover:border-[#c9a96a]')
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* key 让切换标签时列表重新挂载 / key remounts the list when switching tabs */}
            <MenuList
              key={tab}
              menu={tab === 'drinks' ? beverages : food}
              openSection={openSection[tab]}
              onToggleSection={(id) => setOpenSection((s) => ({ ...s, [tab]: id }))}
              onSelectDish={setSelected}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
