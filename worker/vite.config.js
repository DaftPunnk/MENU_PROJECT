// 把 Worker 打包成一个文件(Vite 负责处理 picker.js 里的 JSON / import.meta.glob / 图片导入)。
// Bundles the Worker into one file (Vite handles the JSON, import.meta.glob and image imports in picker.js).
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    ssr: 'worker/index.js',
    outDir: 'worker/dist',
    emptyOutDir: true,
  },
  ssr: { target: 'webworker', noExternal: true },
})
