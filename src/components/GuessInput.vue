<template>
  <div class="guess-input">
    <input
      v-model="value"
      maxlength="4"
      @keyup.enter="onSubmit"
      placeholder="****"
    />
    <button @click="onSubmit">判定</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "@/stores/game";
import type { GameStore } from "@/stores/game";  // ストアの型を参照

// Pinia ストアを型推論付きで取得
const store = useGameStore() as GameStore;

const value = ref<string>("");

// onSubmit は戻り値なし（void）を明示
function onSubmit(): void {
  store.checkGuess(value.value);
  value.value = "";
}
</script>

<style scoped>
.guess-input input {
  padding: 5px;
  font-size: 18px;
  text-align: center;
}
.guess-input button {
  margin-left: 10px;
  padding: 5px 10px;
  font-size: 18px;
}
</style>
