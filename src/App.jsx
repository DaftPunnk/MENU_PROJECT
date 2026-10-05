// App 是根组件:藏青蓝底 + 纯代码画的占位徽标页头,下面是「菜品 / 酒水」两个标签,都是价目单(MenuList):
//   分类手风琴 → 展开看品项;有成分拆解的品项点一下放大切换到详情(炸开食材),其余只显示品项。
// App is the root — a navy base with a code-drawn placeholder crest header, over two tabs that are both
// price lists (MenuList): a section accordion of items; items with a breakdown zoom into the detail view
// (where the dish explodes into ingredients), the rest are list-only.
// 语言(中 / 英 / 法)默认跟随手机系统语言,右上角可随时切换,本次访问内记住。
// The language (zh / en / fr) defaults to the phone's system language; the corner switch changes it, remembered for the visit.
//
// 注意:这是一个虚构的占位品牌「甘露 / NECTAR」,用于公开演示,避免使用真实餐厅的名称/logo。
// 想换成自己的品牌,只改下面 header 里的中英文名即可。
// NOTE: "甘露 / NECTAR" is a FICTIONAL placeholder brand used for public demo purposes, so no real
// restaurant's name or logo is used. To rebrand, just edit the names in the header below.

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import DishCard from './components/DishCard'
import MenuList from './components/MenuList'
import HelpMePick from './components/HelpMePick'
import { LANGS, LangContext, t } from './i18n'
import foodMenu from '../data/food.json'
import beverageMenu from '../data/beverages.json'
import { withoutExpired } from './availability'

// 过了 until 日期的限时品项不显示(见 availability.js) / limited-time items past their `until` date are hidden (see availability.js)
const food = withoutExpired(foodMenu)
const beverages = withoutExpired(beverageMenu)

// 初始语言:本次访问里切换过就用切换的(sessionStorage),否则看手机系统语言(中文 / 法语),其余默认英文
// starting language: the one switched to earlier in this visit (sessionStorage), else the phone's system
// language if it's Chinese or French, else English
const LANG_KEY = 'menu-lang'
function initialLang() {
  try {
    const saved = sessionStorage.getItem(LANG_KEY)
    if (LANGS.some((l) => l.id === saved)) return saved
  } catch {
    // 存储不可用就跳过 / storage blocked — skip it
  }
  const sys = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase()
  if (sys.startsWith('zh')) return 'zh'
  if (sys.startsWith('fr')) return 'fr'
  return 'en'
}

function App() {
  const [lang, setLang] = useState(initialLang)
  // ai:左上角「AI」预览开关,开着时多一个「帮我选」;网址带 #ai,方便直接发链接
  // ai: the top-left "AI" preview toggle — adds "help me pick"; reflected as #ai in the URL so the link can be shared
  const [ai, setAi] = useState(() => window.location.hash === '#ai')
  const toggleAi = () => {
    const next = !ai
    setAi(next)
    history.replaceState(null, '', next ? '#ai' : window.location.pathname + window.location.search)
  }
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

  // 记住语言 + 同步 <html lang>(读屏、浏览器翻译用) / remember the language + sync <html lang> (screen readers, browser translate)
  useEffect(() => {
    document.documentElement.lang = LANGS.find((l) => l.id === lang).html
    try {
      sessionStorage.setItem(LANG_KEY, lang)
    } catch {
      // 存不了就只在内存里 / no storage — keep it in memory only
    }
  }, [lang])

  return (
    <LangContext.Provider value={lang}>
      {/* 藏青蓝底 + 中心一抹金色微光 / navy base with a faint gold glow at center */}
      <div
        className="min-h-dvh bg-[#14234a] text-[#e8dcc6]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 28%, rgba(201,169,106,0.12), transparent 60%)',
        }}
      >
        {/* 餐厅页头:纯代码画的金环徽标(原创占位,不含任何受版权保护的图) */}
        {/* restaurant header — a code-drawn gold-ring crest (original placeholder, no copyrighted art) */}
        <header className="relative text-center pt-10 pb-4">
          {/* 左上角 AI 预览开关(开发中的功能) / top-left AI preview toggle (features in development) */}
          <button
            onClick={toggleAi}
            aria-pressed={ai}
            className={
              'absolute top-3 left-3 rounded-full border px-2.5 py-1 text-[11px] transition ' +
              (ai
                ? 'bg-[#c9a96a] text-[#14234a] border-[#c9a96a]'
                : 'text-[#c9a96a]/80 border-[#c9a96a]/40 hover:text-[#c9a96a]')
            }
          >
            AI Test
          </button>
          {/* 右上角语言切换 / corner language switch */}
          <div className="absolute top-3 right-3 flex rounded-full border border-[#c9a96a]/40 overflow-hidden text-[11px]">
            {LANGS.map((l) => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
                aria-label={l.label}
                className={
                  'px-2 py-1 transition ' +
                  (lang === l.id ? 'bg-[#c9a96a] text-[#14234a]' : 'text-[#c9a96a]/80 hover:text-[#c9a96a]')
                }
              >
                {l.id === 'zh' ? '中' : l.id.toUpperCase()}
              </button>
            ))}
          </div>
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
                  {t('back', lang)}
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
              // 开着「帮我选」时底部多留一截,浮动按钮不会盖住最底下的图例和小字
              // with "help me pick" on, leave extra room at the bottom so the floating button can't cover the legend and footer
              className={'max-w-md mx-auto px-4 pt-4 ' + (ai ? 'pb-24' : 'pb-4')}
            >
              {/* 菜品 / 酒水 切换 / food ⇄ drinks toggle */}
              <div className="flex justify-center gap-2 mb-2">
                {['food', 'drinks'].map((id) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={
                      'px-5 py-1.5 rounded-full text-sm border transition ' +
                      (tab === id
                        ? 'bg-[#c9a96a] text-[#14234a] border-[#c9a96a]'
                        : 'text-[#c9a96a]/80 border-[#c9a96a]/40 hover:border-[#c9a96a]')
                    }
                  >
                    {t(id, lang)}
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

        {/* AI 预览:右下角「帮我选」;看详情时隐藏,但保留已选条件和结果 */}
        {/* AI preview: the "help me pick" corner button — hidden on a detail view, keeping its choices and results */}
        {ai && <HelpMePick hidden={!!selected} onSelectDish={setSelected} />}
      </div>
    </LangContext.Provider>
  )
}

export default App
