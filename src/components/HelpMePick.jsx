// HelpMePick 是「AI Test」版右下角的"帮我选":浮动按钮 → 底部弹出面板,选口味、人数、忌口,再写一句想法,
// 由 AI 推荐一桌菜(服务器端 /api/recommend,见 server/recommend.js)。AI 不可用时(比如静态部署没有后端)自动退回规则推荐。
// 忌口过滤始终由代码完成,AI 只能从过滤后的菜里挑。
// HelpMePick is the 'help me pick' corner button of the AI Test mode — a bottom sheet where the guest picks a
// mood, party size, things to avoid and writes a line about what they fancy; the AI suggests a meal via
// /api/recommend (server/recommend.js). If the AI isn't available (e.g. static hosting has no backend) it
// falls back to the rule-based suggestions. Allergen filtering is always done in code — the AI only picks
// from what's left.

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AVOID, DRINK_PREFS, MOODS, PARTY, fromAi, recommend } from '../picker'
import { dishById } from '../menu'
import { names, pick, t, useLang } from '../i18n'
import { CodeBadges } from './MenuCodes'

// AI 接口地址:线上(GitHub Pages)构建时由 VITE_AI_URL 指向 Cloudflare Worker;本地开发用 Vite 自带的接口
// AI endpoint: the live (GitHub Pages) build points VITE_AI_URL at the Cloudflare Worker; local dev uses Vite's own
const AI_URL = import.meta.env.VITE_AI_URL || '/api/recommend'

const STR = {
  button: { zh: '✨ 帮我选', en: '✨ Help me pick', fr: '✨ Aidez-moi à choisir' },
  title: { zh: '帮我选', en: 'Help me pick', fr: 'Aidez-moi à choisir' },
  mood: { zh: '今天想吃点什么？', en: 'What are you in the mood for today?', fr: "Qu'est-ce qui vous ferait envie aujourd'hui ?" },
  party: { zh: '几位用餐？', en: 'How many people?', fr: 'Combien de personnes ?' },
  avoid: { zh: '有什么不吃的吗？', en: 'Anything to avoid?', fr: 'Quelque chose à éviter ?' },
  avoidNote: {
    zh: '其他过敏（如鸡蛋、芝麻、大豆）请直接告诉服务员。',
    en: 'For other allergies (e.g. egg, sesame, soy), please tell your server.',
    fr: 'Pour toute autre allergie (œuf, sésame, soja…), merci de prévenir votre serveur.',
  },
  go: { zh: '看看推荐', en: 'Show suggestions', fr: 'Voir les suggestions' },
  update: { zh: '更新推荐', en: 'Update suggestions', fr: 'Mettre à jour' },
  note: { zh: '还有什么想说的？（可选）', en: 'Anything else? (optional)', fr: 'Autre chose ? (facultatif)' },
  notePh: {
    zh: '比如：第一次来、想吃点暖胃的、今天在庆祝生日…',
    en: "e.g. first time here, something warming, we're celebrating a birthday…",
    fr: 'ex. première visite, quelque chose de réconfortant, on fête un anniversaire…',
  },
  thinking: { zh: '正在为你挑选…', en: 'Picking dishes for you…', fr: 'Nous choisissons pour vous…' },
  aiDown: {
    zh: 'AI 暂时不可用，以下是基础推荐。',
    en: 'AI is unavailable right now — here are our standard suggestions.',
    fr: "L'IA n'est pas disponible pour le moment — voici nos suggestions habituelles.",
  },
  shuffle: { zh: '换一批', en: 'Shuffle', fr: 'Autres idées' },
  result: { zh: '为你推荐', en: 'Suggested for you', fr: 'Nos suggestions' },
  excluded: { zh: '已为你排除 {n} 道不合适的菜', en: '{n} dishes left out to suit you', fr: '{n} plats écartés pour vous' },
  total: { zh: '菜品约', en: 'Food about', fr: 'Plats, environ' },
  drinkTotal: { zh: '酒水约', en: 'Drinks about', fr: 'Boissons, environ' },
  drink: { zh: '想喝点什么？', en: 'Anything to drink?', fr: 'Que souhaitez-vous boire ?' },
  pairing: { zh: '酒水搭配', en: 'Drink pairing', fr: 'Accords boissons' },
  r18: {
    zh: '酒精饮品仅供应 18 岁以上客人。',
    en: 'Alcohol is served to guests aged 18 and over only.',
    fr: "L'alcool n'est servi qu'aux personnes de 18 ans et plus.",
  },
  short: {
    zh: '符合条件的菜不多，建议和服务员聊聊，厨房也许可以调整。',
    en: "Not many dishes fit — have a chat with your server, the kitchen may be able to adapt something.",
    fr: "Peu de plats correspondent — parlez-en à votre serveur, la cuisine pourra peut-être adapter un plat.",
  },
  setMenu: { zh: '第一次来？也可以考虑套餐：', en: 'First visit? Consider a set menu:', fr: 'Première visite ? Pensez à nos menus :' },
  disclaimer: {
    zh: '推荐仅供参考，过敏信息请务必向服务员确认。',
    en: 'Suggestions only — please confirm any allergies with your server.',
    fr: 'Simples suggestions — merci de confirmer toute allergie auprès de votre serveur.',
  },
  close: { zh: '关闭', en: 'Close', fr: 'Fermer' },
}
const MOOD_LABEL = {
  light: { zh: '清淡', en: 'Light & fresh', fr: 'Léger' },
  bold: { zh: '浓郁重口', en: 'Rich & bold', fr: 'Riche & intense' },
  spicy: { zh: '想吃辣', en: 'Spicy', fr: 'Épicé' },
  seafood: { zh: '海鲜', en: 'Seafood', fr: 'Fruits de mer' },
  meat: { zh: '肉', en: 'Meat', fr: 'Viande' },
  veg: { zh: '多点蔬菜', en: 'Veggie-forward', fr: 'Plutôt légumes' },
  signature: { zh: '招牌菜', en: 'Signatures', fr: 'Plats signature' },
  adventurous: { zh: '想尝鲜', en: 'Adventurous', fr: 'Aventureux' },
}
const DRINK_LABEL = {
  wine: { zh: '葡萄酒', en: 'Wine', fr: 'Vin' },
  cocktail: { zh: '鸡尾酒', en: 'Cocktails', fr: 'Cocktails' },
  beer: { zh: '啤酒', en: 'Beer', fr: 'Bière' },
  tea: { zh: '茶', en: 'Tea', fr: 'Thé' },
  alcohol_free: { zh: '无酒精', en: 'Alcohol-free', fr: 'Sans alcool' },
  no_drinks: { zh: '不用了', en: 'No drinks', fr: 'Pas de boisson' },
}
// 选"不用了"就清掉其他;选其他就去掉"不用了" / "no drinks" clears the rest, and anything else clears "no drinks"
const toggleDrink = (list, v) =>
  v === 'no_drinks'
    ? list.includes(v)
      ? []
      : [v]
    : toggle(
        list.filter((x) => x !== 'no_drinks'),
        v,
      )
const AVOID_LABEL = {
  nuts: { zh: '坚果', en: 'Nuts', fr: 'Fruits à coque' },
  seafood: { zh: '海鲜', en: 'Seafood', fr: 'Produits de la mer' },
  gluten: { zh: '麸质', en: 'Gluten', fr: 'Gluten' },
  dairy: { zh: '乳制品', en: 'Dairy', fr: 'Lait' },
  vegetarian: { zh: '只吃素', en: 'Vegetarian', fr: 'Végétarien' },
  spicy: { zh: '不吃辣', en: 'Not spicy', fr: 'Pas épicé' },
}
const COURSE_LABEL = {
  starter: { zh: '前菜', en: 'Starter', fr: 'Entrée' },
  dim_sum: { zh: '点心', en: 'Dim sum', fr: 'Dim sum' },
  main: { zh: '主菜', en: 'Main', fr: 'Plat' },
  veg: { zh: '蔬菜', en: 'Greens', fr: 'Légumes' },
  rice: { zh: '饭面', en: 'Rice & noodles', fr: 'Riz & nouilles' },
  dessert: { zh: '甜品', en: 'Dessert', fr: 'Dessert' },
}
const PARTY_LABEL = { 1: '1', 2: '2', '3-4': '3–4', '5+': '5+' }

// 可多选的小圆角标签 / a toggleable chip
function Chip({ on, onClick, children, tone = 'gold' }) {
  const onClass =
    tone === 'red'
      ? 'bg-[#3a1512] border-[#b9433b] text-[#e6a8a2]'
      : 'bg-[#c9a96a] border-[#c9a96a] text-[#14234a]'
  return (
    <button
      onClick={onClick}
      className={
        'px-3 py-1.5 rounded-full border text-xs transition ' +
        (on ? onClass : 'border-[#c9a96a]/40 text-[#e8dcc6]/80 hover:border-[#c9a96a]')
      }
    >
      {children}
    </button>
  )
}

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

function HelpMePick({ hidden, onSelectDish }) {
  const lang = useLang()
  const s = (k) => STR[k][lang]
  const [open, setOpen] = useState(false)
  const [moods, setMoods] = useState([])
  const [party, setParty] = useState('2')
  const [avoid, setAvoid] = useState([])
  const [drinkPrefs, setDrinkPrefs] = useState([])
  const [note, setNote] = useState('')
  // result:最近一次推荐;asked:那次用的选项(选项改了就显示"更新推荐") / the latest result and the options it was asked with
  const [result, setResult] = useState(null)
  const [asked, setAsked] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aiDown, setAiDown] = useState(false)
  const seed = useRef(0)

  const query = { moods, party, avoid, drinkPrefs, note: note.trim() }
  const dirty = asked && JSON.stringify(asked) !== JSON.stringify(query)

  // 向 AI 要推荐;失败就用规则推荐 / ask the AI; on any failure use the rule-based suggestions
  async function ask(previous = []) {
    const q = query
    setLoading(true)
    setAsked(q)
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 30_000)
      const res = await fetch(AI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...q, lang, previous }),
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ai = fromAi(await res.json(), q)
      // AI 一道都没给(或都被校验掉了)也退回规则 / no usable AI picks → rules
      if (!ai.picks.length) throw new Error('no picks')
      setResult(ai)
      setAiDown(false)
    } catch {
      seed.current += 1
      setResult(recommend({ ...q, seed: previous.length ? seed.current : 0 }))
      setAiDown(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* 右下角浮动按钮 / floating corner button */}
      <AnimatePresence>
        {!hidden && !open && (
          <motion.button
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 right-4 z-40 px-4 py-2.5 rounded-full bg-[#c9a96a] text-[#14234a] text-sm font-medium
                       shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
          >
            {s('button')}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 底部弹出面板 / the bottom sheet */}
      <AnimatePresence>
        {open && !hidden && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="dialog"
              aria-label={s('title')}
              className="fixed bottom-0 inset-x-0 z-50 mx-auto max-w-md max-h-[85vh] overflow-y-auto rounded-t-2xl
                         bg-[#14234a] border-t border-[#c9a96a]/40 px-4 pt-4 pb-8 text-[#e8dcc6]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-serif text-[#c9a96a]">✨ {s('title')}</h2>
                <button onClick={() => setOpen(false)} aria-label={s('close')} className="text-[#c9a96a]/80 text-xl px-2">
                  ×
                </button>
              </div>

              {/* 口味 / mood */}
              <p className="text-sm mb-2">{s('mood')}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {MOODS.map((m) => (
                  <Chip key={m} on={moods.includes(m)} onClick={() => setMoods(toggle(moods, m))}>
                    {MOOD_LABEL[m][lang]}
                  </Chip>
                ))}
              </div>

              {/* 人数 / party size */}
              <p className="text-sm mb-2">{s('party')}</p>
              <div className="flex gap-2 mb-4">
                {PARTY.map((p) => (
                  <Chip key={p} on={party === p} onClick={() => setParty(p)}>
                    <span className="px-1.5">{PARTY_LABEL[p]}</span>
                  </Chip>
                ))}
              </div>

              {/* 忌口 / avoid */}
              <p className="text-sm mb-2">{s('avoid')}</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(AVOID).map((k) => (
                  <Chip key={k} tone="red" on={avoid.includes(k)} onClick={() => setAvoid(toggle(avoid, k))}>
                    {AVOID_LABEL[k][lang]}
                  </Chip>
                ))}
              </div>
              <p className="text-[11px] text-[#e8dcc6]/50 mt-2">{s('avoidNote')}</p>

              {/* 酒水偏好 / drink preferences */}
              <p className="text-sm mt-4 mb-2">{s('drink')}</p>
              <div className="flex flex-wrap gap-2">
                {DRINK_PREFS.map((d) => (
                  <Chip key={d} on={drinkPrefs.includes(d)} onClick={() => setDrinkPrefs(toggleDrink(drinkPrefs, d))}>
                    {DRINK_LABEL[d][lang]}
                  </Chip>
                ))}
              </div>

              {/* 客人的一句话(交给 AI 当口味偏好) / the guest's own words (passed to the AI as preferences) */}
              <p className="text-sm mt-4 mb-2">{s('note')}</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
                rows={2}
                placeholder={s('notePh')}
                className="w-full rounded-xl bg-[#1b2b50] border border-[#c9a96a]/30 focus:border-[#c9a96a] outline-none
                           px-3 py-2 text-sm text-[#e8dcc6] placeholder:text-[#e8dcc6]/30 resize-none"
              />

              {(!result || dirty) && (
                <button
                  onClick={() => ask()}
                  disabled={loading}
                  className="w-full mt-4 py-3 rounded-full bg-[#c9a96a] text-[#14234a] font-medium disabled:opacity-60"
                >
                  {loading ? s('thinking') : s(result ? 'update' : 'go')}
                </button>
              )}

              {result && (
                <div className={'mt-5 border-t border-[#c9a96a]/20 pt-4 transition ' + (loading ? 'opacity-40' : '')}>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#c9a96a]">{s('result')}</h3>
                    <button
                      onClick={() => ask(result.picks.map((p) => p.c.item.name))}
                      disabled={loading}
                      className="text-xs text-[#c9a96a] border border-[#c9a96a]/50 rounded-full px-3 py-1 disabled:opacity-60"
                    >
                      {loading && !dirty ? s('thinking') : '↻ ' + s('shuffle')}
                    </button>
                  </div>
                  {aiDown && <p className="text-[11px] text-[#e6a8a2] mb-2">{s('aiDown')}</p>}
                  {result.message && <p className="text-sm italic text-[#e8dcc6]/80 my-2">{result.message}</p>}
                  {result.excluded > 0 && (
                    <p className="text-[11px] text-[#e8dcc6]/50 mb-2">{s('excluded').replace('{n}', result.excluded)}</p>
                  )}

                  <ul>
                    {result.picks.map(({ c, reasons, aiReason, price, label }) => {
                      const n = names(c.item, lang)
                      const linked = c.dish
                      const row = (
                        <>
                          <span className="flex flex-col min-w-0">
                            <span className="text-[10px] text-[#c9a96a]/70">{COURSE_LABEL[c.course][lang]}</span>
                            <span className="text-sm leading-snug">
                              {n.primary}
                              <span className="ml-1.5">
                                <CodeBadges codes={c.item.codes} />
                              </span>
                            </span>
                            {n.ref && <span className="text-xs text-[#e8dcc6]/60 leading-snug">{n.ref}</span>}
                            {aiReason && <span className="text-xs text-[#c9a96a]/90 leading-snug mt-0.5">{aiReason}</span>}
                            {(reasons.length > 0 || linked) && (
                              <span className="flex flex-wrap gap-1 mt-1">
                                {reasons.map((r) => (
                                  <span key={r} className="text-[10px] text-[#c9a96a]/90 bg-[#c9a96a]/10 rounded-full px-1.5 py-px">
                                    {MOOD_LABEL[r][lang]}
                                  </span>
                                ))}
                                {linked && (
                                  <span className="text-[10px] text-[#c9a96a] border border-[#c9a96a]/50 rounded-full px-1.5 py-px">
                                    {t('ingredients', lang)}
                                  </span>
                                )}
                              </span>
                            )}
                          </span>
                          <span className="text-sm text-[#c9a96a] shrink-0 text-right">
                            {label && <span className="text-[10px] text-[#c9a96a]/60 mr-1">{label}</span>}
                            {price}
                          </span>
                        </>
                      )
                      return (
                        <li key={c.item.name} className="border-t border-[#c9a96a]/10 first:border-t-0">
                          {linked ? (
                            <button
                              onClick={() => {
                                setOpen(false)
                                onSelectDish({ ...linked, codes: c.item.codes })
                              }}
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

                  {/* 酒水搭配:酒名照菜单原样,不翻译 / drink pairing — drink names exactly as on the menu */}
                  {result.drinks.length > 0 && (
                    <>
                      <h3 className="text-[11px] tracking-[0.2em] uppercase text-[#c9a96a] mt-4 mb-1">{s('pairing')}</h3>
                      <ul>
                        {result.drinks.map(({ d, aiReason, price, label }) => {
                          const linked = d.item.dish && dishById[d.item.dish]
                          const kind = [pick(d.group.name_en ? d.group : d.section, 'name', lang), d.item.detail]
                            .filter(Boolean)
                            .join(' · ')
                          const row = (
                            <>
                              <span className="flex flex-col min-w-0">
                                <span className="text-[10px] text-[#c9a96a]/70">{kind}</span>
                                <span className="text-sm leading-snug">{d.item.name}</span>
                                {aiReason && (
                                  <span className="text-xs text-[#c9a96a]/90 leading-snug mt-0.5">{aiReason}</span>
                                )}
                                {linked && (
                                  <span className="mt-1">
                                    <span className="text-[10px] text-[#c9a96a] border border-[#c9a96a]/50 rounded-full px-1.5 py-px">
                                      {t('ingredients', lang)}
                                    </span>
                                  </span>
                                )}
                              </span>
                              <span className="text-sm text-[#c9a96a] shrink-0 text-right">
                                {label && <span className="text-[10px] text-[#c9a96a]/60 mr-1">{label}</span>}
                                {price}
                              </span>
                            </>
                          )
                          return (
                            <li key={d.id} className="border-t border-[#c9a96a]/10 first:border-t-0">
                              {linked ? (
                                <button
                                  onClick={() => {
                                    setOpen(false)
                                    onSelectDish(linked)
                                  }}
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
                    </>
                  )}

                  {result.picks.length > 0 && (
                    <p className="text-right text-sm text-[#c9a96a] mt-2">
                      {s('total')} ${result.total}
                      {result.drinks.length > 0 && (
                        <span>
                          {' · '}
                          {s('drinkTotal')} ${result.drinkTotal}
                        </span>
                      )}
                    </p>
                  )}
                  {result.drinks.some((x) => !['conscious_curations', 'tea', 'soft_drinks'].includes(x.d.section.id)) && (
                    <p className="text-[11px] text-[#e8dcc6]/50 mt-1 text-right">{s('r18')}</p>
                  )}
                  {result.short && <p className="text-xs text-[#e6a8a2] mt-3">{s('short')}</p>}

                  {result.setMenus.length > 0 && (
                    <div className="mt-4 rounded-xl border border-[#c9a96a]/30 p-3">
                      <p className="text-xs text-[#c9a96a] mb-1">{s('setMenu')}</p>
                      {result.setMenus.map((sec) => (
                        <p key={sec.id} className="text-xs text-[#e8dcc6]/80 leading-relaxed">
                          {sec.emoji} {pick(sec, 'name', lang)} — {pick(sec, 'note', lang)}
                        </p>
                      ))}
                    </div>
                  )}

                  <p className="text-[11px] text-[#e8dcc6]/50 mt-4">⚠️ {s('disclaimer')}</p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default HelpMePick
