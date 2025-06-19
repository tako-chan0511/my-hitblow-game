import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    base: process.env.DEPLOY_TARGET === 'GH_PAGES'
    ? '/my-hitblow-game/'   // GitHub Pages 用サブパス
    : '/',                  // それ以外（Vercel のルートなど）は / に
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate', // 更新があった場合に自動でリロードする
      devOptions: {
        enabled: true // 開発モードでもPWAの動作確認を可能にする
      },
      manifest: {
        name: 'Hit&Blow', // アプリのフルネーム
        short_name: 'Hit&Blow', // ホーム画面に表示される短い名前
        description: '桁数選択Hit＆Blowゲームです。', // アプリの説明
        start_url: '.', // アプリ起動時のURL
        display: 'standalone', // アドレスバーなどを表示しないネイティブアプリのような表示
        background_color: '#ffffff', // スプラッシュ画面の背景色
        theme_color: '#007acc',      // ツールバーの色
        icons: [
          {
            src: 'icon-192x192.png', // publicディレクトリからの相対パス
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png', // publicディレクトリからの相対パス
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
    },
  },
})
