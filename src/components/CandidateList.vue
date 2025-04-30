<template>
  <div class="overlay">
    <div class="panel">
      <button @click="$emit('close')">閉じる</button>
      <h2>残り候補 ({{ store.remainingCandidates.length }})</h2>
      <div class="list">
        <span v-for="num in store.remainingCandidates" :key="num">{{ num }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import type { GameState } from '@/stores/game';

const store = useGameStore() as GameState & {
  remainingCandidates: string[];
};
</script>

<style scoped>
.overlay {
  position: fixed; top:0; left:0; right:0; bottom:0;
  background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
}
.panel {
  background: #fff; padding: 20px; border-radius: 8px;
  max-height: 80vh; overflow: auto; width: 90%;
}
.list span {
  display: inline-block; margin: 2px 4px; padding:2px 6px;
  background:#f0f0f0; border-radius:4px;
  font-family: monospace;
}
button { margin-top: 12px; }
</style>
