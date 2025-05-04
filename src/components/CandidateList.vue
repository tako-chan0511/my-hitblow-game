<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="panel">
      <button class="close-btn" @click="$emit('close')">閉じる</button>
      <h2 v-if="!loading">残り候補 ({{ candidates.length }})</h2>
      <div class="list" v-if="!loading">
        <span v-for="num in candidates" :key="num">{{ num }}</span>
      </div>

      <!-- ローディング中の表示 -->
      <div v-if="loading" class="loading">
        <p>候補を生成中…</p>
        <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useGameStore } from '@/stores/game';

// ストア
const store = useGameStore();

// UI 状態
const loading = ref(true);
const candidates = ref<string[]>([]);

// タイマー制御
const showTimer = ref(false);
const elapsedMs = ref(0);
let triggerTimeout: number;
let timerInterval: number;

const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

// 候補生成を非同期に実行
async function generateCandidates() {
  // 3秒後にタイマー開始
  triggerTimeout = window.setTimeout(() => {
    showTimer.value = true;
    const start = Date.now();
    timerInterval = window.setInterval(() => {
      elapsedMs.value = Date.now() - start;
    }, 100);
  }, 3000);

  // 非同期で候補取得
  await new Promise<void>(resolve => {
    setTimeout(() => {
      candidates.value = store.remainingCandidates;
      resolve();
    }, 0);
  });

  // タイマー停止
  window.clearTimeout(triggerTimeout);
  window.clearInterval(timerInterval);
  loading.value = false;
}

onMounted(() => {
  generateCandidates();
});

onBeforeUnmount(() => {
  window.clearTimeout(triggerTimeout);
  window.clearInterval(timerInterval);
});
</script>

<style scoped>
/* オーバーレイ */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* パネル */
.panel {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 20px;
  border-radius: 8px;
  max-height: 80vh;
  overflow-y: auto;
  width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 閉じるボタン */
.close-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: var(--text-color);
  margin-bottom: 12px;
}

/* 候補リスト */
.list span {
  display: inline-block;
  margin: 2px 4px;
  padding: 4px 8px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border-radius: 4px;
  font-family: monospace;
}

/* ローディング */
.loading p {
  margin: 8px 0;
  font-size: 16px;
  color: var(--text-color);
}

/* 汎用ボタン */
button {
  margin-top: 12px;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  opacity: 0.8;
}
</style>
