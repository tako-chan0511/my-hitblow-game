import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  // 開発時は base '/'、本番ビルド時のみ '/my-hitblow-game/' を適用
  base: mode === 'production' ? '/my-hitblow-game/' : '/',

  plugins: [
    vue(),
    vueDevTools(),
  ],

  // API プロキシ設定
  server: {
    proxy: {
      // /api/** のリクエストをバックエンドに転送
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },

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
}))
