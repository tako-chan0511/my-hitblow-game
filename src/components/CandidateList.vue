<template>
  <div class="overlay" @click.self="emit('close')">
    <div class="panel" @click.stop>
      <button class="close-btn" @click="emit('close')">閉じる</button>

      <!-- ロード後 -->
      <div v-if="!loading">
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
            <div v-if="pickerIdx === idx" class="filter-picker-panel">
              <button
                v-for="num in numbers"
                :key="num"
                class="filter-picker-btn"
                :disabled="filterSlots.includes(num)"
                @click="selectFilter(num, idx)"
              >
                {{ num }}
              </button>
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

        <!-- 件数＆制限 -->
        <h2>残り候補 ({{ displayedCount }})</h2>
        <p v-if="displayedCount > 1000" class="limit-notice">
          ※先頭1000件のみ表示しています
        </p>

        <!-- 候補リスト -->
        <div class="list">
          <!-- 10件以下ならボタン化＋ガイダンス -->
          <div v-if="displayedCount <= 10" class="button-mode">
            <p class="guide">
              残り候補が10件以下になりました。クリックするとメインのスロットに反映されます。
            </p>
            <button
              v-for="num in displayed"
              :key="num"
              class="list-item-button"
              @click="selectCandidate(num)"
            >
              {{ num }}
            </button>
          </div>
          <!-- 11件以上なら通常テキストで先頭1000件まで -->
          <div v-else class="text-mode">
            <span
              v-for="num in displayedLimited"
              :key="num"
              class="list-item"
            >
              {{ num }}
            </span>
          </div>
        </div>
      </div>

      <!-- ローディング中 -->
      <div v-else class="loading">
        <p>候補を生成中…</p>
        <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  defineEmits
} from 'vue';
import { useGameStore } from '@/stores/game';

// 'close' と 'select' イベントを定義
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'select', candidate: string): void;
}>();

// 0–9 の数字リスト
const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
const store = useGameStore();

// UI state
const loading = ref(true);
const candidates = ref<string[]>([]);
const filterSlots = ref<string[]>([]);
const pickerIdx = ref<number | null>(null);

// タイマー
const showTimer = ref(false);
const elapsedMs = ref(0);
let timeoutId: number;
let intervalId: number;

const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

// 初期候補取得＋フィルタ初期化＋タイマー
async function generateCandidates() {
  timeoutId = window.setTimeout(() => {
    showTimer.value = true;
    const start = Date.now();
    intervalId = window.setInterval(
      () => (elapsedMs.value = Date.now() - start),
      100
    );
  }, 3000);

  await new Promise<void>(resolve => {
    setTimeout(() => {
      candidates.value = store.remainingCandidates;
      resolve();
    }, 0);
  });

  if (candidates.value.length) {
    filterSlots.value = Array(candidates.value[0].length).fill('');
  }

  clearTimeout(timeoutId);
  clearInterval(intervalId);
  loading.value = false;
}

onMounted(generateCandidates);
onBeforeUnmount(() => {
  clearTimeout(timeoutId);
  clearInterval(intervalId);
});

// フィルタ済みの候補
const displayed = computed(() =>
  filterSlots.value.every(d => d === '')
    ? candidates.value
    : candidates.value.filter(num =>
        filterSlots.value.every((d, i) => d === '' || num[i] === d)
      )
);

const displayedCount = computed(() => displayed.value.length);
const displayedLimited = computed(() => displayed.value.slice(0, 1000));

// スロットフィルタ更新
function selectFilter(digit: string, idx: number) {
  filterSlots.value[idx] = digit;
  pickerIdx.value = null;
}

// ★ 10件以下時の選択処理
function selectCandidate(num: string) {
  // ← ここを "candidate" ではなく "num" に！
  emit('select', num);
  emit('close');
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
  cursor: pointer; color: var(--text-color); margin-bottom: 12px;
}

/* フィルタスロット */
.filter-slots { display: flex; gap: 8px; margin-bottom: 12px; justify-content: center; }
.slot-wrapper { position: relative; }
.filter-slot {
  width: 40px; height: 40px; font-size: 20px;
  border: 1px solid #ccc; border-radius: 4px;
  background: var(--bg-color); color: var(--text-color);
  cursor: pointer;
}
.filter-picker-panel {
  position: absolute; top: calc(100% + 4px); left: 50%; transform: translateX(-50%);
  background: var(--bg-color); padding: 8px; border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  display: grid; grid-template-columns: repeat(6, auto); gap: 6px; justify-content: center;
  z-index: 1001;
}
.filter-picker-btn, .filter-picker-clear {
  width: 40px; height: 40px; font-size: 20px;
  border: 1px solid #ccc; border-radius: 4px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}
.filter-picker-btn {
  background: var(--primary-color); color: var(--bg-color);
}
.filter-picker-btn:disabled {
  background-color: #ddd; color: #888; cursor: not-allowed;
}
.filter-picker-clear {
  background: red; color: white; padding: 0 8px; white-space: nowrap;
}
.filter-picker-clear:disabled {
  background-color: #ddd; color: #888; cursor: not-allowed;
}

/* 件数＆制限 */
.limit-notice { font-size: 0.9em; color: #888; text-align: center; margin: 4px 0; }

/* 候補リスト：中央揃え */
.list {
  display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px;
  justify-content: center;
}
/* 通常テキスト */
.list-item {
  display: inline-block; margin: 2px 4px; padding: 4px 8px;
  background-color: var(--primary-color); color: var(--bg-color);
  border-radius: 4px; font-family: monospace;
}
/* 10件以下ボタン化 */
.list-item-button {
  display: inline-block; margin: 2px 4px; padding: 4px 8px;
   background-color: var(--primary-color); color: var(--bg-color);
  border: none; border-radius: 4px; font-family: monospace;
  cursor: pointer;
}
.list-item-button:hover {
  opacity: 0.8;
}

/* ガイダンス文言 */
.guide {
  width: 100%; text-align: center;
  margin: 8px 0; color: #666; font-size: 0.9em;
}

/* ローディング */
.loading p {
  margin: 8px 0; font-size: 16px; color: var(--text-color);
}
</style>
