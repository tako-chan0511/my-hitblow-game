<template>
  <div class="container">
    <!-- タイトル部分に title-bar を追加 -->
    <header class="app-header title-bar">
      <!-- 左：タイトル -->
      <h1>Hit & Blow</h1>

      <!-- 中央：画面切替, ユーザemail, 認証リンク -->
      <div class="header-controls">
        <!-- プレイ／履歴切替ボタン -->
        <button @click="mode = mode === 'play' ? 'history' : 'play'" class="mode-btn">
          {{ mode === 'play' ? '履歴表示' : 'プレイ表示' }}
        </button>
        <!-- 履歴表示画面でもメールを表示 -->
        <span v-if="isLoggedIn && mode === 'history'" class="user-email">
          {{ auth.user?.email }}
        </span>

        <!-- ログイン済み時：ユーザメール表示 -->
        <span v-if="isLoggedIn && mode === 'play'" class="user-email">
          {{ auth.user?.email }}
        </span>

        <!-- 未ログイン時：ログイン・登録リンク -->
        <router-link
          v-if="!isLoggedIn"
          to="/login"
          class="auth-btn"
        >ログイン</router-link>
        <router-link
          v-if="!isLoggedIn"
          to="/register"
          class="auth-btn"
        >登録</router-link>

        <!-- ログイン済み & プレイモード時：ログアウトボタン -->
        <button
          v-if="isLoggedIn && mode === 'play'"
          @click="onLogout"
          class="auth-btn"
        >ログアウト</button>
      </div>

      <!-- 右：テーマ切替 -->
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? 'ライト' : 'ダーク' }}モード
      </button>
    </header>

    <!-- ゲーム部分を囲む main に game-area を追加 -->
    <main class="game-area">
      <!-- プレイモード：ゲーム画面 -->
      <router-view v-if="mode === 'play'" @show-candidates="show = true" />
      <!-- 履歴モード：完了ゲーム履歴を表示 -->
      <HistoryList
        v-else
        :completed="true"
        @show-candidates="show = true"
      />

      <!-- 候補リストモーダル -->
      <CandidateList v-if="show" @close="show = false" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';
import { useAuthStore } from '@/stores/auth';
import HistoryList from '@/components/HistoryList.vue';
import CandidateList from '@/components/CandidateList.vue';

const settings = useSettingsStore();
const auth = useAuthStore();
const router = useRouter();

// モーダル表示制御
const show = ref(false);

// テーマ制御
const isDark = computed(() => settings.theme === 'dark');
onMounted(() => applyTheme(settings.theme));
watch(() => settings.theme, applyTheme);
function toggleTheme() {
  settings.toggleTheme();
}
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}

// 認証状態とユーザ情報取得
const isLoggedIn = computed(() => !!auth.token);
onMounted(async () => {
  if (auth.token && !auth.user) {
    await auth.fetchProfile();
  }
});

// ログアウト処理
function onLogout() {
  auth.logout();
  router.push('/login');
}

// 表示モード
const mode = ref<'play' | 'history'>('play');
</script>

<style scoped>
/* カスタムプロパティ（既存分＋追加） */
:root {
  --accent-color: #ff9900;
  --bg-light: #f9f9f9;
  --primary-light: #e0e7ff; /* 薄めのライトブルー */
  --header-text: #1f2937;   /* コントラストの高いダークグレー */
}

/* タイトル部分の色分け & ボーダー調整 */
.title-bar {
  background-color: var(--primary-light);
  border-bottom: 1px solid var(--accent-color);
}
.title-bar h1 {
  /* テキストをダークグレーにして視認性アップ */
  color: var(--header-text);
}

/* ゲーム部分を囲うエリアの区別 */
.game-area {
  background-color: var(--bg-light);
  border-top: 2px dashed var(--accent-color);
  padding: 16px;
}

/* 既存のヘッダー／ボタン等のスタイル */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}
.mode-btn,
.auth-btn,
.theme-toggle {
  padding: 6px 12px;
  font-size: 14px;
  background: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}
.mode-btn:hover,
.auth-btn:hover,
.theme-toggle:hover {
  opacity: 0.8;
}
.user-email {
  font-size: 14px;
  color: var(--text-color);
  margin: 0 8px;
}
</style>
