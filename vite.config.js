import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createRecommendHandler } from './server/recommend.js'

// 「帮我选」AI 接口(仅本地开发 / 预览服务器上有):把 /api/recommend 挂到 Vite 服务器上。
// key 从 .env.local 的 ANTHROPIC_API_KEY 读取,只在服务器端使用;静态部署(GitHub Pages)没有这个接口,页面会自动退回规则推荐。
// The 'help me pick' AI endpoint (local dev / preview server only): mounts /api/recommend on the Vite server.
// The key comes from ANTHROPIC_API_KEY in .env.local and is used server-side only; static hosting (GitHub
// Pages) has no such endpoint, so the page falls back to rule-based suggestions.
function aiRecommend(env) {
  const options = (server) => ({
    apiKey: env.ANTHROPIC_API_KEY,
    model: env.MENU_AI_MODEL || 'claude-sonnet-5-5',
    // 由 Vite 加载 picker.js(它用到 import.meta.glob) / let Vite load picker.js (it uses import.meta.glob)
    loadPicker: () => server.ssrLoadModule('/src/picker.js'),
  })
  return {
    name: 'ai-recommend',
    configureServer(server) {
      server.middlewares.use('/api/recommend', createRecommendHandler(options(server)))
    },
  }
}

// https://vite.dev/config/
// 部署到 GitHub Pages 项目站点时,资源在 /MENU_PROJECT/ 子路径下,所以 build 时要带 base;
// 本地 dev/preview 仍用根路径 '/' 方便调试。
// On GitHub Pages (a project site) assets live under /MENU_PROJECT/, so the build needs that base;
// local dev/preview stays at '/' for convenience.
// 部署到别处时用环境变量 VITE_BASE 覆盖,不用改代码(见 HANDOVER.md),例如 VITE_BASE=/menu/ npm run build
// To deploy elsewhere, override with the VITE_BASE env var instead of editing code (see HANDOVER.md),
// e.g. VITE_BASE=/menu/ npm run build
export default defineConfig(({ command, mode }) => {
  // 第三个参数 '' = 读取所有变量(不只是 VITE_ 开头的);这些只在这里(Node 端)用,不会打包进网页
  // '' as the prefix loads every variable (not just VITE_*); they're used here on the Node side only, never bundled
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: process.env.VITE_BASE || (command === 'build' ? '/MENU_PROJECT/' : '/'),
    plugins: [react(), tailwindcss(), aiRecommend(env)],
  }
})
