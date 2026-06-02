// IngredientChip 是一个"食材零件":合拢时和其它零件挤在盘子上拼成这道菜,展开时飞到上方并显出名字
// IngredientChip is one ingredient "piece" — piled with the others on the plate to form the dish when closed,
// and flown up with its label revealed when opened.

import { motion } from 'framer-motion'

// props:
//   ing                   —— 单个食材对象 / one ingredient object
//   index                 —— 错峰飞出的延迟 / stagger delay
//   isOpen                —— 菜是否已分解 / whether the dish is decomposed
//   openLeft / openTop    —— 展开后在盘子上方的落点(%) / landing spot above the plate
//   pileLeft / pileTop    —— 合拢时在盘子上的堆叠位置(%) / resting spot in the pile on the plate
function IngredientChip({ ing, index, isOpen, openLeft, openTop, pileLeft, pileTop, image }) {
  // 这个食材有没有过敏原,决定是否显示红色警告
  // Does this ingredient carry allergens? Controls the red warning.
  const hasAllergen = ing.allergens.length > 0

  return (
    <motion.div
      // 容器宽度只占图标大小,以图标中心对准落点;文字标签绝对定位在下方,不影响居中
      // The container is only as wide as the icon so it centers on the icon; labels are absolutely
      // positioned below and don't affect that centering.
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2 w-14 flex flex-col items-center"
      // animate:合拢时缩进盘子中心(看不见,由成菜图代表这道菜),展开时飞到盘子上方显形
      // animate: when closed, shrink into the plate center (hidden — the dish photo represents the dish);
      // when open, fly up above the plate and appear
      animate={{
        left: isOpen ? `${openLeft}%` : `${pileLeft}%`,
        top: isOpen ? `${openTop}%` : `${pileTop}%`,
        scale: isOpen ? 1 : 0,
        opacity: isOpen ? 1 : 0,
      }}
      // 弹簧动画 + 按 index 错峰,做出"一个接一个飞出/飞回"的效果
      // Spring animation, staggered by index for a "popping out / flying back one by one" feel
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 22,
        delay: isOpen ? index * 0.04 : 0,
      }}
    >
      {/* 圆形图标:深色底 + 金边,含过敏原时改用深中国红描边;有真实食材图就用图,否则退回 emoji */}
      {/* round icon: dark token with a gold rim (red rim if allergenic). Uses the real ingredient image if
          one is provided, otherwise falls back to the emoji. */}
      <div
        className={
          'w-14 h-14 rounded-full overflow-hidden bg-[#1b2b50] flex items-center justify-center text-2xl border shadow-md ' +
          (hasAllergen ? 'border-[#b9433b]' : 'border-[#c9a96a]/40')
        }
      >
        {image ? (
          <img src={image} alt={ing.name_en} className="w-full h-full object-contain p-0.5" />
        ) : (
          ing.emoji
        )}
      </div>

      {/* 文字标签:绝对定位在图标下方,只有展开时才淡入显示 */}
      {/* labels: absolutely positioned below the icon, fading in only when opened */}
      <motion.div
        className="absolute top-[60px] left-1/2 -translate-x-1/2 w-20 flex flex-col items-center text-center pointer-events-none"
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2, delay: isOpen ? index * 0.04 + 0.1 : 0 }}
      >
        <span className="text-[11px] font-medium leading-tight text-[#e8dcc6]">{ing.name_en}</span>
        <span className="text-[10px] text-[#c9a96a]/70 leading-tight">{ing.name_zh}</span>
        {hasAllergen && (
          <span className="mt-0.5 px-1.5 py-px rounded-full bg-[#3a1512] text-[#e6a8a2] border border-[#b9433b]/50 text-[9px] font-semibold whitespace-nowrap">
            ⚠️ {ing.allergens.join(', ')}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

export default IngredientChip
