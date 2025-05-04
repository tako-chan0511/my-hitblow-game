<template>
  <div class="container">
    <header class="app-header">
      <h1>Hit & Blow ({{ store.digitCount }}桁)</h1>
      <!-- ダーク／ライトモード切替ボタン -->
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>

    <p>{{ store.digitCount }}桁の数字を当ててください（各桁異なる）</p>

    <!-- 桁数選択 -->
    <div class="digit-select">
      <label for="digitCount">桁数:</label>
      <select id="digitCount" v-model.number="digitCount" @change="onDigitCountChange">
        <option v-for="n in 10" :key="n" :value="n">{{ n }}桁</option>
      </select>
    </div>

    <GuessInput />
    <ResultMessage />
    <HistoryList />

    <!-- 残り候補表示ボタン -->
    <button class="show-cands" @click="show = true">
      残り候補を表示
    </button>

    <button class="reset" @click="store.reset()">再スタート</button>

    <!-- モーダルで候補リストを出す -->
    <CandidateList v-if="show" @close="show = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameStore } from '@/stores/game';
import { useSettingsStore } from '@/stores/settings';
import CandidateList from '@/components/CandidateList.vue';
import GuessInput from '@/components/GuessInput.vue';
import ResultMessage from '@/components/ResultMessage.vue';
import HistoryList from '@/components/HistoryList.vue';

// ゲームストアを取得
const store = useGameStore() as GameStore;
// 設定ストアを取得
const settings = useSettingsStore();

// モーダル表示制御
const show = ref(false);
// 桁数選択用のローカル ref
const digitCount = ref(store.digitCount);

// テーマ判定
const isDark = computed(() => settings.theme === 'dark');

// 初回マウント時にテーマ適用
onMounted(() => {
  applyTheme(settings.theme);
});

// テーマ変更を監視して適用
watch(
  () => settings.theme,
  (newTheme) => applyTheme(newTheme)
);

// 桁数変更時ハンドラ
function onDigitCountChange() {
  store.setDigitCount(digitCount.value);
}

// トグル用メソッド
function toggleTheme() {
  settings.toggleTheme();
}

// テーマ適用ユーティリティ
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}
</script>

<style>
/* テーマ用カラー変数の定義 */
:root {
  --bg-color: #ffffff;
  --text-color: #333333;
  --primary-color: #4f46e5;
}
[data-theme="dark"] {
  --bg-color: #1f2937;
  --text-color: #f9fafb;
  --primary-color: #818cf8;
}

/* 全体の背景と文字色に反映 */
body {
  background-color: var(--bg-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.container {
  text-align: center;
  padding: 20px;
  background-color: var(--bg-color);
  color: var(--text-color);
  min-height: 100vh;
}
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.theme-toggle {
  padding: 6px 12px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: var(--primary-color);
  color: var(--text-color);
  cursor: pointer;
}
.theme-toggle:hover {
  opacity: 0.8;
}
.digit-select {
  margin-bottom: 16px;
}
.digit-select label {
  margin-right: 8px;
  font-weight: bold;
}
.digit-select select {
  padding: 4px 8px;
  font-size: 16px;
}
.show-cands {
  margin: 10px 8px;
  padding: 6px 14px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.show-cands:hover {
  background-color: #0056b3;
}
.reset {
  margin-top: 20px;
  padding: 5px 12px;
  font-size: 16px;
}
</style>
