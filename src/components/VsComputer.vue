<template>
  <div class="vs-container">
    <h2>対コンピュータモード</h2>

    <!-- ステージ１：あなたの秘密入力 -->
    <div v-if="stage === 'inputSecret'" class="secret-input">
      <p>コンピュータが当てるための、あなたの秘密の数字（各桁異なる）を入力してください。</p>
      <div class="slots horizontal">
        <div
          v-for="(d, i) in userSecret"
          :key="i"
          class="slot"
          @click="openPicker(i)"
        >
          {{ d || 'ー' }}
        </div>
      </div>
      <!-- 数字ピッカー -->
      <div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker">
        <div class="picker-panel" @click.stop>
          <button
            v-for="n in numbers"
            :key="n"
            class="picker-btn"
            @click="selectUserSecret(n)"
            :disabled="userSecret.includes(n)"
          >{{ n }}</button>
          <button
            class="picker-btn delete-btn"
            @click="clearUserSecret"
            :disabled="currentIdx === null || !userSecret[currentIdx]"
          >
            削除
          </button>
        </div>
      </div>
      <button class="start-btn" :disabled="!secretReady" @click="startGame">
        開始
      </button>
    </div>

    <!-- ステージ２：対戦中 -->
    <div v-else-if="stage === 'playing'" class="battle-area">
      <!-- あなたの秘密表示 -->
      <div class="your-secret">
        <strong>あなたの秘密:</strong> {{ userSecret.join('') }}
      </div>

      <div class="panel-col">
        <h3>あなたの推理</h3>
        <p>コンピュータの秘密を当ててください</p>
        <div class="slots horizontal">
          <div
            v-for="(d, i) in userGuess"
            :key="i"
            class="slot"
            @click="openPicker(i)"
          >
            {{ d || 'ー' }}
          </div>
        </div>
        <!-- 数字ピッカー再利用 -->
        <div v-if="pickerVisible" class="picker-overlay" @click.self="closePicker">
          <div class="picker-panel" @click.stop>
            <button
              v-for="n in numbers"
              :key="n"
              class="picker-btn"
              @click="selectUserGuess(n)"
              :disabled="userGuess.includes(n)"
            >{{ n }}</button>
            <button
              class="picker-btn delete-btn"
              @click="clearUserGuess"
              :disabled="currentIdx === null || !userGuess[currentIdx]"
            >
              削除
            </button>
          </div>
        </div>
        <button class="guess-btn" :disabled="!userGuessReady" @click="submitUserGuess">
          判定 ({{ userAttempts + 1 }} 回目)
        </button>
      </div>

      <div class="panel-col">
        <h3>コンピュータの推理</h3>
        <p>あなたの秘密を当てます… ({{ compAttempts + 1 }} 回目)</p>
      </div>

      <!-- 履歴一覧 -->
      <div class="history-area">
        <div class="history-col">
          <h4>あなたの履歴</h4>
          <ul class="history">
            <li v-for="h in userHistory" :key="h.attempt">
              {{ h.attempt }}: {{ h.guess }} → {{ h.hit }} Hit, {{ h.blow }} Blow
            </li>
          </ul>
        </div>
        <div class="history-col">
          <h4>コンピュータの履歴</h4>
          <ul class="history">
            <li v-for="h in compHistory" :key="h.attempt">
              {{ h.attempt }}: {{ h.guess }} → {{ h.hit }} Hit, {{ h.blow }} Blow
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ステージ３：結果発表 -->
    <div v-else class="result">
      <h2>結果</h2>
      <p v-if="userFinished && compFinished">
        引き分け！お互い {{ userAttempts }} 回で当てました。
      </p>
      <p v-else-if="userFinished">
        おめでとう！あなたの勝ち！ ({{ userAttempts }} 回)
      </p>
      <p v-else>
        残念！コンピュータの勝ち… ({{ compAttempts }} 回)
      </p>

      <div class="history-area">
        <div class="history-col">
          <h4>あなたの履歴</h4>
          <ul class="history">
            <li v-for="h in userHistory" :key="h.attempt">
              {{ h.attempt }}: {{ h.guess }} → {{ h.hit }} Hit, {{ h.blow }} Blow
            </li>
          </ul>
        </div>
        <div class="history-col">
          <h4>コンピュータの履歴</h4>
          <ul class="history">
            <li v-for="h in compHistory" :key="h.attempt">
              {{ h.attempt }}: {{ h.guess }} → {{ h.hit }} Hit, {{ h.blow }} Blow
            </li>
          </ul>
        </div>
      </div>

      <button @click="resetVs">もう一度対戦</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useGameStore } from '@/stores/game';
import { allCandidatesFast, filterByHistory } from '@/lib/candidate';

// 1) ストア連携：App.vue の桁数セレクトと共有
const store = useGameStore();
const digitCount = computed(() => store.digitCount);

// 2) コンピュータ側データ（先に宣言）
let computerSecret = '';
const userHistory    = ref<{attempt:number,guess:string,hit:number,blow:number}[]>([]);
const compHistory    = ref<{attempt:number,guess:string,hit:number,blow:number}[]>([]);
const userAttempts   = ref(0);
const compAttempts   = ref(0);
const compCandidates = ref<string[]>([]);

// 3) ステージ管理
const stage = ref<'inputSecret'|'playing'|'finished'>('inputSecret');

// 4) ユーザー秘密／推理用配列
const userSecret = ref<string[]>([]);
const userGuess  = ref<string[]>([]);

// 5) 数字ピッカー制御
const pickerVisible = ref(false);
const currentIdx    = ref<number|null>(null);

// 6) 0–9 数字リスト
const numbers = Array.from({ length: 10 }, (_, i) => i.toString());

// 7) App.vue で桁数を変えたら、ここも即リセット
watch(
  () => digitCount.value,
  (cnt) => {
    userSecret.value     = Array(cnt).fill('');
    userGuess.value      = Array(cnt).fill('');
    userHistory.value    = [];
    compHistory.value    = [];
    userAttempts.value   = 0;
    compAttempts.value   = 0;
    compCandidates.value = [];
    stage.value          = 'inputSecret';
  },
  { immediate: true }
);

// 8) 秘密入力完了判定
const secretReady = computed(() =>
  userSecret.value.every(d => d !== '') &&
  new Set(userSecret.value).size === digitCount.value
);

// 9) 推理入力完了判定
const userGuessReady = computed(() =>
  userGuess.value.every(d => d !== '') &&
  new Set(userGuess.value).size === digitCount.value
);

// 10) Hit/Blow 計算
function calcHB(guess: string, secret: string) {
  let hit = 0, blow = 0;
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) hit++;
    else if (secret.includes(guess[i])) blow++;
  }
  return { hit, blow };
}

// 11) ゲーム開始
function startGame() {
  computerSecret       = Array.from({ length: digitCount.value }, () => {
    const nums = Array.from({ length: 10 }, (_, i) => i.toString());
    return nums.splice(Math.floor(Math.random() * nums.length), 1)[0];
  }).join('');
  compCandidates.value = allCandidatesFast(digitCount.value);
  stage.value          = 'playing';
}

// 12) ユーザーの手
function submitUserGuess() {
  if (!userGuessReady.value || stage.value !== 'playing') return;
  userAttempts.value++;
  const g = userGuess.value.join('');
  const { hit, blow } = calcHB(g, computerSecret);
  userHistory.value.push({ attempt: userAttempts.value, guess: g, hit, blow });
  userGuess.value = Array(digitCount.value).fill('');
  if (hit === digitCount.value) { finishGame(); return; }
  computerTurn();
}

// 13) コンピュータの手
function computerTurn() {
  if (stage.value !== 'playing') return;
  const guess = compCandidates.value[0];
  compAttempts.value++;
  const { hit, blow } = calcHB(guess, userSecret.value.join(''));
  compHistory.value.push({ attempt: compAttempts.value, guess, hit, blow });
  compCandidates.value = filterByHistory(compCandidates.value, compHistory.value);
  if (hit === digitCount.value) finishGame();
}

// 14) 終了処理
function finishGame() {
  stage.value = 'finished';
}
const userFinished = computed(() =>
  userHistory.value.some(h => h.hit === digitCount.value)
);
const compFinished = computed(() =>
  compHistory.value.some(h => h.hit === digitCount.value)
);

// 15) もう一度
function resetVs() {
  userSecret.value     = Array(digitCount.value).fill('');
  userGuess.value      = Array(digitCount.value).fill('');
  userHistory.value    = [];
  compHistory.value    = [];
  userAttempts.value   = 0;
  compAttempts.value   = 0;
  compCandidates.value = [];
  stage.value          = 'inputSecret';
}

// 16) ピッカー操作
function openPicker(idx: number)    { currentIdx.value = idx; pickerVisible.value = true; }
function closePicker()              { pickerVisible.value = false; currentIdx.value = null; }
function selectUserSecret(n: string) {
  if (currentIdx.value === null) return;
  userSecret.value[currentIdx.value] = n;
  closePicker();
}
function clearUserSecret() {
  if (currentIdx.value === null) return;
  userSecret.value[currentIdx.value] = '';
  closePicker();
}
function selectUserGuess(n: string) {
  if (currentIdx.value === null) return;
  userGuess.value[currentIdx.value] = n;
  closePicker();
}
function clearUserGuess() {
  if (currentIdx.value === null) return;
  userGuess.value[currentIdx.value] = '';
  closePicker();
}

onBeforeUnmount(() => {});
</script>

<style scoped>
.vs-container { text-align: center; }
.secret-input, .battle-area, .result { margin-top: 20px; }

/* 横並びスロット */
.slots.horizontal {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}
.slot {
  width: 40px; height: 40px; line-height: 40px;
  text-align: center; border: 1px solid #666;
  border-radius: 4px; cursor: pointer;
}

/* あなたの秘密表示 */
.your-secret {
  text-align: left;
  margin-bottom: 12px;
  font-weight: bold;
}

/* レイアウト */
.battle-area { display: block; }
.panel-col {
  display: inline-block; vertical-align: top;
  width: 30%; margin: 0 1.5%; text-align: left;
}
.history-area {
  display: flex; justify-content: space-between; margin-top: 20px;
}
.history-col { width: 45%; }
.history {
  max-height: 200px; overflow-y: auto; list-style: none; padding: 0; margin-top: 8px;
}

/* ボタン */
.start-btn, .guess-btn, .result button {
  margin-top: 12px; padding: 6px 16px;
  background-color: var(--primary-color); color: var(--bg-color);
  border: none; border-radius: 4px; cursor: pointer;
}

/* ピッカー */
.picker-overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center;
  z-index:1000;
}
.picker-panel {
  background: var(--bg-color); padding: 16px; border-radius: 6px;
  display:grid; grid-template-columns: repeat(6, 1fr); gap:8px;
}
.picker-btn {
  padding: 8px 0; border:none; border-radius:4px;
  background: var(--primary-color); color: var(--bg-color); cursor:pointer;
}
.delete-btn { background: #e53e3e; }
</style>
