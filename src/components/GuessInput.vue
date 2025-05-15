<template>
  <div class="guess-input">
    <!-- 数字スロット表示：Pinia ストアの currentDigits を直接使用 -->
    <div class="slots">
      <div
        v-for="(digit, idx) in store.currentDigits"
        :key="idx"
        class="slot"
        @click="openPicker(idx)"
      >
        {{ digit || 'ー' }}
      </div>
    </div>

    <!-- 貼付＆判定 -->
    <div class="action-buttons">
      <div class="paste-input">
        <input
          v-model.trim="pasteValue"
          :placeholder="`${store.digitCount}桁の数字を貼り付け`"
          :maxlength="store.digitCount"
        />
        <button class="paste-btn" :disabled="loading" @click="pasteInput">
          貼付
        </button>
      </div>
      <button class="submit-btn" :disabled="!isValid || loading" @click="submitGuess">
        判定
      </button>
    </div>

    <!-- ローディング中表示 -->
    <div v-if="loading" class="check-loading">
      <p>判定中…</p>
      <p v-if="showTimer">経過時間: {{ formattedTime }}</p>
    </div>

    <!-- 数字ピッカー -->
    <div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker">
      <div class="picker-panel" @click.stop>
        <button
          v-for="n in numbers"
          :key="n"
          class="picker-btn"
          @click="selectDigit(n)"
          :disabled="isSelected(n)"
        >
          {{ n }}
        </button>
        <button
          class="picker-btn delete-btn"
          @click="clearDigit"
          :disabled="currentIdx === null || !store.currentDigits[currentIdx]"
        >
          削除
        </button>
      </div>
    </div>

    <!-- モーダル：候補数が10以下になったら自動で表示 -->
    <CandidateList
      v-if="showCandidates"
      @close="showCandidates = false"
      @select="applyCandidate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/game';
import CandidateList from '@/components/CandidateList.vue';

const store = useGameStore();

// --- モーダル表示制御 ---
// 候補数が10以下になったら自動でモーダルを開く
const showCandidates = ref(false);
watch(
  () => store.candidates.length,
  len => {
    if (len <= 10) showCandidates.value = true;
  }
);

// モーダルから選択された候補をストアに反映
function applyCandidate(candidate: string) {
  store.setCurrentDigits(candidate.split(''));
  showCandidates.value = false;
}

// --- 貼付処理 ---
const pasteValue = ref('');
function pasteInput() {
  const str = pasteValue.value.trim();
  if (
    str.length !== store.digitCount ||
    !/^\d+$/.test(str) ||
    new Set(str).size !== store.digitCount
  ) {
    alert(`${store.digitCount}桁の重複なし数字を入力してください`);
    return;
  }
  store.setCurrentDigits(str.split(''));
  pasteValue.value = ''; // クリア
}

// 判定ボタン有効化
const isValid = computed(
  () =>
    store.currentDigits.every(d => d !== '') &&
    new Set(store.currentDigits).size === store.digitCount
);

// --- 判定実行 ---
const loading = ref(false);
const showTimer = ref(false);
const elapsedMs = ref(0);
let tId: number, iId: number;

const formattedTime = computed(() => {
  const s = Math.floor(elapsedMs.value / 1000);
  const ms = elapsedMs.value % 1000;
  return `${s}.${String(ms).padStart(3, '0')} 秒`;
});

async function submitGuess() {
  if (!isValid.value || loading.value) return;
  loading.value = true;
  const start = Date.now();
  tId = window.setTimeout(() => (showTimer.value = true), 3000);
  iId = window.setInterval(() => (elapsedMs.value = Date.now() - start), 100);

  await new Promise(r => setTimeout(r, 0));
  await store.checkGuess(store.currentDigits.join(''));

  clearTimeout(tId);
  clearInterval(iId);
  loading.value = false;
  showTimer.value = false;
  elapsedMs.value = 0;
}

// --- 数字ピッカー ---
const pickerVisible = ref(false);
const currentIdx = ref<number | null>(null);
const numbers = Array.from({ length: 10 }, (_, i) => i.toString());

function openPicker(idx: number) {
  currentIdx.value = idx;
  pickerVisible.value = true;
}
function closePicker() {
  pickerVisible.value = false;
  currentIdx.value = null;
}
function selectDigit(n: string) {
  if (currentIdx.value === null) return;
  const arr = [...store.currentDigits];
  arr[currentIdx.value] = n;
  store.setCurrentDigits(arr);
  closePicker();
}
function clearDigit() {
  if (currentIdx.value === null) return;
  const arr = [...store.currentDigits];
  arr[currentIdx.value] = '';
  store.setCurrentDigits(arr);
  closePicker();
}
function isSelected(n: string) {
  return store.currentDigits.includes(n);
}

// --- 桁数変更時リセット ---
watch(
  () => store.digitCount,
  cnt => {
    store.setCurrentDigits(Array.from({ length: cnt }, () => ''));
    pasteValue.value = '';
  }
);
</script>

<style scoped>
.guess-input {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.candidate-btn {
  margin-bottom: 12px;
  padding: 6px 12px;
  background-color: var(--primary-color);
  color: var(--bg-color);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.candidate-btn:hover {
  opacity: 0.8;
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
