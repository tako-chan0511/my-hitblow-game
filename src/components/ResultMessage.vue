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
/* コンポーネント固有のスタイルをここに追加 */
</style>
