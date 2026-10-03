// 「帮我选」AI 接口的 Cloudflare Worker 版:扫码打开的线上页面(GitHub Pages,纯静态)调用这里。
// 核心逻辑和本地开发共用 server/recommend.js;API key 存在 Cloudflare 的 secret 里(见 HANDOVER.md)。
// The Cloudflare Worker version of the 'help me pick' endpoint, called by the live QR page (GitHub Pages,
// static only). Shares its core with local dev in server/recommend.js; the API key is a Cloudflare secret.
import { createRecommender } from '../server/recommend.js'
import * as picker from '../src/picker.js'

let recommend = null

// 只允许菜单网站本身跨域调用 / only the menu site itself may call this cross-origin
function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') ?? ''
  const allowed = (env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim())
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0] ?? '',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env)
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
    const json = (status, data) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
      })
    if (new URL(request.url).pathname !== '/api/recommend') return json(404, { error: 'Not found' })
    if (request.method !== 'POST') return json(405, { error: 'POST only' })

    recommend ??= createRecommender({
      apiKey: env.ANTHROPIC_API_KEY,
      model: env.MENU_AI_MODEL || 'claude-sonnet-5-5',
      loadPicker: async () => picker,
    })
    const readInput = async () => {
      const body = await request.text()
      if (body.length > 10_000) throw new Error('body too large')
      return JSON.parse(body || '{}')
    }
    const [status, data] = await recommend(readInput, request.headers.get('CF-Connecting-IP') ?? 'unknown')
    return json(status, data)
  },
}
