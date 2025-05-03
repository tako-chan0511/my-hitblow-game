<template>
  <div class="container">
    <h1>Hit & Blow ({{ store.digitCount }}桁)</h1>
    <p>{{ store.digitCount }}桁の数字を当ててください（各桁異なる）</p>

    <!-- 桁数選択 -->
    <div class="digit-select">
      <label for="digitCount">桁数:</label>
      <select id="digitCount" v-model.number="digitCount" @change="onDigitCountChange">
        <option v-for="n in 10" :key="n" :value="n">{{ n }}桁</option>
      </select>
    </div>

    <GuessInput />
    <ResultMessage />
    <HistoryList />

    <!-- 残り候補表示ボタン -->
    <button class="show-cands" @click="show = true">
      残り候補を表示
    </button>

    <button class="reset" @click="store.reset()">再スタート</button>
  </div>

  <!-- モーダルで候補リストを出す -->
  <CandidateList v-if="show" @close="show = false" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameStore } from '@/stores/game';
import CandidateList from '@/components/CandidateList.vue';
import GuessInput from '@/components/GuessInput.vue';
import ResultMessage from '@/components/ResultMessage.vue';
import HistoryList from '@/components/HistoryList.vue';

// Pinia ストアを型安全に取得
const store = useGameStore() as GameStore;
// モーダル表示制御
const show = ref(false);
// 桁数選択用のローカル ref
const digitCount = ref(store.digitCount);

function onDigitCountChange() {
  store.setDigitCount(digitCount.value);
}
</script>

<style scoped>
.container {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}
.digit-select {
  margin-bottom: 16px;
}
.digit-select label {
  margin-right: 8px;
  font-weight: bold;
}
.digit-select select {
  padding: 4px 8px;
  font-size: 16px;
}
.show-cands {
  margin: 10px 8px;
  padding: 6px 14px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.show-cands:hover {
  background-color: #0056b3;
}
.reset {
  margin-top: 20px;
  padding: 5px 12px;
  font-size: 16px;
}
</style>
