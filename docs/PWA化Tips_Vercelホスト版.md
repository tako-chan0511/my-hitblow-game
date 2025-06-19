Vue 3 + Vite アプリのPWA化 実践ガイド
このガイドでは、既存のVue 3 + Viteで作成され、Vercelにホスティングされているアプリケーションを、PWA（Progressive Web App）に対応させるための手順を説明します。

PWA化のゴール
アプリをPCのデスクトップやスマートフォンのホーム画面にインストール可能にする。
アプリのアイコンと名前を正しく表示させる。
オフラインでも基本的な動作ができるようにする。
ネイティブアプリのような全画面表示を実現する。
ステップ1: PWAプラグインの導入
ViteプロジェクトのPWA化を簡単にするためのプラグイン vite-plugin-pwa をインストールします。

sh
# ターミナルでプロジェクトのルートディレクトリに移動
npm install vite-plugin-pwa -D
ステップ2: アプリアイコンの準備
PWAとしてインストールされる際に表示されるアプリアイコンを用意します。最低でも以下の2つのサイズのPNG画像を用意し、public ディレクトリ直下に配置します。

icon-192x192.png
icon-512x512.png
フォルダ構成の例:

Code
your-project/
├── public/
│   ├── icon-192x192.png  <-- ここに配置
│   ├── icon-512x512.png  <-- ここに配置
│   └── favicon.ico       <-- 既存のファビコン
├── src/
└── vite.config.ts
ステップ3: vite.config.ts の設定
Viteの設定ファイルに、PWAプラグインの読み込みと、マニフェストファイル（アプリ情報）の設定を追記します。

【重要】この設定には、ビルドエラーを防ぐためのパスエイリアス (resolve.alias)も含まれています。

ts
// vite.config.ts

import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Vercelでルートディレクトリにデプロイする場合、baseは'/'に設定します
  base: '/', 
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true // 開発モードでもPWAの動作確認を可能にする
      },
      manifest: {
        name: 'ヒット＆ブロー',       // アプリのフルネーム
        short_name: 'Hit&Blow',        // ホーム画面に表示される短い名前
        description: '数字と色を当てるクラシックな論理ゲームです。', // アプリの説明
        start_url: '.',                // アプリ起動時のURL
        display: 'standalone',         // アドレスバーなどを表示しないネイティブアプリのような表示
        background_color: '#ffffff', // スプラッシュ画面の背景色
        theme_color: '#0ea5e9',      // ツールバーの色 (アイコンの色などに合わせる)
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
    })
  ],
  // '@'を'src'として解決するためのエイリアス設定（ビルドエラー防止）
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
ステップ4: index.html の修正
アプリの玄関口であるindex.htmlに、PWAとして認識されるためのメタ情報を追記します。特にapple-touch-iconはiOS対応のために非常に重要です。

HTML
<!-- index.html -->

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- ★★★ ここからPWA用の設定を追加 ★★★ -->

    <!-- 1. PWAのテーマカラー -->
    <meta name="theme-color" content="#0ea5e9">

    <!-- 2. Web App Manifest ファイルのリンク -->
    <link rel="manifest" href="manifest.webmanifest">
    
    <!-- 3. iOS用のアイコン設定（非常に重要） -->
    <link rel="apple-touch-icon" href="/icon-192x192.png">
    
    <!-- ★★★ 追加ここまで ★★★ -->
    
    <title>アプリのタイトル</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
ステップ5: Vercelへの正しいデプロイ方法
ここが最も重要なポイントです。 VercelはGitHubと連携し、特定のブランチへのgit pushをトリガーに自動でビルドとデプロイを行います。

やってはいけないこと:

npm run deployコマンドの実行。これは主にGitHub Pages用のコマンドであり、Vercelの仕組みとは異なります。実行するとビルドに必要なファイルが含まれないことがあります。
正しい手順:

VercelのProduction Branchを確認・設定する
Vercelのプロジェクト設定 > 「Git」設定で、「Production Branch」がmain（またはmaster）になっていることを確認します。

ソースコードを直接プッシュする
ローカルでの変更をコミットした後、**ソースコードが含まれるブランチ（mainなど）**を直接GitHubにプッシュします。

sh
git add .
git commit -m "feat: PWA対応を追加"
git push origin main
自動デプロイを待つ
Vercelがこのプッシュを検知し、自動でビルドとデプロイを開始します。完了すれば、本番URLに変更が反映されます。

Tips: よくある問題と解決策
問題: PCのChromeではアイコンが表示されるのに、iOS/iPhoneで表示されない。
原因: ほとんどの場合、iOS/Safariの強力なキャッシュが原因です。

解決策:

ホーム画面から古いアイコンを一度削除する。
iPhoneの**「設定」アプリ > 「Safari」 > 「履歴とWebサイトデータを消去」**を実行する。
再度Safariでサイトを開き、「共有」メニューから「ホーム画面に追加」を試す。
問題: デプロイ時にvite: command not foundエラーが出る。
原因: Vercelがソースコードではないブランチ（例: gh-pages）をデプロイしようとしている。

解決策: 上記ステップ5に戻り、Vercelの「Production Branch」がソースコードのあるブランチ（mainなど）に正しく設定されているか確認してください。

問題: デプロイ時にCannot find module '@/'エラーが出る。
原因: vite.config.tsにresolve.alias設定が抜けている。

解決策: 上記ステップ4のvite.config.tsを参考に、resolve.aliasを正しく設定してください。