<template>
  <div class="game-view">
    <!-- <header class="header">
      <h2>Hit & Blow ({{ game.digitCount }}桁)</h2>
      <button class="logout" @click="onLogout">ログアウト</button>
    </header> -->

    <!-- 説明文を中央寄せ -->
    <p class="instruction">{{ game.digitCount }}桁の数字を当ててください（各桁異なる）</p>

    <!-- 桁数選択部分を中央寄せ -->
    <div class="digit-select">
      <label for="digitCount">桁数:</label>
      <select id="digitCount" v-model.number="digitCount" @change="onChange">
        <option v-for="n in 10" :key="n" :value="n">{{ n }}桁</option>
      </select>
    </div>

    <GuessInput />
    <ResultMessage />

    <!-- 履歴リストはそのまま、残り候補はHistoryList.vue側でボタンを表示 -->
    <HistoryList @show-candidates="$emit('show-candidates')" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useGameStore } from '@/stores/game';
import GuessInput from '@/components/GuessInput.vue';
import ResultMessage from '@/components/ResultMessage.vue';
import HistoryList from '@/components/HistoryList.vue';

const router = useRouter();
const auth   = useAuthStore();
const game   = useGameStore();
const digitCount = ref<number>(game.digitCount);

onMounted(async () => {
  if (!auth.token) {
    router.push('/login');
    return;
  }
  await game.fetchHistory();
});

function onLogout(): void {
  auth.logout();
  router.push('/login');
}

function onChange(): void {
  game.setDigitCount(digitCount.value);
}
</script>

<style scoped>
.app-header {
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
main {
  background-color: var(--bg-color);
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.game-view {
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header h2 {
  margin: 0;
}

.logout {
  background: none;
  border: 1px solid #888;
  padding: 6px 12px;
  cursor: pointer;
}

/* instruction と digit-select を中央揃え */
.instruction,
.digit-select {
  text-align: center;
  margin: 16px 0;
}

.digit-select label {
  margin-right: 8px;
  font-weight: bold;
}
.digit-select select {
  padding: 4px 8px;
  font-size: 16px;
}
</style>
