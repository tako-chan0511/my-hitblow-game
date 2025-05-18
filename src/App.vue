<template>
  <div class="container">
    <header class="app-header">
      <h1>Hit & Blow ({{ store.digitCount }}桁)</h1>
      <!-- ダーク／ライトモード切替 -->
      <button @click="toggleTheme" class="theme-toggle">
        {{ isDark ? 'ライトモード' : 'ダークモード' }}
      </button>
    </header>

    <!-- モード切替ボタン -->
    <div class="mode-select">
      <button
        :class="{ active: mode === 'practice' }"
        @click="mode = 'practice'"
      >
        練習モード
      </button>
      <button
        :class="{ active: mode === 'versus' }"
        @click="mode = 'versus'"
      >
        対コンピュータモード
      </button>
    </div>

    <!-- 桁数選択（共通） -->
    <div class="digit-select">
      <label for="digitCount">桁数:</label>
      <select id="digitCount" v-model.number="digitCount" @change="onDigitCountChange">
        <option v-for="n in 10" :key="n" :value="n">{{ n }}桁</option>
      </select>
    </div>

    <!-- 練習モード -->
    <template v-if="mode === 'practice'">
      <p>{{ store.digitCount }}桁の数字を当ててください（各桁異なる）</p>
      <GuessInput />
      <ResultMessage />
      <HistoryList />

      <!-- サポート機能（候補表示） -->
      <button class="show-cands" @click="show = true">サポート機能</button>
      <button class="reset" @click="store.reset()">再スタート</button>
      <CandidateList v-if="show" @close="show = false" />
    </template>

    <!-- 対コンピュータモード -->
    <template v-else>
      <VsComputer />
    </template>

    <!-- プレイ履歴トグル（練習モードのみ） -->
    <template v-if="mode === 'practice'">
      <button class="history-btn" @click="showHistory = !showHistory">
        {{ showHistory ? '履歴を閉じる' : 'プレイ履歴を表示' }}
      </button>
      <ResultHistory v-if="showHistory" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameStore } from '@/stores/game';
import { useSettingsStore } from '@/stores/settings';

// 練習用コンポーネント
import CandidateList from '@/components/CandidateList.vue';
import GuessInput from '@/components/GuessInput.vue';
import ResultMessage from '@/components/ResultMessage.vue';
import HistoryList from '@/components/HistoryList.vue';
import ResultHistory from '@/components/ResultHistory.vue';

// 対コンピュータモード用コンポーネント
import VsComputer from '@/components/VsComputer.vue';

// ストア取得
const store = useGameStore() as GameStore;
const settings = useSettingsStore();

// モード管理：'practice' or 'versus'
const mode = ref<'practice' | 'versus'>('practice');

// サポート機能モーダル表示
const show = ref(false);

// プレイ履歴表示
const showHistory = ref(false);

// 桁数
const digitCount = ref(store.digitCount);

// ダーク／ライト
const isDark = computed(() => settings.theme === 'dark');
onMounted(() => applyTheme(settings.theme));
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

/* モード切替 */
.mode-select {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}
.mode-select button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}
.mode-select button.active {
  background-color: var(--primary-color);
  color: var(--bg-color);
}

/* 桁数選択 */
.digit-select { margin-bottom: 16px; }
.digit-select label { margin-right: 8px; font-weight: bold; }
.digit-select select { padding: 4px 8px; font-size: 16px; }

/* サポート / リセット / 履歴ボタン */
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
