import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  // ★★★ 修正点①: Vercel用の設定に統一 ★★★
  // 条件分岐をなくし、常にルートディレクトリを基準にする
  base: '/',

  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      // ★★★ 修正点②: アプリ情報を正確に記述 ★★★
      manifest: {
        name: 'Hit & Blow Game', // アプリの正式名称
        short_name: 'Hit&Blow',   // ホーム画面に表示される短い名前
        description: '数字と色を当てるクラシックな論理ゲームです。', // アプリの説明
        start_url: '.',
        display: 'standalone',
        background_color: '#f3f4f6', // 背景色を少しグレーに
        theme_color: '#0ea5e9',      // テーマカラーをアイコンに合わせて変更
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    }),
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
    }
  }
})
