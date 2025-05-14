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

    <!-- 判定ボタンと貼付入力 -->
    <div class="action-buttons">
      <div class="paste-input">
        <input
          v-model.trim="pasteValue"
          :placeholder="`${store.digitCount}桁の数字を貼り付け`"
          :maxlength="store.digitCount"
        />
        <button
          class="paste-btn"
          :disabled="loading"
          @click="pasteInput"
        >
          貼付
        </button>
      </div>
      <button
        class="submit-btn"
        :disabled="!isValid || loading"
        @click="submitGuess"
      >
        判定
      </button>
    </div>

    <!-- ローディング中の表示 -->
    <div v-if="loading" class="check-loading">
      <p>判定中…</p>
      <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
    </div>

    <!-- 数字ピッカーのポップアップ -->
    <div
      v-if="pickerVisible"
      class="picker-overlay"
      @click.self="closePicker"
    >
      <div class="picker-panel">
        <button
          v-for="n in numbers"
          :key="n"
          class="picker-btn"
          @click="selectDigit(n)"
          :disabled="isSelected(n)"
        >
          {{ n }}
        </button>
        <!-- 削除ボタンは、スロットが空のとき無効化 -->
        <button
          class="picker-btn delete-btn"
          @click="clearDigit"
          :disabled="currentIdx === null || digits[currentIdx] === ''"
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

// 候補数字リスト (0-9)
const numbers = Array.from({ length: 10 }, (_, i) => i);

// スロット入力値
const digits = ref<string[]>(Array.from({ length: store.digitCount }, () => ''));
// 貼付用文字列
const pasteValue = ref<string>('');
// ピッカー表示制御
const pickerVisible = ref(false);
const currentIdx = ref<number | null>(null);

// ローディング／タイマー
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

// スロット編集
function openPicker(idx: number) {
  currentIdx.value = idx;
  pickerVisible.value = true;
}
function closePicker() {
  pickerVisible.value = false;
  currentIdx.value = null;
}
function selectDigit(n: number) {
  if (currentIdx.value == null) return;
  digits.value[currentIdx.value] = String(n);
  closePicker();
}
function clearDigit() {
  if (currentIdx.value == null) return;
  digits.value[currentIdx.value] = '';
  closePicker();
}
function isSelected(n: number): boolean {
  return digits.value.includes(String(n));
}

// 貼付処理
function pasteInput() {
  const str = pasteValue.value;
  if (str.length !== store.digitCount) {
    alert(`${store.digitCount}桁の文字列を貼り付けてください`);
    return;
  }
  if (!/^\d+$/.test(str) || new Set(str).size !== store.digitCount) {
    alert('重複なく数字のみを貼り付けてください');
    return;
  }
  digits.value = str.split('');
}

// バリデーション
const isValid = computed(() => {
  return (
    digits.value.every(d => d !== '') &&
    new Set(digits.value).size === store.digitCount
  );
});

// 桁数変更時リセット
watch(
  () => store.digitCount,
  newCount => {
    digits.value = Array.from({ length: newCount }, () => '');
    pasteValue.value = '';
  }
);

// 判定実行
async function submitGuess(): Promise<void> {
  if (!isValid.value || loading.value) return;
  loading.value = true;
  const start = Date.now();
  triggerTimeout = window.setTimeout(() => (showTimer.value = true), 3000);
  timerInterval = window.setInterval(() => {
    elapsedMs.value = Date.now() - start;
  }, 100);

  await new Promise(r => setTimeout(r, 0));
  store.checkGuess(digits.value.join(''));
  digits.value = Array.from({ length: store.digitCount }, () => '');
  pasteValue.value = '';

  clearTimeout(triggerTimeout);
  clearInterval(timerInterval);
  loading.value = false;
  showTimer.value = false;
  elapsedMs.value = 0;
}
</script>

<style scoped>
.guess-input {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.slots {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
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
.action-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
  align-items: center;
}
.paste-input {
  display: flex;
  align-items: center;
  gap: 4px;
}
.paste-input input {
  width: calc(1ch * var(--digitCount) + 8px);
  padding: 4px;
  font-size: 16px;
  text-align: center;
}
.submit-btn,
.paste-btn {
  padding: 6px 12px;
  font-size: 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.submit-btn {
  background-color: var(--primary-color);
  color: var(--bg-color);
}
.submit-btn:disabled,
.paste-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.paste-btn {
  background-color: #10b981;
  color: #fff;
}
.check-loading {
  margin-top: 8px;
  text-align: center;
}
.check-loading p {
  margin: 4px 0;
}
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
  padding: 8px 0;
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
.delete-btn {
  background-color: #e53e3e;
}
.delete-btn:hover {
  opacity: 0.8;
}
</style>
