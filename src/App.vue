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

    <!-- 入力・結果・履歴 -->
    <GuessInput />
    <ResultMessage />
    <HistoryList />

    <!-- 残り候補ボタン -->
    <button class="show-cands" @click="show = true">サポート機能</button>
    <button class="reset" @click="store.reset()">再スタート</button>
    <CandidateList v-if="show" @close="show = false" />

    <!-- プレイ履歴表示トグル -->
    <button class="history-btn" @click="showHistory = !showHistory">
      {{ showHistory ? '履歴を閉じる' : 'プレイ履歴を表示' }}
    </button>

    <!-- プレイ履歴コンポーネント -->
    <ResultHistory v-if="showHistory" />
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
import ResultHistory from '@/components/ResultHistory.vue';

// ストア取得
const store = useGameStore() as GameStore;
const settings = useSettingsStore();

// 表示制御
const show = ref(false);
const showHistory = ref(false);
const digitCount = ref(store.digitCount);

// テーマ判定
const isDark = computed(() => settings.theme === 'dark');

// 初回適用
onMounted(() => applyTheme(settings.theme));

// 監視
watch(() => settings.theme, theme => applyTheme(theme));

// ハンドラ
function onDigitCountChange() {
  store.setDigitCount(digitCount.value);
}
function toggleTheme() {
  settings.toggleTheme();
}
function applyTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
}
</script>

<style>
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
.theme-toggle:hover { opacity: 0.8; }
.digit-select { margin-bottom: 16px; }
.digit-select label { margin-right: 8px; font-weight: bold; }
.digit-select select { padding: 4px 8px; font-size: 16px; }
.show-cands, .reset, .history-btn {
  margin-top: 20px;
  padding: 8px 16px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.show-cands { background-color: #007bff; color: #fff; }
.show-cands:hover { background-color: #0056b3; }
.reset { background-color: var(--primary-color); color: var(--bg-color); }
.history-btn { background-color: var(--primary-color); color: var(--bg-color); }
.history-btn:hover { opacity: 0.8; }
</style>
