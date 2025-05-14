<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="panel">
      <button class="close-btn" @click="$emit('close')">閉じる</button>

      <template v-if="!loading">
        <!-- フィルタースロット -->
        <div class="filter-slots">
          <div
            v-for="(slot, idx) in filterSlots"
            :key="idx"
            class="slot-wrapper"
          >
            <button
              class="filter-slot"
              @click="pickerIdx = pickerIdx === idx ? null : idx"
            >
              {{ slot === '' ? '―' : slot }}
            </button>

            <!-- クリックされたスロットだけに候補を表示 -->
            <div v-if="pickerIdx === idx" class="filter-picker-panel">
              <!-- 数字候補ボタン：一度選んだ数字は disabled -->
              <button
                v-for="num in numbers"
                :key="num"
                class="filter-picker-btn"
                :disabled="filterSlots.includes(num)"
                @click="selectFilter(num, idx)"
              >
                {{ num }}
              </button>
              <!-- 削除ボタン：スロットが空のとき disabled -->
              <button
                class="filter-picker-clear"
                :disabled="filterSlots[idx] === ''"
                @click="selectFilter('', idx)"
              >
                削除
              </button>
            </div>
          </div>
        </div>

        <!-- 件数表示＆1000件制限 -->
        <h2>残り候補 ({{ displayedCount }})</h2>
        <p v-if="displayedCount > 1000" class="limit-notice">
          ※先頭1000件のみ表示しています
        </p>

        <!-- 候補リスト -->
        <div class="list">
          <span
            v-for="num in displayedLimited"
            :key="num"
            class="list-item"
          >
            {{ num }}
          </span>
        </div>
      </template>

      <!-- ローディング中 -->
      <div v-else class="loading">
        <p>候補を生成中…</p>
        <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
// 全数字リスト(0〜9)を常に表示し、無効ボタンはdisabledで制御
const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
import { useGameStore } from '@/stores/game';

// ストア
const store = useGameStore();

// ローディング／候補／フィルタスロット
const loading = ref(true);
const candidates = ref<string[]>([]);
const filterSlots = ref<string[]>([]);
const pickerIdx = ref<number | null>(null);

// タイマー
const showTimer = ref(false);
const elapsedMs = ref(0);
let triggerTimeout: number;
let timerInterval: number;

// 時間フォーマット
const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

// 候補取得＋スロット初期化＋タイマー
async function generateCandidates() {
  triggerTimeout = window.setTimeout(() => {
    showTimer.value = true;
    const start = Date.now();
    timerInterval = window.setInterval(() => {
      elapsedMs.value = Date.now() - start;
    }, 100);
  }, 3000);

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      candidates.value = store.remainingCandidates;
      resolve();
    }, 0);
  });

  if (candidates.value.length > 0) {
    filterSlots.value = Array(candidates.value[0].length).fill('');
  }

  clearTimeout(triggerTimeout);
  clearInterval(timerInterval);
  loading.value = false;
}

onMounted(generateCandidates);
onBeforeUnmount(() => {
  clearTimeout(triggerTimeout);
  clearInterval(timerInterval);
});

// 絞り込み後の全件
const displayed = computed(() =>
  filterSlots.value.every((d) => d === '')
    ? candidates.value
    : candidates.value.filter((num) =>
        filterSlots.value.every((d, i) => d === '' || num[i] === d)
      )
);

// 件数・1000件制限
const displayedCount = computed(() => displayed.value.length);
const displayedLimited = computed(() => displayed.value.slice(0, 1000));

// 各スロットにあり得る数字一覧（重複排除・ソート）
const possibleDigitsBySlot = computed(() => {
  if (!displayed.value.length) return [];
  return Array.from({ length: displayed.value[0].length }, (_, idx) => {
    const set = new Set(displayed.value.map((num) => num[idx]));
    return Array.from(set).sort();
  });
});

// スロットへ数字セット／クリア
function selectFilter(digit: string, idx: number) {
  filterSlots.value[idx] = digit;
  pickerIdx.value = null;
}
</script>

<style scoped>
.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.panel {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 20px; border-radius: 8px;
  max-height: 80vh; overflow-y: auto; width: 90%;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}
.close-btn {
  background: none; border: none; font-size: 18px;
  cursor: pointer; color: var(--text-color);
  margin-bottom: 12px;
}
.filter-slots {
  display: flex; gap: 8px; margin-bottom: 12px;
  justify-content: center;
}
.slot-wrapper {
  position: relative;
}
.filter-slot {
  width: 40px; height: 40px; font-size: 20px;
  text-align: center; border: 1px solid #ccc; border-radius: 4px;
  background: var(--bg-color); color: var(--text-color);
  cursor: pointer;
}
.filter-picker-panel {
  position: absolute;
  top: calc(100% + 4px);
  left: 50%; transform: translateX(-50%);
  background: var(--bg-color);
  padding: 8px; border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  display: grid; grid-template-columns: repeat(6, auto);
  gap: 6px; justify-content: center; z-index: 1001;
}
.filter-picker-btn {
  width: 40px; height: 40px; font-size: 20px;
  border: 1px solid #ccc; border-radius: 4px;
  background: var(--primary-color);
  color: var(--bg-color); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.filter-picker-btn:disabled {
  background-color: #ddd;
  color: #888;
  cursor: not-allowed;
}
.filter-picker-clear {
  /* 固定幅を解除しテキストに合わせる */
  min-width: 40px;
  height: 40px;
  padding: 0 8px;
  font-size: 18px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: red;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}
.filter-picker-clear:disabled {
  background-color: #ddd;
  color: #888;
  cursor: not-allowed;
}
.limit-notice {
  font-size: 0.9em; color: #888; text-align: center; margin: 4px 0;
}
.list {
  display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;
}
.list-item {
  display: inline-block; margin: 2px 4px; padding: 4px 8px;
  background-color: var(--primary-color); color: var(--bg-color);
  border-radius: 4px; font-family: monospace;
}
.loading p {
  margin: 8px 0; font-size: 16px; color: var(--text-color);
}
button:hover:not(:disabled) {
  opacity: 0.8;
}
</style>
