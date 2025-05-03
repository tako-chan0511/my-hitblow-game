<template>
  <div>
    <h2>履歴</h2>
    <ul>
      <li v-for="(entry, i) in store.history" :key="i" class="entry">
        {{ i + 1 }}回目: {{ entry.guess }} - {{ entry.hit }} Hit, {{ entry.blow }} Blow
        <!-- この行まで適用した時点の残り候補数 -->
        <span class="remaining">
          残り候補: {{ store.remainingCandidatesAt(i).length }}
        </span>
        <button @click="confirmRollback(i)">↓ ここ以降を取り消す</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from "@/stores/game";
import type { GameState } from "@/stores/game";

const store = useGameStore() as GameState & {
  rollbackTo: (index: number) => void;
};

function confirmRollback(index: number) {
  const label = index > 0 ? `第${index+1}回目からやり直しますか？` : '最初からやり直しますか？';
  if (confirm(`${label}\n以降の履歴は削除されます。`)) {
    store.rollbackTo(index);
  }
}
</script>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
.entry {
  margin: 8px 0;
  font-family: monospace;
  display: flex;
  /* 横並び要素をコンテナ中央に寄せる */
  justify-content: center;
  align-items: center;
  /* テキストとボタンの間を開ける */
  gap: 12px;
}
button {
  margin-left: 12px;
  font-size: 0.9em;
  padding: 2px 6px;
}
</style>
