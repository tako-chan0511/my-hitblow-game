<template>
  <div class="container">
    <h1>Hit & Blow (4桁)</h1>
    <p>4桁の数字を当ててください（各桁異なる）</p>

    <GuessInput />
    <ResultMessage />
    <HistoryList />

    <button class="reset" @click="store.reset()">再スタート</button>
  </div>
</template>

<script setup>
import { useGameStore } from "@/stores/game";
import GuessInput  from "@/components/GuessInput.vue";
import ResultMessage from "@/components/ResultMessage.vue";
import HistoryList from "@/components/HistoryList.vue";

const store = useGameStore();
</script>

<style>
.container {
  text-align: center;
  font-family: Arial, sans-serif;
  padding: 20px;
}
.reset {
  margin-top: 20px;
  padding: 5px 12px;
  font-size: 16px;
}
</style>

