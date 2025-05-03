<template>
  <div class="guess-input">
    <input
      v-model="value"
      :maxlength="store.digitCount"
      @keyup.enter="onSubmit"
      :placeholder="placeholder"
    />
    <button @click="onSubmit">判定</button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/game';
import type { GameStore } from '@/stores/game';  // ストアの型を参照

// Pinia ストアを型安全に取得
const store = useGameStore() as GameStore;

// ユーザ入力
const value = ref<string>('');

// MAXlength と placeholder をストアの digitCount から動的に設定
const maxlength = computed(() => store.digitCount);
const placeholder = computed(() => '*'.repeat(store.digitCount));

// onSubmit は戻り値なしを明示
function onSubmit(): void {
  store.checkGuess(value.value);
  value.value = '';
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
