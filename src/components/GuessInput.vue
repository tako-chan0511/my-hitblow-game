<template>
  <div class="guess-input">
    <!-- 数字スロット表示 -->
    <div class="slots">
      <div
        v-for="(digit, idx) in digits"
        :key="idx"
        class="slot"
        @click="openPicker(idx)"
      >
        {{ digit !== '' ? digit : 'ー' }}
      </div>
    </div>

    <!-- 判定ボタン -->
    <button class="submit-btn" :disabled="!isValid || loading" @click="submitGuess">
      判定
    </button>

    <!-- ローディング中の表示 -->
    <div v-if="loading" class="check-loading">
      <p>判定中…</p>
      <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
    </div>

    <!-- 数字ピッカーのポップアップ -->
    <div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker">
      <div class="picker-panel">
        <!-- 数字選択ボタン -->
        <button
          v-for="n in numbers"
          :key="n"
          class="picker-btn"
          @click="selectDigit(n)"
          :disabled="isSelected(n)"
        >
          {{ n }}
        </button>
        <!-- 削除ボタン -->
        <button
          class="picker-btn delete-btn"
          @click="clearDigit"
        >
          削除
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/game';

const store = useGameStore();

// 数字ピッカーに使用する数字リスト（0～9）
const numbers = Array.from({ length: 10 }, (_, i) => i);

// スロット入力値
const digits = ref<string[]>(Array.from({ length: store.digitCount }, () => ''));
// 現在開いているピッカーのスロットインデックス
const currentIdx = ref<number | null>(null);
// ピッカー表示制御
const pickerVisible = ref(false);

function openPicker(idx: number) {
  currentIdx.value = idx;
  pickerVisible.value = true;
}
function closePicker() {
  pickerVisible.value = false;
  currentIdx.value = null;
}

// 重複選択防止
function isSelected(n: number): boolean {
  return digits.value.some(d => d === String(n));
}

// ピッカーから数字選択
function selectDigit(n: number) {
  if (currentIdx.value === null) return;
  digits.value[currentIdx.value] = String(n);
  closePicker();
}

// 選択スロットのクリア
function clearDigit() {
  if (currentIdx.value === null) return;
  digits.value[currentIdx.value] = '';
  closePicker();
}

// バリデーション
const isValid = computed(() => {
  if (digits.value.some(d => d === '')) return false;
  return new Set(digits.value).size === store.digitCount;
});

// 桁数変更時にスロットリセット
watch(
  () => store.digitCount,
  (newCount) => {
    digits.value = Array.from({ length: newCount }, () => '');
  }
);

// ローディングとタイマー制御
const loading = ref(false);
const showTimer = ref(false);
const elapsedMs = ref(0);
let triggerTimeout: number;
let timerInterval: number;

const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

// 判定実行
async function submitGuess(): Promise<void> {
  if (!isValid.value || loading.value) return;
  loading.value = true;
  const start = Date.now();
  triggerTimeout = window.setTimeout(() => {
    showTimer.value = true;
  }, 3000);
  timerInterval = window.setInterval(() => {
    elapsedMs.value = Date.now() - start;
  }, 100);

  // 次のVue更新サイクルへ
  await new Promise(r => setTimeout(r, 0));

  store.checkGuess(digits.value.join(''));
  // 提出後リセット
  digits.value = Array.from({ length: store.digitCount }, () => '');

  clearTimeout(triggerTimeout);
  clearInterval(timerInterval);
  loading.value = false;
  showTimer.value = false;
  elapsedMs.value = 0;
}
</script>

<style scoped>
.guess-input {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.slots {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.slot {
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  font-size: 20px;
  border: 1px solid var(--text-color);
  border-radius: 4px;
  background-color: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}
.submit-btn {
  padding: 6px 12px;
  font-size: 16px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.check-loading {
  margin-top: 8px;
  text-align: center;
}
.check-loading p {
  margin: 4px 0;
}
/* ピッカーオーバーレイ */
.picker-overlay {
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
.picker-panel {
  background-color: var(--bg-color);
  padding: 20px;
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.picker-btn {
  padding: 12px 0;
  font-size: 18px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.picker-btn:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}
/* 削除ボタン専用スタイル */
.delete-btn {
  background-color: #e53e3e; /* 赤系 */
}
.delete-btn:hover {
  opacity: 0.8;
}
</style>
