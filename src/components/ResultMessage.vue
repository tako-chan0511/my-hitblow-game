<template>
  <p v-if="store.message">{{ store.message }}</p>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import type { GameStore } from "@/stores/game";

// 型推論付きでストアを取得
const store = useGameStore() as GameStore;
</script>

<style scoped>
/* 追加: メッセージを中央寄せ */
p {
  text-align: center;
  margin: 16px 0;
  font-weight: bold;
}
</style>
