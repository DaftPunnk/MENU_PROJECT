import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// 部署到 GitHub Pages 项目站点时,资源在 /MENU_PROJECT/ 子路径下,所以 build 时要带 base;
// 本地 dev/preview 仍用根路径 '/' 方便调试。
// On GitHub Pages (a project site) assets live under /MENU_PROJECT/, so the build needs that base;
// local dev/preview stays at '/' for convenience.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/MENU_PROJECT/' : '/',
  plugins: [react(), tailwindcss()],
}))
