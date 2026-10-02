// 菜单上的过敏原标记 D/G/N/S/V(照抄纸质菜单):价目行里显示成小字母徽章,详情页显示完整中英文。
// The printed menu's allergen markers D/G/N/S/V — tiny letter badges in the list rows, spelled out in the detail view.

const CODES = {
  D: { zh: '含乳制品', en: 'Dairy' },
  G: { zh: '含麸质', en: 'Gluten' },
  N: { zh: '含坚果', en: 'Nuts' },
  S: { zh: '含海鲜', en: 'Seafood' },
  V: { zh: '可做素食', en: 'Vegetarian option' },
}

// V 是"可做素食"不是过敏原,用绿色;其余用暗红 / V is a dietary option, not an allergen — green; the rest dark red
const badgeClass = (code) =>
  code === 'V'
    ? 'border-[#6f9a6a]/60 text-[#a9c9a2]'
    : 'border-[#b9433b]/60 text-[#e6a8a2] bg-[#3a1512]/60'

// full = true 时显示完整名称(详情页) / full spells each code out (detail view)
export function CodeBadges({ codes, full = false }) {
  if (!codes?.length) return null
  return (
    <span className={'inline-flex flex-wrap gap-1 ' + (full ? 'justify-center' : 'align-middle')}>
      {codes.map((c) => (
        <span
          key={c}
          title={CODES[c] ? `${CODES[c].zh} · ${CODES[c].en}` : c}
          className={
            'border rounded-full leading-none whitespace-nowrap ' +
            (full ? 'text-[11px] px-2 py-1' : 'text-[9px] px-1 py-0.5 font-semibold') +
            ' ' + badgeClass(c)
          }
        >
          {full && CODES[c] ? `${CODES[c].zh} · ${CODES[c].en}` : c}
        </span>
      ))}
    </span>
  )
}

// 图例(列表底部) / the legend under the list
export function CodeLegend() {
  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-6 text-[10px] text-[#e8dcc6]/50">
      {Object.entries(CODES).map(([c, { zh, en }]) => (
        <span key={c} className="whitespace-nowrap">
          <CodeBadges codes={[c]} /> {zh} {en}
        </span>
      ))}
    </div>
  )
}
