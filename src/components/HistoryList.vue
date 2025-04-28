<template>
  <div>
    <h2>履歴</h2>
    <ul>
      <li v-for="(entry, i) in store.history" :key="i">
        {{ entry.guess }} - {{ entry.hit }} Hit, {{ entry.blow }} Blow
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import type { GameStore } from "@/stores/game";

// 型推論付きでストアを取得
const store = useGameStore() as GameStore;
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  margin: 4px 0;
  font-family: monospace;
}
</style>
