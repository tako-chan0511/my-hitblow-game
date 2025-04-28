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

<script setup>
import { useGameStore } from "@/stores/game";
const store = useGameStore();
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
