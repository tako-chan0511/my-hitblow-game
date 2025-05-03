<template>
  <div class="overlay">
    <div class="panel">
      <button @click="$emit('close')">閉じる</button>
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
.overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-height: 80vh;
  overflow: auto;
  width: 90%;
}
.list span {
  display: inline-block;
  margin: 2px 4px;
  padding: 2px 6px;
  background: #f0f0f0;
  border-radius: 4px;
  font-family: monospace;
}
.loading p {
  margin: 8px 0;
  font-size: 16px;
}
button {
  margin-top: 12px;
}
</style>
