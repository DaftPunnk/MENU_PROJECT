// DishCard 显示一道菜:合拢时盘里是完整成菜图,点一下它炸开成食材零件(盘子空了),再点零件收回复原
// DishCard shows one dish — the closed state is the full plated-dish image; tap to explode it into
// ingredient pieces (leaving the plate empty), tap again to fly the pieces back and reassemble.

import { useState } from 'react'
import { motion } from 'framer-motion'
import IngredientChip from './IngredientChip'
import { ingredientImages } from '../ingredientImages'

// 盘子中心的位置(百分比):合拢时零件都收在这里、成菜图也摆在这附近;展开时零件从这里飞出
// The plate center (in %). Pieces rest here when closed; the dish photo sits near here; pieces fly out from here.
const PLATE_LEFT = 50
const PLATE_TOP = 80

function DishCard({ dish, image }) {
  // isOpen 控制菜是否已"分解" / isOpen controls whether the dish is decomposed
  const [isOpen, setIsOpen] = useState(false)

  // 展开态:把食材排进盘子上方的网格(4 列,自动分行)
  // open state: lay the ingredients into a grid above the plate (4 columns, wrapping into rows)
  const cols = 4
  const layout = dish.ingredients.map((ing, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    return {
      ing,
      index,
      openLeft: 16 + col * 22.7,
      openTop: 12 + row * 22,
    }
  })

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* 菜名 / dish title */}
      <div className="text-center mb-4">
        <h1 className="text-2xl font-serif tracking-wide text-[#e8dcc6]">{dish.name_zh}</h1>
        <h2 className="text-base text-[#c9a96a]/70">{dish.name_en}</h2>
      </div>

      {/* 舞台:竖向布局,盘子在下方,食材飞到上方 / portrait stage — plate at the bottom, pieces fly up */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full aspect-[4/5] cursor-pointer select-none"
      >
        {/* 空盘子(代码画的椭圆):展开后才显形(成菜图淡出、盘子空了);合拢时被成菜图盖住 */}
        {/* the empty plate (CSS ellipse): appears once opened (dish faded out, plate now empty); hidden behind the dish when closed */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%]
                     border border-[#c9a96a]/50 bg-gradient-to-b from-[#26407a] to-[#0d1730]
                     shadow-[0_12px_30px_rgba(0,0,0,0.45)]"
          style={{ top: `${PLATE_TOP}%`, width: '68%', height: '14%' }}
          animate={{ opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-2 rounded-[50%] border border-[#c9a96a]/25" />
        </motion.div>

        {/* 合拢态封面:有成菜图就用图,没有就用大 emoji 占位;都负责"勾人",展开时淡出、缩小,像被端走炸开 */}
        {/* closed-state cover: the plated-dish photo if there is one, otherwise a big emoji placeholder —
            either way the appetizing hook; fades + shrinks away when opened */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[84%] flex justify-center pointer-events-none z-10">
          <motion.div
            className="flex justify-center"
            animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0.65 : 1 }}
            transition={{ duration: 0.35 }}
          >
            {image ? (
              <img src={image} alt={dish.name_en} className="max-h-[380px] w-auto object-contain" />
            ) : (
              <span className="text-[150px] leading-none drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)]">
                {dish.emoji}
              </span>
            )}
          </motion.div>
        </div>

        {/* 食材零件:合拢时缩进盘子(看不见),展开时从盘子飞到上方网格,带名字+过敏标记 */}
        {/* ingredient pieces: hidden in the plate when closed, flying up into the grid (with name + allergens) when opened */}
        {layout.map(({ ing, index, openLeft, openTop }) => (
          <IngredientChip
            key={index}
            ing={ing}
            index={index}
            isOpen={isOpen}
            openLeft={openLeft}
            openTop={openTop}
            pileLeft={PLATE_LEFT}
            pileTop={PLATE_TOP}
            // 按食材的 image 关键字查到真实图片;查不到则为 undefined,组件退回 emoji
            // look up the real image by the ingredient's `image` key; undefined → component falls back to emoji
            image={ingredientImages[ing.image]}
          />
        ))}
      </div>

      {/* 操作提示 / tap hint */}
      <p className="text-center text-sm text-[#c9a96a]/60 mt-2">
        {isOpen ? '点击复原 · Tap to reassemble' : '点击分解 · Tap to break apart'}
      </p>

      {/* 文化小知识(英文),帮外国客人理解这道菜 / a cultural note to help non-Chinese guests */}
      {dish.cultural_note_en && (
        <p className="text-xs text-[#e8dcc6]/55 leading-relaxed mt-6 border-t border-[#c9a96a]/20 pt-4">
          {dish.cultural_note_en}
        </p>
      )}
    </div>
  )
}

export default DishCard
