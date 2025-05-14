import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
    base: process.env.DEPLOY_TARGET === 'GH_PAGES'
    ? '/my-hitblow-game/'   // GitHub Pages 用サブパス
    : '/',                  // それ以外（Vercel のルートなど）は / に
  plugins: [
    vue(),
    vueDevTools(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.js",
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
