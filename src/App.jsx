// App 是根组件:藏青蓝底 + 纯代码画的占位徽标页头,下面放可交互的菜品卡片
// App is the root — a navy base with a code-drawn placeholder crest header, over the interactive dish card
//
// 注意:这是一个虚构的占位品牌「甘露 / NECTAR」,用于公开演示,避免使用真实餐厅的名称/logo。
// 想换成自己的品牌,只改下面 header 里的中英文名即可。
// NOTE: "甘露 / NECTAR" is a FICTIONAL placeholder brand used for public demo purposes, so no real
// restaurant's name or logo is used. To rebrand, just edit the names in the header below.

import DishCard from './components/DishCard'
import kungPaoData from '../data/kung_pao_chicken.json'
import kungPaoImg from './assets/kongpao_dish.webp'

function App() {
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

      {/* 合拢=成菜图,展开=食材零件 / closed = plated-dish image, open = ingredient pieces */}
      <DishCard dish={kungPaoData} image={kungPaoImg} />
    </div>
  )
}

export default App
