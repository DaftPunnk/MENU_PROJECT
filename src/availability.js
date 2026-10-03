// 限时品项:价目单里的品项可以写 "limited": true(显示「限定」标签)和 "until": "YYYY-MM-DD"(最后供应日,含当天)。
// 过了 until 那天(按奥克兰时间)自动从菜单上消失,也不会再被推荐,不用改代码、不用重新部署。
// Limited-time items: a price-list item may carry "limited": true (shows a "limited" tag) and "until": "YYYY-MM-DD"
// (last day served, inclusive). After that day (Auckland time) it drops off the menu and out of the
// recommendations automatically — no code change or redeploy needed.

// 今天的奥克兰日期,YYYY-MM-DD / today's date in Auckland as YYYY-MM-DD
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland' }).format(new Date())

export const isAvailable = (item) => !item.until || today() <= item.until

// 去掉已过期的品项(以及因此变空的分组、分类) / drop expired items, and any group or section left empty
export function withoutExpired(menu) {
  const sections = menu.sections
    .map((sec) => ({
      ...sec,
      groups: sec.groups
        .map((g) => ({ ...g, items: g.items.filter(isAvailable) }))
        .filter((g) => g.items.length),
    }))
    .filter((sec) => sec.groups.length)
  return { ...menu, sections }
}
