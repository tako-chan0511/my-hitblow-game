<template>
  <div class="guess-input">
    <input
      v-model="value"
      :maxlength="store.digitCount"
      @keyup.enter="onSubmit"
      :placeholder="placeholder"
      :disabled="loading"
    />
    <button @click="onSubmit" :disabled="loading">判定</button>

    <!-- ローディング中の表示 -->
    <div v-if="loading" class="check-loading">
      <p>判定中…</p>
      <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameStore } from '@/stores/game';

const store = useGameStore() as GameStore;
const value = ref<string>('');

// ローディングとタイマー制御
const loading = ref(false);
const showTimer = ref(false);
const elapsedMs = ref(0);
let triggerTimeout: number;
let timerInterval: number;

const placeholder = computed(() => '*'.repeat(store.digitCount));
const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

async function onSubmit(): Promise<void> {
  if (loading.value) return;
  loading.value = true;
  // 3秒後にタイマー表示開始
  const start = Date.now();
  triggerTimeout = window.setTimeout(() => {
    showTimer.value = true;
  }, 3000);
  // 100msごとに経過時間を更新
  timerInterval = window.setInterval(() => {
    elapsedMs.value = Date.now() - start;
  }, 100);

  // 非同期化してタイマーを動かす
  await new Promise(resolve => setTimeout(resolve, 0));

  // 実際の判定処理
  store.checkGuess(value.value);
  value.value = '';

  // タイマー停止
  window.clearTimeout(triggerTimeout);
  window.clearInterval(timerInterval);
  loading.value = false;
  showTimer.value = false;
  elapsedMs.value = 0;
}
</script>

<style scoped>
.guess-input {
  position: relative;
}
.check-loading {
  margin-top: 8px;
}
.check-loading p {
  margin: 2px 0;
}
.guess-input input {
  padding: 5px;
  font-size: 18px;
  text-align: center;
}
.guess-input button {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 18px;
}
</style>